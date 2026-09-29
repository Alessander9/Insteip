import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.css']
})
export class CookieBannerComponent implements OnInit {
  private analytics = inject(AnalyticsService);

  private cdr = inject(ChangeDetectorRef);
  mostrarBanner = false;
  private readonly STORAGE_KEY = 'insteip_cookie_consent';

  ngOnInit(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const consent = localStorage.getItem(this.STORAGE_KEY);
      if (!consent) {
        setTimeout(() => {
          this.mostrarBanner = true;
          this.cdr.markForCheck();
        }, 300);
      }
    }
  }

  aceptarTodas(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, 'accepted');
    }
    this.analytics.initIfConsented();
    this.mostrarBanner = false;
  }

  aceptarNecesarias(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, 'necessary_only');
    }
    this.mostrarBanner = false;
  }
}

