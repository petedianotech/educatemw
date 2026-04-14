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
    <div class="min-h-screen bg-slate-50 flex flex-col sm:px-6 lg:px-8 relative overflow-x-hidden overflow-y-auto pb-safe">
      
      <!-- Decorative Background Elements -->
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/10 blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-sky-400/10 blur-[100px] pointer-events-none"></div>

      <div class="flex-1 flex flex-col justify-center py-6 sm:py-12">
        <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
          <div class="flex justify-center">
            <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-[1.25rem] sm:rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <mat-icon class="!w-8 !h-8 !text-[32px] sm:!w-10 sm:!h-10 sm:!text-[40px]">school</mat-icon>
            </div>
          </div>
          <h2 class="mt-4 sm:mt-8 text-center text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Educate MW
          </h2>
          <p class="mt-2 sm:mt-3 text-center text-sm sm:text-base text-slate-500 font-medium">
            Your premium educational ecosystem
          </p>
        </div>

        <div class="mt-6 sm:mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div class="bg-white/90 backdrop-blur-xl py-6 px-6 sm:py-8 shadow-2xl shadow-indigo-100 sm:rounded-[2.5rem] sm:px-10 border border-white/40">
            
            <!-- Google Login First -->
            <div class="mb-6 sm:mb-8">
              <button (click)="loginWithGoogle()" type="button" 
                      class="w-full py-3.5 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-indigo-100 active:scale-[0.98] transition-all shadow-sm">
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div class="mt-4 text-center">
                <button (click)="toggleSignup()" type="button" 
                        class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 active:scale-95 transition-all w-full justify-center sm:w-auto">
                  <mat-icon class="text-sm">{{ isSignup() ? 'login' : 'person_add' }}</mat-icon>
                  {{ isSignup() ? 'Already have an account? Sign in' : 'Need an account? Sign up' }}
                </button>
              </div>
              
              <div class="relative mt-8">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-slate-100"></div>
                </div>
                <div class="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
                  <span class="px-4 bg-white text-slate-400">
                    Or use credentials
                  </span>
                </div>
              </div>
            </div>

            <!-- Modern Segmented Control Tabs -->
            <div class="flex p-1.5 bg-slate-100/80 rounded-2xl mb-4 sm:mb-6 border border-slate-200/50">
              <button (click)="authMode.set('phone')" 
                      [class]="authMode() === 'phone' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'" 
                      class="flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300">
                Phone
              </button>
              <button (click)="authMode.set('email')" 
                      [class]="authMode() === 'email' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'" 
                      class="flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300">
                Email
              </button>
            </div>

            <!-- Form -->
            @if (view() === 'forgot-password') {
              <div class="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h3 class="text-lg font-black text-slate-900">Reset Password</h3>
                <p class="text-xs text-slate-500 font-medium">Choose how you want to recover your account.</p>
                
                <div class="grid grid-cols-2 gap-3">
                  <button (click)="recoveryMethod.set('email')" 
                          [class]="recoveryMethod() === 'email' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-600 border border-slate-200'"
                          class="p-4 rounded-2xl flex flex-col items-center gap-2 transition-all">
                    <mat-icon>email</mat-icon>
                    <span class="text-[10px] font-black uppercase tracking-widest">Email</span>
                  </button>
                  <button (click)="recoveryMethod.set('questions')" 
                          [class]="recoveryMethod() === 'questions' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-600 border border-slate-200'"
                          class="p-4 rounded-2xl flex flex-col items-center gap-2 transition-all">
                    <mat-icon>security</mat-icon>
                    <span class="text-[10px] font-black uppercase tracking-widest">Questions</span>
                  </button>
                </div>

                @if (recoveryMethod() === 'email') {
                  <div class="space-y-4 animate-in fade-in duration-300">
                    <div>
                      <label for="recoveryEmail" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                      <input type="email" id="recoveryEmail" [(ngModel)]="email" name="recoveryEmail" placeholder="you@example.com"
                             class="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold outline-none focus:border-indigo-500">
                    </div>
                    <button (click)="sendResetEmail()" [disabled]="isLoading()" class="btn-primary w-full py-4 shadow-lg shadow-indigo-100">
                      {{ isLoading() ? 'Sending...' : 'Send Reset Link' }}
                    </button>
                  </div>
                } @else if (recoveryMethod() === 'questions') {
                  <div class="space-y-4 animate-in fade-in duration-300">
                    <div>
                      <label for="recoveryIdentifier" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phone or Email</label>
                      <input type="text" id="recoveryIdentifier" [(ngModel)]="recoveryIdentifier" name="recoveryIdentifier" placeholder="Enter your identifier"
                             class="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold outline-none focus:border-indigo-500">
                    </div>
                    
                    @if (recoveryUser()) {
                      <div class="space-y-4 animate-in slide-in-from-top-2 duration-300">
                        @for (q of recoveryUser()?.questions; track $index) {
                          <div>
                            <label [for]="'recovery-ans-' + $index" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{{q.question}}</label>
                            <input type="text" [id]="'recovery-ans-' + $index" [(ngModel)]="recoveryAnswers[$index]" [name]="'ans'+$index" placeholder="Your answer"
                                   class="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold outline-none focus:border-indigo-500">
                          </div>
                        }
                        <button (click)="verifyQuestions()" [disabled]="isLoading()" class="btn-primary w-full py-4 shadow-lg shadow-indigo-100">
                          Verify Answers
                        </button>
                      </div>
                    } @else {
                      <button (click)="findUserForRecovery()" [disabled]="isLoading()" class="btn-secondary w-full py-4">
                        Find Account
                      </button>
                    }
                  </div>
                }

                <button (click)="view.set('login')" class="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                  Back to Login
                </button>
              </div>
            } @else if (view() === 'security-setup') {
              <div class="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div class="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                  <mat-icon class="text-amber-500 !w-5 !h-5 !text-[20px]">warning</mat-icon>
                  <p class="text-amber-700 text-[10px] font-bold leading-tight">
                    Set security questions to recover your account if you forget your password. If you skip this, you will not be able to recover your account.
                  </p>
                </div>

                <div class="space-y-4">
                  <div>
                    <label for="ans1" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Question 1: What is your home district?</label>
                    <input type="text" id="ans1" [(ngModel)]="ans1" name="ans1" placeholder="Answer"
                           class="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold outline-none focus:border-indigo-500">
                  </div>
                  <div>
                    <label for="ans2" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Question 2: What is your mother's maiden name?</label>
                    <input type="text" id="ans2" [(ngModel)]="ans2" name="ans2" placeholder="Answer"
                           class="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold outline-none focus:border-indigo-500">
                  </div>
                </div>

                <div class="flex gap-3">
                  <button (click)="skipSecurityQuestions()" class="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                    Skip for now
                  </button>
                  <button (click)="finishSignup()" [disabled]="!ans1 || !ans2 || isLoading()" class="flex-1 btn-primary py-4 shadow-lg shadow-indigo-100">
                    {{ isLoading() ? 'Saving...' : 'Finish Signup' }}
                  </button>
                </div>
              </div>
            } @else {
              <form (ngSubmit)="submitForm()" class="space-y-4">
                @if (isSignup()) {
                  <div class="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label for="username" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Username</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <mat-icon class="text-slate-400 !w-5 !h-5 !text-[20px]">person</mat-icon>
                      </div>
                      <input type="text" id="username" [(ngModel)]="username" name="username" placeholder="Choose a username" required 
                             enterkeyhint="next"
                             class="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all sm:text-sm font-bold">
                    </div>
                  </div>
                }

                @if (authMode() === 'phone') {
                  <div class="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label for="phone" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <mat-icon class="text-slate-400 !w-5 !h-5 !text-[20px]">phone</mat-icon>
                      </div>
                      <input type="tel" id="phone" [(ngModel)]="phone" name="phone" placeholder="e.g. 0991234567" required 
                             enterkeyhint="next"
                             class="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all sm:text-sm font-bold">
                    </div>
                  </div>
                } @else {
                  <div class="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label for="email" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <mat-icon class="text-slate-400 !w-5 !h-5 !text-[20px]">email</mat-icon>
                      </div>
                      <input type="email" id="email" [(ngModel)]="email" name="email" placeholder="you@example.com" required 
                             enterkeyhint="next"
                             class="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all sm:text-sm font-bold">
                    </div>
                  </div>
                }

                <div class="animate-in fade-in slide-in-from-top-2 duration-300">
                  <div class="flex justify-between items-center mb-1.5 ml-1">
                    <label for="password" id="password-label" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                    @if (!isSignup()) {
                      <button (click)="view.set('forgot-password')" type="button" class="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Forgot?</button>
                    }
                  </div>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <mat-icon class="text-slate-400 !w-5 !h-5 !text-[20px]">lock</mat-icon>
                    </div>
                    <input type="password" id="password" [(ngModel)]="password" name="password" placeholder="••••••••" required 
                           aria-labelledby="password-label"
                           enterkeyhint="done" (keyup.enter)="submitForm()"
                           class="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all sm:text-sm font-bold">
                  </div>
                </div>

                @if (errorMsg()) {
                  <div class="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in shake duration-500">
                    <mat-icon class="text-rose-500 !w-5 !h-5 !text-[20px]">error_outline</mat-icon>
                    <span class="text-rose-700 text-xs font-bold leading-tight">{{errorMsg()}}</span>
                  </div>
                }

                @if (successMsg()) {
                  <div class="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 animate-in fade-in duration-500">
                    <mat-icon class="text-emerald-500 !w-5 !h-5 !text-[20px]">check_circle_outline</mat-icon>
                    <span class="text-emerald-700 text-xs font-bold leading-tight">{{successMsg()}}</span>
                  </div>
                }

                <div class="pt-2 sm:pt-4 space-y-3">
                  <button type="submit" [disabled]="isLoading()" 
                          class="btn-primary w-full py-3.5 sm:py-4 text-sm sm:text-[15px] shadow-xl shadow-indigo-200 active:scale-[0.98] transition-all">
                    {{ isLoading() ? 'Processing...' : (isSignup() ? 'Create Free Account' : 'Sign In to Dashboard') }}
                  </button>
                  
                  @if (!isSignup()) {
                    <button (click)="loginAsGuest()" type="button" [disabled]="isLoading()"
                            class="w-full py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                      <mat-icon class="text-sm">person_outline</mat-icon>
                      Sign in as Guest
                    </button>
                    <p class="text-[9px] text-center text-slate-400 font-bold px-4">
                      Guest accounts have 2 AI credits. Create an account for 5 credits per day!
                    </p>
                  }
                </div>
              </form>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);
  
  authMode = signal<'phone' | 'email'>('phone');
  isSignup = signal(false);
  isLoading = signal(false);
  view = signal<'login' | 'forgot-password' | 'security-setup'>('login');
  
  username = '';
  email = '';
  phone = '';
  password = '';
  errorMsg = signal('');
  successMsg = signal('');

  // Recovery
  recoveryMethod = signal<'email' | 'questions'>('email');
  recoveryIdentifier = '';
  recoveryUser = signal<{ questions: { question: string; answer: string }[] } | null>(null);
  recoveryAnswers: string[] = [];

  // Security Setup
  ans1 = '';
  ans2 = '';

  toggleSignup() {
    this.isSignup.update(v => !v);
    this.errorMsg.set('');
    this.successMsg.set('');
    this.view.set('login');
  }

  async submitForm() {
    this.errorMsg.set('');
    this.successMsg.set('');
    
    if (this.isSignup()) {
      if (!this.username.trim()) {
        this.errorMsg.set('Username is required');
        return;
      }
      if (this.authMode() === 'phone' && !this.phone.trim()) {
        this.errorMsg.set('Phone number is required');
        return;
      }
      if (this.authMode() === 'email' && !this.email.trim()) {
        this.errorMsg.set('Email is required');
        return;
      }
      if (!this.password || this.password.length < 6) {
        this.errorMsg.set('Password must be at least 6 characters');
        return;
      }
      // Skip security setup, proceed directly to signup
      await this.finishSignup();
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
        await this.authService.loginWithPhone(this.phone, this.password);
      } else {
        if (!this.email.trim()) {
          this.errorMsg.set('Email is required');
          this.isLoading.set(false);
          return;
        }
        await this.authService.loginWithEmail(this.email, this.password);
      }
      this.router.navigate(['/dashboard']);
    } catch (error: unknown) {
      console.error('Auth error', error);
      const err = error as { code?: string; message?: string };
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        this.errorMsg.set('Invalid credentials. Please try again.');
      } else {
        this.errorMsg.set(err.message || 'Authentication failed');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  async finishSignup() {
    this.isLoading.set(true);
    this.errorMsg.set('');
    
    try {
      if (this.authMode() === 'phone') {
        await this.authService.signupWithPhone(this.phone, this.password, this.username);
      } else {
        await this.authService.signupWithEmail(this.email, this.password, this.username);
      }
      this.router.navigate(['/dashboard']);
    } catch (error: unknown) {
      const err = error as { message?: string };
      this.errorMsg.set(err.message || 'Signup failed');
    } finally {
      this.isLoading.set(false);
    }
  }

  async loginAsGuest() {
    this.isLoading.set(true);
    try {
      await this.authService.loginAsGuest();
      this.router.navigate(['/dashboard']);
    } catch (error: unknown) {
      console.error('Guest login error', error);
      this.errorMsg.set('Guest login failed');
    } finally {
      this.isLoading.set(false);
    }
  }

  async sendResetEmail() {
    if (!this.email) {
      this.errorMsg.set('Please enter your email address');
      return;
    }
    this.isLoading.set(true);
    try {
      await this.authService.sendPasswordReset(this.email);
      this.successMsg.set('Password reset link sent to your email!');
      setTimeout(() => this.view.set('login'), 3000);
    } catch (error: unknown) {
      const err = error as { message?: string };
      this.errorMsg.set(err.message || 'Failed to send reset email');
    } finally {
      this.isLoading.set(false);
    }
  }

  async findUserForRecovery() {
    if (!this.recoveryIdentifier) {
      this.errorMsg.set('Please enter your phone or email');
      return;
    }
    this.isLoading.set(true);
    try {
      const recoveryData = await this.authService.getSecurityQuestions(this.recoveryIdentifier);

      if (recoveryData && recoveryData.questions && recoveryData.questions.length > 0) {
        this.recoveryUser.set(recoveryData);
        this.recoveryAnswers = new Array(recoveryData.questions.length).fill('');
      } else {
        this.errorMsg.set('No security questions found for this account. Please use email recovery.');
      }
    } catch (error: unknown) {
      console.error('Recovery error', error);
      this.errorMsg.set('Failed to find account');
    } finally {
      this.isLoading.set(false);
    }
  }

  async verifyQuestions() {
    const recoveryData = this.recoveryUser();
    if (!recoveryData) return;

    const allCorrect = recoveryData.questions.every((q, i: number) => 
      q.answer.toLowerCase() === this.recoveryAnswers[i].trim().toLowerCase()
    );

    if (allCorrect) {
      this.successMsg.set('Identity verified! Please contact support at support@educatemw.com to reset your password (manual reset for non-email accounts).');
    } else {
      this.errorMsg.set('Incorrect answers. Please try again.');
    }
  }

  async loginWithGoogle() {
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Login error', error);
      this.errorMsg.set('Failed to login with Google.');
    }
  }
}
