import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatIconModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <!-- Decorative Background Elements -->
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/20 blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-400/20 blur-[100px] pointer-events-none"></div>

      <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div class="flex justify-center">
          <div class="w-20 h-20 bg-emerald-500 rounded-[1.5rem] border-b-[6px] border-emerald-700 flex items-center justify-center text-white transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            <mat-icon class="!w-10 !h-10 !text-[40px]">school</mat-icon>
          </div>
        </div>
        <h2 class="mt-8 text-center text-4xl font-black text-slate-900 tracking-tight">
          EduMalawi
        </h2>
        <p class="mt-3 text-center text-base text-slate-600 font-medium">
          Your premium educational ecosystem
        </p>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div class="bg-white/80 backdrop-blur-xl py-8 px-6 shadow-2xl shadow-slate-200/50 sm:rounded-[2.5rem] sm:px-10 border border-white">
          
          <!-- Modern Segmented Control Tabs -->
          <div class="flex p-1.5 bg-slate-100/80 rounded-2xl mb-8 border-2 border-slate-200">
            <button (click)="authMode.set('phone')" 
                    [class]="authMode() === 'phone' ? 'bg-white text-emerald-700 border-2 border-slate-200 border-b-[4px]' : 'text-slate-500 hover:text-slate-700 border-2 border-transparent'" 
                    class="flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-200">
              Phone Number
            </button>
            <button (click)="authMode.set('email')" 
                    [class]="authMode() === 'email' ? 'bg-white text-emerald-700 border-2 border-slate-200 border-b-[4px]' : 'text-slate-500 hover:text-slate-700 border-2 border-transparent'" 
                    class="flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-200">
              Email Address
            </button>
          </div>

          <!-- Form -->
          <form (ngSubmit)="submitForm()" class="space-y-5">
            @if (isSignup()) {
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Username</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <mat-icon class="text-slate-400 !w-5 !h-5 !text-[20px]">person</mat-icon>
                  </div>
                  <input type="text" [(ngModel)]="username" name="username" placeholder="Choose a username" required 
                         class="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none transition-all sm:text-sm font-bold">
                </div>
              </div>
            }

            @if (authMode() === 'phone') {
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Phone Number</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <mat-icon class="text-slate-400 !w-5 !h-5 !text-[20px]">phone</mat-icon>
                  </div>
                  <input type="tel" [(ngModel)]="phone" name="phone" placeholder="e.g. 0991234567" required 
                         class="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none transition-all sm:text-sm font-bold">
                </div>
              </div>
            } @else {
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Email Address</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <mat-icon class="text-slate-400 !w-5 !h-5 !text-[20px]">email</mat-icon>
                  </div>
                  <input type="email" [(ngModel)]="email" name="email" placeholder="you@example.com" required 
                         class="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none transition-all sm:text-sm font-bold">
                </div>
              </div>
            }

            <div>
              <label class="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <mat-icon class="text-slate-400 !w-5 !h-5 !text-[20px]">lock</mat-icon>
                </div>
                <input type="password" [(ngModel)]="password" name="password" placeholder="••••••••" required 
                       class="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 outline-none transition-all sm:text-sm font-bold">
              </div>
            </div>

            @if (errorMsg()) {
              <div class="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                <mat-icon class="text-red-500 !w-5 !h-5 !text-[20px]">error_outline</mat-icon>
                <span class="text-red-700 text-sm font-medium mt-0.5">{{errorMsg()}}</span>
              </div>
            }

            <div class="pt-2">
              <button type="submit" [disabled]="isLoading()" 
                      class="btn-primary w-full py-4 text-[16px]">
                {{ isLoading() ? 'Please wait...' : (isSignup() ? 'Create Account' : 'Sign In') }}
              </button>
            </div>
          </form>

          <div class="mt-6 text-center">
            <button (click)="toggleSignup()" type="button" class="text-sm text-emerald-600 font-bold hover:text-emerald-800 transition-colors">
              {{ isSignup() ? 'Already have an account? Sign in' : 'Need an account? Sign up' }}
            </button>
          </div>

          <div class="mt-8">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-slate-200"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-4 bg-white text-slate-400 font-bold">
                  Or continue with
                </span>
              </div>
            </div>

            <div class="mt-8">
              <button (click)="loginWithGoogle()" type="button" 
                      class="btn-secondary w-full py-3.5 flex items-center gap-3">
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  authMode = signal<'phone' | 'email'>('phone');
  isSignup = signal(false);
  isLoading = signal(false);
  errorMsg = signal('');

  username = '';
  phone = '';
  email = '';
  password = '';

  toggleSignup() {
    this.isSignup.update(v => !v);
    this.errorMsg.set('');
  }

  async submitForm() {
    this.errorMsg.set('');
    
    if (this.isSignup() && !this.username.trim()) {
      this.errorMsg.set('Username is required');
      return;
    }
    if (!this.password || this.password.length < 6) {
      this.errorMsg.set('Password must be at least 6 characters');
      return;
    }

    this.isLoading.set(true);
    try {
      if (this.authMode() === 'phone') {
        if (!this.phone.trim()) {
          this.errorMsg.set('Phone number is required');
          this.isLoading.set(false);
          return;
        }
        if (this.isSignup()) {
          await this.authService.signupWithPhone(this.phone, this.password, this.username);
        } else {
          await this.authService.loginWithPhone(this.phone, this.password);
        }
      } else {
        if (!this.email.trim()) {
          this.errorMsg.set('Email is required');
          this.isLoading.set(false);
          return;
        }
        if (this.isSignup()) {
          await this.authService.signupWithEmail(this.email, this.password, this.username);
        } else {
          await this.authService.loginWithEmail(this.email, this.password);
        }
      }
      this.router.navigate(['/']);
    } catch (error: any) {
      console.error('Auth error', error);
      if (error.code === 'auth/email-already-in-use') {
        this.errorMsg.set('This account already exists. Please sign in.');
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        this.errorMsg.set('Invalid credentials. Please try again.');
      } else {
        this.errorMsg.set(error.message || 'Authentication failed');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  async loginWithGoogle() {
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Login error', error);
      this.errorMsg.set('Failed to login with Google.');
    }
  }
}
