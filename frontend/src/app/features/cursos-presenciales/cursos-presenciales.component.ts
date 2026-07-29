import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../core/components/footer/footer.component';

interface Curso {
  slug: string;
  title: string;
  category: 'CORTOS' | 'DIPLOMADOS';
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
  selector: 'app-cursos-presenciales',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './cursos-presenciales.component.html',
  styleUrls: ['./cursos-presenciales.component.css']
})
export class CursosPresencialesComponent {
  filter: 'TODOS' | 'CORTOS' | 'DIPLOMADOS' = 'TODOS';
  searchTerm: string = '';
  sortBy: string = 'POPULARIDAD';

  cursos: Curso[] = [
    {
      slug: 'digitopresion-presencial',
      title: 'Digitopresión Mecánica',
      category: 'CORTOS',
      icon: 'touch_app',
      rating: 4.9,
      duration: '2 meses',
      description: 'Aprende técnicas de presión digital terapéutica para tratar contracturas, puntos gatillo y dolor musculoesquelético con seguridad clínica.',
      students: '+320',
      price: 'S/ 260/mes',
      image: 'assets/digitopresion_presencial.jpg',
      customLink: '/cursos/digitopresion-presencial'
    },
    {
      slug: 'auriculoterapia-presencial',
      title: 'Auriculoterapia',
      category: 'CORTOS',
      icon: 'hearing',
      rating: 4.9,
      duration: '2 meses',
      description: 'Domina el diagnóstico y la estimulación del pabellón auricular con técnicas orientales y occidentales para resultados clínicos reales.',
      students: '+450',
      price: 'S/ 260/mes',
      image: 'assets/curso_auriculoterapia_presencial.jpg',
      customLink: '/cursos/auriculoterapia-presencial'
    },
    {
      slug: 'acupuntura-china-7-meses',
      title: 'Acupuntura China (7 meses)',
      category: 'DIPLOMADOS',
      icon: 'adjust',
      rating: 4.9,
      duration: '7 meses',
      description: 'Formación profesional intensiva para dominar los principios de la Medicina Tradicional China y aprender la práctica clínica de la acupuntura.',
      students: '+150',
      price: 'S/ 150/mes',
      image: 'assets/acupuntura_7meses.jpg',
      customLink: '/cursos/acupuntura-china-7-meses'
    },
    {
      slug: 'acupuntura-presencial',
      title: 'Acupuntura China (12 meses)',
      category: 'DIPLOMADOS',
      icon: 'adjust',
      rating: 5.0,
      duration: '12 meses',
      description: 'Especialízate con la formación presencial más completa en medicina tradicional china, moxibustión y microsistemas con práctica clínica supervisada.',
      students: '+600',
      price: 'S/ 270/mes',
      image: 'assets/acupuntura_china_presencial.jpg',
      customLink: '/cursos/acupuntura-presencial'
    },
    {
      slug: 'dietetica-presencial',
      title: 'Dietética',
      category: 'CORTOS',
      icon: 'nutrition',
      rating: 4.8,
      duration: '1 mes',
      description: 'Aprende a evaluar el estado nutricional y diseñar planes dietéticos terapéuticos para las condiciones de salud más frecuentes.',
      students: '+210',
      price: 'S/ 250/mes',
      image: 'assets/curso_dietetica.jpg',
      customLink: '/cursos/dietetica-presencial'
    },
    {
      slug: 'fitoterapia-presencial',
      title: 'Fitoterapia',
      category: 'CORTOS',
      icon: 'local_pharmacy',
      rating: 4.9,
      duration: '1 mes',
      description: 'Aprende el uso terapéutico de las plantas medicinales de forma segura, práctica y basada en la evidencia científica.',
      students: '+180',
      price: 'S/ 250/mes',
      image: 'assets/fitoterapia_insteip.jpg',
      customLink: '/cursos/fitoterapia-presencial'
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

  filteredCursos() {
    let list = this.cursos;

    if (this.filter !== 'TODOS') {
      list = list.filter(c => c.category === this.filter);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      list = list.filter(c =>
        c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term)
      );
    }

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
