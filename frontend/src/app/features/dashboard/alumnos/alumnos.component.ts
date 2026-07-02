import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlumnoService } from '../../../core/services/alumno.service';
import { AlumnoRequest, AlumnoResponse } from '../../../core/models/alumno.model';
import { ReportesService } from '../../../core/services/reportes.service';

@Component({
  selector: 'app-alumnos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './alumnos.component.html',
  styleUrls: ['./alumnos.component.css']
})
export class AlumnosComponent implements OnInit {
  private alumnoService = inject(AlumnoService);
  private reportesService = inject(ReportesService);
  private fb = inject(FormBuilder);

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

  // Modal controls
  showCreateEditModal = false;
  showDetailModal = false;
  isEditMode = false;
  isFormSubmitting = false;
  modalErrorMsg = '';

  selectedAlumno: AlumnoResponse | null = null;

  alumnoForm: FormGroup = this.fb.group({
    nombres: ['', [Validators.required]],
    apellidos: ['', [Validators.required]],
    correo: ['', [Validators.required, Validators.email]],
    telefono: [''],
    nivelSuscripcionId: [1, [Validators.required]],
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
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredAlumnos = this.alumnos.filter(a => 
      a.nombres.toLowerCase().includes(query) ||
      a.apellidos.toLowerCase().includes(query) ||
      a.correo.toLowerCase().includes(query)
    );
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
    this.alumnoService.cambiarEstado(alumno.id, nuevoEstado).subscribe({
      next: () => {
        alumno.estado = nuevoEstado;
      },
      error: (err) => {
        console.error('Error al cambiar estado del alumno', err);
      }
    });
  }

  onSubmit(): void {
    if (this.alumnoForm.invalid) {
      return;
    }

    this.isFormSubmitting = true;
    this.modalErrorMsg = '';

    const req: AlumnoRequest = {
      nombres: this.alumnoForm.value.nombres,
      apellidos: this.alumnoForm.value.apellidos,
      correo: this.alumnoForm.value.correo,
      telefono: this.alumnoForm.value.telefono || '',
      nivelSuscripcionId: Number(this.alumnoForm.value.nivelSuscripcionId)
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
                this.closeCreateEditModal();
              },
              error: (err) => this.handleError(err)
            });
          } else {
            this.loadAlumnos();
            this.closeCreateEditModal();
          }
        },
        error: (err) => this.handleError(err)
      });
    } else {
      this.alumnoService.crearAlumno(req).subscribe({
        next: () => {
          this.loadAlumnos();
          this.closeCreateEditModal();
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  private handleError(err: any): void {
    this.isFormSubmitting = false;
    this.modalErrorMsg = err.error?.message || 'Ocurrió un error inesperado al procesar la solicitud.';
  }

  getSubscriptionClass(sub: string): string {
    switch (sub) {
      case 'PREMIUM':
        return 'bg-[#f9e37a]/20 text-[#6d5e00] border border-[#f9e37a]/60';
      case 'INTERMEDIO':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'BASICO':
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  }
}
