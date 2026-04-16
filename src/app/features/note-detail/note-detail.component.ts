import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title, DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DataService, Note } from '../../core/services/data.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-note-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 pb-20">
      <!-- Header -->
      <header class="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center gap-4">
        <a routerLink="/notes" class="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all">
          <mat-icon>arrow_back</mat-icon>
        </a>
        <h1 class="text-lg font-black text-slate-900 tracking-tight truncate">
          {{ note()?.title || 'Loading...' }}
        </h1>
      </header>

      @if (isLoading()) {
        <div class="flex flex-col items-center justify-center py-20">
          <div class="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching material...</p>
        </div>
      } @else if (note(); as n) {
        <div class="max-w-4xl mx-auto p-6">
          <div class="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div class="p-8 md:p-12">
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100 uppercase tracking-widest">
                    {{ n.category }}
                  </span>
                  @if (n.level) {
                    <span class="px-3 py-1 bg-slate-50 text-slate-600 text-[10px] font-black rounded-full border border-slate-100 uppercase tracking-widest">
                      {{ n.level }}
                    </span>
                  }
                  @if (n.form) {
                    <span class="px-3 py-1 bg-slate-50 text-slate-600 text-[10px] font-black rounded-full border border-slate-100 uppercase tracking-widest">
                      {{ n.form }}
                    </span>
                  }
                  @if (n.isProOnly) {
                    <span class="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-full border border-amber-100 uppercase tracking-widest flex items-center gap-1">
                      <mat-icon class="!w-3 !h-3 !text-[12px]">bolt</mat-icon>
                      PRO
                    </span>
                  }
                </div>
                <button (click)="shareNote()" class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100">
                  <mat-icon class="text-sm">share</mat-icon>
                </button>
              </div>

              <h2 class="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-4 leading-tight">
                {{ n.title }}
              </h2>

              <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">
                Published on {{ toDate(n.createdAt) | date:'longDate' }}
              </p>

              @if (n.isProOnly && !authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin') {
                <div class="bg-slate-950 rounded-3xl p-8 text-center text-white relative overflow-hidden">
                  <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                  <mat-icon class="!w-12 !h-12 !text-[48px] text-amber-400 mb-4">lock</mat-icon>
                  <h3 class="text-xl font-black mb-2">Premium Content</h3>
                  <p class="text-slate-400 text-sm mb-6 max-w-xs mx-auto">This material is exclusive to Pro students. Upgrade now to unlock all MSCE & JCE resources.</p>
                  <a routerLink="/upgrade" class="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-900/40 hover:scale-105 transition-all">
                    <mat-icon>bolt</mat-icon>
                    Upgrade to Pro
                  </a>
                </div>
              } @else {
                <div class="prose prose-slate max-w-none mb-12">
                  <p class="text-slate-700 leading-relaxed whitespace-pre-wrap">{{ n.content }}</p>
                </div>

                @if (n.driveUrl) {
                  <a [href]="n.driveUrl" target="_blank" class="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all group">
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100">
                        <mat-icon>picture_as_pdf</mat-icon>
                      </div>
                      <div>
                        <p class="text-sm font-black text-slate-900">Download PDF Document</p>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Google Drive Access</p>
                      </div>
                    </div>
                    <mat-icon class="text-slate-300 group-hover:text-indigo-600 transition-colors">open_in_new</mat-icon>
                  </a>
                }

                @if (n.youtubeUrl) {
                  <div class="mt-8">
                    <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <mat-icon class="text-rose-600">play_circle</mat-icon>
                      Video Lesson
                    </h3>
                    <div class="aspect-video rounded-3xl overflow-hidden border border-slate-200 shadow-lg">
                      <iframe [src]="getSafeVideoUrl(n.youtubeUrl)" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                  </div>
                }
              }
            </div>
          </div>

          <!-- SEO Footer (Hidden but present for crawlers) -->
          <div class="opacity-0 h-0 overflow-hidden">
            <h2>{{ n.seoTitle }}</h2>
            <p>{{ n.seoDescription }}</p>
          </div>
        </div>
      } @else {
        <div class="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div class="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
            <mat-icon class="!w-10 !h-10 !text-[40px]">search_off</mat-icon>
          </div>
          <h2 class="text-2xl font-black text-slate-900 mb-2">Material Not Found</h2>
          <p class="text-slate-500 text-sm mb-8 max-w-xs">The resource you are looking for might have been moved or deleted.</p>
          <a routerLink="/notes" class="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-200">
            Browse Library
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class NoteDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private meta = inject(Meta);
  private titleService = inject(Title);
  private sanitizer = inject(DomSanitizer);
  authService = inject(AuthService);

  note = signal<Note | null>(null);
  isLoading = signal(true);

  async ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      const n = await this.dataService.getNoteBySlug(slug);
      if (n) {
        this.note.set(n);
        this.updateSEO(n);
      }
    }
    this.isLoading.set(false);
  }

  async shareNote() {
    const n = this.note();
    if (!n) return;

    const shareData = {
      title: n.seoTitle || n.title,
      text: n.seoDescription || `Check out ${n.title} on Educate MW!`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  }

  private updateSEO(note: Note) {
    const title = note.seoTitle || `${note.title} | Educate MW`;
    const description = note.seoDescription || `Download ${note.title} PDF. Malawian syllabus MSCE/JCE notes and past papers.`;

    this.titleService.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ name: 'keywords', content: `MSCE, PSLCE, MANEB, Malawi Curriculum, Secondary School, Malawian students, New Syllabus, ${note.category}, ${note.title}` });
  }

  toDate(date: unknown): Date | null {
    if (!date) return null;
    if (date && typeof date === 'object' && 'toDate' in date) {
      return (date as { toDate: () => Date }).toDate();
    }
    return new Date(date as string | number);
  }

  getSafeVideoUrl(url: string): SafeResourceUrl {
    if (!url) return this.sanitizer.bypassSecurityTrustResourceUrl('');
    
    // Improved extraction logic to match VideoLessonsComponent
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?v=)|(\?v=)|(&v=)|(shorts\/)|(live\/))([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[11] && match[11].length === 11) ? match[11] : '';
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
  }
}
