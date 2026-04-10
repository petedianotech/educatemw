import { Injectable, signal } from '@angular/core';
import { auth } from '../../../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'student' | 'admin';
  isPro: boolean;
  aiCredits?: number;
  pwaInstalled?: boolean;
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<UserProfile | null>(null);
  isAuthReady = signal<boolean>(false);

  constructor() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        await this.loadUserProfile(user);
      } else {
        this.currentUser.set(null);
      }
      this.isAuthReady.set(true);
    });
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await this.loadUserProfile(result.user);
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  }

  async signupWithEmail(email: string, password: string, username: string) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await this.createNewUserProfile(result.user, username);
    } catch (error) {
      console.error('Signup failed', error);
      throw error;
    }
  }

  async loginWithEmail(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await this.loadUserProfile(result.user);
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  }

  async signupWithPhone(phone: string, password: string, username: string) {
    try {
      // Using a dummy domain to treat phone number as an email for Firebase Auth
      const emailAlias = `${phone.replace(/[^0-9+]/g, '')}@edumalawi.local`;
      const result = await createUserWithEmailAndPassword(auth, emailAlias, password);
      await this.createNewUserProfile(result.user, username);
    } catch (error) {
      console.error('Signup failed', error);
      throw error;
    }
  }

  async loginWithPhone(phone: string, password: string) {
    try {
      const emailAlias = `${phone.replace(/[^0-9+]/g, '')}@edumalawi.local`;
      const result = await signInWithEmailAndPassword(auth, emailAlias, password);
      await this.loadUserProfile(result.user);
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  }

  async logout() {
    await signOut(auth);
    this.currentUser.set(null);
  }

  private async createNewUserProfile(user: FirebaseUser, username: string) {
    const userRef = doc(db, 'users', user.uid);
    const newUser: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: username || 'Student',
      photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      role: 'student',
      isPro: false,
      aiCredits: 5,
      createdAt: new Date()
    };
    await setDoc(userRef, newUser);
    this.currentUser.set(newUser);
  }

  private async loadUserProfile(user: FirebaseUser) {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      this.currentUser.set({
        ...data,
        aiCredits: data['aiCredits'] !== undefined ? data['aiCredits'] : 5,
        createdAt: data['createdAt']?.toDate() || new Date()
      } as UserProfile);
    } else {
      // Fallback if profile doesn't exist (e.g., Google login first time)
      await this.createNewUserProfile(user, user.displayName || 'Student');
    }
  }

  async updateUsername(newUsername: string) {
    const user = this.currentUser();
    if (!user) return;
    
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { displayName: newUsername });
    this.currentUser.set({ ...user, displayName: newUsername });
  }

  async decrementAiCredits() {
    const user = this.currentUser();
    if (!user || user.isPro || user.role === 'admin') return;
    
    const currentCredits = user.aiCredits !== undefined ? user.aiCredits : 5;
    if (currentCredits > 0) {
      const newCredits = currentCredits - 1;
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { aiCredits: newCredits });
      this.currentUser.set({ ...user, aiCredits: newCredits });
    }
  }

  async claimPwaReward() {
    const user = this.currentUser();
    if (!user || user.pwaInstalled) return;

    const currentCredits = user.aiCredits !== undefined ? user.aiCredits : 5;
    const newCredits = currentCredits + 10;
    const userRef = doc(db, 'users', user.uid);
    
    await updateDoc(userRef, { 
      aiCredits: newCredits,
      pwaInstalled: true
    });
    
    this.currentUser.set({ 
      ...user, 
      aiCredits: newCredits,
      pwaInstalled: true 
    });
  }
}
