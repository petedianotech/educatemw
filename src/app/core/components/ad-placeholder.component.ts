import { Component, Input, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-ad-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (hasAdKey && isBrowser) {
      <div class="w-full flex justify-center my-4 overflow-hidden relative"
           [ngClass]="{
             'min-h-[50px]': size === '320x50',
             'min-h-[250px] max-w-[300px] mx-auto': size === '300x250',
             'min-h-[90px]': size === '728x90',
             'min-h-[120px]': type === 'native-banner' && !size
           }">
        <iframe 
          [src]="adUrl" 
          [style.max-width.px]="width"
          [style.width.%]="100" 
          [style.height.px]="height" 
          frameborder="0" 
          scrolling="no"
          class="mx-auto block"
          allow="scripts; popups; forms; same-origin">
        </iframe>
      </div>
    }
  `
})
export class AdPlaceholderComponent implements OnInit {
  @Input() type: 'banner' | 'native-banner' | string = 'banner';
  @Input() size?: '320x50' | '300x250' | '728x90' | string = '300x250';
  
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  
  isBrowser = isPlatformBrowser(this.platformId);
  hasAdKey = false;
  adUrl!: SafeResourceUrl;
  
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
    if (!this.isBrowser) return;

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
