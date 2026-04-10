import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DataService, FlashcardSet } from '../../core/services/data.service';
import { FlashcardService } from '../../core/services/flashcard.service';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full bg-slate-50">
      <!-- Header -->
      <header class="px-6 py-6 border-b border-slate-200 bg-white/90 backdrop-blur-md z-10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 flex items-center gap-2">
            <mat-icon class="text-indigo-600 scale-110">style</mat-icon>
            AI Flashcards
          </h2>
          <p class="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Master your MSCE subjects with AI</p>
        </div>
        
        <button (click)="showGenerateModal.set(true)" 
                class="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">
          <mat-icon>auto_awesome</mat-icon>
          Generate with AI
        </button>
      </header>

      <div class="flex-1 overflow-y-auto p-4 md:p-8">
        <div class="max-w-6xl mx-auto">
          
          @if (selectedSet()) {
            <!-- Flashcard View -->
            <div class="mb-8 flex items-center justify-between">
              <button (click)="selectedSet.set(null)" class="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition-colors">
                <mat-icon>arrow_back</mat-icon>
                Back to Sets
              </button>
              <div class="text-right">
                <h3 class="text-xl font-black text-slate-900">{{selectedSet()?.title}}</h3>
                <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">{{selectedSet()?.category}}</p>
              </div>
            </div>

            @if (dataService.flashcards().length > 0) {
              <div class="flex flex-col items-center gap-12 py-8">
                <!-- Card Container -->
                <div class="w-full max-w-xl h-96 [perspective:1000px] cursor-pointer" 
                     (click)="isFlipped.set(!isFlipped())"
                     (keydown.enter)="isFlipped.set(!isFlipped())"
                     tabindex="0"
                     role="button"
                     aria-label="Flip flashcard">
                  <div class="relative h-full w-full rounded-[3rem] shadow-2xl transition-all duration-700 [transform-style:preserve-3d]"
                       [class.[transform:rotateY(180deg)]]="isFlipped()">
                    
                    <!-- Front -->
                    <div class="absolute inset-0 h-full w-full rounded-[3rem] bg-white p-12 flex flex-col items-center justify-center text-center [backface-visibility:hidden] border-4 border-slate-50">
                      <div class="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-8">
                        <mat-icon class="scale-150">help_outline</mat-icon>
                      </div>
                      <h4 class="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                        {{dataService.flashcards()[currentIndex()].front}}
                      </h4>
                      <p class="mt-auto text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Tap to reveal answer</p>
                    </div>

                    <!-- Back -->
                    <div class="absolute inset-0 h-full w-full rounded-[3rem] bg-indigo-600 p-12 flex flex-col items-center justify-center text-center text-white [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-inner">
                      <div class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-8">
                        <mat-icon class="scale-150">lightbulb</mat-icon>
                      </div>
                      <p class="text-xl md:text-2xl font-bold leading-relaxed">
                        {{dataService.flashcards()[currentIndex()].back}}
                      </p>
                      <p class="mt-auto text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Tap to see question</p>
                    </div>
                  </div>
                </div>

                <!-- Controls -->
                <div class="flex items-center gap-8">
                  <button (click)="prevCard($event)" [disabled]="currentIndex() === 0"
                          class="w-16 h-16 rounded-2xl bg-white shadow-xl border border-slate-100 flex items-center justify-center text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90">
                    <mat-icon class="scale-125">chevron_left</mat-icon>
                  </button>
                  
                  <div class="flex flex-col items-center">
                    <span class="text-2xl font-black text-slate-900">{{currentIndex() + 1}}</span>
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">of {{dataService.flashcards().length}}</span>
                  </div>

                  <button (click)="nextCard($event)" [disabled]="currentIndex() === dataService.flashcards().length - 1"
                          class="w-16 h-16 rounded-2xl bg-white shadow-xl border border-slate-100 flex items-center justify-center text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90">
                    <mat-icon class="scale-125">chevron_right</mat-icon>
                  </button>
                </div>
              </div>
            } @else {
              <div class="flex flex-col items-center justify-center py-20 text-slate-400">
                <mat-icon class="!w-16 !h-16 !text-[64px] mb-4 opacity-20">hourglass_empty</mat-icon>
                <p class="font-bold uppercase tracking-widest">Loading cards...</p>
              </div>
            }

          } @else {
            <!-- Sets Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              @for (set of dataService.flashcardSets(); track set.id) {
                <div (click)="selectSet(set)" 
                     (keydown.enter)="selectSet(set)"
                     tabindex="0"
                     role="button"
                     [aria-label]="'Study ' + set.title"
                     class="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-200/40 transition-all cursor-pointer overflow-hidden">
                  
                  <!-- Category Badge -->
                  <div class="flex items-center justify-between mb-6">
                    <span class="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                      {{set.category}}
                    </span>
                    @if (canDelete(set)) {
                      <button (click)="deleteSet(set, $event)" class="w-8 h-8 rounded-full bg-rose-50 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-rose-100">
                        <mat-icon class="text-sm">delete</mat-icon>
                      </button>
                    }
                  </div>

                  <h3 class="text-xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{{set.title}}</h3>
                  <p class="text-sm text-slate-500 font-medium line-clamp-2 mb-6">{{set.description}}</p>

                  <div class="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <mat-icon class="text-sm">person</mat-icon>
                      </div>
                      <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{set.authorName}}</span>
                    </div>
                    <div class="flex items-center gap-1 text-indigo-600 font-black text-xs uppercase tracking-widest">
                      Study
                      <mat-icon class="text-sm">arrow_forward</mat-icon>
                    </div>
                  </div>

                  <!-- Decorative background element -->
                  <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-150 -z-10"></div>
                </div>
              } @empty {
                <div class="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                  <div class="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-6">
                    <mat-icon class="!w-12 !h-12 !text-[48px] opacity-20">style</mat-icon>
                  </div>
                  <h3 class="text-xl font-black text-slate-900 mb-2">No Flashcard Sets</h3>
                  <p class="text-sm font-medium mb-8">Be the first to generate a revision set!</p>
                  <button (click)="showGenerateModal.set(true)" 
                          class="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all">
                    Generate with AI
                  </button>
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Generate Modal -->
      @if (showGenerateModal()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div class="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl border border-indigo-50 overflow-hidden animate-in zoom-in-95 duration-300">
            <div class="p-8">
              <div class="flex items-center justify-between mb-8">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <mat-icon>auto_awesome</mat-icon>
                  </div>
                  <div>
                    <h3 class="text-xl font-black text-slate-900">AI Generator</h3>
                    <p class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Powered by Gemini AI</p>
                  </div>
                </div>
                <button (click)="showGenerateModal.set(false)" class="text-slate-300 hover:text-slate-500 transition-colors">
                  <mat-icon>close</mat-icon>
                </button>
              </div>

              <div class="space-y-6">
                <div>
                  <label for="genCategory" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Subject Category</label>
                  <select id="genCategory" [(ngModel)]="genCategory" class="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-700">
                    <option value="Biology">Biology</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Geography">Geography</option>
                    <option value="History">History</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="English">English</option>
                    <option value="Agriculture">Agriculture</option>
                  </select>
                </div>

                <div>
                  <label for="genTopic" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Specific Topic</label>
                  <input type="text" id="genTopic" [(ngModel)]="genTopic" placeholder="e.g. Photosynthesis, Newton's Laws..." 
                         class="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold text-slate-700">
                </div>

                <div class="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                  <mat-icon class="text-amber-500">info</mat-icon>
                  <p class="text-xs text-amber-700 font-medium leading-relaxed">
                    Generating a set costs <span class="font-black">1 AI Credit</span>. Pro members have unlimited generations.
                  </p>
                </div>
              </div>
            </div>

            <div class="p-8 bg-slate-50 flex gap-4">
              <button (click)="showGenerateModal.set(false)" class="flex-1 py-4 text-slate-500 font-black uppercase tracking-widest hover:text-slate-700 transition-colors">
                Cancel
              </button>
              <button (click)="generate()" [disabled]="isGenerating() || !genTopic"
                      class="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                @if (isGenerating()) {
                  <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating...
                } @else {
                  <mat-icon>bolt</mat-icon>
                  Generate Now
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class FlashcardsComponent {
  dataService = inject(DataService);
  flashcardService = inject(FlashcardService);
  authService = inject(AuthService);

  selectedSet = signal<FlashcardSet | null>(null);
  currentIndex = signal(0);
  isFlipped = signal(false);
  
  showGenerateModal = signal(false);
  isGenerating = signal(false);
  genTopic = '';
  genCategory = 'Biology';

  constructor() {
    this.dataService.subscribeToFlashcardSets();
  }

  selectSet(set: FlashcardSet) {
    this.selectedSet.set(set);
    this.currentIndex.set(0);
    this.isFlipped.set(false);
    this.dataService.subscribeToFlashcards(set.id);
  }

  nextCard(event: MouseEvent) {
    event.stopPropagation();
    if (this.currentIndex() < this.dataService.flashcards().length - 1) {
      this.isFlipped.set(false);
      setTimeout(() => {
        this.currentIndex.update(i => i + 1);
      }, 150);
    }
  }

  prevCard(event: MouseEvent) {
    event.stopPropagation();
    if (this.currentIndex() > 0) {
      this.isFlipped.set(false);
      setTimeout(() => {
        this.currentIndex.update(i => i - 1);
      }, 150);
    }
  }

  canDelete(set: FlashcardSet) {
    const user = this.authService.currentUser();
    return user?.role === 'admin' || user?.uid === set.authorId;
  }

  async deleteSet(set: FlashcardSet, event: MouseEvent) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this flashcard set?')) {
      await this.dataService.deleteFlashcardSet(set.id);
    }
  }

  async generate() {
    if (this.isGenerating()) return;
    
    const user = this.authService.currentUser();
    if (!user) return;

    if (!user.isPro && user.role !== 'admin' && (user.aiCredits || 0) <= 0) {
      alert('You have run out of AI credits. Please upgrade to Pro or invite friends to earn more!');
      return;
    }

    this.isGenerating.set(true);
    try {
      const setId = await this.flashcardService.generateFlashcards(this.genTopic, this.genCategory);
      if (setId) {
        await this.authService.decrementAiCredits();
        this.showGenerateModal.set(false);
        this.genTopic = '';
        // Automatically select the new set
        const newSet = this.dataService.flashcardSets().find(s => s.id === setId);
        if (newSet) this.selectSet(newSet);
      }
    } catch (error) {
      console.error('Generation failed', error);
      alert('Failed to generate flashcards. Please try again.');
    } finally {
      this.isGenerating.set(false);
    }
  }
}

