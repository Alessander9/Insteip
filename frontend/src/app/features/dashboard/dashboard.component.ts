import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/';
import { UserProfile } from '../../core/models/';
import { SkeletonLoaderComponent } from '../../core/components/skeleton-loader/skeleton-loader.component';
import { NotificacionesMenuComponent } from '../../core/components/notificaciones-menu/notificaciones-menu.component';
import { AnuncioModalDialogComponent } from '../../core/components/anuncio-modal-dialog/anuncio-modal-dialog.component';
import { ExpTimerBannerComponent } from '../../core/components/exp-timer-banner/exp-timer-banner.component';
import { ExpCoursePickerModalComponent } from '../../core/components/exp-course-picker-modal/exp-course-picker-modal.component';
import { AlumnoDashboardService, AlumnoCurso } from '../../core/services/alumno-dashboard.service';
import { ToastService } from '../../core/services/toast.service';
import { ThemeService } from '../../core/services/';
import { TareaService } from '../../core/services/tarea.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { DocenteDashboardService } from '../../core/services/docente-dashboard.service';
import { ModuloService } from '../../core/services/modulo.service';
import { MensajeriaService } from '../../core/services/mensajeria.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SkeletonLoaderComponent,
    NotificacionesMenuComponent,
    AnuncioModalDialogComponent,
    ExpTimerBannerComponent,
    ExpCoursePickerModalComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit, OnDestroy {
  
  private authService = inject(AuthService);
  private studentService = inject(AlumnoDashboardService);
  private toastService = inject(ToastService);
  private tareaService = inject(TareaService);
  private notificacionService = inject(NotificacionService);
  private docenteDashboardService = inject(DocenteDashboardService);
  private moduloService = inject(ModuloService);
  private mensajeriaService = inject(MensajeriaService);
  private router = inject(Router);
  themeService = inject(ThemeService);

  profile: UserProfile | null = null;
  isLoading = true;
  errorMsg = '';
  tareasPendientesCount = 0;
  comunicadosNoLeidosCount = 0;
  mensajesNoLeidosCount = 0;
  isExpUser = false;
  showExpCoursePicker = false;
  allExpCourses: AlumnoCurso[] = [];

  private notifSub?: Subscription;
  private mensajeSub?: Subscription;
  private expSub?: Subscription;

  /** Controls the mobile slide-out sidebar drawer */
  sidebarOpen = false;

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  ngOnInit(): void {
    this.expSub = this.authService.isExpUserSubject.subscribe(isExp => {
      this.isExpUser = isExp;
      if (isExp) {
        this.verificarExpPicker();
      }
    });

    this.notifSub = this.notificacionService.resumen$.subscribe(resumen => {
      this.comunicadosNoLeidosCount = resumen.totalNoLeidas;
    });

    this.mensajeSub = this.mensajeriaService.unreadCount$.subscribe(count => {
      this.mensajesNoLeidosCount = count;
    });

    this.authService.getProfile().subscribe({
      next: (user) => {
        this.profile = user;
        this.isLoading = false;
        if (user?.isExpUser) {
          this.isExpUser = true;
          this.verificarExpPicker();
        }
        if (user && user.rol === 'ALUMNO') {
          this.cargarTareasPendientesAlumno();
        } else if (user && user.rol === 'DOCENTE') {
          this.cargarTareasPendientesDocente();
        }
        this.notificacionService.cargarNotificaciones().subscribe();
        this.mensajeriaService.actualizarResumen().subscribe();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = 'No se pudo cargar el perfil del usuario autenticado.';
      }
    });
  }

  private verificarExpPicker(): void {
    if (!this.isExpUser) return;
    const selected = this.authService.getExpSelectedCourseIds();
    if (!selected || selected.length < 2) {
      this.showExpCoursePicker = true;
      this.studentService.getEnrolledCursos().subscribe({
        next: (data) => {
          this.allExpCourses = (data || []).filter(c => !c.nombre?.toLowerCase().includes('excel'));
        }
      });
    } else {
      this.showExpCoursePicker = false;
    }
  }

  onExpCoursesSelected(courseIds: number[]): void {
    this.authService.saveExpSelectedCourseIds(courseIds);
    this.showExpCoursePicker = false;
    this.toastService.success('¡Cursos seleccionados! Tienes 15 minutos para explorar tu experiencia INSTEIP.');
    this.router.navigate(['/dashboard/mis-cursos']);
  }

  ngOnDestroy(): void {
    this.notifSub?.unsubscribe();
    this.mensajeSub?.unsubscribe();
    this.expSub?.unsubscribe();
  }

  cargarTareasPendientesAlumno(): void {
    this.tareaService.listarTodasMisTareas().subscribe({
      next: (tareas) => {
        // Tareas con estado 'PENDIENTE' que el alumno aún debe entregar
        this.tareasPendientesCount = tareas.filter(t => t.estadoEntrega === 'PENDIENTE').length;
      },
      error: () => {
        this.tareasPendientesCount = 0;
      }
    });
  }

  cargarTareasPendientesDocente(): void {
    this.docenteDashboardService.getCursosAsignados().subscribe({
      next: (cursos) => {
        if (!cursos || cursos.length === 0) {
          this.tareasPendientesCount = 0;
          return;
        }
        let totalConEntregas = 0;
        let cursosCompletados = 0;

        cursos.forEach(c => {
          this.moduloService.listarModulosPorCurso(c.id).subscribe({
            next: (modulos) => {
              if (!modulos || modulos.length === 0) {
                cursosCompletados++;
                if (cursosCompletados === cursos.length) {
                  this.tareasPendientesCount = totalConEntregas;
                }
                return;
              }
              let modulosCompletados = 0;
              modulos.forEach(m => {
                this.tareaService.listarPorModulo(m.id).subscribe({
                  next: (tareas) => {
                    tareas.forEach(t => {
                      if ((t.totalEntregas || 0) > 0) {
                        totalConEntregas += (t.totalEntregas || 0);
                      }
                    });
                    modulosCompletados++;
                    if (modulosCompletados === modulos.length) {
                      cursosCompletados++;
                      if (cursosCompletados === cursos.length) {
                        this.tareasPendientesCount = totalConEntregas;
                      }
                    }
                  },
                  error: () => {
                    modulosCompletados++;
                    if (modulosCompletados === modulos.length) {
                      cursosCompletados++;
                      if (cursosCompletados === cursos.length) {
                        this.tareasPendientesCount = totalConEntregas;
                      }
                    }
                  }
                });
              });
            },
            error: () => {
              cursosCompletados++;
              if (cursosCompletados === cursos.length) {
                this.tareasPendientesCount = totalConEntregas;
              }
            }
          });
        });
      },
      error: () => {
        this.tareasPendientesCount = 0;
      }
    });
  }

  onLogout(): void {
    this.authService.logoutRemote().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }
}
