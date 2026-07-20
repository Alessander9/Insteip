import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmModalComponent } from '../../../core/components/confirm-modal/confirm-modal.component';
import { SkeletonLoaderComponent } from '../../../core/components/skeleton-loader/skeleton-loader.component';
import { ToastService } from '../../../core/services/';
import { getSubscriptionClass } from '../../../core/utils/';
import { DocenteRequest, DocenteResponse } from '../../../core/models/';
import { DocenteService } from '../../../core/services/';

@Component({
  selector: 'app-docentes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,    ConfirmModalComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './docentes.component.html',
  styleUrls: ['./docentes.component.css']
})
export class DocentesComponent implements OnInit {
  private docenteService = inject(DocenteService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  docentes: DocenteResponse[] = [];
  filteredDocentes: DocenteResponse[] = [];
  searchQuery = '';
  dateSortOrder: 'desc' | 'asc' = 'desc';
  currentPage = 1;
  readonly pageSize = 10;
  totalElements = 0;
  totalPagesCount = 1;

  showCreateEditModal = false;
  isEditMode = false;
  isFormSubmitting = false;
  modalErrorMsg = '';
  showConfirmModal = false;
  confirmModalType: 'success' | 'danger' | 'info' | 'warning' = 'warning';
  confirmModalTitle = '';
  confirmModalMessage = '';
  pendingAction: (() => void) | null = null;
  selectedDocente: DocenteResponse | null = null;

  docenteForm: FormGroup = this.fb.group({
    nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    telefono: [''],
    password: ['', [Validators.minLength(6)]]
  });

  ngOnInit(): void { this.loadDocentes(); }

  loadDocentes(): void {
    this.docenteService.listarDocentes(
      this.currentPage - 1,
      this.pageSize,
      this.searchQuery,
      `fechaRegistro,${this.dateSortOrder}`
    ).subscribe({
      next: (res) => {
        this.docentes = res.content ?? [];
        this.filteredDocentes = this.docentes;
        this.totalElements = res.totalElements ?? this.docentes.length;
        this.totalPagesCount = res.totalPages ?? Math.max(1, Math.ceil(this.totalElements / this.pageSize));
        if (this.currentPage > this.totalPagesCount) {
          this.currentPage = this.totalPagesCount;
        }
      },
      error: (err) => console.error('Error al listar docentes', err)
    });
  }

  onSearchChange(): void { this.currentPage = 1; this.loadDocentes(); }
  onDateSortChange(order: string): void { this.dateSortOrder = order === 'asc' ? 'asc' : 'desc'; this.currentPage = 1; this.loadDocentes(); }
  get totalPages(): number { return this.totalPagesCount; }
  get paginatedDocentes(): DocenteResponse[] { return this.filteredDocentes; }
  goToPage(page: number): void { if (page < 1 || page > this.totalPages) return; this.currentPage = page; this.loadDocentes(); }
  previousPage(): void { this.goToPage(this.currentPage - 1); }
  nextPage(): void { this.goToPage(this.currentPage + 1); }
  trackByDocenteId(_: number, docente: DocenteResponse): number { return docente.id; }

  openCreateModal(): void {
    this.isEditMode = false; this.modalErrorMsg = ''; this.selectedDocente = null;
    this.docenteForm.reset({ nombres: '', apellidos: '', correo: '', telefono: '', password: '' });
    this.showCreateEditModal = true;
  }
  openEditModal(docente: DocenteResponse): void {
    this.isEditMode = true; this.modalErrorMsg = ''; this.selectedDocente = docente;
    this.docenteForm.patchValue({ nombres: docente.nombres, apellidos: docente.apellidos, correo: docente.correo, telefono: docente.telefono, password: '' });
    this.showCreateEditModal = true;
  }
  closeCreateEditModal(): void { this.showCreateEditModal = false; this.isFormSubmitting = false; }
  eliminarDocente(docente: DocenteResponse): void {
    this.confirmModalType = 'danger';
    this.confirmModalTitle = '¿Eliminar Docente?';
    this.confirmModalMessage = `¿Estas seguro de que deseas ELIMINAR permanentemente al docente ${docente.nombres} ${docente.apellidos}? Esta accion no se puede deshacer.`;
    this.pendingAction = () => this.docenteService.eliminarDocente(docente.id).subscribe({
      next: () => { this.toastService.success('Docente eliminado permanentemente.'); this.loadDocentes(); this.showConfirmModal = false; },
      error: (err) => { this.toastService.error(err.error?.message || 'Error al eliminar el docente.'); this.showConfirmModal = false; }
    });
    this.showConfirmModal = true;
  }

  toggleEstado(docente: DocenteResponse): void {
    const nuevoEstado = !docente.estado;
    this.confirmModalType = nuevoEstado ? 'success' : 'danger';
    this.confirmModalTitle = `¿${nuevoEstado ? 'Activar' : 'Desactivar'} Docente?`;
    this.confirmModalMessage = `¿Deseas ${nuevoEstado ? 'activar' : 'desactivar'} a ${docente.nombres} ${docente.apellidos}?`;
    this.pendingAction = () => this.docenteService.cambiarEstado(docente.id, nuevoEstado).subscribe({
      next: () => { docente.estado = nuevoEstado; this.toastService.success(`Docente ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente.`); this.showConfirmModal = false; },
      error: (err) => { this.toastService.error(err.error?.message || 'Error al cambiar el estado del docente.'); this.showConfirmModal = false; }
    });
    this.showConfirmModal = true;
  }
  confirmAction(): void { this.pendingAction?.(); }
  onSubmit(): void {
    if (this.docenteForm.invalid) {
      this.docenteForm.markAllAsTouched();
      this.toastService.warning('Por favor completa los campos requeridos correctamente.');
      return;
    }
    const req: DocenteRequest = { nombres: this.docenteForm.value.nombres, apellidos: this.docenteForm.value.apellidos, correo: this.docenteForm.value.correo, telefono: this.docenteForm.value.telefono || '', password: this.docenteForm.value.password || undefined };
    this.isFormSubmitting = true;
    const call$ = this.isEditMode && this.selectedDocente ? this.docenteService.editarDocente(this.selectedDocente.id, req) : this.docenteService.crearDocente(req);
    call$.subscribe({
      next: () => {
        this.loadDocentes();
        this.toastService.success(this.isEditMode ? 'Docente actualizado exitosamente.' : 'Docente registrado exitosamente.');
        this.closeCreateEditModal();
      },
      error: (err) => { this.isFormSubmitting = false; this.modalErrorMsg = err.error?.message || 'Error al procesar la solicitud.'; this.toastService.error(this.modalErrorMsg, 'Error en el Servidor'); }
    });
  }

  getSubscriptionClass = getSubscriptionClass;
}
