import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CursoService } from '../../../core/services/curso.service';
import { CursoRequest, CursoResponse } from '../../../core/models/curso.model';
import { ReportesService } from '../../../core/services/reportes.service';
import { ToastService } from '../../../core/services/toast.service';
import { UsuarioService, DocenteOption } from '../../../core/services/usuario.service';
import { ConfirmModalComponent } from '../../../core/components/confirm-modal/confirm-modal.component';
import { getSubscriptionClass, formatNiveles } from '../../../core/utils/subscription.utils';

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ConfirmModalComponent
  ],
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.css']
})
export class CursosComponent implements OnInit {
  private cursoService = inject(CursoService);
  private reportesService = inject(ReportesService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private usuarioService = inject(UsuarioService);

  irADetalle(id: number): void {
    console.log('Intentando navegar a curso:', id);
    this.router.navigate(['/dashboard/cursos', id]).then(
      success => {
        if (!success) {
          console.error('Navegación rechazada');
          alert('Error: La navegación al detalle del curso fue rechazada.');
        }
      },
      error => {
        console.error('Error de navegación:', error);
        alert('Error al navegar al curso: ' + error);
      }
    );
  }

  exportarCSV(): void {
    this.reportesService.exportarCursos().subscribe({
      error: (err) => {
        console.error('Error al exportar cursos:', err);
      }
    });
  }

  cursos: CursoResponse[] = [];
  filteredCursos: CursoResponse[] = [];
  searchQuery = '';
  dateSortOrder: 'desc' | 'asc' = 'desc';
  currentPage = 1;
  readonly pageSize = 10;

  get totalCursos(): number {
    return this.cursos.length;
  }

  get activeCursos(): number {
    return this.cursos.filter(c => c.estado).length;
  }

  get premiumCursos(): number {
    return this.cursos.filter(c => c.nivelesSuscripcion?.includes('PREMIUM')).length;
  }

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
  pendingCursoAction: (() => void) | null = null;

  selectedCurso: CursoResponse | null = null;
  selectedSuscripcionIds: number[] = [];
  docentes: DocenteOption[] = [];
  docentesFiltrados: DocenteOption[] = [];
  docenteSearch = '';
  selectedDocenteId: number | null = null;
  showDocenteDropdown = false;

  cursoForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    imagenPortada: ['', [Validators.pattern('^https?:\\/\\/.+$')]],
    docenteId: [null],
    estado: [true]
  });

  ngOnInit(): void {
    this.loadCursos();
    this.loadDocentes();
  }

  loadDocentes(): void {
    this.usuarioService.listarDocentes().subscribe({
      next: (data) => {
        this.docentes = data || [];
        this.docentesFiltrados = this.docentes;
      },
      error: (err) => console.error('Error loading docentes', err)
    });
  }

  filterDocentes(): void {
    const q = this.docenteSearch.trim().toLowerCase();
    this.docentesFiltrados = !q ? this.docentes : this.docentes.filter(d =>
      `${d.nombres} ${d.apellidos}`.toLowerCase().includes(q) ||
      d.correo.toLowerCase().includes(q)
    );
    this.showDocenteDropdown = true;
  }

  openDocenteDropdown(): void {
    this.showDocenteDropdown = true;
    this.filterDocentes();
  }

  selectDocente(docente: DocenteOption): void {
    this.selectedDocenteId = docente.id;
    this.docenteSearch = `${docente.nombres} ${docente.apellidos} — ${docente.correo}`;
    this.cursoForm.patchValue({ docenteId: docente.id });
    this.showDocenteDropdown = false;
  }

  loadCursos(): void {
    this.cursoService.listarCursos().subscribe({
      next: (data) => {
        this.cursos = data;
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error al listar cursos', err);
      }
    });
  }

  applyFilter(): void {
    const query = this.searchQuery.trim().toLowerCase();
    this.filteredCursos = this.cursos.filter(c =>
      !query ||
      c.nombre.toLowerCase().includes(query) ||
      c.descripcion.toLowerCase().includes(query) ||
      c.fechaCreacion.toLowerCase().includes(query)
    ).sort((a, b) => {
      const d1 = new Date(a.fechaCreacion).getTime() || 0;
      const d2 = new Date(b.fechaCreacion).getTime() || 0;
      return this.dateSortOrder === 'asc' ? d1 - d2 : d2 - d1;
    });
    this.currentPage = 1;
  }

  onDateSortChange(order: string): void {
    this.dateSortOrder = order === 'asc' ? 'asc' : 'desc';
    this.applyFilter();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredCursos.length / this.pageSize));
  }

  get paginatedCursos(): CursoResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCursos.slice(start, start + this.pageSize);
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

  trackByCursoId(_: number, curso: CursoResponse): number {
    return curso.id;
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.modalErrorMsg = '';
    this.selectedCurso = null;
    this.selectedSuscripcionIds = [1]; // Default to Básico
    this.selectedDocenteId = null;
    this.docenteSearch = '';
    this.showDocenteDropdown = false;
    this.cursoForm.reset({
      nombre: '',
      descripcion: '',
      imagenPortada: '',
      docenteId: null,
      estado: true
    });
    this.showCreateEditModal = true;
  }

  openEditModal(curso: CursoResponse): void {
    this.isEditMode = true;
    this.modalErrorMsg = '';
    this.selectedCurso = curso;

    this.selectedSuscripcionIds = [];
    if (curso.nivelesSuscripcion) {
      if (curso.nivelesSuscripcion.includes('BASICO')) this.selectedSuscripcionIds.push(1);
      if (curso.nivelesSuscripcion.includes('INTERMEDIO')) this.selectedSuscripcionIds.push(2);
      if (curso.nivelesSuscripcion.includes('PREMIUM')) this.selectedSuscripcionIds.push(3);
    }

    this.selectedDocenteId = curso.docenteId || null;
    const docente = this.docentes.find(d => d.id === curso.docenteId);
    this.docenteSearch = docente ? `${docente.nombres} ${docente.apellidos} — ${docente.correo}` : '';
    this.cursoForm.patchValue({
      nombre: curso.nombre,
      descripcion: curso.descripcion,
      imagenPortada: curso.imagenPortada,
      docenteId: curso.docenteId || null,
      estado: curso.estado
    });
    this.showCreateEditModal = true;
  }

  closeCreateEditModal(): void {
    this.showCreateEditModal = false;
    this.isFormSubmitting = false;
  }

  openDetailModal(curso: CursoResponse): void {
    this.selectedCurso = curso;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedCurso = null;
  }

  toggleEstado(curso: CursoResponse): void {
    const nuevoEstado = !curso.estado;
    const accion = nuevoEstado ? 'Activar' : 'Desactivar';
    
    this.confirmModalType = nuevoEstado ? 'success' : 'danger';
    this.confirmModalTitle = `¿${accion} Curso?`;
    this.confirmModalMessage = `¿Estás seguro de que deseas ${accion.toLowerCase()} el curso "${curso.nombre}"?`;
    
    this.pendingCursoAction = () => {
      this.cursoService.cambiarEstado(curso.id, nuevoEstado).subscribe({
        next: () => {
          curso.estado = nuevoEstado;
          this.toastService.success(`Curso ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente.`);
          this.showConfirmModal = false;
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Error al cambiar el estado del curso.');
          this.showConfirmModal = false;
        }
      });
    };
    
    this.showConfirmModal = true;
  }

  confirmAction(): void {
    if (this.pendingCursoAction) {
      this.pendingCursoAction();
    }
  }

  toggleNivel(id: number): void {
    const idx = this.selectedSuscripcionIds.indexOf(id);
    if (idx > -1) {
      if (this.selectedSuscripcionIds.length > 1) {
        this.selectedSuscripcionIds.splice(idx, 1);
      }
    } else {
      this.selectedSuscripcionIds.push(id);
    }
  }

  isNivelSelected(id: number): boolean {
    return this.selectedSuscripcionIds.includes(id);
  }

  onSubmit(): void {
    if (this.cursoForm.invalid) {
      this.cursoForm.markAllAsTouched();
      this.toastService.warning('Por favor complete todos los campos requeridos correctamente.');
      return;
    }

    this.isFormSubmitting = true;
    this.modalErrorMsg = '';

    const req: CursoRequest = {
      nombre: this.cursoForm.value.nombre,
      descripcion: this.cursoForm.value.descripcion,
      imagenPortada: this.cursoForm.value.imagenPortada || '',
      nivelesSuscripcionIds: this.selectedSuscripcionIds,
      docenteId: this.cursoForm.value.docenteId || null
    };

    if (this.isEditMode && this.selectedCurso) {
      this.cursoService.editarCurso(this.selectedCurso.id, req).subscribe({
        next: () => {
          const stateChanged = this.cursoForm.value.estado !== this.selectedCurso!.estado;
          if (stateChanged) {
            this.cursoService.cambiarEstado(this.selectedCurso!.id, this.cursoForm.value.estado).subscribe({
              next: () => {
                this.loadCursos();
                this.toastService.success('Curso y estado actualizados exitosamente.');
                this.closeCreateEditModal();
              },
              error: (err) => this.handleError(err)
            });
          } else {
            this.loadCursos();
            this.toastService.success('Curso actualizado exitosamente.');
            this.closeCreateEditModal();
          }
        },
        error: (err) => this.handleError(err)
      });
    } else {
      this.cursoService.crearCurso(req).subscribe({
        next: () => {
          this.loadCursos();
          this.toastService.success('Curso creado exitosamente.');
          this.closeCreateEditModal();
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  onPreviewImgError(): void {
  }

  private handleError(err: any): void {
    this.isFormSubmitting = false;
    this.modalErrorMsg = err.error?.message || 'Ocurrió un error inesperado al procesar la solicitud.';
    this.toastService.error(this.modalErrorMsg, 'Error');
  }

  formatNiveles = formatNiveles;
  getSubscriptionClass = getSubscriptionClass;
}
