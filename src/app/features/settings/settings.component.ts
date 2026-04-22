import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { GeminiService } from '../../core/services/gemini.service';
import { ThemeService } from '../../core/services/theme.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [MatIconModule, FormsModule, CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-950 pb-safe transition-colors duration-500">
      <!-- Header -->
      <header class="px-4 py-3 flex items-center gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-white/5 shadow-sm sticky top-0 z-10 pt-safe transition-colors duration-500">
        <a routerLink="/dashboard" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition-all">
          <mat-icon class="text-[22px]">arrow_back</mat-icon>
        </a>
        <h1 class="text-xl font-bold text-slate-900 dark:text-white">App Settings</h1>
      </header>

      <div class="p-4 max-w-2xl mx-auto space-y-4 mt-2 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
        
        <!-- Theme Section -->
        <section class="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-white/5 overflow-hidden transition-colors duration-500">
          <div class="p-5 border-b border-slate-50 dark:border-white/5 flex items-center justify-between">
            <h3 class="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <mat-icon class="text-indigo-600 dark:text-indigo-400 text-sm">palette</mat-icon>
              App Theme
            </h3>
            <span class="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Personalize</span>
          </div>
          <div class="p-5">
            <div class="flex gap-3">
              <button (click)="themeService.isDarkMode.set(false)" 
                      [class.border-indigo-600]="!themeService.isDarkMode()"
                      [class.bg-indigo-50]="!themeService.isDarkMode()"
                      [class.dark:bg-indigo-900/10]="!themeService.isDarkMode()"
                      [class.border-slate-200]="themeService.isDarkMode()"
                      [class.dark:border-white/5]="themeService.isDarkMode()"
                      class="flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all">
                <mat-icon [class.text-indigo-600]="!themeService.isDarkMode()" [class.text-slate-400]="themeService.isDarkMode()">light_mode</mat-icon>
                <span class="text-[10px] font-black uppercase tracking-widest" [class.text-indigo-900]="!themeService.isDarkMode()" [class.dark:text-indigo-200]="!themeService.isDarkMode()" [class.text-slate-400]="themeService.isDarkMode()">Classic</span>
              </button>
              <button (click)="themeService.isDarkMode.set(true)" 
                      [class.border-indigo-600]="themeService.isDarkMode()"
                      [class.bg-indigo-50]="themeService.isDarkMode()"
                      [class.dark:bg-indigo-900/10]="themeService.isDarkMode()"
                      [class.border-slate-200]="!themeService.isDarkMode()"
                      [class.dark:border-white/5]="!themeService.isDarkMode()"
                      class="flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-95 group">
                <mat-icon [class.text-indigo-600]="themeService.isDarkMode()" [class.text-slate-400]="!themeService.isDarkMode()" [class.group-hover:text-indigo-600]="!themeService.isDarkMode()">dark_mode</mat-icon>
                <span class="text-[10px] font-black uppercase tracking-widest font-black" [class.text-indigo-900]="themeService.isDarkMode()" [class.dark:text-indigo-200]="themeService.isDarkMode()" [class.text-slate-400]="!themeService.isDarkMode()" [class.group-hover:text-indigo-900]="!themeService.isDarkMode()">Dark</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Help Centre Section -->
        <section class="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-white/5 overflow-hidden transition-colors duration-500">
          <div class="p-5 border-b border-slate-50 dark:border-white/5">
            <h3 class="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <mat-icon class="text-indigo-600 dark:text-indigo-400 text-sm">contact_support</mat-icon>
              Help Centre
            </h3>
          </div>
          
          <div class="p-5 space-y-6">
            <!-- AI Support Quick Chat -->
            <div class="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/20 shadow-sm">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white">
                  <mat-icon>smart_toy</mat-icon>
                </div>
                <div>
                  <h4 class="text-sm font-black text-slate-900 dark:text-white leading-none">Support AI</h4>
                  <p class="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mt-1">Faster response</p>
                </div>
              </div>
              
              @if (aiSupportMessage()) {
                <div class="mb-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-indigo-100 dark:border-white/5 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <p class="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{{ aiSupportMessage() }}</p>
                  <button (click)="aiSupportMessage.set(null)" class="mt-3 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:text-indigo-700 dark:hover:text-indigo-300">Clear</button>
                </div>
              }

              <div class="flex gap-2">
                <input type="text" 
                       [(ngModel)]="helpQuery" 
                       placeholder="Ask about Pro, Credits, Exams..." 
                       class="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-white/5 rounded-xl font-bold placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-all outline-none text-xs text-slate-700 dark:text-slate-200 shadow-sm">
                <button (click)="askSupportAi()" 
                        [disabled]="!helpQuery().trim() || aiSupportLoading()"
                        class="px-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-black shadow-md shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center">
                  @if (aiSupportLoading()) {
                    <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  } @else {
                    <mat-icon class="!w-5 !h-5 !text-[20px]">send</mat-icon>
                  }
                </button>
              </div>
            </div>

            <!-- WhatsApp Support -->
            <a href="https://wa.me/265987066051?text=Hello%20Peter,%20I%20need%20help%20with%20Educate%20MW.%20My%20email%20is:%20{{authService.currentUser()?.email}}" 
               target="_blank"
               class="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 dark:shadow-none hover:bg-emerald-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
              <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.005 0C5.37 0 .002 5.368.002 12.006c0 2.093.548 4.136 1.594 5.932L.007 24l6.337-1.663a11.815 11.815 0 005.661 1.442h.005c6.635 0 12.003-5.368 12.003-12.006 0-3.205-1.248-6.22-3.518-8.49z"/></svg>
              Contact Peter on WhatsApp
            </a>

            <!-- FAQs -->
            <div class="space-y-4 pt-2">
              <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 mb-2">Extended FAQs</h4>
              
              <details class="group bg-slate-50 rounded-2xl border border-slate-100 transition-all overflow-hidden">
                <summary class="list-none p-4 font-bold text-xs text-slate-900 cursor-pointer flex items-center justify-between group-open:bg-slate-100 transition-colors">
                  How do I upgrade to PRO?
                  <mat-icon class="transition-transform group-open:rotate-180">expand_more</mat-icon>
                </summary>
                <div class="p-4 pt-0 text-[10px] text-slate-600 font-medium leading-relaxed">
                  Go to the Upgrade page. You can pay 5,000 MWK per year using PayChangu (Airtel Money or TNM Mpamba). Once paid, your account upgrades instantly.
                </div>
              </details>

              <details class="group bg-slate-50 rounded-2xl border border-slate-100 transition-all overflow-hidden">
                <summary class="list-none p-4 font-bold text-xs text-slate-900 cursor-pointer flex items-center justify-between group-open:bg-slate-100 transition-colors">
                  AI Credits & Referrals
                  <mat-icon class="transition-transform group-open:rotate-180">expand_more</mat-icon>
                </summary>
                <div class="p-4 pt-0 text-[10px] text-slate-600 font-medium leading-relaxed">
                  Free users get limited AI credits daily. To get more without paying, go to your profile, share your link, and get 10 extra credits for every friend who joins!
                </div>
              </details>
            </div>
          </div>
        </section>

        <!-- Ad Feedback Section -->
        <section class="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-white/5 overflow-hidden transition-colors duration-500">
          <div class="p-5 border-b border-slate-50 dark:border-white/5 flex items-center justify-between">
            <h3 class="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <mat-icon class="text-indigo-600 dark:text-indigo-400 text-sm">ad_units</mat-icon>
              Ad Feedback
            </h3>
          </div>
          <div class="p-5 space-y-4">
            <p class="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed px-1">
              Report inappropriate or non-educational ads here.
            </p>
            <a href="https://wa.me/265987066051?text=Hello%20Peter,%20I%20am%20reporting%20an%20ad%20in%20Educate%20MW." 
               target="_blank"
               class="w-full py-4 bg-emerald-500 text-white rounded-xl font-black shadow-lg shadow-emerald-100 dark:shadow-none hover:bg-emerald-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-xs">
              Report Ads to Peter
            </a>
          </div>
        </section>

        <!-- Admin Access Section -->
        <section class="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-white/5 overflow-hidden transition-colors duration-500">
          <div class="p-5 border-b border-slate-50 dark:border-white/5">
            <h3 class="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <mat-icon class="text-indigo-600 dark:text-indigo-400 text-sm">admin_panel_settings</mat-icon>
              Team Access
            </h3>
          </div>
          <div class="p-5">
            @if (!isAdmin()) {
              <div class="space-y-4">
                <p class="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight px-1 uppercase tracking-widest text-center">Admin Team Only</p>
                <div class="flex flex-col gap-3">
                  <input type="password" [ngModel]="adminPassword()" (ngModelChange)="adminPassword.set($event)" placeholder="Enter Team Password" 
                         class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl font-bold placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all outline-none text-sm text-slate-700 dark:text-slate-200 shadow-sm">
                  
                  @if (adminErrorMsg()) {
                    <div class="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-xl flex items-start gap-2">
                      <mat-icon class="text-rose-500 !w-4 !h-4 !text-[16px]">error_outline</mat-icon>
                      <span class="text-rose-700 dark:text-rose-300 text-[10px] font-bold leading-tight">{{adminErrorMsg()}}</span>
                    </div>
                  }
                  <button (click)="submitAdminLogin()" [disabled]="aiSupportLoading() || !adminPassword()" 
                          class="w-full py-4 bg-slate-900 dark:bg-indigo-950 text-white rounded-xl font-black shadow-lg shadow-slate-200 dark:shadow-none hover:bg-slate-800 dark:hover:bg-indigo-900 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <mat-icon class="text-sm">send</mat-icon>
                    Get Admin Access
                  </button>
                </div>
              </div>
            } @else {
              <div class="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl flex flex-col items-center text-center gap-3">
                <mat-icon class="text-indigo-600 dark:text-indigo-400 !w-10 !h-10 !text-[40px]">verified_user</mat-icon>
                <div>
                  <p class="text-indigo-900 dark:text-indigo-200 font-black text-sm">Admin Access Active</p>
                  <p class="text-indigo-600 dark:text-indigo-400 text-[10px] font-bold mt-1">You can now access the Admin Dashboard.</p>
                </div>
                <a routerLink="/admin" class="mt-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-md hover:bg-indigo-700">Go to Dashboard</a>
              </div>
            }
          </div>
        </section>

        <!-- Terms and Privacy -->
        <div class="flex flex-col items-center gap-4 py-8">
          <div class="flex items-center justify-center gap-6">
            <a routerLink="/terms" class="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Terms</a>
            <a routerLink="/privacy" class="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">Privacy</a>
          </div>
          <p class="text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em]">Educate MW • 2026</p>
        </div>

      </div>
    </div>
  `
})
export class SettingsComponent {
  authService = inject(AuthService);
  router = inject(Router);
  gemini = inject(GeminiService);
  themeService = inject(ThemeService);
  
  helpQuery = signal('');
  aiSupportLoading = signal(false);
  aiSupportMessage = signal<string | null>(null);

  adminPassword = signal('');
  adminErrorMsg = signal('');
  adminSuccessMsg = signal('');

  isAdmin(): boolean {
    const user = this.authService.currentUser();
    return !!user && user.role === 'admin';
  }

  async askSupportAi() {
    const query = this.helpQuery().trim();
    if (!query) return;

    this.aiSupportLoading.set(true);
    this.aiSupportMessage.set(null);
    
    try {
      const response = await this.gemini.getSupportResponse(query);
      this.aiSupportMessage.set(response);
      this.helpQuery.set('');
    } catch (error) {
      console.error('AI support failed', error);
      this.aiSupportMessage.set('Support AI offline. Use WhatsApp.');
    } finally {
      this.aiSupportLoading.set(false);
    }
  }

  async submitAdminLogin() {
    this.adminErrorMsg.set('');
    const user = this.authService.currentUser();
    if (!user || !user.email) return;

    // Fixed internal team password for quick entry
    if (this.adminPassword() !== 'team3admins.mw') {
      this.adminErrorMsg.set('Incorrect team password.');
      return;
    }

    this.aiSupportLoading.set(true);
    try {
      await this.authService.sendAdminMagicLink(user.email);
      alert('Magic link sent to your email!');
      this.adminPassword.set('');
    } catch (err) {
      console.error('Admin login failed', err);
      this.adminErrorMsg.set('Failed to send link.');
    } finally {
      this.aiSupportLoading.set(false);
    }
  }

  alertMock(msg: string) {
    alert(msg);
  }
}
