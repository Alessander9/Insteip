import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ExperienciaService } from '../../../core/services/experiencia.service';
import { SesionActivaExp, CursoExp, ModuloExp, VideoExp } from '../../../core/models/experiencia.model';

@Component({
  selector: 'app-exp-play',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './exp-play.component.html',
  styleUrls: ['./exp-play.component.css']
})
export class ExpPlayComponent implements OnInit, OnDestroy {
  private expService = inject(ExperienciaService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  readonly Math = Math;

  sesion: SesionActivaExp | null = null;
  cursos: CursoExp[] = [];
  cursoActivoIndex: number = 0;

  // Video seleccionado
  videoActivo: VideoExp | null = null;
  videoSafeUrl: SafeResourceUrl | null = null;

  // Temporizador
  segundosRestantes: number = 900; // 15 minutos por defecto
  private timerInterval: any = null;

  readonly whatsappUrl = 'https://wa.me/51939371250?text=Hola%2C+vengo+de+probar+la+Experiencia+INSTEIP+y+deseo+matricularme';

  ngOnInit(): void {
    this.sesion = this.expService.getSesionActual();

    // 1. Proteger acceso: si no hay sesión en sessionStorage, redirigir
    if (!this.sesion || !this.sesion.sessionToken || !this.sesion.cursos || this.sesion.cursos.length === 0) {
      this.router.navigate(['/experiencia-insteip']);
      return;
    }

    this.cursos = this.sesion.cursos;

    // 2. Calcular tiempo restante desde la fecha de expiración guardada
    const expiraMs = new Date(this.sesion.expiraSesion).getTime();
    const ahoraMs = Date.now();
    const diffSegundos = Math.floor((expiraMs - ahoraMs) / 1000);

    if (diffSegundos <= 0) {
      this.finalizarSesion();
      return;
    }

    this.segundosRestantes = diffSegundos;

    // 3. Iniciar el temporizador
    this.iniciarTemporizador();

    // 4. Seleccionar el primer video disponible del primer curso
    this.seleccionarPrimerVideoDisponible();
  }

  ngOnDestroy(): void {
    this.detenerTemporizador();
  }

  iniciarTemporizador(): void {
    this.detenerTemporizador();
    this.timerInterval = setInterval(() => {
      this.segundosRestantes--;

      if (this.segundosRestantes <= 0) {
        this.finalizarSesion();
      }
    }, 1000);
  }

  detenerTemporizador(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  finalizarSesion(): void {
    this.detenerTemporizador();
    const numeroUso = this.sesion?.numeroUso || 1;
    this.expService.limpiarSesion();
    this.router.navigate(['/exp-final'], {
      state: { usoExp: numeroUso }
    });
  }

  get cursoActivo(): CursoExp | null {
    if (!this.cursos || this.cursos.length === 0) return null;
    return this.cursos[this.cursoActivoIndex] || this.cursos[0];
  }

  seleccionarCurso(index: number): void {
    if (index >= 0 && index < this.cursos.length) {
      this.cursoActivoIndex = index;
      this.seleccionarPrimerVideoDisponible();
    }
  }

  seleccionarPrimerVideoDisponible(): void {
    const curso = this.cursoActivo;
    if (curso && curso.modulos && curso.modulos.length > 0) {
      for (const mod of curso.modulos) {
        if (mod.videos && mod.videos.length > 0) {
          this.reproducirVideo(mod.videos[0]);
          return;
        }
      }
    }
    this.videoActivo = null;
    this.videoSafeUrl = null;
  }

  reproducirVideo(video: VideoExp): void {
    this.videoActivo = video;

    let url = video.youtubeUrl;
    if (video.youtubeId) {
      url = `https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`;
    } else if (url && !url.includes('embed')) {
      // Extraer video ID si es URL completa de YouTube
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        url = `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1&rel=0&modestbranding=1`;
      }
    }

    this.videoSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  get tiempoFormateado(): string {
    const minutos = Math.floor(Math.max(0, this.segundosRestantes) / 60);
    const segundos = Math.max(0, this.segundosRestantes) % 60;
    const minStr = minutos < 10 ? '0' + minutos : String(minutos);
    const segStr = segundos < 10 ? '0' + segundos : String(segundos);
    return `${minStr}:${segStr}`;
  }

  get esPocoTiempo(): boolean {
    return this.segundosRestantes <= 120; // Menos de 2 minutos
  }
}
