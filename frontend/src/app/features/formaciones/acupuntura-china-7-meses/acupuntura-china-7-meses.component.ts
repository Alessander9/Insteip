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
  selector: 'app-acupuntura-china-7-meses',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    CourseSyllabusComponent,
    DocenteSectionComponent,
    CourseCtaComponent
  ],
  templateUrl: './acupuntura-china-7-meses.component.html',
  styleUrls: ['../acupuntura-presencial/acupuntura-presencial.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AcupunturaChina7MesesComponent implements OnInit, AfterViewInit, OnDestroy {
  private animationContext?: gsap.Context;
  activeBenefitIndex = 0;
  showBenefitLightbox = false;
  benefitLightboxImage = '';
  activeJourneyStep = 0;
  private autoplayInterval?: ReturnType<typeof setInterval>;
  private hostElement: HTMLElement;

  readonly journeySteps = [
    {
      shortTitle: 'Filosofía y MTC',
      period: 'Meses 1 al 3',
      icon: 'neurology',
      title: 'Bases y Diagnóstico de la Medicina Tradicional China',
      description: 'Estudia el Yin-Yang como fundamento de la salud y aprende a diferenciar patrones energéticos como deficiencias y excesos.',
      outcomes: ['Bases filosóficas de la MTC', 'Yin-Yang y los 5 elementos', 'Diagnóstico de desequilibrios']
    },
    {
      shortTitle: 'Localización',
      period: 'Meses 4 al 5',
      icon: 'medical_services',
      title: 'Puntos y Sistema de Medición (Cun)',
      description: 'Domina la localización exacta de los principales puntos terapéuticos usando medidas tradicionales Cun y referencias corporales.',
      outcomes: ['Medición con Cun', 'Puntos Lieque, Hegu, Neiguan', 'Anatomía de los canales']
    },
    {
      shortTitle: 'Punción Clínica',
      period: 'Meses 6 al 7',
      icon: 'workspace_premium',
      title: 'Técnica de Inserción y Protocolos Terapéuticos',
      description: 'Aprende los ángulos de inserción, profundidad adecuada y diseña protocolos de tratamiento para dolor musculoesquelético.',
      outcomes: ['Punción perpendicular, oblicua y transversal', 'Sensación Deqi (llegada del Qi)', 'Protocolos para lumbalgias y cefaleas']
    }
  ];

  readonly sliderImages = [
    'assets/acupuntura_7_meses_estudios_1.jpg',
    'assets/acupuntura_7_meses_estudios_2.jpg',
    'assets/acupuntura_7_meses_estudios_3.jpg'
  ];

  readonly benefits = [
    {
      icon: 'neurology',
      label: 'Diagnóstico MTC',
      title: 'Comprende la raíz energética de cada síntoma.',
      description: 'Aprende a diferenciar síndromes por 8 principios, evaluando lengua, pulso y manifestaciones clínicas para tratar la causa y no solo el síntoma.',
      items: [
        'Diferenciación de síndromes Yin / Yang',
        'Evaluación de deficiencia y exceso',
        'Comprensión integral del paciente'
      ]
    },
    {
      icon: 'medical_services',
      label: 'Punción Práctica',
      title: 'Domina la aguja con seguridad y precisión.',
      description: 'Aprende las 3 técnicas de inserción segura (perpendicular, oblicua y transversal), profundidad adecuada por zona y la búsqueda del Deqi.',
      items: [
        'Inserción indolora con tubo guía',
        'Manipulación de tonificación y dispersión',
        'Protocolos de bioseguridad clínica'
      ]
    },
    {
      icon: 'workspace_premium',
      label: 'Protocolos de Tratamiento',
      title: 'Aplica esquemas de puntos para patologías reales.',
      description: 'Diseña y ejecuta protocolos para dolor lumbar, ciática, cefaleas tensionales, ansiedad, insomnio y parálisis facial desde los primeros meses.',
      items: [
        'Esquemas de puntos locales y distales',
        'Combinación de canales Shu antiguos',
        'Seguimiento y evolución del paciente'
      ]
    }
  ];

  readonly syllabusData: SyllabusPhase[] = [
    {
      id: 'fase1',
      tabLabel: '01 · Fundamentos y Diagnóstico',
      title: 'Fundamentos de la MTC y Diagnóstico Energético',
      description: 'Bases filosóficas, Yin-Yang, 5 elementos, sustancias fundamentales (Qi, Xue, Jinye) y los 4 métodos diagnósticos tradicionales.',
      image: 'assets/plan_estudios_acupuntura_7_meses_1.jpg',
      imageAlt: 'Plan de estudios - Fundamentos de acupuntura',
      specimenLabel: 'SPECIMEN // MTC FUNDAMENTALS',
      items: [
        {
          number: '01',
          title: 'Filosofía y Teoría Básica',
          badge1: 'Módulo 1',
          badge2: 'Fundamentos',
          description: 'Yin-Yang, Wu Xing (5 elementos), Zang-Fu (órganos y vísceras) y su aplicación clínica.'
        },
        {
          number: '02',
          title: 'Diagnóstico por los 4 Métodos',
          badge1: 'Módulo 2',
          badge2: 'Clínica',
          description: 'Inspección (lengua), auscultación/olfacción, interrogatorio y palpación (pulsología china).'
        },
        {
          number: '03',
          title: 'Diferenciación de Síndromes',
          badge1: 'Módulo 3',
          badge2: 'Diagnóstico',
          description: 'Los 8 principios (Ba Gang), síndromes de Qi, Xue y órganos Zang-Fu.'
        }
      ]
    },
    {
      id: 'fase2',
      tabLabel: '02 · Canales, Puntos y Punción',
      title: 'Canales Principales, Puntos Clave y Punción Práctica',
      description: 'Estudio detallado de los 12 canales principales, canal Du Mai y Ren Mai, localización con Cun y técnica de punción segura.',
      image: 'assets/plan_estudios_acupuntura_7_meses_2.jpg',
      imageAlt: 'Plan de estudios - Canales y punción',
      specimenLabel: 'SPECIMEN // CLINICAL PRACTICE',
      items: [
        {
          number: '04',
          title: 'Canales y Puntos Shu Antiguos',
          badge1: 'Módulo 4',
          badge2: 'Puntos',
          description: 'Localización anatómica con medidas Cun de los puntos de mayor impacto terapéutico.'
        },
        {
          number: '05',
          title: 'Técnica de Punción y Deqi',
          badge1: 'Módulo 5',
          badge2: 'Práctica',
          description: 'Ángulos, profundidad, manipulación de agujas, obtención del Deqi y bioseguridad.'
        },
        {
          number: '06',
          title: 'Protocolos Clínicos y Casos Reales',
          badge1: 'Módulo 6-7',
          badge2: 'Integración',
          description: 'Tratamiento de dolor musculoesquelético, estrés, insomnio, cefaleas y alteraciones digestivas.'
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
    precio: 150,
    tipoPago: '/ mes',
    cuotasInfo: '7 mensualidades de S/ 150 · Matrícula regular',
    plazasDisponibles: 15,
    whatsappLink: 'https://wa.me/51939371250?text=Hola%2C%20deseo%20inscribirme%20en%20el%20curso%20de%20Acupuntura%20China%20(7%20meses)',
    email: 'ecabanillasbardales@gmail.com',
    beneficios: [
      'Materiales de práctica incluidos en cada clase',
      'Acceso al Campus Virtual con clases de refuerzo 24/7',
      'Práctica clínica desde el primer mes',
      'Doble Certificación Oficial al egresar'
    ],
    headlineHtml: 'Inscríbete hoy en Acupuntura China<br><span class="text-secondary">(7 meses)</span>.',
    description: 'Aprende los fundamentos milenarios de la MTC y domina la punción clínica con práctica presencial intensiva.',
    faqs: [
      { icon: 'schedule', pregunta: '¿Cuáles son los horarios?', respuesta: 'Contamos con turnos de mañana, tarde y fines de semana. Consulta la sede más cercana.' },
      { icon: 'verified', pregunta: '¿Necesito conocimientos previos?', respuesta: 'No. El curso inicia desde los fundamentos filosóficos y anatómicos básicos.' },
      { icon: 'payments', pregunta: '¿Qué incluye la mensualidad?', respuesta: 'Incluye clases presenciales, uso de materiales, acceso al campus virtual y asesoría continua.' },
      { icon: 'school', pregunta: '¿Qué certificado recibo?', respuesta: 'Recibes Certificado Oficial con valor institucional de INSTEIP respaldado por horas lectivas.' }
    ],
    trustText: 'Garantía INSTEIP · Práctica clínica garantizada · Docentes especialistas'
  };

  constructor(hostRef: ElementRef<HTMLElement>) {
    this.hostElement = hostRef.nativeElement;
  }

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
    }, this.hostElement);
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

  setBenefit(index: number): void {
    this.resetAutoplay();
    this.activeBenefitIndex = index;
  }

  nextBenefit(isAuto = false): void {
    if (!isAuto) this.resetAutoplay();
    this.activeBenefitIndex = (this.activeBenefitIndex + 1) % this.benefits.length;
  }

  prevBenefit(): void {
    this.resetAutoplay();
    this.activeBenefitIndex =
      (this.activeBenefitIndex - 1 + this.benefits.length) % this.benefits.length;
  }

  openBenefitLightbox(index: number = this.activeBenefitIndex): void {
    const images = this.sliderImages || [];
    this.benefitLightboxImage = images[index] || images[0] || 'assets/acupuntura_7_meses_curso.jpg';
    this.showBenefitLightbox = true;
  }

  closeBenefitLightbox(): void {
    this.showBenefitLightbox = false;
    this.benefitLightboxImage = '';
  }

  setJourneyStep(index: number): void {
    this.activeJourneyStep = index;
  }
}
