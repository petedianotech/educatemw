import { Injectable, signal } from '@angular/core';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../firebase';

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
  content: string;
  category: string;
  isProOnly: boolean;
  createdAt: Date | Timestamp;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  posts = signal<Post[]>([]);
  notes = signal<Note[]>([]);
  
  private postsUnsubscribe: (() => void) | null = null;
  private notesUnsubscribe: (() => void) | null = null;

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
}
