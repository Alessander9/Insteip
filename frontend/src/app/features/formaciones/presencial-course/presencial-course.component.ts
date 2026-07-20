import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../../core/components/footer/footer.component';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface PresencialCourse {
  slug: string;
  type: string;
  titleLead: string;
  titleAccent: string;
  edition: string;
  description: string;
  duration: string;
  price: string;
  priceLabel: string;
  schedule: string;
  image: string;
  icon: string;
  color: string;
  softColor: string;
  outcomes: string[];
  modules: Array<{ number: string; title: string; description: string; icon: string }>;
  audience: Array<{ title: string; description: string; icon: string }>;
}

const COURSES: Record<string, PresencialCourse> = {
  auriculoterapia: {
    slug: 'auriculoterapia', type: 'Formación profesional', titleLead: 'Formación de', titleAccent: 'Auriculoterapia', edition: 'Edición 2026',
    description: 'Aprende a identificar y estimular puntos reflejos del pabellón auricular con técnicas orientales y occidentales aplicables desde la primera sesión.',
    duration: '2 meses', price: 'S/ 260.00', priceLabel: 'Mensualidad', schedule: 'Presencial · Domingos', image: 'assets/Auriculoterapia Insteip.png', icon: 'hearing', color: '#7b2f6d', softColor: '#f7e9f3',
    outcomes: ['Kit clínico para prácticas', 'Manual y cartograma auricular', 'Certificación INSTEIP'],
    modules: [
      { number: '01', title: 'Fundamentos', description: 'Historia, neurofisiología y escuelas de auriculoterapia.', icon: 'neurology' },
      { number: '02', title: 'Somatotopía', description: 'Lectura del pabellón auricular y localización precisa de puntos.', icon: 'hearing' },
      { number: '03', title: 'Materiales', description: 'Semillas, balines, imanes, palpadores y bioseguridad.', icon: 'medical_services' },
      { number: '04', title: 'Protocolos', description: 'Abordajes para dolor, estrés, ansiedad e insomnio.', icon: 'clinical_notes' }
    ],
    audience: [
      { title: 'Profesionales de salud', description: 'Para complementar tratamientos con una técnica refleja.', icon: 'stethoscope' },
      { title: 'Terapeutas holísticos', description: 'Para ampliar servicios y mejorar resultados clínicos.', icon: 'self_improvement' },
      { title: 'Nuevos estudiantes', description: 'Para iniciar desde cero con una metodología práctica.', icon: 'school' }
    ]
  },
  'acupuntura-china': {
    slug: 'acupuntura-china', type: 'Formación anual', titleLead: 'Formación anual de', titleAccent: 'Acupuntura China', edition: 'Convocatoria 2026',
    description: 'Programa integral de medicina tradicional china para dominar canales energéticos, puntos acupunturales, moxibustión y microsistemas con práctica supervisada.',
    duration: '12 meses', price: 'S/ 290.00', priceLabel: 'Mensualidad', schedule: 'Híbrido · Teoría + clínica', image: 'assets/AcupunturaChinaInsteip.png', icon: 'adjust', color: '#003466', softColor: '#e5eef8',
    outcomes: ['240 horas académicas', 'Prácticas clínicas guiadas', 'Certificación profesional'],
    modules: [
      { number: '01', title: 'Canales y puntos', description: 'Recorrido de meridianos y localización anatómica.', icon: 'route' },
      { number: '02', title: 'Diagnóstico tradicional', description: 'Cinco elementos, valoración y principios terapéuticos.', icon: 'health_metrics' },
      { number: '03', title: 'Técnicas complementarias', description: 'Moxibustión, ventosas y electroestimulación.', icon: 'local_fire_department' },
      { number: '04', title: 'Microsistemas', description: 'Auriculoterapia, craneopuntura y reflexología.', icon: 'hub' }
    ],
    audience: [
      { title: 'Profesionales de salud', description: 'Para integrar medicina tradicional china a su práctica.', icon: 'medical_services' },
      { title: 'Terapeutas holísticos', description: 'Para profundizar diagnóstico y tratamiento energético.', icon: 'spa' },
      { title: 'Estudiantes', description: 'Para construir una carrera en terapias complementarias.', icon: 'history_edu' }
    ]
  },
  'masaje-terapeutico': {
    slug: 'masaje-terapeutico', type: 'Formación intensiva', titleLead: 'Masaje Terapéutico y', titleAccent: 'Digitopresión Mecánica', edition: 'Edición 2026',
    description: 'Domina liberación miofascial, digitopresión instrumental y protocolos para el manejo práctico del dolor y las tensiones musculares.',
    duration: '1 o 2 meses', price: 'S/ 250.00', priceLabel: 'Mensualidad', schedule: 'Presencial · Práctico', image: 'assets/MasajeDigitoPresionInsteip.png', icon: 'front_hand', color: '#8a3c24', softColor: '#faece6',
    outcomes: ['Manual técnico impreso', 'Uso de digitopresores', 'Evaluación práctica'],
    modules: [
      { number: '01', title: 'Tejido miofascial', description: 'Anatomía funcional, palpación y puntos gatillo.', icon: 'accessibility_new' },
      { number: '02', title: 'Maniobras manuales', description: 'Amasamiento, fricción y liberación profunda.', icon: 'back_hand' },
      { number: '03', title: 'Digitopresión', description: 'Uso seguro de herramientas y dosificación de fuerza.', icon: 'pan_tool' },
      { number: '04', title: 'Abordaje clínico', description: 'Protocolos para espalda, cuello y extremidades.', icon: 'clinical_notes' }
    ],
    audience: [
      { title: 'Masajistas', description: 'Para perfeccionar técnica y aumentar efectividad.', icon: 'front_hand' },
      { title: 'Rehabilitadores', description: 'Para complementar el abordaje musculoesquelético.', icon: 'physical_therapy' },
      { title: 'Emprendedores', description: 'Para iniciar servicios profesionales de bienestar.', icon: 'storefront' }
    ]
  },
  'reflexologia-podal-presencial': {
    slug: 'reflexologia-podal-presencial', type: 'Taller Full Day', titleLead: 'Taller de', titleAccent: 'Reflexología Podal', edition: 'Jornada práctica',
    description: 'Aprende a interpretar zonas reflejas del pie y aplicar una secuencia terapéutica para promover relajación, equilibrio y bienestar integral.',
    duration: 'Full Day', price: 'S/ 130.00', priceLabel: 'Pago único', schedule: '1 día completo · Presencial', image: 'https://images.unsplash.com/photo-1519689680058-324335c77ebe?auto=format&fit=crop&w=1200&q=85', icon: 'footprint', color: '#256657', softColor: '#e6f3ef',
    outcomes: ['Mapa podal ilustrado', 'Secuencia práctica completa', 'Certificado de participación'],
    modules: [
      { number: '01', title: 'Mapa reflejo', description: 'Correspondencia entre pies, órganos y sistemas.', icon: 'map' },
      { number: '02', title: 'Preparación', description: 'Valoración, higiene, postura y acondicionamiento.', icon: 'clean_hands' },
      { number: '03', title: 'Técnicas', description: 'Presiones, deslizamientos y movilización del pie.', icon: 'front_hand' },
      { number: '04', title: 'Protocolos', description: 'Secuencias para estrés, digestión y tensión corporal.', icon: 'assignment' }
    ],
    audience: [
      { title: 'Masajistas', description: 'Para incorporar reflexología a sus sesiones.', icon: 'front_hand' },
      { title: 'Terapeutas', description: 'Para sumar una técnica relajante y no invasiva.', icon: 'spa' },
      { title: 'Público general', description: 'Para aprender autocuidado y bienestar familiar.', icon: 'family_home' }
    ]
  },
  'paralisis-facial-presencial': {
    slug: 'paralisis-facial-presencial', type: 'Taller Full Day', titleLead: 'Acupuntura en', titleAccent: 'Parálisis Facial', edition: 'Práctica clínica',
    description: 'Entrenamiento intensivo para abordar la parálisis facial mediante acupuntura, estimulación refleja y ejercicios complementarios de rehabilitación.',
    duration: 'Full Day', price: 'S/ 180.00', priceLabel: 'Pago único', schedule: '1 día completo · Presencial', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=85', icon: 'face', color: '#74455f', softColor: '#f4eaf0',
    outcomes: ['Guía de puntos faciales', 'Práctica de localización', 'Protocolo clínico estructurado'],
    modules: [
      { number: '01', title: 'Bases anatómicas', description: 'Nervio facial, músculos y signos clínicos.', icon: 'neurology' },
      { number: '02', title: 'Valoración', description: 'Reconocimiento de fases y criterios de atención.', icon: 'diagnosis' },
      { number: '03', title: 'Puntos terapéuticos', description: 'Selección local, distal y auricular.', icon: 'adjust' },
      { number: '04', title: 'Práctica integrada', description: 'Secuencia, seguimiento y recomendaciones.', icon: 'clinical_notes' }
    ],
    audience: [
      { title: 'Acupunturistas', description: 'Para especializar su abordaje neuromuscular.', icon: 'adjust' },
      { title: 'Fisioterapeutas', description: 'Para complementar la rehabilitación facial.', icon: 'physical_therapy' },
      { title: 'Profesionales de salud', description: 'Para actualizar criterios y protocolos de apoyo.', icon: 'medical_services' }
    ]
  },
  'moxibustion-ventosas-presencial': {
    slug: 'moxibustion-ventosas-presencial', type: 'Taller / Seminario', titleLead: 'Moxibustión y', titleAccent: 'Ventosaterapia', edition: 'Técnicas tradicionales',
    description: 'Aprende a aplicar calor terapéutico y presión negativa para aliviar tensión, movilizar tejidos y complementar tratamientos de bienestar.',
    duration: '1 o 2 días', price: 'Desde S/ 130.00', priceLabel: 'Pago único', schedule: 'Presencial · Intensivo', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=85', icon: 'local_fire_department', color: '#a04422', softColor: '#faebe4',
    outcomes: ['Materiales de práctica', 'Protocolos de seguridad', 'Certificado de participación'],
    modules: [
      { number: '01', title: 'Moxibustión', description: 'Fundamentos, tipos de moxa y aplicación segura.', icon: 'local_fire_department' },
      { number: '02', title: 'Ventosas', description: 'Ventosa fija, móvil y técnicas de succión.', icon: 'bubble_chart' },
      { number: '03', title: 'Indicaciones', description: 'Dolor, frío, tensión muscular y circulación.', icon: 'fact_check' },
      { number: '04', title: 'Práctica', description: 'Preparación, secuencias y manejo del material.', icon: 'science' }
    ],
    audience: [
      { title: 'Acupunturistas', description: 'Para potenciar tratamientos tradicionales.', icon: 'adjust' },
      { title: 'Masajistas', description: 'Para complementar liberación muscular y fascial.', icon: 'front_hand' },
      { title: 'Terapeutas', description: 'Para sumar calor y vacío a su práctica.', icon: 'spa' }
    ]
  },
  'acupuntura-estetica-presencial': {
    slug: 'acupuntura-estetica-presencial', type: 'Taller Full Day', titleLead: 'Taller de', titleAccent: 'Acupuntura Estética', edition: 'Belleza integrativa',
    description: 'Técnicas de estimulación facial y corporal orientadas al bienestar estético, la tonificación y el cuidado integral de la piel.',
    duration: 'Full Day', price: 'S/ 130.00', priceLabel: 'Pago único', schedule: '1 día completo · Presencial', image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1200&q=85', icon: 'face_retouching_natural', color: '#a44b71', softColor: '#f9eaf1',
    outcomes: ['Mapa facial de puntos', 'Práctica supervisada', 'Certificado de participación'],
    modules: [
      { number: '01', title: 'Anatomía facial', description: 'Músculos, líneas de tensión y zonas de trabajo.', icon: 'face' },
      { number: '02', title: 'Puntos estéticos', description: 'Selección y localización según objetivos.', icon: 'target' },
      { number: '03', title: 'Técnica segura', description: 'Higiene, inserción superficial y cuidados.', icon: 'health_and_safety' },
      { number: '04', title: 'Protocolos', description: 'Tonificación, relajación y cuidado facial.', icon: 'auto_awesome' }
    ],
    audience: [
      { title: 'Acupunturistas', description: 'Para ampliar servicios hacia estética integrativa.', icon: 'adjust' },
      { title: 'Esteticistas', description: 'Para incorporar estimulación tradicional segura.', icon: 'face_retouching_natural' },
      { title: 'Terapeutas', description: 'Para sumar bienestar facial a su portafolio.', icon: 'spa' }
    ]
  },
  'stretching-terapeutico-presencial': {
    slug: 'stretching-terapeutico-presencial', type: 'Taller Full Day', titleLead: 'Taller de', titleAccent: 'Stretching Terapéutico', edition: 'Movilidad y recuperación',
    description: 'Aprende estiramientos asistidos para mejorar movilidad, reducir tensión y diseñar sesiones seguras de recuperación corporal.',
    duration: 'Full Day', price: 'S/ 130.00', priceLabel: 'Pago único', schedule: '1 día completo · Presencial', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=85', icon: 'accessibility_new', color: '#365f94', softColor: '#e8f0fa',
    outcomes: ['Manual de secuencias', 'Práctica por cadenas musculares', 'Certificado de participación'],
    modules: [
      { number: '01', title: 'Movilidad', description: 'Rangos articulares y evaluación inicial.', icon: 'accessibility_new' },
      { number: '02', title: 'Cadenas musculares', description: 'Lectura de tensiones y patrones acortados.', icon: 'route' },
      { number: '03', title: 'Estiramiento asistido', description: 'Técnicas pasivas, activas y controladas.', icon: 'sports_gymnastics' },
      { number: '04', title: 'Sesión terapéutica', description: 'Dosificación, secuencia y contraindicaciones.', icon: 'assignment' }
    ],
    audience: [
      { title: 'Masajistas', description: 'Para cerrar sesiones con movilidad segura.', icon: 'front_hand' },
      { title: 'Entrenadores', description: 'Para mejorar recuperación y flexibilidad.', icon: 'fitness_center' },
      { title: 'Fisioterapeutas', description: 'Para ampliar recursos de movilidad asistida.', icon: 'physical_therapy' }
    ]
  }
};

