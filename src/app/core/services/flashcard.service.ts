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
    } catch (error) {
      console.error('Error generating flashcards:', error);
      throw error;
    }
  }
}
