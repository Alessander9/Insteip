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
    this.verificarConsentimiento();
  }

  private verificarConsentimiento(): void {
    try {
      const consent = typeof localStorage !== 'undefined' ? localStorage.getItem(this.STORAGE_KEY) : null;
      if (!consent) {
        this.mostrarBanner = true;
        this.cdr.detectChanges();
      }
    } catch (e) {
      this.mostrarBanner = true;
      this.cdr.detectChanges();
    }
  }

  aceptarTodas(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, 'accepted');
    } catch (e) {}
    this.analytics.initIfConsented();
    this.mostrarBanner = false;
    this.cdr.detectChanges();
  }

  aceptarNecesarias(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, 'necessary_only');
    } catch (e) {}
    this.mostrarBanner = false;
    this.cdr.detectChanges();
  }
}

