import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

export interface DictionaryDefinition {
  word: string;
  phonetic?: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
    }[];
  }[];
}

@Injectable({ providedIn: 'root' })
export class DictionaryService {
  private http = inject(HttpClient);
  private apiUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

  async getDefinition(word: string): Promise<DictionaryDefinition[]> {
    try {
      return await lastValueFrom(this.http.get<DictionaryDefinition[]>(`${this.apiUrl}${word}`));
    } catch (error) {
      console.error('Dictionary API failed', error);
      throw error;
    }
  }
}
