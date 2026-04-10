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
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `],
  template: `
    <div class="flex flex-col h-full bg-slate-50 relative">
      <!-- Header -->
      <header class="px-4 py-4 flex justify-between items-center bg-white/95 backdrop-blur-xl text-slate-900 z-20 sticky top-0 border-b border-slate-200/60 shadow-sm">
        <div class="flex items-center gap-3">
          <div class="relative">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-indigo-200 overflow-hidden animate-gradient-x">
              <mat-icon class="scale-110 animate-pulse">auto_awesome</mat-icon>
            </div>
            <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
          </div>
          <div>
            <h2 class="text-lg font-black tracking-tight leading-tight text-slate-900">Cleo AI</h2>
            <div class="flex items-center gap-1.5">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p class="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Intelligent Tutor</p>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          @if (!authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin') {
            <div class="flex flex-col items-end">
              <div class="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-xl shadow-slate-200 border border-slate-800">
                <mat-icon class="!w-4 !h-4 !text-[16px] text-amber-400">stars</mat-icon>
                <span class="text-[11px] font-black tracking-wider">{{authService.currentUser()?.aiCredits || 0}} CREDITS</span>
              </div>
              <p class="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Daily Balance</p>
            </div>
          }
          <button (click)="gemini.clearHistory()" class="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all duration-300">
            <mat-icon class="text-[22px]">delete_outline</mat-icon>
          </button>
        </div>
      </header>

      <!-- Chat Area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth" #scrollContainer>
        @if (gemini.messages().length === 0) {
          <div class="flex flex-col items-center justify-center text-center max-w-md mx-auto px-6 py-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-indigo-100/20 mt-8 relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 via-blue-500 to-sky-400"></div>
            <div class="w-20 h-20 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl flex items-center justify-center mb-6 border border-indigo-100 text-indigo-600 shadow-inner">
              <mat-icon class="!w-10 !h-10 !text-[40px] animate-pulse">auto_awesome</mat-icon>
            </div>
            <h3 class="text-2xl font-black text-slate-900 mb-3 tracking-tight">Your MSCE Success Partner</h3>
            <p class="text-slate-500 text-sm font-medium leading-relaxed mb-8">I'm Cleo, your advanced AI tutor. I've mastered the Malawi Secondary Curriculum to help you ace your exams with ease.</p>
            
            <div class="grid grid-cols-1 gap-3 w-full">
              <button (click)="inputText.set('Explain the Nitrogen Cycle clearly (Biology)')" class="group p-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 hover:bg-indigo-600 hover:text-white transition-all duration-300 border border-slate-200 hover:border-indigo-500 text-left shadow-sm flex items-center justify-between">
                <span>"Explain the Nitrogen Cycle"</span>
                <mat-icon class="text-slate-300 group-hover:text-white transition-colors">arrow_forward</mat-icon>
              </button>
              <button (click)="inputText.set('What are the causes of the Chilembwe Uprising? (History)')" class="group p-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700 hover:bg-indigo-600 hover:text-white transition-all duration-300 border border-slate-200 hover:border-indigo-500 text-left shadow-sm flex items-center justify-between">
                <span>"Chilembwe Uprising causes"</span>
                <mat-icon class="text-slate-300 group-hover:text-white transition-colors">arrow_forward</mat-icon>
              </button>
            </div>
          </div>
        }

        @for (msg of gemini.messages(); track msg.id) {
          <div class="flex w-full animate-in fade-in slide-in-from-bottom-4 duration-500" [class.justify-end]="msg.role === 'user'">
            <div class="relative max-w-[88%] md:max-w-[75%] px-5 py-4 rounded-[2rem] shadow-sm border transition-all"
                 [class.bg-white]="msg.role === 'model'"
                 [class.border-slate-100]="msg.role === 'model'"
                 [class.rounded-tl-none]="msg.role === 'model'"
                 [class.bg-slate-900]="msg.role === 'user'"
                 [class.border-slate-800]="msg.role === 'user'"
                 [class.text-white]="msg.role === 'user'"
                 [class.rounded-tr-none]="msg.role === 'user'"
                 [class.shadow-xl]="msg.role === 'model'">
              
              @if (msg.role === 'model') {
                <div class="prose prose-sm max-w-none prose-slate leading-relaxed text-slate-800 font-medium font-modern" [innerHTML]="parseMarkdown(msg.content)"></div>
              } @else {
                <p class="whitespace-pre-wrap text-[15px] leading-relaxed font-bold font-modern">{{msg.content}}</p>
              }
              
              <div class="flex justify-end items-center gap-1.5 mt-3 opacity-60">
                <span class="text-[9px] font-black uppercase tracking-widest" [class.text-slate-400]="msg.role === 'model'" [class.text-slate-500]="msg.role === 'user'">Sent</span>
                @if (msg.role === 'user') {
                  <mat-icon class="text-[12px] !w-[12px] !h-[12px] text-sky-400">done_all</mat-icon>
                }
              </div>
            </div>
          </div>
        }

        @if (gemini.isLoading()) {
          <div class="flex w-full animate-in fade-in duration-300">
            <div class="relative max-w-[85%] px-6 py-5 rounded-[2rem] bg-white border border-slate-100 shadow-xl rounded-tl-none flex items-center gap-2">
              <div class="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce"></div>
              <div class="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.15s"></div>
              <div class="w-2.5 h-2.5 bg-sky-400 rounded-full animate-bounce" style="animation-delay: 0.3s"></div>
              <span class="ml-2 text-xs font-black text-slate-400 uppercase tracking-widest">Cleo is thinking...</span>
            </div>
          </div>
        }
      </div>

      <!-- Input Area -->
      <div class="p-4 bg-white/80 backdrop-blur-xl border-t border-slate-200/60 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] pb-safe">
        @if (!authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin' && (authService.currentUser()?.aiCredits || 0) <= 0) {
          <div class="max-w-3xl mx-auto text-center p-6 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <mat-icon class="text-amber-400 mb-3 !w-10 !h-10 !text-[40px]">workspace_premium</mat-icon>
            <h4 class="font-black text-white text-xl mb-2 tracking-tight">Daily Limit Reached</h4>
            <p class="text-sm text-slate-400 font-medium mb-6">You've used all your free credits for today. Upgrade to Pro for unlimited MSCE tutoring with Cleo.</p>
            <a routerLink="/upgrade" class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/30 hover:scale-105 transition-transform">
              <span>Unlock Unlimited Access</span>
              <mat-icon>arrow_forward</mat-icon>
            </a>
          </div>
        } @else {
          <div class="max-w-4xl mx-auto relative flex items-end gap-3">
            <div class="flex-1 relative bg-slate-50 border-2 border-slate-100 rounded-[2rem] flex items-center focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-300 shadow-inner">
              <textarea 
                [ngModel]="inputText()"
                (ngModelChange)="inputText.set($event)"
                (keydown.enter)="handleEnter($event)"
                placeholder="Ask Cleo anything about your MSCE subjects..."
                class="w-full py-4 px-6 bg-transparent border-transparent focus:ring-0 resize-none outline-none text-[14px] font-bold text-slate-900 placeholder-slate-400"
                rows="1"
                style="min-height: 52px; max-height: 140px;"
              ></textarea>
            </div>
            <button 
              (click)="sendMessage()"
              [disabled]="!inputText().trim() || gemini.isLoading()"
              class="flex-shrink-0 w-13 h-13 flex items-center justify-center text-white bg-slate-900 rounded-[1.4rem] shadow-2xl shadow-slate-900/20 hover:shadow-slate-900/40 hover:-translate-y-1 active:scale-90 disabled:opacity-30 disabled:shadow-none disabled:hover:translate-y-0 disabled:active:scale-100 transition-all duration-300 relative group overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-blue-500 to-sky-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <mat-icon class="relative z-10 scale-100">auto_awesome</mat-icon>
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
