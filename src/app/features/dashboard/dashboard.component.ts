import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full overflow-y-auto bg-slate-50 pb-24 relative">
      
      <!-- Premium Header Background -->
      <div class="absolute top-0 left-0 right-0 h-64 bg-emerald-600 rounded-b-[3rem] shadow-lg shadow-emerald-900/10 z-0 border-b-[8px] border-emerald-700">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 rounded-b-[3rem]"></div>
      </div>

      <div class="relative z-10 p-4 md:p-8">
        <!-- Greeting Section -->
        <div class="mb-8 mt-4 px-2">
          <h2 class="text-sm font-bold text-emerald-100 uppercase tracking-wider mb-1">Welcome Back</h2>
          <h1 class="text-3xl font-black text-white tracking-tight">{{authService.currentUser()?.displayName}}</h1>
        </div>

        <!-- Quick Actions Grid (App Style) -->
        <div class="grid grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
          
          <!-- Cleo AI -->
          <a routerLink="/chat" class="bg-white p-5 rounded-[2rem] text-slate-900 border-2 border-slate-100 border-b-[6px] active:border-b-2 active:translate-y-[4px] transition-all duration-150 flex flex-col justify-between aspect-square relative overflow-hidden">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-60"></div>
            <div class="flex justify-between items-start relative z-10">
              <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border-2 border-blue-100 border-b-[4px]">
                <mat-icon class="!w-7 !h-7 !text-[28px]">auto_awesome</mat-icon>
              </div>
              @if (!authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin' && (authService.currentUser()?.aiCredits ?? 5) <= 0) {
                <div class="bg-amber-50 text-amber-700 p-1.5 rounded-full border-2 border-amber-200 border-b-[4px]">
                  <mat-icon class="!w-4 !h-4 !text-[16px]">lock</mat-icon>
                </div>
              }
            </div>
            <div class="relative z-10">
              <h3 class="font-black text-xl mb-1 text-slate-800">Cleo AI</h3>
              <p class="text-slate-500 text-xs font-bold">Ask anything</p>
            </div>
          </a>

          <!-- Library -->
          <a routerLink="/notes" class="bg-white p-5 rounded-[2rem] text-slate-900 border-2 border-slate-100 border-b-[6px] active:border-b-2 active:translate-y-[4px] transition-all duration-150 flex flex-col justify-between aspect-square relative overflow-hidden">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-emerald-100 rounded-full blur-2xl opacity-60"></div>
            <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border-2 border-emerald-100 border-b-[4px] relative z-10">
              <mat-icon class="!w-7 !h-7 !text-[28px]">library_books</mat-icon>
            </div>
            <div class="relative z-10">
              <h3 class="font-black text-xl mb-1 text-slate-800">Library</h3>
              <p class="text-slate-500 text-xs font-bold">Past papers & notes</p>
            </div>
          </a>

          <!-- Community -->
          <a routerLink="/community" class="bg-white p-5 rounded-[2rem] text-slate-900 border-2 border-slate-100 border-b-[6px] active:border-b-2 active:translate-y-[4px] transition-all duration-150 flex flex-col justify-between aspect-square relative overflow-hidden">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-purple-100 rounded-full blur-2xl opacity-60"></div>
            <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center border-2 border-purple-100 border-b-[4px] relative z-10">
              <mat-icon class="!w-7 !h-7 !text-[28px]">forum</mat-icon>
            </div>
            <div class="relative z-10">
              <h3 class="font-black text-xl mb-1 text-slate-800">Community</h3>
              <p class="text-slate-500 text-xs font-bold">Discuss with peers</p>
            </div>
          </a>

          <!-- Career Guidance -->
          <a routerLink="/career-guidance" class="bg-white p-5 rounded-[2rem] text-slate-900 border-2 border-slate-100 border-b-[6px] active:border-b-2 active:translate-y-[4px] transition-all duration-150 flex flex-col justify-between aspect-square relative overflow-hidden">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-amber-100 rounded-full blur-2xl opacity-60"></div>
            <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border-2 border-amber-100 border-b-[4px] relative z-10">
              <mat-icon class="!w-7 !h-7 !text-[28px]">explore</mat-icon>
            </div>
            <div class="relative z-10">
              <h3 class="font-black text-xl mb-1 text-slate-800">Careers</h3>
              <p class="text-slate-500 text-xs font-bold">MSCE Points Calc</p>
            </div>
          </a>
        </div>

        <!-- Pro Upgrade Banner (Native App Style) -->
        @if (!authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin') {
          <div class="max-w-2xl mx-auto">
            <div class="bg-slate-900 rounded-[2.5rem] p-8 text-white border-2 border-slate-800 border-b-[8px] relative overflow-hidden">
              <div class="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-amber-500 opacity-20 blur-3xl pointer-events-none"></div>
              <div class="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-emerald-500 opacity-20 blur-2xl pointer-events-none"></div>
              
              <div class="relative z-10">
                <div class="flex items-center gap-2 mb-4">
                  <div class="p-1.5 bg-amber-500/20 rounded-lg border-2 border-amber-500/30">
                    <mat-icon class="text-amber-400 !w-5 !h-5 !text-[20px]">workspace_premium</mat-icon>
                  </div>
                  <span class="text-amber-400 font-black text-sm tracking-widest uppercase">EduMalawi Pro</span>
                </div>
                
                <h3 class="text-3xl font-black mb-3 tracking-tight">Unlock Your Potential</h3>
                <p class="text-slate-300 text-sm mb-8 font-bold leading-relaxed max-w-[90%]">Get unlimited access to Cleo AI and premium past papers to ace your exams.</p>
                
                <a routerLink="/upgrade" class="btn-accent w-full py-4 text-[16px]">
                  Upgrade Now
                </a>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class DashboardComponent {
  authService = inject(AuthService);
}
