import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [MatIconModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 pb-safe">
      <!-- Header -->
      <header class="px-4 py-3 flex items-center gap-3 bg-white border-b-[4px] border-slate-200 sticky top-0 z-10 pt-safe">
        <button (click)="goBack()" class="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-full transition-colors -ml-2">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1 class="text-xl font-black text-slate-900">Settings</h1>
      </header>

      <div class="p-4 max-w-2xl mx-auto space-y-6 mt-2">
        
        <!-- Profile Section -->
        <section class="bg-white rounded-[2rem] border-2 border-slate-200 border-b-[6px] overflow-hidden">
          <div class="p-4 border-b-2 border-slate-100 flex items-center gap-4">
            <img [src]="authService.currentUser()?.photoURL" alt="Profile" class="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200" referrerpolicy="no-referrer">
            <div>
              <h2 class="text-lg font-black text-slate-900">{{authService.currentUser()?.displayName}}</h2>
              <p class="text-sm font-bold text-slate-500">{{authService.currentUser()?.email || 'Phone User'}}</p>
            </div>
          </div>
          
          <div class="p-4">
            <label class="block text-sm font-black text-slate-700 mb-2">Username</label>
            <div class="flex gap-2">
              <input type="text" [(ngModel)]="newUsername" placeholder="Enter new username" class="flex-1 appearance-none px-4 py-3 border-2 border-slate-200 rounded-xl font-bold placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors">
              <button (click)="updateUsername()" [disabled]="!newUsername().trim() || isUpdating()" class="btn-primary px-6 py-3">
                Save
              </button>
            </div>
            @if (updateMsg()) {
              <p class="mt-2 text-sm text-emerald-600 font-bold">{{updateMsg()}}</p>
            }
          </div>
        </section>

        <!-- Account Info -->
        <section class="bg-white rounded-[2rem] border-2 border-slate-200 border-b-[6px] overflow-hidden">
          <div class="p-4 border-b-2 border-slate-100">
            <h3 class="font-black text-slate-900 flex items-center gap-2">
              <mat-icon class="text-emerald-600">account_circle</mat-icon>
              Account Status
            </h3>
          </div>
          <div class="p-4 space-y-4">
            <div class="flex justify-between items-center">
              <div>
                <p class="font-black text-slate-900">Subscription</p>
                <p class="text-sm font-bold text-slate-500">{{ authService.currentUser()?.isPro ? 'Pro Member' : 'Free Tier' }}</p>
              </div>
              @if (!authService.currentUser()?.isPro) {
                <button (click)="router.navigate(['/upgrade'])" class="btn-accent px-4 py-2 text-sm">
                  Upgrade
                </button>
              }
            </div>
            
            <div class="flex justify-between items-center">
              <div>
                <p class="font-black text-slate-900">Cleo AI Credits</p>
                <p class="text-sm font-bold text-slate-500">Free questions remaining</p>
              </div>
              <div class="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border-2 border-emerald-200 font-black">
                <mat-icon class="!w-4 !h-4 !text-[16px]">bolt</mat-icon>
                {{ authService.currentUser()?.isPro || authService.currentUser()?.role === 'admin' ? 'Unlimited' : (authService.currentUser()?.aiCredits ?? 5) }}
              </div>
            </div>
          </div>
        </section>

        <!-- Actions -->
        <section class="bg-white rounded-[2rem] border-2 border-slate-200 border-b-[6px] overflow-hidden flex flex-col">
          @if (isAdmin()) {
            <button (click)="router.navigate(['/admin'])" class="w-full p-4 flex items-center gap-3 text-emerald-600 hover:bg-emerald-50 transition-colors text-left border-b-2 border-slate-100 font-black">
              <mat-icon>admin_panel_settings</mat-icon>
              <span>Open Admin Dashboard</span>
            </button>
          }
          <button (click)="logout()" class="w-full p-4 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors text-left font-black">
            <mat-icon>logout</mat-icon>
            <span>Sign Out</span>
          </button>
        </section>

      </div>
    </div>
  `
})
export class SettingsComponent {
  authService = inject(AuthService);
  router = inject(Router);
  
  newUsername = signal('');
  isUpdating = signal(false);
  updateMsg = signal('');

  constructor() {
    const currentName = this.authService.currentUser()?.displayName;
    if (currentName) {
      this.newUsername.set(currentName);
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
