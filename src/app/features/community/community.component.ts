import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject, signal, ViewChild, ElementRef, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [FormsModule, MatIconModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full bg-slate-50 relative">
      <!-- Header -->
      <header class="px-4 py-3 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-blue-600 text-white z-10 sticky top-0 shadow-md">
        <div class="flex items-center gap-3">
          <div class="relative">
            <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 border border-indigo-100 overflow-hidden shadow-sm">
              <mat-icon class="scale-110">group</mat-icon>
            </div>
          </div>
          <div>
            <h2 class="text-lg font-bold leading-tight">Student Community</h2>
            <p class="text-xs text-indigo-100 font-medium truncate max-w-[200px]">
              {{dataService.posts().length}} messages
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button class="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors">
            <mat-icon>search</mat-icon>
          </button>
          <button class="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors">
            <mat-icon>more_vert</mat-icon>
          </button>
        </div>
      </header>

      <!-- Chat Area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50" #scrollContainer>
        
        <div class="flex justify-center mb-6 mt-2">
          <div class="bg-indigo-50 text-indigo-700 text-xs px-3 py-1.5 rounded-lg shadow-sm border border-indigo-100 text-center max-w-xs">
            <mat-icon class="!w-3 !h-3 !text-[12px] inline-block align-text-bottom mr-1">lock</mat-icon>
            Messages are end-to-end encrypted. No one outside of this chat, not even EduMalawi, can read or listen to them.
          </div>
        </div>

        @for (post of dataService.posts(); track post.id) {
          <div class="flex w-full" [class.justify-end]="post.authorId === authService.currentUser()?.uid">
            <div class="relative max-w-[85%] md:max-w-[70%] px-2 pt-1.5 pb-2 shadow-sm rounded-lg border"
                 [class.bg-white]="post.authorId !== authService.currentUser()?.uid"
                 [class.border-slate-200]="post.authorId !== authService.currentUser()?.uid"
                 [class.rounded-tl-none]="post.authorId !== authService.currentUser()?.uid"
                 [class.bg-indigo-100]="post.authorId === authService.currentUser()?.uid"
                 [class.border-indigo-200]="post.authorId === authService.currentUser()?.uid"
                 [class.rounded-tr-none]="post.authorId === authService.currentUser()?.uid">
              
              <!-- Tail -->
              <div class="absolute top-0 w-4 h-4"
                   [class.-left-2]="post.authorId !== authService.currentUser()?.uid"
                   [class.-right-2]="post.authorId === authService.currentUser()?.uid">
                <svg viewBox="0 0 8 13" width="8" height="13" class="block" [class.text-white]="post.authorId !== authService.currentUser()?.uid" [class.text-indigo-100]="post.authorId === authService.currentUser()?.uid">
                  <path opacity="0.13" fill="#0000000" d="M1.533 3.118L8 20.118V0L1.533 3.118z"></path>
                  <path opacity="0.98" fill="currentColor" d="M1.533 2.118L8 19.118V0L1.533 2.118z"></path>
                </svg>
              </div>

              @if (post.authorId !== authService.currentUser()?.uid) {
                <div class="flex items-center gap-2 mb-1 px-1">
                  <span class="text-[13px] font-semibold" [style.color]="getAuthorColor(post.authorId)">
                    {{post.authorName}}
                  </span>
                  @if (post.authorId === 'admin') {
                    <span class="bg-indigo-100 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase border border-indigo-200">Admin</span>
                  }
                </div>
              }
              
              <div class="px-1">
                <p class="whitespace-pre-wrap text-[15px] leading-snug text-slate-900 font-medium">{{post.content}}</p>
              </div>
              
              <div class="flex justify-end items-center gap-1 mt-1 -mb-1 px-1">
                <span class="text-[10px] text-gray-500">{{getPostDate(post.createdAt) | date:'shortTime'}}</span>
                @if (post.authorId === authService.currentUser()?.uid) {
                  <mat-icon class="text-[14px] !w-[14px] !h-[14px] text-blue-500">done_all</mat-icon>
                }
                
                @if (post.authorId === authService.currentUser()?.uid || authService.currentUser()?.role === 'admin') {
                  <button (click)="deletePost(post.id)" class="ml-1 text-gray-400 hover:text-red-500 transition-colors">
                    <mat-icon class="text-[14px] !w-[14px] !h-[14px]">delete</mat-icon>
                  </button>
                }
              </div>
            </div>
          </div>
        } @empty {
          <div class="text-center py-12 text-gray-500">
            <p>No messages yet. Say hi!</p>
          </div>
        }
      </div>

      <!-- Input Area -->
      <div class="p-3 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
        <div class="max-w-3xl mx-auto relative flex items-end gap-2">
          <div class="flex-1 relative bg-slate-50 rounded-2xl border border-slate-200 flex items-center focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all shadow-sm">
            <button class="p-3 text-slate-400 hover:text-slate-600">
              <mat-icon>mood</mat-icon>
            </button>
            <textarea 
              [(ngModel)]="newPostContent"
              placeholder="Message"
              class="w-full py-3 bg-transparent border-transparent focus:ring-0 resize-none outline-none transition-all text-[15px] font-medium text-slate-900 placeholder-slate-400"
              rows="1"
              style="min-height: 48px; max-height: 120px;"
            ></textarea>
            <button class="p-3 text-slate-400 hover:text-slate-600">
              <mat-icon>attach_file</mat-icon>
            </button>
          </div>
          <button 
            (click)="createPost()"
            [disabled]="!newPostContent().trim() || isSubmitting()"
            class="flex-shrink-0 w-12 h-12 flex items-center justify-center text-white bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl shadow-md shadow-indigo-500/20 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 disabled:active:scale-100 transition-all">
            <mat-icon>{{newPostContent().trim() ? 'send' : 'mic'}}</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `
})
export class CommunityComponent implements OnInit, OnDestroy {
  dataService = inject(DataService);
  authService = inject(AuthService);
  
  newPostContent = signal('');
  isSubmitting = signal(false);
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor() {
    effect(() => {
      this.dataService.posts();
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  ngOnInit() {
    this.dataService.subscribeToPosts();
  }

  ngOnDestroy() {
    this.dataService.unsubscribeFromPosts();
  }

  async createPost() {
    const content = this.newPostContent().trim();
    const user = this.authService.currentUser();
    if (!content || !user || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    try {
      await this.dataService.createPost(user.uid, user.displayName, user.photoURL, content);
      this.newPostContent.set('');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async deletePost(postId: string) {
    if (confirm('Are you sure you want to delete this message?')) {
      await this.dataService.deletePost(postId);
    }
  }

  getPostDate(createdAt: any): Date | null {
    if (!createdAt) return null;
    if (createdAt instanceof Timestamp) return createdAt.toDate();
    if (createdAt instanceof Date) return createdAt;
    return new Date(createdAt);
  }

  // Generate consistent colors for different users based on their ID
  getAuthorColor(authorId: string): string {
    const colors = [
      '#351c75', '#d90057', '#008000', '#ff8c00', 
      '#0000ff', '#800080', '#008080', '#b8860b'
    ];
    let hash = 0;
    for (let i = 0; i < authorId.length; i++) {
      hash = authorId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  private scrollToBottom() {
    if (this.scrollContainer) {
      const el = this.scrollContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
