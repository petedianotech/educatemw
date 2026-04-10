import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 md:p-12 border border-slate-100">
        <div class="flex items-center gap-4 mb-8">
          <div class="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <mat-icon>security</mat-icon>
          </div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
        </div>

        <div class="prose prose-slate max-w-none space-y-6 text-slate-600 font-medium leading-relaxed">
          <section>
            <h2 class="text-xl font-bold text-slate-900 mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us. This includes your name, email address, and profile picture.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-slate-900 mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to personalize your learning experience.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-slate-900 mb-3">3. Data Security</h2>
            <p>We use Firebase, a secure platform by Google, to store and protect your data. We implement industry-standard security measures to protect your personal information.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-slate-900 mb-3">4. AI Interactions</h2>
            <p>Interactions with Cleo AI are processed to provide educational assistance. These interactions may be used in an anonymized way to improve the AI's accuracy and helpfulness.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-slate-900 mb-3">5. Third-Party Services</h2>
            <p>We use PayChangu for payment processing. We do not store your mobile money or credit card details on our servers.</p>
          </section>

          <section>
            <h2 class="text-xl font-bold text-slate-900 mb-3">6. Your Choices</h2>
            <p>You can update your account information at any time through the settings page. You may also contact us to request the deletion of your account and data.</p>
          </section>
        </div>

        <div class="mt-12 pt-8 border-t border-slate-100 flex justify-center">
          <a routerLink="/" class="btn-primary px-8 py-3">Back to Dashboard</a>
        </div>
      </div>
    </div>
  `
})
export class PrivacyComponent {}
