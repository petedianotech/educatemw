import { Injectable, signal } from '@angular/core';
import { db } from '../../../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc, Timestamp, updateDoc, where, arrayUnion, arrayRemove, increment, limit } from 'firebase/firestore';
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
  likedBy: string[];
  commentsCount: number;
}

export interface Reply {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  createdAt: Date | Timestamp;
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
  authorId: string;
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

export interface ExamDate {
  id: string;
  subject: string;
  date: Date | Timestamp;
  description?: string;
  createdAt: Date | Timestamp;
}

export interface FlashcardSet {
  id: string;
  title: string;
  description?: string;
  category: string;
  authorId: string;
  authorName: string;
  isProOnly: boolean;
  createdAt: Date | Timestamp;
}

export interface ChatMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  createdAt: Date | Timestamp;
}

export interface Flashcard {
  id: string;
  setId: string;
  front: string;
  back: string;
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
  examDates = signal<ExamDate[]>([]);
  flashcardSets = signal<FlashcardSet[]>([]);
  flashcards = signal<Flashcard[]>([]);
  messages = signal<ChatMessage[]>([]);
  
  private postsUnsubscribe: (() => void) | null = null;
  private notesUnsubscribe: (() => void) | null = null;
  private usersUnsubscribe: (() => void) | null = null;
  private quizzesUnsubscribe: (() => void) | null = null;
  private quizResultsUnsubscribe: (() => void) | null = null;
  private appUpdatesUnsubscribe: (() => void) | null = null;
  private revenueUnsubscribe: (() => void) | null = null;
  private examDatesUnsubscribe: (() => void) | null = null;
  private flashcardSetsUnsubscribe: (() => void) | null = null;
  private flashcardsUnsubscribe: (() => void) | null = null;
  private messagesUnsubscribe: (() => void) | null = null;

