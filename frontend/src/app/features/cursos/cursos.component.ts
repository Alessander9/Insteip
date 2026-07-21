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

    // 4 Cursos Presenciales
    {
      slug: 'digitopresion-presencial',
      title: 'Digitopresión',
      category: 'CORTOS',
      modality: 'PRESENCIAL',
      icon: 'touch_app',
      rating: 4.9,
      duration: '2 meses',
      description: 'Aprende técnicas de presión digital terapéutica para tratar contracturas, puntos gatillo y dolor musculoesquelético con seguridad clínica.',
      students: '+320',
      price: 'S/ 260',
      image: 'assets/curso_masaje.png',
      customLink: '/cursos/digitopresion-presencial'
    },
    {
      slug: 'auriculoterapia-presencial',
      title: 'Auriculoterapia',
      category: 'CORTOS',
      modality: 'PRESENCIAL',
      icon: 'hearing',
      rating: 4.9,
      duration: '2 meses',
      description: 'Domina el diagnóstico y la estimulación del pabellón auricular con técnicas orientales y occidentales para resultados clínicos reales.',
      students: '+450',
      price: 'S/ 260',
      image: 'assets/Auriculoterapia Insteip.png',
      customLink: '/cursos/auriculoterapia-presencial'
    },
    {
      slug: 'acupuntura-presencial',
      title: 'Acupuntura',
      category: 'DIPLOMADOS',
      modality: 'PRESENCIAL',
      icon: 'adjust',
      rating: 5.0,
      duration: '12 meses',
      description: 'Especialízate con la formación presencial más completa en medicina tradicional china, moxibustión y microsistemas con práctica clínica supervisada.',
      students: '+600',
      price: 'S/ 290',
      image: 'assets/AcupunturaChinaInsteip.png',
      customLink: '/cursos/acupuntura-presencial'
    },
    {
      slug: 'dietetica-presencial',
      title: 'Dietética',
      category: 'CORTOS',
      modality: 'PRESENCIAL',
      icon: 'nutrition',
      rating: 4.8,
      duration: '2 meses',
      description: 'Aprende a evaluar el estado nutricional y diseñar planes dietéticos terapéuticos para las condiciones de salud más frecuentes.',
      students: '+210',
      price: 'S/ 260',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80',
      customLink: '/cursos/dietetica-presencial'
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
