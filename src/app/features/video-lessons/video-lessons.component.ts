import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject, signal, computed, ViewChild, ElementRef, HostListener } from '@angular/core';
import { DataService, VideoLesson } from '../../core/services/data.service';
import { ThemeService } from '../../core/services/theme.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { YouTubePlayer } from '@angular/youtube-player';

@Component({
  selector: 'app-video-lessons',
  standalone: true,
  imports: [MatIconModule, CommonModule, RouterLink, NgOptimizedImage, YouTubePlayer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-500">
      
      <!-- Header -->
      <header class="px-4 py-3 flex items-center gap-3 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-white/10 shrink-0 z-30 transition-colors">
        <a routerLink="/dashboard" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 active:scale-90 transition-all border border-slate-200 dark:border-white/5">
          <mat-icon class="text-[22px]">arrow_back</mat-icon>
        </a>
        <div>
          <h1 class="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none transition-colors">Video Lessons</h1>
          <p class="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1 transition-colors">Learn from Experts</p>
        </div>
      </header>

      <!-- Video Player Area (Top Half) -->
      <div #playerContainer class="w-full aspect-video bg-black shrink-0 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 group">
        @if (activeVideo()) {
          @if (apiLoaded()) {
            <youtube-player
              #youtubePlayer
              [videoId]="extractVideoId(activeVideo()!.youtubeUrl!)"
              [playerVars]="playerVars"
              [width]="playerWidth()"
              [height]="playerHeight()"
              (stateChange)="onStateChange($event)"
              (ready)="onPlayerReady($event)"
            ></youtube-player>
          } @else {
            <div class="absolute inset-0 flex items-center justify-center bg-slate-900">
               <div class="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
          }
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
        <div class="p-5 shrink-0 bg-white dark:bg-slate-900/50 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 z-10 transition-colors">
          <div class="flex flex-col gap-2">
            <h2 class="text-slate-900 dark:text-white font-black text-base leading-tight transition-colors">{{activeVideo()!.title}}</h2>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded text-[9px] font-black uppercase tracking-widest border border-indigo-200 dark:border-indigo-500/20 transition-colors">
                Malawi Curriculum
              </span>
              <span class="text-slate-400 dark:text-slate-500 text-[10px] font-bold">•</span>
              <span class="text-slate-400 dark:text-slate-500 text-[10px] font-bold transition-colors">Official MANEB Prep</span>
            </div>
            <p class="text-slate-600 dark:text-slate-400 text-xs mt-1 leading-relaxed line-clamp-2 font-medium transition-colors">{{activeVideo()!.description}}</p>
          </div>
        </div>
      }

      <!-- Playlist Area (Bottom Half - Scrollable) -->
      <div class="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 custom-scrollbar p-4 transition-colors">
        <div class="flex items-center justify-between mb-4 px-1">
          <h3 class="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] transition-colors">Course Content</h3>
          <span class="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest transition-colors">{{videoNotes().length}} Lessons</span>
        </div>

        <div class="flex flex-col gap-4">
          @for (note of videoNotes(); track note.id; let i = $index) {
            <button 
              (click)="selectVideo(note)"
              class="flex items-center gap-4 p-3 rounded-2xl text-left transition-all active:scale-[0.98] group relative"
              [class.bg-white]="activeVideo()?.id === note.id && !themeService.isDarkMode()"
              [class.bg-white/5]="activeVideo()?.id === note.id && themeService.isDarkMode()"
              [class.border]="activeVideo()?.id === note.id"
              [class.border-slate-200]="activeVideo()?.id === note.id && !themeService.isDarkMode()"
              [class.border-white/10]="activeVideo()?.id === note.id && themeService.isDarkMode()"
              [class.hover:bg-slate-100]="activeVideo()?.id !== note.id && !themeService.isDarkMode()"
              [class.hover:bg-white/[0.02]]="activeVideo()?.id !== note.id && themeService.isDarkMode()"
              [class.shadow-sm]="activeVideo()?.id === note.id && !themeService.isDarkMode()">
              
              <!-- Thumbnail -->
              <div class="w-24 h-16 sm:w-32 sm:h-20 bg-slate-200 dark:bg-slate-900 rounded-xl shrink-0 relative overflow-hidden border border-slate-300 dark:border-white/5 flex items-center justify-center shadow-lg group-hover:border-slate-400 dark:group-hover:border-white/20 transition-all">
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
                      <div class="w-1 bg-white rounded-full animate-music-bar"></div>
                      <div class="w-1 bg-white rounded-full animate-music-bar [animation-delay:0.2s]"></div>
                      <div class="w-1 bg-white rounded-full animate-music-bar [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                }
              </div>
              
              <!-- Video Details -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[9px] font-black text-indigo-600 dark:text-indigo-400/80 uppercase tracking-widest transition-colors">Lesson {{i + 1}}</span>
                </div>
                <h3 class="text-slate-900 dark:text-slate-100 font-black text-sm line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-white transition-colors" [class.text-indigo-600]="activeVideo()?.id === note.id && !themeService.isDarkMode()" [class.dark:text-indigo-400]="activeVideo()?.id === note.id && themeService.isDarkMode()">
                  {{note.title}}
                </h3>
                <div class="flex items-center gap-2 mt-2">
                  <mat-icon class="!w-3 !h-3 !text-[12px] text-slate-400 dark:text-slate-600 transition-colors">schedule</mat-icon>
                  <span class="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest transition-colors">Video Lesson</span>
                </div>
              </div>
            </button>
          } @empty {
            <div class="text-center py-16 px-8">
              <div class="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-200 dark:border-white/5 transition-all">
                <mat-icon class="!w-10 !h-10 !text-[40px] text-slate-400 dark:text-slate-700 transition-colors">video_library</mat-icon>
              </div>
              <h4 class="text-slate-900 dark:text-white font-black text-lg mb-2 transition-colors">No Lessons Yet</h4>
              <p class="text-slate-500 dark:text-slate-500 text-sm font-medium transition-colors">We're currently uploading new video content. Check back soon!</p>
            </div>
          }
        </div>
      </div>

    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 10px;
    }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.05);
    }
    @keyframes music-bar {
      0%, 100% { height: 4px; }
      50% { height: 16px; }
    }
    .animate-music-bar {
      animation: music-bar 0.8s ease-in-out infinite;
    }
  `]
})
export class VideoLessonsComponent implements OnInit, OnDestroy {
  dataService = inject(DataService);
  themeService = inject(ThemeService);
  sanitizer = inject(DomSanitizer);
  
  activeVideo = signal<VideoLesson | null>(null);
  apiLoaded = signal(false);

  @ViewChild('playerContainer') playerContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('youtubePlayer') youtubePlayer: YouTubePlayer | undefined;
  
  playerWidth = signal(0);
  playerHeight = signal(0);
  
  // Player state
  isPlaying = signal(false);
  hasStartedPlaying = signal(false);
  currentTime = signal(0);
  duration = signal(0);
  volume = signal(100);
  isMuted = signal(false);
  
  private timeUpdateInterval: ReturnType<typeof setInterval> | undefined;
  private resizeObserver: ResizeObserver | undefined;
  
  playerVars = {
    controls: 1,
    autoplay: 1,
    disablekb: 0,
    modestbranding: 1,
    rel: 0,
    showinfo: 0,
    fs: 1
  };

  videoNotes = computed(() => {
    // Merge notes published via destination 'video-lessons' with those published in 'videos' tab natively
    const notesAsVideos: VideoLesson[] = this.dataService.notes()
      .filter(note => note.youtubeUrl && note.destination === 'video-lessons')
      .map(note => ({
        id: note.id,
        title: note.title,
        description: note.content || '',
        youtubeUrl: note.youtubeUrl!,
        category: note.category,
        createdAt: note.createdAt
      }));
    const nativeVideos = this.dataService.videoLessons();
    return [...nativeVideos, ...notesAsVideos].sort((a, b) => {
      const db = (b.createdAt as { toMillis?: () => number })?.toMillis?.() || Date.now();
      const da = (a.createdAt as { toMillis?: () => number })?.toMillis?.() || Date.now();
      return db - da; 
    });
  });

  ngOnInit() {
    this.dataService.subscribeToVideoLessons();
    this.dataService.subscribeToNotes();
    
    // Load YouTube API
    if (!document.getElementById('youtube-iframe-api')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
    
    // Check repeatedly if API is ready
    const checkApi = setInterval(() => {
      const win = window as any;
      if (win.YT && win.YT.Player) {
        clearInterval(checkApi);
        this.apiLoaded.set(true);
      }
    }, 100);

    // Initial resize
    setTimeout(() => this.onResize(), 100);

    // Resize Observer for reactive width/height
    if (typeof ResizeObserver !== 'undefined' && this.playerContainer?.nativeElement) {
      this.resizeObserver = new ResizeObserver(() => {
        this.onResize();
      });
      this.resizeObserver.observe(this.playerContainer.nativeElement);
    }

    // Auto-select first video
    setTimeout(() => {
      const videos = this.videoNotes();
      if (videos.length > 0 && !this.activeVideo()) {
        this.activeVideo.set(videos[0]);
      }
    }, 1000);
  }

  @HostListener('window:resize')
  onResize() {
    if (this.playerContainer?.nativeElement) {
      const w = this.playerContainer.nativeElement.clientWidth;
      const h = this.playerContainer.nativeElement.clientHeight;
      if (w > 0) this.playerWidth.set(w);
      if (h > 0) this.playerHeight.set(h);
    }
  }

  selectVideo(video: VideoLesson) {
    this.activeVideo.set(video);
  }

  onPlayerReady(_event: any) {
    this.onResize();
  }

  onStateChange(_event: any) {
    // Optional tracking logic can go here
  }

  ngOnDestroy() {
    this.dataService.unsubscribeFromVideoLessons();
    this.dataService.unsubscribeFromNotes();
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  getSafeUrl(url: string): SafeResourceUrl {
    const videoId = this.extractVideoId(url);
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`);
  }

  getThumbnail(url: string): string {
    const videoId = this.extractVideoId(url);
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }

  extractVideoId(url: string): string {
    if (!url) return '';
    // Handle various youtube URL formats including shared, shorts, live and standard URLs
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?v=)|(\?v=)|(&v=)|(shorts\/)|(live\/))([^#&?]*).*/;
    const match = url.match(regExp);
    // The video ID is typically in the 11th capture group with this refined regex
    const id = (match && match[11]) ? match[11] : '';
    return id.length === 11 ? id : '';
  }
}
