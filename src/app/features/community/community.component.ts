import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [FormsModule, MatIconModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full bg-gray-50">
      <header class="px-6 py-4 border-b border-gray-200 bg-white z-10 flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            <mat-icon class="text-purple-500">forum</mat-icon>
            Student Community
          </h2>
          <p class="text-sm text-gray-500">Discuss, ask, and share with peers</p>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-6">
        <div class="max-w-3xl mx-auto space-y-6">
          
          <!-- Create Post -->
          <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <div class="flex gap-4">
              <img [src]="authService.currentUser()?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + authService.currentUser()?.uid" alt="Profile" class="w-10 h-10 rounded-full bg-gray-100" referrerpolicy="no-referrer">
              <div class="flex-1">
                <textarea 
                  [(ngModel)]="newPostContent"
                  placeholder="What's on your mind? Ask a question or share a tip..."
                  class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none outline-none transition-all"
                  rows="3"
                ></textarea>
                <div class="mt-3 flex justify-end">
                  <button 
                    (click)="createPost()"
                    [disabled]="!newPostContent().trim() || isSubmitting()"
                    class="px-4 py-2 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                    <mat-icon class="text-sm">send</mat-icon>
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Posts List -->
          <div class="space-y-4">
            @for (post of dataService.posts(); track post.id) {
              <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                <div class="flex justify-between items-start mb-3">
                  <div class="flex items-center gap-3">
                    <img [src]="post.authorPhoto || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + post.authorId" alt="Author" class="w-10 h-10 rounded-full bg-gray-100" referrerpolicy="no-referrer">
                    <div>
                      <p class="font-medium text-gray-900">{{post.authorName}}</p>
                      <p class="text-xs text-gray-500">{{post.createdAt?.toDate() | date:'medium'}}</p>
                    </div>
                  </div>
                  @if (post.authorId === authService.currentUser()?.uid || authService.currentUser()?.role === 'admin') {
                    <button (click)="deletePost(post.id)" class="text-gray-400 hover:text-red-500 transition-colors p-1">
                      <mat-icon class="text-sm">delete</mat-icon>
                    </button>
                  }
                </div>
                
                <p class="text-gray-800 whitespace-pre-wrap mb-4">{{post.content}}</p>
                
                <div class="flex items-center gap-4 text-gray-500 border-t border-gray-100 pt-3">
                  <button class="flex items-center gap-1 hover:text-purple-600 transition-colors">
                    <mat-icon class="text-sm">thumb_up</mat-icon>
                    <span class="text-sm">{{post.likesCount || 0}}</span>
                  </button>
                  <button class="flex items-center gap-1 hover:text-purple-600 transition-colors">
                    <mat-icon class="text-sm">chat_bubble_outline</mat-icon>
                    <span class="text-sm">{{post.commentsCount || 0}}</span>
                  </button>
                </div>
              </div>
            } @empty {
              <div class="text-center py-12 text-gray-500">
                <mat-icon class="!w-12 !h-12 !text-[48px] mb-4 opacity-50">forum</mat-icon>
                <p>No posts yet. Be the first to start a discussion!</p>
              </div>
            }
          </div>

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
    if (confirm('Are you sure you want to delete this post?')) {
      await this.dataService.deletePost(postId);
    }
  }
}
