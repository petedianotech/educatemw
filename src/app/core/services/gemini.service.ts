import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { DBSchema, IDBPDatabase } from 'idb';
import { DataService } from './data.service';
import { AuthService } from './auth.service';

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

export interface GeneratedSEO {
  seoTitle: string;
  seoDescription: string;
}

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private _authService = inject(AuthService);

  private _platformId = inject(PLATFORM_ID);

  readonly EMI_AVATAR = 'https://i.ibb.co/8DVmYDn3/emi-avatar.png';
  readonly EMA_AVATAR = 'https://i.ibb.co/ccK3kyLP/ema-avatar.jpg';
  
  private dbPromise: Promise<IDBPDatabase<ChatDB>> | null = null;
  private dataService = inject(DataService);
  
  messages = signal<ChatMessage[]>([]);
  isLoading = signal<boolean>(false);

  private readonly systemInstruction = `You are EMI AI, an expert Malawi secondary school tutor for the MSCE syllabus. 

SUBJECT MASTERY: You thoroughly understand Biology, Physics, Chemistry, Agriculture, Mathematics, Geography, History, Social Studies, and English (including grammar, essays, and formal letter writing). You MUST help students with these educational topics.

OUT-OF-BOUNDS TOPICS: If a student asks about celebrities, billionaires, pop-culture, movies, video games, or completely non-educational trivia (e.g., "who is the richest man?"), ONLY THEN must you politely refuse by saying: "That is outside my scope as a school tutor! Please ask me an educational question related to your MSCE studies."

LANGUAGE RULE: You cannot speak or understand Chichewa well. If asked a question in Chichewa, reply: "I am sorry, but my Chichewa is very limited. I can help you deeply with all other MSCE subjects in English!"

MANEB EXAM FORMATTING:
- Sciences (Physics/Chem/Agri/Bio): Use bullet points, short clear steps, 1-3 lines per point.
- Humanities/English: Use clear headings, introductions, and structured paragraphs.
- TONE & VOCABULARY: Explain everything in simple, clear English suitable for 15-20 year old students. Avoid overly complex jargon and long paragraphs.

Be accurate, encouraging, and concise.`;

  private readonly supportInstruction = `You are ema, the Official Help Desk AI for "Educate MW", Malawi's #1 digital learning platform for MSCE students. 

STRICT SCOPE RULE: You ONLY answer questions related to the Educate MW app, payments, premium benefits, and how to use the platform. 
IF A USER ASKS ANYTHING ELSE (e.g., "who is a billionaire?", "help with math", "general news", "scientific facts"), you MUST politely decline by saying: "I am a basic help assistant for this app only. I cannot answer general knowledge or subject-specific questions. Please use the 'emi AI' section in the main menu for your MSCE study questions!"

APP OVERVIEW: 
Educate MW provides:
1. emi AI Tutor: An AI that helps with MSCE subjects. (Direct users here for study help!)
2. Study Library: PDF downloads for past papers and notes.
3. Video Lessons: Expert-led tutorials.
4. Practice Quizzes: MANEB-style practice.
5. Premium (Pro): Unlimited AI credits and exclusive books. Costs 5,000 MWK per year via PayChangu (Airtel/TNM).

COMMON SUPPORT TOPICS:
- Payments: Use the "Upgrade" page. 5000 MWK/year.
- Missing Credits: Refer friends (Profile > Refer & Earn) or go Pro.
- Security: Set/Change security questions in Profile.
- Found a bug? Contact Peter Damiano at +265 987 066 051 on WhatsApp.

YOUR TONE: Professional, efficient, and limited. ALWAYS be short.`;

  constructor() {
    if (isPlatformBrowser(this._platformId)) {
      this.loadHistory();
      this.dataService.subscribeToNotes();
    }
  }

  async getSupportResponse(userQuery: string): Promise<string> {
    return this.callCerebrasWithSystem(this.supportInstruction, userQuery);
  }

  async getDictionaryExplanation(word: string): Promise<string> {
    const instruction = `You are emi AI's Dictionary Assistant. Your goal is to explain scientific or complex terms specifically for Malawian MSCE students.
    - Word to explain: "${word}"
    - Focus: How this word appears in MSCE subjects (Biology, Physics, Chemistry, Geography, etc.)
    - Length: Keep it under 60 words.
    - Style: Very simple English, clear, and student-friendly. Use a helpful tone.
    - Rule: Do NOT refuse the question. Provide a direct, helpful explanation for a 15-20 year old student.`;
    
    return this.callCerebrasWithSystem(instruction, `Explain the word "${word}" for my MSCE studies.`);
  }

  private async callCerebrasWithSystem(system: string, userQuery: string): Promise<string> {
    const cerebrasKey = this.getCerebrasKey();
    if (!cerebrasKey) return "AI service unavailable. Contact Peter on WhatsApp.";

    try {
      const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${cerebrasKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "llama3.1-8b",
          "messages": [
            { role: 'system', content: system },
            { role: 'user', content: userQuery }
          ],
          "max_completion_tokens": 512,
          "temperature": 0.4
        })
      });

      if (!response.ok) return "Sorry, I'm having trouble connecting right now.";
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "I couldn't generate an explanation. Try another word.";
    } catch {
      return "Connection error. Please check your internet.";
    }
  }

  private getCerebrasKey(): string {
    return typeof CEREBRAS_API_KEY !== 'undefined' ? CEREBRAS_API_KEY : '';
  }

  private async callCerebras(prompt: string, role = 'user', isJson = false) {
    const cerebrasKey = this.getCerebrasKey();
    if (!cerebrasKey) {
      throw new Error('CEREBRAS_API_KEY is missing');
    }

    const messages = [
      { role: 'system', content: this.systemInstruction }
    ];

    if (role === 'chat') {
      // Add history
      messages.push(...this.messages().map(msg => ({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.content
      })));
    } else {
      messages.push({ role: 'user', content: prompt });
    }

    const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cerebrasKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "llama3.1-8b",
        "messages": messages,
        "max_completion_tokens": 1024,
        "temperature": 0.2,
        "top_p": 1,
        "stream": false,
        ...(isJson ? { "response_format": { "type": "json_object" } } : {})
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Cerebras API error details:', errorData);
      throw new Error(`Cerebras API failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || (isJson ? '{}' : 'Sorry, I could not generate a response.');
  }

  private async getDB() {
    if (!isPlatformBrowser(this._platformId)) {
      throw new Error('IndexedDB is not available on the server.');
    }
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

  public generateId(): string {
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
      const aiText = await this.callCerebras(content, 'chat');
      await this.processResponse(aiText);
    } catch (error: unknown) {
      console.error('Critical AI Communication Failure:', error);
      
      let errorMessage = '⚠️ I\'m having trouble connecting to my brain. Please check your internet or try again later.';
      
      const err = error as { message?: string; name?: string };
      
      if (!navigator.onLine) {
        errorMessage = '⚠️ You seem to be offline. Try again when you have a connection.';
      } else if (err?.message?.includes('CEREBRAS_API_KEY')) {
        errorMessage = '⚠️ Configuration error: Cerebras key is missing. Please contact support.';
      } else if (err?.message?.includes('quota') || err?.message?.includes('429')) {
        errorMessage = '⚠️ AI usage limits reached for today. Please try again later.';
      } else if (err?.name === 'TypeError' && err?.message?.includes('fetch')) {
        errorMessage = '⚠️ Connection blocked. Please check your network connection.';
      } else if (err?.message) {
        errorMessage = `⚠️ AI Error: ${err.message}`;
      }

      this.processResponse(errorMessage);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async processResponse(text: string) {
    const modelMessage: ChatMessage = {
      id: this.generateId(),
      role: 'model',
      content: text,
      timestamp: Date.now()
    };

    this.messages.update(msgs => [...msgs, modelMessage]);
    
    try {
      const db = await this.getDB();
      await db.put('messages', modelMessage);
    } catch (e) {
      console.warn('Could not save model response to history:', e);
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
      const aiText = await this.callCerebras(prompt, 'user', true);
      return JSON.parse(aiText) as GeneratedQuiz;
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw error;
    }
  }

  async generateSEO(title: string, category: string, content: string): Promise<GeneratedSEO | null> {
    const prompt = `You are an expert SEO strategist specializing in the Malawian education market. Your goal is to rewrite the provided content (Book or Past Paper details) into high-ranking SEO Metadata.
Primary Keywords: Use terms like 'MSCE', 'PSLCE', 'MANEB', 'Malawi Curriculum', and 'Secondary School'.
Local Context: Include mentions of 'Malawian students' and 'New Syllabus'.
Format: Output exactly two items in a JSON object:
seoTitle: Max 60 characters. Must include the book name + 'PDF Download' + 'Malawi'.
seoDescription: Max 155 characters. Start with a strong call to action (e.g., 'Download', 'Study', 'Pass MSCE'). Mention that it is for the Malawian syllabus.

Input details:
Title: ${title}
Category: ${category}
Content/Description: ${content}

Return ONLY valid JSON matching this schema:
{
  "seoTitle": "string",
  "seoDescription": "string"
}`;

    try {
      const aiText = await this.callCerebras(prompt, 'user', true);
      return aiText ? JSON.parse(aiText) as GeneratedSEO : null;
    } catch (error) {
      console.error('Error generating SEO:', error);
      return null;
    }
  }
}
