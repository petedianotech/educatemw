import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService, Quiz, QuizQuestion, Note } from '../../core/services/data.service';
import { Timestamp } from 'firebase/firestore';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, DecimalPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, MatIconModule, DatePipe, DecimalPipe, CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex h-screen bg-slate-50 overflow-hidden">
      <!-- Admin Sidebar -->
      <aside class="bg-slate-900 text-white flex flex-col shrink-0 z-30 transition-all duration-300"
             [class.w-64]="isSidebarOpen()"
             [class.w-0]="!isSidebarOpen()"
             [class.opacity-0]="!isSidebarOpen()"
             [class.overflow-hidden]="!isSidebarOpen()">
        <div class="p-6 border-b border-slate-800 flex items-center justify-between w-64">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <mat-icon>security</mat-icon>
            </div>
            <div>
              <h1 class="text-lg font-black tracking-tight leading-none">Admin</h1>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Control Center</p>
            </div>
          </div>
          <button (click)="isSidebarOpen.set(false)" class="text-slate-400 hover:text-white">
            <mat-icon>chevron_left</mat-icon>
          </button>
        </div>

        <nav class="flex-1 p-4 space-y-2 overflow-y-auto w-64 custom-scrollbar">
            <button (click)="activeTab.set('overview'); isSidebarOpen.set(false)" 
                    [class.bg-gradient-to-r]="activeTab() === 'overview'"
                    [class.from-indigo-500]="activeTab() === 'overview'"
                    [class.to-blue-600]="activeTab() === 'overview'"
                    [class.text-white]="activeTab() === 'overview'"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all font-bold text-sm">
              <mat-icon>dashboard</mat-icon>
              <span>Overview</span>
            </button>

            <div class="pt-4 pb-2 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Content</div>
            
            <button (click)="activeTab.set('upload'); isSidebarOpen.set(false)" 
                    [class.bg-gradient-to-r]="activeTab() === 'upload'"
                    [class.from-emerald-400]="activeTab() === 'upload'"
                    [class.to-teal-600]="activeTab() === 'upload'"
                    [class.text-white]="activeTab() === 'upload'"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all font-bold text-sm">
              <mat-icon>library_add</mat-icon>
              <span>Upload Material</span>
            </button>

            <button (click)="activeTab.set('manage'); isSidebarOpen.set(false)" 
                    [class.bg-gradient-to-r]="activeTab() === 'manage'"
                    [class.from-sky-400]="activeTab() === 'manage'"
                    [class.to-blue-600]="activeTab() === 'manage'"
                    [class.text-white]="activeTab() === 'manage'"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all font-bold text-sm">
              <mat-icon>folder_managed</mat-icon>
              <span>Manage Library</span>
            </button>

            <button (click)="activeTab.set('quizzes'); isSidebarOpen.set(false)" 
                    [class.bg-gradient-to-r]="activeTab() === 'quizzes'"
                    [class.from-amber-400]="activeTab() === 'quizzes'"
                    [class.to-orange-600]="activeTab() === 'quizzes'"
                    [class.text-white]="activeTab() === 'quizzes'"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all font-bold text-sm">
              <mat-icon>quiz</mat-icon>
              <span>Quizzes</span>
            </button>

            <button (click)="activeTab.set('exams'); isSidebarOpen.set(false)" 
                    [class.bg-gradient-to-r]="activeTab() === 'exams'"
                    [class.from-rose-400]="activeTab() === 'exams'"
                    [class.to-pink-600]="activeTab() === 'exams'"
                    [class.text-white]="activeTab() === 'exams'"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all font-bold text-sm">
              <mat-icon>event</mat-icon>
              <span>Exam Dates</span>
            </button>

            <div class="pt-4 pb-2 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Users & Stats</div>

            <button (click)="activeTab.set('students'); isSidebarOpen.set(false)" 
                    [class.bg-gradient-to-r]="activeTab() === 'students'"
                    [class.from-purple-400]="activeTab() === 'students'"
                    [class.to-indigo-600]="activeTab() === 'students'"
                    [class.text-white]="activeTab() === 'students'"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all font-bold text-sm">
              <mat-icon>people</mat-icon>
              <span>Students</span>
            </button>

            <button (click)="activeTab.set('revenue'); isSidebarOpen.set(false)" 
                    [class.bg-gradient-to-r]="activeTab() === 'revenue'"
                    [class.from-emerald-500]="activeTab() === 'revenue'"
                    [class.to-green-700]="activeTab() === 'revenue'"
                    [class.text-white]="activeTab() === 'revenue'"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all font-bold text-sm">
              <mat-icon>payments</mat-icon>
              <span>Revenue</span>
            </button>

            <button (click)="activeTab.set('updates'); isSidebarOpen.set(false)" 
                    [class.bg-gradient-to-r]="activeTab() === 'updates'"
                    [class.from-slate-600]="activeTab() === 'updates'"
                    [class.to-slate-800]="activeTab() === 'updates'"
                    [class.text-white]="activeTab() === 'updates'"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all font-bold text-sm">
              <mat-icon>campaign</mat-icon>
              <span>App Updates</span>
            </button>
          </nav>

          <div class="p-4 border-t border-slate-800 w-64">
            <a routerLink="/dashboard" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all font-bold text-sm">
              <mat-icon>arrow_back</mat-icon>
              <span>Back to App</span>
            </a>
          </div>
        </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <!-- Top Bar -->
        <header class="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div class="flex items-center gap-4">
            @if (!isSidebarOpen()) {
              <button (click)="isSidebarOpen.set(true)" class="text-slate-500 hover:text-indigo-600">
                <mat-icon>menu</mat-icon>
              </button>
            }
            <h2 class="text-xl font-black text-slate-900 tracking-tight capitalize">{{ activeTab() }}</h2>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex flex-col items-end">
              <span class="text-sm font-black text-slate-900">Administrator</span>
              <span class="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Full Access</span>
            </div>
            <div class="w-10 h-10 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center text-slate-400">
              <mat-icon>person</mat-icon>
            </div>
          </div>
        </header>

        <!-- Tab Content -->
        <div class="flex-1 overflow-y-auto p-8">
          
          @if (activeTab() === 'overview') {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div class="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                  <mat-icon>people</mat-icon>
                </div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Students</p>
                <h3 class="text-3xl font-black text-slate-900">{{ totalStudents() }}</h3>
              </div>
              <div class="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                <div class="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mb-4">
                  <mat-icon>workspace_premium</mat-icon>
                </div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pro Members</p>
                <h3 class="text-3xl font-black text-slate-900">{{ proSubscribers() }}</h3>
              </div>
              <div class="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                  <mat-icon>quiz</mat-icon>
                </div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Quizzes</p>
                <h3 class="text-3xl font-black text-slate-900">{{ totalQuizzes() }}</h3>
              </div>
              <div class="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                  <mat-icon>payments</mat-icon>
                </div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
                <h3 class="text-3xl font-black text-slate-900">MWK {{ totalRevenue() | number }}</h3>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 class="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">System Health</h3>
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="flex items-center gap-3">
                      <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span class="text-sm font-bold text-slate-700">Firestore Database</span>
                    </div>
                    <span class="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
                  </div>
                  <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="flex items-center gap-3">
                      <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span class="text-sm font-bold text-slate-700">Gemini AI API</span>
                    </div>
                    <span class="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Connected</span>
                  </div>
                  <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div class="flex items-center gap-3">
                      <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span class="text-sm font-bold text-slate-700">Auth Service</span>
                    </div>
                    <span class="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Operational</span>
                  </div>
                </div>
              </div>

              <div class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 class="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">User Distribution</h3>
                <div class="flex items-end gap-6 h-48">
                  <div class="flex-1 flex flex-col justify-end items-center gap-3 h-full">
                    <div class="w-full bg-slate-100 rounded-2xl relative group transition-all border border-slate-200" [style.height.%]="((totalStudents() - proSubscribers()) / (totalStudents() || 1)) * 100"></div>
                    <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Free</span>
                  </div>
                  <div class="flex-1 flex flex-col justify-end items-center gap-3 h-full">
                    <div class="w-full bg-indigo-600 rounded-2xl relative group transition-all border border-indigo-700 shadow-lg shadow-indigo-200" [style.height.%]="(proSubscribers() / (totalStudents() || 1)) * 100"></div>
                    <span class="text-xs font-black text-indigo-600 uppercase tracking-widest">Pro</span>
                  </div>
                </div>
              </div>
            </div>
          }

          @if (activeTab() === 'upload') {
            <div class="max-w-3xl">
              <div class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 class="text-2xl font-black text-slate-900 mb-8">{{ editingNoteId() ? 'Edit Material' : 'Upload New Material' }}</h3>
                
                <div class="space-y-6">
                  <div>
                    <label for="note-title" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Title</label>
                    <input id="note-title" type="text" [(ngModel)]="title" placeholder="e.g. 2023 MSCE Biology Paper 1" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900">
                  </div>

                  <div class="grid grid-cols-2 gap-6">
                    <div>
                      <label for="note-category" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                      <select id="note-category" [(ngModel)]="category" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900 appearance-none">
                        <option value="Mathematics">Mathematics</option>
                        <option value="Science">Science</option>
                        <option value="Biology">Biology</option>
                        <option value="English">English</option>
                        <option value="History">History</option>
                        <option value="Past Paper">Past Paper</option>
                        <option value="Announcement">Announcement</option>
                        <option value="Video">Video</option>
                      </select>
                    </div>
                    <div class="flex items-end">
                      <label class="flex items-center gap-3 cursor-pointer w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-colors">
                        <input type="checkbox" [(ngModel)]="isProOnly" class="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                        <span class="text-sm font-black text-slate-700 uppercase tracking-tight">Pro Only</span>
                      </label>
                    </div>
                  </div>

                  @if (category() === 'Video') {
                    <div>
                      <label for="youtube-url" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">YouTube URL</label>
                      <input id="youtube-url" type="text" [(ngModel)]="youtubeUrl" placeholder="https://youtube.com/watch?v=..." class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900">
                    </div>
                  } @else {
                    <div>
                      <label for="drive-url" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Google Drive URL (Optional)</label>
                      <input id="drive-url" type="text" [(ngModel)]="driveUrl" placeholder="https://drive.google.com/..." class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900">
                    </div>
                    <div>
                      <label for="note-content" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Content (Markdown)</label>
                      <textarea id="note-content" [(ngModel)]="content" rows="8" placeholder="Write your content here..." class="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-sm text-slate-800 resize-none"></textarea>
                    </div>
                  }

                  <div class="flex gap-4 pt-4">
                    @if (editingNoteId()) {
                      <button (click)="cancelEdit()" class="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all uppercase tracking-widest">Cancel</button>
                    }
                    <button (click)="saveNote()" [disabled]="isSubmitting()" class="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 uppercase tracking-widest disabled:opacity-50">
                      {{ isSubmitting() ? 'Saving...' : (editingNoteId() ? 'Update Material' : 'Publish Material') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }

          @if (activeTab() === 'manage') {
            <div class="space-y-4">
              @for (note of dataService.notes(); track note.id) {
                <div class="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                  <div class="flex items-center gap-6">
                    <div class="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <mat-icon>{{ note.category === 'Video' ? 'play_circle' : 'description' }}</mat-icon>
                    </div>
                    <div>
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{{ note.category }}</span>
                        @if (note.isProOnly) {
                          <span class="px-2 py-0.5 bg-amber-50 text-amber-600 text-[8px] font-black rounded-full border border-amber-100 uppercase tracking-widest">PRO</span>
                        }
                      </div>
                      <h4 class="text-lg font-black text-slate-900 tracking-tight">{{ note.title }}</h4>
                      <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{{ toDate(note.createdAt) | date:'mediumDate' }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button (click)="editNote(note)" class="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100 flex items-center justify-center">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button (click)="deleteNote(note.id)" class="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100 flex items-center justify-center">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>
              }
            </div>
          }

          @if (activeTab() === 'exams') {
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Form -->
              <div class="lg:col-span-1">
                <div class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-8">
                  <h3 class="text-xl font-black text-slate-900 mb-8">Add Exam Date</h3>
                  <div class="space-y-6">
                    <div>
                      <label for="exam-subject" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject</label>
                      <input id="exam-subject" type="text" [(ngModel)]="examSubject" placeholder="e.g. Biology Paper 1" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900">
                    </div>
                    <div>
                      <label for="exam-date" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Exam Date</label>
                      <input id="exam-date" type="date" [(ngModel)]="examDate" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900">
                    </div>
                    <div>
                      <label for="exam-description" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                      <textarea id="exam-description" [(ngModel)]="examDescription" rows="3" placeholder="Additional details..." class="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900 resize-none"></textarea>
                    </div>
                    <button (click)="saveExamDate()" [disabled]="isSubmitting()" class="w-full py-4 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 uppercase tracking-widest disabled:opacity-50">
                      {{ isSubmitting() ? 'Saving...' : 'Add Exam Date' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- List -->
              <div class="lg:col-span-2 space-y-4">
                @for (exam of dataService.examDates(); track exam.id) {
                  <div class="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
                    <div class="flex items-center gap-6">
                      <div class="w-14 h-14 bg-rose-50 rounded-2xl flex flex-col items-center justify-center text-rose-600 border border-rose-100">
                        <span class="text-[10px] font-black uppercase leading-none">{{ toDate(exam.date) | date:'MMM' }}</span>
                        <span class="text-xl font-black leading-none">{{ toDate(exam.date) | date:'dd' }}</span>
                      </div>
                      <div>
                        <h4 class="text-lg font-black text-slate-900 tracking-tight">{{ exam.subject }}</h4>
                        <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{{ exam.description }}</p>
                      </div>
                    </div>
                    <button (click)="deleteExamDate(exam.id)" class="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100 flex items-center justify-center">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                } @empty {
                  <div class="text-center py-20 bg-white rounded-[3rem] border border-slate-200 border-dashed">
                    <mat-icon class="text-slate-200 !w-16 !h-16 !text-[64px] mb-4">event_busy</mat-icon>
                    <p class="text-slate-400 font-black uppercase tracking-widest">No exam dates posted</p>
                  </div>
                }
              </div>
            </div>
          }

          @if (activeTab() === 'quizzes') {
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Quiz Form -->
              <div class="lg:col-span-1">
                <div class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-8">
                  <h3 class="text-xl font-black text-slate-900 mb-8">{{ editingQuizId() ? 'Edit Quiz' : 'Create Quiz' }}</h3>
                  <div class="space-y-6">
                    <div>
                      <label for="quiz-title" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Title</label>
                      <input id="quiz-title" type="text" [(ngModel)]="quizTitle" placeholder="Quiz Title" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label for="quiz-category" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                        <select id="quiz-category" [(ngModel)]="quizCategory" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900 appearance-none">
                          <option value="Mathematics">Mathematics</option>
                          <option value="Science">Science</option>
                          <option value="Biology">Biology</option>
                          <option value="English">English</option>
                          <option value="History">History</option>
                        </select>
                      </div>
                      <div>
                        <label for="quiz-time" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Time (m)</label>
                        <input id="quiz-time" type="number" [(ngModel)]="quizTimeLimit" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900">
                      </div>
                    </div>
                    <button (click)="addQuestion()" class="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                      <mat-icon>add</mat-icon>
                      Add Question ({{ quizQuestions().length }})
                    </button>
                    <button (click)="saveQuiz()" [disabled]="isSubmitting() || quizQuestions().length === 0" class="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 uppercase tracking-widest disabled:opacity-50">
                      {{ isSubmitting() ? 'Saving...' : 'Publish Quiz' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Quiz List -->
              <div class="lg:col-span-2 space-y-4">
                @for (quiz of dataService.quizzes(); track quiz.id) {
                  <div class="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
                    <div class="flex items-center gap-6">
                      <div class="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                        <mat-icon>quiz</mat-icon>
                      </div>
                      <div>
                        <h4 class="text-lg font-black text-slate-900 tracking-tight">{{ quiz.title }}</h4>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{{ quiz.category }} • {{ quiz.questions.length }} Questions</p>
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <button (click)="editQuiz(quiz)" class="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100 flex items-center justify-center">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button (click)="deleteQuiz(quiz.id)" class="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100 flex items-center justify-center">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          @if (activeTab() === 'students') {
            <div class="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-100">
                    <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                    <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                    <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  @for (student of dataService.users(); track student.uid) {
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="px-8 py-6">
                        <div class="flex items-center gap-4">
                          <img [src]="student.photoURL" [alt]="student.displayName" class="w-10 h-10 rounded-full border border-slate-200" referrerpolicy="no-referrer">
                          <div>
                            <p class="text-sm font-black text-slate-900">{{ student.displayName }}</p>
                            <p class="text-[10px] text-slate-400 font-bold">{{ student.email }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="px-8 py-6">
                        <span class="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-full border border-slate-200 uppercase tracking-widest">{{ student.role }}</span>
                      </td>
                      <td class="px-8 py-6">
                        <span [class]="student.isPro ? 'bg-sky-50 text-sky-600 border-sky-100' : 'bg-slate-100 text-slate-400 border-slate-200'" class="px-3 py-1 text-[10px] font-black rounded-full border uppercase tracking-widest">
                          {{ student.isPro ? 'PRO' : 'FREE' }}
                        </span>
                      </td>
                      <td class="px-8 py-6">
                        @if (student.role !== 'admin') {
                          <button (click)="toggleProStatus(student.uid, !student.isPro)" class="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest underline decoration-2 underline-offset-4">
                            Toggle Pro
                          </button>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @if (activeTab() === 'revenue') {
            <div class="space-y-8">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-center">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Revenue</p>
                  <h3 class="text-4xl font-black text-slate-900">MWK {{ totalRevenue() | number }}</h3>
                </div>
                <div class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-center">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Transactions</p>
                  <h3 class="text-4xl font-black text-slate-900">{{ revenueRecords().length }}</h3>
                </div>
                <div class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-center">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Conversion Rate</p>
                  <h3 class="text-4xl font-black text-slate-900">{{ ((proSubscribers() / (totalStudents() || 1)) * 100) | number:'1.1-1' }}%</h3>
                </div>
              </div>

              <div class="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-slate-50 border-b border-slate-100">
                      <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                      <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</th>
                      <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                      <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-50">
                    @for (record of revenueRecords(); track record.id) {
                      <tr class="hover:bg-slate-50/50 transition-colors">
                        <td class="px-8 py-6">
                          <p class="text-sm font-black text-slate-900">{{ record.userName }}</p>
                          <p class="text-[10px] text-slate-400 font-bold">{{ record.userId }}</p>
                        </td>
                        <td class="px-8 py-6">
                          <span class="px-3 py-1 bg-sky-50 text-sky-600 text-[10px] font-black rounded-full border border-sky-100 uppercase tracking-widest">{{ record.plan }}</span>
                        </td>
                        <td class="px-8 py-6 text-sm font-black text-slate-900">MWK {{ record.amount | number }}</td>
                        <td class="px-8 py-6 text-xs text-slate-500 font-bold uppercase tracking-widest">{{ toDate(record.createdAt) | date:'short' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          @if (activeTab() === 'updates') {
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div class="lg:col-span-1">
                <div class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-8">
                  <h3 class="text-xl font-black text-slate-900 mb-8">Post App Update</h3>
                  <div class="space-y-6">
                    <div>
                      <label for="update-title" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Title</label>
                      <input id="update-title" type="text" [(ngModel)]="updateTitle" placeholder="Update Title" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900">
                    </div>
                    <div>
                      <label for="update-type" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Type</label>
                      <select id="update-type" [(ngModel)]="updateType" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900 appearance-none">
                        <option value="feature">New Feature</option>
                        <option value="announcement">Announcement</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                    <div>
                      <label for="update-content" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Content</label>
                      <textarea id="update-content" [(ngModel)]="updateContent" rows="4" placeholder="Update details..." class="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900 resize-none"></textarea>
                    </div>
                    <div>
                      <label for="update-drive-url" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Drive URL (Optional)</label>
                      <input id="update-drive-url" type="text" [(ngModel)]="updateDriveUrl" placeholder="https://drive.google.com/..." class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900">
                    </div>
                    <button (click)="postUpdate()" [disabled]="isSubmitting()" class="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 uppercase tracking-widest disabled:opacity-50">
                      {{ isSubmitting() ? 'Publishing...' : 'Publish Update' }}
                    </button>
                  </div>
                </div>
              </div>

              <div class="lg:col-span-2 space-y-4">
                @for (update of dataService.appUpdates(); track update.id) {
                  <div class="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                    <div class="flex items-center justify-between mb-4">
                      <span [class]="update.type === 'feature' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'" class="px-3 py-1 text-[10px] font-black rounded-full border uppercase tracking-widest">
                        {{ update.type }}
                      </span>
                      <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ toDate(update.createdAt) | date:'mediumDate' }}</span>
                    </div>
                    <h4 class="text-lg font-black text-slate-900 tracking-tight mb-2">{{ update.title }}</h4>
                    <p class="text-sm text-slate-600 leading-relaxed">{{ update.content }}</p>
                    @if (update.driveUrl) {
                      <div class="mt-4">
                        <span class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Download URL:</span>
                        <p class="text-xs text-slate-500 font-mono break-all">{{ update.driveUrl }}</p>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }

        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }
  `]
})
export class AdminComponent implements OnInit, OnDestroy {
  dataService = inject(DataService);
  router = inject(Router);
  
  isSidebarOpen = signal(true);
  activeTab = signal<'overview' | 'upload' | 'manage' | 'students' | 'quizzes' | 'revenue' | 'updates' | 'exams'>('overview');
  
  title = signal('');
  category = signal('Mathematics');
  content = signal('');
  driveUrl = signal('');
  youtubeUrl = signal('');
  isProOnly = signal(false);
  isSubmitting = signal(false);
  editingNoteId = signal<string | null>(null);

  // Quiz State
  quizTitle = signal('');
  quizDescription = signal('');
  quizCategory = signal('Mathematics');
  quizTimeLimit = signal(15);
  quizIsProOnly = signal(false);
  quizQuestions = signal<QuizQuestion[]>([]);
  editingQuizId = signal<string | null>(null);

  // Updates State
  updateTitle = signal('');
  updateContent = signal('');
  updateDriveUrl = signal('');
  updateType = signal<'feature' | 'maintenance' | 'announcement'>('feature');

  // Exam Dates State
  examSubject = signal('');
  examDate = signal('');
  examDescription = signal('');

  totalStudents = computed(() => this.dataService.users().length);
  proSubscribers = computed(() => this.dataService.users().filter(u => u.isPro).length);
  totalMaterials = computed(() => this.dataService.notes().length);
  totalQuizzes = computed(() => this.dataService.quizzes().length);
  revenueRecords = computed(() => this.dataService.revenueRecords());
  totalRevenue = computed(() => this.revenueRecords().reduce((acc, curr) => acc + curr.amount, 0));

  toDate(date: Date | Timestamp | string | null): Date | null {
    if (!date) return null;
    if (date instanceof Timestamp) return date.toDate();
    if (date instanceof Date) return date;
    return new Date(date);
  }

  ngOnInit() {
    this.dataService.subscribeToUsers();
    this.dataService.subscribeToNotes();
    this.dataService.subscribeToQuizzes();
    this.dataService.subscribeToRevenue();
    this.dataService.subscribeToAppUpdates();
    this.dataService.subscribeToExamDates();
  }

  ngOnDestroy() {
    this.dataService.unsubscribeFromUsers();
    this.dataService.unsubscribeFromNotes();
    this.dataService.unsubscribeFromQuizzes();
    this.dataService.unsubscribeFromRevenue();
    this.dataService.unsubscribeFromAppUpdates();
    this.dataService.unsubscribeFromExamDates();
  }

  goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  async toggleProStatus(userId: string, isPro: boolean) {
    await this.dataService.updateUserProStatus(userId, isPro);
  }

  async postUpdate() {
    if (!this.updateTitle().trim() || !this.updateContent().trim() || this.isSubmitting()) return;
    this.isSubmitting.set(true);
    try {
      await this.dataService.createAppUpdate({
        title: this.updateTitle(),
        content: this.updateContent(),
        type: this.updateType(),
        driveUrl: this.updateDriveUrl() || undefined
      });
      this.updateTitle.set('');
      this.updateContent.set('');
      this.updateDriveUrl.set('');
    } catch (error) {
      console.error(error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async saveExamDate() {
    if (!this.examSubject().trim() || !this.examDate() || this.isSubmitting()) return;
    this.isSubmitting.set(true);
    try {
      await this.dataService.createExamDate({
        subject: this.examSubject(),
        date: new Date(this.examDate()),
        description: this.examDescription()
      });
      this.examSubject.set('');
      this.examDate.set('');
      this.examDescription.set('');
    } catch (error) {
      console.error(error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async deleteExamDate(id: string) {
    if (confirm('Delete this exam date?')) {
      await this.dataService.deleteExamDate(id);
    }
  }

  addQuestion() {
    this.quizQuestions.update(qs => [
      ...qs,
      { text: '', type: 'multiple-choice', options: ['', '', '', ''], correctAnswer: '' }
    ]);
  }

  removeQuestion(index: number) {
    this.quizQuestions.update(qs => qs.filter((_, i) => i !== index));
  }

  async saveQuiz() {
    if (!this.quizTitle().trim() || this.quizQuestions().length === 0 || this.isSubmitting()) return;
    this.isSubmitting.set(true);
    try {
      const quizData = {
        title: this.quizTitle(),
        description: this.quizDescription(),
        category: this.quizCategory(),
        timeLimit: this.quizTimeLimit(),
        isProOnly: this.quizIsProOnly(),
        questions: this.quizQuestions(),
        authorId: 'admin'
      };
      if (this.editingQuizId()) {
        await this.dataService.updateQuiz(this.editingQuizId()!, quizData);
      } else {
        await this.dataService.createQuiz(quizData);
      }
      this.resetQuizForm();
    } catch (error) {
      console.error(error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  editQuiz(quiz: Quiz) {
    this.quizTitle.set(quiz.title);
    this.quizDescription.set(quiz.description || '');
    this.quizCategory.set(quiz.category);
    this.quizTimeLimit.set(quiz.timeLimit);
    this.quizIsProOnly.set(quiz.isProOnly);
    this.quizQuestions.set(quiz.questions);
    this.editingQuizId.set(quiz.id);
    this.activeTab.set('quizzes');
  }

  async deleteQuiz(quizId: string) {
    if (confirm('Delete this quiz?')) {
      await this.dataService.deleteQuiz(quizId);
    }
  }

  resetQuizForm() {
    this.quizTitle.set('');
    this.quizDescription.set('');
    this.quizCategory.set('Mathematics');
    this.quizTimeLimit.set(15);
    this.quizIsProOnly.set(false);
    this.quizQuestions.set([]);
    this.editingQuizId.set(null);
  }

  editNote(note: Note) {
    this.title.set(note.title);
    this.category.set(note.category);
    this.content.set(note.content || '');
    this.driveUrl.set(note.driveUrl || '');
    this.youtubeUrl.set(note.youtubeUrl || '');
    this.isProOnly.set(note.isProOnly);
    this.editingNoteId.set(note.id);
    this.activeTab.set('upload');
  }

  cancelEdit() {
    this.title.set('');
    this.category.set('Mathematics');
    this.content.set('');
    this.driveUrl.set('');
    this.youtubeUrl.set('');
    this.isProOnly.set(false);
    this.editingNoteId.set(null);
    this.activeTab.set('manage');
  }

  async deleteNote(noteId: string) {
    if (confirm('Delete this material?')) {
      await this.dataService.deleteNote(noteId);
    }
  }

  async saveNote() {
    if (!this.title().trim() || (!this.content().trim() && !this.driveUrl().trim() && !this.youtubeUrl().trim()) || this.isSubmitting()) return;
    this.isSubmitting.set(true);
    try {
      const noteData = {
        title: this.title(),
        category: this.category(),
        content: this.content(),
        driveUrl: this.driveUrl() || undefined,
        youtubeUrl: this.youtubeUrl() || undefined,
        isProOnly: this.isProOnly()
      };
      if (this.editingNoteId()) {
        await this.dataService.updateNote(this.editingNoteId()!, noteData);
        this.cancelEdit();
      } else {
        await this.dataService.createNote(noteData);
        this.title.set('');
        this.content.set('');
        this.driveUrl.set('');
        this.youtubeUrl.set('');
        this.isProOnly.set(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
