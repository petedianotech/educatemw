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
  private el = inject(ElementRef);
  
  readonly containerId = 'container-fd56cff2cd8ad5429da9d0309e1636b3';
  private scriptElement: HTMLScriptElement | null = null;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId) && !(window as any).Capacitor?.isNativePlatform) {
      this.loadAdsterra();
    }
  }

  private loadAdsterra() {
    try {
      this.scriptElement = document.createElement('script');
      this.scriptElement.type = 'text/javascript';
      this.scriptElement.async = true;
      this.scriptElement.setAttribute('data-cfasync', 'false');
      this.scriptElement.src = 'https://walkingdrunkard.com/fd56cff2cd8ad5429da9d0309e1636b3/invoke.js';
      
      this.el.nativeElement.appendChild(this.scriptElement);
    } catch (e) {
      console.warn('Adsterra failed to load', e);
    }
  }

  ngOnDestroy() {
    if (this.scriptElement && this.scriptElement.parentNode) {
      this.scriptElement.parentNode.removeChild(this.scriptElement);
    }
  }
}
