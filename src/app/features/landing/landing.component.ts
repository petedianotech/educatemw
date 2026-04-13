import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  styles: [`
    .wave-text {
      display: inline-block;
      background: linear-gradient(
        to right, 
        #4f46e5 0%, 
        #0ea5e9 25%, 
        #6366f1 50%, 
        #0ea5e9 75%, 
        #4f46e5 100%
      );
      background-size: 200% auto;
      color: #4f46e5;
      background-clip: text;
      text-fill-color: transparent;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: wave-animation 3s linear infinite;
      font-weight: 900;
    }
    @keyframes wave-animation {
      0% { background-position: 0% center; }
      100% { background-position: 200% center; }
    }
  `],
  template: `
    @if (isLoading()) {
      <div class="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center animate-out fade-out duration-500 delay-300 fill-mode-forwards">
        <!-- Animated Background Orbs -->
        <div class="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse"></div>
        <div class="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" style="animation-delay: 1.5s"></div>
        
        <div class="relative z-10 flex flex-col items-center">
          <!-- Logo with Catching Animation -->
          <div class="relative mb-12 group">
            <div class="absolute inset-0 bg-indigo-500/40 rounded-[2.5rem] blur-2xl animate-pulse"></div>
            <div class="w-28 h-28 bg-gradient-to-tr from-indigo-600 via-blue-500 to-sky-400 rounded-[2.5rem] flex items-center justify-center text-white shadow-[0_20px_50px_rgba(79,70,229,0.4)] relative z-10 animate-in zoom-in duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)">
              <mat-icon class="!w-14 !h-14 !text-[56px] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">school</mat-icon>
            </div>
            <div class="absolute inset-0 animate-spin-slow pointer-events-none">
              <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-3 h-3 bg-indigo-400 rounded-full shadow-[0_0_15px_rgba(129,140,248,0.8)]"></div>
            </div>
          </div>
          
          <div class="text-center space-y-4">
            <h2 class="text-4xl font-black text-white tracking-tighter animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500">
              Educate <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-300">MW</span>
            </h2>
            <div class="flex items-center gap-3 justify-center">
              <div class="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
              <div class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              <div class="w-1.5 h-1.5 bg-sky-300 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
          </div>
        </div>
      </div>
    }

    <div class="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700 overflow-x-hidden">
      
      <!-- Navigation -->
      <nav class="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 h-20 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <mat-icon>school</mat-icon>
          </div>
          <span class="text-xl font-black tracking-tight">Educate MW</span>
        </div>
        <div class="flex items-center gap-4">
          @if (authService.currentUser()) {
            <a routerLink="/dashboard" class="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Dashboard</a>
          } @else {
            <a routerLink="/login" class="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Sign In</a>
            <a routerLink="/login" class="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">Get Started</a>
          }
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="pt-40 pb-20 px-6 relative overflow-hidden">
        <!-- Decorative Orbs -->
        <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/10 blur-[120px] pointer-events-none"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sky-400/10 blur-[120px] pointer-events-none"></div>

        <div class="max-w-5xl mx-auto text-center relative z-10">
          <div class="inline-flex items-center gap-2 bg-white text-indigo-600 px-5 py-2.5 rounded-full border border-indigo-100 text-[10px] font-black uppercase tracking-widest mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-xl shadow-indigo-100/50">
            <mat-icon class="text-amber-500 !w-5 !h-5 !text-[20px] flex items-center justify-center">stars</mat-icon>
            <span class="wave-text">The #1 Learning Platform in Malawi</span>
          </div>
          
          <h1 class="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Master Your Exams with <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Cleo AI</span>
          </h1>
          
          <p class="text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Access MSCE past papers, video lessons, and your personal AI tutor. Join thousands of students achieving excellence with Educate MW.
          </p>

          <div class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 mb-16">
            <a routerLink="/login" class="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 transition-all">
              Start Learning Free
            </a>
            <a href="#features" class="w-full sm:w-auto px-10 py-5 bg-white text-slate-700 border-2 border-slate-100 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all">
              Explore Features
            </a>
          </div>

          <!-- Social Proof -->
          <div class="mt-20 pt-10 border-t border-slate-100 flex flex-col items-center animate-in fade-in duration-1000 delay-500">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Trusted by students from</p>
            <div class="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale">
              <span class="text-xl font-black tracking-tighter">BANDAWE</span>
              <span class="text-xl font-black tracking-tighter">KAMUZU ACADEMY</span>
              <span class="text-xl font-black tracking-tighter">MARIST</span>
              <span class="text-xl font-black tracking-tighter">LOYOLA</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Grid -->
      <section id="features" class="py-24 bg-slate-50 px-6">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">Everything You Need to Succeed</h2>
            <p class="text-slate-500 font-medium">Powerful tools designed specifically for the Malawian curriculum.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Feature 1: Cleo AI -->
            <div class="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white hover:-translate-y-2 transition-all duration-500 group">
              <div class="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all">
                <mat-icon class="!w-8 !h-8 !text-[32px]">auto_awesome</mat-icon>
              </div>
              <h3 class="text-xl font-black text-slate-900 mb-3">Cleo AI Tutor</h3>
              <p class="text-slate-500 text-sm leading-relaxed font-medium">Get instant explanations for any topic, 24/7. Cleo understands your syllabus perfectly.</p>
            </div>

            <!-- Feature 2: Past Papers -->
            <div class="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white hover:-translate-y-2 transition-all duration-500 group">
              <div class="w-16 h-16 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all">
                <mat-icon class="!w-8 !h-8 !text-[32px]">library_books</mat-icon>
              </div>
              <h3 class="text-xl font-black text-slate-900 mb-3">Past Paper Library</h3>
              <p class="text-slate-500 text-sm leading-relaxed font-medium">Access over 10 years of MSCE past papers with detailed marking schemes and notes.</p>
            </div>

            <!-- Feature 3: Quizzes -->
            <div class="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white hover:-translate-y-2 transition-all duration-500 group">
              <div class="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all">
                <mat-icon class="!w-8 !h-8 !text-[32px]">quiz</mat-icon>
              </div>
              <h3 class="text-xl font-black text-slate-900 mb-3">Interactive Quizzes</h3>
              <p class="text-slate-500 text-sm leading-relaxed font-medium">Test your knowledge with timed quizzes and track your progress on the leaderboard.</p>
            </div>

            <!-- Feature 4: Group Chat -->
            <div class="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white hover:-translate-y-2 transition-all duration-500 group">
              <div class="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all">
                <mat-icon class="!w-8 !h-8 !text-[32px]">forum</mat-icon>
              </div>
              <h3 class="text-xl font-black text-slate-900 mb-3">Community Forum</h3>
              <p class="text-slate-500 text-sm leading-relaxed font-medium">Connect with fellow students, share study tips, and discuss challenging MSCE topics.</p>
            </div>

            <!-- Feature 5: Flashcards -->
            <div class="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white hover:-translate-y-2 transition-all duration-500 group">
              <div class="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all">
                <mat-icon class="!w-8 !h-8 !text-[32px]">layers</mat-icon>
              </div>
              <h3 class="text-xl font-black text-slate-900 mb-3">Smart Flashcards</h3>
              <p class="text-slate-500 text-sm leading-relaxed font-medium">Memorize key definitions and formulas faster with our spaced-repetition flashcard system.</p>
            </div>

            <!-- Feature 6: Video Lessons -->
            <div class="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white hover:-translate-y-2 transition-all duration-500 group">
              <div class="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all">
                <mat-icon class="!w-8 !h-8 !text-[32px]">play_circle_outline</mat-icon>
              </div>
              <h3 class="text-xl font-black text-slate-900 mb-3">Video Lessons</h3>
              <p class="text-slate-500 text-sm leading-relaxed font-medium">Watch step-by-step video tutorials from top teachers explaining complex MSCE concepts.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-24 px-6">
        <div class="max-w-5xl mx-auto bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div class="absolute bottom-0 left-0 w-64 h-64 bg-sky-400/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
          
          <h2 class="text-4xl md:text-6xl font-black tracking-tight mb-6 relative z-10">Ready to Ace Your Exams?</h2>
          <p class="text-indigo-100 text-lg mb-12 max-w-xl mx-auto font-medium relative z-10">Join over 5,000 Malawian students already using Educate MW to transform their grades.</p>
          
          <a routerLink="/login" class="inline-flex items-center gap-3 px-12 py-6 bg-white text-indigo-600 rounded-2xl font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all relative z-10">
            Get Started for Free
            <mat-icon>arrow_forward</mat-icon>
          </a>
        </div>
      </section>

      <!-- Footer -->
      <footer class="py-12 border-t border-slate-100 px-6 text-center">
        <div class="flex items-center justify-center gap-3 mb-6">
          <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <mat-icon class="scale-75">school</mat-icon>
          </div>
          <span class="text-lg font-black tracking-tight">Educate MW</span>
        </div>
        <p class="text-slate-400 text-sm font-medium">© 2026 Educate MW. Empowering the next generation of Malawian leaders.</p>
      </footer>

    </div>
  `
})
export class LandingComponent implements OnInit {
  authService = inject(AuthService);
  isLoading = signal(true);

  ngOnInit() {
    // Global loading is handled in App component
    this.isLoading.set(false);
  }
}
