import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../core/services/gemini.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage, AsyncPipe, DatePipe } from '@angular/common';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, MatIconModule, RouterLink, NgOptimizedImage, MarkdownPipe, AsyncPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    .no-highlight ::ng-deep * {
      background: transparent !important;
      background-color: transparent !important;
      border: none !important;
      box-shadow: none !important;
      color: #1e293b !important; /* slate-800 */
    }
    .no-highlight ::ng-deep p {
      margin-bottom: 1.25rem !important;
      line-height: 1.75 !important;
      font-size: 1.05rem !important;
    }
    .no-highlight ::ng-deep strong {
      color: #0f172a !important; /* slate-900 */
      font-weight: 800 !important;
    }
    .no-highlight ::ng-deep ul, .no-highlight ::ng-deep ol {
      margin-bottom: 1.25rem !important;
      padding-left: 1.5rem !important;
    }
    .no-highlight ::ng-deep li {
      margin-bottom: 0.5rem !important;
      line-height: 1.6 !important;
    }
    .no-highlight ::ng-deep pre, 
    .no-highlight ::ng-deep code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
      font-size: 0.9em !important;
      font-weight: 600 !important;
      padding: 0.75rem !important;
      margin: 1rem 0 !important;
      background-color: #f8fafc !important; /* slate-50 */
      border: 1px solid #f1f5f9 !important; /* slate-100 */
      border-radius: 0.75rem !important;
      display: block;
      color: #334155 !important;
    }
    .no-highlight ::ng-deep blockquote {
      border-left: 4px solid #e2e8f0 !important; /* slate-200 */
      padding-left: 1.25rem !important;
      margin: 1.5rem 0 !important;
      color: #475569 !important; /* slate-600 */
      font-style: italic;
    }
    textarea::-webkit-scrollbar {
      display: none;
    }
    textarea {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
  `],
  template: `
    <div class="flex flex-col h-full bg-slate-50 relative">
      <!-- Header -->
      <header class="px-4 py-4 flex justify-between items-center bg-white/95 backdrop-blur-xl text-slate-900 z-20 sticky top-0 border-b border-slate-200/60 shadow-sm">
        <div class="flex items-center gap-3">
          <a routerLink="/dashboard" class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:scale-90 transition-all mr-1">
            <mat-icon class="text-[22px]">arrow_back</mat-icon>
          </a>
          <div class="relative">
            <div class="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200 overflow-hidden">
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
          @if (notificationService.permission() === 'default') {
            <button (click)="notificationService.requestPermission()" class="w-10 h-10 flex items-center justify-center text-blue-600 bg-blue-50 rounded-2xl transition-all hover:bg-blue-100" title="Enable Notifications">
              <mat-icon class="text-[20px]">notifications_active</mat-icon>
            </button>
          }
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
      <div class="flex-1 overflow-y-auto p-4 space-y-8 scroll-smooth" #scrollContainer>
        @if (gemini.messages().length === 0) {
          <div class="flex flex-col items-center justify-center text-center max-w-md mx-auto px-6 py-12 mt-8">
            <div class="w-16 h-16 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100 text-indigo-600 shadow-sm">
              <mat-icon class="!w-8 !h-8 !text-[32px] animate-pulse">auto_awesome</mat-icon>
            </div>
            <h3 class="text-2xl font-black text-slate-900 mb-3 tracking-tight">How can I help you today?</h3>
            <p class="text-slate-500 text-sm font-medium leading-relaxed mb-8">I'm Cleo, your AI tutor. Ask me anything about your MSCE subjects.</p>
            
            <div class="grid grid-cols-1 gap-3 w-full">
              <button (click)="inputText.set('Explain the Nitrogen Cycle clearly (Biology)')" class="group p-4 bg-white rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all duration-300 border border-slate-200 text-left shadow-sm flex items-center justify-between">
                <span>"Explain the Nitrogen Cycle"</span>
                <mat-icon class="text-slate-300 group-hover:text-indigo-600 transition-colors">arrow_forward</mat-icon>
              </button>
              <button (click)="inputText.set('What are the causes of the Chilembwe Uprising? (History)')" class="group p-4 bg-white rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all duration-300 border border-slate-200 text-left shadow-sm flex items-center justify-between">
                <span>"Chilembwe Uprising causes"</span>
                <mat-icon class="text-slate-300 group-hover:text-indigo-600 transition-colors">arrow_forward</mat-icon>
              </button>
            </div>
          </div>
        }

        @for (msg of gemini.messages(); track msg.id) {
          <div class="flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300 gap-4 max-w-4xl mx-auto px-2">
            <!-- Icon/Avatar -->
            <div class="shrink-0 mt-1">
              @if (msg.role === 'model') {
                <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-md shadow-blue-100">
                  <mat-icon class="!w-5 !h-5 !text-[20px]">auto_awesome</mat-icon>
                </div>
              } @else {
                <img ngSrc="{{authService.currentUser()?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + authService.currentUser()?.uid}}" 
                     alt="User Avatar"
                     width="40"
                     height="40"
                     class="rounded-xl bg-slate-200 border border-slate-100 object-cover shadow-sm" 
                     referrerpolicy="no-referrer">
              }
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5">
                <span class="text-[11px] font-black text-slate-900 uppercase tracking-widest">
                  {{msg.role === 'model' ? 'Cleo AI' : 'You'}}
                </span>
                <span class="text-[9px] font-bold text-slate-400">{{msg.timestamp | date:'shortTime'}}</span>
              </div>
              
              <div class="relative">
                @if (msg.role === 'model') {
                  <div class="prose prose-slate max-w-none leading-relaxed text-slate-800 no-highlight" [innerHTML]="msg.content | markdown | async"></div>
                } @else {
                  <div class="bg-white border border-slate-200/80 rounded-2xl rounded-tl-none p-4 shadow-sm">
                    <p class="whitespace-pre-wrap text-[15px] leading-relaxed font-bold text-slate-900">{{msg.content}}</p>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        @if (gemini.isLoading()) {
          <div class="flex w-full animate-in fade-in duration-300 gap-4 max-w-4xl mx-auto px-2">
            <div class="shrink-0 mt-1">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-md shadow-blue-100">
                <mat-icon class="!w-5 !h-5 !text-[20px]">auto_awesome</mat-icon>
              </div>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-sky-300 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
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
            <div class="flex-1 relative bg-white border-2 border-slate-200 rounded-[2rem] focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-300 shadow-sm overflow-hidden">
              <textarea 
                [ngModel]="inputText()"
                (ngModelChange)="inputText.set($event)"
                (keydown.enter)="handleEnter($event)"
                placeholder="Ask Cleo anything about your MSCE subjects..."
                class="w-full py-4 px-6 bg-transparent border-none focus:ring-0 resize-none outline-none text-[15px] font-bold text-slate-900 placeholder-slate-400 leading-relaxed"
                rows="1"
                style="min-height: 56px; max-height: 160px; display: block;"
              ></textarea>
            </div>
            <button 
              (click)="sendMessage()"
              [disabled]="!inputText().trim() || gemini.isLoading()"
              class="flex-shrink-0 w-14 h-14 flex items-center justify-center text-white bg-blue-600 rounded-full shadow-xl shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-1 active:scale-90 disabled:opacity-30 disabled:shadow-none disabled:hover:translate-y-0 disabled:active:scale-100 transition-all duration-300 relative group overflow-hidden">
              <div class="absolute inset-0 bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <mat-icon class="relative z-10 scale-110">send</mat-icon>
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
  notificationService = inject(NotificationService);
  inputText = signal('');
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor() {
    effect(() => {
      this.gemini.messages();
      setTimeout(() => this.scrollToBottom(), 100);
    });
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

    // Schedule a reminder to come back in 2 hours if they haven't been notified recently
    this.notificationService.scheduleReminder(
      'Ready for more learning? 📚',
      'Cleo AI is waiting to help you with your next subject!',
      2 * 60 * 60 * 1000 // 2 hours
    );
  }

  private scrollToBottom() {
    if (this.scrollContainer) {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
