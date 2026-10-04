import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SocialSidebarComponent } from './core/components/social-sidebar/social-sidebar.component';
import { ToastComponent } from './core/components/toast/toast.component';
import { ScrollToTopComponent } from './core/components/scroll-to-top/scroll-to-top.component';
import { ChatbotWidgetComponent } from './core/components/chatbot-widget/chatbot-widget.component';
import { CookieBannerComponent } from './core/components/cookie-banner/cookie-banner.component';
import { ThemeService, SeoService } from './core/services/';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SocialSidebarComponent, ToastComponent, ScrollToTopComponent, ChatbotWidgetComponent, CookieBannerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'INSTEIP - Aula Virtual';
  private themeService = inject(ThemeService);
  private seoService = inject(SeoService);

  ngOnInit(): void {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      try {
        localStorage.removeItem('insteip-theme');
        localStorage.setItem('insteip-theme', 'light');
      } catch (e) {}
    }
  }
}
