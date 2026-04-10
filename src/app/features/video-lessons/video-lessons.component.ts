import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject } from '@angular/core';
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
    <div class="flex flex-col h-full bg-slate-50">
      <header class="px-6 py-4 border-b border-slate-200 bg-white/90 backdrop-blur-md z-10 shadow-sm">
        <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
          <mat-icon class="text-indigo-600">play_circle_outline</mat-icon>
          Video Lessons
        </h2>
        <p class="text-sm text-slate-500 font-medium">Learn with interactive video tutorials</p>
      </header>

      <div class="flex-1 overflow-y-auto p-6">
        <div class="max-w-5xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (note of videoNotes(); track note.id) {
              <div class="card-modern overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-200">
                <div class="h-48 bg-slate-900 flex items-center justify-center border-b border-slate-100 relative">
                  <iframe [src]="getSafeUrl(note.youtubeUrl!)" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
                </div>
                <div class="p-5 flex-1 flex flex-col justify-between">
                  <h3 class="font-bold text-slate-900 text-lg line-clamp-2 mb-2">{{note.title}}</h3>
                  <p class="text-slate-500 text-sm font-medium line-clamp-3 mb-4">{{note.content}}</p>
                </div>
              </div>
            } @empty {
              <div class="col-span-full text-center py-12 text-gray-500">
                <mat-icon class="!w-12 !h-12 !text-[48px] mb-4 opacity-50">play_circle_outline</mat-icon>
                <p>No video lessons available yet.</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class VideoLessonsComponent implements OnInit, OnDestroy {
  dataService = inject(DataService);
  sanitizer = inject(DomSanitizer);

  ngOnInit() {
    this.dataService.subscribeToNotes();
  }

  ngOnDestroy() {
    this.dataService.unsubscribeFromNotes();
  }

  videoNotes() {
    return this.dataService.notes().filter(note => note.youtubeUrl);
  }

  getSafeUrl(url: string): SafeResourceUrl {
    // Convert standard YouTube URL to embed URL
    const videoId = url.split('v=')[1] || url.split('/').pop();
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
  }
}
