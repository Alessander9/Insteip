import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private router = inject(Router);
  private initialized = false;
  private readonly GA_MEASUREMENT_ID = 'G-INSTEIP2026'; // ID de medición GA4 de INSTEIP

  constructor() {
    this.trackNavigation();
  }

  /**
   * Inicializa GA4 si el usuario ha otorgado su consentimiento de cookies
   */
  initIfConsented(): void {
    if (this.initialized || typeof window === 'undefined') return;

    const consent = localStorage.getItem('insteip_cookie_consent');
    if (consent === 'accepted') {
      this.loadGoogleAnalyticsScript();
      this.initialized = true;
    }
  }

  private loadGoogleAnalyticsScript(): void {
    if (document.getElementById('ga-script')) return;

    const script = document.createElement('script');
    script.id = 'ga-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', this.GA_MEASUREMENT_ID, {
      send_page_view: false,
      anonymize_ip: true
    });
  }

  private trackNavigation(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.initIfConsented();
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'page_view', {
            page_path: event.urlAfterRedirects,
            page_title: document.title
          });
        }
      });
  }

  /**
   * Dispara un evento personalizado de conversión en GA4
   */
  trackEvent(eventName: string, params: Record<string, any> = {}): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params);
    }
  }
}
