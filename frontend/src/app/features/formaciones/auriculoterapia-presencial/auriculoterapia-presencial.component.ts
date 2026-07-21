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
  selector: 'app-auriculoterapia-presencial',
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
  templateUrl: './auriculoterapia-presencial.component.html',
  styleUrls: ['./auriculoterapia-presencial.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AuriculoterapiaPresencialComponent implements OnInit, AfterViewInit, OnDestroy {
  private animationContext?: gsap.Context;
  activeBenefitIndex = 0;
  activeJourneyStep = 0;
  private autoplayInterval?: ReturnType<typeof setInterval>;

  readonly journeySteps = [
    {
      shortTitle: 'Fundamentos',
      period: 'Semana 1 al 3',
      icon: 'hearing',
      title: 'Anatomía auricular y mapeo reflejo',
      description: 'Aprende la topografía del pabellón auricular, los sistemas de diagnóstico y los puntos de mayor relevancia clínica.',
      outcomes: ['Anatomía del pabellón', 'Sistemas de cartografía', 'Diagnóstico auricular']
    },
    {
      shortTitle: 'Técnica',
      period: 'Semana 4 al 6',
      icon: 'grain',
      title: 'Técnicas de estimulación y protocolos',
      description: 'Domina las técnicas de estimulación con semillas, balines y agujas, y diseña protocolos para condiciones frecuentes.',
      outcomes: ['Semillas y balines', 'Agujas auriculares', 'Protocolos clínicos']
    },
    {
      shortTitle: 'Profesión',
      period: 'Semana 7 al 8',
      icon: 'workspace_premium',
      title: 'Práctica clínica y certificación',
      description: 'Aplica tus conocimientos con pacientes reales bajo supervisión y obtén tu certificación profesional de Insteip.',
      outcomes: ['Casos clínicos reales', 'Evaluación práctica', 'Certificación institucional']
    }
  ];

  syllabusData: SyllabusPhase[] = [
    {
      id: 'fase1',
      tabLabel: '01 · Auriculoterapia Clásica (Semanas 1-4)',
      title: 'Fase 1: Fundamentos de Auriculoterapia',
      description: 'Estudio del pabellón auricular como microsistema reflejo del organismo y técnicas básicas de estimulación.',
      image: 'assets/Auriculoterapia Insteip.png',
      imageAlt: 'Auriculoterapia presencial',
      specimenLabel: 'SPECIMEN // CARTOGRAFÍA AURICULAR CLÍNICA',
      items: [
        { number: '01', title: 'Topografía Auricular', badge1: 'Teoría', badge2: 'Fase 1', description: 'Estudio detallado de las zonas anatómicas del pabellón y su correspondencia corporal refleja.' },
        { number: '02', title: 'Sistemas de Diagnóstico', badge1: 'Diagnóstico', badge2: 'Fase 1', description: 'Métodos de detección de puntos activos: inspección visual, palpación y electroneurometría básica.' },
        { number: '03', title: 'Semillas y Balines', badge1: 'Práctica', badge2: 'No invasivo', description: 'Técnica de estimulación con semillas de vaccaria, balines de metal y materiales magnetoterapéuticos.' },
        { number: '04', title: 'Auriculoterapia Francesa y China', badge1: 'Sistemas', badge2: 'Comparativo', description: 'Diferencias y complementariedad entre el sistema de Nogier (francés) y el sistema chino de auriculopuntura.' }
      ]
    },
    {
      id: 'fase2',
      tabLabel: '02 · Protocolos Avanzados (Semanas 5-8)',
      title: 'Fase 2: Protocolos Clínicos Avanzados',
      description: 'Aplicación de protocolos específicos para condiciones de alta prevalencia clínica y práctica supervisada.',
      image: 'https://images.unsplash.com/photo-1589330694653-ded6df53f7ee?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Protocolo auricular avanzado',
      specimenLabel: 'SPECIMEN // PROTOCOLOS AURICULARES ESPECIALIZADOS',
      items: [
        { number: '01', title: 'Protocolo Antidolor', badge1: 'Analgesia', badge2: 'Fase 2', description: 'Secuencias auriculares para el manejo del dolor agudo y crónico de origen musculoesquelético.' },
        { number: '02', title: 'Estrés y Ansiedad', badge1: 'Emocional', badge2: 'Fase 2', description: 'Protocolo de equilibrio neuroemocional para el abordaje del estrés, insomnio y estados ansiosos.' },
        { number: '03', title: 'Adicciones y Hábitos', badge1: 'NADA', badge2: 'Fase 2', description: 'Protocolo NADA (5 puntos) y variantes para el apoyo terapéutico en cesación del tabaco y otras conductas.' },
        { number: '04', title: 'Práctica con Pacientes', badge1: 'Clínica', badge2: 'Supervisada', description: 'Sesiones de práctica clínica real con pacientes bajo supervisión directa del docente especialista.' }
      ]
    }
  ];

  docenteData: DocenteData = {
    nombre: 'Lic. Lázaro José Regalado Ponte',
    cargo: 'Docente Especialista',
    biografia: 'Licenciado en <span class="text-brand-blue font-semibold">Fisioterapia y Rehabilitación</span>, especialista en auriculoterapia clínica, acupuntura y técnicas reflejas con amplia trayectoria docente universitaria en <span class="text-brand-blue font-semibold">Cuba y Perú</span>.',
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
      'Kit de materiales clínicos incluido (semillas, balines, cartograma)',
      'Manual impreso ilustrado de por vida',
      'Certificado profesional oficial emitido por Insteip'
    ],
    headlineHtml: 'El momento de iniciar tu<br><span class="text-secondary">práctica en auriculoterapia</span> es ahora.',
    description: 'Cupos <span class="text-brand-blue font-semibold">muy limitados</span> por grupo. Una vez llenos, la siguiente convocatoria puede demorar meses. Reserva tu lugar hoy.',
    faqs: [
      { icon: 'help', pregunta: '¿Sin experiencia previa?', respuesta: 'No se requieren conocimientos previos. Comenzamos desde la anatomía auricular básica.' },
      { icon: 'schedule', pregunta: '¿Cuándo son las clases?', respuesta: 'Domingos de 10:00 AM a 1:00 PM en nuestro centro en Lince, Lima.' },
      { icon: 'verified', pregunta: '¿El certificado es válido?', respuesta: 'Sí. Emitido por Insteip con respaldo institucional reconocido en Perú.' },
      { icon: 'location_on', pregunta: '¿Dónde son las prácticas?', respuesta: 'En nuestro centro clínico en Lince, Lima — grupos reducidos de máximo 8 personas.' }
    ],
    trustText: 'Pago seguro · Sin compromiso de permanencia · Asesoría personalizada antes de matricularte'
  };

  constructor(private readonly host: ElementRef<HTMLElement>) { }

  ngOnInit(): void { this.startAutoplay(); }

  startAutoplay(): void {
    this.autoplayInterval = setInterval(() => { this.nextBenefit(true); }, 4500);
  }

  stopAutoplay(): void {
    if (this.autoplayInterval) { clearInterval(this.autoplayInterval); this.autoplayInterval = undefined; }
  }

  resetAutoplay(): void { this.stopAutoplay(); this.startAutoplay(); }

  prevBenefit(): void {
    this.resetAutoplay();
    this.activeBenefitIndex = this.activeBenefitIndex === 0 ? 2 : this.activeBenefitIndex - 1;
  }

  nextBenefit(isAuto = false): void {
    if (!isAuto) { this.resetAutoplay(); }
    this.activeBenefitIndex = this.activeBenefitIndex === 2 ? 0 : this.activeBenefitIndex + 1;
  }

  setBenefit(i: number): void { this.resetAutoplay(); this.activeBenefitIndex = i; }

  setJourneyStep(index: number): void { this.activeJourneyStep = index; }

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
        gsap.from(element, { scrollTrigger: { trigger: element, start: 'top 80%', once: true }, opacity: 0, y: 22, duration: 0.2, ease: 'power3.out' });
      });
    }, this.host.nativeElement);
    ScrollTrigger.refresh();
  }

  ngOnDestroy(): void { this.stopAutoplay(); this.animationContext?.revert(); }
}
