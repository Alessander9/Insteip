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
  selector: 'app-auriculoterapia',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    CourseSyllabusComponent,
    DocenteSectionComponent,
    CourseCtaComponent
  ],
  templateUrl: './auriculoterapia.component.html',
  styleUrls: ['./auriculoterapia.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AuriculoterapiaComponent implements OnInit, AfterViewInit, OnDestroy {
  private animationContext?: gsap.Context;
  activeBenefitIndex = 0;
  showBenefitLightbox = false;
  benefitLightboxImage = '';
  activeJourneyStep = 0;
  private autoplayInterval?: ReturnType<typeof setInterval>;

  readonly journeySteps = [
    {
      shortTitle: 'Fundamentos',
      period: 'Mes 1',
      icon: 'neurology',
      title: 'Mapea la oreja y sus zonas reflejas',
      description: 'Aprende la anatomía del pabellón auricular y localiza los puntos reflejos correspondientes a cada sistema del cuerpo humano.',
      outcomes: ['Somatotopía auricular', 'Puntos maestros de la oreja', 'Inspección visual']
    },
    {
      shortTitle: 'Diagnóstico',
      period: 'Mes 2',
      icon: 'medical_services',
      title: 'Detecta desequilibrios con precisión',
      description: 'Domina los métodos de evaluación táctil, palpación por presión y detección eléctrica para confirmar puntos reactivos.',
      outcomes: ['Palpación y búsqueda de dolor', 'Instrumentos de detección', 'Diferenciación de reactividad']
    },
    {
      shortTitle: 'Protocolos',
      period: 'Mes 3',
      icon: 'workspace_premium',
      title: 'Aplica semillas, balines y protocolos clínicos',
      description: 'Selecciona y coloca semillas, balines electromagnéticos y chinchetas según protocolos específicos para dolor, ansiedad y control de peso.',
      outcomes: ['Semillas de vaccaria y balines', 'Protocolo para estrés y ansiedad', 'Práctica clínica supervisada']
    }
  ];

  readonly sliderImages = [
    'assets/insteip auriculoterapia.jpg',
    'assets/insteip auriculoterapia 2.jpg',
    'assets/insteip auriculoterapia 3.jpg'
  ];

  readonly benefits = [
    {
      icon: 'neurology',
      label: 'Mapeo somatotópico',
      title: 'Comprende el mapa reflejo del pabellón auricular.',
      description: 'Aprende a ubicar con exactitud los puntos de la oreja vinculados con órganos, articulaciones y sistema nervioso.',
      items: [
        'Anatomía del pabellón auricular',
        'Correspondencias de órganos y vísceras',
        'Puntos maestros y reactivos'
      ]
    },
    {
      icon: 'medical_services',
      label: 'Técnicas de estímulo',
      title: 'Domina semillas, balines y masaje auricular.',
      description: 'Aprende a seleccionar y aplicar el método adecuado para cada paciente: semillas de vaccaria, balines magnéticos o chinchetas.',
      items: [
        'Semillas de vaccaria y balines magnéticos',
        'Chinchetas y agujas semipermanentes',
        'Masaje auricular y preparación previa'
      ]
    },
    {
      icon: 'workspace_premium',
      label: 'Protocolos clínicos',
      title: 'Trata dolor, ansiedad y control de peso.',
      description: 'Aplica esquemas de puntos validados clínicamente para abordar las consultas más frecuentes con resultados comprobados.',
      items: [
        'Protocolos para dolor e inflamación',
        'Manejo de estrés, ansiedad e insomnio',
        'Soporte en control de peso y adicciones'
      ]
    }
  ];

  readonly syllabusData: SyllabusPhase[] = [
    {
      id: 'fase1',
      tabLabel: '01 · Anatomía y Diagnóstico',
      title: 'Bases y Diagnóstico Auricular',
      description: 'Somatotopía auricular, correspondencias de órganos y métodos de evaluación.',
      image: 'assets/insteip auriculoterapia temario 1.jpg',
      imageAlt: 'Plan de estudios de Auriculoterapia Fase 1',
      specimenLabel: 'SPECIMEN // SOMATOTOPÍA AURICULAR',
      items: [
        {
          number: '01',
          title: 'Anatomía del Pabellón Auricular',
          badge1: 'Teoría',
          badge2: 'Fundamentos',
          description: 'Hélix, antihélix, trago, concha y lóbulo; correspondencias de órganos y sistemas.'
        },
        {
          number: '02',
          title: 'Diagnóstico e Inspección',
          badge1: 'Evaluación',
          badge2: 'Clínica',
          description: 'Inspección visual de cambios en la oreja y palpación por presión de puntos sensibles.'
        }
      ]
    },
    {
      id: 'fase2',
      tabLabel: '02 · Tratamiento y Protocolos',
      title: 'Técnicas de Estímulo y Protocolos',
      description: 'Aplicación de semillas, balines y diseño de protocolos para patologías comunes.',
      image: 'assets/insteip auriculoterapia temario 2.jpg',
      imageAlt: 'Plan de estudios de Auriculoterapia Fase 2',
      specimenLabel: 'SPECIMEN // TÉCNICAS Y PROTOCOLOS',
      items: [
        {
          number: '01',
          title: 'Materiales y Técnicas de Estímulo',
          badge1: 'Práctica',
          badge2: 'Técnica',
          description: 'Colocación precisa de semillas de vaccaria, balines electromagnéticos y chinchetas.'
        },
        {
          number: '02',
          title: 'Protocolos de Tratamiento',
          badge1: 'Clínica',
          badge2: 'Aplicación',
          description: 'Protocolos para ansiedad, insomnio, sobrepeso, dolor articular y migrañas.'
        }
      ]
    }
  ];

  readonly docenteData: DocenteData = {
    nombre: 'Lic. Emanuel Cabanillas Bardales',
    cargo: 'Docente principal de Auriculoterapia',
    biografia: 'Especialista en Medicina Tradicional China, Auriculoterapia y Terapias Complementarias con más de 10 años de trayectoria clínica y formativa en el Perú.',
    fotoUrl: 'assets/Lic Emanuel.jpg',
    kicker: 'DOCENCIA INSTEIP',
    especialidades: [
      { icon: 'verified', label: 'Especialista en Auriculoterapia' },
      { icon: 'workspace_premium', label: '+10 años de experiencia' },
      { icon: 'school', label: 'Docente INSTEIP' }
    ]
  };

  readonly ctaData: CourseCtaData = {
    precio: 150,
    tipoPago: '/ mes',
    cuotasInfo: 'Modalidad Online · Campus virtual 24/7',
    plazasDisponibles: 20,
    whatsappLink: 'https://wa.me/51939371250?text=Hola%2C%20deseo%20inscribirme%20en%20el%20curso%20Online%20de%20Auriculoterapia',
    email: 'ecabanillasbardales@gmail.com',
    beneficios: [
      'Acceso al Campus Virtual 24/7',
      'Clases grabadas y en vivo con docentes especialistas',
      'Material didáctico y guías de puntos descargables',
      'Certificación Internacional con valor curricular'
    ],
    headlineHtml: 'Inscríbete hoy en el Curso de<br><span class="text-secondary">Auriculoterapia Online</span>.',
    description: 'Aprende a diagnosticar y tratar desequilibrios a través del microsistema auricular con la metodología comprobada de INSTEIP.',
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
    this.benefitLightboxImage = images[index] || images[0] || 'assets/insteip auriculoterapia.jpg';
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
