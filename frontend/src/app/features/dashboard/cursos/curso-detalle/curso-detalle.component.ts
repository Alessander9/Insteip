import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CursoService } from '../../../../core/services/curso.service';
import { ModuloService } from '../../../../core/services/modulo.service';
import { MatriculaService } from '../../../../core/services/matricula.service';
import { AlumnoService } from '../../../../core/services/alumno.service';
import { CursoRequest, CursoResponse } from '../../../../core/models/curso.model';
import { ModuloRequest, ModuloResponse } from '../../../../core/models/modulo.model';
import { MatriculaRequest, MatriculaResponse } from '../../../../core/models/matricula.model';
import { AlumnoResponse } from '../../../../core/models/alumno.model';
import { VideoService } from '../../../../core/services/video.service';
import { MaterialService } from '../../../../core/services/material.service';
import { VideoResponse, VideoRequest } from '../../../../core/models/video.model';
import { MaterialResponse } from '../../../../core/models/material.model';
import { ReportesService } from '../../../../core/services/reportes.service';
import { ArchivoProtegidoService } from '../../../../core/services/archivo-protegido.service';

@Component({
  selector: 'app-curso-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './curso-detalle.component.html',
  styleUrls: ['./curso-detalle.component.css']
})
export class CursoDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cursoService = inject(CursoService);
  private moduloService = inject(ModuloService);
  private matriculaService = inject(MatriculaService);
  private alumnoService = inject(AlumnoService);
  private fb = inject(FormBuilder);
  private videoService = inject(VideoService);
  private materialService = inject(MaterialService);
  private reportesService = inject(ReportesService);
  private archivoProtegidoService = inject(ArchivoProtegidoService);

  exportarMatriculasCSV(): void {
    this.reportesService.exportarMatriculas().subscribe({
      error: (err) => {
        console.error('Error al exportar matrículas:', err);
      }
    });
  }

  cursoId!: number;
  curso: CursoResponse | null = null;
  modulos: ModuloResponse[] = [];

  // Active tab
  activeTab: 'modulos' | 'matriculas' = 'modulos';

  // Inline dynamic accordion properties
  expandedModuloId: number | null = null;
  videosMap: { [key: number]: VideoResponse[] } = {};
  materialesMap: { [key: number]: MaterialResponse[] } = {};

  // Inline forms toggles and inputs
  videoFormOpenMap: { [key: number]: boolean } = {};
  materialFormOpenMap: { [key: number]: boolean } = {};

  nuevoVideoTitulo = '';
  nuevoVideoUrl = '';
  nuevoVideoDesc = '';
  isAddingVideo = false;

  nuevoMaterialNombre = '';
  nuevoMaterialFile: File | null = null;
  isUploadingMaterial = false;

  // Matriculas
  matriculas: MatriculaResponse[] = [];
  alumnos: AlumnoResponse[] = [];
  alumnosDisponibles: AlumnoResponse[] = [];
  showMatriculaModal = false;
  isMatriculaSubmitting = false;
  matriculaErrorMsg = '';
  selectedAlumnoId: number | null = null;

  // Modals
  showModuloModal = false;
  showEditCourseModal = false;
  isEditModuloMode = false;
  isModuloSubmitting = false;
  isCourseSubmitting = false;

  // Selected for edits
  selectedModulo: ModuloResponse | null = null;

  // Errors
  moduloErrorMsg = '';
  courseErrorMsg = '';

  // Forms
  moduloForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    descripcion: ['', [Validators.required]],
    orden: [1, [Validators.required, Validators.min(1)]],
    estado: [true]
  });

  selectedSuscripcionIds: number[] = [];

  courseForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    descripcion: ['', [Validators.required]],
    imagenPortada: [''],
    estado: [true]
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.cursoId = Number(idParam);
        this.loadCourseData();
      } else {
        this.router.navigate(['/dashboard/cursos']);
      }
    });
  }

  loadCourseData(): void {
    this.cursoService.obtenerCurso(this.cursoId).subscribe({
      next: (data) => {
        try {
          this.curso = data;
          this.loadModulos();
          this.loadMatriculas();
        } catch (e) {
          console.error('Error al asignar datos de curso:', e);
          alert('Excepción al cargar detalles: ' + e);
        }
      },
      error: (err) => {
        console.error('Error al obtener curso', err);
        const errMsg = err.error?.message || err.message || 'Error desconocido';
        alert('Error al obtener los detalles del curso: ' + errMsg);
        this.router.navigate(['/dashboard/cursos']);
      }
    });
  }

  loadModulos(): void {
    try {
      this.moduloService.listarModulosPorCurso(this.cursoId).subscribe({
        next: (data) => {
          this.modulos = data;
        },
        error: (err) => {
          console.error('Error al listar módulos', err);
          alert('Error al cargar módulos: ' + (err.message || err));
        }
      });
    } catch (e) {
      console.error('Excepción en loadModulos:', e);
      alert('Excepción en carga de módulos: ' + e);
    }
  }

  loadMatriculas(): void {
    try {
      this.matriculaService.listarMatriculados(this.cursoId).subscribe({
        next: (data) => {
          this.matriculas = data;
        },
        error: (err) => {
          console.error('Error al listar matrículas', err);
          alert('Error al cargar matrículas: ' + (err.message || err));
        }
      });
    } catch (e) {
      console.error('Excepción en loadMatriculas:', e);
      alert('Excepción en carga de matrículas: ' + e);
    }
  }

  // Tab switching
  setTab(tab: 'modulos' | 'matriculas'): void {
    this.activeTab = tab;
    if (tab === 'matriculas' && this.matriculas.length === 0) {
      this.loadMatriculas();
    }
  }

  // ====== MATRICULA ACTIONS ======
  openMatriculaModal(): void {
    this.matriculaErrorMsg = '';
    this.selectedAlumnoId = null;
    this.isMatriculaSubmitting = false;

    // Load all alumnos and filter out already enrolled
    this.alumnoService.listarAlumnos().subscribe({
      next: (data) => {
        this.alumnos = data;
        const enrolledIds = new Set(this.matriculas.map(m => m.usuarioId));
        this.alumnosDisponibles = this.alumnos.filter(a => !enrolledIds.has(a.id) && a.estado);
        this.showMatriculaModal = true;
      },
      error: (err) => {
        console.error('Error al cargar alumnos', err);
      }
    });
  }

  closeMatriculaModal(): void {
    this.showMatriculaModal = false;
    this.isMatriculaSubmitting = false;
  }

  onMatriculaSubmit(): void {
    if (!this.selectedAlumnoId) {
      this.matriculaErrorMsg = 'Selecciona un alumno.';
      return;
    }

    this.isMatriculaSubmitting = true;
    this.matriculaErrorMsg = '';

    const req: MatriculaRequest = {
      usuarioId: this.selectedAlumnoId,
      cursoId: this.cursoId
    };

    this.matriculaService.matricularAlumno(req).subscribe({
      next: () => {
        this.loadMatriculas();
        this.closeMatriculaModal();
      },
      error: (err) => {
        this.isMatriculaSubmitting = false;
        this.matriculaErrorMsg = err.error?.message || 'Error al matricular al alumno.';
      }
    });
  }

  toggleMatriculaEstado(matricula: MatriculaResponse): void {
    const nuevoEstado = !matricula.estado;
    this.matriculaService.cambiarEstado(matricula.id, nuevoEstado).subscribe({
      next: () => {
        matricula.estado = nuevoEstado;
      },
      error: (err) => {
        console.error('Error al cambiar estado de matrícula', err);
      }
    });
  }

  // ====== MODULO ACTIONS ======
  openCreateModuloModal(): void {
    this.isEditModuloMode = false;
    this.moduloErrorMsg = '';
    this.selectedModulo = null;
    this.moduloForm.reset({
      nombre: '',
      descripcion: '',
      orden: this.modulos.length + 1,
      estado: true
    });
    this.showModuloModal = true;
  }

  openEditModuloModal(modulo: ModuloResponse): void {
    this.isEditModuloMode = true;
    this.moduloErrorMsg = '';
    this.selectedModulo = modulo;
    this.moduloForm.patchValue({
      nombre: modulo.nombre,
      descripcion: modulo.descripcion,
      orden: modulo.orden,
      estado: modulo.estado
    });
    this.showModuloModal = true;
  }

  closeModuloModal(): void {
    this.showModuloModal = false;
    this.isModuloSubmitting = false;
  }

  toggleModuloEstado(modulo: ModuloResponse): void {
    const nuevoEstado = !modulo.estado;
    this.moduloService.cambiarEstado(modulo.id, nuevoEstado).subscribe({
      next: () => {
        modulo.estado = nuevoEstado;
      },
      error: (err) => {
        console.error('Error al cambiar estado del módulo', err);
      }
    });
  }

  onModuloSubmit(): void {
    if (this.moduloForm.invalid) {
      return;
    }

    this.isModuloSubmitting = true;
    this.moduloErrorMsg = '';

    const req: ModuloRequest = {
      cursoId: this.cursoId,
      nombre: this.moduloForm.value.nombre,
      descripcion: this.moduloForm.value.descripcion,
      orden: Number(this.moduloForm.value.orden)
    };

    if (this.isEditModuloMode && this.selectedModulo) {
      this.moduloService.editarModulo(this.selectedModulo.id, req).subscribe({
        next: () => {
          const stateChanged = this.moduloForm.value.estado !== this.selectedModulo!.estado;
          if (stateChanged) {
            this.moduloService.cambiarEstado(this.selectedModulo!.id, this.moduloForm.value.estado).subscribe({
              next: () => {
                this.loadModulos();
                this.closeModuloModal();
              },
              error: (err) => this.handleModuloError(err)
            });
          } else {
            this.loadModulos();
            this.closeModuloModal();
          }
        },
        error: (err) => this.handleModuloError(err)
      });
    } else {
      this.moduloService.crearModulo(req).subscribe({
        next: () => {
          this.loadModulos();
          this.closeModuloModal();
        },
        error: (err) => this.handleModuloError(err)
      });
    }
  }

  private handleModuloError(err: any): void {
    this.isModuloSubmitting = false;
    this.moduloErrorMsg = err.error?.message || 'Error al procesar el módulo.';
  }

  // ====== COURSE EDIT ACTIONS ======
  openEditCourseModal(): void {
    if (!this.curso) return;
    this.courseErrorMsg = '';
    
    this.selectedSuscripcionIds = [];
    if (this.curso.nivelesSuscripcion) {
      if (this.curso.nivelesSuscripcion.includes('BASICO')) this.selectedSuscripcionIds.push(1);
      if (this.curso.nivelesSuscripcion.includes('INTERMEDIO')) this.selectedSuscripcionIds.push(2);
      if (this.curso.nivelesSuscripcion.includes('PREMIUM')) this.selectedSuscripcionIds.push(3);
    }

    this.courseForm.patchValue({
      nombre: this.curso.nombre,
      descripcion: this.curso.descripcion,
      imagenPortada: this.curso.imagenPortada,
      estado: this.curso.estado
    });
    this.showEditCourseModal = true;
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

  closeEditCourseModal(): void {
    this.showEditCourseModal = false;
    this.isCourseSubmitting = false;
  }

  onCourseSubmit(): void {
    if (this.courseForm.invalid || !this.curso) {
      return;
    }

    this.isCourseSubmitting = true;
    this.courseErrorMsg = '';

    const req: CursoRequest = {
      nombre: this.courseForm.value.nombre,
      descripcion: this.courseForm.value.descripcion,
      imagenPortada: this.courseForm.value.imagenPortada || '',
      nivelesSuscripcionIds: this.selectedSuscripcionIds
    };

    this.cursoService.editarCurso(this.cursoId, req).subscribe({
      next: () => {
        const stateChanged = this.courseForm.value.estado !== this.curso!.estado;
        if (stateChanged) {
          this.cursoService.cambiarEstado(this.cursoId, this.courseForm.value.estado).subscribe({
            next: () => {
              this.loadCourseData();
              this.closeEditCourseModal();
            },
            error: (err) => this.handleCourseError(err)
          });
        } else {
          this.loadCourseData();
          this.closeEditCourseModal();
        }
      },
      error: (err) => this.handleCourseError(err)
    });
  }

  private handleCourseError(err: any): void {
    this.isCourseSubmitting = false;
    this.courseErrorMsg = err.error?.message || 'Error al actualizar el curso.';
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

  // --- Dynamic Inline Syllabus Accordion Methods ---
  
  toggleModuloExpansion(moduloId: number): void {
    if (this.expandedModuloId === moduloId) {
      this.expandedModuloId = null;
    } else {
      this.expandedModuloId = moduloId;
      this.cargarContenidoModulo(moduloId);
    }
  }

  cargarContenidoModulo(moduloId: number): void {
    this.videoService.listarVideosPorModulo(moduloId).subscribe({
      next: (data) => this.videosMap[moduloId] = data.sort((a, b) => a.orden - b.orden),
      error: (err) => console.error('Error al cargar videos del módulo', err)
    });
    
    this.materialService.listarMaterialesPorModulo(moduloId).subscribe({
      next: (data) => this.materialesMap[moduloId] = data,
      error: (err) => console.error('Error al cargar materiales del módulo', err)
    });
  }

  // Videos
  agregarVideoInline(moduloId: number): void {
    if (!this.nuevoVideoTitulo || !this.nuevoVideoUrl) {
      alert('Por favor ingrese el título y la URL de YouTube.');
      return;
    }
    this.isAddingVideo = true;
    const req: VideoRequest = {
      moduloId,
      titulo: this.nuevoVideoTitulo,
      descripcion: this.nuevoVideoDesc,
      youtubeUrl: this.nuevoVideoUrl,
      orden: (this.videosMap[moduloId]?.length || 0) + 1
    };
    
    this.videoService.crearVideo(req).subscribe({
      next: () => {
        this.isAddingVideo = false;
        this.nuevoVideoTitulo = '';
        this.nuevoVideoUrl = '';
        this.nuevoVideoDesc = '';
        this.videoFormOpenMap[moduloId] = false;
        this.cargarContenidoModulo(moduloId);
      },
      error: (err) => {
        this.isAddingVideo = false;
        alert('Error al agregar video: ' + (err.error?.message || err.message));
      }
    });
  }

  toggleVideoEstadoInline(moduloId: number, video: VideoResponse): void {
    const nuevoEstado = !video.estado;
    this.videoService.cambiarEstado(video.id, nuevoEstado).subscribe({
      next: () => {
        video.estado = nuevoEstado;
      },
      error: (err) => alert('Error al cambiar estado del video: ' + err.message)
    });
  }

  // Materials
  onInlineFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo supera los 10MB permitidos.');
        return;
      }
      this.nuevoMaterialFile = file;
      if (!this.nuevoMaterialNombre) {
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        this.nuevoMaterialNombre = baseName;
      }
    }
  }

  subirMaterialInline(moduloId: number): void {
    if (!this.nuevoMaterialFile || !this.nuevoMaterialNombre) {
      alert('Debe ingresar un nombre y seleccionar un archivo.');
      return;
    }
    this.isUploadingMaterial = true;
    this.materialService.subirMaterial(moduloId, this.nuevoMaterialNombre, this.nuevoMaterialFile).subscribe({
      next: () => {
        this.isUploadingMaterial = false;
        this.nuevoMaterialNombre = '';
        this.nuevoMaterialFile = null;
        this.materialFormOpenMap[moduloId] = false;
        this.cargarContenidoModulo(moduloId);
      },
      error: (err) => {
        this.isUploadingMaterial = false;
        alert('Error al subir material: ' + (err.error?.message || err.message));
      }
    });
  }

  toggleMaterialEstadoInline(moduloId: number, mat: MaterialResponse): void {
    const nuevoEstado = !mat.estado;
    this.materialService.cambiarEstado(mat.id, nuevoEstado).subscribe({
      next: () => {
        mat.estado = nuevoEstado;
      },
      error: (err) => alert('Error al cambiar estado del material: ' + err.message)
    });
  }

  // Helpers
  getFileIcon(tipo: string): string {
    const t = (tipo || '').toLowerCase();
    if (t.includes('pdf')) return 'picture_as_pdf';
    if (t.includes('word') || t.includes('msword') || t.includes('document')) return 'description';
    if (t.includes('image') || t.includes('jpeg') || t.includes('jpg') || t.includes('png')) return 'image';
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
    const i = Math.log(bytes) / Math.log(k);
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  descargarMaterial(mat: MaterialResponse): void {
    const extension = this.getFileExtension(mat.tipoArchivo);
    const fileName = mat.nombre.toLowerCase().endsWith(`.${extension}`) ? mat.nombre : `${mat.nombre}.${extension}`;

    this.archivoProtegidoService.descargar(mat.archivoUrl, fileName).subscribe({
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
}
