import { Component, AfterViewInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-social-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-sidebar.component.html',
  styleUrls: ['./social-sidebar.component.css']
})
export class SocialSidebarComponent implements AfterViewInit, OnDestroy {

  socialLinks = [
    {
      name: 'WhatsApp',
      url: 'https://wa.me/51939371250',
      iconClass: 'bg-[#25D366]/10 border-[#25D366]/20 hover:bg-[#25D366]',
      shadowClass: 'hover:shadow-[#25D366]/20',
      svgPath: 'M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.352 4.978L2 22l5.176-1.356a9.923 9.923 0 004.833 1.258h.005c5.505 0 9.988-4.478 9.99-9.984A9.99 9.99 0 0012.012 2zm5.733 14.174c-.234.659-1.358 1.258-1.87 1.309-.465.045-.927.241-2.98-.567-2.628-1.034-4.298-3.708-4.43-3.882-.132-.174-1.066-1.418-1.066-2.704 0-1.287.674-1.92.915-2.181.242-.261.528-.326.704-.326.176 0 .352.002.506.01.16.008.375-.061.587.45.22.529.749 1.83.815 1.961.066.131.11.283.022.46-.088.177-.132.287-.264.441-.132.155-.278.347-.396.463-.132.13-.27.272-.116.536.154.264.684 1.13 1.47 1.83.997.89 1.834 1.164 2.098 1.295.264.131.418.11.572-.066.154-.176.66-.767.836-1.029.176-.261.352-.218.594-.127.242.091 1.54.726 1.804.858.264.131.44.195.506.308.066.113.066.659-.168 1.318z'
    },
    {
      name: 'Facebook',
      url: 'https://facebook.com/insteip',
      iconClass: 'bg-[#1877F2]/10 border-[#1877F2]/20 hover:bg-[#1877F2]',
      shadowClass: 'hover:shadow-[#1877F2]/20',
      svgPath: 'M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z'
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/insteip',
      iconClass: 'bg-[#E1306C]/10 border-[#E1306C]/20 hover:bg-[#E1306C]',
      shadowClass: 'hover:shadow-[#E1306C]/20',
      svgPath: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z'
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com/insteip',
      iconClass: 'bg-[#FF0000]/10 border-[#FF0000]/20 hover:bg-[#FF0000]',
      shadowClass: 'hover:shadow-[#FF0000]/20',
      svgPath: 'M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'
    }
  ];

  private readonly HIDDEN_ROUTES = ['/login', '/dashboard'];
  private readonly SCROLL_THRESHOLD_RATIO = 0.08;
  private sidebarEl: HTMLElement | null = null;
  private listenerAttached = false;

  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {
    const path = window.location.pathname;
    if (this.HIDDEN_ROUTES.some(route => path.startsWith(route))) return;
    this.sidebarEl = this.elRef.nativeElement.querySelector('.sidebar-container');
    if (this.sidebarEl) {
      this.updateSidebarVisibility();
      this.attachScrollListener();
    }
  }

  ngOnDestroy(): void { this.listenerAttached = false; }

  private attachScrollListener(): void {
    if (this.listenerAttached) return;
    this.listenerAttached = true;
    window.addEventListener('scroll', () => { this.updateSidebarVisibility(); }, { passive: true });
  }

  private updateSidebarVisibility(): void {
    if (!this.sidebarEl) return;

    const scrollY = window.scrollY || window.pageYOffset;
    const scrollBottom = window.innerHeight + scrollY;
    const heroBottom = this.getHeroBottom();
    const footerTop = this.getFooterTop();

    const hideByHero = scrollBottom <= heroBottom;
    const hideByFooter = footerTop > 0 && scrollBottom >= footerTop - 60;

    if (hideByHero || hideByFooter) {
      this.sidebarEl.style.left = '-90px';
      this.sidebarEl.style.opacity = '0';
      this.sidebarEl.style.pointerEvents = 'none';
    } else {
      this.sidebarEl.style.left = '0';
      this.sidebarEl.style.opacity = '1';
      this.sidebarEl.style.pointerEvents = 'auto';
    }
  }

  private getHeroBottom(): number {
    const hero = document.querySelector('main > header, hero, .hero, .hero-section') as HTMLElement | null;
    if (hero) return hero.getBoundingClientRect().bottom + window.scrollY;
    return window.innerHeight;
  }

  private getFooterTop(): number {
    const footer = document.querySelector('footer, .site-footer, app-footer') as HTMLElement | null;
    if (footer) return footer.getBoundingClientRect().top + window.scrollY;
    return 0;
  }
}
