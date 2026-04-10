import { Injectable, signal } from '@angular/core';
import { db } from '../../../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../../firebase';
import { UserProfile } from './auth.service';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  createdAt: Date | Timestamp;
  likesCount: number;
  commentsCount: number;
}

export interface Note {
  id: string;
  title: string;
  content?: string;
  category: string;
  isProOnly: boolean;
  createdAt: Date | Timestamp;
  driveUrl?: string;
  youtubeUrl?: string;
}

export interface QuizQuestion {
  text: string;
  type: 'multiple-choice' | 'true-false';
  options?: string[];
  correctAnswer: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  category: string;
  timeLimit: number;
  isProOnly: boolean;
  questions: QuizQuestion[];
  createdAt: Date | Timestamp;
}

export interface QuizResult {
  id: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  total: number;
  completedAt: Date | Timestamp;
}

export interface AppUpdate {
  id: string;
  title: string;
  content: string;
  type: 'feature' | 'maintenance' | 'announcement';
  createdAt: Date | Timestamp;
}

export interface RevenueRecord {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  plan: string;
  createdAt: Date | Timestamp;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  posts = signal<Post[]>([]);
  notes = signal<Note[]>([]);
  users = signal<UserProfile[]>([]);
  quizzes = signal<Quiz[]>([]);
  quizResults = signal<QuizResult[]>([]);
  appUpdates = signal<AppUpdate[]>([]);
  revenueRecords = signal<RevenueRecord[]>([]);
  
  private postsUnsubscribe: (() => void) | null = null;
  private notesUnsubscribe: (() => void) | null = null;
  private usersUnsubscribe: (() => void) | null = null;
  private quizzesUnsubscribe: (() => void) | null = null;
  private quizResultsUnsubscribe: (() => void) | null = null;
  private appUpdatesUnsubscribe: (() => void) | null = null;
  private revenueUnsubscribe: (() => void) | null = null;

  // --- Users ---
  subscribeToUsers() {
    if (this.usersUnsubscribe) return;
    
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    this.usersUnsubscribe = onSnapshot(q, (snapshot) => {
      const loadedUsers = snapshot.docs.map(doc => ({
        ...doc.data()
      } as UserProfile));
      this.users.set(loadedUsers);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });
  }

  unsubscribeFromUsers() {
    if (this.usersUnsubscribe) {
      this.usersUnsubscribe();
      this.usersUnsubscribe = null;
    }
  }