  // --- Users ---
  subscribeToUsers(limitCount = 50) {
    if (this.usersUnsubscribe) return;
    
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(limitCount));
    this.usersUnsubscribe = onSnapshot(q, (snapshot) => {
      const loadedUsers = snapshot.docs.map(doc => ({
        ...doc.data()
      } as UserProfile));
      this.users.set(loadedUsers);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });
  }

  subscribeToPremiumUsers(limitCount = 20) {
    if (this.usersUnsubscribe) return;
    
    const q = query(collection(db, 'users'), where('isPro', '==', true), orderBy('createdAt', 'desc'), limit(limitCount));
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

  async updateUserProfile(userId: string, profile: Partial<UserProfile>) {
    try {
      await updateDoc(doc(db, 'users', userId), profile);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  }

  // --- Community Posts ---
  subscribeToPosts(limitCount = 20) {
    if (this.postsUnsubscribe) return;
    
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(limitCount));
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
        likedBy: [],
        commentsCount: 0
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'posts');
    }
  }

  async likePost(postId: string, userId: string, liked: boolean) {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likesCount: increment(liked ? 1 : -1),
        likedBy: liked ? arrayUnion(userId) : arrayRemove(userId)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}`);
    }
  }

  async createReply(postId: string, authorId: string, authorName: string, authorPhoto: string, content: string) {
    try {
      await addDoc(collection(db, 'replies'), {
        postId,
        authorId,
        authorName,
        authorPhoto,
        content,
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'posts', postId), {
        commentsCount: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'replies');
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
  subscribeToNotes(category?: string, limitCount = 50) {
    if (this.notesUnsubscribe) return;
    
    let q = query(collection(db, 'notes'), orderBy('createdAt', 'desc'), limit(limitCount));
    if (category) {
      q = query(collection(db, 'notes'), where('category', '==', category), orderBy('createdAt', 'desc'), limit(limitCount));
    }
    
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
  subscribeToQuizzes(limitCount = 20) {
    if (this.quizzesUnsubscribe) return;
    const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'), limit(limitCount));
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

  replies = signal<Reply[]>([]);
  private repliesUnsubscribe: (() => void) | null = null;

  subscribeToReplies(postId: string) {
    if (this.repliesUnsubscribe) this.unsubscribeFromReplies();
    const q = query(collection(db, 'replies'), where('postId', '==', postId), orderBy('createdAt', 'asc'));
    this.repliesUnsubscribe = onSnapshot(q, (snapshot) => {
      const loadedReplies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Reply));
      this.replies.set(loadedReplies);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'replies');
    });
  }

  unsubscribeFromReplies() {
    if (this.repliesUnsubscribe) {
      this.repliesUnsubscribe();
      this.repliesUnsubscribe = null;
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
  subscribeToAppUpdates(limitCount = 5) {
    if (this.appUpdatesUnsubscribe) return;
    const q = query(collection(db, 'appUpdates'), orderBy('createdAt', 'desc'), limit(limitCount));
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

  // --- Exam Dates ---
  subscribeToExamDates() {
    if (this.examDatesUnsubscribe) return;
    const q = query(collection(db, 'examDates'), orderBy('date', 'asc'));
    this.examDatesUnsubscribe = onSnapshot(q, (snapshot) => {
      const loadedDates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ExamDate));
      this.examDates.set(loadedDates);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'examDates');
    });
  }

  unsubscribeFromExamDates() {
    if (this.examDatesUnsubscribe) {
      this.examDatesUnsubscribe();
      this.examDatesUnsubscribe = null;
    }
  }

  async createExamDate(examDate: Omit<ExamDate, 'id' | 'createdAt'>) {
    try {
      await addDoc(collection(db, 'examDates'), {
        ...examDate,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'examDates');
    }
  }

  async deleteExamDate(dateId: string) {
    try {
      await deleteDoc(doc(db, 'examDates', dateId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `examDates/${dateId}`);
    }
  }

  // --- Flashcards ---
  subscribeToFlashcardSets() {
    if (this.flashcardSetsUnsubscribe) return;
    const q = query(collection(db, 'flashcardSets'), orderBy('createdAt', 'desc'));
    this.flashcardSetsUnsubscribe = onSnapshot(q, (snapshot) => {
      const loadedSets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FlashcardSet));
      this.flashcardSets.set(loadedSets);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'flashcardSets');
    });
  }

  unsubscribeFromFlashcardSets() {
    if (this.flashcardSetsUnsubscribe) {
      this.flashcardSetsUnsubscribe();
      this.flashcardSetsUnsubscribe = null;
    }
  }

  async createFlashcardSet(set: Omit<FlashcardSet, 'id' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'flashcardSets'), {
        ...set,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'flashcardSets');
      return null;
    }
  }

  async deleteFlashcardSet(setId: string) {
    try {
      await deleteDoc(doc(db, 'flashcardSets', setId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `flashcardSets/${setId}`);
    }
  }

  subscribeToFlashcards(setId: string) {
    if (this.flashcardsUnsubscribe) this.unsubscribeFromFlashcards();
    const q = query(collection(db, 'flashcards'), where('setId', '==', setId), orderBy('createdAt', 'asc'));
    this.flashcardsUnsubscribe = onSnapshot(q, (snapshot) => {
      const loadedCards = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Flashcard));
      this.flashcards.set(loadedCards);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'flashcards');
    });
  }

  unsubscribeFromFlashcards() {
    if (this.flashcardsUnsubscribe) {
      this.flashcardsUnsubscribe();
      this.flashcardsUnsubscribe = null;
    }
  }

  async createFlashcard(card: Omit<Flashcard, 'id' | 'createdAt'>) {
    try {
      await addDoc(collection(db, 'flashcards'), {
        ...card,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'flashcards');
    }
  }

  async deleteFlashcard(cardId: string) {
    try {
      await deleteDoc(doc(db, 'flashcards', cardId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `flashcards/${cardId}`);
    }
  }

  // --- Community Chat ---
  subscribeToMessages(limitCount = 50) {
    if (this.messagesUnsubscribe) return;
    
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(limitCount));
    this.messagesUnsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatMessage)).reverse(); // Reverse to show oldest at top for chat
      this.messages.set(loadedMessages);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'messages');
    });
  }

  unsubscribeFromMessages() {
    if (this.messagesUnsubscribe) {
      this.messagesUnsubscribe();
      this.messagesUnsubscribe = null;
    }
  }

  async sendMessage(authorId: string, authorName: string, authorPhoto: string, content: string) {
    try {
      await addDoc(collection(db, 'messages'), {
        authorId,
        authorName,
        authorPhoto,
        content,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
    }
  }

  async deleteMessage(messageId: string) {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `messages/${messageId}`);
    }
  }

  // --- Leaderboard ---
  async getTopStudents(limitCount = 25, lastDoc: unknown = null) {
    try {
      const { query, collection, orderBy, limit, getDocs } = await import('firebase/firestore');
      
      let q = query(
        collection(db, 'users'), 
        orderBy('aiCredits', 'desc'), 
        limit(limitCount)
      );
      
      if (lastDoc) {
        const { startAfter } = await import('firebase/firestore');
        q = query(
          collection(db, 'users'), 
          orderBy('aiCredits', 'desc'), 
          startAfter(lastDoc),
          limit(limitCount)
        );
      }
      
      const snapshot = await getDocs(q);
      const students = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      return {
        students,
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
      return { students: [], lastDoc: null };
    }
  }
}
