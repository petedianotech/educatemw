import { Injectable, signal } from '@angular/core';
import type { GoogleGenAI } from '@google/genai';
import type { DBSchema, IDBPDatabase } from 'idb';

interface ChatDB extends DBSchema {
  messages: {
    key: string;
    value: {
      id: string;
      role: 'user' | 'model';
      content: string;
      timestamp: number;
    };
    indexes: { 'by-timestamp': number };
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface GeneratedQuiz {
  title: string;
  description: string;
  category: string;
  timeLimit: number;
  isProOnly: boolean;
  questions: {
    text: string;
    type: 'multiple-choice' | 'true-false';
    options?: string[];
    correctAnswer: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private dbPromise: Promise<IDBPDatabase<ChatDB>> | null = null;
  
  messages = signal<ChatMessage[]>([]);
  isLoading = signal<boolean>(false);

  constructor() {
    this.loadHistory();
  }

  private async getAI() {
    if (!this.ai) {
      const { GoogleGenAI } = await import('@google/genai');
      const apiKey = typeof GEMINI_API_KEY !== 'undefined' ? GEMINI_API_KEY : '';
      if (!apiKey) {
        console.error('GEMINI_API_KEY is not defined. AI features will not work.');
      }
      this.ai = new GoogleGenAI({ apiKey });
    }
    return this.ai;
  }

  private async getDB() {
    if (!this.dbPromise) {
      const { openDB } = await import('idb');
      this.dbPromise = openDB<ChatDB>('edu-chat-db', 1, {
        upgrade(db) {
          const store = db.createObjectStore('messages', { keyPath: 'id' });
          store.createIndex('by-timestamp', 'timestamp');
        },
      });
    }
    return this.dbPromise;
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private async loadHistory() {
    try {
      const db = await this.getDB();
      const allMessages = await db.getAllFromIndex('messages', 'by-timestamp');
      this.messages.set(allMessages);
    } catch (e) {
      console.warn('Could not load chat history:', e);
    }
  }

  async sendMessage(content: string) {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: this.generateId(),
      role: 'user',
      content,
      timestamp: Date.now()
    };

    // Optimistically add to UI and DB
    this.messages.update(msgs => [...msgs, userMessage]);
    
    try {
      const db = await this.getDB();
      await db.put('messages', userMessage);
    } catch (e) {
      console.warn('Could not save message to history:', e);
    }

    this.isLoading.set(true);

    try {
      const ai = await this.getAI();
      // Format history for Gemini
      const history = this.messages().slice(0, -1).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        history,
        config: {
          systemInstruction: `You are Cleo AI, a friendly teacher and supportive friend for secondary school students in Malawi. 
Your tone should be natural, warm, and encouraging—just like a real person who cares about the student's success.

Strict adherence to the Malawi Secondary School Curriculum is mandatory:
- **MSCE (Malawi School Certificate of Education)**: Focus strictly on Form 3 and Form 4 topics.
- **JCE (Junior Certificate of Education)**: Focus strictly on Form 1 and Form 2 topics.

Guidelines for your responses:
1. **Tone & Language**: Use simple, clear English. Speak naturally like a friendly mentor. Avoid overly academic jargon unless defining a specific term.
2. **Context**: You and the student both know you are in Malawi. Localize your examples (e.g., using local landmarks, crops like maize, or common situations) but do NOT constantly repeat the word "Malawi" in every sentence. It should feel natural, not forced.
3. **Conciseness**: Be helpful but direct. Don't use 100 words when 30 will do.
4. **No Highlighting**: **CRITICAL**: Do NOT use background colors or blockquotes that look like text highlighting.
5. **Formatting (Gemini Style)**: Use clean, readable Markdown:
   - Use **bold** for key concepts you want the student to remember.
   - Use bullet points for steps or lists.
   - Use clear spacing between paragraphs.
   - **PROHIBITED**: Do NOT use backticks (\`) for code blocks unless asked for computer studies.
6. **Biology & Science**: For long explanations, use short, clear paragraphs. Break down complex processes (like photosynthesis or the heart) into simple, numbered steps.
7. **Malawi Letter Style**: When asked to write a letter, strictly follow the local curriculum style for Business and Friendly letters.
8. **Mathematical Notation**: Use plain text and standard symbols (e.g., x^2, 1/2). Do NOT use LaTeX or dollar signs.
9. **Memory Aids**: Share simple mnemonics or analogies to help them remember tricky parts of the syllabus.
10. **Emojis**: Use a few friendly, educational emojis (🧪, 📚, ✍️, ✨) to keep the vibe positive and helpful.
11. **Scope**: If asked about things outside the JCE/MSCE syllabus, gently bring them back to their studies: "That's an interesting question, but for your MSCE exams, we should focus on..."`,
        }
      });

      // Send message
      const response = await chat.sendMessage({ message: content });
      
      const modelMessage: ChatMessage = {
        id: this.generateId(),
        role: 'model',
        content: response.text || 'Sorry, I could not generate a response.',
        timestamp: Date.now()
      };

      this.messages.update(msgs => [...msgs, modelMessage]);
      
      try {
        const db = await this.getDB();
        await db.put('messages', modelMessage);
      } catch (e) {
        console.warn('Could not save model response to history:', e);
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error communicating with Gemini:', error);
      
      let errorMessage = '⚠️ An error occurred. Your message was saved, and you can try again soon.';
      
      if (!navigator.onLine) {
        errorMessage = '⚠️ You seem to be offline. Your message was saved, and you can try again when you have a connection.';
      } else if (error?.message?.includes('API key not valid')) {
        errorMessage = '⚠️ AI configuration error. Please contact support or check your API key.';
      } else if (error?.message?.includes('quota')) {
        errorMessage = '⚠️ AI daily limit reached for the system. Please try again later.';
      }

      const errorMsg: ChatMessage = {
        id: this.generateId(),
        role: 'model',
        content: errorMessage,
        timestamp: Date.now()
      };
      this.messages.update(msgs => [...msgs, errorMsg]);
    } finally {
      this.isLoading.set(false);
    }
  }

  async clearHistory() {
    try {
      const db = await this.getDB();
      await db.clear('messages');
      this.messages.set([]);
    } catch (e) {
      console.warn('Could not clear history:', e);
    }
  }

  async generateQuiz(topic: string): Promise<GeneratedQuiz> {
    const prompt = `Generate a high-quality MSCE (Malawi Secondary School Curriculum) quiz about "${topic}".
    The quiz must be strictly based on the Malawi secondary syllabus.
    Return ONLY a JSON object with the following structure:
    {
      "title": "Quiz Title",
      "description": "Brief description",
      "category": "Subject Name",
      "timeLimit": 5,
      "isProOnly": false,
      "questions": [
        {
          "text": "Question text?",
          "type": "multiple-choice",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option A"
        }
      ]
    }
    Generate 5 challenging questions. Do not include any other text or markdown formatting.`;

    try {
      const ai = await this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      const text = response.text || '';
      // Clean up potential markdown code blocks
      const jsonStr = text.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonStr) as GeneratedQuiz;
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw error;
    }
  }
}
