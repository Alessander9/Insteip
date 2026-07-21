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
  selector: 'app-dietetica-presencial',
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
  templateUrl: './dietetica-presencial.component.html',
  styleUrls: ['./dietetica-presencial.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DieteticaPresencialComponent implements OnInit, AfterViewInit, OnDestroy {
  private animationContext?: gsap.Context;
  activeBenefitIndex = 0;
  activeJourneyStep = 0;
  private autoplayInterval?: ReturnType<typeof setInterval>;

  readonly journeySteps = [
    {
      shortTitle: 'Fundamentos',
      period: 'Semana 1 al 3',
      icon: 'nutrition',
      title: 'Bases de nutrición y dietética clínica',
      description: 'Aprende los principios de la nutrición humana, los macronutrientes, micronutrientes y su rol en la salud integral.',
      outcomes: ['Macronutrientes y micronutrientes', 'Metabolismo energético', 'Valoración nutricional']
    },
    {
      shortTitle: 'Evaluación',
      period: 'Semana 4 al 6',
      icon: 'monitoring',
      title: 'Evaluación nutricional y planificación',
      description: 'Desarrolla habilidades para evaluar el estado nutricional y diseñar planes dietéticos adaptados a cada paciente.',
      outcomes: ['Antropometría clínica', 'Análisis dietético', 'Planes nutricionales']
    },
    {
      shortTitle: 'Profesión',
      period: 'Semana 7 al 8',
      icon: 'workspace_premium',
      title: 'Aplicación clínica y certificación',
      description: 'Pon en práctica tus conocimientos con casos reales y obtén la certificación profesional de Insteip.',
      outcomes: ['Casos clínicos reales', 'Dietética terapéutica', 'Certificación institucional']
    }
  ];

  syllabusData: SyllabusPhase[] = [
    {
      id: 'fase1',
      tabLabel: '01 · Nutrición Básica (Semanas 1-4)',
      title: 'Fase 1: Fundamentos de Nutrición y Dietética',
      description: 'Estudio de los principios nutricionales, el metabolismo y los métodos de evaluación del estado nutricional.',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Nutrición y dietética',
      specimenLabel: 'SPECIMEN // FUNDAMENTOS DE NUTRICIÓN CLÍNICA',
      items: [
        { number: '01', title: 'Macronutrientes y Micronutrientes', badge1: 'Teoría', badge2: 'Fase 1', description: 'Funciones, fuentes alimentarias y requerimientos de proteínas, grasas, carbohidratos, vitaminas y minerales.' },
        { number: '02', title: 'Metabolismo Energético', badge1: 'Fisiología', badge2: 'Fase 1', description: 'Cálculo del gasto energético basal, total y ajuste por actividad física y condición de salud.' },
        { number: '03', title: 'Valoración Nutricional', badge1: 'Evaluación', badge2: 'Clínica', description: 'Métodos antropométricos, bioquímicos, clínicos y dietéticos para la valoración integral del estado nutricional.' },
        { number: '04', title: 'Alimentación Saludable', badge1: 'Preventiva', badge2: 'Fase 1', description: 'Principios de una alimentación equilibrada, guías alimentarias y estrategias de educación nutricional.' }
      ]
    },
    {
      id: 'fase2',
      tabLabel: '02 · Dietética Clínica (Semanas 5-8)',
      title: 'Fase 2: Dietética Clínica y Terapéutica',
      description: 'Diseño de planes dietéticos específicos para condiciones de salud frecuentes y práctica clínica supervisada.',
      image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Dietética clínica',
      specimenLabel: 'SPECIMEN // DIETAS TERAPÉUTICAS Y PLANES NUTRICIONALES',
      items: [
        { number: '01', title: 'Dieta en Obesidad y Sobrepeso', badge1: 'Terapéutica', badge2: 'Fase 2', description: 'Estrategias dietéticas basadas en evidencia para el manejo del exceso de peso y la obesidad.' },
        { number: '02', title: 'Nutrición en Diabetes', badge1: 'Metabólica', badge2: 'Fase 2', description: 'Planificación dietética para el control glucémico y la prevención de complicaciones en diabetes tipo 2.' },
        { number: '03', title: 'Dieta Antiinflamatoria', badge1: 'Integral', badge2: 'Fase 2', description: 'Selección de alimentos y patrones dietéticos con efecto antiinflamatorio para la salud musculoesquelética.' },
        { number: '04', title: 'Planes Nutricionales Prácticos', badge1: 'Aplicada', badge2: 'Práctica', description: 'Elaboración de menús semanales completos y planes nutricionales personalizados bajo supervisión docente.' }
      ]
    }
  ];

  docenteData: DocenteData = {
    nombre: 'Docente Especialista en Nutrición',
    cargo: 'Nutricionista Clínico',
    biografia: 'Profesional especializado en <span class="text-brand-blue font-semibold">Dietética y Nutrición Clínica</span> con amplia experiencia en el diseño de planes nutricionales terapéuticos y la educación en salud integral en <span class="text-brand-blue font-semibold">Lima, Perú</span>.',
    fotoUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&q=80',
    kicker: 'DOCENCIA ESPECIALIZADA',
    especialidades: [
      { icon: 'verified', label: 'Nutricionista Clínico' },
      { icon: 'school', label: 'Docente Certificado' }
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
      'Material didáctico digital oficial incluido',
      'Guías de planes nutricionales de referencia',
      'Certificado profesional oficial emitido por Insteip'
    ],
    headlineHtml: 'El momento de iniciar tu<br><span class="text-secondary">carrera en dietética</span> es ahora.',
    description: 'Cupos <span class="text-brand-blue font-semibold">muy limitados</span> por grupo. Una vez llenos, la siguiente convocatoria puede demorar meses. Reserva tu lugar hoy.',
    faqs: [
      { icon: 'help', pregunta: '¿Sin experiencia previa?', respuesta: 'No se requieren conocimientos previos. Comenzamos desde los fundamentos de la nutrición.' },
      { icon: 'schedule', pregunta: '¿Cuándo son las clases?', respuesta: 'Domingos de 10:00 AM a 1:00 PM en nuestro centro en Lince, Lima.' },
      { icon: 'verified', pregunta: '¿El certificado es válido?', respuesta: 'Sí. Emitido por Insteip con respaldo institucional reconocido en Perú.' },
      { icon: 'location_on', pregunta: '¿Dónde son las clases?', respuesta: 'En nuestro centro en Lince, Lima — grupos reducidos de máximo 8 personas.' }
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
