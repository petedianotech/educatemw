import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { DataService, Note } from '../../core/services/data.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-video-lessons',
  standalone: true,
  imports: [MatIconModule, CommonModule, RouterLink, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full bg-slate-950 overflow-hidden">
      
      <!-- Header -->
      <header class="px-4 py-3 flex items-center gap-3 bg-slate-950 border-b border-white/10 shrink-0 z-30">
        <a routerLink="/dashboard" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 active:scale-90 transition-all border border-white/5">
          <mat-icon class="text-[22px]">arrow_back</mat-icon>
        </a>
        <div>
          <h1 class="text-lg font-black text-white tracking-tight leading-none">Video Lessons</h1>
          <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Learn from Experts</p>
        </div>
      </header>

      <!-- Video Player Area (Top Half) -->
      <div class="w-full aspect-video bg-black shrink-0 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20">
        @if (activeVideo()) {
          <iframe [src]="getSafeUrl(activeVideo()!.youtubeUrl!)" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        } @else {
          <div class="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-900">
            <div class="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 animate-pulse">
              <mat-icon class="!w-10 !h-10 !text-[40px] text-white/20">play_circle_outline</mat-icon>
            </div>
            <p class="text-xs font-black uppercase tracking-widest text-slate-600">Select a lesson to begin</p>
          </div>
        }
      </div>

      <!-- Active Video Info -->
      @if (activeVideo()) {
        <div class="p-5 shrink-0 bg-slate-900/50 backdrop-blur-xl border-b border-white/10 z-10">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <h2 class="text-white font-black text-base leading-tight">{{activeVideo()!.title}}</h2>
              <div class="flex items-center gap-2 mt-2">
                <span class="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded text-[9px] font-black uppercase tracking-widest border border-indigo-500/20">
                  Malawi Curriculum
                </span>
                <span class="text-slate-500 text-[10px] font-bold">•</span>
                <span class="text-slate-500 text-[10px] font-bold">Official MANEB Prep</span>
              </div>
            </div>
            <button class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white border border-white/10">
              <mat-icon class="text-sm">bookmark_border</mat-icon>
            </button>
          </div>
          <p class="text-slate-400 text-xs mt-3 leading-relaxed line-clamp-2 font-medium">{{activeVideo()!.content}}</p>
        </div>
      }

      <!-- Playlist Area (Bottom Half - Scrollable) -->
      <div class="flex-1 overflow-y-auto bg-slate-950 custom-scrollbar p-4">
        <div class="flex items-center justify-between mb-4 px-1">
          <h3 class="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Course Content</h3>
          <span class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{{videoNotes().length}} Lessons</span>
        </div>

        <div class="flex flex-col gap-4">
          @for (note of videoNotes(); track note.id; let i = $index) {
            <button 
              (click)="activeVideo.set(note)"
              class="flex items-center gap-4 p-3 rounded-2xl text-left transition-all active:scale-[0.98] group relative"
              [class.bg-white/5]="activeVideo()?.id === note.id"
              [class.border]="activeVideo()?.id === note.id"
              [class.border-white/10]="activeVideo()?.id === note.id"
              [class.hover:bg-white/[0.02]]="activeVideo()?.id !== note.id">
              
              <!-- Thumbnail -->
              <div class="w-32 h-20 bg-slate-900 rounded-xl shrink-0 relative overflow-hidden border border-white/5 flex items-center justify-center shadow-lg group-hover:border-white/20 transition-colors">
                <img ngSrc="{{getThumbnail(note.youtubeUrl!)}}" 
                     fill
                     class="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" 
                     alt="Thumbnail">
                
                <div class="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div class="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                    <mat-icon class="!w-4 !h-4 !text-[16px]">play_arrow</mat-icon>
                  </div>
                </div>

                @if (activeVideo()?.id === note.id) {
                  <div class="absolute inset-0 bg-indigo-600/40 flex items-center justify-center backdrop-blur-[1px]">
                    <div class="flex gap-1 items-end h-4">
                      <div class="w-1 bg-white rounded-full animate-[music-bar_0.8s_ease-in-out_infinite]"></div>
                      <div class="w-1 bg-white rounded-full animate-[music-bar_1.2s_ease-in-out_infinite]"></div>
                      <div class="w-1 bg-white rounded-full animate-[music-bar_0.6s_ease-in-out_infinite]"></div>
                    </div>
                  </div>
                }
              </div>
              
              <!-- Video Details -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[9px] font-black text-indigo-500/80 uppercase tracking-widest">Lesson {{i + 1}}</span>
                </div>
                <h3 class="text-slate-100 font-black text-sm line-clamp-2 leading-tight group-hover:text-white transition-colors" [class.text-indigo-400]="activeVideo()?.id === note.id">
                  {{note.title}}
                </h3>
                <div class="flex items-center gap-2 mt-2">
                  <mat-icon class="!w-3 !h-3 !text-[12px] text-slate-600">schedule</mat-icon>
                  <span class="text-[9px] font-black text-slate-600 uppercase tracking-widest">Video Lesson</span>
                </div>
              </div>
            </button>
          } @empty {
            <div class="text-center py-16 px-8">
              <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                <mat-icon class="!w-10 !h-10 !text-[40px] text-slate-700">video_library</mat-icon>
              </div>
              <h4 class="text-white font-black text-lg mb-2">No Lessons Yet</h4>
              <p class="text-slate-500 text-sm font-medium">We're currently uploading new video content. Check back soon!</p>
            </div>
          }
        </div>
      </div>

    </div>
  `
})
export class VideoLessonsComponent implements OnInit, OnDestroy {
  dataService = inject(DataService);
  sanitizer = inject(DomSanitizer);
  
  activeVideo = signal<Note | null>(null);

  ngOnInit() {
    this.dataService.subscribeToNotes();
    // Auto-select first video when data loads
    setTimeout(() => {
      const videos = this.videoNotes();
      if (videos.length > 0 && !this.activeVideo()) {
        this.activeVideo.set(videos[0]);
      }
    }, 1000);
  }

  ngOnDestroy() {
    this.dataService.unsubscribeFromNotes();
  }

  videoNotes() {
    return this.dataService.notes().filter(note => note.youtubeUrl);
  }

  getSafeUrl(url: string): SafeResourceUrl {
    const videoId = this.extractVideoId(url);
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`);
  }

  getThumbnail(url: string): string {
    const videoId = this.extractVideoId(url);
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }

  private extractVideoId(url: string): string {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  }
}
