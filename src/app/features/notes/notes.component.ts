import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, PLATFORM_ID } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { Timestamp } from 'firebase/firestore';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [MatIconModule, RouterLink, CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden relative transition-colors duration-500">
      <!-- Header -->
      <div class="bg-slate-950 px-6 py-6 shrink-0 relative z-10 shadow-lg">
        <div class="max-w-7xl mx-auto">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-4">
              <a routerLink="/dashboard" class="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white active:scale-90 transition-all border border-white/10">
                <mat-icon>arrow_back</mat-icon>
              </a>
              <div>
                <h1 class="text-2xl font-black text-white tracking-tight">Study Library</h1>
              </div>
            </div>
          </div>

          <!-- Compact Filter Bar -->
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            <select [ngModel]="selectedLevel()" (ngModelChange)="selectedLevel.set($event)" class="bg-white/10 border border-white/10 rounded-lg text-white font-bold text-xs p-2 outline-none">
                <option value="All" class="bg-slate-950">All Levels</option>
                <option value="Secondary" class="bg-slate-950">Secondary</option>
                <option value="Primary" class="bg-slate-950">Primary</option>
            </select>
            <select [ngModel]="selectedSubject()" (ngModelChange)="selectedSubject.set($event); currentPage.set(1)" class="bg-white/10 border border-white/10 rounded-lg text-white font-bold text-xs p-2 outline-none">
                <option value="All" class="bg-slate-950">All Subjects</option>
                @for (subject of subjects; track subject) {
                    <option [value]="subject" class="bg-slate-950">{{ subject }}</option>
                }
            </select>
            <select [ngModel]="selectedForm()" (ngModelChange)="selectedForm.set($event); currentPage.set(1)" class="bg-white/10 border border-white/10 rounded-lg text-white font-bold text-xs p-2 outline-none">
              <option value="All" class="bg-slate-950">All Classes</option>
              @if (selectedLevel() === 'Secondary') {
                <option value="Form 1" class="bg-slate-950">Form 1</option>
                <option value="Form 2" class="bg-slate-950">Form 2</option>
                <option value="Form 3" class="bg-slate-950">Form 3</option>
                <option value="Form 4" class="bg-slate-950">Form 4</option>
              } @else if (selectedLevel() === 'Primary') {
                <option value="Standard 1" class="bg-slate-950">Standard 1</option>
                <option value="Standard 2" class="bg-slate-950">Standard 2</option>
                <option value="Standard 3" class="bg-slate-950">Standard 3</option>
                <option value="Standard 4" class="bg-slate-950">Standard 4</option>
                <option value="Standard 5" class="bg-slate-950">Standard 5</option>
                <option value="Standard 6" class="bg-slate-950">Standard 6</option>
                <option value="Standard 7" class="bg-slate-950">Standard 7</option>
                <option value="Standard 8" class="bg-slate-950">Standard 8</option>
              }
            </select>
            <select [ngModel]="selectedAccess()" (ngModelChange)="selectedAccess.set($event)" class="bg-white/10 border border-white/10 rounded-lg text-white font-bold text-xs p-2 outline-none">
                <option value="All" class="bg-slate-950">All Access</option>
                <option value="Free" class="bg-slate-950">Free</option>
                <option value="Pro" class="bg-slate-950">Pro</option>
            </select>
            <select [ngModel]="sortBy()" (ngModelChange)="sortBy.set($event)" class="bg-white/10 border border-white/10 rounded-lg text-white font-bold text-xs p-2 outline-none">
                <option value="newest" class="bg-slate-950">Newest</option>
                <option value="oldest" class="bg-slate-950">Oldest</option>
                <option value="title" class="bg-slate-950">Title</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
        <div class="max-w-7xl mx-auto">
          
          <div class="flex flex-col gap-4">
            @for (note of paginatedNotes(); track note.id; let i = $index) {
              
              <div class="bg-white dark:bg-slate-950 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center gap-6 hover:shadow-xl hover:shadow-indigo-200/30 dark:hover:shadow-none transition-all duration-300 group relative overflow-hidden">
                
                <!-- Pro Badge -->
                @if (note.isProOnly) {
                  <div class="absolute top-4 right-4 z-20">
                    <div class="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2.5 py-1 rounded-full shadow-lg shadow-amber-100 dark:shadow-none flex items-center gap-1">
                      <mat-icon class="!w-3 !h-3 !text-[10px]">workspace_premium</mat-icon>
                      <span class="text-[8px] font-black uppercase tracking-widest">PRO</span>
                    </div>
                  </div>
                }

                <!-- Icon -->
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100 dark:shadow-none group-hover:scale-105 transition-transform duration-500">
                  <mat-icon class="!w-8 !h-8 !text-[32px]">description</mat-icon>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-3 mb-2">
                    <span class="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded-full transition-colors">
                      {{note.category}}
                    </span>
                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {{getNoteDate(note.createdAt) | date:'MMM d, yyyy'}}
                    </span>
                  </div>
                  
                  <h3 class="font-black text-lg text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate mb-1">{{note.title}}</h3>
                  
                  <div class="flex flex-wrap gap-2 mb-2">
                    @if (note.level) {
                      <span class="text-[9px] font-black text-indigo-400 dark:text-indigo-300 uppercase tracking-widest">{{note.level}}</span>
                    }
                    @if (note.form) {
                      <span class="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">• {{note.form}}</span>
                    }
                  </div>

                  <p class="text-slate-500 dark:text-slate-400 text-xs font-medium line-clamp-1 leading-relaxed">
                    {{note.content || 'Comprehensive study material for ' + note.category + '. Master your exams with our curated resources.'}}
                  </p>
                </div>

                <!-- Action Button -->
                <div class="shrink-0 w-full md:w-auto">
                  @if (note.isProOnly && !authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin') {
                    <a routerLink="/upgrade" class="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-100 dark:shadow-none flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
                      <mat-icon class="!w-4 !h-4 !text-[16px]">bolt</mat-icon>
                      Unlock
                    </a>
                  } @else {
                    <a [routerLink]="['/books', note.slug || note.id]" class="px-6 py-3 bg-slate-900 dark:bg-indigo-950 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200 dark:shadow-none flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-indigo-900 transition-all">
                      <mat-icon class="!w-4 !h-4 !text-[16px]">visibility</mat-icon>
                      View
                    </a>
                  }
                </div>
              </div>
            } @empty {
              <div class="col-span-full text-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-100 dark:border-white/5 border-dashed transition-colors duration-500">
                <div class="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <mat-icon class="!w-12 !h-12 !text-[48px] text-slate-200 dark:text-slate-700">menu_book</mat-icon>
                </div>
                <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-2">No Materials Found</h3>
                <p class="text-slate-500 dark:text-slate-400 font-medium">Try adjusting your filters or check back later.</p>
              </div>
            }
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="mt-16 flex items-center justify-center gap-4 mb-20">
              <button (click)="currentPage.set(currentPage() - 1)" [disabled]="currentPage() === 1"
                      class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-lg dark:shadow-none border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition-all active:scale-90">
                <mat-icon>chevron_left</mat-icon>
              </button>
              
              <div class="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar max-w-[200px] sm:max-w-none">
                @for (p of [].constructor(totalPages()); track $index) {
                  <button (click)="currentPage.set($index + 1)"
                          [class]="$index + 1 === currentPage() ? 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none' : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'"
                          class="w-12 h-12 rounded-2xl font-black text-sm shadow-lg dark:shadow-none border border-slate-100 dark:border-white/5 transition-all shrink-0">
                    {{ $index + 1 }}
                  </button>
                }
              </div>

              <button (click)="currentPage.set(currentPage() + 1)" [disabled]="currentPage() === totalPages()"
                      class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-lg dark:shadow-none border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 transition-all active:scale-90">
                <mat-icon>chevron_right</mat-icon>
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class NotesComponent implements OnInit {
  dataService = inject(DataService);
  authService = inject(AuthService);
  Math = Math;

  selectedSubject = signal('All');
  selectedLevel = signal('All');
  selectedForm = signal('All');
  selectedAccess = signal('All');
  sortBy = signal('newest');
  currentPage = signal(1);
  pageSize = 20;

  subjects = [
    'Mathematics', 'English', 'Biology', 'Chemistry', 'Physics', 
    'Agriculture', 'Geography', 'History', 'Social and Life Skills', 
    'Chichewa', 'Computer Studies', 'Home Economics', 'Bible Knowledge'
  ];

  allNotes = computed(() => {
    return this.dataService.notes().filter(note => 
      note.destination === 'notes' || note.destination === 'past-papers' || !(note.destination)
    );
  });

  filteredNotes = computed(() => {
    let notes = [...this.allNotes()];

    // Filter by subject
    if (this.selectedSubject() !== 'All') {
      notes = notes.filter(n => n.category === this.selectedSubject());
    }

    // Filter by level
    if (this.selectedLevel() !== 'All') {
      notes = notes.filter(n => n.level === this.selectedLevel());
    }

    // Filter by form
    if (this.selectedForm() !== 'All') {
      notes = notes.filter(n => n.form === this.selectedForm());
    }

    // Filter by access
    if (this.selectedAccess() !== 'All') {
      const isPro = this.selectedAccess() === 'Pro';
      notes = notes.filter(n => n.isProOnly === isPro);
    }

    // Sort
    notes.sort((a, b) => {
      if (this.sortBy() === 'newest') {
        return this.getNoteDate(b.createdAt)!.getTime() - this.getNoteDate(a.createdAt)!.getTime();
      } else if (this.sortBy() === 'oldest') {
        return this.getNoteDate(a.createdAt)!.getTime() - this.getNoteDate(b.createdAt)!.getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    return notes;
  });

  totalPages = computed(() => Math.ceil(this.filteredNotes().length / this.pageSize));

  paginatedNotes = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredNotes().slice(start, start + this.pageSize);
  });

  isNative = signal(false);
  platformId = inject(PLATFORM_ID);

  ngOnInit() {
    this.isNative.set(isPlatformBrowser(this.platformId) && Capacitor.isNativePlatform());
    this.dataService.subscribeToNotes();
  }

  getNoteDate(createdAt: unknown): Date | null {
    if (!createdAt) return new Date();
    if (createdAt instanceof Timestamp) return createdAt.toDate();
    if (createdAt instanceof Date) return createdAt;
    return new Date(createdAt as string | number);
  }
}
