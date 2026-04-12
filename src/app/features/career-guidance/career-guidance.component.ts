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
    <div class="flex flex-col h-full bg-slate-50 overflow-hidden relative">
      <!-- Header -->
      <div class="bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-6 shrink-0 relative z-10 shadow-md">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div class="flex items-center gap-3 relative z-10">
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
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
            <div class="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 class="text-sm font-black text-slate-900 flex items-center gap-2">
                <mat-icon class="text-rose-500 !w-4 !h-4 !text-[16px]">calculate</mat-icon>
                Points Calculator
              </h3>
            </div>
            
            <div class="p-4">
              <div class="grid grid-cols-2 gap-x-4 gap-y-3">
                @for (subject of subjects(); track subject.name; let i = $index) {
                  <div class="flex flex-col gap-1">
                    <label [for]="'grade-' + i" class="text-[10px] font-bold text-slate-600 flex items-center justify-between">
                      <span class="truncate pr-1">{{subject.name}}</span>
                      @if (subject.isMandatory) {
                        <span class="text-[8px] font-black uppercase tracking-widest text-rose-500 shrink-0">*Req</span>
                      }
                    </label>
                    <select 
                      [id]="'grade-' + i"
                      [ngModel]="subject.grade" 
                      (ngModelChange)="updateGrade(i, $event)"
                      class="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:border-rose-500 outline-none transition-all text-center font-bold text-xs text-slate-900 appearance-none">
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

              <button (click)="resetCalculator()" class="w-full mt-4 py-2 text-[11px] font-bold text-slate-500 hover:text-rose-600 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center gap-1">
                <mat-icon class="!w-3 !h-3 !text-[12px]">refresh</mat-icon>
                Reset
              </button>
            </div>

            <!-- Results Panel -->
            <div class="p-4 bg-rose-50 border-t border-rose-100">
              <div class="flex items-center justify-between mb-1">
                <span class="text-rose-900 font-black text-xs">Total Points (Best 6):</span>
                <div class="text-xl font-black text-rose-600">
                  @if (calculatedPoints() !== null) {
                    {{calculatedPoints()}}
                  } @else {
                    <span class="text-rose-300">--</span>
                  }
                </div>
              </div>
              @if (calculatedPoints() === null) {
                <p class="text-[10px] text-rose-500 font-bold">Enter English + 5 subjects.</p>
              } @else {
                <p class="text-[10px] text-rose-800 font-bold leading-tight">
                  {{getQualificationMessage(calculatedPoints()!)}}
                </p>
              }
            </div>
          </div>

          <!-- Career Paths -->
          <div class="flex items-center justify-between mt-4">
            <h3 class="text-base font-black text-slate-900">University Programs</h3>
          </div>
          
          <div class="flex flex-col gap-4">
            @for (career of careers; track career.title) {
              <div class="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md border border-slate-200/80 flex gap-4 items-start relative overflow-hidden group transition-all">
                <div class="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm relative z-10 group-hover:scale-105 transition-transform" [class]="career.color">
                  <mat-icon class="!w-7 !h-7 !text-[28px]">{{career.icon}}</mat-icon>
                </div>
                <div class="flex-1 min-w-0 relative z-10">
                  <h4 class="text-sm font-black text-slate-900 truncate">{{career.title}}</h4>
                  <p class="text-xs font-bold text-rose-500 mb-1.5 truncate">{{career.institution}}</p>
                  <div class="flex items-center gap-2 mb-1.5">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Points:</span>
                    <span class="text-[10px] font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">{{career.pointsRange}}</span>
                  </div>
                  <p class="text-xs font-medium text-slate-600 leading-tight line-clamp-2">{{career.requirements}}</p>
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
    { name: 'Physical Science', grade: null },
    { name: 'Agriculture', grade: null },
    { name: 'Chichewa', grade: null },
    { name: 'Geography', grade: null },
    { name: 'History', grade: null },
    { name: 'Social & Life Skills', grade: null },
  ]);

  careers: CareerPath[] = [
    { 
      title: 'Medicine & Surgery (MBBS)', 
      institution: 'KUHeS (formerly UNIMA CoM)', 
      pointsRange: '6 - 12 points', 
      requirements: 'Distinctions in English, Mathematics, Biology, and Physical Science.',
      icon: 'medical_services',
      color: 'bg-red-50 text-red-600 border-red-200'
    },
    { 
      title: 'Engineering (Civil, Mech, Elec)', 
      institution: 'MUBAS (formerly Poly)', 
      pointsRange: '6 - 15 points', 
      requirements: 'Strong credits/distinctions in Mathematics and Physical Science. Credit in English.',
      icon: 'engineering',
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    },
    { 
      title: 'Agriculture & Natural Resources', 
      institution: 'LUANAR (Bunda Campus)', 
      pointsRange: '10 - 20 points', 
      requirements: 'Credits in English, Mathematics, Biology, and Agriculture/Physical Science.',
      icon: 'agriculture',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    { 
      title: 'Education (Teaching)', 
      institution: 'MZUNI / UNIMA', 
      pointsRange: '15 - 24 points', 
      requirements: 'Credits in English and the specific subjects you intend to teach.',
      icon: 'school',
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    { 
      title: 'Computer Science / IT', 
      institution: 'UNIMA / MUBAS / MZUNI', 
      pointsRange: '9 - 16 points', 
      requirements: 'Strong credits in Mathematics and Physical Science. Credit in English.',
      icon: 'computer',
      color: 'bg-cyan-50 text-cyan-600 border-cyan-200'
    },
    { 
      title: 'Business & Economics', 
      institution: 'MUBAS / UNIMA', 
      pointsRange: '10 - 18 points', 
      requirements: 'Strong credit in Mathematics and English.',
      icon: 'trending_up',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
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
}
