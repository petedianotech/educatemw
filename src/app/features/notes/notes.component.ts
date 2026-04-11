import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [MatIconModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full bg-slate-50 relative">
      <!-- Premium Header -->
      <div class="absolute top-0 left-0 right-0 h-56 bg-gradient-to-r from-sky-600 to-blue-600 rounded-b-[2.5rem] shadow-md z-0">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 rounded-b-[2.5rem]"></div>
      </div>

      <div class="relative z-10 p-6 md:p-8 flex-1 overflow-y-auto">
        <div class="max-w-5xl mx-auto">
          
          <div class="flex items-center gap-4 mb-10 mt-2">
            <div class="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg">
              <mat-icon class="!w-8 !h-8 !text-[32px]">library_books</mat-icon>
            </div>
            <div>
              <h1 class="text-3xl font-black text-white tracking-tight">Library</h1>
              <p class="text-sky-100 font-medium text-sm mt-1">Past papers & study notes</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (note of dataService.notes(); track note.id) {
              <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 flex flex-col hover:shadow-xl hover:shadow-sky-500/10 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-sky-100 transition-colors"></div>
                
                <div class="relative z-10 flex-1">
                  <div class="flex justify-between items-start mb-4">
                    <span class="inline-flex items-center px-3 py-1 bg-sky-50 text-sky-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-sky-100">
                      {{note.category}}
                    </span>
                    @if (note.isProOnly) {
                      <div class="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <mat-icon class="!w-3 !h-3 !text-[12px]">workspace_premium</mat-icon>
                        PRO
                      </div>
                    }
                  </div>
                  
                  <h3 class="font-black text-xl text-slate-900 mb-3 tracking-tight line-clamp-2 group-hover:text-sky-600 transition-colors">{{note.title}}</h3>
                  <p class="text-slate-500 text-sm font-medium line-clamp-3 mb-6">{{note.content}}</p>
                </div>
                
                <div class="relative z-10 flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                  <span class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{{getNoteDate(note.createdAt) | date:'mediumDate'}}</span>
                  
                  @if (note.isProOnly && !authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin') {
                    <button class="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-200 transition-colors">
                      <mat-icon class="!w-5 !h-5 !text-[20px]">lock</mat-icon>
                    </button>
                  } @else {
                    <button class="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-all shadow-sm">
                      <mat-icon class="!w-5 !h-5 !text-[20px]">arrow_forward</mat-icon>
                    </button>
                  }
                </div>
              </div>
            } @empty {
              <div class="col-span-full text-center py-20 bg-white rounded-[2rem] border border-slate-200 border-dashed">
                <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <mat-icon class="!w-10 !h-10 !text-[40px] text-slate-300">menu_book</mat-icon>
                </div>
                <h3 class="text-lg font-black text-slate-900 mb-1">No Materials Yet</h3>
                <p class="text-slate-500 font-medium text-sm">Check back later for new study resources.</p>
              </div>
            }
          </div>

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
