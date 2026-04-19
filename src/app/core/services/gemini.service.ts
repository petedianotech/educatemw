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

  readonly EMI_AVATAR = '/emi-avatar.png';
  
  private dbPromise: Promise<IDBPDatabase<ChatDB>> | null = null;
  private dataService = inject(DataService);
  
  messages = signal<ChatMessage[]>([]);
  isLoading = signal<boolean>(false);

  private get systemInstruction(): string {
    return `You are EMI AI, a Malawi secondary school tutor.
Answer in MANEB exam format:
- Physics/Chem/Agri: Points/Steps.
- Biology: 1-3 lines max.
- Humanities: Title, Intro, 5 paragraphs, Conclusion.
- Chichewa Lit: Title, Intro, 5 paragraphs (4-5 points each), Conclusion.

Be accurate and concise relative to the MSCE Syllabus.`;
  }

  constructor() {
    if (isPlatformBrowser(this._platformId)) {
      this.loadHistory();
      this.dataService.subscribeToNotes();
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
