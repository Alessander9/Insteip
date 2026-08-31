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
  selector: 'app-auriculoterapia-presencial',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    CourseSyllabusComponent,
    DocenteSectionComponent,
    CourseCtaComponent
  ],
  templateUrl: './auriculoterapia-presencial.component.html',
  styleUrls: ['./auriculoterapia-presencial.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AuriculoterapiaPresencialComponent implements OnInit, AfterViewInit, OnDestroy {
  private animationContext?: gsap.Context;
  activeBenefitIndex = 0;
  showBenefitLightbox = false;
  benefitLightboxImage = '';
  activeJourneyStep = 0;
  private autoplayInterval?: ReturnType<typeof setInterval>;

  readonly journeySteps = [
    {
      shortTitle: 'Neurofisiología',
      period: 'Módulo 1',
      icon: 'neurology',
      title: 'Comprende la neurofisiología y vertientes',
      description: 'Estudia la historia (Dr. Paul Nogier), vertientes china, francesa y neuromodulación, junto con la relevancia del Nervio Vago y la teoría polivagal.',
      outcomes: ['Aportes del Dr. Paul Nogier', 'Nervio Vago y neurofisiología', 'Teoría polivagal y convergencia']
    },
    {
      shortTitle: 'Somatotopía',
      period: 'Módulo 2',
      icon: 'medical_services',
      title: 'Domina la anatomía auricular y puntos maestros',
      description: 'Aprende la localización precisa de estructuras auriculares y los 10 Puntos Maestros (Shenmen, Cero, Tálamo, Simpático, Alergia, entre otros).',
      outcomes: ['Anatomía de la oreja', '10 Puntos Maestros', 'Detección visual y por presión']
    },
    {
      shortTitle: 'Aplicación',
      period: 'Módulo 3-4',
      icon: 'workspace_premium',
      title: 'Aplica técnicas de estímulo y protocolos clínicos',
      description: 'Semillas de vaccaria, balines electromagnéticos, chinchetas y aguja ASP. Tratamiento del dolor, estrés, sobrepeso y adicciones.',
      outcomes: ['Semillas, balines y chinchetas', 'Protocolo NADA y dolor', 'Práctica clínica supervisada']
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
      label: 'Neurofisiología y MTC',
      title: 'Entiende la base científica del microsistema auricular.',
      description: 'Aprende la conexión entre los puntos reflejos de la oreja, el sistema nervioso y los órganos internos.',
      items: [
        'Somatotopía auricular completa',
        'Vías reflejas y neuroanatomía',
        'Puntos maestros y puntos reactivos'
      ]
    },
    {
      icon: 'medical_services',
      label: 'Técnicas de estímulo',
      title: 'Domina semillas, balines, chinchetas y masaje.',
      description: 'Selecciona y aplica el método de estimulación más adecuado según el perfil y necesidad de cada paciente.',
      items: [
        'Semillas de vaccaria y balines magnéticos',
        'Chinchetas y estimulación puntual',
        'Masaje auricular preparatorio'
      ]
    },
    {
      icon: 'workspace_premium',
      label: 'Protocolos clínicos',
      title: 'Aplica esquemas de tratamiento efectivos.',
      description: 'Diseña protocolos específicos para control del dolor, ansiedad, insomnio, control de peso y adicciones.',
      items: [
        'Protocolos para dolor musculoesquelético',
        'Manejo del estrés, ansiedad y sueño',
        'Control de peso y adicciones'
      ]
    }
  ];

  readonly syllabusData: SyllabusPhase[] = [
    {
      id: 'fase1',
      tabLabel: '01 · Neurofisiología y Diagnóstico',
      title: 'Neurofisiología Auricular y Diagnóstico del Microsistema',
      description: 'Bases neurofisiológicas, somatotopía auricular completa, 10 Puntos Maestros y métodos de detección clínica.',
      image: 'assets/insteip auriculoterapia temario 1.jpg',
      imageAlt: 'Plan de estudios de Auriculoterapia Presencial Fase 1',
      specimenLabel: 'SPECIMEN // SOMATOTOPÍA Y DIAGNÓSTICO',
      items: [
        {
          number: '01',
          title: 'Historia, Vertientes y Neurofisiología',
          badge1: 'Módulo 1',
          badge2: 'Neurofisiología',
          description: 'Aportes del Dr. Paul Nogier, vertientes china y francesa, Nervio Vago y teoría polivagal.'
        },
        {
          number: '02',
          title: 'Anatomía Auricular y Puntos Maestros',
          badge1: 'Módulo 2',
          badge2: 'Anatomía',
          description: 'Estructuras de la oreja, los 10 Puntos Maestros (Shenmen, Tálamo, Simpático, Punto Cero, etc.).'
        },
        {
          number: '03',
          title: 'Diagnóstico Auricular Clínico',
          badge1: 'Módulo 3',
          badge2: 'Clínica',
          description: 'Inspección visual (cambios de color, descamación), palpación y detección por presión con palpador.'
        }
      ]
    },
    {
      id: 'fase2',
      tabLabel: '02 · Técnicas y Protocolos',
      title: 'Técnicas de Estímulo y Protocolos Clínicos Avanzados',
      description: 'Semillas, balines, chinchetas, agujas ASP, electroestimulación y protocolos clínicos para dolor, ansiedad y sobrepeso.',
      image: 'assets/insteip auriculoterapia temario 2.jpg',
      imageAlt: 'Plan de estudios de Auriculoterapia Presencial Fase 2',
      specimenLabel: 'SPECIMEN // PROTOCOLOS CLÍNICOS',
      items: [
        {
          number: '04',
          title: 'Materiales y Técnicas de Estímulo',
          badge1: 'Módulo 4',
          badge2: 'Práctica',
          description: 'Semillas de vaccaria, balines magnéticos, chinchetas intradérmicas, aguja semipermanente (ASP).'
        },
        {
          number: '05',
          title: 'Protocolos de Tratamiento Clínico',
          badge1: 'Módulo 5',
          badge2: 'Protocolos',
          description: 'Protocolo NADA (adicciones y estrés), dolor musculoesquelético, control de peso y cefaleas.'
        },
        {
          number: '06',
          title: 'Práctica Clínica Supervisada y Bioseguridad',
          badge1: 'Módulo 6',
          badge2: 'Clínica',
          description: 'Atención a pacientes en vivo, asepsia, precauciones, contraindicaciones y seguimiento.'
        }
      ]
    }
  ];

  readonly docenteData: DocenteData = {
    nombre: 'Lic. Emanuel Cabanillas Bardales',
    cargo: 'Docente principal de Auriculoterapia',
    biografia: 'Especialista en Medicina Tradicional China, Auriculoterapia y Neurofisiología con más de 10 años de experiencia clínica y docente en el Perú.',
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
    cuotasInfo: 'Curso Presencial · Práctica clínica garantizada',
    plazasDisponibles: 15,
    whatsappLink: 'https://wa.me/51939371250?text=Hola%2C%20deseo%20inscribirme%20en%20el%20curso%20Presencial%20de%20Auriculoterapia',
    email: 'ecabanillasbardales@gmail.com',
    beneficios: [
      'Materiales de práctica incluidos (semillas, balines, chinchetas)',
      'Acceso al Campus Virtual con clases complementarias 24/7',
      'Práctica clínica supervisada con pacientes reales',
      'Certificación Oficial con valor curricular'
    ],
    headlineHtml: 'Inscríbete hoy en el Curso Presencial de<br><span class="text-secondary">Auriculoterapia</span>.',
    description: 'Aprende a evaluar y tratar a través del microsistema auricular con práctica presencial intensiva y respaldo profesional.',
    faqs: [
      { icon: 'schedule', pregunta: '¿Cuáles son los horarios disponibles?', respuesta: 'Contamos con turnos de mañana, tarde y fines de semana. Consulta la disponibilidad en tu sede.' },
      { icon: 'verified', pregunta: '¿Necesito experiencia previa?', respuesta: 'No se requiere experiencia previa; el curso comienza desde los fundamentos neurofisiológicos y anatómicos.' },
      { icon: 'payments', pregunta: '¿Qué incluye la matrícula?', respuesta: 'Incluye clases presenciales, kit de materiales inicial, acceso al campus virtual y asesoría continua.' },
      { icon: 'school', pregunta: '¿Qué certificación obtengo?', respuesta: 'Recibes Certificado Oficial con valor institucional emitido por INSTEIP.' }
    ],
    trustText: 'Garantía INSTEIP · Kit de materiales incluido · Práctica clínica presencial'
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
