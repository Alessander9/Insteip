import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DiaAcupunturaService } from '../../core/services/dia-acupuntura.service';
import { AuthService } from '../../core/services/auth.service';
import { TallerEvento, VideoGeneralEvento } from '../../core/models/dia-acupuntura.model';

@Component({
  selector: 'app-dia-acupuntura',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dia-acupuntura.component.html',
  styleUrls: ['./dia-acupuntura.component.css']
})
export class DiaAcupunturaComponent implements OnInit {
  private diaService = inject(DiaAcupunturaService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  talleres: TallerEvento[] = [];
  cargando = true;
  errorMensaje = '';

  // Video General del Evento
  videoGeneral: VideoGeneralEvento | null = null;
  videoGeneralSafeUrl: SafeResourceUrl | null = null;
  cargandoVideoGeneral = false;

  // Auth local
  estaAutenticado = false;
  usuarioNombre = '';
  usuarioCorreo = '';
  esAdmin = false;

  // Formulario login
  correoInput = '';
  passwordInput = '';
  cargandoLogin = false;
  loginError = '';

  readonly whatsappUrl = 'https://wa.me/51930830427';

  ngOnInit(): void {
    this.verificarAutenticacion();
    this.cargarVideoGeneral();
    this.cargarTalleres();
  }

  verificarAutenticacion(): void {
    this.estaAutenticado = this.authService.isLoggedIn();
    if (this.estaAutenticado) {
      this.esAdmin = this.authService.getUserRole() === 'ADMINISTRADOR';
      this.authService.getProfile().subscribe({
        next: (profile) => {
          this.usuarioNombre = profile ? `${profile.nombres || ''} ${profile.apellidos || ''}`.trim() || profile.correo : '';
          this.usuarioCorreo = profile?.correo || '';
        },
        error: () => {
          this.usuarioNombre = 'Estudiante';
          this.usuarioCorreo = '';
        }
      });
    }
  }

  cargarVideoGeneral(): void {
    this.cargandoVideoGeneral = true;
    this.diaService.obtenerVideoGeneral().subscribe({
      next: (data) => {
        this.videoGeneral = data;
        this.cargandoVideoGeneral = false;
        this.actualizarUrlVideoGeneralSegura();
      },
      error: (err) => {
        console.error('Error cargando video general', err);
        this.cargandoVideoGeneral = false;
      }
    });
  }

  actualizarUrlVideoGeneralSegura(): void {
    if (this.videoGeneral && this.videoGeneral.activo && this.tieneAccesoVideoGeneral) {
      const ytId = this.videoGeneral.youtubeId;
      if (ytId) {
        const embedUrl = `https://www.youtube-nocookie.com/embed/${ytId}?rel=0`;
        this.videoGeneralSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
      } else {
        this.videoGeneralSafeUrl = null;
      }
    } else {
      this.videoGeneralSafeUrl = null;
    }
  }

  cargarTalleres(): void {
    this.cargando = true;
    this.diaService.listarTalleres().subscribe({
      next: (data) => {
        this.talleres = data;
        this.cargando = false;
        this.actualizarUrlVideoGeneralSegura();
      },
      error: (err) => {
        console.error('Error cargando talleres', err);
        this.errorMensaje = 'No se pudieron cargar los talleres. Por favor recarga la página.';
        this.cargando = false;
      }
    });
  }

  iniciarSesion(): void {
    if (!this.correoInput.trim() || !this.passwordInput.trim()) {
      this.loginError = 'Por favor ingresa tu correo y contraseña.';
      return;
    }

    this.cargandoLogin = true;
    this.loginError = '';

    this.authService.login({
      correo: this.correoInput.trim(),
      password: this.passwordInput
    }).subscribe({
      next: () => {
        this.cargandoLogin = false;
        this.verificarAutenticacion();
        this.cargarTalleres();
        this.cargarVideoGeneral();
      },
      error: (err) => {
        this.cargandoLogin = false;
        this.loginError = err.error?.message || 'Credenciales incorrectas. Verifica tu correo y contraseña.';
      }
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.estaAutenticado = false;
    this.esAdmin = false;
    this.usuarioNombre = '';
    this.usuarioCorreo = '';
    this.cargarTalleres();
    this.cargarVideoGeneral();
    this.actualizarUrlVideoGeneralSegura();
  }

  get totalInscritosUsuario(): number {
    return this.talleres.filter(t => t.inscrito).length;
  }

  get tieneAccesoVideoGeneral(): boolean {
    return this.totalInscritosUsuario > 0 || this.esAdmin;
  }

  scrollAlLogin(): void {
    if (typeof document !== 'undefined') {
      const card = document.querySelector('.dia-auth-card');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const input = card.querySelector('input[type="email"]') as HTMLInputElement;
        if (input) input.focus();
      }
    }
  }

  obtenerLinkWhatsapp(taller: TallerEvento): string {
    const texto = encodeURIComponent(
      `Hola INSTEIP, estoy interesado en participar en el taller "${taller.nombre}" del Día de la Acupuntura (17 y 18 de Octubre). ¿Podrían brindarme información para matricularme?`
    );
    return `${this.whatsappUrl}?text=${texto}`;
  }

  entrarAlTaller(taller: TallerEvento): void {
    this.router.navigate(['/dia-acupuntura/play', taller.id]);
  }
}
