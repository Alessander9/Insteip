import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ExperienciaService } from '../../core/services/experiencia.service';
import { CursoExp, EstadoExperiencia, VerificarExpResponse } from '../../core/models/experiencia.model';

@Component({
  selector: 'app-experiencia-insteip',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './experiencia-insteip.component.html',
  styleUrls: ['./experiencia-insteip.component.css']
})
export class ExperienciaInsteipComponent implements OnInit {
  private expService = inject(ExperienciaService);
  private router = inject(Router);

  correo: string = '';
  cargandoVerificacion: boolean = false;
  cargandoInicio: boolean = false;
  cargandoCursos: boolean = false;
  mensajeError: string = '';

  // Estado del flujo
  verificado: boolean = false;
  estadoVisitante: EstadoExperiencia | null = null;
  datosEstado: VerificarExpResponse | null = null;

  // Cursos
  cursos: CursoExp[] = [];
  cursosSeleccionados: number[] = [];

  readonly whatsappUrl = 'https://wa.me/51939371250?text=Hola%2C+deseo+informaci%C3%B3n+para+matricularme+en+el+Campus+INSTEIP';

  ngOnInit(): void {
    // Si ya existe una sesión activa no expirada, redirigir directo a /play
    const sesion = this.expService.getSesionActual();
    if (sesion && sesion.expiraSesion) {
      const expira = new Date(sesion.expiraSesion).getTime();
      if (Date.now() < expira) {
        this.router.navigate(['/experiencia-insteip/play']);
      } else {
        this.expService.limpiarSesion();
      }
    }
  }

  validarCorreoRegex(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  }

  verificarCorreo(): void {
    this.mensajeError = '';
    const email = this.correo.trim();

    if (!email) {
      this.mensajeError = 'Por favor, ingresa tu correo electrónico.';
      return;
    }

    if (!this.validarCorreoRegex(email)) {
      this.mensajeError = 'Ingresa un formato de correo válido (ej: usuario@correo.com).';
      return;
    }

    this.cargandoVerificacion = true;
    this.cursosSeleccionados = [];

    this.expService.verificarEstado(email).subscribe({
      next: (resp) => {
        this.cargandoVerificacion = false;
        this.verificado = true;
        this.estadoVisitante = resp.estado;
        this.datosEstado = resp;

        if (resp.estado === 'LIBRE') {
          this.cargarCursos(email);
        }
      },
      error: (err) => {
        this.cargandoVerificacion = false;
        this.mensajeError = err.error?.message || 'Ocurrió un error al verificar tu acceso. Intenta de nuevo.';
      }
    });
  }

  progresoCargaCursos: number = 0;
  textoCargaCursos: string = 'Conectando con el campus virtual...';
  private progresoInterval: any = null;

  cargarCursos(email: string): void {
    this.cargandoCursos = true;
    this.progresoCargaCursos = 0;
    this.textoCargaCursos = 'Conectando con el campus virtual...';

    if (this.progresoInterval) clearInterval(this.progresoInterval);
    this.progresoInterval = setInterval(() => {
      if (this.progresoCargaCursos < 30) {
        this.progresoCargaCursos += 5;
        this.textoCargaCursos = 'Conectando con el servidor...';
      } else if (this.progresoCargaCursos < 70) {
        this.progresoCargaCursos += 4;
        this.textoCargaCursos = 'Cargando catálogo oficial de formaciones...';
      } else if (this.progresoCargaCursos < 92) {
        this.progresoCargaCursos += 2;
        this.textoCargaCursos = 'Preparando clases y materiales...';
      }
    }, 70);

    this.expService.listarCursos(email).subscribe({
      next: (data) => {
        if (this.progresoInterval) clearInterval(this.progresoInterval);
        const finInt = setInterval(() => {
          this.progresoCargaCursos += 10;
          if (this.progresoCargaCursos >= 100) {
            this.progresoCargaCursos = 100;
            clearInterval(finInt);
            setTimeout(() => {
              this.cursos = data;
              this.cargandoCursos = false;
            }, 200);
          }
        }, 20);
      },
      error: () => {
        if (this.progresoInterval) clearInterval(this.progresoInterval);
        this.cargandoCursos = false;
        this.mensajeError = 'No se pudieron cargar los cursos disponibles.';
      }
    });
  }

  toggleSeleccionCurso(curso: CursoExp): void {
    if (curso.yaVisto) return;

    const index = this.cursosSeleccionados.indexOf(curso.id);
    if (index > -1) {
      this.cursosSeleccionados.splice(index, 1);
    } else {
      if (this.cursosSeleccionados.length < 2) {
        this.cursosSeleccionados.push(curso.id);
      }
    }
  }

  isSeleccionado(cursoId: number): boolean {
    return this.cursosSeleccionados.includes(cursoId);
  }

  isDeshabilitado(curso: CursoExp): boolean {
    if (curso.yaVisto) return true;
    if (this.cursosSeleccionados.length >= 2 && !this.isSeleccionado(curso.id)) return true;
    return false;
  }

  iniciarExperiencia(): void {
    if (this.cursosSeleccionados.length !== 2) {
      this.mensajeError = 'Debes seleccionar exactamente 2 cursos para comenzar.';
      return;
    }

    this.mensajeError = '';
    this.cargandoInicio = true;

    this.expService.iniciarExperiencia(this.correo, this.cursosSeleccionados).subscribe({
      next: (resp) => {
        this.cargandoInicio = false;
        // Guardar sesión activa en sessionStorage
        this.expService.guardarSesion({
          sessionToken: resp.sessionToken,
          inicioSesion: resp.inicioSesion,
          expiraSesion: resp.expiraSesion,
          duracionSegundos: resp.duracionSegundos,
          numeroUso: resp.numeroUso,
          correo: this.correo.trim().toLowerCase(),
          cursos: resp.cursos
        });

        // Navegar a la pantalla de reproducción de la experiencia
        this.router.navigate(['/experiencia-insteip/play']);
      },
      error: (err) => {
        this.cargandoInicio = false;
        this.mensajeError = err.error?.message || 'No se pudo iniciar la experiencia. Por favor revisa los cursos seleccionados.';
      }
    });
  }

  cambiarCorreo(): void {
    this.verificado = false;
    this.estadoVisitante = null;
    this.datosEstado = null;
    this.cursos = [];
    this.cursosSeleccionados = [];
    this.mensajeError = '';
  }

  formatearFecha(fechaStr?: string): string {
    if (!fechaStr) return '';
    try {
      const d = new Date(fechaStr);
      return d.toLocaleDateString('es-PE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fechaStr;
    }
  }
}
