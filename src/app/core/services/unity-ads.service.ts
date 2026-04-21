import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Capacitor } from '@capacitor/core';
import { UnityAds } from 'capacitor-unity-ads';

@Injectable({
  providedIn: 'root'
})
export class UnityAdsService {
  private platformId = inject(PLATFORM_ID);
  public isReady = false;

  // Real Unity Game IDs assigned by User
  private gameId = Capacitor.getPlatform() === 'ios' ? '6096322' : '6096323';
  
  // Real Unit IDs configured by User in Unity Dashboard
  private interstitialAdUnitId = Capacitor.getPlatform() === 'ios' ? 'Interstitial_iOS' : 'Interstitial_Android';
  private rewardedAdUnitId = Capacitor.getPlatform() === 'ios' ? 'Rewarded_iOS' : 'Rewarded_Android';
  private bannerAdUnitId = Capacitor.getPlatform() === 'ios' ? 'Banner_iOS' : 'Banner_Android';

  constructor() {
    this.initialize();
  }

  async initialize() {
    if (isPlatformBrowser(this.platformId) && Capacitor.isNativePlatform()) {
      try {
        await UnityAds.initialize({
          gameId: this.gameId,
          testMode: true // TEST MODE ENABLED so you can safely verify build on Codemagic!
        });
        
        console.log('Unity Ads Initialized Successfully for Platform:', Capacitor.getPlatform());
        this.isReady = true;
      } catch (error) {
        console.error('Failed to initialize Unity Ads:', error);
      }
    }
  }

  async showInterstitial() {
    if (!this.isReady || !Capacitor.isNativePlatform()) return;
    try {
      await UnityAds.loadInterstitial({ placementId: this.interstitialAdUnitId });
      // In a real implementation you'd listen to interstitialLoaded event before showing, 
      // but showing immediately might work if it caches or waits
      await UnityAds.showInterstitial();
    } catch (error) {
      console.error('Failed to load/show Interstitial Ad:', error);
    }
  }

  async showRewarded() {
    if (!this.isReady || !Capacitor.isNativePlatform()) return;
    try {
      await UnityAds.loadRewardedVideo({ placementId: this.rewardedAdUnitId });
      await UnityAds.showRewardedVideo();
    } catch (error) {
      console.error('Failed to load/show Rewarded Ad:', error);
    }
  }
}
