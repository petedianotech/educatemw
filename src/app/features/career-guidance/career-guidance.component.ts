import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

interface SubjectGrade {
  name: string;
  grade: number | null;
  isMandatory?: boolean;
}

interface CareerPath {
  title: string;
  institution: string;
  pointsRange: string;
  requirements: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-career-guidance',
  standalone: true,
  imports: [FormsModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden relative transition-colors duration-500">
      <!-- Header -->
      <div class="bg-gradient-to-r from-rose-600 to-pink-600 dark:from-rose-900 dark:to-pink-900 px-4 py-6 shrink-0 relative z-10 shadow-md transition-colors duration-500">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div class="flex items-center gap-3 relative z-10">
          <button (click)="goBack()" class="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all">
            <mat-icon class="!w-5 !h-5 !text-[20px]">arrow_back</mat-icon>
          </button>
          <div class="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg">
            <mat-icon class="!w-6 !h-6 !text-[24px]">explore</mat-icon>
          </div>
          <div>
            <h1 class="text-xl font-black text-white tracking-tight leading-none">Careers</h1>
            <p class="text-rose-100 font-medium text-[11px] mt-1">Points & programs</p>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-3 custom-scrollbar">
        <div class="max-w-2xl mx-auto flex flex-col gap-4">
          
          <!-- MSCE Calculator -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden relative transition-colors duration-500">
            <div class="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/50 transition-colors duration-500">
              <h3 class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 transition-colors duration-500">
                <mat-icon class="text-rose-500 dark:text-rose-400 !w-4 !h-4 !text-[16px]">calculate</mat-icon>
                Points Calculator
              </h3>
            </div>
            
            <div class="p-4">
              <div class="grid grid-cols-2 gap-x-4 gap-y-3">
                @for (subject of subjects(); track subject.name; let i = $index) {
                  <div class="flex flex-col gap-1">
                    <label [for]="'grade-' + i" class="text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center justify-between transition-colors duration-500">
                      <span class="truncate pr-1">{{subject.name}}</span>
                      @if (subject.isMandatory) {
                        <span class="text-[8px] font-black uppercase tracking-widest text-rose-500 dark:text-rose-400 shrink-0">*Req</span>
                      }
                    </label>
                    <select 
                      [id]="'grade-' + i"
                      [ngModel]="subject.grade" 
                      (ngModelChange)="updateGrade(i, $event)"
                      class="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg focus:border-rose-500 dark:focus:border-rose-400 outline-none transition-all text-center font-bold text-xs text-slate-900 dark:text-white appearance-none">
                      <option [ngValue]="null">-</option>
                      <option [ngValue]="1">1</option>
                      <option [ngValue]="2">2</option>
                      <option [ngValue]="3">3</option>
                      <option [ngValue]="4">4</option>
                      <option [ngValue]="5">5</option>
                      <option [ngValue]="6">6</option>
                      <option [ngValue]="7">7</option>
                      <option [ngValue]="8">8</option>
                      <option [ngValue]="9">9</option>
                    </select>
                  </div>
                }
              </div>

              <button (click)="resetCalculator()" class="w-full mt-4 py-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center gap-1 transition-colors duration-500">
                <mat-icon class="!w-3 !h-3 !text-[12px]">refresh</mat-icon>
                Reset
              </button>
            </div>

            <!-- Results Panel -->
            <div class="p-4 bg-rose-50 dark:bg-rose-900/20 border-t border-rose-100 dark:border-rose-900/40 transition-colors duration-500">
              <div class="flex items-center justify-between mb-1">
                <span class="text-rose-900 dark:text-rose-200 font-black text-xs transition-colors duration-500">Total Points (Best 6):</span>
                <div class="text-xl font-black text-rose-600 dark:text-rose-400 transition-colors duration-500">
                  @if (calculatedPoints() !== null) {
                    {{calculatedPoints()}}
                  } @else {
                    <span class="text-rose-300 dark:text-rose-700 transition-colors duration-500">--</span>
                  }
                </div>
              </div>
              @if (calculatedPoints() === null) {
                <p class="text-[10px] text-rose-500 dark:text-rose-400 font-bold transition-colors duration-500">Enter English + 5 subjects.</p>
              } @else {
                <p class="text-[10px] text-rose-800 dark:text-rose-300 font-bold leading-tight transition-colors duration-500">
                  {{getQualificationMessage(calculatedPoints()!)}}
                </p>
              }
            </div>
          </div>

          <!-- Career Paths -->
          <div class="flex items-center justify-between mt-4">
            <h3 class="text-base font-black text-slate-900 dark:text-white transition-colors duration-500">University Programs</h3>
          </div>
          
          <div class="flex flex-col gap-4">
            @for (career of careers; track career.title) {
              <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm hover:shadow-md border border-slate-200/80 dark:border-white/10 flex gap-4 items-start relative overflow-hidden group transition-all duration-500">
                <div class="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/50 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm relative z-10 group-hover:scale-105 transition-transform" [class]="career.color">
                  <mat-icon class="!w-7 !h-7 !text-[28px]">{{career.icon}}</mat-icon>
                </div>
                <div class="flex-1 min-w-0 relative z-10">
                  <h4 class="text-sm font-black text-slate-900 dark:text-slate-100 truncate transition-colors duration-500">{{career.title}}</h4>
                  <p class="text-xs font-bold text-rose-500 dark:text-rose-400 mb-1.5 truncate transition-colors duration-500">{{career.institution}}</p>
                  <div class="flex items-center gap-2 mb-1.5">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Points:</span>
                    <span class="text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-white/10 transition-colors duration-500">{{career.pointsRange}}</span>
                  </div>
                  <p class="text-xs font-medium text-slate-600 dark:text-slate-400 leading-tight line-clamp-2 transition-colors duration-500">{{career.requirements}}</p>
                </div>
              </div>
            }
          </div>

        </div>
      </div>
    </div>
  `
})
export class CareerGuidanceComponent {
  subjects = signal<SubjectGrade[]>([
    { name: 'English', grade: null, isMandatory: true },
    { name: 'Mathematics', grade: null },
    { name: 'Biology', grade: null },
    { name: 'Physics', grade: null },
    { name: 'Chemistry', grade: null },
    { name: 'Computer Studies', grade: null },
    { name: 'Agriculture', grade: null },
    { name: 'Chichewa', grade: null },
    { name: 'Geography', grade: null },
    { name: 'History', grade: null },
    { name: 'Social & Life Skills', grade: null },
  ]);

  careers: CareerPath[] = [
    { 
      title: 'Medicine & Surgery (MBBS)', 
      institution: 'Kamuzu University of Health Sciences (KUHeS)', 
      pointsRange: '6 - 12 points', 
      requirements: 'Distinctions in English, Mathematics, Biology, Chemistry, and Physics.',
      icon: 'medical_services',
      color: 'bg-red-50 text-red-600 border-red-200'
    },
    { 
      title: 'Engineering (Civil, Mech, Elec)', 
      institution: 'Malawi University of Business and Applied Sciences (MUBAS)', 
      pointsRange: '6 - 15 points', 
      requirements: 'Strong credits/distinctions in Mathematics, Physics, and Chemistry. Credit in English.',
      icon: 'engineering',
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    },
    { 
      title: 'Agriculture & Natural Resources', 
      institution: 'Lilongwe University of Agriculture and Natural Resources (LUANAR)', 
      pointsRange: '10 - 20 points', 
      requirements: 'Credits in English, Mathematics, Biology, and Agriculture or Chemistry.',
      icon: 'agriculture',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    { 
      title: 'Education (Teaching)', 
      institution: 'Mzuzu University (MZUNI) / University of Malawi (UNIMA)', 
      pointsRange: '15 - 24 points', 
      requirements: 'Credits in English and the specific subjects you intend to teach.',
      icon: 'school',
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    { 
      title: 'Computer Science / IT', 
      institution: 'University of Malawi (UNIMA) / MUBAS / Mzuzu University (MZUNI)', 
      pointsRange: '9 - 16 points', 
      requirements: 'Strong credits in Mathematics, Physics, and Computer Studies. Credit in English.',
      icon: 'computer',
      color: 'bg-cyan-50 text-cyan-600 border-cyan-200'
    },
    { 
      title: 'Business & Economics', 
      institution: 'University of Malawi (UNIMA) / MUBAS', 
      pointsRange: '10 - 18 points', 
      requirements: 'Strong credit in Mathematics and English.',
      icon: 'trending_up',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
      title: 'Law (LLB)',
      institution: 'University of Malawi (UNIMA - Chancellor College)',
      pointsRange: '6 - 10 points',
      requirements: 'Distinctions in English, History, and Social & Life Skills. High overall points.',
      icon: 'gavel',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    }
  ];

  calculatedPoints = computed(() => {
    const subs = this.subjects().filter(s => s.grade !== null);
    const english = subs.find(s => s.name === 'English');
    
    // English is mandatory for MSCE passing and university entry
    if (!english || english.grade === null) return null;
    
    const others = subs.filter(s => s.name !== 'English').sort((a, b) => a.grade! - b.grade!);
    
    // Need English + 5 best other subjects
    if (others.length < 5) return null;
    
    const best5 = others.slice(0, 5);
    const total = english.grade + best5.reduce((sum, s) => sum + s.grade!, 0);
    
    return total;
  });

  updateGrade(index: number, grade: number | null) {
    this.subjects.update(subs => {
      const newSubs = [...subs];
      newSubs[index] = { ...newSubs[index], grade: grade ? Number(grade) : null };
      return newSubs;
    });
  }

  resetCalculator() {
    this.subjects.update(subs => subs.map(s => ({ ...s, grade: null })));
  }

  getQualificationMessage(points: number): string {
    if (points <= 12) return 'Excellent! You are highly competitive for top programs like Medicine and Engineering.';
    if (points <= 20) return 'Great! You qualify for most science, agriculture, and business degree programs.';
    if (points <= 36) return 'Good. You meet the minimum requirement for university entry. Consider education or humanities.';
    return 'You need 36 points or less (including English credit) to qualify for public university selection.';
  }

  goBack() {
    window.history.back();
  }
}
