import { Injectable, signal } from '@angular/core';
import { auth } from '../../../firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, User as FirebaseUser, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'student' | 'admin';
  isPro: boolean;
  aiCredits?: number;
  streak?: number;
  lastCreditReset?: string; // ISO date string
  pwaInstalled?: boolean;
  referralCode?: string;
  referredBy?: string;
  referralsCount?: number;
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<UserProfile | null>(null);
  isAuthReady = signal<boolean>(false);
  rewardMessage = signal<string | null>(null);

  constructor() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        await this.loadUserProfile(user);
      } else {
        this.currentUser.set(null);
      }
      this.isAuthReady.set(true);
    });

    // Handle redirect result for mobile Google sign-in
    this.handleRedirectResult();
  }

  private async handleRedirectResult() {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        await this.loadUserProfile(result.user);
      }
    } catch (error) {
      console.error('Redirect login failed', error);
    }
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      // Check if we are on a mobile device or standalone (APK/PWA)
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;

      if (isMobile || isStandalone) {
        await signInWithRedirect(auth, provider);
      } else {
        const result = await signInWithPopup(auth, provider);
        await this.loadUserProfile(result.user);
      }
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
    
    // Check for referral code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    let referredBy: string | undefined;

    if (referralCode) {
      // Find user with this referral code
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', referralCode));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const referrerDoc = querySnapshot.docs[0];
        referredBy = referrerDoc.id;
        
        // Reward the referrer
        const referrerData = referrerDoc.data();
        const currentReferrals = referrerData['referralsCount'] || 0;
        const currentCredits = referrerData['aiCredits'] || 0;
        
        await updateDoc(doc(db, 'users', referredBy), {
          referralsCount: currentReferrals + 1,
          aiCredits: currentCredits + 10
        });
      }
    }

    const newUser: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: username || 'Student',
      photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      role: 'student',
      isPro: false,
      aiCredits: 5,
      streak: 0,
      lastCreditReset: new Date().toISOString(),
      referralCode: user.uid.substring(0, 8).toUpperCase(),
      referralsCount: 0,
      createdAt: new Date()
    };
    
    // Only add referredBy if it has a valid value
    if (referredBy) {
      newUser.referredBy = referredBy;
    }

    await setDoc(userRef, newUser);
    this.currentUser.set(newUser);
  }

  private async loadUserProfile(user: FirebaseUser) {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      let profile = {
        ...data,
        aiCredits: data['aiCredits'] !== undefined ? data['aiCredits'] : 5,
        createdAt: data['createdAt']?.toDate() || new Date()
      } as UserProfile;

      // Daily Credit Reset Logic (12 PM Malawi Time / CAT)
      // CAT is UTC+2. 12 PM CAT = 10 AM UTC.
      const now = new Date();
      const malawiNow = new Date(now.getTime() + (2 * 60 * 60 * 1000)); // Current time in CAT
      
      // Determine the last reset threshold (the most recent 12 PM CAT)
      const resetThreshold = new Date(malawiNow);
      resetThreshold.setHours(12, 0, 0, 0);
      
      // If current time is before 12 PM today, the threshold was 12 PM yesterday
      if (malawiNow.getTime() < resetThreshold.getTime()) {
        resetThreshold.setDate(resetThreshold.getDate() - 1);
      }

      const lastReset = profile.lastCreditReset ? new Date(profile.lastCreditReset) : new Date(0);
      const lastResetInCAT = new Date(lastReset.getTime() + (2 * 60 * 60 * 1000));

      if (lastResetInCAT.getTime() < resetThreshold.getTime()) {
        // Reset credits
        const dailyAllowance = 5;
        const newCredits = (profile.aiCredits || 0) < dailyAllowance ? dailyAllowance : profile.aiCredits;
        
        await updateDoc(userRef, {
          aiCredits: newCredits,
          lastCreditReset: now.toISOString()
        });
        
        profile = {
          ...profile,
          aiCredits: newCredits,
          lastCreditReset: now.toISOString()
        };
        
        this.rewardMessage.set('Your daily credits has been rewarded successfully! 🎁');
        setTimeout(() => this.rewardMessage.set(null), 5000);
      }

      this.currentUser.set(profile);
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
