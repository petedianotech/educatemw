import { inject, Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';
import { AuthService } from './auth.service';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class FlashcardService {
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private genAI: GoogleGenAI;

  constructor() {
    const apiKey = typeof GEMINI_API_KEY !== 'undefined' ? GEMINI_API_KEY : '';
    this.genAI = new GoogleGenAI({ apiKey });
  }

  async generateFlashcards(topic: string, category: string, count = 5) {
    const user = this.authService.currentUser();
    if (!user) throw new Error('User not authenticated');

    const prompt = `Generate ${count} high-quality flashcards for secondary school students in Malawi about the topic "${topic}" in the category "${category}".
    The content must be strictly based on the Malawi MSCE syllabus.
    Return ONLY a JSON object with the following structure:
    {
      "title": "A descriptive title for this flashcard set",
      "description": "A brief description of what these cards cover",
      "flashcards": [
        {
          "front": "The question or term",
          "back": "The answer or definition"
        }
      ]
    }`;

    try {
      try {
        const response = await this.genAI.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                flashcards: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      front: { type: Type.STRING },
                      back: { type: Type.STRING }
                    },
                    required: ['front', 'back']
                  }
                }
              },
              required: ['title', 'description', 'flashcards']
            }
          }
        });

        const result = JSON.parse(response.text || '{}');
        return await this.saveFlashcards(result, category, user);
      } catch (geminiError) {
        console.warn('Gemini error generating flashcards, attempting fallback to OpenRouter:', geminiError);
        const openRouterKey = typeof OPENROUTER_API_KEY !== 'undefined' ? OPENROUTER_API_KEY : '';
        if (!openRouterKey) throw geminiError;

        const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "Emi AI Educational Tutor"
          },
          body: JSON.stringify({
            "model": "meta-llama/llama-3.1-8b-instruct:free",
            "messages": [
              { "role": "system", "content": "You are a specialized MSCE curriculum expert for Malawi." },
              { "role": "user", "content": prompt }
            ],
            "response_format": { "type": "json_object" }
          })
        });

        if (!openRouterResponse.ok) throw new Error('OpenRouter API failed');

        const data = await openRouterResponse.json();
        const aiText = data.choices?.[0]?.message?.content || '{}';
        const result = JSON.parse(aiText);
        return await this.saveFlashcards(result, category, user);
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw error;
    }
  }

  private async saveFlashcards(result: { title: string; description: string; flashcards: { front: string; back: string }[] }, category: string, user: { uid: string; displayName?: string }) {
    // Create the set in Firestore
    const setId = await this.dataService.createFlashcardSet({
      title: result.title,
      description: result.description,
      category: category,
      authorId: user.uid,
      authorName: user.displayName || 'Anonymous',
      isProOnly: false
    });

    if (setId) {
      // Create individual cards
      for (const card of result.flashcards) {
        await this.dataService.createFlashcard({
          setId: setId,
          front: card.front,
          back: card.back
        });
      }
    }

    return setId;
  }
}
