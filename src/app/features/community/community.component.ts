import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject, signal, ViewChild, ElementRef, effect, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService, Post } from '../../core/services/data.service';
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
          <select [(ngModel)]="sortOrder" class="bg-white/10 text-white text-xs rounded-lg px-2 py-1 outline-none">
            <option value="recency">Newest</option>
            <option value="popularity">Popular</option>
          </select>
        </div>
      </header>

      <!-- Chat Area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50" #scrollContainer>
        @for (post of sortedPosts(); track post.id) {
          <div class="flex w-full" [class.justify-end]="post.authorId === authService.currentUser()?.uid">
            <div class="relative max-w-[85%] md:max-w-[70%] px-2 pt-1.5 pb-2 shadow-sm rounded-lg border"
                 [class.bg-white]="post.authorId !== authService.currentUser()?.uid"
                 [class.border-slate-200]="post.authorId !== authService.currentUser()?.uid"
                 [class.rounded-tl-none]="post.authorId !== authService.currentUser()?.uid"
                 [class.bg-indigo-100]="post.authorId === authService.currentUser()?.uid"
                 [class.border-indigo-200]="post.authorId === authService.currentUser()?.uid"
                 [class.rounded-tr-none]="post.authorId === authService.currentUser()?.uid">
              
              @if (post.authorId !== authService.currentUser()?.uid) {
                <div class="flex items-center gap-2 mb-1 px-1">
                  <span class="text-[13px] font-semibold" [style.color]="getAuthorColor(post.authorId)">
                    {{post.authorName}}
                  </span>
                </div>
              }
              
              <div class="px-1">
                <p class="whitespace-pre-wrap text-[15px] leading-snug text-slate-900 font-medium">{{post.content}}</p>
              </div>
              
              <div class="flex justify-end items-center gap-2 mt-1 px-1">
                <button (click)="likePost(post)" class="flex items-center gap-0.5 text-[10px]" [class.text-red-500]="post.likedBy?.includes(authService.currentUser()?.uid || '')">
                  <mat-icon class="text-[14px] !w-[14px] !h-[14px]">favorite</mat-icon>
                  {{post.likesCount || 0}}
                </button>
                <button (click)="replyToPost(post)" class="flex items-center gap-0.5 text-[10px] text-gray-500">
                  <mat-icon class="text-[14px] !w-[14px] !h-[14px]">reply</mat-icon>
                  {{post.commentsCount || 0}}
                </button>
                <span class="text-[10px] text-gray-500">{{getPostDate(post.createdAt) | date:'shortTime'}}</span>
                
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
            <textarea 
              [(ngModel)]="newPostContent"
              [placeholder]="replyingTo() ? 'Replying to ' + replyingTo()?.authorName : 'Message'"
              class="w-full py-3 px-4 bg-transparent border-transparent focus:ring-0 resize-none outline-none transition-all text-[15px] font-medium text-slate-900 placeholder-slate-400"
              rows="1"
              style="min-height: 48px; max-height: 120px;"
            ></textarea>
          </div>
          <button 
            (click)="createPost()"
            [disabled]="!newPostContent().trim() || isSubmitting()"
            class="flex-shrink-0 w-12 h-12 flex items-center justify-center text-white bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl shadow-md shadow-indigo-500/20 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 disabled:active:scale-100 transition-all">
            <mat-icon>send</mat-icon>
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
  sortOrder = signal<'recency' | 'popularity'>('recency');
  replyingTo = signal<Post | null>(null);
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  sortedPosts = computed(() => {
    const posts = [...this.dataService.posts()];
    if (this.sortOrder() === 'popularity') {
      return posts.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    }
    return posts.sort((a, b) => {
      const dateA = this.getPostDate(a.createdAt)?.getTime() || 0;
      const dateB = this.getPostDate(b.createdAt)?.getTime() || 0;
      return dateB - dateA;
    });
  });

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
      if (this.replyingTo()) {
        await this.dataService.createReply(this.replyingTo()!.id, user.uid, user.displayName, user.photoURL, content);
        this.replyingTo.set(null);
      } else {
        await this.dataService.createPost(user.uid, user.displayName, user.photoURL, content);
      }
      this.newPostContent.set('');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async likePost(post: Post) {
    const user = this.authService.currentUser();
    if (!user) return;
    const liked = !post.likedBy?.includes(user.uid);
    await this.dataService.likePost(post.id, user.uid, liked);
  }

  replyToPost(post: Post) {
    this.replyingTo.set(post);
  }

  async deletePost(postId: string) {
    if (confirm('Are you sure you want to delete this message?')) {
      await this.dataService.deletePost(postId);
    }
  }

  getPostDate(createdAt: unknown): Date | null {
    if (!createdAt) return null;
    if (createdAt instanceof Timestamp) return createdAt.toDate();
    if (createdAt instanceof Date) return createdAt;
    return new Date(createdAt as string | number);
  }

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
