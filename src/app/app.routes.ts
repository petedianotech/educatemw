import {Routes} from '@angular/router';
import {authGuard} from './core/guards/auth.guard';
import {adminGuard} from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'chat',
    loadComponent: () => import('./features/chat/chat.component').then(m => m.ChatComponent),
    canActivate: [authGuard]
  },
  {
    path: 'video-lessons',
    loadComponent: () => import('./features/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
    canActivate: [authGuard]
  },
  {
    path: 'study-plan',
    loadComponent: () => import('./features/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
    canActivate: [authGuard]
  },
  {
    path: 'resources',
    loadComponent: () => import('./features/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
    canActivate: [authGuard]
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('./features/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
    canActivate: [authGuard]
  },
  {
    path: 'exam-countdown',
    loadComponent: () => import('./features/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
    canActivate: [authGuard]
  },
  {
    path: 'premium-students',
    loadComponent: () => import('./features/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
    canActivate: [authGuard]
  },
  {
    path: 'timetable',
    loadComponent: () => import('./features/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
    canActivate: [authGuard]
  },
  {
    path: 'notes',
    loadComponent: () => import('./features/notes/notes.component').then(m => m.NotesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'quizzes',
    loadComponent: () => import('./features/quizzes/quizzes.component').then(m => m.QuizzesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'flashcards',
    loadComponent: () => import('./features/flashcards/flashcards.component').then(m => m.FlashcardsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'community',
    loadComponent: () => import('./features/community/community.component').then(m => m.CommunityComponent),
    canActivate: [authGuard]
  },
  {
    path: 'career-guidance',
    loadComponent: () => import('./features/career-guidance/career-guidance.component').then(m => m.CareerGuidanceComponent),
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'upgrade',
    loadComponent: () => import('./features/upgrade/upgrade.component').then(m => m.UpgradeComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
