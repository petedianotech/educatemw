import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, OnDestroy, PLATFORM_ID, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService, Quiz, QuizQuestion, Note, AppUpdate } from '../../core/services/data.service';
import { GeminiService } from '../../core/services/gemini.service';
import { Timestamp } from 'firebase/firestore';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, DecimalPipe, CommonModule, NgOptimizedImage, isPlatformBrowser } from '@angular/common';

interface ChartData {
  name: string;
  month: number;
  year: number;
  users: number;
  pro: number;
  revenue: number;
  revenue_scaled: number;
}

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

            <button (click)="activeTab.set('videos'); isSidebarOpen.set(false)" 
                    [class.bg-gradient-to-r]="activeTab() === 'videos'"
                    [class.from-violet-400]="activeTab() === 'videos'"
                    [class.to-purple-600]="activeTab() === 'videos'"
                    [class.text-white]="activeTab() === 'videos'"
                    class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all font-bold text-sm">
              <mat-icon>videocam</mat-icon>
              <span>Videos</span>
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
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-lg font-black text-slate-900 uppercase tracking-tight">Growth & Revenue Trend</h3>
                  <div class="flex p-1 bg-slate-100 rounded-xl">
                    <button (click)="chartRange.set('7d')" 
                            [class.bg-white]="chartRange() === '7d'" 
                            [class.shadow-sm]="chartRange() === '7d'"
                            class="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                            [class.text-indigo-600]="chartRange() === '7d'"
                            [class.text-slate-500]="chartRange() !== '7d'">7D</button>
                    <button (click)="chartRange.set('30d')" 
                            [class.bg-white]="chartRange() === '30d'" 
                            [class.shadow-sm]="chartRange() === '30d'"
                            class="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                            [class.text-indigo-600]="chartRange() === '30d'"
                            [class.text-slate-500]="chartRange() !== '30d'">30D</button>
                    <button (click)="chartRange.set('year')" 
                            [class.bg-white]="chartRange() === 'year'" 
                            [class.shadow-sm]="chartRange() === 'year'"
                            class="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                            [class.text-indigo-600]="chartRange() === 'year'"
                            [class.text-slate-500]="chartRange() !== 'year'">1Y</button>
                  </div>
                </div>
                <div class="flex items-center gap-4 mb-6">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Students</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-rose-500"></div>
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pro Members</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue (k)</span>
                  </div>
                </div>
                <div class="h-64 relative flex">
                  @let data = chartData();
                  @let max = getMaxValue(data);
                  <!-- Y-Axis Labels -->
                  <div class="flex flex-col justify-between text-[8px] font-black text-slate-400 w-8 py-2">
                    <span>{{ max }}</span>
                    <span>{{ (max * 0.75) | number:'1.0-0' }}</span>
                    <span>{{ (max * 0.5) | number:'1.0-0' }}</span>
                    <span>{{ (max * 0.25) | number:'1.0-0' }}</span>
                    <span>0</span>
                  </div>

                  <div class="flex-1 relative">
                    <svg class="w-full h-full overflow-visible" viewBox="0 0 400 200" preserveAspectRatio="none">
                      <!-- Grid Lines -->
                      <line x1="0" y1="0" x2="400" y2="0" stroke="#f1f5f9" stroke-width="1" />
                      <line x1="0" y1="50" x2="400" y2="50" stroke="#f1f5f9" stroke-width="1" />
                      <line x1="0" y1="100" x2="400" y2="100" stroke="#f1f5f9" stroke-width="1" />
                      <line x1="0" y1="150" x2="400" y2="150" stroke="#f1f5f9" stroke-width="1" />
                      <line x1="0" y1="200" x2="400" y2="200" stroke="#f1f5f9" stroke-width="1" />

                      <!-- Lines -->
                      <path [attr.d]="getLinePath(data, 'users', 200, 400, max)" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                      <path [attr.d]="getLinePath(data, 'pro', 200, 400, max)" fill="none" stroke="#f43f5e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                      <path [attr.d]="getLinePath(data, 'revenue_scaled', 200, 400, max)" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                      
                      <!-- Area Fills -->
                      <path [attr.d]="getLinePath(data, 'users', 200, 400, max) + ' L 400,200 L 0,200 Z'" fill="url(#grad-blue)" opacity="0.1" />
                    </svg>
                    
                    <!-- X-Axis Labels -->
                    <div class="flex justify-between mt-4">
                      @for (m of data; track m.name + $index) {
                        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis max-w-[40px] text-center">{{ m.name }}</span>
                      }
                    </div>
                  </div>

                  <svg width="0" height="0" class="absolute">
                    <defs>
                      <linearGradient id="grad-blue" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0" />
                      </linearGradient>
                    </defs>
                  </svg>
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
                    <div class="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 mb-6">
                      <div class="flex items-center gap-3 mb-2">
                        <mat-icon class="text-indigo-600">info</mat-icon>
                        <h4 class="text-sm font-black text-slate-900 uppercase tracking-tight">Support for Videos</h4>
                      </div>
                      <p class="text-xs text-slate-600 font-medium leading-relaxed">
                        To publish a video lesson, set the <span class="font-black text-indigo-600">Publish Destination</span> to <span class="font-black">Video Lessons Section</span>. Paste any YouTube link below (including shorts or live).
                      </p>
                    </div>

                    <div>
                      <label for="youtube-url" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">YouTube URL</label>
                      <input id="youtube-url" type="text" [ngModel]="youtubeUrl()" (ngModelChange)="youtubeUrl.set($event)" placeholder="e.g. https://youtu.be/xxx or https://youtube.com/watch?v=xxx" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900">
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
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <label for="quiz-title" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Quiz Title</label>
                        <input id="quiz-title" type="text" [ngModel]="quizTitle()" (ngModelChange)="quizTitle.set($event)" placeholder="e.g. Biology Paper 1 Mock" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900">
                      </div>
                      <div>
                        <label for="quiz-category" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                        <div class="relative">
                          <select id="quiz-category" [ngModel]="quizCategory()" (ngModelChange)="quizCategory.set($event)" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer">
                            <option value="Mathematics">Mathematics</option>
                            <option value="English">English</option>
                            <option value="Biology">Biology</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Physics">Physics</option>
                            <option value="Agriculture">Agriculture</option>
                            <option value="Geography">Geography</option>
                            <option value="History">History</option>
                          </select>
                          <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-indigo-500">
                            <mat-icon>expand_more</mat-icon>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label for="quiz-desc" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description (Optional)</label>
                        <input id="quiz-desc" type="text" [ngModel]="quizDescription()" (ngModelChange)="quizDescription.set($event)" placeholder="Short info about the quiz" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900">
                      </div>
                    </div>
                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label for="quiz-time" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Time (m)</label>
                          <input id="quiz-time" type="number" [ngModel]="quizTimeLimit()" (ngModelChange)="quizTimeLimit.set($event)" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900">
                        </div>
                        <div class="flex items-end">
                          <label class="flex items-center gap-3 cursor-pointer w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-colors"
                                 [class.bg-indigo-50]="quizIsProOnly()" [class.border-indigo-200]="quizIsProOnly()">
                            <div class="relative flex items-center justify-center w-6 h-6 rounded border-2 transition-colors"
                                 [class.border-indigo-600]="quizIsProOnly()" [class.bg-indigo-600]="quizIsProOnly()"
                                 [class.border-slate-300]="!quizIsProOnly()" [class.bg-white]="!quizIsProOnly()">
                              <input type="checkbox" [ngModel]="quizIsProOnly()" (ngModelChange)="quizIsProOnly.set($event)" class="opacity-0 absolute inset-0 cursor-pointer w-full h-full">
                              @if (quizIsProOnly()) {
                                <mat-icon class="text-white !w-4 !h-4 !text-[16px]">check</mat-icon>
                              }
                            </div>
                            <span class="text-sm font-black uppercase tracking-tight" [class.text-indigo-700]="quizIsProOnly()" [class.text-slate-700]="!quizIsProOnly()">Pro Only</span>
                          </label>
                        </div>
                      </div>

                      <div class="pt-6 border-t border-slate-100">
                        <div class="flex items-center justify-between mb-4">
                          <h4 class="text-sm font-black text-slate-900 uppercase tracking-tight">Questions ({{ quizQuestions().length }}/10)</h4>
                          @if (quizQuestions().length < 10) {
                            <button (click)="addQuestion()" class="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all">
                              <mat-icon class="!w-4 !h-4 !text-[16px]">add</mat-icon>
                              Add
                            </button>
                          }
                        </div>

                        <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          @for (q of quizQuestions(); track $index) {
                            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative group">
                              <button (click)="removeQuestion($index)" class="absolute top-2 right-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                <mat-icon class="!w-4 !h-4 !text-[16px]">delete</mat-icon>
                              </button>
                              
                              <div>
                                <label [attr.for]="'q-text-' + $index" class="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Question {{ $index + 1 }}</label>
                                <input type="text" [attr.id]="'q-text-' + $index" [(ngModel)]="q.text" placeholder="Enter question..." class="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 text-sm font-bold">
                              </div>

                              <div class="grid grid-cols-2 gap-2">
                                <div>
                                  <label [attr.for]="'q-opt-a-' + $index" class="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Option A</label>
                                  <input type="text" [attr.id]="'q-opt-a-' + $index" [(ngModel)]="q.options![0]" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold">
                                </div>
                                <div>
                                  <label [attr.for]="'q-opt-b-' + $index" class="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Option B</label>
                                  <input type="text" [attr.id]="'q-opt-b-' + $index" [(ngModel)]="q.options![1]" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold">
                                </div>
                                <div>
                                  <label [attr.for]="'q-opt-c-' + $index" class="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Option C</label>
                                  <input type="text" [attr.id]="'q-opt-c-' + $index" [(ngModel)]="q.options![2]" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold">
                                </div>
                                <div>
                                  <label [attr.for]="'q-opt-d-' + $index" class="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Option D</label>
                                  <input type="text" [attr.id]="'q-opt-d-' + $index" [(ngModel)]="q.options![3]" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold">
                                </div>
                              </div>

                              <div>
                                <label [attr.for]="'q-correct-' + $index" class="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Correct Answer</label>
                                <select [attr.id]="'q-correct-' + $index" [(ngModel)]="q.correctAnswer" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold appearance-none">
                                  <option value="">Select Answer</option>
                                  <option [value]="q.options![0]">A: {{ q.options![0] }}</option>
                                  <option [value]="q.options![1]">B: {{ q.options![1] }}</option>
                                  <option [value]="q.options![2]">C: {{ q.options![2] }}</option>
                                  <option [value]="q.options![3]">D: {{ q.options![3] }}</option>
                                </select>
                              </div>
                            </div>
                          }
                        </div>
                      </div>

                      <div class="flex gap-4 pt-4">
                        @if (editingQuizId()) {
                          <button (click)="resetQuizForm()" class="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all uppercase tracking-widest">Cancel</button>
                        }
                        <button (click)="saveQuiz()" [disabled]="isSubmitting() || quizQuestions().length === 0" class="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2">
                          @if (isSubmitting()) {
                            <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Publishing...</span>
                          } @else {
                            {{ editingQuizId() ? 'Update & Publish' : 'Publish Quiz' }}
                          }
                        </button>
                      </div>
                  </div>
                </div>
              </div>

              <!-- Quiz List -->
              <div class="lg:col-span-2 space-y-4">
                <div class="flex items-center gap-3 mb-4 sticky top-0 bg-white/90 backdrop-blur-sm z-10 py-2">
                  <button (click)="quizFilter.set('all')" [class]="quizFilter() === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'" class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">All</button>
                  <button (click)="quizFilter.set('Teacher')" [class]="quizFilter() === 'Teacher' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'" class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Teacher</button>
                  <button (click)="quizFilter.set('AI')" [class]="quizFilter() === 'AI' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'" class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">AI</button>
                </div>

                @for (quiz of filteredAdminQuizzes(); track quiz.id) {
                  <div class="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
                    <div class="flex items-center gap-6">
                      <div class="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                        <mat-icon>quiz</mat-icon>
                      </div>
                      <div>
                        <div class="flex items-center gap-2 mb-1">
                          <h4 class="text-lg font-black text-slate-900 tracking-tight">{{ quiz.title }}</h4>
                          @if (quiz.source) {
                            <span [class]="quiz.source === 'AI' ? 'bg-slate-900 text-white' : 'bg-indigo-100 text-indigo-700'" class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">{{ quiz.source }}</span>
                          }
                        </div>
                        <div class="flex items-center gap-2 mt-1">
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ quiz.category }} • {{ quiz.questions.length }} Questions</p>
                          @if (quiz.isProOnly) {
                            <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[8px] font-black uppercase tracking-widest border border-indigo-100">PRO Only</span>
                          }
                        </div>
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
            <div class="mb-6 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-4">
              <mat-icon class="text-slate-400">search</mat-icon>
              <input type="text" 
                     [ngModel]="studentSearchQuery()" 
                     (ngModelChange)="studentSearchQuery.set($event)"
                     placeholder="Search students by name, email or UID..." 
                     class="flex-1 bg-transparent border-none outline-none font-bold text-slate-900 placeholder:text-slate-300">
              @if (studentSearchQuery()) {
                <button (click)="studentSearchQuery.set('')" class="text-slate-400 hover:text-slate-600">
                  <mat-icon class="!w-5 !h-5 !text-[20px]">close</mat-icon>
                </button>
              }
            </div>

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
                  @for (student of filteredStudents(); track student.uid) {
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

          @if (activeTab() === 'videos') {
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Upload Form -->
              <div class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                <h3 class="text-xl font-black text-slate-900">Add Video Lesson</h3>
                
                <div>
                  <label for="videoTitle" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Video Title</label>
                  <input id="videoTitle" [ngModel]="videoTitle()" (ngModelChange)="videoTitle.set($event)" placeholder="E.g., Intro to Algebra" class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 mt-1">
                </div>

                <div>
                  <label for="videoDescription" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea id="videoDescription" [ngModel]="videoDescription()" (ngModelChange)="videoDescription.set($event)" rows="3" placeholder="Briefly describe this lesson..." class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 mt-1 resize-none"></textarea>
                </div>

                <div>
                  <label for="videoUrl" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">YouTube URL</label>
                  <input id="videoUrl" [ngModel]="videoUrl()" (ngModelChange)="videoUrl.set($event)" placeholder="https://youtube.com/watch?v=..." class="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 mt-1">
                  <p class="text-[10px] font-medium text-slate-400 mt-2 ml-1">Paste a standard YouTube link, short, or list URL.</p>
                </div>
                
                <button (click)="saveVideo()" [disabled]="isSubmitting() || !videoTitle().trim() || !videoUrl().trim()" class="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6">
                  {{ isSubmitting() ? 'Publishing...' : 'Publish Video Lesson' }}
                </button>
              </div>
              
              <!-- Video List -->
              <div class="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                @for (video of dataService.videoLessons(); track video.id) {
                  <div class="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 hover:shadow-md transition-all">
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                        <mat-icon>play_circle</mat-icon>
                      </div>
                      <div>
                        <h4 class="font-black text-slate-900 tracking-tight line-clamp-1 truncate block max-w-[200px] sm:max-w-xs">{{ video.title }}</h4>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{{ video.category }}</p>
                      </div>
                    </div>
                    <button (click)="deleteVideo(video.id)" title="Delete video" class="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                      <mat-icon class="!w-5 !h-5 !text-[20px]">delete</mat-icon>
                    </button>
                  </div>
                } @empty {
                  <div class="text-center py-20 bg-white rounded-[3rem] border border-slate-200 border-dashed">
                    <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <mat-icon class="!w-8 !h-8 !text-[32px]">videocam_off</mat-icon>
                    </div>
                    <p class="text-slate-400 font-black uppercase tracking-widest">No video lessons published</p>
                  </div>
                }
              </div>
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
              <div class="lg:col-span-1 space-y-8">
                <!-- App Download Info -->
                <div class="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                  <div class="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                  <h3 class="text-xl font-black mb-4 flex items-center gap-2">
                    <mat-icon class="text-indigo-400">install_mobile</mat-icon>
                    PWA Installation
                  </h3>
                  <p class="text-slate-300 text-sm font-medium leading-relaxed mb-6">
                    Use the button below to control whether students see the APK download reward banner. When activated, users will see the offer and can claim rewards upon downloading.
                  </p>
                  
                  <div class="mb-6">
                    <button (click)="toggleAppOffer()" 
                            [class]="dataService.appSettings().isAppOfferActive ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'"
                            class="w-full py-4 text-white rounded-2xl font-black shadow-xl transition-all uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2">
                      <mat-icon>{{ dataService.appSettings().isAppOfferActive ? 'pause_circle_outline' : 'play_circle_outline' }}</mat-icon>
                      {{ dataService.appSettings().isAppOfferActive ? 'Pause App Offer' : 'Activate App Offer' }}
                    </button>
                  </div>

                  <div class="space-y-3">
                    <div class="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/10 opacity-50">
                      <mat-icon class="text-slate-400">block</mat-icon>
                      <span class="text-xs font-bold text-slate-400 line-through">Rewards Paused</span>
                    </div>
                  </div>
                </div>

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
                      <div class="flex items-center gap-3">
                        <span [class]="update.type === 'feature' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'" class="px-3 py-1 text-[10px] font-black rounded-full border uppercase tracking-widest">
                          {{ update.type }}
                        </span>
                        <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ toDate(update.createdAt) | date:'mediumDate' }}</span>
                      </div>
                      <button (click)="deleteAppUpdate(update.id)" class="w-8 h-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-all">
                        <mat-icon class="!w-4 !h-4 !text-[16px]">delete</mat-icon>
                      </button>
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

      <!-- Notification Toast -->
      @if (notification(); as n) {
        <div class="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div [class]="n.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'" 
               class="px-6 py-4 rounded-2xl text-white font-black shadow-2xl flex items-center gap-3">
            <mat-icon>{{ n.type === 'success' ? 'check_circle' : 'error' }}</mat-icon>
            <span class="text-sm uppercase tracking-widest">{{ n.message }}</span>
          </div>
        </div>
      }
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
  activeTab = signal<'overview' | 'upload' | 'manage' | 'students' | 'quizzes' | 'revenue' | 'updates' | 'exams' | 'videos'>('overview');
  chartRange = signal<'7d' | '30d' | 'year'>('7d');

  chartData = computed(() => {
    const users = this.dataService.users();
    const revenue = this.dataService.revenueRecords();
    const range = this.chartRange();
    
    const segments: {
      name: string;
      start: Date;
      end: Date;
      users: number;
      pro: number;
      revenue: number;
    }[] = [];

    const now = new Date();
    
    if (range === '7d') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const endDay = new Date(d);
        endDay.setHours(23, 59, 59, 999);
        segments.push({
          name: d.toLocaleDateString('default', { weekday: 'short' }),
          start: d,
          end: endDay,
          users: 0,
          pro: 0,
          revenue: 0
        });
      }
    } else if (range === '30d') {
      for (let i = 29; i >= 0; i -= 2) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const endDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i - 1));
        endDay.setHours(23, 59, 59, 999);
        segments.push({
          name: d.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
          start: d,
          end: endDay,
          users: 0,
          pro: 0,
          revenue: 0
        });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
        segments.push({
          name: d.toLocaleString('default', { month: 'short' }),
          start: d,
          end: lastDay,
          users: 0,
          pro: 0,
          revenue: 0
        });
      }
    }

    users.forEach(u => {
      const d = this.toDate(u.createdAt);
      if (d) {
        const s = segments.find(seg => d >= seg.start && d <= seg.end);
        if (s) {
          s.users++;
          if (u.isPro) s.pro++;
        }
      }
    });

    revenue.forEach(r => {
      const d = this.toDate(r.createdAt);
      if (d) {
        const s = segments.find(seg => d >= seg.start && d <= seg.end);
        if (s) s.revenue += r.amount;
      }
    });

    // Initial cumulative values (users already in system before the visible range)
    const firstSegmentStart = segments[0].start;
    let cumulativeUsers = users.filter(u => {
      const d = this.toDate(u.createdAt);
      return d && d < firstSegmentStart;
    }).length;
    
    let cumulativePro = users.filter(u => {
      const d = this.toDate(u.createdAt);
      return d && u.isPro && d < firstSegmentStart;
    }).length;

    // We only want cumulative if it's year or 30d? 
    // Usually "Growth" implies cumulative.
    return segments.map(s => {
      cumulativeUsers += s.users;
      cumulativePro += s.pro;
      return {
        name: s.name,
        month: s.start.getMonth(),
        year: s.start.getFullYear(),
        users: cumulativeUsers,
        pro: cumulativePro,
        revenue: s.revenue,
        revenue_scaled: s.revenue / 1000 
      } as ChartData;
    });
  });

  // SVG Chart Helpers
  getLinePath(data: ChartData[], key: keyof ChartData, height: number, width: number, maxVal: number): string {
    if (data.length <= 1) return '';
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d[key] as number) / (maxVal || 1)) * height;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  }

  getMaxValue(data: ChartData[]): number {
    if (data.length === 0) return 10;
    const vals = data.flatMap(d => [d.users, d.pro, d.revenue_scaled]);
    return Math.max(...vals, 10);
  }
  
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
  notification = signal<{ message: string, type: 'success' | 'error' } | null>(null);

  showNotification(message: string, type: 'success' | 'error' = 'success') {
    this.notification.set({ message, type });
    setTimeout(() => this.notification.set(null), 3000);
  }

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

  studentSearchQuery = signal('');

  quizFilter = signal<'all' | 'AI' | 'Teacher'>('all');
  
  videoTitle = signal('');
  videoDescription = signal('');
  videoUrl = signal('');
  videoCategory = signal('Mathematics');

  filteredAdminQuizzes = computed(() => {
    const list = this.dataService.quizzes();
    if (this.quizFilter() === 'all') return list;
    return list.filter(q => q.source === this.quizFilter());
  });

  filteredStudents = computed(() => {
    const users = this.dataService.users();
    const baseFiltered = users.filter(u => u.role !== 'admin' && !u.isGuest);
    const query = this.studentSearchQuery().toLowerCase().trim();
    if (!query) return baseFiltered;
    return baseFiltered.filter(u => 
      u.displayName?.toLowerCase().includes(query) || 
      u.email?.toLowerCase().includes(query) ||
      u.uid.toLowerCase().includes(query)
    );
  });

  totalStudents = computed(() => this.dataService.totalUserCount() || this.dataService.users().length);
  proSubscribers = computed(() => this.dataService.totalProCount() || this.dataService.users().filter(u => u.isPro).length);
  totalMaterials = computed(() => this.dataService.notes().length);
  totalQuizzes = computed(() => this.dataService.totalQuizCount() || this.dataService.quizzes().length);
  revenueRecords = computed(() => this.dataService.revenueRecords());
  totalRevenue = computed(() => this.revenueRecords().reduce((acc, curr) => acc + curr.amount, 0));

  toDate(date: Date | Timestamp | string | null): Date | null {
    if (!date) return null;
    if (date instanceof Timestamp) return date.toDate();
    if (date instanceof Date) return date;
    return new Date(date);
  }

  ngOnInit() {
    this.dataService.subscribeToSettings();
    this.dataService.subscribeToUsers(1000);
    this.dataService.fetchTotalCounts();
    this.dataService.subscribeToNotes();
    this.dataService.subscribeToQuizzes();
    this.dataService.subscribeToRevenue();
    this.dataService.subscribeToAppUpdates();
    this.dataService.subscribeToExamDates();
    this.dataService.subscribeToVideoLessons();
  }

  ngOnDestroy() {
    this.dataService.unsubscribeFromSettings();
    this.dataService.unsubscribeFromUsers();
    this.dataService.unsubscribeFromNotes();
    this.dataService.unsubscribeFromQuizzes();
    this.dataService.unsubscribeFromRevenue();
    this.dataService.unsubscribeFromAppUpdates();
    this.dataService.unsubscribeFromExamDates();
    this.dataService.unsubscribeFromVideoLessons();
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

  async toggleAppOffer() {
    const currentState = this.dataService.appSettings().isAppOfferActive;
    await this.dataService.updateSetting('isAppOfferActive', !currentState);
    this.showNotification(`App Offer ${!currentState ? 'Activated' : 'Paused'}`);
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
      
      const url = this.updateDriveUrl().trim();
      if (url) {
        updateData.driveUrl = url;
      }
      
      await this.dataService.createAppUpdate(updateData as Omit<AppUpdate, 'id' | 'createdAt'>);
      this.updateTitle.set('');
      this.updateContent.set('');
      this.updateDriveUrl.set('');
      this.showNotification('Update published successfully!');
    } catch (error) {
      console.error(error);
      this.showNotification('Failed to publish update. Please try again.', 'error');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async deleteAppUpdate(id: string) {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && !window.confirm('Delete this update?')) return;
    try {
      await this.dataService.deleteAppUpdate(id);
      this.showNotification('Update deleted successfully!');
    } catch (error) {
      console.error(error);
      this.showNotification('Failed to delete update.', 'error');
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

  async saveVideo() {
    if (!this.videoTitle().trim() || !this.videoUrl().trim() || this.isSubmitting()) return;
    this.isSubmitting.set(true);
    try {
      await this.dataService.createVideoLesson({
        title: this.videoTitle(),
        description: this.videoDescription(),
        youtubeUrl: this.videoUrl(),
        category: this.videoCategory()
      });
      this.videoTitle.set('');
      this.videoDescription.set('');
      this.videoUrl.set('');
      this.showNotification('Video lesson published successfully!');
    } catch (error) {
      console.error(error);
      this.showNotification('Failed to publish video.', 'error');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async deleteVideo(videoId: string) {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && !window.confirm('Delete this video?')) return;
    try {
      await this.dataService.deleteVideoLesson(videoId);
      this.showNotification('Video deleted');
    } catch (error) {
      console.error(error);
      this.showNotification('Failed to delete video.', 'error');
    }
  }

  addQuestion() {
    if (this.quizQuestions().length >= 10) return;
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
        authorId: 'admin',
        source: 'Teacher' as 'AI' | 'Teacher'
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
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      if (window.confirm('Delete this quiz?')) {
        await this.dataService.deleteQuiz(quizId);
        this.showNotification('Quiz deleted');
      }
    } else {
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
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      const confirmed = window.confirm('Are you sure you want to delete this material? This action cannot be undone.');
      if (confirmed) {
        try {
          await this.dataService.deleteNote(noteId);
        } catch (error) {
          console.error('Delete failed:', error);
        }
      }
    } else {
      // Fallback for non-browser environments if needed, but usually delete is user-triggered
      await this.dataService.deleteNote(noteId);
    }
  }

  async deleteExamDate(dateId: string) {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      if (window.confirm('Delete this exam date?')) {
        await this.dataService.deleteExamDate(dateId);
        this.showNotification('Exam date deleted');
      }
    } else {
      await this.dataService.deleteExamDate(dateId);
    }
  }

  async saveNote() {
    if (!this.title().trim() || this.isSubmitting()) {
      if (!this.title().trim()) {
        this.showNotification('Title is required', 'error');
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
        this.showNotification('Material updated successfully!');
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
        this.showNotification('Material published successfully!');
      }
    } catch (error) {
      console.error('Save failed:', error);
      this.showNotification('Failed to publish material. Please try again.', 'error');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
