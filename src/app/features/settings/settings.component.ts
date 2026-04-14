import { ChangeDetectionStrategy, Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { CommonModule, NgOptimizedImage, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [MatIconModule, FormsModule, CommonModule, RouterLink, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 pb-safe">
      <!-- Header -->
      <header class="px-4 py-3 flex items-center gap-3 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm sticky top-0 z-10 pt-safe">
        <a routerLink="/dashboard" class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 active:scale-90 transition-all">
          <mat-icon class="text-[22px]">arrow_back</mat-icon>
        </a>
        <h1 class="text-xl font-bold text-slate-900">Settings & Profile</h1>
      </header>

      <div class="p-4 max-w-2xl mx-auto space-y-4 mt-2 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
        
        <!-- Profile Section -->
        <section class="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
          <div class="relative h-24 bg-gradient-to-r from-indigo-600 to-blue-500">
            <div class="absolute inset-0 bg-black/5"></div>
          </div>
          <div class="px-6 pb-6 -mt-12 relative flex flex-col items-center sm:flex-row sm:items-end sm:gap-6 sm:text-left">
            <div class="relative">
              <img ngSrc="{{authService.currentUser()?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + authService.currentUser()?.uid}}" 
                   alt="Profile" 
                   width="96"
                   height="96"
                   class="rounded-[1.5rem] bg-slate-100 border-4 border-white shadow-xl object-cover cursor-pointer hover:opacity-80 transition-all" 
                   (click)="fileInput.click()"
                   (keydown.enter)="fileInput.click()"
                   tabindex="0"
                   referrerpolicy="no-referrer">
              <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" class="hidden">
            </div>
            <div class="mt-4 sm:mt-0 flex-1">
              <h2 class="text-xl font-black text-slate-900 leading-tight">{{authService.currentUser()?.displayName}}</h2>
              <div class="flex items-center gap-2 mt-1.5 justify-center sm:justify-start">
                <span class="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                  {{authService.currentUser()?.isPro ? 'PRO MEMBER' : 'FREE STUDENT'}}
                </span>
                @if (authService.currentUser()?.role === 'admin') {
                  <span class="px-2.5 py-0.5 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-rose-100">
                    ADMIN
                  </span>
                }
              </div>
            </div>
          </div>
          
          <div class="px-6 pb-6 space-y-4">
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <label for="username" class="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Display Name</label>
              <div class="flex gap-2">
                <input type="text" id="username" [(ngModel)]="newUsername" placeholder="New name" 
                       class="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all outline-none text-sm text-slate-700 shadow-sm">
                <button (click)="updateUsername()" [disabled]="!newUsername().trim() || isUpdating()" 
                        class="px-4 bg-indigo-600 text-white rounded-xl font-black shadow-md shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center">
                  <mat-icon class="!w-5 !h-5 !text-[20px]">save</mat-icon>
                </button>
              </div>
            </div>

            @if (updateMsg()) {
              <div class="bg-emerald-50 text-emerald-600 p-3 rounded-xl border border-emerald-100 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <mat-icon class="text-xs">check_circle</mat-icon>
                {{updateMsg()}}
              </div>
            }
          </div>
        </section>

        <!-- Security Questions Section -->
        <section class="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
          <div class="p-5 border-b border-slate-50">
            <h3 class="font-black text-slate-900 text-sm flex items-center gap-2">
              <mat-icon class="text-indigo-600 text-sm">security</mat-icon>
              Security Questions
            </h3>
          </div>
          <div class="p-5 space-y-4">
            <p class="text-[10px] text-slate-500 font-medium leading-tight px-1">
              Set these questions to recover your account if you forget your password.
            </p>
            
            <div class="space-y-4">
              <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label for="ans1" class="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Question 1: What is your home district?</label>
                <input type="text" id="ans1" [(ngModel)]="ans1" placeholder="Your answer" 
                       class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all outline-none text-sm text-slate-700 shadow-sm">
              </div>
              
              <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label for="ans2" class="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Question 2: What is your mother's maiden name?</label>
                <input type="text" id="ans2" [(ngModel)]="ans2" placeholder="Your answer" 
                       class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all outline-none text-sm text-slate-700 shadow-sm">
              </div>
            </div>

            <button (click)="saveSecurityQuestions()" [disabled]="!ans1().trim() || !ans2().trim() || isUpdating()" 
                    class="w-full py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2">
              <mat-icon class="text-sm">verified_user</mat-icon>
              Save Security Questions
            </button>
          </div>
        </section>

        <!-- Referral System -->
        <section class="bg-slate-950 rounded-[2rem] p-6 text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden border border-white/5">
          <!-- Decorative background -->
          <div class="absolute top-0 right-0 w-48 h-48 bg-indigo-600/20 rounded-full -mr-24 -mt-24 blur-[60px]"></div>
          
          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                <mat-icon class="!w-6 !h-6 !text-[24px]">share</mat-icon>
              </div>
              <div>
                <h3 class="text-xl font-black tracking-tight leading-none">Refer & Earn</h3>
                <p class="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1.5">Get 10 AI Credits per friend</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-6">
              <div class="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Your Code</p>
                <p class="text-xl font-black text-white tracking-wider">{{authService.currentUser()?.referralCode}}</p>
              </div>
              <div class="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Referrals</p>
                <p class="text-xl font-black text-white">{{authService.currentUser()?.referralsCount || 0}}</p>
              </div>
            </div>

            <button (click)="shareApp()" 
                    class="w-full py-4 bg-white text-slate-950 rounded-xl font-black shadow-xl hover:bg-slate-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm">
              <mat-icon class="text-sm">send</mat-icon>
              Share Link
            </button>
          </div>
        </section>

        <!-- Account Info -->
        <section class="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
          <div class="p-5 border-b border-slate-50">
            <h3 class="font-black text-slate-900 text-sm flex items-center gap-2">
              <mat-icon class="text-indigo-600 text-sm">account_circle</mat-icon>
              Account Status
            </h3>
          </div>
          <div class="p-5 space-y-3">
            <div class="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl">
              <div>
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Subscription</p>
                <p class="font-black text-slate-900 text-sm">{{ authService.currentUser()?.isPro ? 'Pro Member' : 'Free Tier' }}</p>
              </div>
              @if (!authService.currentUser()?.isPro) {
                <button (click)="router.navigate(['/upgrade'])" class="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-100">
                  Upgrade
                </button>
              }
            </div>
            
            <div class="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl">
              <div>
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI Credits</p>
                <p class="font-black text-slate-900 text-sm">Questions & Flashcards</p>
              </div>
              <div class="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-black shadow-lg shadow-indigo-100 text-xs">
                <mat-icon class="!w-3.5 !h-3.5 !text-[14px]">bolt</mat-icon>
                {{ authService.currentUser()?.isPro || authService.currentUser()?.role === 'admin' ? 'Unlimited' : (authService.currentUser()?.aiCredits ?? 5) }}
              </div>
            </div>
          </div>
        </section>

        <!-- Actions -->
        <section class="space-y-3">
          @if (isAdmin()) {
            <button (click)="router.navigate(['/admin'])" class="w-full p-5 bg-white rounded-2xl flex items-center gap-4 text-indigo-600 shadow-sm border border-slate-100 font-black hover:bg-indigo-50 transition-all">
              <mat-icon>admin_panel_settings</mat-icon>
              <span>Admin Dashboard</span>
            </button>
          }
          <button (click)="logout()" class="w-full p-5 bg-white rounded-2xl flex items-center gap-4 text-rose-500 shadow-sm border border-slate-100 font-black hover:bg-rose-50 transition-all">
            <mat-icon>logout</mat-icon>
            <span>Sign Out</span>
          </button>
        </section>

        <!-- Terms and Privacy -->
        <div class="flex flex-col items-center gap-4 py-8">
          <div class="flex items-center justify-center gap-6">
            <a routerLink="/terms" class="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Terms</a>
            <a routerLink="/privacy" class="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Privacy</a>
          </div>
          
          <div class="flex flex-col items-center gap-1">
            <p class="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
              Display Version: <span class="text-indigo-400">1.0.0</span> (13/04/2026)
            </p>
            <div class="h-[1px] w-8 bg-slate-200"></div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class SettingsComponent {
  authService = inject(AuthService);
  router = inject(Router);
  dataService = inject(DataService);
  platformId = inject(PLATFORM_ID);
  
  newUsername = signal('');
  isUpdating = signal(false);
  updateMsg = signal('');

  ans1 = signal('');
  ans2 = signal('');

  constructor() {
    const user = this.authService.currentUser();
    if (user) {
      this.newUsername.set(user.displayName || '');
      if (user.securityQuestions && user.securityQuestions.length >= 2) {
        this.ans1.set(user.securityQuestions[0].answer);
        this.ans2.set(user.securityQuestions[1].answer);
      }
    }
  }

  isAdmin(): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    return user.email === 'petedianotech@gmail.com' || user.email === 'mscepreparation@gmail.com' || user.role === 'admin';
  }

  async updateUsername() {
    const name = this.newUsername().trim();
    if (!name) return;
    
    this.isUpdating.set(true);
    this.updateMsg.set('');
    try {
      await this.authService.updateUsername(name);
      this.updateMsg.set('Username updated successfully!');
      setTimeout(() => this.updateMsg.set(''), 3000);
    } catch (error) {
      console.error('Failed to update username', error);
      this.updateMsg.set('Failed to update username.');
    } finally {
      this.isUpdating.set(false);
    }
  }

  async saveSecurityQuestions() {
    const a1 = this.ans1().trim();
    const a2 = this.ans2().trim();
    if (!a1 || !a2) return;

    this.isUpdating.set(true);
    this.updateMsg.set('');
    try {
      await this.authService.saveSecurityQuestions([
        { question: 'What is your home district?', answer: a1 },
        { question: "What is your mother's maiden name?", answer: a2 }
      ]);
      this.updateMsg.set('Security questions saved successfully!');
      setTimeout(() => this.updateMsg.set(''), 3000);
    } catch (error) {
      console.error('Failed to save security questions', error);
      this.updateMsg.set('Failed to save security questions.');
    } finally {
      this.isUpdating.set(false);
    }
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.isUpdating.set(true);
    this.updateMsg.set('Uploading...');
    try {
      await this.authService.uploadProfilePicture(file);
      this.updateMsg.set('Profile picture updated successfully!');
      setTimeout(() => this.updateMsg.set(''), 3000);
    } catch (error) {
      console.error('Failed to upload profile picture', error);
      this.updateMsg.set('Failed to upload profile picture.');
    } finally {
      this.isUpdating.set(false);
    }
  }

  getReferralLink() {
    const user = this.authService.currentUser();
    if (!user) return '';
    const baseUrl = isPlatformBrowser(this.platformId) && typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}?ref=${user.referralCode}`;
  }

  async shareApp() {
    const link = this.getReferralLink();
    if (isPlatformBrowser(this.platformId) && typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Educate MW',
          text: 'Join me on Educate MW and master your MSCE subjects with AI! Use my link to get started:',
          url: link
        });
      } catch (err) {
        console.log('Share failed', err);
        // Fallback to copy if share fails or is cancelled
        this.copyToClipboard(link);
      }
    } else {
      this.copyToClipboard(link);
    }
  }

  copyToClipboard(link: string) {
    if (isPlatformBrowser(this.platformId) && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(link);
      this.updateMsg.set('Referral link copied to clipboard!');
      setTimeout(() => this.updateMsg.set(''), 3000);
    }
  }

  async logout() {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && window.confirm('Are you sure you want to sign out?')) {
      await this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  goBack() {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      window.history.back();
    }
  }
}

