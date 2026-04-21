import { Component, ElementRef, OnInit, inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-web-ad',
  standalone: true,
  template: `
    <div class="w-full flex flex-col items-center justify-center my-6">
      <p class="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">Sponsored Educational Content</p>
      <div [id]="containerId" class="min-h-[100px] w-full flex justify-center bg-slate-50/50 rounded-2xl overflow-hidden border border-slate-100/50">
        <!-- Adsterra Container -->
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class WebAdComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  
  readonly containerId = 'container-fd56cff2cd8ad5429da9d0309e1636b3';
  private iframeElement: HTMLIFrameElement | null = null;
  private el = inject(ElementRef);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId) && !(window as any).Capacitor?.isNativePlatform) {
      // Small delay ensures Angular has rendered the DOM elements completely
      setTimeout(() => {
        this.loadAdsterra();
      }, 300);
    }
  }

  private loadAdsterra() {
    try {
      // Adsterra scripts search for "container-[id]". Because angular might reuse elements
      // or we might mount multiple instances, using an iframe ensures 100% isolation 
      // without breaking the parent DOM.
      
      const containerPath = this.el.nativeElement.querySelector(`#${this.containerId}`);
      if (!containerPath) return;

      this.iframeElement = document.createElement('iframe');
      this.iframeElement.style.border = 'none';
      this.iframeElement.style.width = '100%';
      this.iframeElement.style.height = '100%';
      this.iframeElement.style.overflow = 'hidden';
      // Allows responsive sizes (like 300x250 or native banner scaling)
      this.iframeElement.style.minHeight = '100px'; 
      this.iframeElement.scrolling = 'no';
      
      containerPath.appendChild(this.iframeElement);

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
             body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; }
            </style>
          </head>
          <body>
            <div id="${this.containerId}"></div>
            <script async="async" data-cfasync="false" src="https://walkingdrunkard.com/fd56cff2cd8ad5429da9d0309e1636b3/invoke.js"></scr` + `ipt>
          </body>
        </html>
      `;
      
      const doc = this.iframeElement.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    } catch (e) {
      console.warn('Adsterra failed to load', e);
    }
  }

  ngOnDestroy() {
    if (this.iframeElement && this.iframeElement.parentNode) {
      this.iframeElement.parentNode.removeChild(this.iframeElement);
    }
  }
}
