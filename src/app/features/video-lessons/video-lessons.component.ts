import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-video-lessons',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full bg-slate-950 overflow-hidden">
      
      <!-- Video Player Area (Top Half) -->
      <div class="w-full aspect-video bg-black shrink-0 relative shadow-2xl z-20">
        @if (activeVideo()) {
          <iframe [src]="getSafeUrl(activeVideo()!.youtubeUrl!)" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
        } @else {
          <div class="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <mat-icon class="!w-12 !h-12 !text-[48px] mb-2 opacity-50">play_circle_outline</mat-icon>
            <p class="text-sm font-medium">Select a video to play</p>
          </div>
        }
      </div>

      <!-- Active Video Info -->
      @if (activeVideo()) {
        <div class="p-4 shrink-0 bg-slate-900 border-b border-white/10 z-10">
          <h2 class="text-white font-bold text-sm line-clamp-1">{{activeVideo()!.title}}</h2>
          <p class="text-slate-400 text-[11px] mt-1 line-clamp-1">{{activeVideo()!.content}}</p>
        </div>
      }

      <!-- Playlist Area (Bottom Half - Scrollable) -->
      <div class="flex-1 overflow-y-auto bg-slate-950 custom-scrollbar p-3">
        <h3 class="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3 px-2">Up Next</h3>
        <div class="flex flex-col gap-3">
          @for (note of videoNotes(); track note.id) {
            <button 
              (click)="activeVideo.set(note)"
              class="flex items-start gap-4 p-3 rounded-2xl text-left transition-all active:scale-[0.98]"
              [class.bg-slate-800]="activeVideo()?.id === note.id"
              [class.shadow-md]="activeVideo()?.id === note.id"
              [class.hover:bg-slate-900]="activeVideo()?.id !== note.id">
              
              <!-- Thumbnail Placeholder -->
              <div class="w-32 h-20 bg-slate-800 rounded-xl shrink-0 relative overflow-hidden border border-white/10 flex items-center justify-center shadow-sm">
                <mat-icon class="text-white/50 !w-8 !h-8 !text-[32px]">play_arrow</mat-icon>
                @if (activeVideo()?.id === note.id) {
                  <div class="absolute inset-0 bg-indigo-500/20 flex items-center justify-center backdrop-blur-[2px]">
                    <div class="flex gap-1">
                      <div class="w-1.5 h-4 bg-indigo-400 rounded-full animate-pulse"></div>
                      <div class="w-1.5 h-6 bg-indigo-400 rounded-full animate-pulse" style="animation-delay: 0.1s"></div>
                      <div class="w-1.5 h-3 bg-indigo-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
                    </div>
                  </div>
                }
              </div>
              
              <!-- Video Details -->
              <div class="flex-1 min-w-0 py-1">
                <h3 class="text-slate-200 font-bold text-sm line-clamp-2 leading-tight mb-1" [class.text-indigo-400]="activeVideo()?.id === note.id">
                  {{note.title}}
                </h3>
                <p class="text-slate-500 text-xs line-clamp-2 leading-snug">{{note.content}}</p>
              </div>
            </button>
          } @empty {
            <div class="text-center py-12 text-slate-600">
              <p class="text-sm">No video lessons available yet.</p>
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
  
  activeVideo = signal<any>(null);

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
    const videoId = url.split('v=')[1] || url.split('/').pop();
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`);
  }
}
