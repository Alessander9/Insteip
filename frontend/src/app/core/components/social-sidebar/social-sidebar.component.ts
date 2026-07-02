import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-social-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-sidebar.component.html',
  styleUrls: ['./social-sidebar.component.css']
})
export class SocialSidebarComponent implements OnInit, OnDestroy {

  /** Rutas en las que el sidebar NO debe mostrarse */
  private readonly HIDDEN_ROUTES = ['/login', '/dashboard'];

  isVisible = false;
  private routerSub!: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Evaluar la ruta actual al iniciar
    this.updateVisibility(this.router.url);

    // Escuchar cada cambio de ruta
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateVisibility(event.urlAfterRedirects);
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private updateVisibility(url: string): void {
    // Ocultar si la URL comienza con alguna ruta restringida
    const cleanUrl = url.split('?')[0].split('#')[0];
    this.isVisible = !this.HIDDEN_ROUTES.some(route => cleanUrl.startsWith(route));
  }

  socialLinks = [
    {
      name: 'Facebook',
      url: 'https://facebook.com/insteip',
      iconClass: 'bg-[#1877f2]/10 border-[#1877f2]/20 hover:bg-[#1877f2]',
      shadowClass: 'shadow-[#1877f2]/10',
      svgPath: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/insteip',
      iconClass: 'bg-[#e4405f]/10 border-[#e4405f]/20 hover:bg-gradient-to-tr hover:from-[#fd5949] hover:to-[#d6249f]',
      shadowClass: 'shadow-[#e4405f]/10',
      svgPath: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z'
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com/insteip',
      iconClass: 'bg-[#ff0000]/10 border-[#ff0000]/20 hover:bg-[#ff0000]',
      shadowClass: 'shadow-[#ff0000]/10',
      svgPath: 'M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.522 3.5 12 3.5 12 3.5s-7.522 0-9.388.556a3.002 3.002 0 0 0-2.11 2.107C0 8.028 0 12 0 12s0 3.972.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.478 20.5 12 20.5 12 20.5s7.522 0 9.388-.556a3.002 3.002 0 0 0 2.11-2.107C24 15.972 24 12 24 12s0-3.972-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/company/insteip',
      iconClass: 'bg-[#0077b5]/10 border-[#0077b5]/20 hover:bg-[#0077b5]',
      shadowClass: 'shadow-[#0077b5]/10',
      svgPath: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z'
    },
    {
      name: 'WhatsApp',
      url: 'https://wa.me/51984256712?text=Hola,%20quisiera%20saber%20más%20información%20sobre%20los%20cursos%20de%20INSTEIP',
      iconClass: 'bg-[#25d366]/10 border-[#25d366]/20 hover:bg-[#25d366]',
      shadowClass: 'shadow-[#25d366]/10',
      svgPath: 'M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.781-1.447L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.859-4.42 9.863-9.864.002-2.637-1.017-5.114-2.872-6.972-1.857-1.859-4.331-2.88-6.969-2.881-5.445 0-9.871 4.42-9.875 9.865-.001 1.75.466 3.454 1.353 4.965l-.982 3.588 3.659-.952zm11.233-7.067c-.29-.145-1.72-.848-1.986-.944-.266-.096-.46-.145-.653.145-.193.29-.747.944-.916 1.137-.168.193-.337.218-.627.072-.29-.145-1.225-.452-2.333-1.44-.863-.77-1.446-1.72-1.616-2.011-.17-.29-.018-.447.127-.591.13-.13.29-.338.435-.507.145-.169.193-.29.29-.483.097-.193.048-.362-.024-.507-.072-.145-.653-1.573-.895-2.152-.236-.569-.475-.492-.653-.501-.17-.008-.363-.01-.556-.01-.193 0-.507.072-.772.362-.266.29-1.014.99-1.014 2.415 0 1.425 1.038 2.801 1.183 2.995.145.193 2.043 3.12 4.949 4.377.691.299 1.23.478 1.65.612.695.221 1.328.19 1.828.115.556-.084 1.72-.702 1.962-1.381.242-.678.242-1.258.17-1.381-.072-.123-.266-.193-.556-.338z'
    }
  ];
}


