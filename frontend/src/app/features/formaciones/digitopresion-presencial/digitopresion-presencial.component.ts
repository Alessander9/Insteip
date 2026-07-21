import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../../core/components/footer/footer.component';
import { CourseSyllabusComponent, SyllabusPhase } from '../../../shared/components/course-syllabus/course-syllabus.component';
import { DocenteSectionComponent, DocenteData } from '../../../shared/components/docente-section/docente-section.component';
import { CourseCtaComponent, CourseCtaData } from '../../../shared/components/course-cta/course-cta.component';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-digitopresion-presencial',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
    CourseSyllabusComponent,
    DocenteSectionComponent,
    CourseCtaComponent
  ],
  templateUrl: './digitopresion-presencial.component.html',
  styleUrls: ['./digitopresion-presencial.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DigitopresionPresencialComponent implements OnInit, AfterViewInit, OnDestroy {
  private animationContext?: gsap.Context;
  activeBenefitIndex = 0;
  activeJourneyStep = 0;
  private autoplayInterval?: ReturnType<typeof setInterval>;

  readonly journeySteps = [
    {
      shortTitle: 'Fundamentos',
      period: 'Semana 1 al 3',
      icon: 'touch_app',
      title: 'Bases anatómicas y técnica manual',
      description: 'Aprende anatomía muscular aplicada, palpación terapéutica y los principios de la presión digital en puntos clave.',
      outcomes: ['Anatomía palpable', 'Puntos de presión', 'Seguridad terapéutica']
    },
    {
      shortTitle: 'Técnica',
      period: 'Semana 4 al 6',
      icon: 'front_hand',
      title: 'Protocolos clínicos de digitopresión',
      description: 'Desarrolla secuencias y protocolos de tratamiento para contracturas, tensión y dolor musculoesquelético.',
      outcomes: ['Protocolos de dolor', 'Maniobras especiales', 'Práctica supervisada']
    },
    {
      shortTitle: 'Profesión',
      period: 'Semana 7 al 8',
      icon: 'workspace_premium',
      title: 'Integración clínica y certificación',
      description: 'Consolida tu práctica con casos reales y obtén la certificación que respalda tu competencia profesional.',
      outcomes: ['Casos clínicos reales', 'Evaluación práctica', 'Certificación institucional']
    }
  ];

  syllabusData: SyllabusPhase[] = [
    {
      id: 'fase1',
      tabLabel: '01 · Digitopresión Clásica (Semanas 1-4)',
      title: 'Fase 1: Fundamentos de Digitopresión',
      description: 'Aprendizaje de la anatomía muscular palpable y técnicas de presión digital para el manejo del dolor y las contracturas.',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Digitopresión clínica',
      specimenLabel: 'SPECIMEN // PUNTOS DE PRESIÓN TERAPÉUTICA',
      items: [
        { number: '01', title: 'Anatomía Muscular Aplicada', badge1: 'Teoría', badge2: 'Fase 1', description: 'Identificación de grupos musculares, inserciones y puntos gatillo de mayor relevancia clínica.' },
        { number: '02', title: 'Técnica de Palpación', badge1: 'Práctica', badge2: 'Fase 1', description: 'Desarrollo de sensibilidad palmar para ubicar contracturas, nódulos y zonas de tensión tisular.' },
        { number: '03', title: 'Puntos de Presión Digital', badge1: 'Técnica', badge2: 'Reflejo', description: 'Localización y estimulación de puntos terapéuticos de alta efectividad para el alivio del dolor.' },
        { number: '04', title: 'Seguridad y Contraindicaciones', badge1: 'Clínica', badge2: 'Fase 1', description: 'Criterios de aplicación segura, contraindicaciones absolutas y relativas, e higiene postural del terapeuta.' }
      ]
    },
    {
      id: 'fase2',
      tabLabel: '02 · Protocolos Avanzados (Semanas 5-8)',
      title: 'Fase 2: Protocolos Clínicos',
      description: 'Diseño y aplicación de protocolos completos de tratamiento para condiciones musculoesqueléticas frecuentes.',
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Protocolo de digitopresión',
      specimenLabel: 'SPECIMEN // PROTOCOLOS DE TRATAMIENTO MANUAL',
      items: [
        { number: '01', title: 'Cervicalgia y Contractura', badge1: 'Protocolo', badge2: 'Fase 2', description: 'Secuencia terapéutica para el abordaje de la tensión cervical, trapecios y región escapular.' },
        { number: '02', title: 'Dolor Lumbar', badge1: 'Protocolo', badge2: 'Fase 2', description: 'Maniobras específicas para la región lumbar, cadena posterior y musculatura paravertebral.' },
        { number: '03', title: 'Digitopresión Refleja', badge1: 'Reflejo', badge2: 'Fase 2', description: 'Integración de puntos reflejos y zonas de estimulación indirecta para el equilibrio sistémico.' },
        { number: '04', title: 'Casos Clínicos Integrales', badge1: 'Clínica', badge2: 'Práctica', description: 'Evaluación y tratamiento completo de casos reales bajo supervisión docente directa.' }
      ]
    }
  ];

  docenteData: DocenteData = {
    nombre: 'Lic. Lázaro José Regalado Ponte',
    cargo: 'Docente Especialista',
    biografia: 'Licenciado en <span class="text-brand-blue font-semibold">Fisioterapia y Rehabilitación</span>, especialista en técnicas manuales, digitopresión y acupuntura clínica con amplia trayectoria docente universitaria en <span class="text-brand-blue font-semibold">Cuba y Perú</span>.',
    fotoUrl: 'https://static.wixstatic.com/media/3c52e9_47a9cbbe9d954ced8e74d4950711a55e~mv2.jpg',
    kicker: 'DOCENCIA EXCLUSIVA',
    especialidades: [
      { icon: 'verified', label: 'Especialista Clínico' },
      { icon: 'school', label: 'Ex-Docente U.' }
    ]
  };

  ctaData: CourseCtaData = {
    precio: 260,
    cuotasInfo: '2 cuotas · Sin intereses · Matrícula incluida',
    plazasDisponibles: 8,
    whatsappLink: 'https://wa.me/51939371250',
    email: 'ecabanillasbardales@gmail.com',
    beneficios: [
      '2 meses de clases presenciales cada domingo en Lince, Lima',
      'Práctica clínica supervisada con pacientes reales',
      'Material didáctico digital oficial incluido',
      'Certificado profesional oficial emitido por Insteip'
    ],
    headlineHtml: 'El momento de iniciar tu<br><span class="text-secondary">carrera en digitopresión</span> es ahora.',
    description: 'Cupos <span class="text-brand-blue font-semibold">muy limitados</span> por grupo. Una vez llenos, la siguiente convocatoria puede demorar meses. Reserva tu lugar hoy.',
    faqs: [
      { icon: 'help', pregunta: '¿Sin experiencia previa?', respuesta: 'No se requieren conocimientos previos. Comenzamos desde la anatomía básica.' },
      { icon: 'schedule', pregunta: '¿Cuándo son las clases?', respuesta: 'Domingos de 10:00 AM a 1:00 PM en nuestro centro en Lince, Lima.' },
      { icon: 'verified', pregunta: '¿El certificado es válido?', respuesta: 'Sí. Emitido por Insteip con respaldo institucional reconocido en Perú.' },
      { icon: 'location_on', pregunta: '¿Dónde son las prácticas?', respuesta: 'En nuestro centro clínico en Lince, Lima — grupos reducidos de máximo 8 personas.' }
    ],
    trustText: 'Pago seguro · Sin compromiso de permanencia · Asesoría personalizada antes de matricularte'
  };

  constructor(private readonly host: ElementRef<HTMLElement>) { }

  ngOnInit(): void {
    this.startAutoplay();
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
    if (!isAuto) { this.resetAutoplay(); }
    this.activeBenefitIndex = this.activeBenefitIndex === 2 ? 0 : this.activeBenefitIndex + 1;
  }

  setBenefit(i: number): void {
    this.resetAutoplay();
    this.activeBenefitIndex = i;
  }

  setJourneyStep(index: number): void {
    this.activeJourneyStep = index;
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    this.animationContext = gsap.context(() => {
      const hero = gsap.timeline({ defaults: { ease: 'power3.out' } });
      hero
        .from('.ac-kicker', { opacity: 0, y: -12, duration: 0.45 })
        .from('.ac-title', { opacity: 0, y: 28, duration: 0.8 }, '-=0.2')
        .from('.ac-description, .ac-actions, .ac-proof', { opacity: 0, y: 14, stagger: 0.08, duration: 0.45 }, '-=0.45')
        .from('.ac-hero__visual', { opacity: 0, scale: 0.95, duration: 0.8 }, '-=0.65')
        .from('.ac-fact', { opacity: 0, y: 12, stagger: 0.07, duration: 0.4 }, '-=0.4');

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
        gsap.fromTo(element,
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1, y: 0, duration: 0.25, ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top bottom', once: true }
          }
        );
      });
    }, this.host.nativeElement);
    ScrollTrigger.refresh();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    this.animationContext?.revert();
  }
}
