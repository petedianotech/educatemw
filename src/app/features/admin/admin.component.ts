import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, MatIconModule, DatePipe],
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
                <mat-icon class="!w-5 !h-5 !text-[20px]">auto_awesome</mat-icon>
              </div>
              <p class="text-xs text-slate-500 font-semibold mb-1">Free Users</p>
              <h3 class="text-2xl font-bold text-slate-900">{{ totalStudents() - proSubscribers() }}</h3>
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
                          <input type="checkbox" [checked]="student.isPro" (change)="toggleProStatus(student.uid, !student.isPro)" class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-2 appearance-none cursor-pointer transition-transform duration-200 ease-in-out" [class.translate-x-5]="student.isPro" [class.border-sky-500]="student.isPro" [class.border-slate-300]="!student.isPro"/>
                          <label class="toggle-label block overflow-hidden h-5 rounded-full bg-slate-300 cursor-pointer transition-colors duration-200 ease-in-out" [class.bg-sky-400]="student.isPro"></label>
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
  
  activeTab = signal<'overview' | 'upload' | 'manage' | 'students'>('overview');
  
  title = signal('');
  category = signal('Mathematics');
  content = signal('');
  driveUrl = signal('');
  youtubeUrl = signal('');
  isProOnly = signal(false);
  isSubmitting = signal(false);
  editingNoteId = signal<string | null>(null);

  totalStudents = computed(() => this.dataService.users().length);
  proSubscribers = computed(() => this.dataService.users().filter(u => u.isPro).length);
  totalMaterials = computed(() => this.dataService.notes().length);

  toDate(date: any): Date | null {
    if (!date) return null;
    if (date.toDate) return date.toDate();
    return date as Date;
  }

  ngOnInit() {
    this.dataService.subscribeToUsers();
    this.dataService.subscribeToNotes();
  }

  ngOnDestroy() {
    this.dataService.unsubscribeFromUsers();
    this.dataService.unsubscribeFromNotes();
  }

  goBack() {
    window.history.back();
  }

  async toggleProStatus(userId: string, isPro: boolean) {
    await this.dataService.updateUserProStatus(userId, isPro);
  }

  editNote(note: any) {
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
