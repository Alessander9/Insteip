import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CursoService } from '../../../../core/services/curso.service';
import { AuthService } from '../../../../core/services/auth.service';
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
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmModalComponent } from '../../../../core/components/confirm-modal/confirm-modal.component';
import { formatBytes, getFileIcon, getCleanFileType, getFileExtension } from '../../../../core/utils/file.utils';
import { getSubscriptionClass, formatNiveles } from '../../../../core/utils/subscription.utils';
import { UsuarioService, DocenteOption } from '../../../../core/services/usuario.service';

@Component({
  selector: 'app-curso-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmModalComponent
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
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private usuarioService = inject(UsuarioService);

  isDocente = false;

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
  alumnoSearchTerm = '';
  showMatriculaModal = false;
  isMatriculaSubmitting = false;
  matriculaErrorMsg = '';
  selectedAlumnoId: number | null = null;
  showAlumnoDropdown = false;

  // Confirm modal controls
  showConfirmModal = false;
  confirmModalType: 'success' | 'danger' | 'info' | 'warning' = 'warning';
  confirmModalTitle = '';
  confirmModalMessage = '';
  pendingAction: (() => void) | null = null;

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
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    orden: [1, [Validators.required, Validators.min(1), Validators.max(999)]],
    estado: [true]
  });

  selectedSuscripcionIds: number[] = [];
  docentes: DocenteOption[] = [];
  docentesFiltrados: DocenteOption[] = [];
  docenteSearch = '';
  selectedDocenteId: number | null = null;
  showDocenteDropdown = false;

  courseForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    imagenPortada: ['', [Validators.pattern('^https?:\\/\\/.+$')]],
    docenteId: [null],
    estado: [true]
  });

  ngOnInit(): void {
    this.authService.getProfile().subscribe(user => {
      if (user && user.rol === 'DOCENTE') {
        this.isDocente = true;
        this.activeTab = 'modulos';
      }
    });

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.cursoId = Number(idParam);
        this.loadCourseData();
      } else {
        this.router.navigate([this.isDocente ? '/dashboard/mis-cursos-docente' : '/dashboard/cursos']);
      }
    });
  }

  confirmAction(): void {
    if (this.pendingAction) {
      this.pendingAction();
    }
  }

  loadCourseData(): void {
    this.cursoService.obtenerCurso(this.cursoId).subscribe({
      next: (data) => {
        try {
          this.curso = data;
          this.loadModulos();
          this.loadMatriculas();
        } catch (e: any) {
          console.error('Error al asignar datos de curso:', e);
          this.toastService.error('Excepción al cargar detalles: ' + e.message);
        }
      },
      error: (err) => {
        console.error('Error al obtener curso', err);
        const errMsg = err.error?.message || err.message || 'Error desconocido';
        this.toastService.error('Error al obtener los detalles del curso: ' + errMsg);
        this.router.navigate([this.isDocente ? '/dashboard/mis-cursos-docente' : '/dashboard/cursos']);
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
          this.toastService.error('Error al cargar módulos: ' + (err.error?.message || err.message));
        }
      });
    } catch (e: any) {
      console.error('Excepción en loadModulos:', e);
      this.toastService.error('Excepción en carga de módulos: ' + e.message);
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
          this.toastService.error('Error al cargar matrículas: ' + (err.error?.message || err.message));
        }
      });
    } catch (e: any) {
      console.error('Excepción en loadMatriculas:', e);
      this.toastService.error('Excepción en carga de matrículas: ' + e.message);
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
    this.alumnoSearchTerm = '';
    this.showAlumnoDropdown = false;
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
    this.showAlumnoDropdown = false;
  }

  get alumnosFiltrados(): AlumnoResponse[] {
    const query = this.alumnoSearchTerm.trim().toLowerCase();
    if (!query) return this.alumnosDisponibles;

    return this.alumnosDisponibles.filter(alumno => {
      const nombres = `${alumno.nombres} ${alumno.apellidos}`.toLowerCase();
      const correo = alumno.correo.toLowerCase();
      const id = String(alumno.id);
      return nombres.includes(query) || correo.includes(query) || id.includes(query);
    });
    this.loadDocentes();
  }

  loadDocentes(): void {
    this.usuarioService.listarDocentes().subscribe({
      next: (data) => {
        this.docentes = data || [];
        this.docentesFiltrados = this.docentes;
      },
      error: (err) => console.error('Error al cargar docentes', err)
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
    this.courseForm.patchValue({ docenteId: docente.id });
    this.showDocenteDropdown = false;
  }

  get selectedAlumnoLabel(): string {
    const alumno = this.alumnosDisponibles.find(item => item.id === this.selectedAlumnoId);
    return alumno ? `${alumno.nombres} ${alumno.apellidos} — ${alumno.correo}` : '';
  }

  openAlumnoDropdown(): void {
    if (this.alumnosFiltrados.length > 0) {
      this.showAlumnoDropdown = true;
    }
  }

  closeAlumnoDropdown(): void {
    this.showAlumnoDropdown = false;
  }

  selectAlumno(alumno: AlumnoResponse): void {
    this.selectedAlumnoId = alumno.id;
    this.alumnoSearchTerm = `${alumno.nombres} ${alumno.apellidos}`;
    this.showAlumnoDropdown = false;
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
        this.toastService.success('Alumno matriculado exitosamente en el curso.');
        this.closeMatriculaModal();
      },
      error: (err) => {
        this.isMatriculaSubmitting = false;
        this.matriculaErrorMsg = err.error?.message || 'Error al matricular al alumno.';
        this.toastService.error(this.matriculaErrorMsg);
      }
    });
  }

  toggleMatriculaEstado(matricula: MatriculaResponse): void {
    const nuevoEstado = !matricula.estado;
    const accion = nuevoEstado ? 'Reactivar' : 'Dar de Baja';
    
    this.confirmModalType = nuevoEstado ? 'success' : 'danger';
    this.confirmModalTitle = `¿${accion} Matrícula?`;
    this.confirmModalMessage = `¿Estás seguro de que deseas ${accion.toLowerCase()} la matrícula del alumno ${matricula.alumnoNombres} ${matricula.alumnoApellidos}?`;
    
    this.pendingAction = () => {
      this.matriculaService.cambiarEstado(matricula.id, nuevoEstado).subscribe({
        next: () => {
          matricula.estado = nuevoEstado;
          this.toastService.success(`Matrícula de ${matricula.alumnoNombres} ${nuevoEstado ? 'reactivada' : 'dada de baja'} exitosamente.`);
          this.showConfirmModal = false;
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Error al cambiar estado de la matrícula.');
          this.showConfirmModal = false;
        }
      });
    };
    
    this.showConfirmModal = true;
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
    const accion = nuevoEstado ? 'Activar' : 'Desactivar';
    
    this.confirmModalType = nuevoEstado ? 'success' : 'warning';
    this.confirmModalTitle = `¿${accion} Módulo?`;
    this.confirmModalMessage = `¿Estás seguro de que deseas ${accion.toLowerCase()} el módulo "${modulo.nombre}"?`;
    
    this.pendingAction = () => {
      this.moduloService.cambiarEstado(modulo.id, nuevoEstado).subscribe({
        next: () => {
          modulo.estado = nuevoEstado;
          this.toastService.success(`Módulo "${modulo.nombre}" ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente.`);
          this.showConfirmModal = false;
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Error al cambiar estado del módulo.');
          this.showConfirmModal = false;
        }
      });
    };
    
    this.showConfirmModal = true;
  }

  onModuloSubmit(): void {
    if (this.moduloForm.invalid) {
      this.moduloForm.markAllAsTouched();
      this.toastService.warning('Por favor complete todos los campos requeridos del módulo correctamente.');
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
                this.toastService.success('Módulo y su estado actualizados con éxito.');
                this.closeModuloModal();
              },
              error: (err) => this.handleModuloError(err)
            });
          } else {
            this.loadModulos();
            this.toastService.success('Módulo modificado con éxito.');
            this.closeModuloModal();
          }
        },
        error: (err) => this.handleModuloError(err)
      });
    } else {
      this.moduloService.crearModulo(req).subscribe({
        next: () => {
          this.loadModulos();
          this.toastService.success('Módulo creado con éxito.');
          this.closeModuloModal();
        },
        error: (err) => this.handleModuloError(err)
      });
    }
  }

  private handleModuloError(err: any): void {
    this.isModuloSubmitting = false;
    this.moduloErrorMsg = err.error?.message || 'Error al procesar el módulo.';
    this.toastService.error(this.moduloErrorMsg);
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

    this.selectedDocenteId = this.curso.docenteId || null;
    const docente = this.docentes.find(d => d.id === this.curso?.docenteId);
    this.docenteSearch = docente ? `${docente.nombres} ${docente.apellidos} — ${docente.correo}` : '';
    this.courseForm.patchValue({
      nombre: this.curso.nombre,
      descripcion: this.curso.descripcion,
      imagenPortada: this.curso.imagenPortada,
      docenteId: this.curso.docenteId || null,
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
    if (!this.curso) return;
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      this.toastService.warning('Por favor complete todos los campos requeridos del curso correctamente.');
      return;
    }

    this.isCourseSubmitting = true;
    this.courseErrorMsg = '';

    const req: CursoRequest = {
      nombre: this.courseForm.value.nombre,
      descripcion: this.courseForm.value.descripcion,
      imagenPortada: this.courseForm.value.imagenPortada || '',
      nivelesSuscripcionIds: this.selectedSuscripcionIds,
      docenteId: this.courseForm.value.docenteId || null
    };

    this.cursoService.editarCurso(this.cursoId, req).subscribe({
      next: () => {
        const stateChanged = this.courseForm.value.estado !== this.curso!.estado;
        if (stateChanged) {
          this.cursoService.cambiarEstado(this.cursoId, this.courseForm.value.estado).subscribe({
            next: () => {
              this.loadCourseData();
              this.toastService.success('Curso y su estado actualizados con éxito.');
              this.closeEditCourseModal();
            },
            error: (err) => this.handleCourseError(err)
          });
        } else {
          this.loadCourseData();
          this.toastService.success('Curso modificado con éxito.');
          this.closeEditCourseModal();
        }
      },
      error: (err) => this.handleCourseError(err)
    });
  }

  private handleCourseError(err: any): void {
    this.isCourseSubmitting = false;
    this.courseErrorMsg = err.error?.message || 'Error al actualizar el curso.';
    this.toastService.error(this.courseErrorMsg);
  }

  formatNiveles = formatNiveles;
  getSubscriptionClass = getSubscriptionClass;

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
      this.toastService.warning('Por favor ingrese el título y la URL de YouTube.');
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
        this.toastService.success('Video agregado exitosamente al módulo.');
      },
      error: (err) => {
        this.isAddingVideo = false;
        this.toastService.error('Error al agregar video: ' + (err.error?.message || err.message));
      }
    });
  }

  toggleVideoEstadoInline(moduloId: number, video: VideoResponse): void {
    const nuevoEstado = !video.estado;
    this.videoService.cambiarEstado(video.id, nuevoEstado).subscribe({
      next: () => {
        video.estado = nuevoEstado;
        this.toastService.success(`Video ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente.`);
      },
      error: (err) => this.toastService.error('Error al cambiar estado del video: ' + err.message)
    });
  }

  // Materials
  onInlineFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.toastService.warning('El archivo supera los 10MB permitidos.');
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
      this.toastService.warning('Debe ingresar un nombre y seleccionar un archivo.');
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
        this.toastService.success('Material de apoyo subido exitosamente.');
      },
      error: (err) => {
        this.isUploadingMaterial = false;
        this.toastService.error('Error al subir material: ' + (err.error?.message || err.message));
      }
    });
  }

  toggleMaterialEstadoInline(moduloId: number, mat: MaterialResponse): void {
    const nuevoEstado = !mat.estado;
    this.materialService.cambiarEstado(mat.id, nuevoEstado).subscribe({
      next: () => {
        mat.estado = nuevoEstado;
        this.toastService.success(`Material ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente.`);
      },
      error: (err) => this.toastService.error('Error al cambiar estado del material: ' + err.message)
    });
  }

  // Helpers
  getFileIcon = getFileIcon;
  getCleanFileType = getCleanFileType;
  formatBytes = formatBytes;

  descargarMaterial(mat: MaterialResponse): void {
    const extension = getFileExtension(mat.tipoArchivo);
    const fileName = mat.nombre.toLowerCase().endsWith(`.${extension}`) ? mat.nombre : `${mat.nombre}.${extension}`;

    this.archivoProtegidoService.descargar(mat.archivoUrl, fileName).subscribe({
      error: (err) => console.error('Error al descargar material:', err)
    });
  }
}
