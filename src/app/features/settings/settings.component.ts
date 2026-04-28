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
          <div class="p-5 border-b border-slate-50 dark:border-white/5 flex items-center justify-between">
            <h3 class="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <mat-icon class="text-indigo-600 dark:text-indigo-400 text-sm">contact_support</mat-icon>
              Help Centre
            </h3>
            <span class="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Support</span>
          </div>
          
          <div class="p-5 space-y-4">
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium px-1">
              Need help with payments, AI credits, or your account? Our team and AI support are here to assist.
            </p>

            <div class="grid grid-cols-1 gap-3">
              <!-- AI Chat Trigger -->
              <button (click)="openHelp()" class="flex items-center gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/20 hover:bg-indigo-100 transition-all active:scale-[0.98] group">
                <div class="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 overflow-hidden">
                  <img [src]="gemini.EMA_AVATAR" alt="ema AI" class="w-full h-full object-cover avatar-integrated" referrerpolicy="no-referrer">
                </div>
                <div class="text-left">
                  <h4 class="text-sm font-black text-slate-900 dark:text-white leading-none">ema (Help AI)</h4>
                  <p class="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mt-1.5">Ask about the app</p>
                </div>
                <mat-icon class="ml-auto text-slate-300">chevron_right</mat-icon>
              </button>

              <!-- WhatsApp Support -->
              <a href="https://wa.me/265987066051?text=Hello%20Peter,%20I%20need%20help%20with%20Educate%20MW.%20My%20email%20is:%20{{authService.currentUser()?.email}}" 
                 target="_blank"
                 class="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 hover:bg-emerald-100 transition-all active:scale-[0.98] group">
                <div class="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                  <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.005 0C5.37 0 .002 5.368.002 12.006c0 2.093.548 4.136 1.594 5.932L.007 24l6.337-1.663a11.815 11.815 0 005.661 1.442h.005c6.635 0 12.003-5.368 12.003-12.006 0-3.205-1.248-6.22-3.518-8.49z"/></svg>
                </div>
                <div class="text-left">
                  <h4 class="text-sm font-black text-slate-900 dark:text-white leading-none">WhatsApp Support</h4>
                  <p class="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest mt-1.5">Reply in minutes</p>
                </div>
                <mat-icon class="ml-auto text-slate-300">open_in_new</mat-icon>
              </a>
            </div>

            <!-- FAQs -->
            <div class="space-y-4 pt-4 border-t border-slate-50 dark:border-white/5 transition-colors">
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
                  Free users get limited AI credits daily. To get more without paying, go to your profile, share your referral code, and get 20 extra credits for every friend who joins!
                </div>
              </details>

              <details class="group bg-slate-50 rounded-2xl border border-slate-100 transition-all overflow-hidden">
                <summary class="list-none p-4 font-bold text-xs text-slate-900 cursor-pointer flex items-center justify-between group-open:bg-slate-100 transition-colors">
                  Where can I find Past Papers?
                  <mat-icon class="transition-transform group-open:rotate-180">expand_more</mat-icon>
                </summary>
                <div class="p-4 pt-0 text-[10px] text-slate-600 font-medium leading-relaxed">
                  Open the "Study Library" from the main dashboard. We have categorized MANEB past papers and marking schemes for all MSCE subjects.
                </div>
              </details>

              <details class="group bg-slate-50 rounded-2xl border border-slate-100 transition-all overflow-hidden">
                <summary class="list-none p-4 font-bold text-xs text-slate-900 cursor-pointer flex items-center justify-between group-open:bg-slate-100 transition-colors">
                  Who is emi AI?
                  <mat-icon class="transition-transform group-open:rotate-180">expand_more</mat-icon>
                </summary>
                <div class="p-4 pt-0 text-[10px] text-slate-600 font-medium leading-relaxed">
                  emi is your personal AI study tutor. She is trained specifically on the Malawian curriculum to help you understand difficult concepts in Physics, Biology, and more!
                </div>
              </details>

              <details class="group bg-slate-50 rounded-2xl border border-slate-100 transition-all overflow-hidden">
                <summary class="list-none p-4 font-bold text-xs text-slate-900 cursor-pointer flex items-center justify-between group-open:bg-slate-100 transition-colors">
                  Can I use the app offline?
                  <mat-icon class="transition-transform group-open:rotate-180">expand_more</mat-icon>
                </summary>
                <div class="p-4 pt-0 text-[10px] text-slate-600 font-medium leading-relaxed">
                  Most features require internet. However, once you open a PDF note in the library, you can often view it again from your device cache, but we recommend staying online for full AI features.
                </div>
              </details>

              <details class="group bg-slate-50 rounded-2xl border border-slate-100 transition-all overflow-hidden">
                <summary class="list-none p-4 font-bold text-xs text-slate-900 cursor-pointer flex items-center justify-between group-open:bg-slate-100 transition-colors">
                  How do I contact support?
                  <mat-icon class="transition-transform group-open:rotate-180">expand_more</mat-icon>
                </summary>
                <div class="p-4 pt-0 text-[10px] text-slate-600 font-medium leading-relaxed">
                  You can use our Help Assistant (AI) in settings, or click the WhatsApp button to chat directly with Peter Damiano for account or payment issues.
                </div>
              </details>

              <details class="group bg-slate-50 rounded-2xl border border-slate-100 transition-all overflow-hidden">
                <summary class="list-none p-4 font-bold text-xs text-slate-900 cursor-pointer flex items-center justify-between group-open:bg-slate-100 transition-colors">
                  Security Questions
                  <mat-icon class="transition-transform group-open:rotate-180">expand_more</mat-icon>
                </summary>
                <div class="p-4 pt-0 text-[10px] text-slate-600 font-medium leading-relaxed">
                  It's important to set your security questions in the Profile section. This helps you recover your account if you ever forget your login details.
                </div>
              </details>
            </div>
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

    <!-- Right Side Help Panel (1/3 Width) -->
    @if (isHelpOpen()) {
      <div class="fixed inset-0 z-[100] flex justify-end">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
             (click)="isHelpOpen.set(false)"
             (keydown.escape)="isHelpOpen.set(false)"
             (keydown.enter)="isHelpOpen.set(false)"
             tabindex="0"
             role="button"
             aria-label="Close help"></div>
        
        <!-- Panel -->
        <aside class="relative w-full sm:w-[400px] lg:w-[420px] h-full bg-white dark:bg-slate-950 shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 cubic-bezier(0.4, 0, 0.2, 1) border-l border-white/10">
          <!-- Panel Header -->
          <header class="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 pt-safe transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white overflow-hidden">
                <img [src]="gemini.EMA_AVATAR" alt="ema AI" class="w-full h-full object-cover avatar-integrated" referrerpolicy="no-referrer">
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900 dark:text-white leading-none">ema (Help)</h3>
                <p class="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">Ready to assist</p>
              </div>
            </div>
            <button (click)="isHelpOpen.set(false)" class="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
              <mat-icon class="!w-5 !h-5 !text-[20px]">close</mat-icon>
            </button>
          </header>

          <!-- Chat Area -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/30 dark:bg-slate-950 transition-colors">
            @for (msg of helpMessages(); track $index) {
              <div class="flex flex-col" [class.items-end]="msg.role === 'user'">
                <div [class.bg-indigo-600]="msg.role === 'user'"
                     [class.text-white]="msg.role === 'user'"
                     [class.bg-white]="msg.role === 'assistant'"
                     [class.dark:bg-slate-900]="msg.role === 'assistant'"
                     [class.dark:text-slate-200]="msg.role === 'assistant'"
                     [class.shadow-sm]="msg.role === 'assistant'"
                     [class.rounded-br-none]="msg.role === 'user'"
                     [class.rounded-bl-none]="msg.role === 'assistant'"
                     class="max-w-[85%] p-4 rounded-2xl text-[11px] font-medium leading-relaxed border border-transparent"
                     [class.border-slate-100]="msg.role === 'assistant'"
                     [class.dark:border-white/5]="msg.role === 'assistant'">
                  {{ msg.content }}
                </div>
              </div>
            }
            @if (aiSupportLoading()) {
              <div class="flex flex-col items-start gap-1">
                <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 flex gap-1">
                  <div class="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                  <div class="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div class="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            }
          </div>

          <!-- Chat Input -->
          <footer class="p-6 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-950 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] transition-colors">
            <div class="flex gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-white/10 shadow-inner">
              <input type="text" 
                     [(ngModel)]="helpQuery" 
                     (keyup.enter)="askSupportAi()"
                     placeholder="Type your question..." 
                     class="flex-1 bg-transparent px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none placeholder-slate-400">
              <button (click)="askSupportAi()" 
                      [disabled]="!helpQuery().trim() || aiSupportLoading()"
                      class="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50 transition-all">
                <mat-icon class="!w-5 !h-5 !text-[20px]">send</mat-icon>
              </button>
            </div>
            <p class="text-[9px] text-slate-400 dark:text-slate-500 text-center mt-4 font-bold uppercase tracking-widest">ema • Support AI</p>
          </footer>
        </aside>
      </div>
    }
  `
})
export class SettingsComponent {
  authService = inject(AuthService);
  router = inject(Router);
  gemini = inject(GeminiService);
  themeService = inject(ThemeService);
  
  helpQuery = signal('');
  isHelpOpen = signal(false);
  helpMessages = signal<{role: 'user' | 'assistant', content: string}[]>([]);
  aiSupportLoading = signal(false);

  openHelp() {
    this.isHelpOpen.set(true);
    if (this.helpMessages().length === 0) {
      this.helpMessages.set([{
        role: 'assistant',
        content: 'Hello! I am ema, your Educate MW help assistant. How can I help you today with the app, payments, or your account?'
      }]);
    }
  }

  async askSupportAi() {
    const query = this.helpQuery().trim();
    if (!query) return;

    const userMsg = { role: 'user' as const, content: query };
    this.helpMessages.update(m => [...m, userMsg]);
    this.helpQuery.set('');
    this.aiSupportLoading.set(true);
    
    try {
      const response = await this.gemini.getSupportResponse(query);
      this.helpMessages.update(m => [...m, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('AI support failed', error);
      this.helpMessages.update(m => [...m, { role: 'assistant', content: 'Support AI is currently offline. Please contact us on WhatsApp for urgent help.' }]);
    } finally {
      this.aiSupportLoading.set(false);
    }
  }

  alertMock(msg: string) {
    alert(msg);
  }
}
