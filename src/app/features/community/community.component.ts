import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject, signal, computed, ViewChild, ElementRef, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VoiceRecorderComponent } from '../voice-recorder/voice-recorder.component';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { Timestamp } from 'firebase/firestore';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [FormsModule, VoiceRecorderComponent, MatIconModule, DatePipe, RouterLink, NgOptimizedImage],
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
              <img ngSrc="{{msg.authorPhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + msg.authorId}}" 
                   alt="Avatar"
                   width="32"
                   height="32"
                   class="rounded-xl bg-slate-200 border border-slate-100 object-cover shadow-sm" 
                   referrerpolicy="no-referrer">
            </div>

            <!-- Message Bubble -->
            <div class="flex flex-col max-w-[80%]" [class.items-end]="msg.authorId === authService.currentUser()?.uid">
              <div class="flex items-center gap-2 mb-1 px-1">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {{msg.authorId === authService.currentUser()?.uid ? 'You' : (msg.authorId === teacherUid() ? 'Teacher' : msg.authorName)}}
                </span>
                <span class="text-[9px] text-slate-300 font-bold">{{getMessageDate(msg.createdAt) | date:'shortTime'}}</span>
              </div>
              
              <div class="px-4 py-3 rounded-xl shadow-sm border relative group transition-all duration-300"
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
                
                @if (msg.content.startsWith('🎵 Audio Note: ')) {
                  <audio controls class="w-full mt-2 h-10">
                    <source [src]="msg.content.replace('🎵 Audio Note: ', '')" type="audio/webm">
                    Your browser does not support the audio element.
                  </audio>
                } @else {
                  <p class="whitespace-pre-wrap text-[14px] leading-relaxed font-medium">{{msg.content}}</p>
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
      <div class="p-4 bg-white border-t border-slate-200 pb-safe">
        <div class="max-w-4xl mx-auto flex items-end gap-3">
          <div class="flex-1 bg-slate-100 rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500 transition-all shadow-inner overflow-hidden">
            <textarea 
              [(ngModel)]="newMessage"                
              (keydown.enter)="handleEnter($event)"
              placeholder="Message..."
              class="w-full py-3 px-4 bg-transparent border-none focus:ring-0 resize-none outline-none text-[15px] font-medium text-slate-900 placeholder-slate-500"
              rows="1"
              style="min-height: 48px; max-height: 120px; display: block;"
            ></textarea>
          </div>
          
          @if (newMessage.trim().length === 0) {
            <app-voice-recorder (uploaded)="sendAudioMessage($event)" />
          } @else {
            <button 
              (click)="sendMessage()"
              [disabled]="!newMessage.trim() || isSubmitting()"
              class="flex-shrink-0 w-12 h-12 flex items-center justify-center text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all">
              <mat-icon class="scale-100">send</mat-icon>
            </button>
          }
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
  
  teacherUid = computed(() => {
    const users = this.dataService.users();
    const teacher = users.find(u => u.email === 'mscepreparation@gmail.com');
    return teacher ? teacher.uid : null;
  });

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

  async sendAudioMessage(audioUrl: string) {
    const user = this.authService.currentUser();
    if (!user || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    try {
      await this.dataService.sendMessage(user.uid, user.displayName || 'Student', user.photoURL || '', '🎵 Audio Note: ' + audioUrl);
    } finally {
      this.isSubmitting.set(false);
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
