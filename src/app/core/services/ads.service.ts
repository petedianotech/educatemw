import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UnityAds } from 'capacitor-unity-ads';

@Injectable({
  providedIn: 'root'
})
export class AdsService {
  private platformId = inject(PLATFORM_ID);
  private isInitialized = signal(false);
  private isTestMode = true; // Set to false for production

  // Unity Ads IDs from your dashboard
  private readonly GAME_ID_ANDROID = '5827360'; 
  private readonly GAME_ID_IOS = '5827361';
  private readonly REWARDED_PLACEMENT = 'Rewarded_Android'; // Ensure this matches Unity Dashboard
  private readonly INTERSTITIAL_PLACEMENT = 'Interstitial_Android'; // Ensure this matches Unity Dashboard

  constructor() {
    // Only initialize if we are NOT in a standard web browser (i.e., we want native Capacitor/Mobile)
    // However, Capacitor plugins often "fail" on web if not configured.
    // We better check if we are running in a native context.
    this.init();
  }

  async init() {
    // Unity Ads native SDK will not work on a standard browser/PWA URL.
    // It requires the Capacitor native bridge (APK/IPA).
    if (isPlatformBrowser(this.platformId) && !(window as any).Capacitor?.isNativePlatform) {
      // Completely silent on web to avoid console noise
      return;
    }

    try {
      // Automatic platform detection for Game ID
      const isIos = window.navigator.userAgent.includes('iPhone') || window.navigator.userAgent.includes('iPad');
      const gameId = isIos ? this.GAME_ID_IOS : this.GAME_ID_ANDROID;

      await UnityAds.initialize({
        gameId: gameId,
        testMode: this.isTestMode
      });
      this.isInitialized.set(true);
      
      // Pre-load ads
      this.loadAds();
    } catch (error) {
      // Silent fail if initialization fails (common in web environments)
    }
  }

  private async loadAds() {
    if (!this.isInitialized()) return;
    try {
      await UnityAds.loadInterstitial({ placementId: this.INTERSTITIAL_PLACEMENT });
      await UnityAds.loadRewardedVideo({ placementId: this.REWARDED_PLACEMENT });
    } catch (error) {
      console.error('Error loading ads', error);
    }
  }

  async showInterstitial() {
    if (!this.isInitialized()) {
      console.log('Interstitial Ad: Ad service not initialized (Web/PWA).');
      return;
    }
    try {
      const isLoaded = await UnityAds.isInterstitialLoaded();
      if (isLoaded.loaded) {
        await UnityAds.showInterstitial();
        this.loadAds();
      }
    } catch (error) {
      console.error('Error showing interstitial', error);
    }
  }

  async showRewarded(): Promise<boolean> {
    if (!this.isInitialized()) {
      console.log('Rewarded Ad: Ad service not initialized (Web/PWA).');
      return false;
    }
    try {
      const isLoaded = await UnityAds.isRewardedVideoLoaded();
      if (isLoaded.loaded) {
        const result = await UnityAds.showRewardedVideo();
        this.loadAds();
        return result.success;
      }
      return false;
    } catch (error) {
      console.error('Error showing rewarded ad', error);
      return false;
    }
  }
}
