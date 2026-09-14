import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-exp-final',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './exp-final.component.html',
  styleUrls: ['./exp-final.component.css']
})
export class ExpFinalComponent implements OnInit {
  private authService = inject(AuthService);

  readonly whatsappMatriculaUrl = 'https://wa.me/51939371250?text=Hola%2C+vengo+de+probar+la+experiencia+EXP+INSTEIP+y+deseo+matricularme+en+un+curso';
  readonly whatsappAsesorUrl = 'https://wa.me/51939371250?text=Hola%2C+tengo+consultas+sobre+los+cursos+y+certificaciones+de+INSTEIP';

  ngOnInit(): void {
    // Asegurar que la sesión previa quede completamente reiniciada
    localStorage.removeItem('isExpUser');
    localStorage.removeItem('expExpiresAt');
    localStorage.removeItem('expSelectedCourseIds');
  }
  
  readonly socialLinks = [
    {
      name: 'TikTok',
      handle: '@terapias.integrales',
      url: 'https://www.tiktok.com/@terapias.integrales',
      icon: '🎵',
      btnClass: 'social-pill--tiktok'
    },
    {
      name: 'Instagram',
      handle: '@institutodeterapias',
      url: 'https://www.instagram.com/institutodeterapias/?hl=es%20insteip',
      icon: '📸',
      btnClass: 'social-pill--instagram'
    },
    {
      name: 'Facebook',
      handle: 'insteip',
      url: 'https://www.facebook.com/insteip',
      icon: '📘',
      btnClass: 'social-pill--facebook'
    },
    {
      name: 'YouTube',
      handle: 'INSTEIP Perú',
      url: 'https://www.youtube.com/@insteipperucursosterapiasc4318',
      icon: '🎥',
      btnClass: 'social-pill--youtube'
    }
  ];
}
