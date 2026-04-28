import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { DictionaryService, DictionaryDefinition } from '../../core/services/dictionary.service';
import { GeminiService } from '../../core/services/gemini.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dictionary',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 pb-safe transition-colors duration-500">
      <!-- Header -->
      <header class="px-4 py-3 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-white/5 shadow-sm sticky top-0 z-10 pt-safe transition-colors duration-500">
        <div class="flex items-center gap-3">
          <a routerLink="/dashboard" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition-all">
            <mat-icon class="text-[22px]">arrow_back</mat-icon>
          </a>
          <h1 class="text-xl font-bold text-slate-900 dark:text-white leading-tight">MSCE Dictionary</h1>
        </div>
        
        <!-- AI Credits Badge -->
        @if (auth.currentUser() && !auth.currentUser()?.isPro && auth.currentUser()?.role !== 'admin') {
          <div class="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800">
            <div class="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
               <img [src]="geminiService.EMI_AVATAR" alt="emi" class="w-full h-full object-cover">
            </div>
            <span class="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider">{{auth.currentUser()?.dictionaryAiCredits || 0}} Left</span>
          </div>
        }
      </header>

      <div class="p-4 max-w-2xl mx-auto space-y-6 mt-4">
        <!-- Search Bar -->
        <div class="relative group">
          <mat-icon class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">search</mat-icon>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (keyup.enter)="search()"
            placeholder="Search any word (e.g. Mitochondria, Force, Soil)" 
            class="w-full pl-14 pr-24 py-5 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 text-sm font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all outline-none"
          >
          <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            @if (searchQuery()) {
              <button 
                (click)="search()" 
                class="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">
                <mat-icon class="!w-5 !h-5 !text-[20px]">search</mat-icon>
              </button>
              <button (click)="searchQuery.set('')" class="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-slate-500 transition-colors">
                <mat-icon class="!w-5 !h-5 !text-[20px]">cancel</mat-icon>
              </button>
            }
          </div>
        </div>

        @if (isLoading()) {
          <div class="flex flex-col items-center justify-center py-20 space-y-4">
            <div class="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Consulting the library...</p>
          </div>
        } @else if (error()) {
          <div class="bg-red-50 dark:bg-red-900/10 p-8 rounded-[2rem] border border-red-100 dark:border-red-900/20 text-center animate-in fade-in zoom-in duration-300">
            <div class="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600 mx-auto mb-4">
              <mat-icon class="!w-8 !h-8 !text-[32px]">error_outline</mat-icon>
            </div>
            <h3 class="text-sm font-black text-red-900 dark:text-red-300 mb-2">Word Not Found</h3>
            <p class="text-xs text-red-600/70 dark:text-red-400/70 font-medium">We couldn't find that word in our dictionary. Try a different term or check your spelling.</p>
          </div>
        } @else if (definitions() && definitions()!.length > 0) {
          @let def = definitions()![0];
          <div class="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <!-- Word Card -->
            <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-white/5 relative overflow-hidden transition-colors duration-500 text-pretty">
              <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16"></div>
              
              <div class="relative z-10">
                <div class="flex items-end gap-3 mb-6">
                  <h2 class="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">{{def.word}}</h2>
                  <span class="text-sm font-bold text-slate-400 pb-1 italic">{{def.phonetic}}</span>
                </div>

                <!-- emi AI Context Button -->
                <button (click)="getAiContext()" 
                        [disabled]="aiLoading()"
                        class="w-full flex items-center justify-center gap-3 p-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all mb-8 group disabled:opacity-50">
                  @if (aiLoading()) {
                    <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  } @else {
                    <div class="w-6 h-6 rounded-lg overflow-hidden border border-white/20">
                      <img [src]="geminiService.EMI_AVATAR" alt="emi AI" class="w-full h-full object-cover avatar-integrated">
                    </div>
                    <span>Ask emi for MSCE Context</span>
                  }
                </button>

                @if (aiExplanation()) {
                  <div class="mb-8 p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2.5rem] border border-indigo-100 dark:border-white/5 animate-in zoom-in duration-300 relative group/insight">
                    <div class="flex items-center justify-between mb-4">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-xl overflow-hidden shadow-sm">
                          <img [src]="geminiService.EMI_AVATAR" alt="emi AI" class="w-full h-full object-cover avatar-integrated">
                        </div>
                        <span class="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full shadow-sm">emi AI Insight</span>
                      </div>
                      
                      <!-- TTS Button -->
                      <button 
                        (click)="speak()"
                        class="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-white/5 hover:scale-110 active:scale-95 transition-all">
                        <mat-icon class="!w-4 !h-4 !text-[16px]">{{ isSpeaking ? 'stop' : 'volume_up' }}</mat-icon>
                      </button>
                    </div>
                    
                    <div class="max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      <p class="text-[15px] text-slate-800 dark:text-slate-100 leading-relaxed font-bold font-sans tracking-tight">{{aiExplanation()}}</p>
                    </div>
                  </div>
                }

                <!-- Standard Definitions -->
                <div class="space-y-6">
                  @for (meaning of def.meanings; track $index) {
                    <div>
                      <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                        {{meaning.partOfSpeech}}
                      </h4>
                      <ul class="space-y-4">
                        @for (d of meaning.definitions; track $index) {
                          <li class="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-white/5 transition-colors duration-500">
                            <p class="text-xs text-slate-700 dark:text-slate-200 font-bold leading-relaxed">{{d.definition}}</p>
                            @if (d.example) {
                              <p class="mt-2 text-[10px] text-slate-500 italic font-medium">"{{d.example}}"</p>
                            }
                          </li>
                        }
                      </ul>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        } @else {
          <!-- Empty State -->
          <div class="py-20 text-center animate-in fade-in duration-700">
            <div class="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/10 rounded-[2.5rem] flex items-center justify-center text-indigo-600 mx-auto mb-6 shadow-inner">
              <mat-icon class="!w-12 !h-12 !text-[48px]">library_books</mat-icon>
            </div>
            <h3 class="text-lg font-black text-slate-900 dark:text-white mb-2">Build Your Vocabulary</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 max-w-[240px] mx-auto font-medium">Search for scientific or general words to see their definitions and MSCE context.</p>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DictionaryComponent {
  private dictionaryService = inject(DictionaryService);
  public geminiService = inject(GeminiService);
  public auth = inject(AuthService);

  searchQuery = signal('');
  definitions = signal<DictionaryDefinition[] | null>(null);
  isLoading = signal(false);
  error = signal(false);
  
  aiExplanation = signal<string | null>(null);
  aiLoading = signal(false);

  isSpeaking = false;
  private synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;

  constructor() {
    // Stop speaking if user navigates away or word changes
    effect(() => {
      this.definitions();
      this.stopSpeaking();
    }, { allowSignalWrites: true });
  }

  async search() {
    const word = this.searchQuery().trim();
    if (!word) return;

    this.isLoading.set(true);
    this.error.set(false);
    this.definitions.set(null);
    this.aiExplanation.set(null);
    this.stopSpeaking();

    try {
      const results = await this.dictionaryService.getDefinition(word);
      this.definitions.set(results);
    } catch {
      this.error.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  async getAiContext() {
    const word = this.definitions()?.[0]?.word;
    if (!word) return;

    const user = this.auth.currentUser();
    if (!user) return;

    // Check credits
    if (!user.isPro && user.role !== 'admin' && (user.dictionaryAiCredits || 0) <= 0) {
      alert('You have run out of daily dictionary AI credits. Upgrade to Pro for unlimited access!');
      return;
    }

    this.aiLoading.set(true);
    try {
      const response = await this.geminiService.getDictionaryExplanation(word);
      this.aiExplanation.set(response);
      await this.auth.decrementDictionaryAiCredits();
    } catch {
      this.aiExplanation.set('Could not fetch AI context at this time.');
    } finally {
      this.aiLoading.set(false);
    }
  }

  speak() {
    if (!this.synthesis || !this.aiExplanation()) return;

    if (this.isSpeaking) {
      this.stopSpeaking();
      return;
    }

    const cleanText = this.aiExplanation()!.replace(/[#*`_~]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Natural')) 
                        || voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => {
      this.isSpeaking = false;
    };
    utterance.onerror = () => {
      this.isSpeaking = false;
    };

    this.isSpeaking = true;
    this.synthesis.speak(utterance);
  }

  private stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }
}
