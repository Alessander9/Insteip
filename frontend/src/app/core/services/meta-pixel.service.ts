import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../../../environments/environment';

declare let fbq: any;

@Injectable({
  providedIn: 'root'
})
export class MetaPixelService {
  private pixelId = (environment as any).metaPixelId || '';
  private initialized = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * Inicializa el Meta Pixel con el ID configurado
   */
  public init(customPixelId?: string): void {
    if (!isPlatformBrowser(this.platformId) || this.initialized) {
      return;
    }

    const id = customPixelId || this.pixelId;
    if (!id || id === 'TU_PIXEL_ID') {
      console.warn('⚠️ [MetaPixelService] Meta Pixel ID no configurado.');
      return;
    }

    this.pixelId = id;
    this.injectPixelScript(this.pixelId);
    this.initialized = true;

    // Rastrear PageView en cada cambio de ruta en la SPA
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.trackPageView(event.urlAfterRedirects || event.url);
    });

    // Auto-detección global de clics en WhatsApp para registrar Leads
    this.initWhatsAppClickTracking();
  }

  /**
   * Rastrear PageView en navegación
   */
  public trackPageView(url?: string): void {
    if (this.isFbqAvailable()) {
      fbq('track', 'PageView', {
        page_path: url || window.location.pathname
      });
    }
  }

  /**
   * Rastrear un evento estándar de Lead (ej. clic en WhatsApp o formulario)
   */
  public trackLead(data?: { content_name?: string; content_category?: string; value?: number; currency?: string }): void {
    if (this.isFbqAvailable()) {
      fbq('track', 'Lead', {
        currency: 'PEN',
        ...data
      });
    }
  }

  /**
   * Rastrear evento Contact
   */
  public trackContact(channel: string = 'WhatsApp'): void {
    if (this.isFbqAvailable()) {
      fbq('track', 'Contact', {
        channel: channel
      });
    }
  }

  /**
   * Rastrear cuando ven el contenido o ficha de un curso específico
   */
  public trackViewContent(contentName: string, category: string = 'Curso', value?: number): void {
    if (this.isFbqAvailable()) {
      fbq('track', 'ViewContent', {
        content_name: contentName,
        content_category: category,
        value: value,
        currency: 'PEN'
      });
    }
  }

  /**
   * Rastrear evento personalizado
   */
  public trackCustom(eventName: string, data?: Record<string, any>): void {
    if (this.isFbqAvailable()) {
      fbq('trackCustom', eventName, data);
    }
  }

  private isFbqAvailable(): boolean {
    return isPlatformBrowser(this.platformId) && typeof fbq === 'function';
  }

  private injectPixelScript(pixelId: string): void {
    if (typeof window === 'undefined') return;

    /* Base Meta Pixel Code */
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    fbq('init', pixelId);
    fbq('track', 'PageView');
  }

  /**
   * Escucha global para registrar Lead cada vez que un usuario hace clic en un enlace de WhatsApp
   */
  private initWhatsAppClickTracking(): void {
    if (typeof document === 'undefined') return;

    document.addEventListener('click', (event: MouseEvent) => {
      const target = (event.target as HTMLElement)?.closest('a');
      if (target && target.href) {
        if (target.href.includes('wa.me') || target.href.includes('whatsapp.com')) {
          this.trackLead({
            content_name: 'WhatsApp Contact',
            content_category: 'Admissions'
          });
          this.trackContact('WhatsApp');
        }
      }
    }, true);
  }
}
