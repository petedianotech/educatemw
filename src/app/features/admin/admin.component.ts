import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService, Quiz, QuizQuestion, Note } from '../../core/services/data.service';
import { Timestamp } from 'firebase/firestore';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, MatIconModule, DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full bg-slate-50 pb-safe">
      <!-- Premium Header -->
      <header class="bg-gradient-to-r from-indigo-600 to-blue-600 text-white pt-safe sticky top-0 z-20 shadow-md">
        <div class="px-4 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button (click)="goBack()" class="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors border border-white/30">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <div>
              <h1 class="text-xl font-bold tracking-tight">Admin Center</h1>
              <p class="text-xs text-indigo-100 font-medium">EduMalawi Platform</p>
            </div>
          </div>
          <div class="w-10 h-10 bg-white text-indigo-600 rounded-full flex items-center justify-center shadow-sm">
            <mat-icon class="!w-5 !h-5 !text-[20px]">security</mat-icon>
          </div>
        </div>
        
        <!-- Segmented Control -->
        <div class="px-4 pb-4">
          <div class="flex bg-indigo-900/30 p-1 rounded-xl border border-indigo-400/20">
            <button (click)="activeTab.set('overview')" 
                    [class.bg-white]="activeTab() === 'overview'" 
                    [class.text-indigo-600]="activeTab() === 'overview'"
                    [class.shadow-sm]="activeTab() === 'overview'"
                    [class.text-indigo-100]="activeTab() !== 'overview'"
                    class="flex-1 py-2 text-[11px] md:text-sm font-semibold rounded-lg transition-all flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
              <mat-icon class="!w-4 !h-4 !text-[16px] md:!w-5 md:!h-5 md:!text-[20px]">dashboard</mat-icon>
              <span>Overview</span>
            </button>
            <button (click)="activeTab.set('upload')" 
                    [class.bg-white]="activeTab() === 'upload'" 
                    [class.text-indigo-600]="activeTab() === 'upload'"
                    [class.shadow-sm]="activeTab() === 'upload'"
                    [class.text-indigo-100]="activeTab() !== 'upload'"
                    class="flex-1 py-2 text-[11px] md:text-sm font-semibold rounded-lg transition-all flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
              <mat-icon class="!w-4 !h-4 !text-[16px] md:!w-5 md:!h-5 md:!text-[20px]">library_add</mat-icon>
              <span>Upload</span>
            </button>
            <button (click)="activeTab.set('manage')" 
                    [class.bg-white]="activeTab() === 'manage'" 
                    [class.text-indigo-600]="activeTab() === 'manage'"
                    [class.shadow-sm]="activeTab() === 'manage'"
                    [class.text-indigo-100]="activeTab() !== 'manage'"
                    class="flex-1 py-2 text-[11px] md:text-sm font-semibold rounded-lg transition-all flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
              <mat-icon class="!w-4 !h-4 !text-[16px] md:!w-5 md:!h-5 md:!text-[20px]">folder_managed</mat-icon>
              <span>Manage</span>
            </button>
            <button (click)="activeTab.set('students')" 
                    [class.bg-white]="activeTab() === 'students'" 
                    [class.text-indigo-600]="activeTab() === 'students'"
                    [class.shadow-sm]="activeTab() === 'students'"
                    [class.text-indigo-100]="activeTab() !== 'students'"
                    class="flex-1 py-2 text-[11px] md:text-sm font-semibold rounded-lg transition-all flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
              <mat-icon class="!w-4 !h-4 !text-[16px] md:!w-5 md:!h-5 md:!text-[20px]">people</mat-icon>
              <span>Students</span>
            </button>
            <button (click)="activeTab.set('quizzes')" 
                    [class.bg-white]="activeTab() === 'quizzes'" 
                    [class.text-indigo-600]="activeTab() === 'quizzes'"
                    [class.shadow-sm]="activeTab() === 'quizzes'"
                    [class.text-indigo-100]="activeTab() !== 'quizzes'"
                    class="flex-1 py-2 text-[11px] md:text-sm font-semibold rounded-lg transition-all flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
              <mat-icon class="!w-4 !h-4 !text-[16px] md:!w-5 md:!h-5 md:!text-[20px]">quiz</mat-icon>
              <span>Quizzes</span>
            </button>
            <button (click)="activeTab.set('revenue')" 
                    [class.bg-white]="activeTab() === 'revenue'" 
                    [class.text-indigo-600]="activeTab() === 'revenue'"
                    [class.shadow-sm]="activeTab() === 'revenue'"
                    [class.text-indigo-100]="activeTab() !== 'revenue'"
                    class="flex-1 py-2 text-[11px] md:text-sm font-semibold rounded-lg transition-all flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
              <mat-icon class="!w-4 !h-4 !text-[16px] md:!w-5 md:!h-5 md:!text-[20px]">payments</mat-icon>
              <span>Revenue</span>
            </button>
            <button (click)="activeTab.set('updates')" 
                    [class.bg-white]="activeTab() === 'updates'" 
                    [class.text-indigo-600]="activeTab() === 'updates'"
                    [class.shadow-sm]="activeTab() === 'updates'"
                    [class.text-indigo-100]="activeTab() !== 'updates'"
                    class="flex-1 py-2 text-[11px] md:text-sm font-semibold rounded-lg transition-all flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
              <mat-icon class="!w-4 !h-4 !text-[16px] md:!w-5 md:!h-5 md:!text-[20px]">campaign</mat-icon>
              <span>Updates</span>
            </button>
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-4 md:p-6">
        
        @if (activeTab() === 'overview') {
          <!-- Stats Grid -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <!-- Stat Card 1 -->
            <div class="card-modern p-4">
              <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3 border border-blue-100">
                <mat-icon class="!w-5 !h-5 !text-[20px]">people</mat-icon>
              </div>
              <p class="text-xs text-slate-500 font-semibold mb-1">Total Students</p>
              <h3 class="text-2xl font-bold text-slate-900">{{ totalStudents() }}</h3>
            </div>
            
            <!-- Stat Card 2 -->
            <div class="card-modern p-4">
              <div class="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center mb-3 border border-sky-100">
                <mat-icon class="!w-5 !h-5 !text-[20px]">workspace_premium</mat-icon>
              </div>
              <p class="text-xs text-slate-500 font-semibold mb-1">Pro Subscribers</p>
              <h3 class="text-2xl font-bold text-slate-900">{{ proSubscribers() }}</h3>
            </div>

            <!-- Stat Card 3 -->
            <div class="card-modern p-4">
              <div class="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3 border border-purple-100">
                <mat-icon class="!w-5 !h-5 !text-[20px]">quiz</mat-icon>
              </div>
              <p class="text-xs text-slate-500 font-semibold mb-1">Total Quizzes</p>
              <h3 class="text-2xl font-bold text-slate-900">{{ totalQuizzes() }}</h3>
            </div>

            <!-- Stat Card 4 -->
            <div class="card-modern p-4">
              <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3 border border-indigo-100">
                <mat-icon class="!w-5 !h-5 !text-[20px]">library_books</mat-icon>
              </div>
              <p class="text-xs text-slate-500 font-semibold mb-1">Materials</p>
              <h3 class="text-2xl font-bold text-slate-900">{{ totalMaterials() }}</h3>
            </div>
          </div>

          <!-- Graph -->
          <div class="card-modern p-6 mb-6">
            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">User Distribution</h3>
            <div class="flex items-end gap-4 h-40">
              <div class="flex-1 flex flex-col justify-end items-center gap-2 h-full">
                <div class="w-full bg-blue-100 rounded-t-2xl relative group transition-all border border-b-0 border-blue-200" [style.height.%]="((totalStudents() - proSubscribers()) / (totalStudents() || 1)) * 100">
                  <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity font-semibold">{{totalStudents() - proSubscribers()}}</div>
                </div>
                <span class="text-xs font-semibold text-slate-500">Free</span>
              </div>
              <div class="flex-1 flex flex-col justify-end items-center gap-2 h-full">
                <div class="w-full bg-sky-400 rounded-t-2xl relative group transition-all border border-b-0 border-sky-500" [style.height.%]="(proSubscribers() / (totalStudents() || 1)) * 100">
                  <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity font-semibold">{{proSubscribers()}}</div>
                </div>
                <span class="text-xs font-semibold text-slate-500">Pro</span>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 px-1">System Status</h3>
          <div class="card-modern overflow-hidden">
            <div class="p-4 border-b border-slate-100 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-indigo-500 animate-pulse border border-indigo-200"></div>
                <span class="text-sm font-medium text-slate-700">Database Connection</span>
              </div>
              <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">Stable</span>
            </div>
            <div class="p-4 border-b border-slate-100 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-indigo-500 animate-pulse border border-indigo-200"></div>
                <span class="text-sm font-medium text-slate-700">Gemini AI API</span>
              </div>
              <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">Online</span>
            </div>
            <div class="p-4 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-indigo-500 animate-pulse border border-indigo-200"></div>
                <span class="text-sm font-medium text-slate-700">Authentication</span>
              </div>
              <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">Operational</span>
            </div>
          </div>
        }

        @if (activeTab() === 'upload') {
          <div class="max-w-3xl mx-auto">
            <div class="card-modern p-5 md:p-8">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100">
                  <mat-icon>{{ editingNoteId() ? 'edit' : 'cloud_upload' }}</mat-icon>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-slate-900">{{ editingNoteId() ? 'Edit Material' : 'Upload Material' }}</h3>
                  <p class="text-xs text-slate-500 font-medium">{{ editingNoteId() ? 'Update existing content' : 'Add new notes, videos, or announcements' }}</p>
                </div>
              </div>
              
              <div class="space-y-5">
                <div>
                  <label for="title" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Document Title</label>
                  <div class="relative">
                    <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 !w-5 !h-5 !text-[20px]">title</mat-icon>
                    <input id="title" type="text" [(ngModel)]="title" placeholder="e.g. 2023 MSCE Biology Paper 1" class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400">
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label for="category" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Category</label>
                    <div class="relative">
                      <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 !w-5 !h-5 !text-[20px]">category</mat-icon>
                      <select id="category" [(ngModel)]="category" class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-900 appearance-none">
                        <option value="Mathematics">Mathematics</option>
                        <option value="Science">Science</option>
                        <option value="Biology">Biology</option>
                        <option value="English">English</option>
                        <option value="History">History</option>
                        <option value="Past Paper">Past Paper</option>
                        <option value="Announcement">Announcement</option>
                        <option value="Video">Video</option>
                      </select>
                      <mat-icon class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</mat-icon>
                    </div>
                  </div>
                  
                  <div class="flex items-center pt-2 md:pt-8">
                    <label class="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 w-full hover:bg-slate-50 transition-colors">
                      <div class="relative flex items-center justify-center">
                        <input type="checkbox" [(ngModel)]="isProOnly" class="peer appearance-none w-5 h-5 border border-slate-300 rounded checked:bg-sky-500 checked:border-sky-500 transition-colors cursor-pointer">
                        <mat-icon class="absolute text-white !w-3 !h-3 !text-[12px] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">check</mat-icon>
                      </div>
                      <div>
                        <span class="block text-sm font-semibold text-slate-900">Pro Only Content</span>
                        <span class="block text-[10px] text-slate-500 font-medium">Require premium subscription</span>
                      </div>
                    </label>
                  </div>
                </div>

                @if (category() === 'Video') {
                  <div>
                    <label for="youtubeUrl" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">YouTube URL</label>
                    <div class="relative">
                      <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 !w-5 !h-5 !text-[20px]">smart_display</mat-icon>
                      <input id="youtubeUrl" type="text" [(ngModel)]="youtubeUrl" placeholder="https://youtube.com/watch?v=..." class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:border-red-500 focus:ring-red-500 focus:bg-white outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400">
                    </div>
                  </div>
                } @else {
                  <div>
                    <label for="driveUrl" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Google Drive URL (Optional)</label>
                    <div class="relative">
                      <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 !w-5 !h-5 !text-[20px]">add_to_drive</mat-icon>
                      <input id="driveUrl" type="text" [(ngModel)]="driveUrl" placeholder="https://drive.google.com/file/d/..." class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400">
                    </div>
                  </div>
                  
                  <div>
                    <label for="content" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Content (Markdown)</label>
                    <textarea id="content" [(ngModel)]="content" rows="6" placeholder="# Heading 1&#10;Write your content here..." class="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-mono text-sm text-slate-800 placeholder:text-slate-400 resize-none"></textarea>
                  </div>
                }
                
                <div class="pt-4 flex flex-col sm:flex-row gap-3">
                  @if (editingNoteId()) {
                    <button 
                      (click)="cancelEdit()"
                      class="btn-secondary w-full sm:w-auto px-6 py-3.5">
                      Cancel
                    </button>
                  }
                  <button 
                    (click)="saveNote()"
                    [disabled]="!title().trim() || (!content().trim() && !driveUrl().trim() && !youtubeUrl().trim()) || isSubmitting()"
                    class="btn-primary w-full flex-1 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed gap-2">
                    @if (isSubmitting()) {
                      <mat-icon class="animate-spin">refresh</mat-icon>
                      {{ editingNoteId() ? 'Saving...' : 'Publishing...' }}
                    } @else {
                      <mat-icon>{{ editingNoteId() ? 'save' : 'publish' }}</mat-icon>
                      {{ editingNoteId() ? 'Save Changes' : 'Publish Material' }}
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        }

        @if (activeTab() === 'manage') {
          <div class="max-w-3xl mx-auto">
            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 px-1">Manage Content</h3>
            
            <div class="space-y-3">
              @for (note of dataService.notes(); track note.id) {
                <div class="card-modern p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md uppercase border border-blue-100">{{note.category}}</span>
                      @if (note.isProOnly) {
                        <span class="px-2 py-0.5 bg-sky-50 text-sky-600 text-[10px] font-bold rounded-md uppercase border border-sky-100">PRO</span>
                      }
                    </div>
                    <h4 class="font-semibold text-slate-900 truncate">{{ note.title }}</h4>
                    <p class="text-xs text-slate-500 font-medium">{{ toDate(note.createdAt) | date:'mediumDate' }}</p>
                  </div>
                  
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <button (click)="editNote(note)" class="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center transition-colors border border-slate-200 hover:border-blue-200" title="Edit">
                      <mat-icon class="!w-5 !h-5 !text-[20px]">edit</mat-icon>
                    </button>
                    <button (click)="deleteNote(note.id)" class="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors border border-slate-200 hover:border-red-200" title="Delete">
                      <mat-icon class="!w-5 !h-5 !text-[20px]">delete</mat-icon>
                    </button>
                  </div>
                </div>
              }
              
              @if (dataService.notes().length === 0) {
                <div class="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                  <mat-icon class="text-slate-300 !w-12 !h-12 !text-[48px] mb-3">folder_open</mat-icon>
                  <p class="text-slate-500 font-medium">No materials uploaded yet.</p>
                  <button (click)="activeTab.set('upload')" class="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-200">
                    Upload First Material
                  </button>
                </div>
              }
            </div>
          </div>
        }

        @if (activeTab() === 'quizzes') {
          <div class="max-w-4xl mx-auto">
            <!-- Quiz Creation Form -->
            <div class="card-modern p-5 md:p-8 mb-8">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100">
                  <mat-icon>{{ editingQuizId() ? 'edit' : 'quiz' }}</mat-icon>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-slate-900">{{ editingQuizId() ? 'Edit Quiz' : 'Create New Quiz' }}</h3>
                  <p class="text-xs text-slate-500 font-medium">Design interactive assessments for students</p>
                </div>
              </div>

              <div class="space-y-5">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label for="quizTitle" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Quiz Title</label>
                    <input type="text" id="quizTitle" [(ngModel)]="quizTitle" placeholder="e.g. Biology Mid-term Quiz" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-900">
                  </div>
                  <div>
                    <label for="quizCategory" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Category</label>
                    <select id="quizCategory" [(ngModel)]="quizCategory" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-900">
                      <option value="Mathematics">Mathematics</option>
                      <option value="Science">Science</option>
                      <option value="Biology">Biology</option>
                      <option value="English">English</option>
                      <option value="History">History</option>
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label for="quizTimeLimit" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Time Limit (Minutes)</label>
                    <input type="number" id="quizTimeLimit" [(ngModel)]="quizTimeLimit" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-900">
                  </div>
                  <div class="flex items-center pt-6">
                    <label class="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 w-full hover:bg-slate-50 transition-colors">
                      <input type="checkbox" [(ngModel)]="quizIsProOnly" class="w-5 h-5 border border-slate-300 rounded checked:bg-sky-500">
                      <span class="text-sm font-semibold text-slate-900">Pro Only Quiz</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label for="quizDescription" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Description</label>
                  <textarea id="quizDescription" [(ngModel)]="quizDescription" rows="2" placeholder="Briefly describe what this quiz covers..." class="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:border-indigo-500 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm text-slate-800 resize-none"></textarea>
                </div>

                <!-- Questions Builder -->
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Questions ({{quizQuestions().length}})</h4>
                    <button (click)="addQuestion()" class="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors flex items-center gap-1">
                      <mat-icon class="text-[16px] !w-[16px] !h-[16px]">add</mat-icon>
                      Add Question
                    </button>
                  </div>

                  @for (q of quizQuestions(); track $index; let i = $index) {
                    <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 relative group">
                      <button (click)="removeQuestion(i)" class="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
                        <mat-icon class="text-[20px]">delete</mat-icon>
                      </button>

                      <div class="flex gap-4">
                        <div class="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                          {{i + 1}}
                        </div>
                        <div class="flex-1 space-y-4">
                          <input type="text" [(ngModel)]="q.text" placeholder="Enter question text..." class="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium">
                          
                          <div class="flex gap-4">
                            <button (click)="updateQuestionType(i, 'multiple-choice')" 
                                    [class.bg-indigo-600]="q.type === 'multiple-choice'"
                                    [class.text-white]="q.type === 'multiple-choice'"
                                    class="px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all"
                                    [class.bg-white]="q.type !== 'multiple-choice'"
                                    [class.text-slate-500]="q.type !== 'multiple-choice'">
                              Multiple Choice
                            </button>
                            <button (click)="updateQuestionType(i, 'true-false')" 
                                    [class.bg-indigo-600]="q.type === 'true-false'"
                                    [class.text-white]="q.type === 'true-false'"
                                    class="px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all"
                                    [class.bg-white]="q.type !== 'true-false'"
                                    [class.text-slate-500]="q.type !== 'true-false'">
                              True/False
                            </button>
                          </div>

                          @if (q.type === 'multiple-choice') {
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              @for (opt of q.options; track $index; let optIdx = $index) {
                                <div class="flex items-center gap-2">
                                  <input type="radio" [name]="'correct_' + i" [value]="opt" [(ngModel)]="q.correctAnswer" class="w-4 h-4 text-indigo-600">
                                  <input type="text" [(ngModel)]="q.options![optIdx]" [placeholder]="'Option ' + (optIdx + 1)" class="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs">
                                </div>
                              }
                            </div>
                          } @else {
                            <div class="flex gap-4">
                              <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" [name]="'correct_' + i" value="True" [(ngModel)]="q.correctAnswer" class="w-4 h-4 text-indigo-600">
                                <span class="text-sm font-medium">True</span>
                              </label>
                              <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" [name]="'correct_' + i" value="False" [(ngModel)]="q.correctAnswer" class="w-4 h-4 text-indigo-600">
                                <span class="text-sm font-medium">False</span>
                              </label>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>

                <div class="pt-4 flex gap-3">
                  @if (editingQuizId()) {
                    <button (click)="resetQuizForm()" class="btn-secondary px-6 py-3">Cancel</button>
                  }
                  <button (click)="saveQuiz()" [disabled]="!quizTitle().trim() || quizQuestions().length === 0 || isSubmitting()" class="btn-primary flex-1 py-3.5">
                    {{ isSubmitting() ? 'Saving...' : (editingQuizId() ? 'Update Quiz' : 'Publish Quiz') }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Existing Quizzes List -->
            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 px-1">Existing Quizzes</h3>
            <div class="space-y-3">
              @for (quiz of dataService.quizzes(); track quiz.id) {
                <div class="card-modern p-4 flex items-center justify-between gap-4">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-md uppercase border border-indigo-100">{{quiz.category}}</span>
                      <span class="text-xs text-slate-400 font-medium">{{quiz.questions.length}} Qs • {{quiz.timeLimit}}m</span>
                    </div>
                    <h4 class="font-semibold text-slate-900 truncate">{{ quiz.title }}</h4>
                  </div>
                  <div class="flex items-center gap-2">
                    <button (click)="editQuiz(quiz)" class="w-9 h-9 rounded-lg bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-center border border-slate-200">
                      <mat-icon class="text-[18px]">edit</mat-icon>
                    </button>
                    <button (click)="deleteQuiz(quiz.id)" class="w-9 h-9 rounded-lg bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 flex items-center justify-center border border-slate-200">
                      <mat-icon class="text-[18px]">delete</mat-icon>
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        @if (activeTab() === 'revenue') {
          <div class="max-w-4xl mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div class="card-modern p-6 bg-emerald-50 border-emerald-100">
                <p class="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Total Revenue</p>
                <h3 class="text-3xl font-black text-emerald-900">MWK {{ totalRevenue() | number }}</h3>
                <p class="text-[10px] text-emerald-500 font-bold mt-1">+12% from last month</p>
              </div>
              <div class="card-modern p-6 bg-sky-50 border-sky-100">
                <p class="text-xs font-bold text-sky-600 uppercase tracking-widest mb-2">Active Subs</p>
                <h3 class="text-3xl font-black text-sky-900">{{ proSubscribers() }}</h3>
                <p class="text-[10px] text-sky-500 font-bold mt-1">Retention rate: 94%</p>
              </div>
              <div class="card-modern p-6 bg-indigo-50 border-indigo-100">
                <p class="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Avg. Ticket</p>
                <h3 class="text-3xl font-black text-indigo-900">MWK {{ (totalRevenue() / (revenueRecords().length || 1)) | number:'1.0-0' }}</h3>
                <p class="text-[10px] text-indigo-500 font-bold mt-1">Per transaction</p>
              </div>
            </div>

            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 px-1">Recent Transactions</h3>
            <div class="card-modern overflow-hidden">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-100">
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  @for (record of revenueRecords(); track record.id) {
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="px-6 py-4">
                        <p class="text-sm font-bold text-slate-900">{{ record.userName }}</p>
                        <p class="text-[10px] text-slate-400 font-medium">{{ record.userId }}</p>
                      </td>
                      <td class="px-6 py-4">
                        <span class="px-2 py-1 bg-sky-50 text-sky-600 text-[10px] font-black rounded-lg border border-sky-100 uppercase">{{ record.plan }}</span>
                      </td>
                      <td class="px-6 py-4 text-sm font-black text-slate-900">MWK {{ record.amount | number }}</td>
                      <td class="px-6 py-4 text-xs text-slate-500 font-medium">{{ toDate(record.createdAt) | date:'short' }}</td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4" class="px-6 py-12 text-center text-slate-400 font-medium italic">No transactions recorded yet.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        @if (activeTab() === 'updates') {
          <div class="max-w-3xl mx-auto">
            <div class="card-modern p-6 mb-8">
              <h3 class="text-lg font-black text-slate-900 mb-6">Post App Update</h3>
              <div class="space-y-4">
                <div>
                  <label for="updateTitle" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Update Title</label>
                  <input id="updateTitle" type="text" [(ngModel)]="updateTitle" placeholder="e.g. New Biology Quizzes Added!" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900">
                </div>
                <div>
                  <label for="updateType" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Type</label>
                  <select id="updateType" [(ngModel)]="updateType" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900">
                    <option value="feature">New Feature</option>
                    <option value="announcement">Announcement</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label for="updateContent" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 ml-1">Content</label>
                  <textarea id="updateContent" [(ngModel)]="updateContent" rows="4" placeholder="Describe the update..." class="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:border-indigo-500 outline-none transition-all text-sm text-slate-800 resize-none"></textarea>
                </div>
                <button (click)="postUpdate()" [disabled]="!updateTitle().trim() || !updateContent().trim() || isSubmitting()" class="btn-primary w-full py-4 shadow-lg shadow-indigo-100">
                  {{ isSubmitting() ? 'Publishing...' : 'Publish Update' }}
                </button>
              </div>
            </div>

            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 px-1">Past Updates</h3>
            <div class="space-y-3">
              @for (update of dataService.appUpdates(); track update.id) {
                <div class="card-modern p-4">
                  <div class="flex items-center justify-between mb-2">
                    <span [class]="'px-2 py-0.5 text-[10px] font-black rounded-md uppercase border ' + 
                      (update.type === 'feature' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                       update.type === 'maintenance' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                       'bg-blue-50 text-blue-600 border-blue-100')">
                      {{ update.type }}
                    </span>
                    <span class="text-[10px] text-slate-400 font-bold">{{ toDate(update.createdAt) | date:'mediumDate' }}</span>
                  </div>
                  <h4 class="font-black text-slate-900 mb-1">{{ update.title }}</h4>
                  <p class="text-sm text-slate-600 leading-relaxed">{{ update.content }}</p>
                </div>
              }
            </div>
          </div>
        }

        @if (activeTab() === 'students') {
          <div class="max-w-3xl mx-auto">
            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 px-1">Student Directory</h3>
            
            <div class="space-y-3">
              @for (student of dataService.users(); track student.uid) {
                <div class="card-modern p-4 flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3 min-w-0">
                    <img [src]="student.photoURL" alt="Profile" class="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 border border-slate-200" referrerpolicy="no-referrer">
                    <div class="min-w-0">
                      <h4 class="font-semibold text-slate-900 truncate">{{ student.displayName }}</h4>
                      <p class="text-xs text-slate-500 font-medium truncate">{{ student.email }}</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center gap-3 flex-shrink-0">
                    @if (student.role === 'admin') {
                      <span class="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase border border-slate-200">Admin</span>
                    } @else {
                      <label class="flex items-center gap-2 cursor-pointer">
                        <span class="text-xs font-bold" [class.text-sky-600]="student.isPro" [class.text-slate-400]="!student.isPro">
                          {{ student.isPro ? 'PRO' : 'FREE' }}
                        </span>
                        <div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                          <input type="checkbox" [id]="'pro_' + student.uid" [checked]="student.isPro" (change)="toggleProStatus(student.uid, !student.isPro)" class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-2 appearance-none cursor-pointer transition-transform duration-200 ease-in-out" [class.translate-x-5]="student.isPro" [class.border-sky-500]="student.isPro" [class.border-slate-300]="!student.isPro"/>
                          <label [for]="'pro_' + student.uid" class="toggle-label block overflow-hidden h-5 rounded-full bg-slate-300 cursor-pointer transition-colors duration-200 ease-in-out" [class.bg-sky-400]="student.isPro"></label>
                        </div>
                      </label>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .toggle-checkbox:checked {
      right: 0;
      border-color: #0ea5e9;
    }
    .toggle-checkbox:checked + .toggle-label {
      background-color: #38bdf8;
    }
  `]
})
export class AdminComponent implements OnInit, OnDestroy {
  dataService = inject(DataService);
  
  activeTab = signal<'overview' | 'upload' | 'manage' | 'students' | 'quizzes' | 'revenue' | 'updates'>('overview');
  
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
  updateType = signal<'feature' | 'maintenance' | 'announcement'>('feature');

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
  }

  ngOnDestroy() {
    this.dataService.unsubscribeFromUsers();
    this.dataService.unsubscribeFromNotes();
    this.dataService.unsubscribeFromQuizzes();
    this.dataService.unsubscribeFromRevenue();
    this.dataService.unsubscribeFromAppUpdates();
  }

  goBack() {
    window.history.back();
  }

  async toggleProStatus(userId: string, isPro: boolean) {
    await this.dataService.updateUserProStatus(userId, isPro);
  }

  // --- Update Methods ---
  async postUpdate() {
    if (!this.updateTitle().trim() || !this.updateContent().trim() || this.isSubmitting()) return;
    this.isSubmitting.set(true);
    try {
      await this.dataService.createAppUpdate({
        title: this.updateTitle(),
        content: this.updateContent(),
        type: this.updateType()
      });
      alert('Update published successfully!');
      this.updateTitle.set('');
      this.updateContent.set('');
    } catch (error) {
      console.error(error);
      alert('Failed to publish update.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  // --- Quiz Methods ---
  addQuestion() {
    this.quizQuestions.update(qs => [
      ...qs,
      { text: '', type: 'multiple-choice', options: ['', '', '', ''], correctAnswer: '' }
    ]);
  }

  removeQuestion(index: number) {
    this.quizQuestions.update(qs => qs.filter((_, i) => i !== index));
  }

  updateQuestionType(index: number, type: 'multiple-choice' | 'true-false') {
    this.quizQuestions.update(qs => qs.map((q, i) => {
      if (i === index) {
        return { 
          ...q, 
          type, 
          options: type === 'multiple-choice' ? ['', '', '', ''] : undefined,
          correctAnswer: ''
        };
      }
      return q;
    }));
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
        questions: this.quizQuestions()
      };

      if (this.editingQuizId()) {
        await this.dataService.updateQuiz(this.editingQuizId()!, quizData);
        alert('Quiz updated successfully!');
      } else {
        await this.dataService.createQuiz(quizData);
        alert('Quiz published successfully!');
      }
      this.resetQuizForm();
    } catch (error) {
      console.error(error);
      alert('Failed to save quiz.');
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
    if (confirm('Are you sure you want to delete this quiz?')) {
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
    if (confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
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
        alert('Material updated successfully!');
        this.cancelEdit();
      } else {
        await this.dataService.createNote(noteData);
        alert('Material published successfully!');
        // Reset form
        this.title.set('');
        this.content.set('');
        this.driveUrl.set('');
        this.youtubeUrl.set('');
        this.isProOnly.set(false);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to save material.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