  async updateUserProStatus(userId: string, isPro: boolean) {
    try {
      await updateDoc(doc(db, 'users', userId), { isPro });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  }

  // --- Community Posts ---
  subscribeToPosts() {
    if (this.postsUnsubscribe) return;
    
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    this.postsUnsubscribe = onSnapshot(q, (snapshot) => {
      const loadedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));
      this.posts.set(loadedPosts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'posts');
    });
  }

  unsubscribeFromPosts() {
    if (this.postsUnsubscribe) {
      this.postsUnsubscribe();
      this.postsUnsubscribe = null;
    }
  }

  async createPost(authorId: string, authorName: string, authorPhoto: string, content: string) {
    try {
      await addDoc(collection(db, 'posts'), {
        authorId,
        authorName,
        authorPhoto,
        content,
        createdAt: serverTimestamp(),
        likesCount: 0,
        commentsCount: 0
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'posts');
    }
  }

  async deletePost(postId: string) {
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `posts/${postId}`);
    }
  }

  // --- Notes & Past Papers ---
  subscribeToNotes() {
    if (this.notesUnsubscribe) return;
    
    const q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'));
    this.notesUnsubscribe = onSnapshot(q, (snapshot) => {
      const loadedNotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Note));
      this.notes.set(loadedNotes);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notes');
    });
  }

  unsubscribeFromNotes() {
    if (this.notesUnsubscribe) {
      this.notesUnsubscribe();
      this.notesUnsubscribe = null;
    }
  }

  async createNote(note: Omit<Note, 'id' | 'createdAt'>) {
    try {
      await addDoc(collection(db, 'notes'), {
        ...note,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notes');
    }
  }

  async updateNote(noteId: string, note: Partial<Note>) {
    try {
      await updateDoc(doc(db, 'notes', noteId), note);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notes/${noteId}`);
    }
  }

  async deleteNote(noteId: string) {
    try {
      await deleteDoc(doc(db, 'notes', noteId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notes/${noteId}`);
    }
  }

  // --- Quizzes ---
  subscribeToQuizzes() {
    if (this.quizzesUnsubscribe) return;
    const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'));
    this.quizzesUnsubscribe = onSnapshot(q, (snapshot) => {
      const loadedQuizzes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Quiz));
      this.quizzes.set(loadedQuizzes);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'quizzes');
    });
  }

  unsubscribeFromQuizzes() {
    if (this.quizzesUnsubscribe) {
      this.quizzesUnsubscribe();
      this.quizzesUnsubscribe = null;
    }
  }

  async createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt'>) {
    try {
      await addDoc(collection(db, 'quizzes'), {
        ...quiz,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'quizzes');
    }
  }

  async updateQuiz(quizId: string, quiz: Partial<Quiz>) {
    try {
      await updateDoc(doc(db, 'quizzes', quizId), quiz);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `quizzes/${quizId}`);
    }
  }

  async deleteQuiz(quizId: string) {
    try {
      await deleteDoc(doc(db, 'quizzes', quizId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `quizzes/${quizId}`);
    }
  }

  // --- Quiz Results ---
  subscribeToQuizResults(userId: string) {
    if (this.quizResultsUnsubscribe) return;
    const q = query(collection(db, 'quizResults'), where('userId', '==', userId), orderBy('completedAt', 'desc'));
    this.quizResultsUnsubscribe = onSnapshot(q, (snapshot) => {
      const loadedResults = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as QuizResult));
      this.quizResults.set(loadedResults);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'quizResults');
    });
  }

  unsubscribeFromQuizResults() {
    if (this.quizResultsUnsubscribe) {
      this.quizResultsUnsubscribe();
      this.quizResultsUnsubscribe = null;
    }
  }

  async saveQuizResult(result: Omit<QuizResult, 'id' | 'completedAt'>) {
    try {
      await addDoc(collection(db, 'quizResults'), {
        ...result,
        completedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'quizResults');
    }
  }

  // --- App Updates ---
  subscribeToAppUpdates() {
    if (this.appUpdatesUnsubscribe) return;
    const q = query(collection(db, 'appUpdates'), orderBy('createdAt', 'desc'));
    this.appUpdatesUnsubscribe = onSnapshot(q, (snapshot) => {
      const loadedUpdates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AppUpdate));
      this.appUpdates.set(loadedUpdates);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'appUpdates');
    });
  }

  unsubscribeFromAppUpdates() {
    if (this.appUpdatesUnsubscribe) {
      this.appUpdatesUnsubscribe();
      this.appUpdatesUnsubscribe = null;
    }
  }

  async createAppUpdate(update: Omit<AppUpdate, 'id' | 'createdAt'>) {
    try {
      await addDoc(collection(db, 'appUpdates'), {
        ...update,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'appUpdates');
    }
  }

  // --- Revenue ---
  subscribeToRevenue() {
    if (this.revenueUnsubscribe) return;
    const q = query(collection(db, 'revenue'), orderBy('createdAt', 'desc'));
    this.revenueUnsubscribe = onSnapshot(q, (snapshot) => {
      const loadedRevenue = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as RevenueRecord));
      this.revenueRecords.set(loadedRevenue);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'revenue');
    });
  }

  unsubscribeFromRevenue() {
    if (this.revenueUnsubscribe) {
      this.revenueUnsubscribe();
      this.revenueUnsubscribe = null;
    }
  }

  async recordRevenue(record: Omit<RevenueRecord, 'id' | 'createdAt'>) {
    try {
      await addDoc(collection(db, 'revenue'), {
        ...record,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'revenue');
    }
  }
}
