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
                  
                  <!-- Uploading Spinner overlay -->
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
            <span class="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Free for all</span>
          </div>
          <div class="p-5 space-y-6">
            <div class="space-y-4">
              <!-- Gender Selection -->
              <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Who are you?</p>
                <div class="flex gap-2">
                  <button (click)="selectedGender.set('boy')" 
                          [class.bg-indigo-600]="selectedGender() === 'boy'"
                          [class.text-white]="selectedGender() === 'boy'"
                          [class.bg-white]="selectedGender() !== 'boy'"
                          class="flex-1 py-3 rounded-xl font-bold text-xs border border-slate-200 transition-all active:scale-95 shadow-sm">
                    Boy
                  </button>
                  <button (click)="selectedGender.set('girl')" 
                          [class.bg-indigo-600]="selectedGender() === 'girl'"
                          [class.text-white]="selectedGender() === 'girl'"
                          [class.bg-white]="selectedGender() !== 'girl'"
                          class="flex-1 py-3 rounded-xl font-bold text-xs border border-slate-200 transition-all active:scale-95 shadow-sm">
                    Girl
                  </button>
                  <button (click)="selectedGender.set('prefer-not-to-say')" 
                          [class.bg-indigo-600]="selectedGender() === 'prefer-not-to-say'"
                          [class.text-white]="selectedGender() === 'prefer-not-to-say'"
                          [class.bg-white]="selectedGender() !== 'prefer-not-to-say'"
                          class="flex-1 py-3 rounded-xl font-bold text-xs border border-slate-200 transition-all active:scale-95 shadow-sm">
                    Private
                  </button>
                </div>
              </div>

              <!-- Style Selection -->
              <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Avatar Style</p>
                <div class="grid grid-cols-2 gap-3">
                  <button (click)="selectedStyle.set('avataaars')" 
                          [class.bg-indigo-600]="selectedStyle() === 'avataaars'"
                          [class.text-white]="selectedStyle() === 'avataaars'"
                          [class.bg-white]="selectedStyle() !== 'avataaars'"
                          class="flex flex-col items-center gap-2 p-3 rounded-xl font-bold text-[10px] border border-slate-200 transition-all active:scale-95 shadow-sm">
                    <img [src]="authService.getAvatarUrl(authService.currentUser()?.uid || '1', selectedGender(), 'avataaars')" alt="Classic" class="w-10 h-10 rounded-lg">
                    <span>Classic</span>
                  </button>
                  <button (click)="selectedStyle.set('adventurer')" 
                          [class.bg-indigo-600]="selectedStyle() === 'adventurer'"
                          [class.text-white]="selectedStyle() === 'adventurer'"
                          [class.bg-white]="selectedStyle() !== 'adventurer'"
                          class="flex flex-col items-center gap-2 p-3 rounded-xl font-bold text-[10px] border border-slate-200 transition-all active:scale-95 shadow-sm">
                    <img [src]="authService.getAvatarUrl(authService.currentUser()?.uid || '1', selectedGender(), 'adventurer')" alt="Adventurer" class="w-10 h-10 rounded-lg">
                    <span>Adventurer</span>
                  </button>
                  <button (click)="selectedStyle.set('notionists')" 
                          [class.bg-indigo-600]="selectedStyle() === 'notionists'"
                          [class.text-white]="selectedStyle() === 'notionists'"
                          [class.bg-white]="selectedStyle() !== 'notionists'"
                          class="flex flex-col items-center gap-2 p-3 rounded-xl font-bold text-[10px] border border-slate-200 transition-all active:scale-95 shadow-sm">
                    <img [src]="authService.getAvatarUrl(authService.currentUser()?.uid || '1', selectedGender(), 'notionists')" alt="Modern" class="w-10 h-10 rounded-lg">
                    <span>Modern</span>
                  </button>
                  <button (click)="selectedStyle.set('bottts')" 
                          [class.bg-indigo-600]="selectedStyle() === 'bottts'"
                          [class.text-white]="selectedStyle() === 'bottts'"
                          [class.bg-white]="selectedStyle() !== 'bottts'"
                          class="flex flex-col items-center gap-2 p-3 rounded-xl font-bold text-[10px] border border-slate-200 transition-all active:scale-95 shadow-sm">
                    <img [src]="authService.getAvatarUrl(authService.currentUser()?.uid || '1', selectedGender(), 'bottts')" alt="Robot" class="w-10 h-10 rounded-lg">
                    <span>Robot</span>
                  </button>
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
                <p class="font-black text-slate-900 text-sm">{{ authService.currentUser()?.isPro ? 'Pro Member' : 'Free Student' }}</p>
              </div>
              @if (!authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin') {
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
          } @else if (isPotentialAdmin()) {
            <div class="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden p-5 space-y-4">
              <h3 class="font-black text-slate-900 text-sm flex items-center gap-2">
                <mat-icon class="text-indigo-600 text-sm">admin_panel_settings</mat-icon>
                Admin Secure Access
              </h3>
              <p class="text-[10px] text-slate-500 font-medium leading-tight px-1">
                Enter the secure team password to receive an admin access link via email.
              </p>
              <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label for="adminPass" class="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Team Password</label>
                <input type="password" id="adminPass" [(ngModel)]="adminPassword" placeholder="••••••••" 
                       class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all outline-none text-sm text-slate-700 shadow-sm">
              </div>
              @if (adminErrorMsg()) {
                <div class="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2">
                  <mat-icon class="text-rose-500 !w-4 !h-4 !text-[16px]">error_outline</mat-icon>
                  <span class="text-rose-700 text-[10px] font-bold leading-tight">{{adminErrorMsg()}}</span>
                </div>
              }
              @if (adminSuccessMsg()) {
                <div class="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2">
                  <mat-icon class="text-emerald-500 !w-4 !h-4 !text-[16px]">mark_email_read</mat-icon>
                  <span class="text-emerald-700 text-[10px] font-bold leading-tight">{{adminSuccessMsg()}}</span>
                </div>
              }
              <button (click)="submitAdminLogin()" [disabled]="isUpdating() || !adminPassword()" 
                      class="w-full py-4 bg-slate-900 text-white rounded-xl font-black shadow-lg shadow-slate-200 hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                <mat-icon class="text-sm">send</mat-icon>
                Send Magic Access Link
              </button>
            </div>
          }
          <button (click)="logout()" class="w-full p-5 bg-white rounded-2xl flex items-center gap-4 text-rose-500 shadow-sm border border-slate-100 font-black hover:bg-rose-50 transition-all">
            <mat-icon>logout</mat-icon>
            <span>Sign Out</span>
          </button>
        </section>

        <!-- FAQ Section -->
        <section class="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
          <div class="p-5 border-b border-slate-50">
            <h3 class="font-black text-slate-900 text-sm flex items-center gap-2">
              <mat-icon class="text-indigo-600 text-sm">help_outline</mat-icon>
              Frequently Asked Questions
            </h3>
          </div>
          <div class="p-5 space-y-4">
            <div class="space-y-2">
              <p class="text-xs font-black text-slate-900">How do I upgrade to PRO?</p>
              <p class="text-[10px] text-slate-500 font-medium">Go to the dashboard and click the "Upgrade" banner, or use the manual payment methods listed there.</p>
            </div>
            <div class="space-y-2">
              <p class="text-xs font-black text-slate-900">What if I forget my password?</p>
              <p class="text-[10px] text-slate-500 font-medium">On the login screen, click "Forgot?" to reset your password via email or security questions.</p>
            </div>
            <div class="space-y-2">
              <p class="text-xs font-black text-slate-900">How do I get more AI credits?</p>
              <p class="text-[10px] text-slate-500 font-medium">Upgrade to PRO for unlimited credits, or refer friends to earn extra points!</p>
            </div>
            <a href="https://wa.me/265987066051?text=Hello,%20I%20have%20a%20question%20about%20Educate%20MW." target="_blank"
               class="w-full py-4 bg-emerald-500 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.005 0C5.37 0 .002 5.368.002 12.006c0 2.093.548 4.136 1.594 5.932L.007 24l6.337-1.663a11.815 11.815 0 005.661 1.442h.005c6.635 0 12.003-5.368 12.003-12.006 0-3.205-1.248-6.22-3.518-8.49z"/></svg>
              Ask a Question
            </a>
          </div>
        </section>

        <!-- Terms and Privacy -->
        <div class="flex flex-col items-center gap-4 py-8">
          <div class="flex items-center justify-center gap-6">
            <a routerLink="/terms" class="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Terms</a>
            <a routerLink="/privacy" class="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Privacy</a>
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
  selectedGender = signal<'boy' | 'girl' | 'prefer-not-to-say'>('prefer-not-to-say');
  selectedStyle = signal<'adventurer' | 'notionists' | 'bottts' | 'avataaars'>('avataaars');
  isUpdating = signal(false);
  updateMsg = signal('');
  showReward = signal(false);

  ans1 = signal('');
  ans2 = signal('');

  adminPassword = signal('');
  adminErrorMsg = signal('');
  adminSuccessMsg = signal('');

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

  isAdmin(): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    return user.role === 'admin';
  }

  isPotentialAdmin(): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    const adminEmails = ['mscepreparation@gmail.com', 'petedianotech@gmail.com'];
    return adminEmails.includes(user.email?.toLowerCase() || '') && user.role !== 'admin';
  }

  async submitAdminLogin() {
    this.adminErrorMsg.set('');
    this.adminSuccessMsg.set('');
    
    const user = this.authService.currentUser();
    if (!user || !user.email) return;

    const expectedPassword = (typeof ADMIN_TEAM_PASSWORD !== 'undefined' && ADMIN_TEAM_PASSWORD) ? ADMIN_TEAM_PASSWORD : 'team3admins.mw';
    if (this.adminPassword() !== expectedPassword) {
      this.adminErrorMsg.set('Incorrect team password.');
      return;
    }

    this.isUpdating.set(true);
    try {
      await this.authService.sendAdminMagicLink(user.email);
      this.adminSuccessMsg.set('Magic access link sent! If you don\'t see it in your inbox, please check your spam folder.');
      this.adminPassword.set('');
    } catch (error: unknown) {
      const err = error as { message?: string };
      this.adminErrorMsg.set(err.message || 'Failed to send magic link');
    } finally {
      this.isUpdating.set(false);
    }
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

  async updateAvatarPrefs() {
    this.isUpdating.set(true);
    this.updateMsg.set('');
    try {
      await this.authService.updateAvatarPreferences(this.selectedGender(), this.selectedStyle());
      this.updateMsg.set('Avatar updated successfully!');
      setTimeout(() => this.updateMsg.set(''), 3000);
    } catch (error) {
      console.error('Failed to update avatar', error);
      this.updateMsg.set('Failed to update avatar.');
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

  onImageDone() {
    this.isUpdating.set(false);
    this.updateMsg.set('Profile picture updated successfully!');
    setTimeout(() => this.updateMsg.set(''), 3000);
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Limit to 2MB
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      this.updateMsg.set('File is too large! Please use a photo smaller than 2MB.');
      setTimeout(() => this.updateMsg.set(''), 5000);
      return;
    }

    this.isUpdating.set(true);
    this.updateMsg.set('Uploading picture...');
    try {
      await this.authService.uploadProfilePicture(file);
      this.updateMsg.set('Profile picture updated successfully! 🎁');
      this.showReward.set(true);
      setTimeout(() => {
        this.updateMsg.set('');
        this.showReward.set(false);
      }, 5000);
    } catch (error) {
      console.error('Failed to upload profile picture', error);
      this.updateMsg.set('Failed to upload: ' + (error as Error).message);
    } finally {
      // isUpdating is handled by the <img> load event in the template
      // but if it fails to start upload, we should clear it
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

