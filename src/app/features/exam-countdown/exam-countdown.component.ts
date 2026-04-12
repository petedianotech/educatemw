import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, CommonModule } from '@angular/common';
import { Timestamp } from 'firebase/firestore';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-exam-countdown',
  standalone: true,
  imports: [MatIconModule, DatePipe, CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 pb-24">
      <!-- Header -->
      <header class="bg-white px-6 py-8 border-b border-slate-200">
        <div class="max-w-4xl mx-auto flex items-center gap-4">
          <a routerLink="/dashboard" class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:scale-90 transition-all">
            <mat-icon class="text-[24px]">arrow_back</mat-icon>
          </a>
          <div class="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100">
            <mat-icon>timer</mat-icon>
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">Exam Countdown</h1>
            <p class="text-sm text-slate-500 font-medium">Stay ahead of your schedule</p>
          </div>
        </div>
      </header>

      <div class="max-w-4xl mx-auto p-6">
        @if (dataService.examDates().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (exam of dataService.examDates(); track exam.id) {
              <div class="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
                <!-- Decorative background -->
                <div class="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                
                <div class="relative z-10">
                  <div class="flex items-center justify-between mb-6">
                    <span class="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black rounded-full border border-rose-100 uppercase tracking-widest">
                      {{ getDaysRemaining(exam.date) }} Days Left
                    </span>
                    <mat-icon class="text-slate-200 group-hover:text-rose-200 transition-colors">event</mat-icon>
                  </div>

                  <h3 class="text-xl font-black text-slate-900 mb-2">{{ exam.subject }}</h3>
                  <p class="text-sm text-slate-500 font-medium mb-6">{{ exam.description || 'MSCE Final Examination' }}</p>

                  <div class="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="flex flex-col items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100">
                      <span class="text-xs font-black text-rose-600 leading-none">{{ toDate(exam.date) | date:'MMM' }}</span>
                      <span class="text-lg font-black text-slate-900 leading-none">{{ toDate(exam.date) | date:'dd' }}</span>
                    </div>
                    <div class="flex flex-col">
                      <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Exam Date</span>
                      <span class="text-sm font-black text-slate-900">{{ toDate(exam.date) | date:'fullDate' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-20 bg-white rounded-[3rem] border border-slate-200 border-dashed">
            <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <mat-icon class="!w-10 !h-10 !text-[40px]">event_busy</mat-icon>
            </div>
            <h3 class="text-xl font-black text-slate-900 mb-2">No Exams Scheduled</h3>
            <p class="text-slate-500 font-medium max-w-xs mx-auto">Check back later for the official MSCE examination timetable.</p>
          </div>
        }
      </div>
    </div>
  `
})
export class ExamCountdownComponent implements OnInit, OnDestroy {
  dataService = inject(DataService);

  ngOnInit() {
    this.dataService.subscribeToExamDates();
  }

  ngOnDestroy() {
    this.dataService.unsubscribeFromExamDates();
  }

  toDate(date: Date | Timestamp | string | null): Date | null {
    if (!date) return null;
    if (date instanceof Timestamp) return date.toDate();
    if (date instanceof Date) return date;
    return new Date(date);
  }

  getDaysRemaining(date: Date | Timestamp | string | null): number {
    const examDate = this.toDate(date);
    if (!examDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }
}
