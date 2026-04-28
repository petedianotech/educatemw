import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { db } from '../../../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc, Timestamp, updateDoc, where, arrayUnion, arrayRemove, increment, limit, getDocs, getCountFromServer } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../../firebase';
import { UserProfile, AuthService } from './auth.service';

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
  destination?: 'notes' | 'past-papers' | 'announcements' | 'video-lessons';
  isProOnly: boolean;
  createdAt: Date | Timestamp;
  driveUrl?: string;
  youtubeUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  slug?: string;
  level?: 'Primary' | 'Secondary';
  form?: string;
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
  source: 'AI' | 'Teacher';
}

export interface QuizResult {
  id: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  total: number;
  completedAt: Date | Timestamp;
  isFirstAttempt?: boolean;
}

export interface AppUpdate {
  id: string;
  title: string;
  content: string;
  type: 'feature' | 'maintenance' | 'announcement';
  createdAt: Date | Timestamp;
  driveUrl?: string;
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
  type?: 'text' | 'audio';
  createdAt: Date | Timestamp;
}

export interface Flashcard {
  id: string;
  setId: string;
  front: string;
  back: string;
  createdAt: Date | Timestamp;
}

export interface VideoLesson {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  category: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date | Timestamp;
}

export interface AppSettings {
  isAppOfferActive: boolean;
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
  videoLessons = signal<VideoLesson[]>([]);
  appSettings = signal<AppSettings>({ isAppOfferActive: false });
  
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);
  
  constructor() {
    this.checkAndSeedVideos();
    this.testFirestoreConnection();
  }

  async testFirestoreConnection() {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      // Small test to verify connection
      await getDocs(query(collection(db, 'config'), limit(1)));
    } catch (error) {
      if (error instanceof Error && error.message.includes('offline')) {
        console.error("Firestore connection issue: Client appears offline. Check Firebase config or network.");
      }
    }
  }

  async checkAndSeedVideos() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Wait for auth to be ready
    const currentUser = this.authService.currentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      const adminEmails = ['petedianotech@gmail.com', 'mscepreparation@gmail.com'];
      if (!currentUser || !adminEmails.includes(currentUser.email)) {
        return;
      }
    }
    
    try {
      const snapshot = await getDocs(collection(db, 'videoLessons'));
      const existingUrls = new Set(snapshot.docs.map(doc => doc.data()['youtubeUrl']));
      
      const starterVideos = [
        // Physics
        { title: 'Vectors and Scalars Explained', description: 'Master the difference between scalar and vector quantities with clear examples and practice problems.', youtubeUrl: 'https://www.youtube.com/watch?v=fNm7mHhCHW4', category: 'Physics' },
        { title: 'Newton\'s Laws of Motion', description: 'Complete guide to the three laws of motion that govern our world.', youtubeUrl: 'https://www.youtube.com/watch?v=kKKM8Y-u7ds', category: 'Physics' },
        { title: 'Ohm\'s Law & Electrical Circuits', description: 'Learn how voltage, current, and resistance work together in series and parallel circuits.', youtubeUrl: 'https://www.youtube.com/watch?v=8i2V6C6N1O8', category: 'Physics' },
        { title: 'Reflection and Refraction of Light', description: 'Visual explanation of how light behaves when hitting surfaces and passing through lenses.', youtubeUrl: 'https://www.youtube.com/watch?v=95V8koNtSn8', category: 'Physics' },
        
        // Biology
        { title: 'Introduction to Cells', description: 'Explore the microscopic world of plant and animal cells, their structures, and functions.', youtubeUrl: 'https://www.youtube.com/watch?v=8IlzKri08-A', category: 'Biology' },
        { title: 'Mendel\'s Laws of Inheritance', description: 'How traits are passed from parents to offspring using Punnett squares.', youtubeUrl: 'https://www.youtube.com/watch?v=zrKdz9qhWpk', category: 'Biology' },
        { title: 'The Process of Photosynthesis', description: 'Detailed breakdown of how plants convert light into energy.', youtubeUrl: 'https://www.youtube.com/watch?v=SnyOfUsh-Hk', category: 'Biology' },
        { title: 'Human Transport System (Heart)', description: 'Understand how the human heart pumps blood and oxygen through the body.', youtubeUrl: 'https://www.youtube.com/watch?v=vVndRoc8lTo', category: 'Biology' },

        // Chemistry
        { title: 'The Periodic Table Explained', description: 'Trends, groups, and periods. Why elements behave the way they do.', youtubeUrl: 'https://www.youtube.com/watch?v=uPkEGAHo78o', category: 'Chemistry' },
        { title: 'Redox Reactions & Oxidation', description: 'Clear explanation of electron transfer in chemical reactions.', youtubeUrl: 'https://www.youtube.com/watch?v=5rtJdjas-mY', category: 'Chemistry' },
        { title: 'Introduction to Organic Chemistry', description: 'Alkanes, Alkenes, and the basics of carbon-based molecules.', youtubeUrl: 'https://www.youtube.com/watch?v=t8O_G2HAn0Q', category: 'Chemistry' },
        { title: 'Electrolysis of Brine Practical', description: 'Step-by-step practical demonstration of the electrolysis process.', youtubeUrl: 'https://www.youtube.com/watch?v=938fLpW_Uic', category: 'Chemistry' },
        { title: 'Acids, Bases and Salts', description: 'Comprehensive guide to pH, indicators, and neutralization reactions.', youtubeUrl: 'https://www.youtube.com/watch?v=ANi709MYnWg', category: 'Chemistry' },

        // Agriculture
        { title: 'Soil Texture and Structure', description: 'How to identify different soil types and their importance in farming.', youtubeUrl: 'https://www.youtube.com/watch?v=p4vIie2gI_M', category: 'Agriculture' },
        { title: 'Successful Mushroom Production', description: 'Guide to growing oyster and button mushrooms in the Malawi context.', youtubeUrl: 'https://www.youtube.com/watch?v=R9_K5qX52jM', category: 'Agriculture' },
        { title: 'Livestock Nutrition Essentials', description: 'Understanding roughages, concentrates, and balanced rations for animals.', youtubeUrl: 'https://www.youtube.com/watch?v=0hO2r6WcM2o', category: 'Agriculture' },
        { title: 'Crop Rotation Systems', description: 'Benefits and methods of rotating crops to maintain soil fertility.', youtubeUrl: 'https://www.youtube.com/watch?v=Z7n9tJ_uW1E', category: 'Agriculture' },
        { title: 'Soil Conservation Techniques', description: 'Practical methods to prevent soil erosion and maintain land productivity.', youtubeUrl: 'https://www.youtube.com/watch?v=f-B6RAnxX6M', category: 'Agriculture' },
        
        // More Physics & Biology
        { title: 'Simple Linear Motion Practical', description: 'Calculating speed, velocity, and acceleration with hands-on experiments.', youtubeUrl: 'https://www.youtube.com/watch?v=12f9VMeEos4', category: 'Physics' },
        { title: 'Human Digestive System', description: 'Mechanical and chemical digestion processes explained simply.', youtubeUrl: 'https://www.youtube.com/watch?v=pqgcEIaXGME', category: 'Biology' }
      ];

      for (const v of starterVideos) {
        if (!existingUrls.has(v.youtubeUrl)) {
          await this.createVideoLesson(v);
        }
      }
    } catch (err) {
      console.warn('Initial seed check failed:', err);
    }
  }

  totalUserCount = signal(0);
  totalProCount = signal(0);
  totalQuizCount = signal(0);
  
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
  private videoLessonsUnsubscribe: (() => void) | null = null;
  private settingsUnsubscribe: (() => void) | null = null;

  // --- Video Lessons ---
  subscribeToVideoLessons(limitCount = 20) {
    if (this.videoLessonsUnsubscribe) this.unsubscribeFromVideoLessons();
    const q = query(collection(db, 'videoLessons'), orderBy('createdAt', 'desc'), limit(limitCount));
    this.videoLessonsUnsubscribe = onSnapshot(q, (snapshot) => {
      const loadedVideos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as VideoLesson));
      this.videoLessons.set(loadedVideos);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'videoLessons');
    });
  }

  unsubscribeFromVideoLessons() {
    if (this.videoLessonsUnsubscribe) {
      this.videoLessonsUnsubscribe();
      this.videoLessonsUnsubscribe = null;
    }
  }

  async createVideoLesson(video: Omit<VideoLesson, 'id' | 'createdAt'>) {
    try {
      await addDoc(collection(db, 'videoLessons'), {
        ...video,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'videoLessons');
    }
  }

  async deleteVideoLesson(videoId: string) {
    try {
      await deleteDoc(doc(db, 'videoLessons', videoId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `videoLessons/${videoId}`);
    }
  }

  // --- Settings ---
  subscribeToSettings() {
    if (this.settingsUnsubscribe) this.unsubscribeFromSettings();
    const docRef = doc(db, 'config', 'appSettings');
    this.settingsUnsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        this.appSettings.set(snapshot.data() as AppSettings);
      } else {
        // Initialize if not exists
        this.updateSetting('isAppOfferActive', false);
      }
    }, (error) => {
      // Don't log missing doc as error for public users
      if (!error.message.includes('permission-denied')) {
        handleFirestoreError(error, OperationType.GET, 'config/appSettings');
      }
    });
  }

  unsubscribeFromSettings() {
    if (this.settingsUnsubscribe) {
      this.settingsUnsubscribe();
      this.settingsUnsubscribe = null;
    }
  }

  async updateSetting(key: keyof AppSettings, value: string | number | boolean) {
    try {
      const docRef = doc(db, 'config', 'appSettings');
      await updateDoc(docRef, { [key]: value }).catch(async () => {
        // If update fails because doc doesn't exist, use setDoc instead via updateDoc with merge? 
        // No, simple setDoc for first time.
        const { setDoc } = await import('firebase/firestore');
        await setDoc(docRef, { [key]: value }, { merge: true });
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `config/appSettings`);
    }
  }

  // --- Users ---
  subscribeToUsers(limitCount = 50) {
    if (this.usersUnsubscribe) this.unsubscribeFromUsers();
    
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(limitCount));
    this.usersUnsubscribe = onSnapshot(q, (snapshot) => {
      const loadedUsers = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as UserProfile));
      this.users.set(loadedUsers);
      this.fetchTotalCounts(); // Refresh real counts on change
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });
  }

  subscribeToPremiumUsers(limitCount = 20) {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.usersUnsubscribe) this.unsubscribeFromUsers();
    
    // Remote orderBy to avoid missing composite index
    const q = query(collection(db, 'users'), where('isPro', '==', true), limit(limitCount));
    this.usersUnsubscribe = onSnapshot(q, (snapshot) => {
      const loadedUsers = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as UserProfile));
      
      // Sort client-side
      loadedUsers.sort((a, b) => {
        const timeA = (a.createdAt as { toMillis?: () => number })?.toMillis?.() || 0;
        const timeB = (b.createdAt as { toMillis?: () => number })?.toMillis?.() || 0;
        return timeB - timeA;
      });
      
      this.users.set(loadedUsers);
      this.fetchTotalCounts();
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

  async addCoins(userId: string, amount: number) {
    if (!userId) return;
    try {
      await updateDoc(doc(db, 'users', userId), {
        coins: increment(amount)
      });
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
    if (!isPlatformBrowser(this.platformId)) return;
    
    if (this.notesUnsubscribe) this.unsubscribeFromNotes();
    
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

  async getNoteBySlug(slug: string): Promise<Note | null> {
    try {
      const q = query(collection(db, 'notes'), where('slug', '==', slug), limit(1));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Note;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'notes');
      return null;
    }
  }

  // --- Quizzes ---
  subscribeToQuizzes(limitCount = 20) {
    if (this.quizzesUnsubscribe) this.unsubscribeFromQuizzes();
    const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'), limit(limitCount));
    this.quizzesUnsubscribe = onSnapshot(q, (snapshot) => {
      const loadedQuizzes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Quiz));
      this.quizzes.set(loadedQuizzes);
      this.fetchTotalCounts();
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
      // Analytics: Track quiz creation
      console.log('Analytics: Quiz created', { title: quiz.title, category: quiz.category });
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
      // Analytics: Track quiz participation
      console.log('Analytics: Quiz completed', { quizId: result.quizId, score: result.score });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'quizResults');
    }
  }

  // --- App Updates ---
  subscribeToAppUpdates(limitCount = 5) {
    if (this.appUpdatesUnsubscribe) this.unsubscribeFromAppUpdates();
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

  async deleteAppUpdate(updateId: string) {
    try {
      await deleteDoc(doc(db, 'appUpdates', updateId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `appUpdates/${updateId}`);
    }
  }

  // --- Revenue ---
  subscribeToRevenue() {
    if (this.revenueUnsubscribe) this.unsubscribeFromRevenue();
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
    if (this.examDatesUnsubscribe) this.unsubscribeFromExamDates();
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
    if (this.flashcardSetsUnsubscribe) this.unsubscribeFromFlashcardSets();
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

  async fetchTotalCounts() {
    try {
      const usersCol = collection(db, 'users');
      const usersSnapshot = await getCountFromServer(usersCol);
      this.totalUserCount.set(usersSnapshot.data().count);

      const proQuery = query(collection(db, 'users'), where('isPro', '==', true));
      const proSnapshot = await getCountFromServer(proQuery);
      this.totalProCount.set(proSnapshot.data().count);

      const quizCol = collection(db, 'quizzes');
      const quizSnapshot = await getCountFromServer(quizCol);
      this.totalQuizCount.set(quizSnapshot.data().count);
    } catch (error) {
      console.error('Error fetching total counts:', error);
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
    if (this.messagesUnsubscribe) this.unsubscribeFromMessages();
    
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

  async sendMessage(authorId: string, authorName: string, authorPhoto: string, content: string, type: 'text' | 'audio' = 'text') {
    try {
      await addDoc(collection(db, 'messages'), {
        authorId,
        authorName,
        authorPhoto,
        content,
        type,
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
        orderBy('coins', 'desc'), 
        limit(limitCount)
      );
      
      if (lastDoc) {
        const { startAfter } = await import('firebase/firestore');
        q = query(
          collection(db, 'users'), 
          orderBy('coins', 'desc'), 
          startAfter(lastDoc),
          limit(limitCount)
        );
      }
      
      const snapshot = await getDocs(q);
      const students = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      
      // Analytics: Track leaderboard view
      console.log('Analytics: Leaderboard viewed', { count: students.length });
      
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
