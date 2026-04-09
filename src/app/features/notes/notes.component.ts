import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [MatIconModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full bg-gray-50">
      <header class="px-6 py-4 border-b border-gray-200 bg-white z-10">
        <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
          <mat-icon class="text-blue-500">library_books</mat-icon>
          Library & Past Papers
        </h2>
        <p class="text-sm text-gray-500">Access study materials offline anytime</p>
      </header>

      <div class="flex-1 overflow-y-auto p-6">
        <div class="max-w-5xl mx-auto">
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (note of dataService.notes(); track note.id) {
              <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div class="h-32 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex flex-col justify-between border-b border-gray-100 relative">
                  @if (note.isProOnly) {
                    <div class="absolute top-3 right-3 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                      <mat-icon class="text-[14px] !w-[14px] !h-[14px]">workspace_premium</mat-icon>
                      PRO
                    </div>
                  }
                  <span class="inline-block px-3 py-1 bg-white/60 text-blue-800 text-xs font-semibold rounded-full w-fit backdrop-blur-sm">
                    {{note.category}}
                  </span>
                  <h3 class="font-bold text-gray-900 text-lg line-clamp-2">{{note.title}}</h3>
                </div>
                <div class="p-5 flex-1 flex flex-col justify-between">
                  <p class="text-gray-500 text-sm line-clamp-3 mb-4">{{note.content}}</p>
                  
                  <div class="flex items-center justify-between mt-auto">
                    <span class="text-xs text-gray-400">{{note.createdAt?.toDate() | date:'mediumDate'}}</span>
                    
                    @if (note.isProOnly && !authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin') {
                      <button class="text-sm font-medium text-amber-600 flex items-center gap-1 hover:text-amber-700">
                        <mat-icon class="text-sm">lock</mat-icon>
                        Unlock
                      </button>
                    } @else {
                      <button class="text-sm font-medium text-blue-600 flex items-center gap-1 hover:text-blue-700">
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
}
