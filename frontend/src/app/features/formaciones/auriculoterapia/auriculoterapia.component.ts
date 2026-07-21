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
  selector: 'app-auriculoterapia',
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
  templateUrl: './auriculoterapia.component.html',
  styleUrls: ['./auriculoterapia.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AuriculoterapiaComponent implements OnInit, AfterViewInit, OnDestroy {
  private animationContext?: gsap.Context;
  activeBenefitIndex = 0;
  activeJourneyStep = 0;
  private autoplayInterval?: any;

  readonly journeySteps = [
    {
      shortTitle: 'Fundamentos',
      period: 'Módulo 1',
      icon: 'neurology',
      title: 'Comprende la neurofisiología auricular',
      description: 'Principios científicos e históricos de la tradición china y la reflexología francesa del Dr. Nogier.',
      outcomes: ['Historia y aportes', 'Diferencias de enfoque', 'Neurofisiología auricular']
    },
    {
      shortTitle: 'Técnica',
      period: 'Módulo 2',
      icon: 'biotech',
      title: 'Domina la somatotopía y los materiales',
      description: 'Mapeo de la oreja, uso de insumos clínicos y aplicación segura de las técnicas auriculares.',
      outcomes: ['Somatotopía auricular', 'Materiales e insumos', 'Masaje auricular exclusivo']
    },
    {
      shortTitle: 'Clínica',
      period: 'Módulo 3',
      icon: 'medical_services',
      title: 'Aplica protocolos clínicos efectivos',
      description: 'Tratamientos terapéuticos para dolor, estrés, peso y trastornos nerviosos con ética profesional.',
      outcomes: ['Protocolos de regulación', 'Aplicación específica', 'Ética y bioseguridad']
    }
  ];

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  // Syllabus configuration data
  syllabusData: SyllabusPhase[] = [
    {
      id: 'fase1',
      tabLabel: '01 · Fundamentos y Neurofisiología',
      title: 'Módulo 1: Fundamentos y Neurofisiología',
      description: 'Principios científicos e históricos de la tradición china y la reflexología francesa.',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Fundamentos Auriculares',
      specimenLabel: 'SPECIMEN // TEORÍA Y NEUROFISIOLOGÍA',
      items: [
        { number: '01', title: 'Historia y Aportes', badge1: 'Origen', badge2: 'Dr. Nogier', description: 'Historia de la auriculoterapia tradicional y los aportes fundamentales de la escuela reflexológica francesa del Dr. Paul Nogier.' },
        { number: '02', title: 'Diferencias de Enfoque', badge1: 'Modelos', badge2: 'Enfoques', description: 'Diferencias estructurales y metodológicas entre las cartografías auriculares tradicionales orientales y los mapas clínicos occidentales.' },
        { number: '03', title: 'Neurofisiología Auricular', badge1: 'Neuro', badge2: 'Vago', description: 'Inervación del pabellón auricular, arcos reflejos y la función diagnóstica y terapéutica ligada al nervio vago.' }
      ]
    },
    {
      id: 'fase2',
      tabLabel: '02 · Somatotopía y Materiales',
      title: 'Módulo 2: Somatotopía y Materiales',
      description: 'Mapeo de la oreja, uso de insumos clínicos y aplicación segura de la técnica.',
      image: 'https://images.unsplash.com/photo-1600335895229-6e75511892c8?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Somatotopía y Materiales',
      specimenLabel: 'SPECIMEN // SOMATOTOPÍA Y PRÁCTICA',
      items: [
        { number: '01', title: 'Somatotopía Auricular', badge1: 'Mapeo', badge2: 'Feto Invertido', description: 'Estudio de las proyecciones reflejas orgánicas y la analogía clásica del feto invertido en la oreja.' },
        { number: '02', title: 'Materiales e Insumos', badge1: 'Invasivo', badge2: 'Agujas', description: 'Uso clínico de chinchetas, balines magnéticos, semillas de vaccaria, agujas filiformes y aplicadores.' },
        { number: '03', title: 'Masaje Auricular', badge1: 'Exclusivo', badge2: 'Técnica', description: 'Técnica exclusiva de manipulación y masaje del pabellón auricular desarrollada por Emanuel Cabanillas.' }
      ]
    },
    {
      id: 'fase3',
      tabLabel: '03 · Puntos y Protocolos Clínicos',
      title: 'Módulo 3: Puntos y Protocolos Clínicos',
      description: 'Tratamientos terapéuticos para dolor, estrés, peso y trastornos nerviosos.',
      image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80',
      imageAlt: 'Protocolos Clínicos',
      specimenLabel: 'SPECIMEN // PROTOCOLOS CLÍNICOS AURICULARES',
      items: [
        { number: '01', title: 'Protocolo de Regulación Inicial', badge1: 'Básico', badge2: 'Shen Men', description: 'Localización y estimulación del triángulo de regulación sistémica primario: Shen Men, Riñón y Simpático.' },
        { number: '02', title: 'Protocolos de Aplicación Específica', badge1: 'Tratamiento', badge2: 'Ansiedad', description: 'Tratamiento específico de patologías comunes: reducción de peso y apetito, ansiedad, insomnio y contracturas musculares.' },
        { number: '03', title: 'Ética y Bioseguridad', badge1: 'Clínica', badge2: 'Normativa', description: 'Higiene, asepsia del pabellón, desecho de materiales clínicos y principios éticos indispensables en consultorio.' }
      ]
    }
  ];

  // Teacher configuration data
  docenteData: DocenteData = {
    nombre: 'Emanuel Cabanillas Bardales',
    cargo: 'Docente Especialista',
    biografia: '<span class=\"text-brand-blue font-semibold\">Fisioterapeuta</span> con más de 12 años de experiencia clínica, instructor de Pilates clínico, especialista en terapias manuales y medicina tradicional china. <span class=\"text-brand-blue font-semibold\">Ponente de primer nivel</span> exclusivo en INSTEIP.',
    fotoUrl: 'https://static.wixstatic.com/media/3c52e9_21f716254eb94148954b4982e67769c0~mv2.jpg',
    kicker: 'DOCENCIA EXCLUSIVA',
    especialidades: [
      { icon: 'verified', label: '+12 años de Exp.' },
      { icon: 'school', label: 'Ponente Exclusivo' }
    ]
  };

  // CTA configuration data
  ctaData: CourseCtaData = {
    precio: 260,
    cuotasInfo: 'Matrícula S/ 30 + 1 mensualidad de S/ 260 · Sin intereses',
    plazasDisponibles: 8,
    whatsappLink: 'https://wa.me/51939371250',
    email: 'ecabanillasbardales@gmail.com',
    beneficios: [
      'Kit clínico completo para las prácticas en clase',
      'Manual impreso ilustrado y cartograma A4 plastificado',
      'Certificado oficial emitido por INSTEIP',
      'Acceso de por vida al grupo de soporte exclusivo con el docente'
    ],
    headlineHtml: 'Domina la terapia<br><span class=\"text-secondary\">refleja auricular</span>',
    description: 'Reserva tu cupo por S/ 30 y asegura tu vacante presencial en Lince. Materiales y kit clínico incluidos.',
    faqs: [
      { icon: 'help', pregunta: '¿Sin experiencia previa?', respuesta: 'No se requieren conocimientos previos. El curso comienza desde los fundamentos.' },
      { icon: 'schedule', pregunta: '¿Son clases teóricas o prácticas?', respuesta: 'Ambas. Teoría presencial con práctica supervisada desde la primera clase.' },
      { icon: 'verified', pregunta: '¿El certificado es válido?', respuesta: 'Sí. Emitido por INSTEIP con respaldo institucional reconocido.' },
      { icon: 'inventory', pregunta: '¿Qué incluye el kit?', respuesta: 'Semillas de vaccaria, balines de oro y plata, imanes y aplicadores.' }
    ],
    trustText: 'Pago seguro · Materiales incluidos · Grupos reducidos · Asesoría antes de matricularte'
  };

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

  prevBenefit() {
    this.resetAutoplay();
    this.activeBenefitIndex = this.activeBenefitIndex === 0 ? 2 : this.activeBenefitIndex - 1;
  }

  nextBenefit(isAuto = false) {
    if (!isAuto) {
      this.resetAutoplay();
    }
    this.activeBenefitIndex = this.activeBenefitIndex === 2 ? 0 : this.activeBenefitIndex + 1;
  }

  setBenefit(i: number) {
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
        gsap.set(element, { autoAlpha: 1, y: 0 });
        ScrollTrigger.create({
          trigger: element,
          start: 'top 88%',
          once: true,
          onEnter: () => {
            gsap.fromTo(element,
              { autoAlpha: 0, y: 22 },
              { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out', overwrite: 'auto' }
            );
          }
        });
      });
      window.setTimeout(() => {
        gsap.set('[data-reveal]', { autoAlpha: 1, y: 0, clearProps: 'visibility,opacity,transform' });
      }, 1200);
    }, this.host.nativeElement);

    ScrollTrigger.refresh();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    this.animationContext?.revert();
  }
}
