import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { PaymentService } from '../../core/services/payment.service';

@Component({
  selector: 'app-upgrade',
  standalone: true,
  imports: [MatIconModule, CommonModule, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto custom-scrollbar transition-colors duration-500">
      <div class="p-4 sm:p-6 lg:p-8 pb-32 max-w-4xl mx-auto">
        <!-- Back Button -->
        <button (click)="router.navigate(['/dashboard'])" class="mb-6 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-black uppercase tracking-widest text-xs">
          <mat-icon class="!w-4 !h-4 !text-[16px]">arrow_back</mat-icon>
          Back to Dashboard
        </button>

        <!-- Promotional Banner -->
        <div class="mb-8 rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-200 dark:border-white/5">
          <img src="https://i.ibb.co/fd5bMyQp/Educatemwzone-1.jpg" alt="Educate MW PRO" class="w-full h-auto object-cover" referrerpolicy="no-referrer">
        </div>

        <!-- Special Offer Header -->
        <div class="bg-gradient-to-br from-indigo-900 to-blue-900 dark:from-indigo-950 dark:to-slate-900 text-white rounded-[2.5rem] p-8 mb-8 text-center shadow-xl relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <h2 class="text-3xl font-black mb-2 relative z-10">Special Exam Offer! 🎓</h2>
          <p class="text-indigo-100 text-lg relative z-10">Get exclusive 2026 MSCE, JCE & PSLCE Predicted Papers.</p>
          <p class="text-indigo-200 mt-2 font-medium relative z-10">Join thousands of students excelling with Educate MW PRO.</p>
        </div>

        <!-- Plans Comparison -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <!-- PRO Plan -->
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border-2 border-indigo-500 shadow-xl relative overflow-visible transition-colors duration-500">
            <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg z-10">Recommended</div>
            <h3 class="text-2xl font-black text-slate-900 dark:text-white leading-none">Educate MW PRO</h3>
            <p class="text-slate-500 dark:text-slate-400 mt-2 font-medium">Unlimited access until exams finish</p>
            <div class="text-4xl font-black text-slate-900 dark:text-white my-6">K5,000</div>
            
            <ul class="space-y-4 text-slate-700 dark:text-slate-300 mb-8 px-1">
              <li class="flex items-start gap-3">
                <div class="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <mat-icon class="!w-3.5 !h-3.5 !text-[14px] text-indigo-600 dark:text-indigo-400 font-bold">check</mat-icon>
                </div>
                <span class="text-sm font-bold">Unlimited Offline Downloads</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <mat-icon class="!w-3.5 !h-3.5 !text-[14px] text-indigo-600 dark:text-indigo-400 font-bold">check</mat-icon>
                </div>
                <span class="text-sm font-bold">Unlimited AI Teacher Access</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <mat-icon class="!w-3.5 !h-3.5 !text-[14px] text-indigo-600 dark:text-indigo-400 font-bold">check</mat-icon>
                </div>
                <span class="text-sm font-bold">Step-by-step Video Lessons</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <mat-icon class="!w-3.5 !h-3.5 !text-[14px] text-indigo-600 dark:text-indigo-400 font-bold">check</mat-icon>
                </div>
                <span class="text-sm font-bold">Exclusive MANEB Exam Tips</span>
              </li>
            </ul>

              <button (click)="startPayment()" [disabled]="isProcessing()" class="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 mb-4">
                @if (isProcessing()) { <mat-icon class="animate-spin">sync</mat-icon> } @else { <mat-icon>bolt</mat-icon> }
                {{ isProcessing() ? 'Starting...' : 'Pay with PayChangu/Card' }}
              </button>

              <!-- Instruction Text -->
              <div class="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-xl flex items-start gap-3">
                <mat-icon class="text-indigo-600 dark:text-indigo-400 shrink-0 !w-5 !h-5 !text-[20px]">info</mat-icon>
                <div class="flex flex-col">
                  <p class="text-xs font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-widest leading-none mb-1.5">Verification Instructions</p>
                  <p class="text-xs text-indigo-700 dark:text-indigo-300 font-bold leading-relaxed">
                    After successful payment, you MUST take a screenshot of your Airtel/TNM receipt and send it to Emmanuel or Saidi for activation.
                  </p>
                </div>
              </div>
            </div>

          <!-- Free Plan -->
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 shadow-sm flex flex-col transition-colors duration-500">
            <h3 class="text-2xl font-black text-slate-900 dark:text-white leading-none">Standard</h3>
            <p class="text-slate-500 dark:text-slate-400 mt-2 font-medium">Free Learner</p>
            <div class="text-4xl font-black text-slate-900 dark:text-white my-6">K0</div>
            <ul class="space-y-4 text-slate-500 dark:text-slate-400 mb-8 flex-1">
              <li class="flex items-start gap-3">
                <mat-icon class="text-slate-300 dark:text-slate-700 !w-5 !h-5 !text-[20px]">block</mat-icon>
                <span class="text-sm font-medium">Limited Past Papers</span>
              </li>
              <li class="flex items-start gap-3">
                <mat-icon class="text-slate-300 dark:text-slate-700 !w-5 !h-5 !text-[20px]">block</mat-icon>
                <span class="text-sm font-medium">Basic AI Teacher (5 points)</span>
              </li>
              <li class="flex items-start gap-3">
                <mat-icon class="text-slate-300 dark:text-slate-700 !w-5 !h-5 !text-[20px]">block</mat-icon>
                <span class="text-sm font-medium">No Offline Downloads</span>
              </li>
            </ul>
            <button class="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 font-black py-4 rounded-2xl cursor-not-allowed">Current Plan</button>
          </div>
        </div>

        <!-- Manual Payment Section - Reaching Edges -->
        <div class="-mx-4 sm:-mx-6 lg:-mx-8 mb-12 px-4 sm:px-6 lg:px-8">
          <div class="bg-indigo-950 dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden transition-colors duration-500">
            <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            
            <div class="relative z-10 flex flex-col lg:flex-row gap-10">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <mat-icon class="text-indigo-300">payments</mat-icon>
                  </div>
                  <h3 class="text-2xl font-black tracking-tight">Manual Payment</h3>
                </div>
                
                <div class="space-y-6">
                  <div class="flex gap-4">
                    <div class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-xs font-black shrink-0">1</div>
                    <div>
                      <p class="text-indigo-100 font-black uppercase tracking-widest text-xs mb-1">Send Money</p>
                      <p class="text-sm text-white/90 leading-tight font-bold">Send <span class="text-indigo-300 font-black">K5,000</span> to Either Mpamba or Airtel below.</p>
                    </div>
                  </div>
                  
                  <div class="flex gap-4">
                    <div class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-xs font-black shrink-0">2</div>
                    <div>
                      <p class="text-indigo-100 font-black uppercase tracking-widest text-xs mb-1">Verify</p>
                      <p class="text-sm text-white/90 leading-tight font-bold">Click the WhatsApp button below to send your receipt screenshot.</p>
                    </div>
                  </div>

                  <div class="pt-6 border-t border-white/10">
                    <div class="flex items-center gap-2 text-xs text-white/60 font-bold">
                      <mat-icon class="!w-4 !h-4 !text-[16px]">info</mat-icon>
                      <span>Verification typically takes 15-30 minutes.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex-1 space-y-4">
                <!-- TNM Card -->
                <a href="https://wa.me/265885428441?text=Hello%20Teacher%20Emmanuel,%20I%20have%20made%20a%20manual%20payment%20via%20TNM%20Mpamba.%20Here%20is%20my%20screenshot:" 
                   target="_blank" 
                   class="bg-white dark:bg-slate-800 rounded-3xl p-5 flex items-center justify-between group transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0 border border-slate-50 dark:border-white/5 shadow-inner">
                      <img ngSrc="https://i.ibb.co/HDxJYyFz/images-2.png" alt="TNM" width="40" height="40" class="object-contain" referrerpolicy="no-referrer">
                    </div>
                    <div>
                      <p class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">TNM Mpamba • E. Muthipo</p>
                      <p class="text-xl font-black text-slate-900 dark:text-white tracking-tight">0885 428 441</p>
                    </div>
                  </div>
                  <div class="w-10 h-10 rounded-full overflow-hidden shadow-lg shadow-emerald-500/20">
                    <img ngSrc="https://i.ibb.co/B5nZcRNC/images-3.jpg" alt="WhatsApp" width="40" height="40" class="w-full h-full object-cover">
                  </div>
                </a>

                <!-- Airtel Card -->
                <a href="https://wa.me/265999136433?text=Hello%20Teacher%20Saidi,%20I%20have%20made%20a%20manual%20payment%20via%20Airtel%20Money.%20Here%20is%20my%20screenshot:" 
                   target="_blank" 
                   class="bg-white dark:bg-slate-800 rounded-3xl p-5 flex items-center justify-between group transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0 border border-slate-50 dark:border-white/5 shadow-inner">
                      <img ngSrc="https://i.ibb.co/KxWc20jw/images-1.png" alt="Airtel" width="40" height="32" class="object-contain" referrerpolicy="no-referrer">
                    </div>
                    <div>
                      <p class="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Airtel Money • S. Liffa</p>
                      <p class="text-xl font-black text-slate-900 dark:text-white tracking-tight">0999 136 433</p>
                    </div>
                  </div>
                  <div class="w-10 h-10 rounded-full overflow-hidden shadow-lg shadow-emerald-500/20">
                    <img ngSrc="https://i.ibb.co/B5nZcRNC/images-3.jpg" alt="WhatsApp" width="40" height="40" class="w-full h-full object-cover">
                  </div>
                </a>

                <!-- Developer Support Card -->
                <a href="https://wa.me/265987066051?text=Hello%20Peter%20Damiano,%20I%20need%20assistance%20with%20my%20manual%20payment%20verification%20for%20Educate%20MW." 
                   target="_blank" 
                   class="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl p-5 flex items-center justify-between group transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg border border-white/50 dark:border-white/5 backdrop-blur-sm">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0 border border-slate-100 dark:border-white/5 shadow-sm">
                      <img ngSrc="https://i.ibb.co/6J4TzcZz/Peterdamianologo.jpg" alt="Developer" width="48" height="48" class="w-full h-full object-cover" referrerpolicy="no-referrer">
                    </div>
                    <div>
                      <p class="text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-0.5">Technical Support • Peter Damiano</p>
                      <p class="text-sm font-black text-slate-900 dark:text-white tracking-tight">Need help? Chat with our dev!</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400 font-bold">0987 066 051</p>
                    </div>
                  </div>
                  <div class="w-10 h-10 rounded-full overflow-hidden shadow-lg shadow-emerald-500/20">
                    <img ngSrc="https://i.ibb.co/B5nZcRNC/images-3.jpg" alt="WhatsApp" width="40" height="40" class="w-full h-full object-cover">
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- FAQ & Refer -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 shadow-sm transition-colors duration-500">
            <h3 class="text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">Common Questions</h3>
            <div class="space-y-6">
              <div>
                <p class="text-sm font-black text-slate-900 dark:text-white mb-1">How long does PRO last?</p>
                <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">PRO access is valid until the completion of the current academic year's exams.</p>
              </div>
              <div>
                <p class="text-sm font-black text-slate-900 dark:text-white mb-1">Is manual verification fast?</p>
                <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">Yes! Our managers typically verify payments within 15-30 minutes during business hours.</p>
              </div>
            </div>
          </div>
          <div class="bg-indigo-50 dark:bg-indigo-900/10 rounded-[2.5rem] p-8 border border-indigo-100 dark:border-indigo-900/30 shadow-sm relative overflow-hidden transition-colors duration-500">
            <div class="absolute top-0 right-0 w-24 h-24 bg-indigo-200/20 rounded-full -mr-12 -mt-12 blur-xl"></div>
            <h3 class="text-xl font-black text-indigo-900 dark:text-indigo-200 mb-4 uppercase tracking-tight">Refer & Earn</h3>
            <p class="text-indigo-800 dark:text-indigo-300 mb-6 font-medium">Invite 5 friends, get 25 emi AI Points FREE! Help your friends succeed too.</p>
            <button (click)="inviteFriends()" class="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95">Invite Friends</button>
          </div>
        </div>
      </div>

      <!-- Guest Warning Modal -->
      @if (showGuestWarning()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div class="p-8 text-center">
              <div class="w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <mat-icon class="!w-10 !h-10 !text-[40px] text-amber-600 dark:text-amber-400">account_circle</mat-icon>
              </div>
              <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-2">Account Required</h3>
              <p class="text-slate-500 dark:text-slate-400 font-medium mb-8">
                You are currently signed in as a <span class="text-amber-600 font-bold">Guest</span>. To upgrade to Pro and save your progress, you must create a permanent account first.
              </p>
              
              <div class="space-y-3">
                <button (click)="router.navigate(['/login'])" class="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95">
                  Create Account Now
                </button>
                <button (click)="showGuestWarning.set(false)" class="w-full py-3 text-slate-400 dark:text-slate-500 font-bold hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class UpgradeComponent {
  authService = inject(AuthService);
  dataService = inject(DataService);
  paymentService = inject(PaymentService);
  router = inject(Router);

  isProcessing = signal(false);
  showGuestWarning = signal(false);

  async startPayment() {
    const user = this.authService.currentUser();
    if (user?.isGuest) {
      this.showGuestWarning.set(true);
      return;
    }

    this.isProcessing.set(true);
    try {
      await this.paymentService.initializePayment();
      
      // Show confirmation alert instructing on manual verification
      setTimeout(() => {
        alert('PAYMENT STARTED: After you complete your payment on PayChangu, you MUST take a screenshot of your success message and send it to Emmanuel (0885 428 441) or Saidi (0999 136 433) to activate your PRO account.');
      }, 1000);
    } catch (error: unknown) {
      console.error('Payment Initialization Failed:', error);
      alert('Failed to open payment link. Please check your internet or use the manual numbers below.');
    } finally {
      this.isProcessing.set(false);
    }
  }

  inviteFriends() {
    const user = this.authService.currentUser();
    if (!user) return;
    
    const referralCode = user.referralCode || '';
    const shareText = `Use my referral code EMI-${referralCode.replace('EMI-', '')} when signing up for Educate MW to get 20 free AI credits!`;

    if (navigator.share) {
      navigator.share({
        title: 'Educate MW Referral Code',
        text: shareText
      }).catch(console.error);
    } else {
      // Fallback to clipboard
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
          alert('Referral code copied to clipboard! Share it with your friends.');
        }).catch(() => {
          this.manualCopy(shareText);
        });
      } else {
        this.manualCopy(shareText);
      }
    }
  }

  private manualCopy(text: string) {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    alert('Referral link copied to clipboard!');
  }
}
