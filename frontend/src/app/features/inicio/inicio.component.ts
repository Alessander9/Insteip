import { Component, OnInit, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../core/components/footer/footer.component';

interface Slide {
  pill?: string;
  pillIcon?: string;
  headline: string;
  headlineHighlights?: { text: string; color: string }[];
  description: string;
  cta?: { text: string; link: string; primary?: boolean }[];
  image?: string;
  imageLabel?: string;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, RouterLink],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit, OnDestroy, AfterViewInit {
  currentSlide = 0;
  private intervalId: any;

  slides: Slide[] = [
    {
      pill: 'INSTEIP — Instituto de Terapias Integrales',
      pillIcon: 'school',
      headline: '+30 CURSOS ONLINE DE TERAPIAS COMPLEMENTARIAS CON CERTIFICACIÓN INTERNACIONAL',
      description: 'Más de 5,000 terapeutas ya obtuvieron su certificación internacional. Estudia desde casa y transforma tu carrera profesional.',
      cta: [
        { text: 'Explorar Cursos', link: '/cursos', primary: true },
        { text: 'Iniciar Sesión', link: '/login', primary: false }
      ],
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
      imageLabel: 'LÁMINA 01 / ECOESFERA DE ESTUDIOS'
    },
    {
      pill: 'Formaciones Especializadas',
      pillIcon: 'local_hospital',
      headline: 'ACUPUNTURA · AURICULOTERAPIA · MASAJE TERAPÉUTICO',
      description: 'Programas completos diseñados por profesionales con más de 15 años de experiencia. Aprende técnicas ancestrales y modernas.',
      cta: [
        { text: 'Ver Programas', link: '/programas', primary: true },
        { text: 'Acupuntura', link: '/cursos/acupuntura-china', primary: false }
      ],
      image: 'https://images.unsplash.com/photo-1600335895229-6e75511892c8?auto=format&fit=crop&w=800&q=80',
      imageLabel: 'LÁMINA 02 / PRÁCTICA CLÍNICA'
    },
    {
      pill: 'Certificación y Respaldo',
      pillIcon: 'workspace_premium',
      headline: 'CERTIFICACIÓN INTERNACIONAL VERIFICABLE',
      description: 'Obtén un certificado digital con respaldo internacional, verificable en LinkedIn y respaldado por Global Therapy Alliance.',
      cta: [
        { text: 'Más Información', link: '/certificacion', primary: true },
        { text: 'Validar Certificado', link: '/certificados/validar', primary: false }
      ],
      image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80',
      imageLabel: 'LÁMINA 03 / ACREDITACIÓN GLOBAL'
    },
    {
      pill: 'Comunidad INSTEIP',
      pillIcon: 'diversity_3',
      headline: '+5,000 TERAPEUTAS YA CONFÍAN EN NOSOTROS',
      description: 'Únete a una comunidad de profesionales que transforman vidas a través de las terapias complementarias. 100% online, 100% flexible.',
      cta: [
        { text: 'Comenzar Ahora', link: '/cursos', primary: true },
        { text: 'Saber Más', link: '/por-que-elegirnos', primary: false }
      ],
      image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80',
      imageLabel: 'LÁMINA 04 / CONEXIÓN COMUNITARIA'
    }
  ];

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.resetAutoPlay();
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.resetAutoPlay();
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.resetAutoPlay();
  }

  private startAutoPlay(): void {
    this.intervalId = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    }, 6000);
  }

  private stopAutoPlay(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private resetAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      });

      const items = document.querySelectorAll('.timeline-item');
      items.forEach(item => observer.observe(item));
    }
  }
}
