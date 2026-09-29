import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ExperienciaService } from '../../../core/services/experiencia.service';
import { SesionActivaExp, CursoExp, ModuloExp, VideoExp, MaterialExp } from '../../../core/models/experiencia.model';

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

  // Video y módulo seleccionados
  videoActivo: VideoExp | null = null;
  videoSafeUrl: SafeResourceUrl | null = null;
  moduloActivoIndex: number = 0;
  moduloAbiertoIndices: Set<number> = new Set([0]);

  // Pestañas inferiores del reproductor
  activeTab: 'temario' | 'materiales' | 'docente' | 'beneficios' = 'temario';

  // Control de barra lateral móvil y modal de funciones bloqueadas
  sidebarOpen: boolean = false;
  modalBloqueo = {
    abierto: false,
    titulo: '',
    descripcion: '',
    badge: 'Función para Alumnos Oficiales'
  };

  // Temporizador
  segundosRestantes: number = 900; // 15 minutos por defecto
  private timerInterval: any = null;

  readonly whatsappUrl = 'https://wa.me/51930830427?text=Hola%2C+vengo+de+probar+la+Experiencia+INSTEIP+y+deseo+matricularme';

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
      this.moduloAbiertoIndices.clear();
      this.moduloAbiertoIndices.add(0);
      this.seleccionarPrimerVideoDisponible();
    }
  }

  seleccionarPrimerVideoDisponible(): void {
    const curso = this.cursoActivo;
    if (curso && curso.modulos && curso.modulos.length > 0) {
      for (let i = 0; i < curso.modulos.length; i++) {
        const mod = curso.modulos[i];
        if (mod.videos && mod.videos.length > 0) {
          this.moduloActivoIndex = i;
          this.moduloAbiertoIndices.add(i);
          this.reproducirVideo(mod.videos[0], i);
          return;
        }
      }
    }
    this.videoActivo = null;
    this.videoSafeUrl = null;
  }

  toggleModulo(moduloIndex: number): void {
    if (this.moduloAbiertoIndices.has(moduloIndex)) {
      this.moduloAbiertoIndices.delete(moduloIndex);
    } else {
      this.moduloAbiertoIndices.add(moduloIndex);
    }
  }

  isModuloAbierto(moduloIndex: number): boolean {
    return this.moduloAbiertoIndices.has(moduloIndex);
  }

  reproducirVideo(video: VideoExp, moduloIndex?: number): void {
    this.videoActivo = video;
    if (moduloIndex !== undefined) {
      this.moduloActivoIndex = moduloIndex;
      this.moduloAbiertoIndices.add(moduloIndex);
    }

    let url = video.youtubeUrl;
    if (video.youtubeId) {
      url = `https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`;
    } else if (url && !url.includes('embed')) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        url = `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1&rel=0&modestbranding=1`;
      }
    }

    this.videoSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // Modales de funciones del campus bloqueadas
  abrirModalBloqueo(titulo: string, descripcion: string, badge: string = 'Función para Alumnos Oficiales'): void {
    this.modalBloqueo = {
      abierto: true,
      titulo,
      descripcion,
      badge
    };
  }

  cerrarModalBloqueo(): void {
    this.modalBloqueo.abierto = false;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  get totalVideosCurso(): number {
    const curso = this.cursoActivo;
    if (!curso || !curso.modulos) return 0;
    return curso.modulos.reduce((total, m) => total + (m.videos ? m.videos.length : 0), 0);
  }

  get totalMaterialesCurso(): number {
    const curso = this.cursoActivo;
    if (!curso || !curso.modulos) return 0;
    return curso.modulos.reduce((total, m) => total + (m.materiales ? m.materiales.length : 0), 0);
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

