import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../core/components/footer/footer.component';

export interface CourseFeature {
  id: string;
  label: string;
  category: 'ONLINE' | 'PRESENCIAL';
  categoryLabel: string;
  duration: string;
  price: string;
  icon: string;
  image: string;
  description: string;
  route: string;
  rating: number;
  students: string;
}

@Component({
  selector: 'app-experiencia-academica-insteip',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './experiencia-academica-insteip.component.html',
  styleUrls: ['./experiencia-academica-insteip.component.css']
})
export class ExperienciaAcademicaInsteipComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private autoPlayTimer: any = null;

  step = 0;
  isPaused = false;
  readonly autoPlayInterval = 3500;
  readonly itemHeight = 65;
  filterMode: 'TODOS' | 'ONLINE' | 'PRESENCIAL' = 'TODOS';

  readonly allCourses: CourseFeature[] = [
    // ==========================================
    // 11 CURSOS ONLINE / VIRTUALES
    // ==========================================
    {
      id: 'acupuntura-china-online',
      label: 'Acupuntura China Online',
      category: 'ONLINE',
      categoryLabel: 'Online · Diplomado',
      duration: 'Campus Virtual 24/7',
      price: 'S/ 180/mes',
      icon: 'spa',
      image: 'assets/acupuntura_china_virtual.jpg',
      description: 'Formación profesional en medicina tradicional china, canales bioenergéticos, fisiopatología y tratamiento clínico integral.',
      route: '/cursos/acupuntura-china',
      rating: 4.9,
      students: '+1,200'
    },
    {
      id: 'auriculoterapia-online',
      label: 'Auriculoterapia Online',
      category: 'ONLINE',
      categoryLabel: 'Online · Curso Corto',
      duration: 'Acceso Virtual 24/7',
      price: 'S/ 150/mes',
      icon: 'hearing',
      image: 'assets/auriculoterapia_online.jpg',
      description: 'Diagnóstico, cartografía y estimulación reflexológica del pabellón auricular para equilibrar órganos y calmar dolor.',
      route: '/cursos/auriculoterapia',
      rating: 4.9,
      students: '+850'
    },
    {
      id: 'masaje-terapeutico-online',
      label: 'Masaje Terapéutico Online',
      category: 'ONLINE',
      categoryLabel: 'Online · Curso Corto',
      duration: 'Acceso Virtual 24/7',
      price: 'S/ 160/mes',
      icon: 'physical_therapy',
      image: 'assets/masaje_terapeutico_virtual.jpg',
      description: 'Técnicas manuales, liberación miofascial y protocolos terapéuticos orientados a la recuperación funcional y alivio muscular.',
      route: '/cursos/masaje-terapeutico',
      rating: 4.8,
      students: '+600'
    },
    {
      id: 'craneopuntura-online',
      label: 'Craneopuntura (100% Virtual)',
      category: 'ONLINE',
      categoryLabel: 'Online · Grabado',
      duration: '10 Horas Académicas',
      price: 'S/ 180 (Único)',
      icon: 'psychology',
      image: 'assets/CRANEO_CURSO.jpg',
      description: 'Taller 100% virtual dictado por el Lic. Lázaro Regalado Ponte. Mapeo de áreas corticales para rehabilitación neurológica.',
      route: '/cursos/craneopuntura-online',
      rating: 4.9,
      students: '+150'
    },
    {
      id: 'paralisis-facial-online',
      label: 'Parálisis Facial & Acupuntura',
      category: 'ONLINE',
      categoryLabel: 'Online · Taller Especializado',
      duration: '2 Horas Clínicas',
      price: 'S/ 120 (Único)',
      icon: 'face',
      image: 'assets/paralisis_virtual.jpg',
      description: 'Abordaje integral del nervio facial integrando electroacupuntura, reeducación neuromuscular y protocolos complementarios.',
      route: '/cursos/paralisis-facial-acupuntura-fisioterapia-online',
      rating: 4.9,
      students: '+180'
    },
    {
      id: 'control-peso-online',
      label: 'Acupuntura en Control de Peso',
      category: 'ONLINE',
      categoryLabel: 'Online · Seminario',
      duration: '8 Horas de Especialización',
      price: 'S/ 180 (Único)',
      icon: 'scale',
      image: 'assets/control_peso_online.jpg',
      description: 'Protocolos clínicos de auriculoterapia y acupuntura corporal para regular el apetito, metabolismo, sistema endocrino y ansiedad.',
      route: '/cursos/control-peso-auriculoterapia-acupuntura-online',
      rating: 4.9,
      students: '+240'
    },
    {
      id: 'acupuntura-estetica-online',
      label: 'Acupuntura Estética Facial',
      category: 'ONLINE',
      categoryLabel: 'Online · Taller Práctico',
      duration: '2 Horas Especializadas',
      price: 'S/ 90 (Único)',
      icon: 'auto_awesome',
      image: 'assets/acupuntura_estetica_virtual.jpg',
      description: 'Rejuvenecimiento natural, estimulación de colágeno y efecto lifting sin cirugía mediante microagujas bioenergéticas.',
      route: '/cursos/acupuntura-estetica-online',
      rating: 4.9,
      students: '+210'
    },
    {
      id: 'stretching-terapeutico-online',
      label: 'Stretching Terapéutico Online',
      category: 'ONLINE',
      categoryLabel: 'Online · Taller Práctico',
      duration: '2 Horas de Movilidad',
      price: 'S/ 90 (Único)',
      icon: 'accessibility_new',
      image: 'assets/stretching_online.jpg',
      description: 'Elongación profunda, reeducación postural y liberación de cadenas musculares para prevención de lesiones crónicas.',
      route: '/cursos/stretching-terapeutico-online',
      rating: 4.8,
      students: '+190'
    },
    {
      id: 'reflexologia-online',
      label: 'Curso de Reflexología',
      category: 'ONLINE',
      categoryLabel: 'Online · Curso Base',
      duration: '2 Horas de Formación',
      price: 'S/ 120 (Único)',
      icon: 'do_not_step',
      image: 'assets/reflexologia_online.jpg',
      description: 'Estimulación de mapas reflejos podales y manuales para activar los mecanismos de autorregulación y bienestar general.',
      route: '/cursos/reflexologia-online',
      rating: 4.8,
      students: '+160'
    },
    {
      id: 'seminario-reflexologia-online',
      label: 'Seminario Reflexología Podal',
      category: 'ONLINE',
      categoryLabel: 'Online · En Vivo',
      duration: 'Clases Magistrales en Vivo',
      price: 'S/ 150 (Único)',
      icon: 'health_and_safety',
      image: 'assets/seminario_reflexologia.jpg',
      description: 'Especialización clínica avanzada en zonas reflejas podales y su integración con los canales de energía de la Acupuntura.',
      route: '/cursos/seminario-reflexologia-online',
      rating: 4.9,
      students: '+120'
    },
    {
      id: 'aromaterapia-flores-bach-online',
      label: 'Aromaterapia y Flores de Bach',
      category: 'ONLINE',
      categoryLabel: 'Online · Clases en Vivo',
      duration: '1 Mes / En Vivo',
      price: 'S/ 120',
      icon: 'local_florist',
      image: 'assets/curso_aromaterapia_flores_bach.jpg',
      description: 'Aprende a integrar el poder de los aceites esenciales y las Flores de Bach en el abordaje holístico de la salud y el equilibrio emocional.',
      route: '/cursos/aromaterapia-flores-bach',
      rating: 5.0,
      students: '+180'
    },

    // ==========================================
    // 7 CURSOS PRESENCIALES
    // ==========================================
    {
      id: 'acupuntura-china-presencial-12m',
      label: 'Acupuntura China (12 meses)',
      category: 'PRESENCIAL',
      categoryLabel: 'Presencial · Diplomado',
      duration: '12 Meses Prácticos',
      price: 'S/ 270/mes',
      icon: 'adjust',
      image: 'assets/acupuntura_china_presencial.jpg',
      description: 'Nuestra formación presencial más completa: práctica clínica intensiva con pacientes reales, moxibustión y ventosas.',
      route: '/cursos/acupuntura-presencial',
      rating: 5.0,
      students: '+600'
    },
    {
      id: 'acupuntura-china-presencial-7m',
      label: 'Acupuntura China (7 meses)',
      category: 'PRESENCIAL',
      categoryLabel: 'Presencial · Intensivo',
      duration: '7 Meses Intensivos',
      price: 'S/ 150/mes',
      icon: 'medical_services',
      image: 'assets/acupuntura_7meses_presencial.jpg',
      description: 'Programa intensivo presencial para dominar los fundamentos de la Medicina Tradicional China y punción clínica.',
      route: '/cursos/acupuntura-china-7-meses',
      rating: 4.9,
      students: '+150'
    },
    {
      id: 'auriculoterapia-presencial',
      label: 'Auriculoterapia Presencial',
      category: 'PRESENCIAL',
      categoryLabel: 'Presencial · Práctico',
      duration: '2 Meses de Taller',
      price: 'S/ 260/mes',
      icon: 'hearing',
      image: 'assets/curso_auriculoterapia_presencial.jpg',
      description: 'Talleres clínicos vivenciales con colocación de semillas de vaccaria, balines de oro/plata y microagujas en modelos reales.',
      route: '/cursos/auriculoterapia-presencial',
      rating: 4.9,
      students: '+450'
    },
    {
      id: 'digitopresion-presencial',
      label: 'Digitopresión Mecánica',
      category: 'PRESENCIAL',
      categoryLabel: 'Presencial · Terapéutico',
      duration: '2 Meses Clínicos',
      price: 'S/ 260/mes',
      icon: 'touch_app',
      image: 'assets/digitopresion_presencial.jpg',
      description: 'Técnicas de presión digital en puntos Ashi y meridianos para descontracturar, desbloquear energía y aliviar dolor sin agujas.',
      route: '/cursos/digitopresion-presencial',
      rating: 4.9,
      students: '+320'
    },
    {
      id: 'dietetica-presencial',
      label: 'Dietética Terapéutica',
      category: 'PRESENCIAL',
      categoryLabel: 'Presencial · Especialidad',
      duration: '1 Mes Intensivo',
      price: 'S/ 250/mes',
      icon: 'restaurant',
      image: 'assets/curso_dietetica.jpg',
      description: 'Evaluación nutricional y diseño de planes terapéuticos personalizados según la naturaleza térmica de los alimentos de la MTC.',
      route: '/cursos/dietetica-presencial',
      rating: 4.8,
      students: '+210'
    },
    {
      id: 'fitoterapia-presencial',
      label: 'Fitoterapia Presencial',
      category: 'PRESENCIAL',
      categoryLabel: 'Presencial · Botánica Médica',
      duration: '1 Mes de Formación',
      price: 'S/ 250/mes',
      icon: 'local_pharmacy',
      image: 'assets/fitoterapia_insteip.jpg',
      description: 'Uso terapéutico y formulación de plantas medicinales andinas y amazónicas con base científica y seguridad clínica.',
      route: '/cursos/fitoterapia-presencial',
      rating: 4.9,
      students: '+180'
    },
    {
      id: 'aromaterapia-flores-bach-presencial',
      label: 'Aromaterapia Presencial',
      category: 'PRESENCIAL',
      categoryLabel: 'Presencial · Vivencial',
      duration: '1 Mes en Aula',
      price: 'S/ 200',
      icon: 'eco',
      image: 'assets/curso_aromaterapia_flores_bach.jpg',
      description: 'Taller vivencial en aula con formulación personalizada de esencias florales de Bach y aceites esenciales de grado terapéutico.',
      route: '/cursos/aromaterapia-flores-bach',
      rating: 5.0,
      students: '+160'
    }
  ];

  get currentCourses(): CourseFeature[] {
    if (this.filterMode === 'ONLINE') {
      return this.allCourses.filter(c => c.category === 'ONLINE');
    }
    if (this.filterMode === 'PRESENCIAL') {
      return this.allCourses.filter(c => c.category === 'PRESENCIAL');
    }
    return this.allCourses;
  }

  get currentIndex(): number {
    const len = this.currentCourses.length;
    if (len === 0) return 0;
    return ((this.step % len) + len) % len;
  }

  get activeCourse(): CourseFeature {
    return this.currentCourses[this.currentIndex] || this.allCourses[0];
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  setFilter(mode: 'TODOS' | 'ONLINE' | 'PRESENCIAL'): void {
    this.filterMode = mode;
    this.step = 0;
  }

  startAutoPlay(): void {
    this.stopAutoPlay();
    this.autoPlayTimer = setInterval(() => {
      if (!this.isPaused) {
        this.nextStep();
      }
    }, this.autoPlayInterval);
  }

  stopAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  nextStep(): void {
    this.step++;
  }

  prevStep(): void {
    this.step--;
  }

  handleChipClick(index: number): void {
    const len = this.currentCourses.length;
    if (len === 0) return;
    const diff = (index - this.currentIndex + len) % len;
    if (diff > 0) {
      this.step += diff;
    }
  }

  setIsPaused(paused: boolean): void {
    this.isPaused = paused;
  }

  wrap(min: number, max: number, v: number): number {
    const rangeSize = max - min;
    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
  }

  getWrappedDistance(index: number): number {
    const len = this.currentCourses.length;
    const distance = index - this.currentIndex;
    return this.wrap(-(len / 2), len / 2, distance);
  }

  getChipTransform(index: number): string {
    const wrappedDistance = this.getWrappedDistance(index);
    const y = wrappedDistance * this.itemHeight;
    return `translateY(${y}px)`;
  }

  getChipOpacity(index: number): number {
    const wrappedDistance = this.getWrappedDistance(index);
    const opacity = 1 - Math.abs(wrappedDistance) * 0.22;
    return Math.max(0, Math.min(1, opacity));
  }

  getCardStatus(index: number): 'active' | 'prev' | 'next' | 'hidden' {
    const diff = index - this.currentIndex;
    const len = this.currentCourses.length;

    let normalizedDiff = diff;
    if (diff > len / 2) normalizedDiff -= len;
    if (diff < -len / 2) normalizedDiff += len;

    if (normalizedDiff === 0) return 'active';
    if (normalizedDiff === -1) return 'prev';
    if (normalizedDiff === 1) return 'next';
    return 'hidden';
  }

  getCardTransform(index: number): string {
    const status = this.getCardStatus(index);
    if (status === 'active') {
      return 'translateX(0px) scale(1) rotate(0deg)';
    }
    if (status === 'prev') {
      return 'translateX(-90px) scale(0.85) rotate(-3.5deg)';
    }
    if (status === 'next') {
      return 'translateX(90px) scale(0.85) rotate(3.5deg)';
    }
    return 'translateX(0px) scale(0.7) rotate(0deg)';
  }

  getCardOpacity(index: number): number {
    const status = this.getCardStatus(index);
    if (status === 'active') return 1;
    if (status === 'prev' || status === 'next') return 0.42;
    return 0;
  }

  getCardZIndex(index: number): number {
    const status = this.getCardStatus(index);
    if (status === 'active') return 30;
    if (status === 'prev' || status === 'next') return 15;
    return 0;
  }
}
