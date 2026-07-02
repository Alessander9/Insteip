import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CursoService } from '../../../core/services/curso.service';
import { CursoRequest, CursoResponse } from '../../../core/models/curso.model';
import { ReportesService } from '../../../core/services/reportes.service';

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.css']
})
export class CursosComponent implements OnInit {
  private cursoService = inject(CursoService);
  private reportesService = inject(ReportesService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

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

  selectedCurso: CursoResponse | null = null;
  selectedSuscripcionIds: number[] = [];

  cursoForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    descripcion: ['', [Validators.required]],
    imagenPortada: [''],
    estado: [true]
  });

  ngOnInit(): void {
    this.loadCursos();
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
    if (!this.searchQuery.trim()) {
      this.filteredCursos = [...this.cursos];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredCursos = this.cursos.filter(c => 
      c.nombre.toLowerCase().includes(query) ||
      c.descripcion.toLowerCase().includes(query)
    );
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.modalErrorMsg = '';
    this.selectedCurso = null;
    this.selectedSuscripcionIds = [1]; // Default to Básico
    this.cursoForm.reset({
      nombre: '',
      descripcion: '',
      imagenPortada: '',
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

    this.cursoForm.patchValue({
      nombre: curso.nombre,
      descripcion: curso.descripcion,
      imagenPortada: curso.imagenPortada,
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
    this.cursoService.cambiarEstado(curso.id, nuevoEstado).subscribe({
      next: () => {
        curso.estado = nuevoEstado;
      },
      error: (err) => {
        console.error('Error al cambiar estado del curso', err);
      }
    });
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
      return;
    }

    this.isFormSubmitting = true;
    this.modalErrorMsg = '';

    const req: CursoRequest = {
      nombre: this.cursoForm.value.nombre,
      descripcion: this.cursoForm.value.descripcion,
      imagenPortada: this.cursoForm.value.imagenPortada || '',
      nivelesSuscripcionIds: this.selectedSuscripcionIds
    };

    if (this.isEditMode && this.selectedCurso) {
      this.cursoService.editarCurso(this.selectedCurso.id, req).subscribe({
        next: () => {
          const stateChanged = this.cursoForm.value.estado !== this.selectedCurso!.estado;
          if (stateChanged) {
            this.cursoService.cambiarEstado(this.selectedCurso!.id, this.cursoForm.value.estado).subscribe({
              next: () => {
                this.loadCursos();
                this.closeCreateEditModal();
              },
              error: (err) => this.handleError(err)
            });
          } else {
            this.loadCursos();
            this.closeCreateEditModal();
          }
        },
        error: (err) => this.handleError(err)
      });
    } else {
      this.cursoService.crearCurso(req).subscribe({
        next: () => {
          this.loadCursos();
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
  }

  formatNiveles(niveles: string[]): string {
    if (!niveles || niveles.length === 0) return 'Ninguno';
    return niveles.map(n => {
      if (n === 'BASICO') return 'Básico';
      if (n === 'INTERMEDIO') return 'Intermedio';
      if (n === 'PREMIUM') return 'Premium';
      return n;
    }).join(' • ');
  }

  getSubscriptionClass(niveles: string[]): string {
    if (!niveles || niveles.length === 0) {
      return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
    if (niveles.includes('PREMIUM')) {
      return 'bg-[#f9e37a]/20 text-[#6d5e00] border border-[#f9e37a]/60';
    }
    if (niveles.includes('INTERMEDIO')) {
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    }
    return 'bg-slate-50 text-slate-700 border border-slate-200';
  }
}
