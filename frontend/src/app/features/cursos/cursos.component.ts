import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../core/components/footer/footer.component';

interface Curso {
  slug: string;
  title: string;
  category: 'CORTOS' | 'DIPLOMADOS';
  modality: 'ONLINE' | 'PRESENCIAL';
  icon: string;
  rating: number;
  duration: string;
  description: string;
  students: string;
  price: string;
  image: string;
  customLink?: string;
}

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.css']
})
export class PublicCursosComponent {
  filter: 'TODOS' | 'CORTOS' | 'DIPLOMADOS' = 'TODOS';
  searchTerm: string = '';
  sortBy: string = 'POPULARIDAD';

  cursos: Curso[] = [
    // 3 Cursos Online (del Navbar)
    {
      slug: 'acupuntura-china-online',
      title: 'Acupuntura China (Online)',
      category: 'DIPLOMADOS',
      modality: 'ONLINE',
      icon: 'spa',
      rating: 4.9,
      duration: 'Online / Acceso virtual',
      description: 'Formación profesional en medicina tradicional china con acceso virtual.',
      students: '+1,200',
      price: 'S/ 180',
      image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80',
      customLink: '/cursos/acupuntura-china'
    },
    {
      slug: 'auriculoterapia-online',
      title: 'Auriculoterapia (Online)',
      category: 'CORTOS',
      modality: 'ONLINE',
      icon: 'hearing',
      rating: 4.9,
      duration: 'Online / Acceso virtual',
      description: 'Diagnóstico, mapeo y estímulo terapéutico del pabellón auricular.',
      students: '+850',
      price: 'S/ 150',
      image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80',
      customLink: '/cursos/auriculoterapia'
    },
    {
      slug: 'masaje-terapeutico-online',
      title: 'Masaje Terapéutico (Online)',
      category: 'CORTOS',
      modality: 'ONLINE',
      icon: 'physical_therapy',
      rating: 4.8,
      duration: 'Online / Acceso virtual',
      description: 'Técnicas manuales y protocolos clínicos orientados a la salud y bienestar físico.',
      students: '+600',
      price: 'S/ 160',
      image: 'https://images.unsplash.com/photo-1600335895229-6e75511892c8?auto=format&fit=crop&w=800&q=80',
      customLink: '/cursos/masaje-terapeutico'
    },

    // 8 Cursos y Talleres Presenciales
    {
      slug: 'auriculoterapia',
      title: 'Formación de Auriculoterapia (Edición 2026)',
      category: 'DIPLOMADOS',
      modality: 'PRESENCIAL',
      icon: 'hearing',
      rating: 4.9,
      duration: '2 meses',
      description: 'Aprende de forma práctica, segura y con técnicas 100% efectivas para obtener resultados reales con tus pacientes desde la primera sesión.',
      students: '+450',
      price: 'S/ 260',
      image: 'assets/Auriculoterapia Insteip.png',
      customLink: '/cursos/auriculoterapia'
    },
    {
      slug: 'acupuntura-china',
      title: 'Formación Anual de Acupuntura China (Convocatoria 2026)',
      category: 'DIPLOMADOS',
      modality: 'PRESENCIAL',
      icon: 'adjust',
      rating: 5.0,
      duration: '12 meses',
      description: 'Especialízate con el programa anual más completo de medicina tradicional china, moxibustión y microsistemas.',
      students: '+600',
      price: 'S/ 290',
      image: 'assets/AcupunturaChinaInsteip.png',
      customLink: '/cursos/acupuntura-china'
    },
    {
      slug: 'masaje-terapeutico',
      title: 'Masaje Terapéutico y Digitopresión Mecánica (Edición 2026)',
      category: 'CORTOS',
      modality: 'PRESENCIAL',
      icon: 'front_hand',
      rating: 4.8,
      duration: '1 o 2 meses',
      description: 'Domina técnicas avanzadas de liberación miofascial, digitopresión instrumental y manejo del dolor.',
      students: '+320',
      price: 'S/ 250',
      image: 'assets/MasajeDigitoPresionInsteip.png',
      customLink: '/cursos/masaje-terapeutico'
    },
    {
      slug: 'reflexologia-podal-presencial',
      title: 'Taller: Reflexología Podal (Full Day)',
      category: 'CORTOS',
      modality: 'PRESENCIAL',
      icon: 'front_hand',
      rating: 4.9,
      duration: 'Full Day',
      description: 'Aprende a ubicar puntos reflejos en los pies, aplicar técnicas de masaje y usar protocolos para estrés, digestión y dolor.',
      students: '+180',
      price: 'S/ 130',
      image: 'https://images.unsplash.com/photo-1519689680058-324335c77ebe?auto=format&fit=crop&w=800&q=80',
      customLink: '/cursos/reflexologia-podal-presencial'
    },
    {
      slug: 'paralisis-facial-presencial',
      title: 'Taller: Acupuntura en Parálisis Facial (Full Day)',
      category: 'CORTOS',
      modality: 'PRESENCIAL',
      icon: 'face',
      rating: 4.9,
      duration: 'Full Day',
      description: 'Auriculoterapia para equilibrio emocional y fisioterapia aplicada al abordaje práctico de la parálisis facial.',
      students: '+95',
      price: 'S/ 180',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
      customLink: '/cursos/paralisis-facial-presencial'
    },
    {
      slug: 'moxibustion-ventosas-presencial',
      title: 'Taller / Seminario de Moxibustión y Ventosas',
      category: 'CORTOS',
      modality: 'PRESENCIAL',
      icon: 'local_fire_department',
      rating: 4.9,
      duration: '1 o 2 días',
      description: 'Aprende moxibustión (terapia de calor) y ventosaterapia (terapia al vacío) para tratar inflamación y dolor.',
      students: '+220',
      price: 'S/ 130',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
      customLink: '/cursos/moxibustion-ventosas-presencial'
    },
    {
      slug: 'acupuntura-estetica-presencial',
      title: 'Taller: Acupuntura Estética (Full Day)',
      category: 'CORTOS',
      modality: 'PRESENCIAL',
      icon: 'face',
      rating: 4.8,
      duration: 'Full Day',
      description: 'Rejuvenece de forma natural armonizando belleza, energía y técnicas orientadas al rostro.',
      students: '+140',
      price: 'S/ 130',
      image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80',
      customLink: '/cursos/acupuntura-estetica-presencial'
    },
    {
      slug: 'stretching-terapeutico-presencial',
      title: 'Taller: Stretching Terapéutico (Full Day)',
      category: 'CORTOS',
      modality: 'PRESENCIAL',
      icon: 'sports_gymnastics',
      rating: 4.8,
      duration: 'Full Day',
      description: 'Técnicas de estiramiento terapéutico para mejorar movilidad, descargar tensión y optimizar el bienestar corporal.',
      students: '+160',
      price: 'S/ 130',
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80',
      customLink: '/cursos/stretching-terapeutico-presencial'
    }
  ];

  setFilter(f: 'TODOS' | 'CORTOS' | 'DIPLOMADOS') {
    this.filter = f;
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
  }

  onSort(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.sortBy = select.value;
  }

  getOnlineCursos() {
    return this.filteredCursos().filter(c => c.modality === 'ONLINE');
  }

  getPresencialCursos() {
    return this.filteredCursos().filter(c => c.modality === 'PRESENCIAL');
  }

  filteredCursos() {
    let list = this.cursos;

    // Filter by category
    if (this.filter !== 'TODOS') {
      list = list.filter(c => c.category === this.filter);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      list = list.filter(c => c.title.toLowerCase().includes(term) || c.description.toLowerCase().includes(term));
    }

    // Sort
    if (this.sortBy === 'PRECIO_ASC') {
      list = [...list].sort((a, b) => this.parsePrice(a.price) - this.parsePrice(b.price));
    } else if (this.sortBy === 'PRECIO_DESC') {
      list = [...list].sort((a, b) => this.parsePrice(b.price) - this.parsePrice(a.price));
    }

    return list;
  }

  private parsePrice(priceStr: string): number {
    return parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
  }
}
