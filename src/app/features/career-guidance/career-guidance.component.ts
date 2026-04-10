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
    <div class="flex flex-col h-full bg-slate-50 overflow-y-auto">
      <header class="px-6 py-8 bg-emerald-600 text-white border-b-[6px] border-emerald-800">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-3xl font-black flex items-center gap-3 tracking-tight">
            <mat-icon class="!w-8 !h-8 !text-[32px]">explore</mat-icon>
            University & Career Guidance
          </h2>
          <p class="text-emerald-100 mt-2 text-lg max-w-2xl font-bold">
            Plan your future. Calculate your MSCE points and discover the university programs you qualify for.
          </p>
        </div>
      </header>

      <div class="flex-1 p-6">
        <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <!-- Left Column: MSCE Calculator -->
          <div class="lg:col-span-5 space-y-6">
            <div class="bg-white rounded-[2rem] border-2 border-slate-200 border-b-[6px] overflow-hidden">
              <div class="p-6 border-b-2 border-slate-100 bg-slate-50">
                <h3 class="text-xl font-black text-slate-900 flex items-center gap-2">
                  <mat-icon class="text-emerald-500">calculate</mat-icon>
                  MSCE Points Calculator
                </h3>
                <p class="text-sm text-slate-500 font-bold mt-1">Enter your expected or actual grades (1-9). Best 6 subjects including English will be calculated.</p>
              </div>
              
              <div class="p-6 space-y-4">
                @for (subject of subjects(); track subject.name; let i = $index) {
                  <div class="flex items-center justify-between gap-4">
                    <label [for]="'grade-' + i" class="text-sm font-black text-slate-700 flex-1 flex items-center gap-2">
                      {{subject.name}}
                      @if (subject.isMandatory) {
                        <span class="text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-600 px-2 py-0.5 rounded-lg border-2 border-red-200">Required</span>
                      }
                    </label>
                    <select 
                      [id]="'grade-' + i"
                      [ngModel]="subject.grade" 
                      (ngModelChange)="updateGrade(i, $event)"
                      class="w-24 p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-0 focus:border-emerald-500 outline-none transition-all text-center font-black text-slate-900 appearance-none cursor-pointer">
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

                <button (click)="resetCalculator()" class="w-full mt-4 py-3 text-sm font-black text-slate-500 hover:text-slate-700 transition-colors bg-slate-100 rounded-xl border-2 border-slate-200 hover:bg-slate-200">
                  Reset Grades
                </button>
              </div>

              <!-- Results Panel -->
              <div class="p-6 bg-emerald-50 border-t-2 border-emerald-100">
                <div class="flex items-center justify-between">
                  <span class="text-emerald-900 font-black">Total Points (Best 6):</span>
                  <div class="text-3xl font-black text-emerald-700">
                    @if (calculatedPoints() !== null) {
                      {{calculatedPoints()}}
                    } @else {
                      <span class="text-lg text-emerald-400 font-bold">Incomplete</span>
                    }
                  </div>
                </div>
                @if (calculatedPoints() === null) {
                  <p class="text-xs text-emerald-600 font-bold mt-2">You must enter a grade for English and at least 5 other subjects.</p>
                } @else {
                  <p class="text-sm text-emerald-800 mt-2 font-black">
                    {{getQualificationMessage(calculatedPoints()!)}}
                  </p>
                }
              </div>
            </div>
          </div>

          <!-- Right Column: Career Paths -->
          <div class="lg:col-span-7 space-y-6">
            <div class="flex items-center justify-between">
              <h3 class="text-2xl font-black text-slate-900">University Programs</h3>
              <span class="text-sm font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-xl border-2 border-slate-200">Public Universities</span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (career of careers; track career.title) {
                <div class="bg-white p-6 rounded-[2rem] border-2 border-slate-200 border-b-[6px] hover:-translate-y-1 transition-transform duration-200 group">
                  <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border-2 border-b-[4px] transition-transform group-hover:scale-110" [class]="career.color">
                    <mat-icon>{{career.icon}}</mat-icon>
                  </div>
                  <h4 class="text-lg font-black text-slate-900 mb-1">{{career.title}}</h4>
                  <p class="text-sm font-bold text-emerald-600 mb-3">{{career.institution}}</p>
                  
                  <div class="space-y-3">
                    <div>
                      <span class="text-xs font-black text-slate-400 uppercase tracking-wider">Target Points</span>
                      <p class="text-sm font-bold text-slate-900 bg-slate-50 inline-block px-2 py-1 rounded-lg border-2 border-slate-200 mt-1">{{career.pointsRange}}</p>
                    </div>
                    <div>
                      <span class="text-xs font-black text-slate-400 uppercase tracking-wider">Key Requirements</span>
                      <p class="text-sm font-bold text-slate-600 mt-1 leading-relaxed">{{career.requirements}}</p>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Info Banner -->
            <div class="bg-amber-50 border-2 border-amber-200 border-b-[4px] rounded-[2rem] p-5 flex gap-4 mt-6">
              <mat-icon class="text-amber-500 flex-shrink-0">info</mat-icon>
              <div>
                <h5 class="text-sm font-black text-amber-900">Important Note on Selection</h5>
                <p class="text-sm font-bold text-amber-800 mt-1">University selection in Malawi is highly competitive. Meeting the minimum points does not guarantee admission. Always aim for the lowest points possible (Distinctions) in your core subjects.</p>
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
