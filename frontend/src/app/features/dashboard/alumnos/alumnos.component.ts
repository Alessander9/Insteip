import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlumnoService } from '../../../core/services/alumno.service';
import { AlumnoRequest, AlumnoResponse } from '../../../core/models/alumno.model';
import { ReportesService } from '../../../core/services/reportes.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmModalComponent } from '../../../core/components/confirm-modal/confirm-modal.component';
import { getSubscriptionClass } from '../../../core/utils/subscription.utils';

@Component({
  selector: 'app-alumnos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmModalComponent
  ],
  templateUrl: './alumnos.component.html',
  styleUrls: ['./alumnos.component.css']
})
export class AlumnosComponent implements OnInit {
  private alumnoService = inject(AlumnoService);
  private reportesService = inject(ReportesService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  exportarCSV(): void {
    this.reportesService.exportarAlumnos().subscribe({
      error: (err) => {
        console.error('Error al exportar alumnos:', err);
      }
    });
  }

  alumnos: AlumnoResponse[] = [];
  filteredAlumnos: AlumnoResponse[] = [];
  searchQuery = '';
  currentPage = 1;
  readonly pageSize = 10;

  // Modal controls
  showCreateEditModal = false;
  showDetailModal = false;
  isEditMode = false;
  isFormSubmitting = false;
  modalErrorMsg = '';

  // Confirm modal controls
  showConfirmModal = false;
  confirmModalType: 'success' | 'danger' | 'info' | 'warning' = 'warning';
  confirmModalTitle = '';
  confirmModalMessage = '';
  pendingAlumnoAction: (() => void) | null = null;

  selectedAlumno: AlumnoResponse | null = null;

  alumnoForm: FormGroup = this.fb.group({
    nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
    apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]+$')]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    telefono: ['', [Validators.pattern('^[0-9]{9}$')]],
    nivelSuscripcionId: [1, [Validators.required]],
    password: ['', [Validators.minLength(6)]],
    estado: [true]
  });

  ngOnInit(): void {
    this.loadAlumnos();
  }

  loadAlumnos(): void {
    this.alumnoService.listarAlumnos().subscribe({
      next: (data) => {
        this.alumnos = data;
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error al listar alumnos', err);
      }
    });
  }

  applyFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredAlumnos = [...this.alumnos];
      this.currentPage = 1;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredAlumnos = this.alumnos.filter(a => 
      a.nombres.toLowerCase().includes(query) ||
      a.apellidos.toLowerCase().includes(query) ||
      a.correo.toLowerCase().includes(query)
    );
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredAlumnos.length / this.pageSize));
  }

  get paginatedAlumnos(): AlumnoResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAlumnos.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  trackByAlumnoId(_: number, alumno: AlumnoResponse): number {
    return alumno.id;
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.modalErrorMsg = '';
    this.selectedAlumno = null;
    this.alumnoForm.reset({
      nombres: '',
      apellidos: '',
      correo: '',
      telefono: '',
      nivelSuscripcionId: 1,
      estado: true
    });
    this.showCreateEditModal = true;
  }

  openEditModal(alumno: AlumnoResponse): void {
    this.isEditMode = true;
    this.modalErrorMsg = '';
    this.selectedAlumno = alumno;
    
    // Map subscription name back to numeric ID
    let subId = 1;
    if (alumno.nivelSuscripcion === 'INTERMEDIO') {
      subId = 2;
    } else if (alumno.nivelSuscripcion === 'PREMIUM') {
      subId = 3;
    }

    this.alumnoForm.patchValue({
      nombres: alumno.nombres,
      apellidos: alumno.apellidos,
      correo: alumno.correo,
      telefono: alumno.telefono,
      nivelSuscripcionId: subId,
      estado: alumno.estado
    });
    this.showCreateEditModal = true;
  }

  closeCreateEditModal(): void {
    this.showCreateEditModal = false;
    this.isFormSubmitting = false;
  }

  openDetailModal(alumno: AlumnoResponse): void {
    this.selectedAlumno = alumno;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedAlumno = null;
  }

  toggleEstado(alumno: AlumnoResponse): void {
    const nuevoEstado = !alumno.estado;
    const accion = nuevoEstado ? 'Activar' : 'Desactivar';
    
    this.confirmModalType = nuevoEstado ? 'success' : 'danger';
    this.confirmModalTitle = `¿${accion} Alumno?`;
    this.confirmModalMessage = `¿Estás seguro de que deseas ${accion.toLowerCase()} la cuenta del alumno ${alumno.nombres} ${alumno.apellidos}?`;
    
    this.pendingAlumnoAction = () => {
      this.alumnoService.cambiarEstado(alumno.id, nuevoEstado).subscribe({
        next: () => {
          alumno.estado = nuevoEstado;
          this.toastService.success(`Alumno ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente.`);
          this.showConfirmModal = false;
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Error al cambiar el estado del alumno.');
          this.showConfirmModal = false;
        }
      });
    };
    
    this.showConfirmModal = true;
  }

  confirmAction(): void {
    if (this.pendingAlumnoAction) {
      this.pendingAlumnoAction();
    }
  }

  onSubmit(): void {
    if (this.alumnoForm.invalid) {
      this.alumnoForm.markAllAsTouched();
      this.toastService.warning('Por favor complete todos los campos requeridos correctamente.');
      return;
    }

    this.isFormSubmitting = true;
    this.modalErrorMsg = '';

    const req: AlumnoRequest = {
      nombres: this.alumnoForm.value.nombres,
      apellidos: this.alumnoForm.value.apellidos,
      correo: this.alumnoForm.value.correo,
      telefono: this.alumnoForm.value.telefono || '',
      nivelSuscripcionId: Number(this.alumnoForm.value.nivelSuscripcionId),
      password: this.alumnoForm.value.password || undefined
    };

    if (this.isEditMode && this.selectedAlumno) {
      this.alumnoService.editarAlumno(this.selectedAlumno.id, req).subscribe({
        next: () => {
          // Check if state changed, and update via PATCH since backend PUT doesn't update state
          const stateChanged = this.alumnoForm.value.estado !== this.selectedAlumno!.estado;
          if (stateChanged) {
            this.alumnoService.cambiarEstado(this.selectedAlumno!.id, this.alumnoForm.value.estado).subscribe({
              next: () => {
                this.loadAlumnos();
                this.toastService.success('Datos de alumno y estado actualizados exitosamente.');
                this.closeCreateEditModal();
              },
              error: (err) => this.handleError(err)
            });
          } else {
            this.loadAlumnos();
            this.toastService.success('Datos de alumno actualizados exitosamente.');
            this.closeCreateEditModal();
          }
        },
        error: (err) => this.handleError(err)
      });
    } else {
      this.alumnoService.crearAlumno(req).subscribe({
        next: () => {
          this.loadAlumnos();
          this.toastService.success('Alumno registrado exitosamente.');
          this.closeCreateEditModal();
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleError(err: any): void {
    this.isFormSubmitting = false;
    this.modalErrorMsg = err.error?.message || 'Ocurrió un error inesperado al procesar la solicitud.';
    this.toastService.error(this.modalErrorMsg, 'Error en el Servidor');
  }

  getSubscriptionClass = getSubscriptionClass;
}
