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
    <div class="flex flex-col h-full bg-slate-50 relative">
      <!-- Premium Header -->
      <div class="absolute top-0 left-0 right-0 h-56 bg-gradient-to-r from-rose-600 to-pink-600 rounded-b-[2.5rem] shadow-md z-0">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 rounded-b-[2.5rem]"></div>
      </div>

      <div class="relative z-10 p-6 md:p-8 flex-1 overflow-y-auto">
        <div class="max-w-6xl mx-auto">
          
          <div class="flex items-center gap-4 mb-10 mt-2">
            <div class="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg">
              <mat-icon class="!w-8 !h-8 !text-[32px]">explore</mat-icon>
            </div>
            <div>
              <h1 class="text-3xl font-black text-white tracking-tight">Career Guidance</h1>
              <p class="text-rose-100 font-medium text-sm mt-1">Calculate points & discover programs</p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <!-- Left Column: MSCE Calculator -->
            <div class="lg:col-span-5 space-y-6">
              <div class="bg-white rounded-[2rem] shadow-xl shadow-rose-500/5 border border-slate-200 overflow-hidden relative">
                <div class="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                
                <div class="p-6 md:p-8 border-b border-slate-100 relative z-10">
                  <h3 class="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
                    <mat-icon class="text-rose-500">calculate</mat-icon>
                    Points Calculator
                  </h3>
                  <p class="text-sm text-slate-500 font-medium mt-2 leading-relaxed">Enter your expected or actual grades (1-9). Best 6 subjects including English will be calculated.</p>
                </div>
                
                <div class="p-6 md:p-8 space-y-4 relative z-10">
                  @for (subject of subjects(); track subject.name; let i = $index) {
                    <div class="flex items-center justify-between gap-4 group">
                      <label [for]="'grade-' + i" class="text-sm font-bold text-slate-700 flex-1 flex items-center gap-2 group-hover:text-rose-600 transition-colors">
                        {{subject.name}}
                        @if (subject.isMandatory) {
                          <span class="text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 px-2 py-1 rounded-lg border border-rose-100">Required</span>
                        }
                      </label>
                      <select 
                        [id]="'grade-' + i"
                        [ngModel]="subject.grade" 
                        (ngModelChange)="updateGrade(i, $event)"
                        class="w-24 p-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-0 focus:border-rose-500 outline-none transition-all text-center font-black text-slate-900 appearance-none cursor-pointer shadow-sm hover:border-rose-200">
                        <option [ngValue]="null">-</option>
                        <option [ngValue]="1">1 (Dist)</option>
                        <option [ngValue]="2">2 (Dist)</option>
                        <option [ngValue]="3">3 (Cred)</option>
                        <option [ngValue]="4">4 (Cred)</option>
                        <option [ngValue]="5">5 (Cred)</option>
                        <option [ngValue]="6">6 (Cred)</option>
                        <option [ngValue]="7">7 (Pass)</option>
                        <option [ngValue]="8">8 (Pass)</option>
                        <option [ngValue]="9">9 (Fail)</option>
                      </select>
                    </div>
                  }

                  <button (click)="resetCalculator()" class="w-full mt-6 py-3.5 text-sm font-bold text-slate-500 hover:text-rose-600 transition-colors bg-slate-50 rounded-xl border-2 border-slate-100 hover:border-rose-200 hover:bg-rose-50 shadow-sm flex items-center justify-center gap-2">
                    <mat-icon class="!w-4 !h-4 !text-[16px]">refresh</mat-icon>
                    Reset Grades
                  </button>
                </div>

                <!-- Results Panel -->
                <div class="p-6 md:p-8 bg-gradient-to-br from-rose-50 to-pink-50 border-t border-rose-100 relative z-10">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-rose-900 font-black tracking-tight">Total Points (Best 6):</span>
                    <div class="text-4xl font-black text-rose-600 drop-shadow-sm">
                      @if (calculatedPoints() !== null) {
                        {{calculatedPoints()}}
                      } @else {
                        <span class="text-xl text-rose-300 font-bold">--</span>
                      }
                    </div>
                  </div>
                  @if (calculatedPoints() === null) {
                    <p class="text-xs text-rose-500 font-bold mt-2 bg-white/60 p-3 rounded-xl border border-rose-100/50">You must enter a grade for English and at least 5 other subjects.</p>
                  } @else {
                    <p class="text-sm text-rose-800 mt-2 font-bold bg-white/60 p-3 rounded-xl border border-rose-100/50 leading-relaxed">
                      {{getQualificationMessage(calculatedPoints()!)}}
                    </p>
                  }
                </div>
              </div>
            </div>

            <!-- Right Column: Career Paths -->
            <div class="lg:col-span-7 space-y-6">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-2xl font-black text-slate-900 tracking-tight">University Programs</h3>
                <span class="text-[10px] font-black text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm uppercase tracking-widest">Public Universities</span>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                @for (career of careers; track career.title) {
                  <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-rose-50 transition-colors"></div>
                    
                    <div class="relative z-10">
                      <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3" [class]="career.color">
                        <mat-icon class="!w-7 !h-7 !text-[28px]">{{career.icon}}</mat-icon>
                      </div>
                      <h4 class="text-lg font-black text-slate-900 mb-1 tracking-tight">{{career.title}}</h4>
                      <p class="text-sm font-bold text-rose-500 mb-5">{{career.institution}}</p>
                      
                      <div class="space-y-4">
                        <div>
                          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Target Points</span>
                          <span class="text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">{{career.pointsRange}}</span>
                        </div>
                        <div>
                          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Key Requirements</span>
                          <p class="text-sm font-medium text-slate-600 leading-relaxed">{{career.requirements}}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Info Banner -->
              <div class="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-[2rem] p-6 md:p-8 flex gap-5 mt-8 shadow-sm relative overflow-hidden">
                <div class="absolute right-0 top-0 w-32 h-32 bg-sky-200/30 rounded-full blur-3xl"></div>
                <div class="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-sky-200 relative z-10">
                  <mat-icon>info</mat-icon>
                </div>
                <div class="relative z-10">
                  <h5 class="text-base font-black text-sky-900 mb-1 tracking-tight">Important Note on Selection</h5>
                  <p class="text-sm font-medium text-sky-800 leading-relaxed">University selection in Malawi is highly competitive. Meeting the minimum points does not guarantee admission. Always aim for the lowest points possible (Distinctions) in your core subjects.</p>
                </div>
              </div>
            </div>

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
