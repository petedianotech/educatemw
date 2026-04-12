import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { Timestamp } from 'firebase/firestore';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [MatIconModule, DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full bg-slate-50 overflow-hidden relative">
      <!-- Header -->
      <div class="bg-gradient-to-r from-sky-600 to-blue-600 px-4 py-6 shrink-0 relative z-10 shadow-md">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div class="flex items-center gap-3 relative z-10">
          <a routerLink="/dashboard" class="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white active:scale-90 transition-all mr-1 backdrop-blur-md">
            <mat-icon class="text-[22px]">arrow_back</mat-icon>
          </a>
          <div class="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg">
            <mat-icon class="!w-6 !h-6 !text-[24px]">library_books</mat-icon>
          </div>
          <div>
            <h1 class="text-xl font-black text-white tracking-tight leading-none">Library</h1>
            <p class="text-sky-100 font-medium text-[11px] mt-1">Past papers & study notes</p>
          </div>
        </div>
      </div>

      <!-- Scrollable List -->
      <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div class="flex flex-col gap-4 max-w-2xl mx-auto">
          @for (note of dataService.notes(); track note.id) {
            <div class="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md border border-slate-200/80 flex items-center gap-4 active:scale-[0.98] transition-all relative overflow-hidden group">
              <div class="absolute inset-0 bg-gradient-to-br from-transparent to-sky-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <!-- Icon -->
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/30 relative z-10">
                <mat-icon class="!w-7 !h-7 !text-[28px]">description</mat-icon>
              </div>
              
              <!-- Content -->
              <div class="flex-1 min-w-0 relative z-10">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[10px] font-black text-sky-600 uppercase tracking-widest bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                    {{note.category}}
                  </span>
                  @if (note.isProOnly) {
                    <span class="text-[10px] font-black text-white uppercase tracking-widest bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 rounded-md shadow-sm flex items-center gap-0.5">
                      <mat-icon class="!w-3 !h-3 !text-[12px]">workspace_premium</mat-icon> PRO
                    </span>
                  }
                </div>
                <h3 class="font-bold text-base text-slate-900 truncate">{{note.title}}</h3>
                <p class="text-slate-500 text-xs truncate mt-0.5">{{note.content}}</p>
              </div>
              
              <!-- Action Button -->
              <div class="shrink-0 relative z-10">
                @if (note.isProOnly && !authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin') {
                  <button class="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
                    <mat-icon class="!w-5 !h-5 !text-[20px]">lock</mat-icon>
                  </button>
                } @else {
                  <button class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors shadow-sm">
                    <mat-icon class="!w-5 !h-5 !text-[20px]">arrow_forward</mat-icon>
                  </button>
                }
              </div>
            </div>
          } @empty {
            <div class="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
              <div class="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <mat-icon class="!w-7 !h-7 !text-[28px] text-slate-300">menu_book</mat-icon>
              </div>
              <h3 class="text-base font-black text-slate-900 mb-1">No Materials Yet</h3>
              <p class="text-slate-500 font-medium text-xs">Check back later for resources.</p>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class NotesComponent implements OnInit, OnDestroy {
  dataService = inject(DataService);
  authService = inject(AuthService);

  ngOnInit() {
    this.dataService.subscribeToNotes();
  }

  ngOnDestroy() {
    this.dataService.unsubscribeFromNotes();
  }

  getNoteDate(createdAt: unknown): Date | null {
    if (!createdAt) return null;
    if (createdAt instanceof Timestamp) return createdAt.toDate();
    if (createdAt instanceof Date) return createdAt;
    return new Date(createdAt as string | number);
  }
}
