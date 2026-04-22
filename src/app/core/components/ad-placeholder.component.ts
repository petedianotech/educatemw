import { Component, Input, OnInit, PLATFORM_ID, inject, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Capacitor } from '@capacitor/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-ad-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (hasAdKey && isBrowser && !isNative && !isPro()) {
      <div class="w-full flex flex-col justify-center my-6 relative bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-white/5 overflow-hidden transition-colors"
           [ngClass]="{
             'min-h-[50px]': size === '320x50',
             'min-h-[250px] max-w-[300px] mx-auto': size === '300x250',
             'min-h-[90px]': size === '728x90',
             'min-h-[140px]': type === 'native-banner' && !size
           }">
        <!-- Sponsored Tag -->
        <div class="flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-white/5">
          <span class="text-[9px] font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">Sponsored</span>
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-500/50"></span>
        </div>
        
        <div class="relative w-full h-full flex justify-center bg-slate-50/50 dark:bg-slate-950/20 pt-2 pb-2">
          <!-- Loading placeholder -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50 z-0">
             <div class="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
          
          <iframe 
            [src]="adUrl" 
            [style.max-width.px]="width"
            [style.width.%]="100" 
            [style.height.px]="height" 
            frameborder="0" 
            scrolling="no"
            class="mx-auto block relative z-10"
            allow="scripts; popups; forms; same-origin">
          </iframe>
        </div>
      </div>
    }
  `
})
export class AdPlaceholderComponent implements OnInit {
  @Input() type: 'banner' | 'native-banner' | string = 'banner';
  @Input() size?: '320x50' | '300x250' | '728x90' | string = '300x250';
  
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);
  
  isBrowser = isPlatformBrowser(this.platformId);
  isNative = Capacitor.isNativePlatform();
  hasAdKey = false;
  adUrl!: SafeResourceUrl;
  
  isPro = computed(() => !!this.authService.currentUser()?.isPro || this.authService.currentUser()?.role === 'admin');
  
  width = 300;
  height = 250;

  // 💡 ADD YOUR UPCOMING ADSTERRA KEYS HERE!
  private adKeys: Record<string, string> = {
    '728x90': '86b503ad43fca91d6a61010207369dde', // Configured from your request
    '320x50': 'PASTE_KEY_HERE',
    '300x250': 'PASTE_KEY_HERE',
    'native-banner': 'fd56cff2cd8ad5429da9d0309e1636b3'
  };

  ngOnInit() {
    // If we're on the server OR in native APK OR user is pro, do absolutely nothing with Adsterra
    if (!this.isBrowser || this.isNative || this.isPro()) return;

    if (this.size) {
       const dims = this.size.split('x');
       if (dims.length === 2) {
         this.width = parseInt(dims[0], 10);
         this.height = parseInt(dims[1], 10);
       }
    }
    
    // Check if the current format has a registered key
    const lookupKey = this.type === 'native-banner' ? 'native-banner' : (this.size || '');
    const activeKey = this.adKeys[lookupKey];
    
    if (activeKey && !activeKey.includes('PASTE_KEY')) {
      this.hasAdKey = true;
      const url = window.location.origin + '/ad.html?key=' + activeKey + '&type=' + this.type + '&w=' + this.width + '&h=' + this.height;
      this.adUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }
}
