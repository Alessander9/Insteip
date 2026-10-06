import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ExperienciaService } from '../../core/services/experiencia.service';
import { AuthService } from '../../core/services/auth.service';
import { DemoCursoDto, DemoCuentaDisponibleResponse } from '../../core/models/experiencia.model';

@Component({
  selector: 'app-experiencia-insteip',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './experiencia-insteip.component.html',
  styleUrls: ['./experiencia-insteip.component.css']
})
export class ExperienciaInsteipComponent implements OnInit, OnDestroy {
  private expService = inject(ExperienciaService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // Estado de carga 0 a 100%
  cargandoCursos: boolean = true;
  progresoCargaCursos: number = 0;
  textoCargaCursos: string = 'Iniciando conexión con el campus virtual...';
  private progresoInterval: any = null;

  // Estado al iniciar experiencia
  cargandoInicio: boolean = false;
  progresoInicio: number = 0;
  textoInicio: string = 'Preparando tus cursos seleccionados...';

  // Datos demo
  tokenTemporal: string = '';
  correoAsignado: string = '';
  todosCursosVistos: boolean = false;
  cursos: DemoCursoDto[] = [];
  cursosSeleccionados: number[] = [];
  mensajeError: string = '';

  readonly whatsappUrl = 'https://wa.me/51930830427?text=Hola%2C+deseo+informaci%C3%B3n+para+matricularme+en+el+Campus+INSTEIP';

  ngOnInit(): void {
    // Si ya existe una sesión demo activa y vigente, ir directo al dashboard
    if (this.authService.isExpUser()) {
      this.router.navigate(['/dashboard/mis-cursos']);
      return;
    }

    this.cargarCatalogoDemo();
  }

  ngOnDestroy(): void {
    if (this.progresoInterval) {
      clearInterval(this.progresoInterval);
    }
  }

  cargarCatalogoDemo(): void {
    this.cargandoCursos = true;
    this.progresoCargaCursos = 0;
    this.textoCargaCursos = 'Iniciando conexión con el campus virtual...';
    this.mensajeError = '';

    if (this.progresoInterval) clearInterval(this.progresoInterval);
    this.progresoInterval = setInterval(() => {
      if (this.progresoCargaCursos < 30) {
        this.progresoCargaCursos += 5;
        this.textoCargaCursos = 'Conectando con el servidor de demostración...';
      } else if (this.progresoCargaCursos < 70) {
        this.progresoCargaCursos += 4;
        this.textoCargaCursos = 'Cargando catálogo oficial de terapias integrales...';
      } else if (this.progresoCargaCursos < 92) {
        this.progresoCargaCursos += 2;
        this.textoCargaCursos = 'Comprobando disponibilidad de cursos para tu conexión...';
      }
      this.cdr.markForCheck();
    }, 70);

    this.expService.obtenerCuentaYCursosDisponibles().subscribe({
      next: (resp: DemoCuentaDisponibleResponse) => {
        if (this.progresoInterval) clearInterval(this.progresoInterval);
        const finInt = setInterval(() => {
          this.progresoCargaCursos += 10;
          if (this.progresoCargaCursos >= 100) {
            this.progresoCargaCursos = 100;
            clearInterval(finInt);
            setTimeout(() => {
              this.tokenTemporal = resp.tokenTemporal;
              this.correoAsignado = resp.correoAsignado;
              this.todosCursosVistos = resp.todosCursosVistos;
              this.cursos = resp.cursos || [];
              this.cargandoCursos = false;
              this.cdr.markForCheck();
            }, 200);
          }
          this.cdr.markForCheck();
        }, 20);
      },
      error: (err) => {
        if (this.progresoInterval) clearInterval(this.progresoInterval);
        this.cargandoCursos = false;
        this.mensajeError = err.error?.message || 'No se pudo conectar con el servidor de demostración. Inténtalo de nuevo.';
        this.cdr.markForCheck();
      }
    });
  }

  toggleSeleccionCurso(curso: DemoCursoDto): void {
    if (curso.yaVisto || this.cargandoInicio) return;

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

  isDeshabilitado(curso: DemoCursoDto): boolean {
    if (curso.yaVisto) return true;
    if (this.cursosSeleccionados.length >= 2 && !this.isSeleccionado(curso.id)) return true;
    return false;
  }

  iniciarExperiencia(): void {
    if (this.cursosSeleccionados.length !== 2) {
      this.mensajeError = 'Debes seleccionar exactamente 2 cursos para comenzar tu experiencia.';
      return;
    }

    this.mensajeError = '';
    this.cargandoInicio = true;
    this.progresoInicio = 0;
    this.textoInicio = 'Preparando tus 2 cursos en el campus virtual...';

    const startInterval = setInterval(() => {
      if (this.progresoInicio < 85) {
        this.progresoInicio += 8;
        if (this.progresoInicio > 40) {
          this.textoInicio = 'Asignando aula virtual y credenciales temporales...';
        }
        this.cdr.markForCheck();
      }
    }, 40);

    this.expService.activarDemo(this.cursosSeleccionados, this.tokenTemporal).subscribe({
      next: (resp) => {
        clearInterval(startInterval);
        const finInt = setInterval(() => {
          this.progresoInicio += 10;
          if (this.progresoInicio >= 100) {
            this.progresoInicio = 100;
            clearInterval(finInt);
            this.cdr.markForCheck();

            setTimeout(() => {
              // Guardar credenciales de sesión demo en AuthService
              this.authService.saveToken(resp.token);
              this.authService.saveUserRole('ROLE_DEMO');
              this.authService.saveExpSelectedCourseIds(resp.demoCursoIds);
              this.authService.startExpTimer(resp.expiraEnSegundos || 900);

              // Redirigir al dashboard del campus con la experiencia activa
              this.router.navigate(['/dashboard/mis-cursos']);
            }, 250);
          }
          this.cdr.markForCheck();
        }, 20);
      },
      error: (err) => {
        clearInterval(startInterval);
        this.cargandoInicio = false;
        this.mensajeError = err.error?.message || 'No se pudo iniciar la experiencia demo. Intenta de nuevo.';
        this.cdr.markForCheck();
      }
    });
  }
}

