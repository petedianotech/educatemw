import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { PaymentService } from '../../core/services/payment.service';

@Component({
  selector: 'app-upgrade',
  standalone: true,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full bg-slate-50 overflow-y-auto custom-scrollbar">
      <div class="p-4 sm:p-6 lg:p-8 pb-32 max-w-4xl mx-auto">
        <!-- Back Button -->
        <button (click)="router.navigate(['/dashboard'])" class="mb-6 flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-black uppercase tracking-widest text-xs">
          <mat-icon class="!w-4 !h-4 !text-[16px]">arrow_back</mat-icon>
          Back to Dashboard
        </button>

        <!-- Special Offer Header -->
        <div class="bg-gradient-to-br from-indigo-900 to-blue-900 text-white rounded-[2.5rem] p-8 mb-8 text-center shadow-xl relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <h2 class="text-3xl font-black mb-2 relative z-10">Special Exam Offer! 🎓</h2>
          <p class="text-indigo-100 text-lg relative z-10">Get exclusive 2026 MSCE, JCE & PSLCE Predicted Papers.</p>
          <p class="text-indigo-200 mt-2 font-medium relative z-10">Join thousands of students excelling with Educate MW PRO.</p>
        </div>

        <!-- Plans Comparison -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <!-- PRO Plan -->
          <div class="bg-white rounded-[2.5rem] p-8 border-2 border-indigo-500 shadow-xl relative">
            <div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Recommended</div>
            <h3 class="text-2xl font-black text-slate-900">Educate MW PRO</h3>
            <p class="text-slate-500 mt-2 font-medium">Unlimited access until exams finish</p>
            <div class="text-4xl font-black text-slate-900 my-6">K5,000</div>
            <ul class="space-y-4 text-slate-700 mb-8">
              <li class="flex items-start gap-3">
                <div class="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                  <mat-icon class="!w-3.5 !h-3.5 !text-[14px] text-indigo-600 font-bold">check</mat-icon>
                </div>
                <span class="text-sm font-bold">Unlimited Offline Downloads</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                  <mat-icon class="!w-3.5 !h-3.5 !text-[14px] text-indigo-600 font-bold">check</mat-icon>
                </div>
                <span class="text-sm font-bold">Unlimited AI Teacher Access</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                  <mat-icon class="!w-3.5 !h-3.5 !text-[14px] text-indigo-600 font-bold">check</mat-icon>
                </div>
                <span class="text-sm font-bold">Step-by-step Video Lessons</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                  <mat-icon class="!w-3.5 !h-3.5 !text-[14px] text-indigo-600 font-bold">check</mat-icon>
                </div>
                <span class="text-sm font-bold">Exclusive MANEB Exam Tips</span>
              </li>
            </ul>

            <!-- Payment Methods -->
            <div class="space-y-4">
              <button (click)="startPayment()" [disabled]="isProcessing()" class="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50">
                @if (isProcessing()) { <mat-icon class="animate-spin">sync</mat-icon> } @else { <mat-icon>bolt</mat-icon> }
                {{ isProcessing() ? 'Initializing...' : 'Pay with PayChangu' }}
              </button>
              
              <div class="relative py-4 flex items-center">
                <div class="flex-grow border-t border-slate-100"></div>
                <span class="flex-shrink mx-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Or Manual Payment</span>
                <div class="flex-grow border-t border-slate-100"></div>
              </div>

              <div class="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h4 class="font-black text-slate-900 text-sm mb-4 uppercase tracking-tight">Manual Verification Steps:</h4>
                <div class="space-y-4">
                  <div class="flex gap-3">
                    <div class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black shrink-0">1</div>
                    <p class="text-xs text-slate-600 font-medium">Send <span class="font-black text-slate-900">K5,000</span> to one of the following numbers:</p>
                  </div>
                  
                  <div class="grid grid-cols-1 gap-3 pl-9">
                    <a href="https://wa.me/265986692501?text=Hello%20Teacher%20Emmanuel,%20I%20have%20made%20a%20manual%20payment%20for%20PRO%20access.%20Here%20is%20my%20screenshot%20and%20name:" target="_blank" class="bg-white p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex items-center justify-between group">
                      <div class="flex flex-col">
                        <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Airtel Money • E. Muthipo</span>
                        <span class="text-sm font-black text-slate-900">0986 692 501</span>
                      </div>
                      <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <mat-icon>chat</mat-icon>
                      </div>
                    </a>
                    
                    <a href="https://wa.me/265999136433?text=Hello%20Teacher%20Saidi,%20I%20have%20made%20a%20manual%20payment%20for%20PRO%20access.%20Here%20is%20my%20screenshot%20and%20name:" target="_blank" class="bg-white p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex items-center justify-between group">
                      <div class="flex flex-col">
                        <span class="text-[9px] font-black text-emerald-600 uppercase tracking-widest">TNM Mpamba • S. Liffa</span>
                        <span class="text-sm font-black text-slate-900">0999 136 433</span>
                      </div>
                      <div class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <mat-icon>chat</mat-icon>
                      </div>
                    </a>
                  </div>

                  <div class="flex gap-3">
                    <div class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black shrink-0">2</div>
                    <p class="text-xs text-slate-600 font-medium">Take a <span class="font-black text-slate-900">Screenshot</span> of the transaction message.</p>
                  </div>
                  
                  <div class="flex gap-3">
                    <div class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black shrink-0">3</div>
                    <p class="text-xs text-slate-600 font-medium">Click the WhatsApp icon next to the teacher you paid to send your screenshot and <span class="font-black text-slate-900">Name</span>.</p>
                  </div>
                </div>

                <div class="mt-6 pt-4 border-t border-slate-200">
                  <p class="text-[10px] font-bold text-slate-500 mb-2">If manual verification fails from teachers, contact our developer for assistance:</p>
                  <a href="https://wa.me/265987066051?text=Hello%20Developer,%20I%20need%20assistance%20with%20my%20manual%20payment%20verification%20for%20Educate%20MW." target="_blank" class="flex items-center gap-2 text-xs font-black text-slate-700 hover:text-emerald-600 transition-colors">
                    <mat-icon class="!w-4 !h-4 !text-[16px] text-emerald-500">support_agent</mat-icon>
                    Developer Support (0987 066 051)
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Free Plan -->
          <div class="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col">
            <h3 class="text-2xl font-black text-slate-900">Standard</h3>
            <p class="text-slate-500 mt-2 font-medium">Free Learner</p>
            <div class="text-4xl font-black text-slate-900 my-6">K0</div>
            <ul class="space-y-4 text-slate-500 mb-8 flex-1">
              <li class="flex items-start gap-3">
                <mat-icon class="text-slate-300 !w-5 !h-5 !text-[20px]">block</mat-icon>
                <span class="text-sm font-medium">Limited Past Papers</span>
              </li>
              <li class="flex items-start gap-3">
                <mat-icon class="text-slate-300 !w-5 !h-5 !text-[20px]">block</mat-icon>
                <span class="text-sm font-medium">Basic AI Teacher (5 points)</span>
              </li>
              <li class="flex items-start gap-3">
                <mat-icon class="text-slate-300 !w-5 !h-5 !text-[20px]">block</mat-icon>
                <span class="text-sm font-medium">No Offline Downloads</span>
              </li>
            </ul>
            <button class="w-full bg-slate-100 text-slate-400 font-black py-4 rounded-2xl cursor-not-allowed">Current Plan</button>
          </div>
        </div>

        <!-- FAQ & Refer -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <h3 class="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Common Questions</h3>
            <div class="space-y-6">
              <div>
                <p class="text-sm font-black text-slate-900 mb-1">How long does PRO last?</p>
                <p class="text-sm text-slate-500 font-medium">PRO access is valid until the completion of the current academic year's exams.</p>
              </div>
              <div>
                <p class="text-sm font-black text-slate-900 mb-1">Is manual verification fast?</p>
                <p class="text-sm text-slate-500 font-medium">Yes! Our managers typically verify payments within 15-30 minutes during business hours.</p>
              </div>
            </div>
          </div>
          <div class="bg-indigo-50 rounded-[2.5rem] p-8 border border-indigo-100 shadow-sm relative overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 bg-indigo-200/20 rounded-full -mr-12 -mt-12 blur-xl"></div>
            <h3 class="text-xl font-black text-indigo-900 mb-4 uppercase tracking-tight">Refer & Earn</h3>
            <p class="text-indigo-800 mb-6 font-medium">Invite 5 friends, get 25 Cleo AI Points FREE! Help your friends succeed too.</p>
            <button (click)="inviteFriends()" class="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">Invite Friends</button>
          </div>
        </div>
      </div>

      <!-- Guest Warning Modal -->
      @if (showGuestWarning()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
          <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div class="p-8 text-center">
              <div class="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <mat-icon class="!w-10 !h-10 !text-[40px] text-amber-600">account_circle</mat-icon>
              </div>
              <h3 class="text-2xl font-black text-slate-900 mb-2">Account Required</h3>
              <p class="text-slate-500 font-medium mb-8">
                You are currently signed in as a <span class="text-amber-600 font-bold">Guest</span>. To upgrade to Pro and save your progress, you must create a permanent account first.
              </p>
              
              <div class="space-y-3">
                <button (click)="router.navigate(['/login'])" class="btn-primary w-full py-4 shadow-lg shadow-indigo-100">
                  Create Account Now
                </button>
                <button (click)="showGuestWarning.set(false)" class="w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors">
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
      await this.paymentService.initializePayment(5000);
    } catch (error: unknown) {
      console.error('Payment Initialization Failed:', error);
      const msg = (error as Error)?.message || 'Failed to start payment.';
      alert(`${msg} Please ensure you have a stable internet connection and try again. If the problem persists, use the manual payment method below.`);
    } finally {
      this.isProcessing.set(false);
    }
  }

  inviteFriends() {
    const user = this.authService.currentUser();
    if (!user) return;
    
    const referralCode = user.referralCode || user.uid.substring(0, 8).toUpperCase();
    const shareUrl = `${window.location.origin}/login?ref=${referralCode}`;
    const shareText = `Hey! Join me on Educate MW and get premium educational materials. Use my referral link: ${shareUrl}`;

    if (navigator.share) {
      navigator.share({
        title: 'Join Educate MW',
        text: shareText,
        url: shareUrl
      }).catch(console.error);
    } else {
      // Fallback to clipboard
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
          alert('Referral link copied to clipboard! Share it with your friends.');
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
