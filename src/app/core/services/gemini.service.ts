import { Injectable, signal } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

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
  private ai: GoogleGenAI;
  private dbPromise: Promise<IDBPDatabase<ChatDB>>;
  
  messages = signal<ChatMessage[]>([]);
  isLoading = signal<boolean>(false);

  constructor() {
    // Initialize Gemini API
    // Note: In a real production app, the API key should be handled securely,
    // preferably via a backend proxy to avoid exposing it in the client.
    // For this AI Studio environment, we use the injected environment variable.
    this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Initialize IndexedDB for offline chat history
    this.dbPromise = openDB<ChatDB>('edu-chat-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('messages', { keyPath: 'id' });
        store.createIndex('by-timestamp', 'timestamp');
      },
    });

    this.loadHistory();
  }

  private async loadHistory() {
    const db = await this.dbPromise;
    const allMessages = await db.getAllFromIndex('messages', 'by-timestamp');
    this.messages.set(allMessages);
  }

  async sendMessage(content: string) {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now()
    };

    // Optimistically add to UI and DB
    this.messages.update(msgs => [...msgs, userMessage]);
    const db = await this.dbPromise;
    await db.put('messages', userMessage);

    this.isLoading.set(true);

    try {
      // Format history for Gemini
      const history = this.messages().slice(0, -1).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      const chat = this.ai.chats.create({
        model: 'gemini-3-flash-preview',
        history,
        config: {
          systemInstruction: `You are Cleo AI, a specialized AI tutor for secondary school students in Malawi. 
Strict adherence to the Malawi Secondary School Curriculum (MSCE) is mandatory. 
Do not provide information outside the scope of the Malawi secondary syllabus.
Your goal is to help students grasp concepts quickly and remember them effectively.

Guidelines for your responses:
1. **Conciseness**: Be extremely concise. Provide short, direct answers.
2. **No Highlighting**: **CRITICAL**: Do NOT use any background colors, blockquotes, or special formatting that looks like text highlighting. Use plain text.
3. **Formatting**: Use standard Markdown for structure:
   - Use **bold** for key terms.
   - Use *italics* for emphasis.
   - Use bullet points for lists.
   - **PROHIBITED**: Do NOT use backticks (\`) for code blocks or inline code unless explicitly asked for code.
4. **Biology Essays**: For descriptive essays or long explanations (especially in Biology), use exactly 1-2-3 lines per paragraph. Limit the response to a maximum of 5 paragraphs or points.
5. **Malawi Letter Style**: When asked to write a letter, strictly follow the Malawi writing style:
   - **Business Letters**: Include two addresses. The sender's address on the top right, followed by the date. The recipient's address on the left below the date. Use a formal salutation (e.g., Dear Sir/Madam), a clear subject line (e.g., REF: APPLICATION FOR...), and a formal closing (e.g., Yours faithfully).
   - **Friendly Letters**: Include one address (sender's) on the top right, followed by the date. Use an informal salutation (e.g., Dear [Name],) and an informal closing (e.g., Your friend,).
6. **Curriculum Focus**: Only answer questions related to Malawi secondary school subjects (Biology, Chemistry, Physics, Mathematics, English, Geography, History, Social Studies, etc.).
7. **Mathematical Notation**: **CRITICAL**: Do NOT use the dollar sign ($) for mathematical formulas or notation. Use plain text, standard symbols (like ^ for powers, / for division), or clear Unicode characters.
8. **Pedagogy**: Use simple, clear language. Break down complex topics into digestible parts.
9. **Examples**: Always provide relevant examples, preferably localized to the Malawi context where applicable.
10. **Memory Aids**: Use mnemonics, analogies, or simple summaries to help students remember concepts.
11. **Emojis**: Use professional educational emojis sparingly to help visualization (e.g., ☀️🌦️🌧️ for geography/weather, 🧪🧬 for science, 📐🔢 for math). 
   - **STRICTLY PROHIBITED**: Do not use non-educational or unprofessional emojis like 👄, 💞, 😲, etc.
12. **Secondary Level**: Ensure the depth of explanation is appropriate for MSCE students.
13. **Strictness**: If a user asks something outside the Malawi secondary curriculum, politely inform them that you are specialized in the Malawi curriculum and redirect them to a relevant school topic.`,
        }
      });

      // Send message
      const response = await chat.sendMessage({ message: content });
      
      const modelMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        content: response.text || 'Sorry, I could not generate a response.',
        timestamp: Date.now()
      };

      this.messages.update(msgs => [...msgs, modelMessage]);
      await db.put('messages', modelMessage);
      
    } catch (error) {
      console.error('Error communicating with Gemini:', error);
      // Could add an error message to the chat
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        content: '⚠️ You seem to be offline or an error occurred. Your message was saved, and you can try again when you have a connection.',
        timestamp: Date.now()
      };
      this.messages.update(msgs => [...msgs, errorMessage]);
    } finally {
      this.isLoading.set(false);
    }
  }

  async clearHistory() {
    const db = await this.dbPromise;
    await db.clear('messages');
    this.messages.set([]);
  }

  async generateQuiz(topic: string): Promise<GeneratedQuiz> {
    const prompt = `Generate a high-quality MSCE (Malawi Secondary School Curriculum) quiz about "${topic}".
    The quiz must be strictly based on the Malawi secondary syllabus.
    Return ONLY a JSON object with the following structure:
    {
      "title": "Quiz Title",
      "description": "Brief description",
      "category": "Subject Name",
      "timeLimit": 15,
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
      const response = await this.ai.models.generateContent({
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
