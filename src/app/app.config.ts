import {
  ApplicationConfig,
  ErrorHandler,
  isDevMode,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideServiceWorker} from '@angular/service-worker';
import {GlobalErrorHandler} from './core/error-handler';
import {ErrorToastComponent} from './shared/components/error-toast/error-toast.component';

import { provideHttpClient } from '@angular/common/http';
import {routes} from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), 
    provideRouter(routes),
    provideHttpClient(),
    ErrorToastComponent,
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
};
