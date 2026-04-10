import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 md:p-12 border border-slate-100">
        <div class="flex items-center gap-4 mb-8">
          <div class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <mat-icon>gavel</mat-icon>
          </div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">Terms of Service</h1>
        </div>

        <div class="prose prose-slate max-w-none space-y-6 text-slate-600 font-medium leading-relaxed">
          <section>
            <h2 class="text-xl font-bold text-slate-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using Educate MW, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-slate-900 mb-3">2. Description of Service</h2>
            <p>Educate MW provides educational resources, including AI tutoring (Cleo), past papers, video lessons, and community forums, specifically designed for MSCE students in Malawi.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-slate-900 mb-3">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-slate-900 mb-3">4. Premium Subscriptions</h2>
            <p>Premium access is granted upon a one-time payment of K5,000. This access is valid until the completion of the current academic year's exams. Payments are processed via PayChangu and are non-refundable.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-slate-900 mb-3">5. Content Ownership</h2>
            <p>All educational content provided on Educate MW is the property of Educate MW or its content suppliers and is protected by copyright laws.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-slate-900 mb-3">6. Limitation of Liability</h2>
            <p>Educate MW shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our services.</p>
          </section>
        </div>

        <div class="mt-12 pt-8 border-t border-slate-100 flex justify-center">
          <a routerLink="/" class="btn-primary px-8 py-3">Back to Dashboard</a>
        </div>
      </div>
    </div>
  `
})
export class TermsComponent {}