@Component({
  selector: 'app-presencial-course',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './presencial-course.component.html',
  styleUrls: ['./presencial-course.component.css']
})
export class PresencialCourseComponent implements AfterViewInit, OnDestroy {
  course: PresencialCourse;
  private animationContext?: gsap.Context;

  constructor(route: ActivatedRoute, private readonly host: ElementRef<HTMLElement>) {
    const slug = route.snapshot.data['course'] as string;
    this.course = COURSES[slug] ?? COURSES['auriculoterapia'];
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);
    this.animationContext = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro
        .from('.pc-kicker', { opacity: 0, y: -12, duration: 0.45 })
        .from('.pc-title', { opacity: 0, y: 24, duration: 0.75 }, '-=0.2')
        .from('.pc-description, .pc-actions', { opacity: 0, y: 12, stagger: 0.08, duration: 0.45 }, '-=0.4')
        .from('.pc-visual', { opacity: 0, scale: 0.96, duration: 0.75 }, '-=0.6')
        .from('.pc-stat', { opacity: 0, y: 12, stagger: 0.07, duration: 0.4 }, '-=0.4');

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
        gsap.from(element, {
          scrollTrigger: { trigger: element, start: 'top 86%', once: true },
          opacity: 0,
          y: 24,
          duration: 0.65,
          ease: 'power3.out'
        });
      });
    }, this.host.nativeElement);

    ScrollTrigger.refresh();
  }

  ngOnDestroy(): void {
    this.animationContext?.revert();
  }
}
