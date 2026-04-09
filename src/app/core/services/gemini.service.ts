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
    // @ts-expect-error - GEMINI_API_KEY is injected by the build system
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
        model: 'gemini-2.5-flash',
        history,
        config: {
          systemInstruction: 'You are a helpful, encouraging AI tutor for students in Malawi. Keep answers concise, educational, and easy to understand.',
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
}
