import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { Timestamp } from 'firebase/firestore';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [MatIconModule, RouterLink, CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-screen bg-slate-50 overflow-hidden relative">
      <!-- Header -->
      <div class="bg-slate-950 px-6 py-8 shrink-0 relative z-10 shadow-2xl">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div class="flex items-center gap-4">
            <a routerLink="/dashboard" class="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white active:scale-90 transition-all backdrop-blur-md border border-white/10">
              <mat-icon>arrow_back</mat-icon>
            </a>
            <div>
              <h1 class="text-3xl font-black text-white tracking-tight leading-none">Study Library</h1>
              <p class="text-indigo-300 font-bold text-xs mt-2 uppercase tracking-widest">Malawi's Premium Resource Hub</p>
            </div>
          </div>

          <!-- Filters -->
          <div class="flex flex-wrap items-center gap-3">
            <div class="relative">
              <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 scale-75">filter_list</mat-icon>
              <select [ngModel]="selectedSubject()" (ngModelChange)="selectedSubject.set($event); currentPage.set(1)" 
                      class="pl-10 pr-8 py-3 bg-white/10 border border-white/10 rounded-xl text-white font-bold text-sm outline-none focus:bg-white/20 transition-all appearance-none">
                <option value="All">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Biology">Biology</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="English">English</option>
                <option value="History">History</option>
                <option value="Geography">Geography</option>
                <option value="Agriculture">Agriculture</option>
              </select>
            </div>
            
            <div class="relative">
              <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 scale-75">sort</mat-icon>
              <select [ngModel]="sortBy()" (ngModelChange)="sortBy.set($event)" 
                      class="pl-10 pr-8 py-3 bg-white/10 border border-white/10 rounded-xl text-white font-bold text-sm outline-none focus:bg-white/20 transition-all appearance-none">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
        <div class="max-w-7xl mx-auto">
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            @for (note of paginatedNotes(); track note.id) {
              <div class="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col hover:shadow-2xl hover:shadow-indigo-200/40 transition-all duration-500 group relative overflow-hidden">
                
                <!-- Pro Badge -->
                @if (note.isProOnly) {
                  <div class="absolute top-6 right-6 z-20">
                    <div class="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full shadow-lg shadow-amber-200 flex items-center gap-1 animate-pulse">
                      <mat-icon class="!w-3 !h-3 !text-[12px]">workspace_premium</mat-icon>
                      <span class="text-[9px] font-black uppercase tracking-widest">PRO</span>
                    </div>
                  </div>
                }

                <!-- Category & Date -->
                <div class="flex items-center justify-between mb-6">
                  <span class="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                    {{note.category}}
                  </span>
                  <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {{getNoteDate(note.createdAt) | date:'MMM d, yyyy'}}
                  </span>
                </div>

                <!-- Icon & Title -->
                <div class="flex items-start gap-4 mb-6">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-500">
                    <mat-icon class="!w-7 !h-7 !text-[28px]">description</mat-icon>
                  </div>
                  <div class="min-w-0">
                    <h3 class="font-black text-lg text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{{note.title}}</h3>
                  </div>
                </div>

                <p class="text-slate-500 text-sm font-medium line-clamp-3 mb-8 flex-1 leading-relaxed">
                  {{note.content || 'Comprehensive study material for ' + note.category + '. Master your exams with our curated resources.'}}
                </p>

                <!-- Footer Action -->
                <div class="pt-6 border-t border-slate-50 mt-auto">
                  @if (note.isProOnly && !authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin') {
                    <a routerLink="/upgrade" class="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
                      <mat-icon class="text-sm">bolt</mat-icon>
                      Upgrade to Unlock
                    </a>
                  } @else {
                    <a [href]="note.driveUrl" target="_blank" class="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all">
                      <mat-icon class="text-sm">visibility</mat-icon>
                      View Resource
                    </a>
                  }
                </div>

                <!-- Decorative background -->
                <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-150 -z-10"></div>
              </div>
            } @empty {
              <div class="col-span-full text-center py-32 bg-white rounded-[3rem] border-2 border-slate-100 border-dashed">
                <div class="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <mat-icon class="!w-12 !h-12 !text-[48px] text-slate-200">menu_book</mat-icon>
                </div>
                <h3 class="text-2xl font-black text-slate-900 mb-2">No Materials Found</h3>
                <p class="text-slate-500 font-medium">Try adjusting your filters or check back later.</p>
              </div>
            }
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="mt-16 flex items-center justify-center gap-4">
              <button (click)="currentPage.set(currentPage() - 1)" [disabled]="currentPage() === 1"
                      class="w-12 h-12 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center text-slate-900 hover:bg-slate-50 disabled:opacity-30 transition-all active:scale-90">
                <mat-icon>chevron_left</mat-icon>
              </button>
              
              <div class="flex items-center gap-2">
                @for (p of [].constructor(totalPages()); track $index) {
                  <button (click)="currentPage.set($index + 1)"
                          [class]="$index + 1 === currentPage() ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-slate-400 hover:text-slate-900'"
                          class="w-12 h-12 rounded-2xl font-black text-sm shadow-lg border border-slate-100 transition-all">
                    {{ $index + 1 }}
                  </button>
                }
              </div>

              <button (click)="currentPage.set(currentPage() + 1)" [disabled]="currentPage() === totalPages()"
                      class="w-12 h-12 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center text-slate-900 hover:bg-slate-50 disabled:opacity-30 transition-all active:scale-90">
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
  sortBy = signal('newest');
  currentPage = signal(1);
  pageSize = 20;

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

  ngOnInit() {
    this.dataService.subscribeToNotes();
  }

  getNoteDate(createdAt: unknown): Date | null {
    if (!createdAt) return new Date();
    if (createdAt instanceof Timestamp) return createdAt.toDate();
    if (createdAt instanceof Date) return createdAt;
    return new Date(createdAt as string | number);
  }
}
