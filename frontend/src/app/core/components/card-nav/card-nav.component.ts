import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { gsap } from 'gsap';
import { ThemeService } from '../../services/theme.service';

interface NavLink {
  label: string;
  route: string;
  ariaLabel: string;
  description: string;
  icon: string;
}

interface NavItem {
  label: string;
  route?: string;
  bgColor: string;
  textColor: string;
  links: NavLink[];
}

@Component({
  selector: 'app-card-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './card-nav.component.html',
  styleUrls: ['./card-nav.component.css']
})
export class CardNavComponent implements OnInit, OnDestroy {
  @ViewChild('navbarRef') navbarRef!: ElementRef<HTMLElement>;

  themeService = inject(ThemeService);

  activeDropdown: number | null = null;
  isMobileMenuOpen = false;
  activeMobileDropdown: number | null = null;

  private tl: gsap.core.Timeline | null = null;
  private hideTimeout: any = null;

  readonly navItems: NavItem[] = [
    {
      label: 'Inicio',
      route: '/inicio',
      bgColor: '#1e293b',
      textColor: '#fff',
      links: []
    },
    {
      label: 'Cursos Online',
      bgColor: '#1e293b',
      textColor: '#fff',
      links: [
        { label: 'Acupuntura China', route: '/cursos/acupuntura-china', ariaLabel: 'Curso de Acupuntura China', description: 'Formación profesional en medicina tradicional', icon: 'spa' },
        { label: 'Auriculoterapia', route: '/cursos/auriculoterapia', ariaLabel: 'Curso de Auriculoterapia', description: 'Diagnóstico y estímulo del pabellón auricular', icon: 'hearing' },
        { label: 'Masaje Terapéutico', route: '/cursos/masaje-terapeutico', ariaLabel: 'Curso de Masaje Terapéutico', description: 'Técnicas manuales para la salud y bienestar', icon: 'physical_therapy' }
      ]
    },
    {
      label: 'Todos los cursos',
      route: '/TodosLosCursos.html',
      bgColor: '#1e293b',
      textColor: '#fff',
      links: []
    },
    {
      label: 'Por qué elegirnos',
      route: '/por-que-elegirnos',
      bgColor: '#1e293b',
      textColor: '#fff',
      links: []
    },
    {
      label: 'Cómo aprenderás',
      route: '/como-aprenderas',
      bgColor: '#1e293b',
      textColor: '#fff',
      links: []
    }
  ];

  ngOnInit(): void {
    document.addEventListener('click', this.onDocumentClick);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocumentClick);
    this.tl?.kill();
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'; // Prevent scrolling when open
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  toggleMobileDropdown(index: number): void {
    if (this.activeMobileDropdown === index) {
      this.activeMobileDropdown = null;
    } else {
      this.activeMobileDropdown = index;
    }
  }

  private onDocumentClick = (e: MouseEvent): void => {
    const target = e.target as HTMLElement;
    if (!this.navbarRef?.nativeElement.contains(target)) {
      this.hideDropdown();
    }
  };

  showDropdown(index: number): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    if (this.activeDropdown === index) return;

    // Hide previous dropdown first
    if (this.activeDropdown !== null) {
      this.tl?.kill();
      const prevCard = this.navbarRef?.nativeElement.querySelector(`.dropdown-card[data-index="${this.activeDropdown}"]`);
      if (prevCard) {
        gsap.set(prevCard, { display: 'none' });
      }
    }

    this.activeDropdown = index;
    const card = this.navbarRef?.nativeElement.querySelector(`.dropdown-card[data-index="${index}"]`) as HTMLElement;
    if (!card) return;

    gsap.set(card, { display: 'flex', y: -10, opacity: 0 });
    this.tl = gsap.timeline();
    this.tl.to(card, { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out' });
  }

  hideDropdown(): void {
    if (this.activeDropdown === null) return;

    const card = this.navbarRef?.nativeElement.querySelector(`.dropdown-card[data-index="${this.activeDropdown}"]`) as HTMLElement;
    if (card) {
      this.tl?.kill();
      this.tl = gsap.timeline();
      this.tl.to(card, {
        y: -10, opacity: 0, duration: 0.2, ease: 'power2.in',
        onComplete: () => {
          gsap.set(card, { display: 'none' });
          this.activeDropdown = null;
        }
      });
    } else {
      this.activeDropdown = null;
    }
  }

  scheduleHide(): void {
    this.hideTimeout = setTimeout(() => this.hideDropdown(), 200);
  }

  cancelHide(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  hasActiveRoute(item: NavItem): boolean {
    const path = window.location.pathname;
    if (item.route && path === item.route) {
      return true;
    }
    if (item.links && item.links.length > 0) {
      return item.links.some(l => path.startsWith(l.route));
    }
    return false;
  }

  getLogoSrc(): string {
    return 'assets/insteip-logo.png';
  }
}
