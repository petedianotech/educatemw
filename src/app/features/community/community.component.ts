import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject, signal, computed, ViewChild, ElementRef, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, CommonModule } from '@angular/common';
import { Timestamp } from 'firebase/firestore';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [FormsModule, MatIconModule, DatePipe, RouterLink, CommonModule],
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
    @keyframes pump {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.4); opacity: 0.6; }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-pump {
      animation: pump 2s infinite ease-in-out;
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
          </div>
          <div>
            <h2 class="text-lg font-black tracking-tight leading-tight text-slate-900">Community Chat</h2>
            <div class="flex items-center gap-1.5">
              <div class="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pump"></div>
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

      <!-- Messages Area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth" #scrollContainer>
        @for (msg of dataService.messages(); track msg.id) {
          <div class="flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300 gap-3"
               [class.flex-row-reverse]="msg.authorId === authService.currentUser()?.uid"
               (touchstart)="onMessageTouchStart(msg.id)"
               (touchend)="onMessageTouchEnd()"
               (mousedown)="onMessageTouchStart(msg.id)"
               (mouseup)="onMessageTouchEnd()"
               [class.long-press-active]="pressingMessageId() === msg.id">
            
            <!-- Avatar -->
            <div class="shrink-0">
              <div class="w-9 h-9 rounded-xl overflow-hidden bg-slate-200 border border-white shadow-sm ring-2 ring-slate-100">
                <img [src]="msg.authorPhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + msg.authorId" 
                     alt="Avatar"
                     class="w-full h-full object-cover">
              </div>
            </div>

            <!-- Message Bubble -->
            <div class="flex flex-col max-w-[80%]"
                 [class.items-end]="msg.authorId === authService.currentUser()?.uid">
              <div class="flex items-center gap-2 mb-1 px-1">
                <span class="text-[10px] font-black text-slate-500 uppercase tracking-wider">{{msg.authorName}}</span>
                @if (msg.authorId === teacherUid()) {
                  <span class="bg-blue-100 text-blue-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm border border-blue-200">Teacher</span>
                }
                <span class="text-[8px] font-bold text-slate-300">{{getMessageDate(msg.createdAt) | date:'shortTime'}}</span>
              </div>
              
              <div class="p-3.5 rounded-2xl shadow-sm border relative group transition-all"
                   [class.bg-white]="msg.authorId !== authService.currentUser()?.uid"
                   [class.border-slate-200]="msg.authorId !== authService.currentUser()?.uid"
                   [class.rounded-tl-none]="msg.authorId !== authService.currentUser()?.uid"
                   [class.bg-indigo-600]="msg.authorId === authService.currentUser()?.uid"
                   [class.text-white]="msg.authorId === authService.currentUser()?.uid"
                   [class.border-indigo-500]="msg.authorId === authService.currentUser()?.uid"
                   [class.rounded-tr-none]="msg.authorId === authService.currentUser()?.uid">
                
                @if (msg.type === 'audio') {
                  <div class="flex flex-col gap-2 min-w-[200px]">
                    <audio [src]="msg.content" controls class="w-full h-10 brightness-95 rounded-lg overflow-hidden" 
                           [style.filter]="msg.authorId === authService.currentUser()?.uid ? 'invert(1) grayscale(100%)' : 'none'"></audio>
                    <span class="text-[8px] font-bold uppercase opacity-60 flex items-center gap-1">
                      <mat-icon class="text-[10px] !w-[10px] !h-[10px]">mic</mat-icon>
                      Voice Message
                    </span>
                  </div>
                } @else {
                  <p class="text-[14px] leading-relaxed whitespace-pre-wrap">{{msg.content}}</p>
                }
              </div>
            </div>
          </div>
        } @empty {
          <div class="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
            <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <mat-icon class="text-slate-400 scale-125">chat_bubble_outline</mat-icon>
            </div>
            <p class="text-slate-500 font-bold">No messages yet.</p>
            <p class="text-slate-400 text-xs mt-1">Be the first to start the discussion!</p>
          </div>
        }
      </div>

      <!-- Input Area wrapper -->
      <div class="p-4 bg-white border-t border-slate-200 pb-safe">
        <div class="max-w-4xl mx-auto flex items-end gap-3">
          
          <!-- Normal Input or Recording State -->
          <div class="flex-1 bg-slate-100/80 rounded-2xl transition-all shadow-inner overflow-hidden border border-transparent relative">
            
            @if (isRecording()) {
              <!-- Recording Controls -->
              <div class="flex items-center justify-between px-4 py-3 bg-red-50/50 animate-in slide-in-from-left-2">
                <div class="flex items-center gap-3">
                  <div class="w-2.5 h-2.5 bg-red-600 rounded-full animate-recording-red"></div>
                  <span class="text-sm font-black text-red-600 font-mono">{{ formatTime(recordingTime()) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <button (click)="cancelRecording()" class="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                  <button (click)="stopRecording()" class="px-3 py-1.5 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-100">
                    Stop
                  </button>
                </div>
              </div>
            } @else if (previewAudioUrl()) {
              <!-- Playback Controls -->
              <div class="flex items-center justify-between px-3 py-2 bg-indigo-50/50 animate-in slide-in-from-bottom-2">
                <audio [src]="previewAudioUrl()" controls class="h-10 grow mr-2"></audio>
                <button (click)="resetRecordingUI()" class="p-2 text-slate-400 hover:text-rose-500">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            } @else {
              <!-- Standard Textarea -->
              <textarea 
                [(ngModel)]="newMessage"                
                (keydown.enter)="handleEnter($event)"
                placeholder="Type your message..."
                class="w-full py-3.5 px-5 bg-transparent border-none focus:ring-0 resize-none outline-none text-[15px] font-medium text-slate-900 placeholder-slate-400"
                rows="1"
                style="min-height: 52px; max-height: 150px; display: block;"
              ></textarea>
            }
          </div>
          
          <!-- Send or Mic Button -->
          <button 
            (click)="handleAction()"
            [disabled]="isSubmitting()"
            class="flex-shrink-0 w-13 h-13 flex items-center justify-center text-white rounded-2xl active:scale-95 disabled:opacity-50 transition-all shadow-lg overflow-hidden shrink-0"
            [class.bg-indigo-600]="newMessage.trim() || previewAudioUrl()"
            [class.bg-slate-900]="!newMessage.trim() && !previewAudioUrl() && !isRecording()"
            [class.bg-red-600]="isRecording()"
            [class.shadow-indigo-100]="newMessage.trim() || previewAudioUrl()">
            
            @if (isSubmitting()) {
              <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            } @else if (newMessage.trim() || previewAudioUrl()) {
              <mat-icon class="scale-110">send</mat-icon>
            } @else if (isRecording()) {
              <mat-icon class="scale-110">stop</mat-icon>
            } @else {
              <mat-icon class="scale-110">mic</mat-icon>
            }
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
  
  // Audio state
  isRecording = signal(false);
  recordingTime = signal(0);
  previewAudioUrl = signal<string | null>(null);
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordingInterval: ReturnType<typeof setInterval> | null = null;
  private audioBlob: Blob | null = null;

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
    this.dataService.subscribeToUsers();
  }

  ngOnDestroy() {
    this.dataService.unsubscribeFromMessages();
    this.dataService.unsubscribeFromUsers();
    this.cancelRecording();
  }

  handleEnter(event: Event) {
    const e = event as KeyboardEvent;
    if (!e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  handleAction() {
    if (this.previewAudioUrl()) {
      this.sendAudio();
    } else if (this.newMessage.trim()) {
      this.sendMessage();
    } else if (this.isRecording()) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  async startRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Microphone recording is not supported in this browser or context. If you are in a preview window, try opening the app in a new tab.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        this.audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.previewAudioUrl.set(URL.createObjectURL(this.audioBlob));
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.isRecording.set(true);
      this.recordingTime.set(0);
      
      this.recordingInterval = setInterval(() => {
        this.recordingTime.update(t => t + 1);
      }, 1000);

    } catch (err) {
      console.error('Microphone access denied', err);
      // For codemagic/webviews we want to provide the most helpful prompt possible to the user
      // if they haven't explicitly disabled it. We will log the error but not spam standard alerts
      // if it's purely a Permission denied constraint. Webviews need native permissions handled first.
      
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
         console.warn('Microphone permission was denied by the user or the operating system.');
      } else {
         console.warn('Could not start microphone. If wrapped in an app, verify native audio permissions are allowed.');
      }
      alert('Could not access microphone. Please verify you have given this app permission to use audio in your device settings.');
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.isRecording.set(false);
      if (this.recordingInterval) {
        clearInterval(this.recordingInterval);
        this.recordingInterval = null;
      }
    }
  }

  cancelRecording() {
    this.stopRecording();
    this.resetRecordingUI();
  }

  resetRecordingUI() {
    this.previewAudioUrl.set(null);
    this.audioChunks = [];
    this.audioBlob = null;
    this.recordingTime.set(0);
  }

  formatTime(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  async sendAudio() {
    if (!this.audioBlob || this.isSubmitting()) return;
    
    const user = this.authService.currentUser();
    if (!user) return;

    this.isSubmitting.set(true);
    try {
      const audioUrl = await this.authService.uploadAudio(this.audioBlob);
      await this.dataService.sendMessage(user.uid, user.displayName || 'Student', user.photoURL || '', audioUrl, 'audio');
      this.resetRecordingUI();
    } catch (error) {
      console.error('Failed to send audio', error);
      alert('Failed to send voice message. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async sendMessage() {
    const content = this.newMessage.trim();
    const user = this.authService.currentUser();
    if (!content || !user || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    try {
      await this.dataService.sendMessage(user.uid, user.displayName || 'Student', user.photoURL || '', content, 'text');
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
