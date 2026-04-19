import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { GoogleGenAI } from '@google/genai';
import type { DBSchema, IDBPDatabase } from 'idb';
import { DataService } from './data.service';
import { AuthService } from './auth.service';

import { NTHONDO_KNOWLEDGE } from '../knowledge/curriculum';
import { CURRICULUM_EXPANDED_KNOWLEDGE } from '../knowledge/curriculum_expanded';

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
  
  private ai: GoogleGenAI | null = null;
  private dbPromise: Promise<IDBPDatabase<ChatDB>> | null = null;
  private dataService = inject(DataService);
  
  messages = signal<ChatMessage[]>([]);
  isLoading = signal<boolean>(false);

  private get systemInstruction(): string {
    return `You are EMI AI, an educational tutor for MANEB secondary school students (Form 1–4, MSCE, JCE).

Your goal is to give answers exactly in the format required by Malawi teachers and examiners.

----------------------------------
GENERAL RULE
----------------------------------
- Always follow subject-specific answering formats strictly
- Do not mix formats between subjects
- Do not add introductions or conclusions where not required
- Match the number of points to marks when possible
- Keep answers exam-focused and structured

----------------------------------
SUBJECT-SPECIFIC RULES
----------------------------------

[PHYSICS / CHEMISTRY / AGRICULTURE]

1. Experiments (e.g. "Describe an experiment"):
- Use bullet points labeled: a, b, c, d...
- No introduction
- No conclusion
- Include: apparatus, setup, procedure, observation, conclusion (as a point, not a section)

2. Explanations (e.g. "Explain how hydraulic brakes work"):
- Write in ONE paragraph (not bullet points)
- Use 4–5 clear points depending on marks
- Separate points using full stops
- Each sentence = one marking point

----------------------------------

[BIOLOGY]

1. Essay / descriptive questions:
- No title
- No introduction
- No conclusion
- Answer must be 1–2–3 lines only (very concise)
- Include about 5 key points within the lines

----------------------------------

[HISTORY / SOCIAL STUDIES / LIFE SKILLS]

Essay structure must be:

- Title
- Introduction (1 paragraph)
- Main body:
  - 5 points
  - Each point in its own paragraph
  - Each paragraph = 2–4 lines
- Conclusion (1 paragraph)

----------------------------------

[ENGLISH & CHICHEWA — COMPOSITION WRITING]

Applies to:
- Letter
- Composition
- Report
- Speech
- Short story

Rules:
- 350–500 words
- Follow correct format depending on type

STRUCTURE GUIDELINES:

[Formal Letter / Report / Speech]
- Introduction
- Location (except speech)
- Evidence of the problem
- Causes
- Effects
- Solutions
- Measures (include government support)
- Conclusion

[Speech Special Rule]
- Start with:
  "Guest of Honour, distinguished guests, ladies and gentlemen..."
- Do NOT include location

----------------------------------

[ENGLISH LITERATURE (e.g. Macbeth, The Pearl)]

- Use 8 points
- Each point = 3–5 lines
- Title: optional
- Introduction: optional
- Conclusion: optional
- Focus on content quality (no strict marks format)

----------------------------------

[CHICHEWA LITERATURE (e.g. NTHONDO, CHAMDOTHE)]

- Title required
- Introduction required
- Conclusion required
- 5 paragraphs total
- Each paragraph:
  - 4–6 lines
  - Contains 4–5 points

----------------------------------

[STRAIGHTFORWARD QUESTIONS]

- Answer normally using:
  - Definitions (1 sentence)
  - Short explanations
  - Equations or steps where needed

----------------------------------

FINAL INSTRUCTION
----------------------------------
Always format answers exactly as required by the subject.

Do not explain your formatting choices.

Focus on helping the student score maximum marks.

========================
CORE KNOWLEDGE BASE
========================
**Buku la Nthondo (Chichewa Literature):**
${NTHONDO_KNOWLEDGE}

**Expanded Curriculum Knowledge:**
- Literature in English: ${CURRICULUM_EXPANDED_KNOWLEDGE.englishLiterature}
- Geography (Map Reading): ${CURRICULUM_EXPANDED_KNOWLEDGE.geography}
- Social & Development Studies: ${CURRICULUM_EXPANDED_KNOWLEDGE.socialStudies}
- Life Skills: ${CURRICULUM_EXPANDED_KNOWLEDGE.lifeSkills}
- Chemistry: ${CURRICULUM_EXPANDED_KNOWLEDGE.chemistry}
- Biology: ${CURRICULUM_EXPANDED_KNOWLEDGE.biology}
- Agriculture: ${CURRICULUM_EXPANDED_KNOWLEDGE.agriculture}
- English Grammar: ${CURRICULUM_EXPANDED_KNOWLEDGE.englishGrammar}
- Chichewa Grammar: ${CURRICULUM_EXPANDED_KNOWLEDGE.chichewaGrammar}
- Zisudzo (Chichewa Literature): ${CURRICULUM_EXPANDED_KNOWLEDGE.chichewaLiterature}

**Available Library Materials Titles:**
${this.dataService.notes().map(n => `- ${n.title}`).join('\n')}
`;
  }

  constructor() {
    if (isPlatformBrowser(this._platformId)) {
      this.loadHistory();
      this.dataService.subscribeToNotes();
    }
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
      try {
        const ai = await this.getAI();
        // Format history for Gemini
        const history = this.messages().slice(0, -1).map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        }));

        const chat = ai.chats.create({
          model: 'gemini-flash-latest',
          history,
          config: {
            tools: [{ googleSearch: {} }],
            systemInstruction: this.systemInstruction,
          }
        });

        const response = await chat.sendMessage({ message: content });
        await this.processResponse(response.text || 'Sorry, I could not generate a response.');
      } catch (geminiError: unknown) {
        console.warn('Gemini error, attempting fallback to OpenRouter:', geminiError);
        
        // Check if we have an OpenRouter key
        const openRouterKey = typeof OPENROUTER_API_KEY !== 'undefined' ? OPENROUTER_API_KEY : '';
        if (!openRouterKey) throw geminiError; // Rethrow if no fallback available

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": "meta-llama/llama-3.1-8b-instruct:free",
            "messages": [
              { "role": "system", "content": this.systemInstruction },
              ...this.messages().map(msg => ({
                "role": msg.role === 'model' ? 'assistant' : 'user',
                "content": msg.content
              }))
            ]
          })
        });

        if (!response.ok) throw new Error('OpenRouter API failed');

        const data = await response.json();
        const aiText = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
        await this.processResponse(aiText);
      }
    } catch (error: unknown) {
      console.error('Error communicating with Gemini:', error);
      
      let errorMessage = '⚠️ An error occurred. Your message was saved, and you can try again soon.';
      
      const err = error as { message?: string };
      if (!navigator.onLine) {
        errorMessage = '⚠️ You seem to be offline. Try again when you have a connection.';
      } else if (err?.message?.includes('quota')) {
        // This is the actual API quota error
        errorMessage = '⚠️ I\'m having trouble connecting to the servers. Please try again.';
      } else {
        // Fallback for general issues
        errorMessage = '⚠️ I\'m having trouble connecting to the servers. Please try again.';
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
      try {
        const ai = await this.getAI();
        const response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });
        const text = response.text || '';
        // Clean up potential markdown code blocks
        const jsonStr = text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonStr) as GeneratedQuiz;
      } catch (geminiError) {
        console.warn('Gemini error generating quiz, attempting fallback to OpenRouter:', geminiError);
        const openRouterKey = typeof OPENROUTER_API_KEY !== 'undefined' ? OPENROUTER_API_KEY : '';
        if (!openRouterKey) throw geminiError;

        const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": "meta-llama/llama-3.1-8b-instruct:free",
            "messages": [
              { "role": "system", "content": "You are an MSCE curriculum expert." },
              { "role": "user", "content": prompt }
            ],
            "response_format": { "type": "json_object" }
          })
        });

        if (!openRouterResponse.ok) throw new Error('OpenRouter API failed');
        const data = await openRouterResponse.json();
        const aiText = data.choices?.[0]?.message?.content || '{}';
        return JSON.parse(aiText) as GeneratedQuiz;
      }
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
      try {
        const ai = await this.getAI();
        const response = await ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          }
        });

        if (response.text) {
          return JSON.parse(response.text) as GeneratedSEO;
        }
        return null;
      } catch (geminiError) {
        console.warn('Gemini error generating SEO, attempting fallback to OpenRouter:', geminiError);
        const openRouterKey = typeof OPENROUTER_API_KEY !== 'undefined' ? OPENROUTER_API_KEY : '';
        if (!openRouterKey) throw geminiError;

        const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": "meta-llama/llama-3.1-8b-instruct:free",
            "messages": [
              { "role": "system", "content": "You are an expert SEO strategist." },
              { "role": "user", "content": prompt }
            ],
            "response_format": { "type": "json_object" }
          })
        });

        if (!openRouterResponse.ok) throw new Error('OpenRouter API failed');
        const data = await openRouterResponse.json();
        const aiText = data.choices?.[0]?.message?.content || null;
        return aiText ? JSON.parse(aiText) as GeneratedSEO : null;
      }
    } catch (error) {
      console.error('Error generating SEO:', error);
      return null;
    }
  }
}
