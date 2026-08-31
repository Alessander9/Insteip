import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../../core/components/footer/footer.component';
import { CourseSyllabusComponent, SyllabusPhase } from '../../../shared/components/course-syllabus/course-syllabus.component';
import { DocenteSectionComponent, DocenteData } from '../../../shared/components/docente-section/docente-section.component';
import { CourseCtaComponent, CourseCtaData } from '../../../shared/components/course-cta/course-cta.component';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-acupuntura-china',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    CourseSyllabusComponent,
    DocenteSectionComponent,
    CourseCtaComponent
  ],
  templateUrl: './acupuntura-china.component.html',
  styleUrls: ['./acupuntura-china.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AcupunturaChinaComponent implements OnInit, AfterViewInit, OnDestroy {
  private animationContext?: gsap.Context;
  activeBenefitIndex = 0;
  showBenefitLightbox = false;
  benefitLightboxImage = '';
  activeJourneyStep = 0;
  private autoplayInterval?: ReturnType<typeof setInterval>;

  readonly journeySteps = [
    {
      shortTitle: 'Fundamentos',
      period: 'Meses 1 al 3',
      icon: 'neurology',
      title: 'Comprende el mapa energético del cuerpo',
      description: 'Construye una base clara en medicina tradicional china, anatomía energética y localización de puntos.',
      outcomes: ['Canales y meridianos', 'Teoría de los cinco elementos', 'Evaluación energética inicial']
    },
    {
      shortTitle: 'Técnica',
      period: 'Meses 4 al 8',
      icon: 'medical_services',
      title: 'Desarrolla precisión técnica y criterio clínico',
      description: 'Aprende a seleccionar técnicas y combinaciones de puntos de acuerdo con objetivos terapéuticos concretos.',
      outcomes: ['Moxibustión y ventosas', 'Protocolos de tratamiento', 'Práctica supervisada']
    },
    {
      shortTitle: 'Práctica',
      period: 'Meses 9 al 12',
      icon: 'workspace_premium',
      title: 'Atiende casos reales con criterio integral',
      description: 'Integra evaluación, plan terapéutico y seguimiento para desempeñarte con seguridad y respaldo profesional.',
      outcomes: ['Casos clínicos reales', 'Certificación internacional', 'Acompañamiento docente']
    }
  ];

  readonly sliderImages = [
    'assets/AcupunturaChinaInsteip.jpg',
    'assets/AcupunturaInsteip2.jpg',
    'assets/AcupunturaInsteip3.jpg'
  ];

  readonly benefits = [
    {
      icon: 'neurology',
      label: 'Bases de la MTC',
      title: 'Comprende el mapa energético del cuerpo.',
      description: 'Identifica canales, puntos de acupuntura y desequilibrios energéticos para diseñar tratamientos personalizados.',
      items: [
        'Canales principales y puntos clave',
        'Evaluación de lengua y pulso',
        'Bases de la medicina tradicional china'
      ]
    },
    {
      icon: 'medical_services',
      label: 'Técnicas integradas',
      title: 'Domina más que solo agujas.',
      description: 'Aprende moxibustión, ventosas y digitopuntura como herramientas complementarias para potenciar cada sesión.',
      items: [
        'Moxibustión directa e indirecta',
        'Ventosas fijas y móviles',
        'Protocolos para dolor e inflamación'
      ]
    },
    {
      icon: 'workspace_premium',
      label: 'Práctica clínica',
      title: 'Aprende atendiendo casos reales.',
      description: 'Desarrolla criterio clínico desde los primeros módulos con supervisión docente en cada paso del proceso.',
      items: [
        'Práctica clínica supervisada',
        'Protocolos para patologías comunes',
        'Seguridad y bioseguridad del paciente'
      ]
    }
  ];

  readonly syllabusData: SyllabusPhase[] = [
    {
      id: 'fase1',
      tabLabel: '01 · Fundamentos',
      title: 'Bases de la Medicina Tradicional China',
      description: 'Principios filosóficos, canales bioenergéticos y anatomía de puntos principales.',
      image: 'assets/insteip acupuntura temario 1.jpg',
      imageAlt: 'Plan de estudios de Acupuntura China Fase 1',
      specimenLabel: 'SPECIMEN // CANALES BIOENERGÉTICOS',
      items: [
        {
          number: '01',
          title: 'Filosofía y Principios de la MTC',
          badge1: 'Teoría',
          badge2: 'Fundamentos',
          description: 'Yin-Yang, cinco elementos y sustancias vitales aplicadas a la salud.'
        },
        {
          number: '02',
          title: 'Canales y Meridianos',
          badge1: 'Anatomía',
          badge2: 'Puntos',
          description: 'Recorrido de los 12 canales principales y puntos de mayor impacto terapéutico.'
        }
      ]
    },
    {
      id: 'fase2',
      tabLabel: '02 · Técnicas',
      title: 'Técnicas Complementarias y Protocolos',
      description: 'Moxibustión, ventosas y selección de puntos para abordar el dolor y el estrés.',
      image: 'assets/insteip acupuntura temario 2.jpg',
      imageAlt: 'Plan de estudios de Acupuntura China Fase 2',
      specimenLabel: 'SPECIMEN // MOXIBUSTIÓN Y VENTOSAS',
      items: [
        {
          number: '01',
          title: 'Moxibustión y Ventosas',
          badge1: 'Práctica',
          badge2: 'Técnica',
          description: 'Aplicación de calor terapéutico y descompresión miofascial.'
        },
        {
          number: '02',
          title: 'Protocolos de Tratamiento',
          badge1: 'Clínica',
          badge2: 'Aplicación',
          description: 'Diseño de sesiones para lumbalgias, cefaleas, insomnio y contracturas.'
        }
      ]
    }
  ];

  readonly docenteData: DocenteData = {
    nombre: 'Lic. Emanuel Cabanillas Bardales',
    cargo: 'Docente principal de Acupuntura China',
    biografia: 'Especialista en Medicina Tradicional China, Acupuntura y Terapias Manuales con más de 10 años de experiencia docente y clínica. Formador de cientos de terapeutas certificados en el Perú.',
    fotoUrl: 'assets/Lic Emanuel.jpg',
    kicker: 'DOCENCIA INSTEIP',
    especialidades: [
      { icon: 'verified', label: 'Especialista en MTC' },
      { icon: 'workspace_premium', label: '+10 años de experiencia' },
      { icon: 'school', label: 'Docente INSTEIP' }
    ]
  };

  readonly ctaData: CourseCtaData = {
    precio: 180,
    tipoPago: '/ mes',
    cuotasInfo: 'Modalidad Online · Campus virtual 24/7',
    plazasDisponibles: 20,
    whatsappLink: 'https://wa.me/51939371250?text=Hola%2C%20deseo%20inscribirme%20en%20el%20curso%20Online%20de%20Acupuntura%20China',
    email: 'ecabanillasbardales@gmail.com',
    beneficios: [
      'Acceso al Campus Virtual 24/7',
      'Clases grabadas y en vivo con docentes especialistas',
      'Material didáctico descargable',
      'Certificación Internacional con valor curricular'
    ],
    headlineHtml: 'Inscríbete hoy en el Diplomado de<br><span class="text-secondary">Acupuntura China Online</span>.',
    description: 'Transforma tu carrera profesional con la formación online más completa en Medicina Tradicional China de INSTEIP.',
    faqs: [
      { icon: 'schedule', pregunta: '¿Cuándo puedo comenzar?', respuesta: 'Tienes acceso inmediato al campus virtual desde el momento de tu matrícula.' },
      { icon: 'devices', pregunta: '¿Cómo accedo a las clases?', respuesta: 'Desde cualquier dispositivo con conexión a internet, 24 horas al día, 7 días a la semana.' },
      { icon: 'verified', pregunta: '¿La certificación es válida internacionalmente?', respuesta: 'Sí, emitimos certificación oficial respaldada por horas lectivas y apostillable.' },
      { icon: 'support_agent', pregunta: '¿Tendré soporte de los docentes?', respuesta: 'Sí, dispondrás de foros de consulta y sesiones de tutoría en vivo.' }
    ],
    trustText: 'Garantía INSTEIP · Acceso 24/7 · Certificación internacional'
  };

  constructor(private readonly host: ElementRef<HTMLElement>) { }

  ngOnInit(): void {
    this.startAutoplay();
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    this.animationContext = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);

      gsap.from('.ac-hero__content > *', {
        y: 24,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: 'power3.out'
      });

      gsap.from('.ac-visual__frame, .ac-visual__card', {
        y: 30,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.15
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((section) => {
        gsap.from(section, {
          scrollTrigger: {
            trigger: section,
            start: 'top 82%'
          },
          y: 28,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out'
        });
      });
    }, this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    this.animationContext?.revert();
  }

  startAutoplay(): void {
    this.autoplayInterval = setInterval(() => {
      this.nextBenefit(true);
    }, 4500);
  }

  stopAutoplay(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = undefined;
    }
  }

  resetAutoplay(): void {
    this.stopAutoplay();
    this.startAutoplay();
  }

  prevBenefit(): void {
    this.resetAutoplay();
    this.activeBenefitIndex = this.activeBenefitIndex === 0 ? 2 : this.activeBenefitIndex - 1;
  }

  nextBenefit(isAuto = false): void {
    if (!isAuto) this.resetAutoplay();
    this.activeBenefitIndex = (this.activeBenefitIndex + 1) % 3;
  }

  setBenefit(i: number): void {
    this.resetAutoplay();
    this.activeBenefitIndex = i;
  }

  openBenefitLightbox(index: number = this.activeBenefitIndex): void {
    const images = this.sliderImages || [];
    this.benefitLightboxImage = images[index] || images[0] || 'assets/AcupunturaChinaInsteip.jpg';
    this.showBenefitLightbox = true;
  }

  closeBenefitLightbox(): void {
    this.showBenefitLightbox = false;
    this.benefitLightboxImage = '';
  }

  setJourneyStep(i: number): void {
    this.activeJourneyStep = i;
  }
}
