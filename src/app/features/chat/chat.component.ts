import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../core/services/gemini.service';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { marked } from 'marked';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, MatIconModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full bg-slate-50 relative">
      <!-- Header -->
      <header class="px-4 py-3 flex justify-between items-center bg-white text-slate-900 z-10 sticky top-0 border-b-[4px] border-slate-200">
        <div class="flex items-center gap-3">
          <div class="relative">
            <div class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border-2 border-emerald-200 overflow-hidden">
              <mat-icon class="scale-110">auto_awesome</mat-icon>
            </div>
          </div>
          <div>
            <h2 class="text-lg font-black leading-tight">Cleo AI</h2>
            <p class="text-xs text-emerald-600 font-bold">online</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          @if (!authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin') {
            <div class="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border-2 border-amber-200 border-b-[4px]">
              <mat-icon class="!w-4 !h-4 !text-[16px]">bolt</mat-icon>
              <span class="text-xs font-bold">{{authService.currentUser()?.aiCredits || 0}} left</span>
            </div>
          }
          <button (click)="gemini.clearHistory()" class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <mat-icon class="text-[20px]">delete_sweep</mat-icon>
          </button>
        </div>
      </header>

      <!-- Chat Area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4" #scrollContainer>
        @if (gemini.messages().length === 0) {
          <div class="flex flex-col items-center justify-center text-center max-w-md mx-auto px-4 py-8 bg-white rounded-[2rem] border-2 border-slate-200 border-b-[6px] mt-4">
            <div class="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border-2 border-emerald-200 border-b-[4px] text-emerald-600">
              <mat-icon class="!w-8 !h-8 !text-[32px]">auto_awesome</mat-icon>
            </div>
            <h3 class="text-xl font-black text-slate-900 mb-2">Meet Cleo</h3>
            <p class="text-slate-600 text-sm font-bold leading-relaxed mb-6">Your personal AI tutor. Ask me to explain concepts, solve math problems, or quiz you on any subject.</p>
            
            <div class="flex flex-col gap-2 w-full">
              <button (click)="inputText.set('Explain photosynthesis simply')" class="p-3 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors border-2 border-slate-200 border-b-[4px] active:border-b-2 active:translate-y-[2px] text-left">
                "Explain photosynthesis simply"
              </button>
              <button (click)="inputText.set('Give me a math quiz')" class="p-3 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors border-2 border-slate-200 border-b-[4px] active:border-b-2 active:translate-y-[2px] text-left">
                "Give me a math quiz"
              </button>
            </div>
          </div>
        }

        @for (msg of gemini.messages(); track msg.id) {
          <div class="flex w-full" [class.justify-end]="msg.role === 'user'">
            <div class="relative max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl border-2 border-b-[4px]"
                 [class.bg-white]="msg.role === 'model'"
                 [class.border-slate-200]="msg.role === 'model'"
                 [class.rounded-tl-sm]="msg.role === 'model'"
                 [class.bg-emerald-500]="msg.role === 'user'"
                 [class.border-emerald-700]="msg.role === 'user'"
                 [class.text-white]="msg.role === 'user'"
                 [class.rounded-tr-sm]="msg.role === 'user'">
              
              @if (msg.role === 'model') {
                <div class="prose prose-sm max-w-none prose-slate leading-relaxed text-slate-800 font-medium" [innerHTML]="parseMarkdown(msg.content)"></div>
              } @else {
                <p class="whitespace-pre-wrap text-[15px] leading-relaxed font-bold">{{msg.content}}</p>
              }
              
              <div class="flex justify-end items-center gap-1 mt-2 -mb-1">
                <span class="text-[10px] font-bold" [class.text-slate-400]="msg.role === 'model'" [class.text-emerald-200]="msg.role === 'user'">Just now</span>
                @if (msg.role === 'user') {
                  <mat-icon class="text-[14px] !w-[14px] !h-[14px] text-emerald-200">done_all</mat-icon>
                }
              </div>
            </div>
          </div>
        }

        @if (gemini.isLoading()) {
          <div class="flex w-full">
            <div class="relative max-w-[85%] px-5 py-4 rounded-2xl bg-white border-2 border-slate-200 border-b-[4px] rounded-tl-sm flex items-center gap-1.5">
              <div class="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style="animation-delay: 0.15s"></div>
              <div class="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style="animation-delay: 0.3s"></div>
            </div>
          </div>
        }
      </div>

      <!-- Input Area -->
      <div class="p-3 bg-white border-t-[4px] border-slate-200 pb-safe">
        @if (!authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin' && (authService.currentUser()?.aiCredits || 0) <= 0) {
          <div class="max-w-3xl mx-auto text-center p-4 bg-slate-50 rounded-[2rem] border-2 border-slate-200 border-b-[6px]">
            <mat-icon class="text-amber-500 mb-2">workspace_premium</mat-icon>
            <h4 class="font-black text-slate-900 mb-1">Out of Free Questions</h4>
            <p class="text-sm text-slate-500 font-bold mb-3">Upgrade to Pro for unlimited access to Cleo AI.</p>
            <a routerLink="/upgrade" class="btn-primary px-6 py-2">
              Upgrade Now
            </a>
          </div>
        } @else {
          <div class="max-w-3xl mx-auto relative flex items-end gap-2">
            <div class="flex-1 relative bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center focus-within:border-emerald-500 transition-all">
              <textarea 
                [(ngModel)]="inputText"
                (keydown.enter)="handleEnter($event)"
                placeholder="Ask Cleo a question..."
                class="w-full py-3 px-4 bg-transparent border-transparent focus:ring-0 resize-none outline-none text-[15px] font-bold text-slate-900 placeholder-slate-400"
                rows="1"
                style="min-height: 48px; max-height: 120px;"
              ></textarea>
            </div>
            <button 
              (click)="sendMessage()"
              [disabled]="!inputText().trim() || gemini.isLoading()"
              class="flex-shrink-0 w-12 h-12 flex items-center justify-center text-white bg-emerald-500 rounded-2xl border-b-[4px] border-emerald-700 hover:bg-emerald-400 active:border-b-0 active:translate-y-[4px] disabled:opacity-50 disabled:bg-slate-300 disabled:border-slate-400 disabled:active:border-b-[4px] disabled:active:translate-y-0 transition-all">
              <mat-icon>send</mat-icon>
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class ChatComponent {
  gemini = inject(GeminiService);
  authService = inject(AuthService);
  inputText = signal('');
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor() {
    effect(() => {
      this.gemini.messages();
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  parseMarkdown(content: string): string {
    return marked.parse(content) as string;
  }

  handleEnter(event: Event) {
    const e = event as KeyboardEvent;
    if (!e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  async sendMessage() {
    if (!this.inputText().trim() || this.gemini.isLoading()) return;
    
    const user = this.authService.currentUser();
    if (!user) return;
    
    if (!user.isPro && user.role !== 'admin') {
      if ((user.aiCredits || 0) <= 0) {
        return; // Out of credits
      }
      await this.authService.decrementAiCredits();
    }

    this.gemini.sendMessage(this.inputText());
    this.inputText.set('');
  }

  private scrollToBottom() {
    if (this.scrollContainer) {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
