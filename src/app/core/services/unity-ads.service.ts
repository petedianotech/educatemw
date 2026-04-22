import { Injectable, PLATFORM_ID, inject, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Capacitor } from '@capacitor/core';
import { UnityAds } from 'capacitor-unity-ads';
import { AuthService } from './auth.service';

interface ExtendedUnityAds {
  loadBanner(options: { placementId: string }): Promise<void>;
  showBanner(): Promise<void>;
  hideBanner(): Promise<void>;
}

@Injectable({
  providedIn: 'root'
})
export class UnityAdsService {
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);
  public isReady = false;

  private unityAds = UnityAds as unknown as ExtendedUnityAds;

  // Real Unity Game IDs assigned by User
  private gameId = Capacitor.getPlatform() === 'ios' ? '6096322' : '6096323';
  
  // Real Unit IDs configured by User in Unity Dashboard
  private interstitialAdUnitId = Capacitor.getPlatform() === 'ios' ? 'Interstitial_iOS' : 'Interstitial_Android';
  private rewardedAdUnitId = Capacitor.getPlatform() === 'ios' ? 'Rewarded_iOS' : 'Rewarded_Android';
  private bannerAdUnitId = Capacitor.getPlatform() === 'ios' ? 'Banner_iOS' : 'Banner_Android';

  isPro = computed(() => !!this.authService.currentUser()?.isPro || this.authService.currentUser()?.role === 'admin');

  constructor() {
    this.initialize();
  }

  async initialize() {
    if (isPlatformBrowser(this.platformId) && Capacitor.isNativePlatform()) {
      try {
        await UnityAds.initialize({
          gameId: this.gameId,
          testMode: false // REAL ADS ENABLED - Production Mode
        });
        
        console.log('Unity Ads Initialized Successfully in PRODUCTION for Platform:', Capacitor.getPlatform());
        this.isReady = true;

        // Auto-load banner on init if it's dashboard
        // Note: Actual showing is handled by components that want it
      } catch (error) {
        console.error('Failed to initialize Unity Ads:', error);
      }
    }
  }

  async showBanner() {
    if (!this.isReady || !Capacitor.isNativePlatform() || this.isPro()) return;
    try {
      await this.unityAds.loadBanner({ placementId: this.bannerAdUnitId });
      await this.unityAds.showBanner();
    } catch (error) {
      console.error('Failed to load/show Banner Ad:', error);
    }
  }

  async hideBanner() {
    if (!this.isReady || !Capacitor.isNativePlatform()) return;
    try {
      await this.unityAds.hideBanner();
    } catch (error) {
      console.error('Failed to hide Banner Ad:', error);
    }
  }

  async showInterstitial() {
    if (!this.isReady || !Capacitor.isNativePlatform() || this.isPro()) return;
    try {
      await UnityAds.loadInterstitial({ placementId: this.interstitialAdUnitId });
      // In a real implementation you'd listen to interstitialLoaded event before showing, 
      // but showing immediately might work if it caches or waits
      await UnityAds.showInterstitial();
    } catch (error) {
      console.error('Failed to load/show Interstitial Ad:', error);
    }
  }

  async showRewarded(): Promise<boolean> {
    if (this.isPro()) return true; // Instantly reward pro users without video!
    if (!this.isReady || !Capacitor.isNativePlatform()) return false;
    try {
      await UnityAds.loadRewardedVideo({ placementId: this.rewardedAdUnitId });
      const result = await UnityAds.showRewardedVideo();
      return result.success;
    } catch (error) {
      console.error('Failed to load/show Rewarded Ad:', error);
      return false;
    }
  }
}
