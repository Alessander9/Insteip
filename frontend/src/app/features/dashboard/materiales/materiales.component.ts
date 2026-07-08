import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModuloService } from '../../../core/services/modulo.service';
import { MaterialService } from '../../../core/services/material.service';
import { ModuloResponse } from '../../../core/models/modulo.model';
import { MaterialResponse } from '../../../core/models/material.model';
import { ArchivoProtegidoService } from '../../../core/services/archivo-protegido.service';

@Component({
  selector: 'app-materiales',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './materiales.component.html',
  styleUrls: ['./materiales.component.css']
})
export class MaterialesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private moduloService = inject(ModuloService);
  private materialService = inject(MaterialService);
  private archivoProtegidoService = inject(ArchivoProtegidoService);
  private fb = inject(FormBuilder);

  moduloId!: number;
  modulo: ModuloResponse | null = null;
  materiales: MaterialResponse[] = [];
  filteredMateriales: MaterialResponse[] = [];
  searchQuery = '';
  dateSortOrder: 'desc' | 'asc' = 'desc';
  currentPage = 1;
  readonly pageSize = 10;

  // Modal controls
  showMaterialModal = false;
  isEditMode = false;
  isFormSubmitting = false;
  isFormSubmitted = false;
  modalErrorMsg = '';

  selectedMaterial: MaterialResponse | null = null;
  selectedFile: File | null = null;

  materialForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    estado: [true]
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.moduloId = Number(idParam);
        this.loadModuloData();
      } else {
        this.router.navigate(['/dashboard/cursos']);
      }
    });
  }

  loadModuloData(): void {
    this.moduloService.obtenerModulo(this.moduloId).subscribe({
      next: (data) => {
        this.modulo = data;
        this.loadMateriales();
      },
      error: (err) => {
        console.error('Error al obtener modulo', err);
        this.router.navigate(['/dashboard/cursos']);
      }
    });
  }

  loadMateriales(): void {
    this.materialService.listarMaterialesPorModulo(this.moduloId).subscribe({
      next: (data) => {
        this.materiales = data;
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error al listar materiales', err);
      }
    });
  }

  applyFilter(): void {
    const query = this.searchQuery.trim().toLowerCase();
    this.filteredMateriales = this.materiales.filter(m =>
      !query ||
      m.nombre.toLowerCase().includes(query) ||
      m.fechaSubida.toLowerCase().includes(query)
    ).sort((a, b) => {
      const d1 = new Date(a.fechaSubida).getTime() || 0;
      const d2 = new Date(b.fechaSubida).getTime() || 0;
      return this.dateSortOrder === 'asc' ? d1 - d2 : d2 - d1;
    });
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredMateriales.length / this.pageSize));
  }

  get paginatedMateriales(): MaterialResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredMateriales.slice(start, start + this.pageSize);
  }

  onDateSortChange(order: string): void {
    this.dateSortOrder = order === 'asc' ? 'asc' : 'desc';
    this.applyFilter();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.modalErrorMsg = '';
    this.selectedMaterial = null;
    this.selectedFile = null;
    this.isFormSubmitted = false;
    this.isFormSubmitting = false;
    this.materialForm.reset({
      nombre: '',
      estado: true
    });
    this.showMaterialModal = true;
  }

  openEditModal(material: MaterialResponse): void {
    this.isEditMode = true;
    this.modalErrorMsg = '';
    this.selectedMaterial = material;
    this.selectedFile = null;
    this.isFormSubmitted = false;
    this.isFormSubmitting = false;
    
    this.materialForm.patchValue({
      nombre: material.nombre,
      estado: material.estado
    });
    this.showMaterialModal = true;
  }

  closeMaterialModal(): void {
    this.showMaterialModal = false;
    this.isFormSubmitting = false;
    this.isFormSubmitted = false;
    this.selectedFile = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        this.modalErrorMsg = 'El archivo supera el límite de tamaño permitido (10MB).';
        this.selectedFile = null;
        return;
      }
      this.modalErrorMsg = '';
      this.selectedFile = file;
    }
  }

  toggleEstado(material: MaterialResponse): void {
    const nuevoEstado = !material.estado;
    this.materialService.cambiarEstado(material.id, nuevoEstado).subscribe({
      next: () => {
        material.estado = nuevoEstado;
      },
      error: (err) => {
        console.error('Error al cambiar estado del material', err);
      }
    });
  }

  onSubmit(): void {
    this.isFormSubmitted = true;
    
    if (this.materialForm.invalid) {
      this.modalErrorMsg = 'El nombre del recurso es obligatorio.';
      return;
    }

    if (!this.isEditMode && !this.selectedFile) {
      this.modalErrorMsg = 'Debe seleccionar un archivo físico para subir.';
      return;
    }

    this.isFormSubmitting = true;
    this.modalErrorMsg = '';

    const nombre = this.materialForm.value.nombre;

    if (this.isEditMode && this.selectedMaterial) {
      this.materialService.editarMaterial(this.selectedMaterial.id, nombre, this.selectedFile || undefined).subscribe({
        next: (res) => {
          const stateChanged = this.materialForm.value.estado !== this.selectedMaterial!.estado;
          if (stateChanged) {
            this.materialService.cambiarEstado(this.selectedMaterial!.id, this.materialForm.value.estado).subscribe({
              next: () => {
                this.loadMateriales();
                this.closeMaterialModal();
              },
              error: (err) => this.handleError(err)
            });
          } else {
            this.loadMateriales();
            this.closeMaterialModal();
          }
        },
        error: (err) => this.handleError(err)
      });
    } else {
      this.materialService.subirMaterial(this.moduloId, nombre, this.selectedFile!).subscribe({
        next: () => {
          this.loadMateriales();
          this.closeMaterialModal();
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  getFileIcon(tipo: string): string {
    const t = (tipo || '').toLowerCase();
    if (t.includes('pdf')) {
      return 'picture_as_pdf';
    }
    if (t.includes('word') || t.includes('msword') || t.includes('document')) {
      return 'description';
    }
    if (t.includes('image') || t.includes('jpeg') || t.includes('jpg') || t.includes('png')) {
      return 'image';
    }
    return 'article';
  }

  getCleanFileType(tipo: string): string {
    const t = (tipo || '').toLowerCase();
    if (t.includes('pdf')) return 'PDF';
    if (t.includes('vnd.openxmlformats-officedocument.wordprocessingml.document')) return 'DOCX';
    if (t.includes('msword') || t.includes('word')) return 'DOC';
    if (t.includes('jpeg') || t.includes('jpg')) return 'JPG';
    if (t.includes('png')) return 'PNG';
    return 'Archivo';
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  descargarMaterial(material: MaterialResponse): void {
    const extension = this.getFileExtension(material.tipoArchivo);
    const fileName = material.nombre.toLowerCase().endsWith(`.${extension}`) ? material.nombre : `${material.nombre}.${extension}`;

    this.archivoProtegidoService.descargar(material.archivoUrl, fileName).subscribe({
      error: (err) => console.error('Error al descargar material:', err)
    });
  }

  private getFileExtension(tipo: string): string {
    const t = (tipo || '').toLowerCase();
    if (t.includes('pdf')) return 'pdf';
    if (t.includes('vnd.openxmlformats-officedocument.wordprocessingml.document')) return 'docx';
    if (t.includes('msword') || t.includes('word')) return 'doc';
    if (t.includes('jpeg') || t.includes('jpg')) return 'jpg';
    if (t.includes('png')) return 'png';
    return 'bin';
  }

  private handleError(err: any): void {
    this.isFormSubmitting = false;
    this.modalErrorMsg = err.error?.message || 'Error al procesar el material.';
  }
}
