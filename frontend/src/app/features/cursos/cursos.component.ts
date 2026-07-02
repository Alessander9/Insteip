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
}

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './cursos.component.html',
  styleUrls: []
})
export class PublicCursosComponent {
  filter: 'TODOS' | 'CORTOS' | 'DIPLOMADOS' = 'TODOS';
  searchTerm: string = '';
  sortBy: string = 'POPULARIDAD';

  cursos: Curso[] = [
    {
      slug: 'fundamentos-reiki',
      title: 'Fundamentos de Reiki',
      category: 'CORTOS',
      icon: 'auto_stories',
      rating: 4.9,
      duration: '15 horas',
      description: 'Domina las bases de la sanación energética desde tu hogar para aplicar en el día a día.',
      students: '+1,200',
      price: 'S/ 180',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80'
    },
    {
      slug: 'acupresion-practica',
      title: 'Acupresión Práctica',
      category: 'CORTOS',
      icon: 'vital_signs',
      rating: 4.8,
      duration: '12 horas',
      description: 'Aprende técnicas rápidas de alivio del dolor y estrés usando puntos de presión.',
      students: '+850',
      price: 'S/ 220',
      image: 'https://images.unsplash.com/photo-1519689680058-324335c77ebe?auto=format&fit=crop&w=800&q=80'
    },
    {
      slug: 'aromaterapia-esencial',
      title: 'Aromaterapia Esencial',
      category: 'CORTOS',
      icon: 'local_florist',
      rating: 4.9,
      duration: '10 horas',
      description: 'Descubre el uso seguro de aceites esenciales para equilibrar la mente, el cuerpo y las emociones.',
      students: '+950',
      price: 'S/ 150',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80'
    },
    {
      slug: 'terapia-integral',
      title: 'Diplomado en Terapia Integral',
      category: 'DIPLOMADOS',
      icon: 'self_improvement',
      rating: 5.0,
      duration: '150 horas',
      description: 'Una formación exhaustiva que combina múltiples disciplinas holísticas para formar terapeutas profesionales.',
      students: '+3,500',
      price: 'S/ 1,850',
      image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80'
    },
    {
      slug: 'herbolaria',
      title: 'Especialización en Herbolaria',
      category: 'DIPLOMADOS',
      icon: 'spa',
      rating: 4.8,
      duration: '120 horas',
      description: 'Profundiza en la medicina natural y plantas curativas con expertos del sector.',
      students: '+1,100',
      price: 'S/ 1,490',
      image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=800&q=80'
    },
    {
      slug: 'flores-bach',
      title: 'Flores de Bach',
      category: 'CORTOS',
      icon: 'local_florist',
      rating: 4.8,
      duration: '18 horas',
      description: 'Aprende a preparar y recetar esencias florales para tratar desequilibrios emocionales.',
      students: '+720',
      price: 'S/ 160',
      image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80'
    },
    {
      slug: 'reflexologia-podal',
      title: 'Reflexología Podal',
      category: 'CORTOS',
      icon: 'front_hand',
      rating: 4.9,
      duration: '16 horas',
      description: 'Descubre el mapa de puntos reflejos en los pies para relajar el sistema nervioso.',
      students: '+640',
      price: 'S/ 190',
      image: 'https://images.unsplash.com/photo-1519689680058-324335c77ebe?auto=format&fit=crop&w=800&q=80'
    },
    {
      slug: 'yoga-principiantes',
      title: 'Yoga para Principiantes',
      category: 'CORTOS',
      icon: 'self_improvement',
      rating: 4.7,
      duration: '10 horas',
      description: 'Aprende las asanas básicas, respiración consciente y meditación para el día a día.',
      students: '+1,500',
      price: 'S/ 120',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80'
    },
    {
      slug: 'cristaloterapia',
      title: 'Cristaloterapia',
      category: 'CORTOS',
      icon: 'diamond',
      rating: 4.9,
      duration: '14 horas',
      description: 'Usa la vibración de los cristales para equilibrar los chakras y limpiar energías.',
      students: '+580',
      price: 'S/ 175',
      image: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=800&q=80'
    },
    {
      slug: 'meditacion-mindfulness',
      title: 'Meditación Mindfulness',
      category: 'CORTOS',
      icon: 'psychology',
      rating: 4.8,
      duration: '12 horas',
      description: 'Aprende a vivir en el presente y reducir el estrés a través de la atención plena.',
      students: '+2,100',
      price: 'S/ 130',
      image: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=800&q=80'
    },
    {
      slug: 'iridologia',
      title: 'Iridología Básica',
      category: 'CORTOS',
      icon: 'visibility',
      rating: 4.7,
      duration: '20 horas',
      description: 'Aprende a leer el mapa del iris para detectar tendencias de salud en el cuerpo.',
      students: '+430',
      price: 'S/ 210',
      image: 'https://images.unsplash.com/photo-1507919909716-c8262e491cde?auto=format&fit=crop&w=800&q=80'
    },
    {
      slug: 'biomagnetismo',
      title: 'Diplomado en Biomagnetismo',
      category: 'DIPLOMADOS',
      icon: 'center_focus_strong',
      rating: 4.9,
      duration: '150 horas',
      description: 'Formación completa en el uso de imanes de mediana intensidad para regular el pH.',
      students: '+1,800',
      price: 'S/ 1,590',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80'
    },
    {
      slug: 'medicina-china',
      title: 'Diplomado en Medicina Tradicional China',
      category: 'DIPLOMADOS',
      icon: 'menu_book',
      rating: 5.0,
      duration: '180 horas',
      description: 'Aprende los principios del Yin-Yang, los 5 elementos y la acupuntura básica.',
      students: '+2,400',
      price: 'S/ 1,950',
      image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80'
    },
    {
      slug: 'kinesiologia',
      title: 'Especialización en Kinesiología',
      category: 'DIPLOMADOS',
      icon: 'sports_gymnastics',
      rating: 4.8,
      duration: '120 horas',
      description: 'Aprende el testeo muscular holístico para identificar bloqueos de estrés y energía.',
      students: '+850',
      price: 'S/ 1,650',
      image: 'https://images.unsplash.com/photo-1597854710119-a5a84362190a?auto=format&fit=crop&w=800&q=80'
    },
    {
      slug: 'nutricion-holistica',
      title: 'Nutrición Holística',
      category: 'CORTOS',
      icon: 'nutrition',
      rating: 4.8,
      duration: '22 horas',
      description: 'Aprende a nutrir tu cuerpo con alimentos vivos que promueven la autocuración.',
      students: '+1,100',
      price: 'S/ 240',
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80'
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
