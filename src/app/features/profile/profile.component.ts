import { ChangeDetectionStrategy, Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, NgOptimizedImage, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-profile',
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
        <h1 class="text-xl font-bold text-slate-900">My Profile</h1>
      </header>

      <div class="p-4 max-w-2xl mx-auto space-y-4 mt-2 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
        
        <!-- Profile Section -->
        <section class="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
          <div class="relative h-24 bg-gradient-to-r from-indigo-600 to-blue-500">
            <div class="absolute inset-0 bg-black/5"></div>
          </div>
          <div class="px-6 pb-6 -mt-12 relative flex flex-col items-center sm:flex-row sm:items-end sm:gap-6 sm:text-left">
              <div class="relative group">
                <div class="relative">
                  <img ngSrc="{{authService.currentUser()?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + authService.currentUser()?.uid}}" 
                       alt="Profile" 
                       width="96"
                       height="96"
                       class="rounded-[1.5rem] bg-slate-100 border-4 border-white shadow-xl object-cover cursor-pointer hover:brightness-90 transition-all" 
                       (click)="fileInput.click()"
                       (keydown.enter)="fileInput.click()"
                       tabindex="0"
                       (error)="isUpdating.set(false)"
                       (load)="isUpdating.set(false)"
                       referrerpolicy="no-referrer">
                  
                  @if (isUpdating()) {
                    <div class="absolute inset-0 bg-black/40 rounded-[1.5rem] flex flex-col items-center justify-center text-white backdrop-blur-[2px] transition-all">
                      <div class="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mb-1"></div>
                      <span class="text-[8px] font-black uppercase tracking-widest">Uploading</span>
                    </div>
                  }
                </div>
                
                <button (click)="fileInput.click()" 
                        [disabled]="isUpdating()"
                        class="absolute -bottom-1 -right-1 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all active:scale-90 border-2 border-white disabled:opacity-50">
                  <mat-icon class="!w-4 !h-4 !text-[16px]">camera_alt</mat-icon>
                </button>
              <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" class="hidden">
            </div>
            <div class="mt-4 sm:mt-0 flex-1">
              <h2 class="text-xl font-black text-slate-900 leading-tight">{{authService.currentUser()?.displayName}}</h2>
              <div class="flex items-center gap-2 mt-1.5 justify-center sm:justify-start">
                @if (authService.currentUser()?.isPro) {
                  <span class="px-2.5 py-0.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md border border-amber-300">
                    PRO MEMBER
                  </span>
                } @else {
                  <span class="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200">
                    FREE STUDENT
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
              <div [class.bg-emerald-50]="!showReward()"
                   [class.text-emerald-600]="!showReward()"
                   [class.bg-indigo-600]="showReward()"
                   [class.text-white]="showReward()"
                   [class.animate-reward]="showReward()"
                   class="p-4 rounded-2xl border border-emerald-100 text-xs font-bold flex items-center justify-center gap-3 transition-all shadow-lg">
                <mat-icon [class.animate-bounce]="showReward()">{{ showReward() ? 'stars' : 'check_circle' }}</mat-icon>
                <div class="flex flex-col">
                  @if (showReward()) {
                    <span class="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Success Reward!</span>
                  }
                  <span class="text-sm">{{updateMsg()}}</span>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- Avatar Customization Section -->
        <section class="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
          <div class="p-5 border-b border-slate-50 flex items-center justify-between">
            <h3 class="font-black text-slate-900 text-sm flex items-center gap-2">
              <mat-icon class="text-indigo-600 text-sm">face</mat-icon>
              Customize Avatar
            </h3>
          </div>
          <div class="p-5 space-y-6">
            <div class="space-y-4">
              <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Who are you?</p>
                <div class="flex gap-2">
                  @for (g of genders; track g.id) {
                    <button (click)="selectedGender.set(g.id)" 
                            [class.bg-indigo-600]="selectedGender() === g.id"
                            [class.text-white]="selectedGender() === g.id"
                            [class.bg-white]="selectedGender() !== g.id"
                            class="flex-1 py-3 rounded-xl font-bold text-xs border border-slate-200 transition-all active:scale-95 shadow-sm">
                      {{ g.label }}
                    </button>
                  }
                </div>
              </div>

              <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Avatar Style</p>
                <div class="grid grid-cols-2 gap-3">
                  @for (s of styles; track s.id) {
                    <button (click)="selectedStyle.set(s.id)" 
                            [class.bg-indigo-600]="selectedStyle() === s.id"
                            [class.text-white]="selectedStyle() === s.id"
                            [class.bg-white]="selectedStyle() !== s.id"
                            class="flex flex-col items-center gap-2 p-3 rounded-xl font-bold text-[10px] border border-slate-200 transition-all active:scale-95 shadow-sm">
                      <img [src]="authService.getAvatarUrl(authService.currentUser()?.uid || '1', selectedGender(), s.id)" alt="{{s.label}}" class="w-10 h-10 rounded-lg">
                      <span>{{ s.label }}</span>
                    </button>
                  }
                </div>
              </div>
            </div>

            <button (click)="updateAvatarPrefs()" [disabled]="isUpdating()" 
                    class="w-full py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm">
              <mat-icon class="text-sm">auto_fix_high</mat-icon>
              Apply Avatar Settings
            </button>
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

        <!-- Logout -->
        <button (click)="logout()" class="w-full p-5 bg-white rounded-2xl flex items-center gap-4 text-rose-500 shadow-sm border border-slate-100 font-black hover:bg-rose-50 transition-all mt-4 mb-20">
          <mat-icon>logout</mat-icon>
          <span>Sign Out</span>
        </button>

      </div>
    </div>
  `
})
export class ProfileComponent {
  authService = inject(AuthService);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);
  
  newUsername = signal('');
  selectedGender = signal<'boy' | 'girl' | 'prefer-not-to-say'>('prefer-not-to-say');
  selectedStyle = signal<'adventurer' | 'notionists' | 'bottts' | 'avataaars'>('avataaars');
  isUpdating = signal(false);
  updateMsg = signal('');
  showReward = signal(false);

  ans1 = signal('');
  ans2 = signal('');

  genders = [
    { id: 'boy' as const, label: 'Boy' },
    { id: 'girl' as const, label: 'Girl' },
    { id: 'prefer-not-to-say' as const, label: 'Private' }
  ];

  styles = [
    { id: 'avataaars' as const, label: 'Classic' },
    { id: 'adventurer' as const, label: 'Adventurer' },
    { id: 'notionists' as const, label: 'Modern' },
    { id: 'bottts' as const, label: 'Robot' }
  ];

  constructor() {
    const user = this.authService.currentUser();
    if (user) {
      this.newUsername.set(user.displayName || '');
      this.selectedGender.set(user.gender || 'prefer-not-to-say');
      this.selectedStyle.set(user.avatarStyle || 'avataaars');
      if (user.securityQuestions && user.securityQuestions.length >= 2) {
        this.ans1.set(user.securityQuestions[0].answer);
        this.ans2.set(user.securityQuestions[1].answer);
      }
    }
  }

  async updateUsername() {
    const name = this.newUsername().trim();
    if (!name) return;
    this.isUpdating.set(true);
    try {
      await this.authService.updateUsername(name);
      this.updateMsg.set('Username updated successfully! 🎁');
      this.showReward.set(true);
      setTimeout(() => {
        this.updateMsg.set('');
        this.showReward.set(false);
      }, 5000);
    } catch (err) {
      console.error('Update failed', err);
    } finally {
      this.isUpdating.set(false);
    }
  }

  async updateAvatarPrefs() {
    this.isUpdating.set(true);
    try {
      await this.authService.updateAvatarPreferences(this.selectedGender(), this.selectedStyle());
      this.updateMsg.set('Avatar style updated! 🎨');
      this.showReward.set(true);
      setTimeout(() => {
        this.updateMsg.set('');
        this.showReward.set(false);
      }, 5000);
    } catch (err) {
      console.error('Failed to update avatar', err);
    } finally {
      this.isUpdating.set(false);
    }
  }

  async saveSecurityQuestions() {
    this.isUpdating.set(true);
    try {
      await this.authService.saveSecurityQuestions([
        { question: 'What is your home district?', answer: this.ans1().trim() },
        { question: "What is your mother's maiden name?", answer: this.ans2().trim() }
      ]);
      this.updateMsg.set('Security questions saved successfully! 🛡️');
      this.showReward.set(true);
      setTimeout(() => {
        this.updateMsg.set('');
        this.showReward.set(false);
      }, 5000);
    } catch (err) {
      console.error('Failed to save security questions', err);
    } finally {
      this.isUpdating.set(false);
    }
  }

  async onFileSelected(event: Event) {
    if (!isPlatformBrowser(this.platformId)) return;
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      this.updateMsg.set('File too large! Use a photo < 2MB.');
      setTimeout(() => this.updateMsg.set(''), 5000);
      return;
    }

    this.isUpdating.set(true);
    try {
      await this.authService.uploadProfilePicture(file);
      this.updateMsg.set('Profile picture updated! 📸');
      this.showReward.set(true);
      setTimeout(() => {
        this.updateMsg.set('');
        this.showReward.set(false);
      }, 5000);
    } catch (error) {
      console.error('Upload failed', error);
    }
  }

  async shareApp() {
    const user = this.authService.currentUser();
    if (!user) return;
    const baseUrl = isPlatformBrowser(this.platformId) && typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${baseUrl}?ref=${user.referralCode}`;
    
    if (isPlatformBrowser(this.platformId) && typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Educate MW',
          text: 'Join me on Educate MW and master your MSCE subjects with AI!',
          url: link
        });
      } catch (err) {
        console.error('Share failed', err);
        this.copyToClipboard(link);
      }
    } else {
      this.copyToClipboard(link);
    }
  }

  copyToClipboard(link: string) {
    if (isPlatformBrowser(this.platformId) && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(link);
      this.updateMsg.set('Link copied to clipboard!');
      setTimeout(() => this.updateMsg.set(''), 3000);
    }
  }

  async logout() {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && window.confirm('Are you sure you want to sign out?')) {
      await this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
