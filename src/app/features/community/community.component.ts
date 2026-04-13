import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject, signal, ViewChild, ElementRef, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { Timestamp } from 'firebase/firestore';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [FormsModule, MatIconModule, DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    textarea::-webkit-scrollbar {
      display: none;
    }
    textarea {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .long-press-active {
      animation: pulse-red 2s infinite;
    }
    @keyframes pulse-red {
      0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(244, 63, 94, 0); }
      100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
    }
  `],
  template: `
    <div class="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      <!-- Header -->
      <header class="px-4 py-4 flex justify-between items-center bg-white/95 backdrop-blur-xl text-slate-900 z-20 sticky top-0 border-b border-slate-200/60 shadow-sm">
        <div class="flex items-center gap-3">
          <a routerLink="/dashboard" class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:scale-90 transition-all mr-1">
            <mat-icon class="text-[22px]">arrow_back</mat-icon>
          </a>
          <div class="relative">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-indigo-200 overflow-hidden">
              <mat-icon class="scale-110">groups</mat-icon>
            </div>
            <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
          </div>
          <div>
            <h2 class="text-lg font-black tracking-tight leading-tight text-slate-900">Community Chat</h2>
            <div class="flex items-center gap-1.5">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p class="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Live Discussion</p>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <span class="text-[11px] font-black text-slate-600 uppercase tracking-wider">{{dataService.messages().length}} MSGS</span>
          </div>
        </div>
      </header>

      <!-- Chat Area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth custom-scrollbar" #scrollContainer>
        @for (msg of dataService.messages(); track msg.id; let last = $last) {
          <div class="flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300 gap-3" 
               [class.flex-row-reverse]="msg.authorId === authService.currentUser()?.uid">
            
            <!-- Avatar -->
            <div class="shrink-0 mt-1">
              <img [src]="msg.authorPhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + msg.authorId" 
                   alt="Avatar"
                   class="w-8 h-8 rounded-xl bg-slate-200 border border-slate-100 object-cover shadow-sm" 
                   referrerpolicy="no-referrer">
            </div>

            <!-- Message Bubble -->
            <div class="flex flex-col max-w-[80%]" [class.items-end]="msg.authorId === authService.currentUser()?.uid">
              <div class="flex items-center gap-2 mb-1 px-1">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {{msg.authorId === authService.currentUser()?.uid ? 'You' : msg.authorName}}
                </span>
                <span class="text-[9px] text-slate-300 font-bold">{{getMessageDate(msg.createdAt) | date:'shortTime'}}</span>
              </div>
              
              <div class="px-4 py-3 rounded-[1.5rem] shadow-sm border relative group transition-all duration-300"
                   (touchstart)="onMessageTouchStart(msg.id)"
                   (touchend)="onMessageTouchEnd()"
                   (mousedown)="onMessageTouchStart(msg.id)"
                   (mouseup)="onMessageTouchEnd()"
                   (mouseleave)="onMessageTouchEnd()"
                   [class.long-press-active]="pressingMessageId() === msg.id"
                   [class.bg-white]="msg.authorId !== authService.currentUser()?.uid"
                   [class.border-slate-200]="msg.authorId !== authService.currentUser()?.uid"
                   [class.rounded-tl-none]="msg.authorId !== authService.currentUser()?.uid"
                   [class.bg-slate-900]="msg.authorId === authService.currentUser()?.uid"
                   [class.text-white]="msg.authorId === authService.currentUser()?.uid"
                   [class.border-slate-800]="msg.authorId === authService.currentUser()?.uid"
                   [class.rounded-tr-none]="msg.authorId === authService.currentUser()?.uid">
                
                <p class="whitespace-pre-wrap text-[14px] leading-relaxed font-medium">{{msg.content}}</p>
                
                @if (msg.authorId === authService.currentUser()?.uid || authService.currentUser()?.role === 'admin') {
                  <button (click)="deleteMessage(msg.id)" 
                          class="absolute -top-2 -right-2 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-sm transition-all">
                    <mat-icon class="!w-3.5 !h-3.5 !text-[14px]">delete</mat-icon>
                  </button>
                }
              </div>
            </div>
          </div>
        } @empty {
          <div class="flex flex-col items-center justify-center text-center py-20 px-6">
            <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
              <mat-icon class="!w-8 !h-8 !text-[32px]">forum</mat-icon>
            </div>
            <h3 class="text-lg font-black text-slate-900 mb-1">No messages yet</h3>
            <p class="text-slate-500 text-sm font-medium">Be the first to share a study tip or say hi!</p>
          </div>
        }
      </div>

      <!-- Input Area -->
      <div class="p-4 bg-white/80 backdrop-blur-xl border-t border-slate-200/60 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] pb-safe">
        <div class="max-w-4xl mx-auto relative flex items-end gap-3">
          <div class="flex-1 relative bg-white border-2 border-slate-200 rounded-[2rem] focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-300 shadow-sm overflow-hidden">
            <textarea 
              [(ngModel)]="newMessage"
              (keydown.enter)="handleEnter($event)"
              placeholder="Share a study tip or ask a question..."
              class="w-full py-4 px-6 bg-transparent border-none focus:ring-0 resize-none outline-none text-[15px] font-bold text-slate-900 placeholder-slate-400 leading-relaxed"
              rows="1"
              style="min-height: 56px; max-height: 160px; display: block;"
            ></textarea>
          </div>
          <button 
            (click)="sendMessage()"
            [disabled]="!newMessage.trim() || isSubmitting()"
            class="flex-shrink-0 w-14 h-14 flex items-center justify-center text-white bg-slate-900 rounded-full shadow-xl shadow-slate-200 hover:shadow-indigo-200 hover:-translate-y-1 active:scale-90 disabled:opacity-30 disabled:shadow-none disabled:hover:translate-y-0 disabled:active:scale-100 transition-all duration-300 relative group overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-blue-500 to-sky-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <mat-icon class="relative z-10 scale-110">send</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `
})
export class CommunityComponent implements OnInit, OnDestroy {
  dataService = inject(DataService);
  authService = inject(AuthService);
  
