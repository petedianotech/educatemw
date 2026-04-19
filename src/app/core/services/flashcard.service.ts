import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class FlashcardService {
  private dataService = inject(DataService);
  private authService = inject(AuthService);

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
      const cerebrasKey = typeof CEREBRAS_API_KEY !== 'undefined' ? CEREBRAS_API_KEY : '';
      if (!cerebrasKey) {
        throw new Error('CEREBRAS_API_KEY is missing');
      }

      const cerebrasResponse = await fetch("https://api.cerebras.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${cerebrasKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "llama3.1-8b",
          "messages": [
            { "role": "system", "content": "You are a specialized MSCE curriculum expert for Malawi." },
            { "role": "user", "content": prompt }
          ],
          "max_completion_tokens": 1024,
          "temperature": 0.2,
          "top_p": 1,
          "stream": false,
          "response_format": { "type": "json_object" }
        })
      });

      if (!cerebrasResponse.ok) {
        const errorData = await cerebrasResponse.json().catch(() => ({}));
        console.error('Cerebras API error details:', errorData);
        throw new Error(`Cerebras API failed with status ${cerebrasResponse.status}`);
      }

      const data = await cerebrasResponse.json();
      const aiText = data.choices?.[0]?.message?.content || '{}';
      const result = JSON.parse(aiText);
      return await this.saveFlashcards(result, category, user);
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
