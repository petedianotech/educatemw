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
    <div class="flex flex-col h-full bg-gray-50">
      <header class="px-6 py-4 border-b-[4px] border-slate-200 bg-white z-10">
        <h2 class="text-xl font-black text-slate-900 flex items-center gap-2">
          <mat-icon class="text-emerald-500">library_books</mat-icon>
          Library & Past Papers
        </h2>
        <p class="text-sm text-slate-500 font-bold">Access study materials offline anytime</p>
      </header>

      <div class="flex-1 overflow-y-auto p-6">
        <div class="max-w-5xl mx-auto">
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (note of dataService.notes(); track note.id) {
              <div class="bg-white rounded-3xl border-2 border-slate-200 border-b-[6px] overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-200">
                <div class="h-32 bg-emerald-50 p-6 flex flex-col justify-between border-b-2 border-slate-100 relative">
                  @if (note.isProOnly) {
                    <div class="absolute top-3 right-3 bg-amber-100 text-amber-700 text-xs font-black px-2 py-1 rounded-lg border-2 border-amber-200 flex items-center gap-1">
                      <mat-icon class="text-[14px] !w-[14px] !h-[14px]">workspace_premium</mat-icon>
                      PRO
                    </div>
                  }
                  <span class="inline-block px-3 py-1 bg-white text-emerald-800 text-xs font-black rounded-xl border-2 border-emerald-200 w-fit">
                    {{note.category}}
                  </span>
                  <h3 class="font-black text-slate-900 text-lg line-clamp-2">{{note.title}}</h3>
                </div>
                <div class="p-5 flex-1 flex flex-col justify-between">
                  <p class="text-slate-500 text-sm font-bold line-clamp-3 mb-4">{{note.content}}</p>
                  
                  <div class="flex items-center justify-between mt-auto">
                    <span class="text-xs font-bold text-slate-400">{{getNoteDate(note.createdAt) | date:'mediumDate'}}</span>
                    
                    @if (note.isProOnly && !authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin') {
                      <button class="text-sm font-black text-amber-600 flex items-center gap-1 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border-2 border-amber-200">
                        <mat-icon class="text-sm">lock</mat-icon>
                        Unlock
                      </button>
                    } @else {
                      <button class="text-sm font-black text-emerald-600 flex items-center gap-1 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border-2 border-emerald-200">
                        Read <mat-icon class="text-sm">arrow_forward</mat-icon>
                      </button>
                    }
                  </div>
                </div>
              </div>
            } @empty {
              <div class="col-span-full text-center py-12 text-gray-500">
                <mat-icon class="!w-12 !h-12 !text-[48px] mb-4 opacity-50">menu_book</mat-icon>
                <p>No materials available yet.</p>
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

  getNoteDate(createdAt: any): Date | null {
    if (!createdAt) return null;
    if (createdAt instanceof Timestamp) return createdAt.toDate();
    if (createdAt instanceof Date) return createdAt;
    return new Date(createdAt);
  }
}
