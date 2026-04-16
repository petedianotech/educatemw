import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, OnDestroy, PLATFORM_ID, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService, Quiz, QuizQuestion, Note, AppUpdate } from '../../core/services/data.service';
import { GeminiService } from '../../core/services/gemini.service';
import { Timestamp } from 'firebase/firestore';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, DecimalPipe, CommonModule, NgOptimizedImage, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, MatIconModule, DatePipe, DecimalPipe, CommonModule, RouterLink, NgOptimizedImage],
  schemas: [NO_ERRORS_SCHEMA],
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
                <h3 class="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">Users & Revenue Trend</h3>
                <div class="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart [data]="chartData()">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="users" stroke="#8884d8" />
                      <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
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
                    <input id="note-title" type="text" [ngModel]="title()" (ngModelChange)="title.set($event)" placeholder="e.g. 2023 MSCE Biology Paper 1" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900">
                  </div>

                    <div class="grid grid-cols-2 gap-6">
                      <div>
                        <label for="note-category" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category / Subject</label>
                        <div class="relative">
                          <select id="note-category" [ngModel]="category()" (ngModelChange)="category.set($event)" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 appearance-none pr-12 cursor-pointer hover:bg-slate-100">
                            <option value="Mathematics">Mathematics</option>
                            <option value="English">English</option>
                            <option value="Biology">Biology</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Physics">Physics</option>
                            <option value="Agriculture">Agriculture</option>
                            <option value="Geography">Geography</option>
                            <option value="History">History</option>
                            <option value="Social and Life Skills">Social and Life Skills</option>
                            <option value="Chichewa">Chichewa</option>
                            <option value="Computer Studies">Computer Studies</option>
                            <option value="Home Economics">Home Economics</option>
                            <option value="Bible Knowledge">Bible Knowledge</option>
                            <option value="Past Paper">Past Paper</option>
                            <option value="Announcement">Announcement</option>
                            <option value="Video">Video</option>
                          </select>
                          <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-indigo-500">
                            <mat-icon>expand_more</mat-icon>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label for="note-destination" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Publish Destination</label>
                        <div class="relative">
                          <select id="note-destination" [ngModel]="destination()" (ngModelChange)="destination.set($event)" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 appearance-none pr-12 cursor-pointer hover:bg-slate-100">
                            <option value="notes">📚 Notes Section</option>
                            <option value="past-papers">📝 Past Papers Section</option>
                            <option value="announcements">📢 Announcements Section</option>
                            <option value="video-lessons">▶️ Video Lessons Section</option>
                          </select>
                          <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-indigo-500">
                            <mat-icon>expand_more</mat-icon>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-6">
                      <div>
                        <label for="note-level" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Education Level</label>
                        <div class="relative">
                          <select id="note-level" [ngModel]="level()" (ngModelChange)="level.set($event)" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 appearance-none pr-12 cursor-pointer hover:bg-slate-100">
                            <option value="Secondary">Secondary School</option>
                            <option value="Primary">Primary School</option>
                          </select>
                          <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-indigo-500">
                            <mat-icon>expand_more</mat-icon>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label for="note-form" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Class / Form</label>
                        <div class="relative">
                          <select id="note-form" [ngModel]="form()" (ngModelChange)="form.set($event)" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 appearance-none pr-12 cursor-pointer hover:bg-slate-100">
                            <option value="">All Classes</option>
                            @if (level() === 'Secondary') {
                              <option value="Form 1">Form 1</option>
                              <option value="Form 2">Form 2</option>
                              <option value="Form 3">Form 3</option>
                              <option value="Form 4">Form 4</option>
                            } @else {
                              <option value="Standard 1">Standard 1</option>
                              <option value="Standard 2">Standard 2</option>
                              <option value="Standard 3">Standard 3</option>
                              <option value="Standard 4">Standard 4</option>
                              <option value="Standard 5">Standard 5</option>
                              <option value="Standard 6">Standard 6</option>
                              <option value="Standard 7">Standard 7</option>
                              <option value="Standard 8">Standard 8</option>
                            }
                          </select>
                          <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-indigo-500">
                            <mat-icon>expand_more</mat-icon>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="flex items-end">
                      <label class="flex items-center gap-3 cursor-pointer w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-colors"
                             [class.bg-indigo-50]="isProOnly()" [class.border-indigo-200]="isProOnly()">
                        <div class="relative flex items-center justify-center w-6 h-6 rounded border-2 transition-colors"
                             [class.border-indigo-600]="isProOnly()" [class.bg-indigo-600]="isProOnly()"
                             [class.border-slate-300]="!isProOnly()" [class.bg-white]="!isProOnly()">
                          <input type="checkbox" [ngModel]="isProOnly()" (ngModelChange)="isProOnly.set($event)" class="opacity-0 absolute inset-0 cursor-pointer w-full h-full">
                          @if (isProOnly()) {
                            <mat-icon class="text-white !w-4 !h-4 !text-[16px]">check</mat-icon>
                          }
                        </div>
                        <span class="text-sm font-black uppercase tracking-tight" [class.text-indigo-700]="isProOnly()" [class.text-slate-700]="!isProOnly()">Pro Only Material</span>
                      </label>
                    </div>

                  @if (category() === 'Video') {
                    <div>
                      <label for="youtube-url" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">YouTube URL</label>
                      <input id="youtube-url" type="text" [ngModel]="youtubeUrl()" (ngModelChange)="youtubeUrl.set($event)" placeholder="https://youtube.com/watch?v=..." class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900">
                    </div>
                  } @else {
                    <div>
                      <label for="drive-url" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Google Drive URL (Optional)</label>
                      <input id="drive-url" type="text" [ngModel]="driveUrl()" (ngModelChange)="driveUrl.set($event)" placeholder="https://drive.google.com/..." class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900">
                    </div>
                    <div>
                      <label for="note-content" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Content (Markdown)</label>
                      <textarea id="note-content" [ngModel]="content()" (ngModelChange)="content.set($event)" rows="8" placeholder="Write your content here..." class="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-sm text-slate-800 resize-none"></textarea>
                    </div>
                  }

                  <!-- SEO Section -->
                  <div class="pt-6 border-t border-slate-100">
                    <div class="flex items-center justify-between mb-4">
                      <h4 class="text-sm font-black text-slate-900 uppercase tracking-tight">SEO Optimization</h4>
                      <button (click)="generateSEOAI()" 
                              [disabled]="isGeneratingSEO() || !title()"
                              class="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all disabled:opacity-50">
                        @if (isGeneratingSEO()) {
                          <div class="w-3 h-3 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                          <span>Analyzing...</span>
                        } @else {
                          <mat-icon class="!w-4 !h-4 !text-[16px]">auto_awesome</mat-icon>
                          <span>SEO AI</span>
                        }
                      </button>
                    </div>
                    
                    <div class="space-y-4">
                      <div>
                        <label for="seo-title" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">SEO Title (Max 60 chars)</label>
                        <input id="seo-title" type="text" [ngModel]="seoTitle()" (ngModelChange)="seoTitle.set($event)" placeholder="e.g. Biology MSCE PDF Download Malawi" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900">
                      </div>
                      <div>
                        <label for="seo-desc" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Meta Description (Max 155 chars)</label>
                        <textarea id="seo-desc" [ngModel]="seoDescription()" (ngModelChange)="seoDescription.set($event)" rows="3" placeholder="Study and pass MSCE with our Malawian syllabus notes..." class="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-sm text-slate-800 resize-none"></textarea>
                      </div>
                      <div>
                        <label for="slug" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">URL Slug (Deep Link)</label>
                        <div class="flex items-center gap-2">
                          <span class="text-xs text-slate-400 font-mono">/books/</span>
                          <input id="slug" type="text" [ngModel]="slug()" (ngModelChange)="slug.set($event)" placeholder="mathematics-archivers-book-3" class="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-xs text-slate-900">
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="flex gap-4 pt-4">
                    @if (editingNoteId()) {
                      <button (click)="cancelEdit()" class="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all uppercase tracking-widest">Cancel</button>
                    }
                    <button (click)="saveNote()" 
                            [disabled]="isSubmitting()"
                            class="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 uppercase tracking-widest active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2">
                      @if (isSubmitting()) {
                        <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Uploading...</span>
                      } @else {
                        {{ editingNoteId() ? 'Update Material' : 'Publish Material' }}
                      }
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
                  <div class="flex items-center gap-6 flex-1">
                    <div class="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <mat-icon>{{ note.category === 'Video' ? 'play_circle' : 'description' }}</mat-icon>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{{ note.category }}</span>
                        @if (note.isProOnly) {
                          <span class="px-2 py-0.5 bg-amber-50 text-amber-600 text-[8px] font-black rounded-full border border-amber-100 uppercase tracking-widest">PRO</span>
                        }
                        <span class="px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black rounded-full border border-slate-200 uppercase tracking-widest">{{ note.destination }}</span>
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
              } @empty {
                <div class="text-center py-20 bg-white rounded-[3rem] border border-slate-200 border-dashed">
                  <mat-icon class="text-slate-200 !w-16 !h-16 !text-[64px] mb-4">folder_off</mat-icon>
                  <p class="text-slate-400 font-black uppercase tracking-widest">No materials in library</p>
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
                      <label for="exam-subject" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">School Level (e.g., MSCE)</label>
                      <input id="exam-subject" type="text" [ngModel]="examSubject()" (ngModelChange)="examSubject.set($event)" placeholder="e.g. MSCE" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900">
                    </div>
                    <div>
                      <label for="exam-date" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Exam Date</label>
                      <input id="exam-date" type="date" [ngModel]="examDate()" (ngModelChange)="examDate.set($event)" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900">
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
                      <input id="quiz-title" type="text" [ngModel]="quizTitle()" (ngModelChange)="quizTitle.set($event)" placeholder="Quiz Title" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label for="quiz-category" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                        <select id="quiz-category" [ngModel]="quizCategory()" (ngModelChange)="quizCategory.set($event)" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900 appearance-none">
                          <option value="Mathematics">Mathematics</option>
                          <option value="Science">Science</option>
                          <option value="Biology">Biology</option>
                          <option value="English">English</option>
                          <option value="History">History</option>
                        </select>
                      </div>
                      <div>
                        <label for="quiz-time" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Time (m)</label>
                        <input id="quiz-time" type="number" [ngModel]="quizTimeLimit()" (ngModelChange)="quizTimeLimit.set($event)" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900">
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
            <div class="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-x-auto">
              <table class="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-100">
                    <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                    <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  @for (student of dataService.users(); track student.uid) {
                    <tr class="hover:bg-slate-50/50 transition-colors">
                      <td class="px-8 py-6">
                        <div class="flex items-center gap-4">
                          <img ngSrc="{{student.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + student.uid}}" [alt]="student.displayName" width="40" height="40" class="rounded-full border border-slate-200" referrerpolicy="no-referrer">
                          <div>
                            <p class="text-sm font-black text-slate-900">{{ student.displayName }}</p>
                            <p class="text-[10px] text-slate-400 font-bold">{{ student.email }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="px-8 py-6">
                        <span [class]="student.isPro ? 'bg-sky-50 text-sky-600 border-sky-100' : 'bg-slate-100 text-slate-400 border-slate-200'" class="px-3 py-1 text-[10px] font-black rounded-full border uppercase tracking-widest">
                          {{ student.isPro ? 'PRO' : 'FREE' }}
                        </span>
                      </td>
                      <td class="px-8 py-6">
                        @if (student.role !== 'admin') {
                          <div class="flex items-center gap-3">
                            <button (click)="toggleProStatus(student.uid, !student.isPro)" 
                                    [class]="student.isPro ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'"
                                    class="px-4 py-2 text-[10px] font-black rounded-xl border uppercase tracking-widest transition-colors flex items-center gap-1">
                              <mat-icon class="!w-3 !h-3 !text-[12px]">{{ student.isPro ? 'remove_circle_outline' : 'add_circle_outline' }}</mat-icon>
                              {{ student.isPro ? 'Remove Pro' : 'Make Pro' }}
                            </button>
                          </div>
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
                      <input id="update-title" type="text" [ngModel]="updateTitle()" (ngModelChange)="updateTitle.set($event)" placeholder="Update Title" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900">
                    </div>
                    <div>
                      <label for="update-type" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Type</label>
                      <select id="update-type" [ngModel]="updateType()" (ngModelChange)="updateType.set($event)" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900 appearance-none">
                        <option value="feature">New Feature</option>
                        <option value="announcement">Announcement</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                    <div>
                      <label for="update-content" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Content</label>
                      <textarea id="update-content" [ngModel]="updateContent()" (ngModelChange)="updateContent.set($event)" rows="4" placeholder="Update details..." class="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900 resize-none"></textarea>
                    </div>
                    <div>
                      <label for="update-drive-url" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Drive URL (Optional)</label>
                      <input id="update-drive-url" type="text" [ngModel]="updateDriveUrl()" (ngModelChange)="updateDriveUrl.set($event)" placeholder="https://drive.google.com/..." class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900">
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
  geminiService = inject(GeminiService);
  router = inject(Router);
  
  isSidebarOpen = signal(false);
  activeTab = signal<'overview' | 'upload' | 'manage' | 'students' | 'quizzes' | 'revenue' | 'updates' | 'exams'>('overview');
  chartData = signal([
    { name: 'Jan', users: 100, revenue: 5000 },
    { name: 'Feb', users: 200, revenue: 15000 },
    { name: 'Mar', users: 400, revenue: 30000 }
  ]);
  
  title = signal('');
  category = signal('Mathematics');
  destination = signal<'notes' | 'past-papers' | 'announcements' | 'video-lessons'>('notes');
  content = signal('');
  driveUrl = signal('');
  youtubeUrl = signal('');
  isProOnly = signal(false);
  level = signal<'Primary' | 'Secondary'>('Secondary');
  form = signal('');
  isSubmitting = signal(false);
  editingNoteId = signal<string | null>(null);

  // SEO State
  seoTitle = signal('');
  seoDescription = signal('');
  slug = signal('');
  isGeneratingSEO = signal(false);

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

  private platformId = inject(PLATFORM_ID);

  goBack() {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && window.history.length > 1) {
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
      const updateData: Partial<AppUpdate> = {
        title: this.updateTitle(),
        content: this.updateContent(),
        type: this.updateType()
      };
      if (this.updateDriveUrl().trim()) {
        updateData.driveUrl = this.updateDriveUrl().trim();
      }
      await this.dataService.createAppUpdate(updateData as Omit<AppUpdate, 'id' | 'createdAt'>);
      this.updateTitle.set('');
      this.updateContent.set('');
      this.updateDriveUrl.set('');
      if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
        alert('Update published successfully!');
      }
    } catch (error) {
      console.error(error);
      if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
        alert('Failed to publish update. Please try again.');
      }
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
        date: new Date(this.examDate())
      });
      this.examSubject.set('');
      this.examDate.set('');
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
    this.destination.set(note.destination || 'notes');
    this.content.set(note.content || '');
    this.driveUrl.set(note.driveUrl || '');
    this.youtubeUrl.set(note.youtubeUrl || '');
    this.isProOnly.set(note.isProOnly);
    this.level.set(note.level || 'Secondary');
    this.form.set(note.form || '');
    this.seoTitle.set(note.seoTitle || '');
    this.seoDescription.set(note.seoDescription || '');
    this.slug.set(note.slug || '');
    this.editingNoteId.set(note.id);
    this.activeTab.set('upload');
  }

  cancelEdit() {
    this.title.set('');
    this.category.set('Mathematics');
    this.destination.set('notes');
    this.content.set('');
    this.driveUrl.set('');
    this.youtubeUrl.set('');
    this.isProOnly.set(false);
    this.level.set('Secondary');
    this.form.set('');
    this.seoTitle.set('');
    this.seoDescription.set('');
    this.slug.set('');
    this.editingNoteId.set(null);
    this.activeTab.set('manage');
  }

  async generateSEOAI() {
    if (!this.title().trim() || this.isGeneratingSEO()) return;
    this.isGeneratingSEO.set(true);
    try {
      const result = await this.geminiService.generateSEO(
        this.title(),
        this.category(),
        this.content() || 'Educational material for Malawian students.'
      );
      if (result) {
        this.seoTitle.set(result.seoTitle);
        this.seoDescription.set(result.seoDescription);
        // Generate slug if empty
        if (!this.slug().trim()) {
          this.slug.set(this.generateSlug(this.title()));
        }
      }
    } catch (error) {
      console.error('SEO Generation failed:', error);
    } finally {
      this.isGeneratingSEO.set(false);
    }
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  async deleteNote(noteId: string) {
    if (confirm('Delete this material?')) {
      await this.dataService.deleteNote(noteId);
    }
  }

  async saveNote() {
    if (!this.title().trim() || this.isSubmitting()) {
      if (!this.title().trim() && isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
        alert('Title is required');
      }
      return;
    }
    
    this.isSubmitting.set(true);
    try {
      const noteData: Partial<Note> = {
        title: this.title().trim(),
        category: this.category(),
        destination: this.destination(),
        isProOnly: this.isProOnly(),
        level: this.level(),
        form: this.form(),
        seoTitle: this.seoTitle().trim(),
        seoDescription: this.seoDescription().trim(),
        slug: this.slug().trim() || this.generateSlug(this.title())
      };
      
      if (this.content().trim()) noteData.content = this.content().trim();
      if (this.driveUrl().trim()) noteData.driveUrl = this.driveUrl().trim();
      if (this.youtubeUrl().trim()) noteData.youtubeUrl = this.youtubeUrl().trim();

      if (this.editingNoteId()) {
        await this.dataService.updateNote(this.editingNoteId()!, noteData);
        this.cancelEdit();
        if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
          alert('Material updated successfully!');
        }
      } else {
        await this.dataService.createNote(noteData as Omit<Note, 'id' | 'createdAt'>);
        this.title.set('');
        this.content.set('');
        this.driveUrl.set('');
        this.youtubeUrl.set('');
        this.isProOnly.set(false);
        this.seoTitle.set('');
        this.seoDescription.set('');
        this.slug.set('');
        if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
          alert('Material published successfully!');
        }
      }
    } catch (error) {
      console.error('Save failed:', error);
      if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
        alert('Failed to publish material. Please try again.');
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
