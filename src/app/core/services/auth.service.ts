import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { auth, storage } from '../../../firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInAnonymously, 
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, handleFirestoreError, OperationType } from '../../../firebase';

export interface SecurityQuestion {
  question: string;
  answer: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'student' | 'admin';
  isPro: boolean;
  isGuest?: boolean;
  aiCredits?: number;
  streak?: number;
  coins?: number;
  lastCreditReset?: string; // ISO date string
  lastLoginDate?: string; // ISO date string
  pwaInstalled?: boolean;
  hasClaimedAppInstallReward?: boolean;
  referralCode?: string;
  referredBy?: string;
  referralsCount?: number;
  createdAt: Date;
  securityQuestions?: SecurityQuestion[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<UserProfile | null>(null);
  isAuthReady = signal<boolean>(false);
  rewardMessage = signal<string | null>(null);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    setPersistence(auth, browserLocalPersistence).catch(console.error);
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
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, provider);
      await this.loadUserProfile(result.user);
    } catch (error) {
      console.error('Login failed', error);
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

  async loginAsGuest() {
    try {
      const result = await signInAnonymously(auth);
      await this.loadUserProfile(result.user);
    } catch (error) {
      console.error('Guest login failed', error);
      throw error;
    }
  }

  async sendPasswordReset(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset failed', error);
      throw error;
    }
  }

  async signupWithEmail(email: string, password: string, username: string, securityQuestions?: SecurityQuestion[]) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await this.createNewUserProfile(result.user, username, securityQuestions);
    } catch (error) {
      console.error('Signup failed', error);
      throw error;
    }
  }

  async signupWithUsername(username: string, password: string, securityQuestions?: SecurityQuestion[]) {
    try {
      const emailAlias = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@edumalawi.local`;
      const result = await createUserWithEmailAndPassword(auth, emailAlias, password);
      await this.createNewUserProfile(result.user, username, securityQuestions);
    } catch (error) {
      console.error('Signup failed', error);
      throw error;
    }
  }

  async loginWithUsername(username: string, password: string) {
    try {
      const emailAlias = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@edumalawi.local`;
      const result = await signInWithEmailAndPassword(auth, emailAlias, password);
      await this.loadUserProfile(result.user);
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  }

  async signupWithPhone(phone: string, password: string, username: string, securityQuestions?: SecurityQuestion[]) {
    try {
      const emailAlias = `${phone.replace(/[^0-9+]/g, '')}@edumalawi.local`;
      const result = await createUserWithEmailAndPassword(auth, emailAlias, password);
      await this.createNewUserProfile(result.user, username, securityQuestions);
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

  async sendAdminMagicLink(email: string) {
    const actionCodeSettings = {
      // Use the current origin for the redirect URL
      url: window.location.origin + '/login',
      handleCodeInApp: true,
    };
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      if (isPlatformBrowser(this.platformId)) {
        window.localStorage.setItem('emailForSignIn', email);
      }
    } catch (error) {
      console.error('Magic link failed', error);
      throw error;
    }
  }

  async completeMagicLinkSignIn(url: string) {
    if (isSignInWithEmailLink(auth, url)) {
      let email = isPlatformBrowser(this.platformId) ? window.localStorage.getItem('emailForSignIn') : null;
      
      if (!email) {
        email = window.prompt('Please provide your email for confirmation');
      }
      
      if (email) {
        try {
          const result = await signInWithEmailLink(auth, email, url);
          if (isPlatformBrowser(this.platformId)) {
            window.localStorage.removeItem('emailForSignIn');
          }
          await this.loadUserProfile(result.user);
          
          // Force admin role for these specific emails
          const adminEmails = ['mscepreparation@gmail.com', 'petedianotech@gmail.com'];
          if (adminEmails.includes(email.toLowerCase())) {
            const userRef = doc(db, 'users', result.user.uid);
            await updateDoc(userRef, { role: 'admin' });
            const user = this.currentUser();
            if (user) {
              this.currentUser.set({ ...user, role: 'admin' });
            }
          }
          return true;
        } catch (error) {
          console.error('Magic link sign in failed', error);
          throw error;
        }
      }
    }
    return false;
  }

  private async createNewUserProfile(user: FirebaseUser, username: string, securityQuestions?: SecurityQuestion[]) {
    const userRef = doc(db, 'users', user.uid);
    
    // Save security questions to a separate collection for recovery
    if (securityQuestions && securityQuestions.length > 0) {
      const recoveryRef = doc(db, 'recovery', user.email || `${user.uid}@edumalawi.local`);
      await setDoc(recoveryRef, {
        uid: user.uid,
        questions: securityQuestions.map(q => ({ question: q.question, answer: q.answer.toLowerCase().trim() }))
      });
    }
    
    let referredBy: string | undefined;
    
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const referralCode = urlParams.get('ref');

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
    }

    const newUser: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: username || 'Student',
      photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      role: 'student',
      isPro: false,
      isGuest: user.isAnonymous,
      aiCredits: user.isAnonymous ? 2 : 5,
      streak: 0,
      coins: 0,
      lastCreditReset: new Date().toISOString(),
      lastLoginDate: new Date().toISOString(),
      referralCode: user.uid.substring(0, 8).toUpperCase(),
      referralsCount: 0,
      createdAt: new Date(),
      securityQuestions: securityQuestions || []
    };
    
    // Only add referredBy if it has a valid value
    if (referredBy) {
      newUser.referredBy = referredBy;
      newUser.aiCredits = (newUser.aiCredits || 0) + 10;
    }

    console.log('Creating new user profile:', newUser);
    await setDoc(userRef, newUser);
    this.currentUser.set(newUser);
  }

  private async loadUserProfile(user: FirebaseUser) {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        let profile = {
          ...data,
          aiCredits: data['aiCredits'] !== undefined ? data['aiCredits'] : (data['isGuest'] ? 2 : 5),
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
          const dailyAllowance = profile.isGuest ? 2 : 5;
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

        // Streak Logic
        const lastLogin = profile.lastLoginDate ? new Date(profile.lastLoginDate) : new Date(0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastLoginDate = new Date(lastLogin);
        lastLoginDate.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(today.getTime() - lastLoginDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Logged in yesterday, increment streak
          profile.streak = (profile.streak || 0) + 1;
          await updateDoc(userRef, { streak: profile.streak, lastLoginDate: now.toISOString() });
        } else if (diffDays > 1) {
          // Logged in more than a day ago, reset streak
          profile.streak = 1;
          await updateDoc(userRef, { streak: profile.streak, lastLoginDate: now.toISOString() });
        } else if (diffDays === 0) {
          // Logged in today, do nothing
        }

        this.currentUser.set(profile);
      } else {
        console.log('User profile not found for:', user.uid);
        // Fallback if profile doesn't exist (e.g., Google login first time or Guest login)
        await this.createNewUserProfile(user, user.isAnonymous ? 'Guest' : (user.displayName || 'Student'));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    }
  }

  async updateUsername(newUsername: string) {
    const user = this.currentUser();
    if (!user) return;
    
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { displayName: newUsername });
    this.currentUser.set({ ...user, displayName: newUsername });
  }

  async uploadProfilePicture(file: File): Promise<string> {
    const user = this.currentUser();
    if (!user) throw new Error('User not authenticated');

    const storageRef = ref(storage, `profilePictures/${user.uid}/profile.jpg`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { photoURL: downloadURL });
    this.currentUser.set({ ...user, photoURL: downloadURL });
    return downloadURL;
  }

  async getUserByPhone(phone: string): Promise<UserProfile | null> {
    const emailAlias = `${phone.replace(/[^0-9+]/g, '')}@edumalawi.local`;
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', emailAlias));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    return querySnapshot.docs[0].data() as UserProfile;
  }

  async getSecurityQuestions(identifier: string): Promise<{ uid: string, questions: SecurityQuestion[] } | null> {
    const id = identifier.includes('@') ? identifier : `${identifier.replace(/[^0-9+]/g, '')}@edumalawi.local`;
    const recoveryRef = doc(db, 'recovery', id);
    const snap = await getDoc(recoveryRef);
    if (snap.exists()) return snap.data() as { uid: string, questions: SecurityQuestion[] };
    return null;
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

  async claimAppInstallReward() {
    const user = this.currentUser();
    if (!user || user.hasClaimedAppInstallReward) return;

    const currentCoins = user.coins || 0;
    const currentCredits = user.aiCredits || 0;
    
    const newCoins = currentCoins + 50;
    const newCredits = currentCredits + 20;

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { 
      coins: newCoins,
      aiCredits: newCredits,
      hasClaimedAppInstallReward: true
    });
    
    this.currentUser.set({ 
      ...user, 
      coins: newCoins,
      aiCredits: newCredits,
      hasClaimedAppInstallReward: true 
    });
    
    this.rewardMessage.set('Congratulations! You received 50 coins and 20 AI credits for installing our app! 🚀');
    setTimeout(() => this.rewardMessage.set(null), 5000);
  }

  async saveSecurityQuestions(questions: SecurityQuestion[]) {
    const user = this.currentUser();
    if (!user) throw new Error('User not authenticated');

    const userRef = doc(db, 'users', user.uid);
    const recoveryRef = doc(db, 'recovery', user.email || `${user.uid}@edumalawi.local`);

    const formattedQuestions = questions.map(q => ({ 
      question: q.question, 
      answer: q.answer.toLowerCase().trim() 
    }));

    await updateDoc(userRef, { securityQuestions: formattedQuestions });
    await setDoc(recoveryRef, {
      uid: user.uid,
      questions: formattedQuestions
    });

    this.currentUser.set({ ...user, securityQuestions: formattedQuestions });
  }
}