  newMessage = '';
  isSubmitting = signal(false);
  pressingMessageId = signal<string | null>(null);
  private pressTimer: ReturnType<typeof setTimeout> | null = null;
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor() {
    effect(() => {
      this.dataService.messages();
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  ngOnInit() {
    this.dataService.subscribeToMessages();
  }

  ngOnDestroy() {
    this.dataService.unsubscribeFromMessages();
  }

  handleEnter(event: Event) {
    const e = event as KeyboardEvent;
    if (!e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  async sendMessage() {
    const content = this.newMessage.trim();
    const user = this.authService.currentUser();
    if (!content || !user || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    try {
      await this.dataService.sendMessage(user.uid, user.displayName || 'Student', user.photoURL || '', content);
      this.newMessage = '';
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async deleteMessage(messageId: string) {
    if (confirm('Delete this message?')) {
      await this.dataService.deleteMessage(messageId);
    }
  }

  onMessageTouchStart(messageId: string) {
    const msg = this.dataService.messages().find(m => m.id === messageId);
    if (!msg || (msg.authorId !== this.authService.currentUser()?.uid && this.authService.currentUser()?.role !== 'admin')) return;

    this.pressingMessageId.set(messageId);
    this.pressTimer = setTimeout(() => {
      this.deleteMessage(messageId);
      this.onMessageTouchEnd();
    }, 2000); // 2 seconds long press
  }

  onMessageTouchEnd() {
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
    }
    this.pressingMessageId.set(null);
  }

  getMessageDate(createdAt: unknown): Date | null {
    if (!createdAt) return null;
    if (createdAt instanceof Timestamp) return createdAt.toDate();
    if (createdAt instanceof Date) return createdAt;
    return new Date(createdAt as string | number);
  }

  private scrollToBottom() {
    if (this.scrollContainer) {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
