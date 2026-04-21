import { Component, Input, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-ad-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full flex items-center justify-center my-4 overflow-hidden relative"
         [ngClass]="{
           'border-2 border-dashed border-slate-300 bg-slate-100 p-4 rounded-xl': !hasAdKey,
           'min-h-[50px]': size === '320x50',
           'min-h-[250px] max-w-[300px] mx-auto': size === '300x250',
           'min-h-[90px]': size === '728x90',
           'min-h-[120px]': type === 'native-banner' && !size
         }">
         
      @if (hasAdKey && isBrowser) {
        <iframe 
          [attr.srcdoc]="adSrcDoc" 
          [style.max-width.px]="width"
          [style.width.%]="100" 
          [style.height.px]="height" 
          frameborder="0" 
          scrolling="no"
          class="mx-auto rounded-lg"
          sandbox="allow-scripts allow-popups allow-forms allow-same-origin allow-top-navigation-by-user-activation">
        </iframe>
      } @else {
        <div class="absolute top-0 right-0 bg-slate-200 text-slate-500 text-[9px] px-1.5 py-0.5 rounded-bl-lg font-bold uppercase tracking-wider">
          Ad Placeholder
        </div>
        <div class="text-center opacity-80">
          <span class="text-sm font-black text-slate-600 block bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-200">
            Adsterra {{type === 'native-banner' ? 'Native Banner' : (size + ' Banner')}}
          </span>
          <p class="text-xs text-slate-400 mt-2 font-medium">Recommended spot for High eCPM</p>
        </div>
      }
    </div>
  `
})
export class AdPlaceholderComponent implements OnInit {
  @Input() type: 'banner' | 'native-banner' | string = 'banner';
  @Input() size?: '320x50' | '300x250' | '728x90' | string = '300x250';
  
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  
  isBrowser = isPlatformBrowser(this.platformId);
  hasAdKey = false;
  adSrcDoc!: SafeHtml;
  
  width = 300;
  height = 250;

  // 💡 ADD YOUR UPCOMING ADSTERRA KEYS HERE!
  private adKeys: Record<string, string> = {
    '728x90': '86b503ad43fca91d6a61010207369dde', // Configured from your request
    '320x50': 'PASTE_KEY_HERE',
    '300x250': 'PASTE_KEY_HERE',
    'native-banner': 'PASTE_KEY_HERE'
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
      this.setupAdIframe(activeKey);
    }
  }

  setupAdIframe(key: string) {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body, html { 
            margin: 0; padding: 0; 
            width: 100%; height: 100%; 
            overflow: hidden; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            background: transparent; 
          }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : '${key}',
            'format' : 'iframe',
            'height' : ${this.height},
            'width' : ${this.width},
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://walkingdrunkard.com/${key}/invoke.js"></script>
      </body>
      </html>
    `;
    
    this.adSrcDoc = this.sanitizer.bypassSecurityTrustHtml(htmlContent);
  }
}
