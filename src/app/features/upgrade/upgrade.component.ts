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
    <div class="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 pb-24">
      <!-- Special Offer Header -->
      <div class="bg-indigo-900 text-white rounded-3xl p-8 mb-8 text-center shadow-xl">
        <h2 class="text-3xl font-black mb-2">Special Exam Offer! 🎓</h2>
        <p class="text-indigo-100 text-lg">Get exclusive 2026 MSCE, JCE & PSLCE Predicted Papers.</p>
        <p class="text-indigo-200 mt-2 font-medium">Join thousands of students excelling with Educate MW PRO.</p>
      </div>

      <!-- Plans Comparison -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <!-- PRO Plan -->
        <div class="bg-white rounded-3xl p-8 border-2 border-indigo-500 shadow-lg relative">
          <span class="absolute top-4 right-4 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">Recommended</span>
          <h3 class="text-2xl font-black text-slate-900">Educate MW PRO</h3>
          <p class="text-slate-500 mt-2">Unlimited access until exams finish</p>
          <div class="text-4xl font-black text-slate-900 my-6">K5,000</div>
          <ul class="space-y-3 text-slate-700 mb-8">
            <li class="flex items-center gap-2"><mat-icon class="text-indigo-600">check_circle</mat-icon> Unlimited Offline Downloads</li>
            <li class="flex items-center gap-2"><mat-icon class="text-indigo-600">check_circle</mat-icon> Unlimited AI Teacher Access</li>
            <li class="flex items-center gap-2"><mat-icon class="text-indigo-600">check_circle</mat-icon> Step-by-step Video Lessons</li>
            <li class="flex items-center gap-2"><mat-icon class="text-indigo-600">check_circle</mat-icon> Exclusive MANEB Exam Tips</li>
            <li class="flex items-center gap-2"><mat-icon class="text-indigo-600">check_circle</mat-icon> 100% Ad-Free Experience</li>
          </ul>
          <!-- Payment Methods -->
          <div class="space-y-4">
            <button (click)="startPayment()" [disabled]="isProcessing()" class="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2">
              @if (isProcessing()) { <mat-icon class="animate-spin">sync</mat-icon> } @else { <mat-icon>payment</mat-icon> }
              {{ isProcessing() ? 'Initializing...' : 'Pay Now (Auto-Verify)' }}
            </button>
            <div class="border-t pt-4">
               <h4 class="font-bold text-slate-900 mb-2">Manual Payment & Support</h4>
               <p class="text-sm text-slate-600 mb-2">Pay via Airtel Money or Mpamba to:</p>
               <div class="bg-slate-50 p-3 rounded-lg text-sm font-bold text-slate-800 mb-2">Emmanuel Muthipo: 0986 692 501</div>
               <div class="bg-slate-50 p-3 rounded-lg text-sm font-bold text-slate-800">Saidi Liffa: 0999 136 433</div>
               <button class="w-full mt-3 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200">Message Manager</button>
            </div>
          </div>
        </div>

        <!-- Free Plan -->
        <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h3 class="text-2xl font-black text-slate-900">Standard</h3>
          <p class="text-slate-500 mt-2">Free Learner</p>
          <div class="text-4xl font-black text-slate-900 my-6">K0</div>
          <ul class="space-y-3 text-slate-500 mb-8">
            <li class="flex items-center gap-2"><mat-icon class="text-slate-400">cancel</mat-icon> Limited Past Papers</li>
            <li class="flex items-center gap-2"><mat-icon class="text-slate-400">cancel</mat-icon> Basic AI Teacher (5 points)</li>
            <li class="flex items-center gap-2"><mat-icon class="text-slate-400">cancel</mat-icon> No Offline Downloads</li>
            <li class="flex items-center gap-2"><mat-icon class="text-slate-400">cancel</mat-icon> No Video Explanations</li>
            <li class="flex items-center gap-2"><mat-icon class="text-slate-400">cancel</mat-icon> Ad-supported</li>
          </ul>
          <button class="w-full bg-slate-100 text-slate-700 font-bold py-4 rounded-xl">Start your journey</button>
        </div>
      </div>

      <!-- FAQ & Refer -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h3 class="text-xl font-black text-slate-900 mb-4">Common Questions</h3>
          <div class="space-y-4">
            <p class="text-sm font-bold text-slate-700">How long does PRO last?</p>
            <p class="text-sm text-slate-500">PRO access is valid until the completion of the current academic year's exams.</p>
            <p class="text-sm font-bold text-slate-700">Can I pay with Airtel Money?</p>
            <p class="text-sm text-slate-500">Yes, you can pay via Airtel Money or TNM Mpamba using our manual payment method.</p>
          </div>
        </div>
        <div class="bg-indigo-50 rounded-3xl p-8 border border-indigo-100 shadow-sm">
          <h3 class="text-xl font-black text-indigo-900 mb-4">Refer & Earn</h3>
          <p class="text-indigo-800 mb-4">Invite 5 friends, get 25 Cleo AI Points FREE!</p>
          <button class="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl">Invite Friends</button>
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
}
