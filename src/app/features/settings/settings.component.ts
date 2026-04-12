import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [MatIconModule, FormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 pb-safe">
      <!-- Header -->
      <header class="px-4 py-3 flex items-center gap-3 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm sticky top-0 z-10 pt-safe">
        <h1 class="text-xl font-bold text-slate-900">Settings & Profile</h1>
      </header>

      <div class="p-4 max-w-2xl mx-auto space-y-6 mt-2 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
        
        <!-- Profile Section -->
        <section class="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div class="relative h-32 bg-gradient-to-r from-indigo-600 to-blue-500">
            <div class="absolute inset-0 bg-black/10"></div>
          </div>
          <div class="px-8 pb-8 -mt-16 relative flex flex-col items-center text-center">
            <div class="relative group">
              <img [src]="authService.currentUser()?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + authService.currentUser()?.uid" 
                   alt="Profile" 
                   class="w-32 h-32 rounded-[2.5rem] bg-slate-100 border-8 border-white shadow-2xl ring-1 ring-slate-200 object-cover" 
                   referrerpolicy="no-referrer">
            </div>
            <h2 class="text-2xl font-black text-slate-900 mt-4 leading-none">{{authService.currentUser()?.displayName}}</h2>
            <div class="flex items-center gap-2 mt-2">
              <span class="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                {{authService.currentUser()?.isPro ? 'PRO MEMBER' : 'FREE STUDENT'}}
              </span>
              @if (authService.currentUser()?.role === 'admin') {
                <span class="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100">
                  ADMIN
                </span>
              }
            </div>
          </div>
          
          <div class="p-8 pt-0 space-y-6">
            <div class="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <label for="username" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Display Name</label>
              <div class="flex flex-col gap-3">
                <input type="text" id="username" [(ngModel)]="newUsername" placeholder="Enter new username" 
                       class="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all outline-none text-slate-700 shadow-sm">
                <button (click)="updateUsername()" [disabled]="!newUsername().trim() || isUpdating()" 
                        class="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                  <mat-icon class="!w-5 !h-5 !text-[20px]">save</mat-icon>
                  Update Name
                </button>
              </div>
            </div>

            @if (updateMsg()) {
              <div class="bg-emerald-50 text-emerald-600 p-4 rounded-2xl border border-emerald-100 text-sm font-bold flex items-center gap-2">
                <mat-icon class="text-sm">check_circle</mat-icon>
                {{updateMsg()}}
              </div>
            }
          </div>
        </section>

        <!-- Referral System -->
        <section class="bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden border border-white/5">
          <!-- Decorative background -->
          <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
          <div class="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/10 rounded-full -ml-24 -mb-24 blur-[60px]"></div>
          
          <div class="relative z-10">
            <div class="flex items-center gap-4 mb-8">
              <div class="w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                <mat-icon class="!w-7 !h-7 !text-[28px]">share</mat-icon>
              </div>
              <div>
                <h3 class="text-2xl font-black tracking-tight leading-none">Refer & Earn</h3>
                <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2">Get 10 AI Credits per friend</p>
              </div>
            </div>

            <div class="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 backdrop-blur-sm">
              <p class="text-slate-300 text-sm font-medium leading-relaxed">
                Invite your classmates to <span class="text-white font-black">Educate MW</span>! When they join using your link, you'll receive <span class="text-indigo-400 font-black">10 AI Credits</span> for Cleo AI and Flashcard generation.
              </p>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-8">
              <div class="bg-white/5 border border-white/10 rounded-[1.5rem] p-5 text-center">
                <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Your Code</p>
                <p class="text-2xl font-black text-white tracking-wider">{{authService.currentUser()?.referralCode}}</p>
              </div>
              <div class="bg-white/5 border border-white/10 rounded-[1.5rem] p-5 text-center">
                <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Referrals</p>
                <p class="text-2xl font-black text-white">{{authService.currentUser()?.referralsCount || 0}}</p>
              </div>
            </div>

            <button (click)="shareApp()" 
                    class="w-full py-5 bg-white text-slate-950 rounded-2xl font-black shadow-xl hover:bg-slate-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
              <mat-icon>send</mat-icon>
              Share Referral Link
            </button>
          </div>
        </section>

        <!-- Account Info -->
        <section class="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div class="p-6 border-b border-slate-50">
            <h3 class="font-black text-slate-900 flex items-center gap-2">
              <mat-icon class="text-indigo-600">account_circle</mat-icon>
              Account Status
            </h3>
          </div>
          <div class="p-6 space-y-4">
            <div class="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
              <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscription</p>
                <p class="font-black text-slate-900">{{ authService.currentUser()?.isPro ? 'Pro Member' : 'Free Tier' }}</p>
              </div>
              @if (!authService.currentUser()?.isPro) {
                <button (click)="router.navigate(['/upgrade'])" class="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-100">
                  Upgrade
                </button>
              }
            </div>
            
            <div class="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
              <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Credits</p>
                <p class="font-black text-slate-900">Questions & Flashcards</p>
              </div>
              <div class="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded-xl font-black shadow-lg shadow-indigo-100">
                <mat-icon class="!w-4 !h-4 !text-[16px]">bolt</mat-icon>
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
        <div class="flex items-center justify-center gap-6 py-8">
          <a routerLink="/terms" class="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Terms</a>
          <a routerLink="/privacy" class="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Privacy</a>
        </div>

      </div>
    </div>
  `
})
export class SettingsComponent {
  authService = inject(AuthService);
  dataService = inject(DataService);
  router = inject(Router);
  
  newUsername = signal('');
  isUpdating = signal(false);
  updateMsg = signal('');

  constructor() {
    const user = this.authService.currentUser();
    if (user) {
      this.newUsername.set(user.displayName || '');
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

  getReferralLink() {
    const user = this.authService.currentUser();
    if (!user) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}?ref=${user.referralCode}`;
  }

  async shareApp() {
    const link = this.getReferralLink();
    if (navigator.share) {
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
    navigator.clipboard.writeText(link);
    this.updateMsg.set('Referral link copied to clipboard!');
    setTimeout(() => this.updateMsg.set(''), 3000);
  }

  async logout() {
    if (confirm('Are you sure you want to sign out?')) {
      await this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  goBack() {
    window.history.back();
  }
}

