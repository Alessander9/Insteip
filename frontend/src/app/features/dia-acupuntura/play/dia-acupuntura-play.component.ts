import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AlumnoDashboardService, AlumnoPlayCourse, AlumnoPlayModulo, AlumnoPlayVideo, AlumnoPlayMaterial } from '../../../core/services/alumno-dashboard.service';

@Component({
  selector: 'app-dia-acupuntura-play',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dia-acupuntura-play.component.html',
  styleUrls: ['./dia-acupuntura-play.component.css']
})
export class DiaAcupunturaPlayComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private alumnoService = inject(AlumnoDashboardService);
  private sanitizer = inject(DomSanitizer);

  cursoId!: number;
  curso: AlumnoPlayCourse | null = null;
  cargando = true;
  errorMensaje = '';

  videoActivo: AlumnoPlayVideo | null = null;
  videoSafeUrl: SafeResourceUrl | null = null;
  moduloActivo: AlumnoPlayModulo | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam || isNaN(+idParam)) {
      this.router.navigate(['/dia-acupuntura']);
      return;
    }

    this.cursoId = +idParam;
    this.cargarCurso();
  }

  cargarCurso(): void {
    this.cargando = true;
    this.alumnoService.getPlayCourse(this.cursoId).subscribe({
      next: (data) => {
        this.curso = data;
        this.cargando = false;
        this.inicializarPrimerVideo();
      },
      error: (err) => {
        console.error('Error cargando taller', err);
        this.cargando = false;
        if (err.status === 403) {
          this.errorMensaje = 'No tienes una matrícula activa para este taller del Día de la Acupuntura.';
        } else {
          this.errorMensaje = 'No se pudo cargar el taller. Por favor verifica tu conexión o matrícula.';
        }
      }
    });
  }

  inicializarPrimerVideo(): void {
    if (this.curso && this.curso.modulos && this.curso.modulos.length > 0) {
      for (const mod of this.curso.modulos) {
        if (!mod.bloqueado && mod.videos && mod.videos.length > 0) {
          this.seleccionarVideo(mod, mod.videos[0]);
          break;
        }
      }
    }
  }

  seleccionarVideo(modulo: AlumnoPlayModulo, video: AlumnoPlayVideo): void {
    this.moduloActivo = modulo;
    this.videoActivo = video;

    const ytId = video.youtubeId || this.extraerYoutubeId(video.youtubeUrl);
    if (ytId) {
      const embedUrl = `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&autoplay=1`;
      this.videoSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    } else {
      this.videoSafeUrl = null;
    }
  }

  private extraerYoutubeId(url: string): string | null {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  }

  volverAlCatalogo(): void {
    this.router.navigate(['/dia-acupuntura']);
  }
}
