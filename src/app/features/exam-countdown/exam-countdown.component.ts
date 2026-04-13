import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, CommonModule } from '@angular/common';
import { Timestamp } from 'firebase/firestore';
import { RouterLink } from '@angular/router';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  selector: 'app-exam-countdown',
  standalone: true,
  imports: [MatIconModule, DatePipe, CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full overflow-y-auto bg-slate-50 pb-24 custom-scrollbar">
      <!-- Header -->
      <header class="bg-white px-6 py-8 border-b border-slate-200 sticky top-0 z-50">
        <div class="max-w-4xl mx-auto flex items-center gap-4">
          <a routerLink="/dashboard" class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:scale-90 transition-all">
            <mat-icon class="text-[24px]">arrow_back</mat-icon>
          </a>
          <div class="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <mat-icon>timer</mat-icon>
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">Exam Countdown</h1>
            <p class="text-sm text-slate-500 font-medium">Official MANEB 2026 Schedule</p>
          </div>
        </div>
      </header>

      <div class="max-w-4xl mx-auto p-6 space-y-12">
        <!-- Official MANEB Schedule -->
        <section>
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-3">
              <div class="w-2 h-8 bg-blue-600 rounded-full"></div>
              <h2 class="text-xl font-black text-slate-900 uppercase tracking-tight">National Examinations 2026</h2>
            </div>
            <span class="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-blue-100">
              Official MANEB
            </span>
          </div>
          
          <div class="grid grid-cols-1 gap-8">
            @for (exam of officialExams; track exam.name) {
              <div class="bg-white rounded-[3rem] p-8 md:p-10 shadow-2xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden group">
                <!-- Decorative background -->
                <div class="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-40 group-hover:scale-125 transition-transform duration-1000"></div>
                
                <div class="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
                  <!-- Left Side: Icon & Title -->
                  <div class="flex-1">
                    <div class="flex items-center gap-4 mb-4">
                      <div class="w-16 h-16 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center shadow-lg shadow-blue-100">
                        <mat-icon class="!w-8 !h-8 !text-[32px]">{{ exam.icon }}</mat-icon>
                      </div>
                      <div>
                        <h3 class="text-3xl font-black text-slate-900 tracking-tighter">{{ exam.name }}</h3>
                        <p class="text-xs font-black text-blue-600 uppercase tracking-widest">{{ exam.fullName }}</p>
                      </div>
                    </div>
                    <p class="text-sm text-slate-500 font-medium max-w-sm">
                      Official 2026 examination period: {{ exam.period }}. Prepare early to excel!
                    </p>
                  </div>

                  <!-- Right Side: Countdown Timer -->
                  <div class="flex-1">
                    <div class="grid grid-cols-4 gap-3">
                      @let timeLeft = getTimeLeft(exam.date);
                      <div class="flex flex-col items-center p-3 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm">
                        <span class="text-2xl font-black text-blue-900 leading-none">{{ timeLeft.days }}</span>
                        <span class="text-[8px] font-black text-blue-400 uppercase tracking-widest mt-1">Days</span>
                      </div>
                      <div class="flex flex-col items-center p-3 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm">
                        <span class="text-2xl font-black text-blue-900 leading-none">{{ timeLeft.hours | number:'2.0' }}</span>
                        <span class="text-[8px] font-black text-blue-400 uppercase tracking-widest mt-1">Hrs</span>
                      </div>
                      <div class="flex flex-col items-center p-3 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm">
                        <span class="text-2xl font-black text-blue-900 leading-none">{{ timeLeft.minutes | number:'2.0' }}</span>
                        <span class="text-[8px] font-black text-blue-400 uppercase tracking-widest mt-1">Min</span>
                      </div>
                      <div class="flex flex-col items-center p-3 bg-blue-600 rounded-2xl border border-blue-500 shadow-lg shadow-blue-200">
                        <span class="text-2xl font-black text-white leading-none">{{ timeLeft.seconds | number:'2.0' }}</span>
                        <span class="text-[8px] font-black text-blue-100 uppercase tracking-widest mt-1">Sec</span>
                      </div>
                    </div>
                    
                    <div class="mt-6 flex items-center justify-between px-2">
                      <div class="flex items-center gap-2">
                        <mat-icon class="text-blue-300 text-sm">calendar_today</mat-icon>
                        <span class="text-xs font-black text-slate-900">{{ exam.date | date:'fullDate' }}</span>
                      </div>
                      <div class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- Custom/Subject Specific Exams -->
        @if (dataService.examDates().length > 0) {
          <section>
            <div class="flex items-center gap-3 mb-6">
              <div class="w-2 h-8 bg-indigo-600 rounded-full"></div>
              <h2 class="text-xl font-black text-slate-900 uppercase tracking-tight">Subject Timetable 2026</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              @for (exam of dataService.examDates(); track exam.id) {
                <div class="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden group">
                  <div class="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                  
                  <div class="relative z-10">
                    <div class="flex items-center justify-between mb-6">
                      <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <span class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Subject Exam</span>
                      </div>
                      <mat-icon class="text-slate-200 group-hover:text-indigo-200 transition-colors">event</mat-icon>
                    </div>

                    <h3 class="text-2xl font-black text-slate-900 mb-2">{{ exam.subject }}</h3>
                    <p class="text-sm text-slate-500 font-medium mb-8">{{ exam.description || '2026 Examination' }}</p>

                    <div class="grid grid-cols-4 gap-2 mb-6">
                      @let timeLeft = getTimeLeft(exam.date);
                      <div class="flex flex-col items-center p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <span class="text-lg font-black text-slate-900">{{ timeLeft.days }}</span>
                        <span class="text-[7px] font-black text-slate-400 uppercase">Days</span>
                      </div>
                      <div class="flex flex-col items-center p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <span class="text-lg font-black text-slate-900">{{ timeLeft.hours | number:'2.0' }}</span>
                        <span class="text-[7px] font-black text-slate-400 uppercase">Hrs</span>
                      </div>
                      <div class="flex flex-col items-center p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <span class="text-lg font-black text-slate-900">{{ timeLeft.minutes | number:'2.0' }}</span>
                        <span class="text-[7px] font-black text-slate-400 uppercase">Min</span>
                      </div>
                      <div class="flex flex-col items-center p-2 bg-indigo-600 rounded-xl border border-indigo-500 shadow-lg shadow-indigo-100">
                        <span class="text-lg font-black text-white">{{ timeLeft.seconds | number:'2.0' }}</span>
                        <span class="text-[7px] font-black text-indigo-100 uppercase">Sec</span>
                      </div>
                    </div>

                    <div class="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div class="flex flex-col items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100">
                        <span class="text-xs font-black text-indigo-600 leading-none">{{ toDate(exam.date) | date:'MMM' }}</span>
                        <span class="text-lg font-black text-slate-900 leading-none">{{ toDate(exam.date) | date:'dd' }}</span>
                      </div>
                      <div class="flex flex-col">
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Exam Date</span>
                        <span class="text-sm font-black text-slate-900">{{ toDate(exam.date) | date:'fullDate' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </section>
        }
      </div>
    </div>
  `,
})
export class ExamCountdownComponent implements OnInit, OnDestroy {
  dataService = inject(DataService);
  currentTime = signal(Date.now());
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  officialExams = [
    {
      name: 'MSCE',
      fullName: 'Malawi School Certificate',
      date: new Date('2026-06-29T08:00:00'),
      period: '29 June - 24 July',
      icon: 'workspace_premium'
    },
    {
      name: 'JCE',
      fullName: 'Junior Certificate of Education',
      date: new Date('2026-06-01T08:00:00'),
      period: '1 June - 10 June',
      icon: 'history_edu'
    },
    {
      name: 'PSLCE',
      fullName: 'Primary School Leaving Certificate',
      date: new Date('2026-06-08T08:00:00'),
      period: '8 June - 10 June',
      icon: 'school'
    }
  ];

  ngOnInit() {
    this.dataService.subscribeToExamDates();
    this.timerInterval = setInterval(() => {
      this.currentTime.set(Date.now());
    }, 1000);
  }

  ngOnDestroy() {
    this.dataService.unsubscribeFromExamDates();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  toDate(date: Date | Timestamp | string | null): Date | null {
    if (!date) return null;
    if (date instanceof Timestamp) return date.toDate();
    if (date instanceof Date) return date;
    return new Date(date);
  }

  getTimeLeft(targetDate: Date | Timestamp | string | null): TimeLeft {
    const examDate = this.toDate(targetDate);
    if (!examDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const diff = examDate.getTime() - this.currentTime();
    
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60)
    };
  }

  getDaysRemaining(date: Date | Timestamp | string | null): number {
    return this.getTimeLeft(date).days;
  }
}
