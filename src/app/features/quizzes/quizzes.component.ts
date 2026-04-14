import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { DataService, Quiz, QuizResult } from '../../core/services/data.service';
import { AuthService } from '../../core/services/auth.service';
import { GeminiService, GeneratedQuiz } from '../../core/services/gemini.service';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Timestamp } from 'firebase/firestore';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-quizzes',
  standalone: true,
  imports: [MatIconModule, DatePipe, CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col h-full bg-slate-50 relative">
      <!-- Premium Header -->
      <div class="absolute top-0 left-0 right-0 h-56 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-b-[2.5rem] shadow-md z-0">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 rounded-b-[2.5rem]"></div>
      </div>

      <div class="relative z-10 p-6 md:p-8 flex-1 overflow-y-auto">
        <div class="max-w-5xl mx-auto">
          
          <div class="flex items-center justify-between mb-10 mt-2">
            <div class="flex items-center gap-4">
              <a routerLink="/dashboard" class="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white active:scale-90 transition-all backdrop-blur-md">
                <mat-icon class="text-[22px]">arrow_back</mat-icon>
              </a>
              <div class="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg">
                <mat-icon class="!w-8 !h-8 !text-[32px]">quiz</mat-icon>
              </div>
              <div>
                <h1 class="text-3xl font-black text-white tracking-tight">Quizzes</h1>
                <p class="text-emerald-100 font-medium text-sm mt-1">Test your knowledge</p>
              </div>
            </div>
            
            @if (view() === 'list') {
              <button (click)="showAiGenerator.set(true)" class="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg">
                <mat-icon class="!w-5 !h-5 !text-[20px]">auto_awesome</mat-icon>
                AI Generate
              </button>
            }
          </div>

          <!-- AI Generator Modal -->
          @if (showAiGenerator()) {
            <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 animate-in zoom-in duration-300">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-xl font-black text-slate-900 flex items-center gap-2">
                    <mat-icon class="text-indigo-600">auto_awesome</mat-icon>
                    AI Quiz Generator
                  </h3>
                  <button (click)="showAiGenerator.set(false)" class="text-slate-400 hover:text-slate-600">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
                
                <p class="text-sm text-slate-500 font-medium mb-6">Enter a topic from the MSCE curriculum and Cleo will generate a custom quiz for you.</p>
                
                <div class="space-y-4">
                  <div>
                    <label for="quizTopic" class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Quiz Topic</label>
                    <input 
                      id="quizTopic"
                      [ngModel]="quizTopic()"
                      (ngModelChange)="quizTopic.set($event)"
                      type="text" 
                      placeholder="e.g. Photosynthesis, Ohm's Law..."
                      class="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                    >
                  </div>
                  
                  <button 
                    (click)="generateAiQuiz()"
                    [disabled]="!quizTopic().trim() || isGenerating()"
                    class="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-indigo-600 disabled:opacity-50 transition-all flex items-center justify-center gap-3">
                    @if (isGenerating()) {
                      <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Generating...
                    } @else {
                      <mat-icon>auto_awesome</mat-icon>
                      Generate Quiz
                    }
                  </button>
                </div>
              </div>
            </div>
          }
          
          <!-- Quiz List View -->
          @if (view() === 'list') {
            <div class="flex flex-col gap-4 max-w-2xl mx-auto">
              @for (quiz of dataService.quizzes(); track quiz.id) {
                <div class="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md border border-slate-200/80 flex items-center gap-4 active:scale-[0.98] transition-all relative overflow-hidden group">
                  <div class="absolute inset-0 bg-gradient-to-br from-transparent to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <!-- Icon -->
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30 relative z-10">
                    <mat-icon class="!w-7 !h-7 !text-[28px]">quiz</mat-icon>
                  </div>
                  
                  <!-- Content -->
                  <div class="flex-1 min-w-0 relative z-10">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        {{quiz.category}}
                      </span>
                      @if (quiz.isProOnly) {
                        <span class="text-[10px] font-black text-white uppercase tracking-widest bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 rounded-md shadow-sm flex items-center gap-0.5">
                          <mat-icon class="!w-3 !h-3 !text-[12px]">workspace_premium</mat-icon> PRO
                        </span>
                      }
                    </div>
                    <h3 class="font-bold text-base text-slate-900 truncate">{{quiz.title}}</h3>
                    <div class="flex items-center gap-3 mt-1">
                      <span class="text-slate-500 text-xs flex items-center gap-1">
                        <mat-icon class="!w-3.5 !h-3.5 !text-[14px]">help_outline</mat-icon>
                        {{quiz.questions.length}} Qs
                      </span>
                      <span class="text-slate-500 text-xs flex items-center gap-1">
                        <mat-icon class="!w-3.5 !h-3.5 !text-[14px]">schedule</mat-icon>
                        {{quiz.timeLimit}}m
                      </span>
                    </div>
                  </div>
                  
                  <!-- Action Button -->
                  <div class="shrink-0 relative z-10">
                    @if (quiz.isProOnly && !authService.currentUser()?.isPro && authService.currentUser()?.role !== 'admin') {
                      <button class="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
                        <mat-icon class="!w-5 !h-5 !text-[20px]">lock</mat-icon>
                      </button>
                    } @else {
                      <button (click)="startQuiz(quiz)" class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
                        <mat-icon class="!w-5 !h-5 !text-[20px]">play_arrow</mat-icon>
                      </button>
                    }
                  </div>
                </div>
              } @empty {
                <div class="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                  <div class="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <mat-icon class="!w-7 !h-7 !text-[28px] text-slate-300">quiz</mat-icon>
                  </div>
                  <h3 class="text-base font-black text-slate-900 mb-1">No Quizzes Yet</h3>
                  <p class="text-slate-500 font-medium text-xs">Check back later for assessments.</p>
                </div>
              }
            </div>

            <!-- Past Results Section -->
            @if (userResults().length > 0) {
              <div class="mt-12">
                <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <mat-icon class="text-indigo-500">history</mat-icon>
                  Your Recent Results
                </h3>
                <div class="space-y-3">
                  @for (result of userResults(); track result.id) {
                    <div class="card-modern p-4 flex items-center justify-between">
                      <div>
                        <h4 class="font-bold text-slate-800">{{result.quizTitle}}</h4>
                        <p class="text-xs text-slate-500 font-medium">{{getQuizDate(result.completedAt) | date:'medium'}}</p>
                      </div>
                      <div class="text-right">
                        <div class="text-lg font-bold" [class.text-emerald-600]="(result.score / result.total) >= 0.5" [class.text-rose-600]="(result.score / result.total) < 0.5">
                          {{result.score}} / {{result.total}}
                        </div>
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ ((result.score / result.total) * 100).toFixed(0) }}% Score</p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          }

          <!-- Taking Quiz View -->
          @if (view() === 'taking' && activeQuiz()) {
            <div class="max-w-3xl mx-auto">
              <!-- Quiz Progress Header -->
              <div class="card-modern p-4 mb-6 flex items-center justify-between sticky top-20 z-10">
                <div class="flex items-center gap-4">
                  <button (click)="view.set('list')" class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <mat-icon class="text-[18px]">close</mat-icon>
                  </button>
                  <div>
                    <h3 class="font-bold text-slate-900 truncate max-w-[200px]">{{activeQuiz()?.title}}</h3>
                    <p class="text-[10px] font-bold text-indigo-600 uppercase">Question {{currentQuestionIndex() + 1}} of {{activeQuiz()?.questions?.length}}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-xl border border-rose-100">
                  <mat-icon class="text-[18px]">timer</mat-icon>
                  <span class="font-mono font-bold">{{timeLeftFormatted()}}</span>
                </div>
              </div>

              <!-- Question Card -->
              <div class="card-modern p-6 md:p-8 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h4 class="text-lg md:text-xl font-bold text-slate-900 mb-8 leading-relaxed">
                  {{activeQuiz()?.questions?.[currentQuestionIndex()]?.text}}
                </h4>

                <div class="space-y-3">
                  @if (activeQuiz()?.questions?.[currentQuestionIndex()]?.type === 'multiple-choice') {
                    @for (option of activeQuiz()?.questions?.[currentQuestionIndex()]?.options; track option; let i = $index) {
                      <button 
                        (click)="selectAnswer(option)"
                        [disabled]="isAnswered()"
                        [class.bg-emerald-500]="isAnswered() && option === activeQuiz()?.questions?.[currentQuestionIndex()]?.correctAnswer"
                        [class.bg-rose-500]="isAnswered() && selectedAnswer() === option && option !== activeQuiz()?.questions?.[currentQuestionIndex()]?.correctAnswer"
                        [class.bg-indigo-600]="!isAnswered() && selectedAnswer() === option"
                        [class.text-white]="selectedAnswer() === option"
                        [class.border-emerald-500]="isAnswered() && option === activeQuiz()?.questions?.[currentQuestionIndex()]?.correctAnswer"
                        [class.border-rose-500]="isAnswered() && selectedAnswer() === option && option !== activeQuiz()?.questions?.[currentQuestionIndex()]?.correctAnswer"
                        [class.border-indigo-600]="!isAnswered() && selectedAnswer() === option"
                        [class.bg-white]="selectedAnswer() !== option"
                        [class.text-slate-700]="selectedAnswer() !== option"
                        [class.border-slate-200]="selectedAnswer() !== option"
                        class="w-full p-4 text-left rounded-2xl border-2 font-semibold transition-all hover:border-indigo-400 flex items-center gap-4 group">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-colors"
                             [class.bg-emerald-500]="isAnswered() && option === activeQuiz()?.questions?.[currentQuestionIndex()]?.correctAnswer"
                             [class.text-white]="isAnswered() && option === activeQuiz()?.questions?.[currentQuestionIndex()]?.correctAnswer"
                             [class.border-emerald-400]="isAnswered() && option === activeQuiz()?.questions?.[currentQuestionIndex()]?.correctAnswer"
                             [class.bg-indigo-500]="!isAnswered() && selectedAnswer() === option"
                             [class.text-white]="!isAnswered() && selectedAnswer() === option"
                             [class.border-indigo-400]="!isAnswered() && selectedAnswer() === option"
                             [class.bg-slate-50]="selectedAnswer() !== option"
                             [class.text-slate-500]="selectedAnswer() !== option"
                             [class.border-slate-200]="selectedAnswer() !== option">
                          {{String.fromCharCode(65 + i)}}
                        </div>
                        {{option}}
                      </button>
                    }
                  } @else {
                    <div class="grid grid-cols-2 gap-4">
                      <button 
                        (click)="selectAnswer('True')"
                        [disabled]="isAnswered()"
                        [class.bg-emerald-500]="isAnswered() && 'True' === activeQuiz()?.questions?.[currentQuestionIndex()]?.correctAnswer"
                        [class.bg-rose-500]="isAnswered() && selectedAnswer() === 'True' && 'True' !== activeQuiz()?.questions?.[currentQuestionIndex()]?.correctAnswer"
                        [class.bg-indigo-600]="!isAnswered() && selectedAnswer() === 'True'"
                        [class.text-white]="selectedAnswer() === 'True'"
                        [class.border-emerald-500]="isAnswered() && 'True' === activeQuiz()?.questions?.[currentQuestionIndex()]?.correctAnswer"
                        [class.border-rose-500]="isAnswered() && selectedAnswer() === 'True' && 'True' !== activeQuiz()?.questions?.[currentQuestionIndex()]?.correctAnswer"
                        [class.border-indigo-600]="!isAnswered() && selectedAnswer() === 'True'"
                        class="p-6 text-center rounded-2xl border-2 font-bold transition-all hover:border-indigo-400 bg-white text-slate-700 border-slate-200">
                        True
                      </button>
                      <button 
                        (click)="selectAnswer('False')"
                        [disabled]="isAnswered()"
                        [class.bg-emerald-500]="isAnswered() && 'False' === activeQuiz()?.questions?.[currentQuestionIndex()]?.correctAnswer"
                        [class.bg-rose-500]="isAnswered() && selectedAnswer() === 'False' && 'False' !== activeQuiz()?.questions?.[currentQuestionIndex()]?.correctAnswer"
                        [class.bg-indigo-600]="!isAnswered() && selectedAnswer() === 'False'"
                        [class.text-white]="selectedAnswer() === 'False'"
                        [class.border-emerald-500]="isAnswered() && 'False' === activeQuiz()?.questions?.[currentQuestionIndex()]?.correctAnswer"
                        [class.border-rose-500]="isAnswered() && selectedAnswer() === 'False' && 'False' !== activeQuiz()?.questions?.[currentQuestionIndex()]?.correctAnswer"
                        [class.border-indigo-600]="!isAnswered() && selectedAnswer() === 'False'"
                        class="p-6 text-center rounded-2xl border-2 font-bold transition-all hover:border-indigo-400 bg-white text-slate-700 border-slate-200">
                        False
                      </button>
                    </div>
                  }
                </div>
              </div>

              <!-- Navigation -->
              <div class="flex items-center justify-between">
                <button 
                  (click)="prevQuestion()"
                  [disabled]="currentQuestionIndex() === 0"
                  class="btn-secondary px-6 py-3 disabled:opacity-0">
                  Previous
                </button>
                
                @if (currentQuestionIndex() < (activeQuiz()?.questions?.length ?? 0) - 1) {
                  <button 
                    (click)="nextQuestion()"
                    [disabled]="!selectedAnswer()"
                    class="btn-primary px-8 py-3">
                    Next Question
                  </button>
                } @else {
                  <button 
                    (click)="finishQuiz()"
                    [disabled]="!selectedAnswer()"
                    class="btn-accent px-8 py-3">
                    Submit Quiz
                  </button>
                }
              </div>
            </div>
          }

          <!-- Result View -->
          @if (view() === 'result' && lastResult()) {
            <div class="max-w-2xl mx-auto text-center py-8 animate-in zoom-in duration-500">
              <div class="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-xl">
                <mat-icon class="text-indigo-600 !w-12 !h-12 !text-[48px]">emoji_events</mat-icon>
              </div>
              
              <h3 class="text-3xl font-bold text-slate-900 mb-2">Quiz Completed!</h3>
              <p class="text-slate-500 font-medium mb-8">Great job finishing the assessment.</p>
              
              <div class="card-modern p-8 mb-8">
                <div class="text-5xl font-black text-indigo-600 mb-2">
                  {{lastResult()?.score}} / {{lastResult()?.total}}
                </div>
                <p class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Final Score</p>
                
                <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden mb-8">
                  <div class="h-full bg-indigo-500 transition-all duration-1000" [style.width.%]="(lastResult()!.score / lastResult()!.total) * 100"></div>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                  <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Accuracy</p>
                    <p class="text-xl font-bold text-slate-800">{{ ((lastResult()!.score / lastResult()!.total) * 100).toFixed(0) }}%</p>
                  </div>
                  <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                    <p class="text-xl font-bold" [class.text-emerald-600]="(lastResult()!.score / lastResult()!.total) >= 0.5" [class.text-rose-600]="(lastResult()!.score / lastResult()!.total) < 0.5">
                      {{ (lastResult()!.score / lastResult()!.total) >= 0.5 ? 'Passed' : 'Failed' }}
                    </p>
                  </div>
                </div>
              </div>
              
              <div class="flex flex-col sm:flex-row gap-3 justify-center">
                <button (click)="view.set('list')" class="btn-primary px-8 py-3.5">
                  Back to Quizzes
                </button>
                <button (click)="startQuiz(activeQuiz()!)" class="btn-secondary px-8 py-3.5">
                  Try Again
                </button>
              </div>
            </div>
          }

        </div>
      </div>
    </div>
  `
})
export class QuizzesComponent implements OnInit, OnDestroy {
  dataService = inject(DataService);
  authService = inject(AuthService);
  gemini = inject(GeminiService);
  String = String;

  view = signal<'list' | 'taking' | 'result'>('list');
  activeQuiz = signal<Quiz | null>(null);
  currentQuestionIndex = signal(0);
  userAnswers = signal<Record<number, string>>({});
  isAnswered = signal(false);
  isCorrect = signal(false);
  selectedAnswer = computed(() => this.userAnswers()[this.currentQuestionIndex()]);
  
  timeLeft = signal(0);
  timerInterval: ReturnType<typeof setInterval> | undefined;
  
  lastResult = signal<QuizResult | null>(null);

  // AI Generator state
  showAiGenerator = signal(false);
  quizTopic = signal('');
  isGenerating = signal(false);

  userResults = computed(() => {
    const userId = this.authService.currentUser()?.uid;
    return this.dataService.quizResults().filter(r => r.userId === userId);
  });

  timeLeftFormatted = computed(() => {
    const minutes = Math.floor(this.timeLeft() / 60);
    const seconds = this.timeLeft() % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });

  ngOnInit() {
    this.dataService.subscribeToQuizzes();
    const user = this.authService.currentUser();
    if (user) {
      this.dataService.subscribeToQuizResults(user.uid);
    }
  }

  ngOnDestroy() {
    this.dataService.unsubscribeFromQuizzes();
    this.dataService.unsubscribeFromQuizResults();
    this.stopTimer();
  }

  getQuizDate(createdAt: Date | Timestamp | string | null): Date | null {
    if (!createdAt) return null;
    if (createdAt instanceof Timestamp) return createdAt.toDate();
    if (createdAt instanceof Date) return createdAt;
    return new Date(createdAt);
  }

  startQuiz(quiz: Quiz) {
    this.activeQuiz.set(quiz);
    this.currentQuestionIndex.set(0);
    this.userAnswers.set({});
    this.view.set('taking');
    this.timeLeft.set(quiz.timeLimit * 60);
    this.startTimer();
  }

  startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.timeLeft.update(t => {
        if (t <= 1) {
          this.finishQuiz();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  selectAnswer(answer: string) {
    if (this.isAnswered()) return;
    
    this.userAnswers.update(answers => ({
      ...answers,
      [this.currentQuestionIndex()]: answer
    }));
    
    const quiz = this.activeQuiz();
    if (quiz) {
      const correct = quiz.questions[this.currentQuestionIndex()].correctAnswer;
      this.isCorrect.set(answer === correct);
      this.isAnswered.set(true);
    }
  }

  nextQuestion() {
    if (this.currentQuestionIndex() < (this.activeQuiz()?.questions?.length ?? 0) - 1) {
      this.currentQuestionIndex.update(i => i + 1);
      this.isAnswered.set(false);
      this.isCorrect.set(false);
    }
  }

  prevQuestion() {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.update(i => i - 1);
      this.isAnswered.set(false);
      this.isCorrect.set(false);
    }
  }

  async finishQuiz() {
    this.stopTimer();
    const quiz = this.activeQuiz();
    const user = this.authService.currentUser();
    if (!quiz || !user) return;

    let score = 0;
    quiz.questions.forEach((q, index) => {
      if (this.userAnswers()[index] === q.correctAnswer) {
        score++;
      }
    });

    // Check if first attempt
    const isFirstAttempt = !this.userResults().some(r => r.quizId === quiz.id);
    
    const result: Omit<QuizResult, 'id' | 'completedAt'> = {
      userId: user.uid,
      quizId: quiz.id,
      quizTitle: quiz.title,
      score,
      total: quiz.questions.length,
      isFirstAttempt
    };

    await this.dataService.saveQuizResult(result);

    // Award points if first attempt and all correct
    if (isFirstAttempt && score === quiz.questions.length) {
      const newCoins = (user.coins || 0) + 5;
      const newStreak = (user.streak || 0) + 1;
      await this.dataService.updateUserProfile(user.uid, { coins: newCoins, streak: newStreak });
      this.authService.currentUser.set({ ...user, coins: newCoins, streak: newStreak });
    }
    
    // We don't get the ID back immediately from saveQuizResult, so we'll just set a local lastResult
    this.lastResult.set({
      ...result,
      id: 'temp',
      completedAt: new Date()
    } as QuizResult);
    
    this.view.set('result');
  }

  async generateAiQuiz() {
    if (!this.quizTopic().trim()) return;
    
    this.isGenerating.set(true);
    try {
      const generatedQuiz: GeneratedQuiz = await this.gemini.generateQuiz(this.quizTopic());
      // Store the generated quiz
      const user = this.authService.currentUser();
      await this.dataService.createQuiz({
        title: generatedQuiz.title,
        description: generatedQuiz.description,
        category: generatedQuiz.category,
        authorId: user?.uid || 'system',
        timeLimit: generatedQuiz.timeLimit,
        isProOnly: generatedQuiz.isProOnly,
        questions: generatedQuiz.questions
      });
      
      this.showAiGenerator.set(false);
      this.quizTopic.set('');
    } catch (error) {
      console.error('Failed to generate AI quiz:', error);
      alert('Failed to generate quiz. Please try again with a different topic.');
    } finally {
      this.isGenerating.set(false);
    }
  }
}
