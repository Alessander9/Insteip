import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { DiaAcupunturaService } from '../../../core/services/dia-acupuntura.service';
import { MatriculaService } from '../../../core/services/matricula.service';
import { AlumnoService } from '../../../core/services/alumno.service';
import { CertificadoService } from '../../../core/services/certificado.service';
import { AlumnoResponse } from '../../../core/models/alumno.model';
import { ResumenInscritosEvento, TallerEvento, VideoEvento, MatriculaLoteEventoRequest, ActualizarVideoTallerRequest, MatriculaResultadoResponse, VideoGeneralEvento, ActualizarVideoGeneralRequest, AlumnoInscritoEvento } from '../../../core/models/dia-acupuntura.model';

@Component({
  selector: 'app-dia-acupuntura-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dia-acupuntura-admin.component.html',
  styleUrls: ['./dia-acupuntura-admin.component.css']
})
export class DiaAcupunturaAdminComponent implements OnInit {
  private diaService = inject(DiaAcupunturaService);
  private matriculaService = inject(MatriculaService);
  private alumnoService = inject(AlumnoService);
  private certificadoService = inject(CertificadoService);

  // ── Modal Subir Certificado Oficial ──
  modalSubirCertificadoAbierto = false;
  alumnoCertificado: {
    usuarioId: number;
    nombresCompletos: string;
    correo?: string;
    talleresInscritos: { cursoId: number; cursoNombre: string; seleccionado: boolean }[];
  } | null = null;
  archivoCertificadoSeleccionado: File | null = null;
  previewImagenCertificadoUrl: string | null = null;
  subiendoCertificado = false;
  mensajeExitoCertificado = '';
  mensajeErrorCertificado = '';

  talleres: TallerEvento[] = [];
  resumen: ResumenInscritosEvento[] = [];
  cargando = true;
  guardando = false;
  descargandoPdfId: number | null = null;
  mensajeExito = '';
  mensajeError = '';

  // ── Video General del Evento ──
  videoGeneral: VideoGeneralEvento | null = null;
  formVideoGeneral: ActualizarVideoGeneralRequest = {
    youtubeUrl: '',
    titulo: 'Sesión Inaugural: Día de la Acupuntura',
    descripcion: '',
    duracionMinutos: 90,
    activo: true
  };
  guardandoVideoGeneral = false;
  mensajeExitoVideoGeneral = '';
  mensajeErrorVideoGeneral = '';

  // Resultado de última matrícula
  resultadoMatricula: MatriculaResultadoResponse | null = null;

  // Pestañas del Panel Admin
  tabActiva: 'clases' | 'matriculas' | 'reporte' = 'clases';

  // Modal para agregar/editar Video
  tallerSeleccionado: TallerEvento | null = null;
  videoSeleccionado: VideoEvento | null = null;
  formVideo: ActualizarVideoTallerRequest = {
    youtubeUrl: '',
    titulo: '',
    duracionMinutos: 90
  };
  modalVideoAbierto = false;

  // Formulario Individual de Matrícula
  formIndividual = {
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    password: '',
    cursosSeleccionados: {} as { [key: number]: boolean }
  };

  // Formulario Lote
  textoLote = '';
  modoLote = false;

  // ── Filtro en vivo en Pestaña 3 (Reporte de Inscritos) ──
  busquedaReporte = '';

  // ── Modal de Búsqueda General de Alumno Existente ──
  modalBuscarAlumnoAbierto = false;
  busquedaAlumnoTerm = '';
  alumnosEncontrados: AlumnoResponse[] = [];
  buscandoAlumnos = false;

  // ── Modal de Edición Directa de Talleres de Alumno ──
  modalEditarTalleresAbierto = false;
  alumnoEditando: {
    usuarioId: number;
    nombresCompletos: string;
    nombres: string;
    apellidos: string;
    correo: string;
    telefono?: string;
  } | null = null;
  talleresSeleccionadosEdit: { [cursoId: number]: boolean } = {};
  matriculasPreviasEdit: { [cursoId: number]: number } = {}; // cursoId -> matriculaId
  cargandoTalleresAlumno = false;
  guardandoTalleresAlumno = false;

  // ── Autocompletado en Tab 2 (Matrícula Individual) ──
  busquedaTab2 = '';
  alumnosSugeridosTab2: AlumnoResponse[] = [];
  buscandoTab2 = false;

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.cargarVideoGeneralAdmin();
    this.diaService.listarTalleres().subscribe({
      next: (talleresData) => {
        this.talleres = talleresData;
        this.diaService.obtenerResumenInscritos().subscribe({
          next: (resumenData) => {
            this.resumen = resumenData;
            this.cargando = false;
          },
          error: (err) => {
            console.error('Error al cargar resumen', err);
            this.cargando = false;
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar talleres', err);
        this.cargando = false;
      }
    });
  }

  cargarVideoGeneralAdmin(): void {
    this.diaService.obtenerVideoGeneral().subscribe({
      next: (data) => {
        this.videoGeneral = data;
        if (data) {
          this.formVideoGeneral = {
            youtubeUrl: data.youtubeUrl || '',
            titulo: data.titulo || 'Sesión Inaugural: Día de la Acupuntura',
            descripcion: data.descripcion || '',
            duracionMinutos: data.duracionMinutos || 90,
            activo: data.activo !== false
          };
        }
      },
      error: (err) => {
        console.error('Error al cargar video general en admin', err);
      }
    });
  }

  guardarVideoGeneralAdmin(): void {
    if (!this.formVideoGeneral.youtubeUrl || !this.formVideoGeneral.youtubeUrl.trim()) {
      this.mensajeErrorVideoGeneral = 'Por favor ingresa la URL de YouTube para el video general.';
      return;
    }

    this.guardandoVideoGeneral = true;
    this.mensajeErrorVideoGeneral = '';
    this.mensajeExitoVideoGeneral = '';

    this.diaService.guardarVideoGeneral(this.formVideoGeneral).subscribe({
      next: () => {
        this.guardandoVideoGeneral = false;
        this.mensajeExitoVideoGeneral = '¡Video General del Evento actualizado exitosamente!';
        this.cargarVideoGeneralAdmin();
        setTimeout(() => {
          this.mensajeExitoVideoGeneral = '';
        }, 5000);
      },
      error: (err) => {
        this.guardandoVideoGeneral = false;
        this.mensajeErrorVideoGeneral = err.error?.message || 'Error al guardar el video general.';
      }
    });
  }

  extraerYoutubeId(url: string | null | undefined): string | null {
    if (!url || !url.trim()) return null;
    const clean = url.trim();
    if (/^[\w-]{11}$/.test(clean)) return clean;
    const match = clean.match(/(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:embed\/|v\/|live\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  }

  get youtubeIdDetectado(): string {
    const id = this.extraerYoutubeId(this.formVideoGeneral?.youtubeUrl);
    return id || (this.videoGeneral?.youtubeId || 'Ninguno');
  }

  get youtubeIdModalDetectado(): string | null {
    return this.extraerYoutubeId(this.formVideo?.youtubeUrl);
  }

  // ── GESTIÓN DE VIDEOS / CLASES ─────────────────────────────
  abrirModalNuevoVideo(taller: TallerEvento): void {
    this.tallerSeleccionado = taller;
    this.videoSeleccionado = null;
    const numVideos = taller.videos ? taller.videos.length + 1 : 1;
    this.formVideo = {
      youtubeUrl: '',
      titulo: `Parte ${numVideos}: ` + taller.nombre,
      duracionMinutos: 90
    };
    this.modalVideoAbierto = true;
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  abrirModalEditarVideo(taller: TallerEvento, video: VideoEvento): void {
    this.tallerSeleccionado = taller;
    this.videoSeleccionado = video;
    this.formVideo = {
      youtubeUrl: video.youtubeUrl || '',
      titulo: video.titulo || '',
      duracionMinutos: video.duracionMinutos || 90
    };
    this.modalVideoAbierto = true;
    this.mensajeError = '';
    this.mensajeExito = '';
  }

  cerrarModalVideo(): void {
    this.modalVideoAbierto = false;
    this.tallerSeleccionado = null;
    this.videoSeleccionado = null;
  }

  guardarVideoTaller(): void {
    if (!this.tallerSeleccionado) return;
    if (!this.formVideo.youtubeUrl.trim()) {
      this.mensajeError = 'Por favor ingresa el enlace de YouTube.';
      return;
    }

    this.guardando = true;

    if (this.videoSeleccionado) {
      // Editar video existente
      this.diaService.actualizarVideoTaller(this.tallerSeleccionado.id, this.videoSeleccionado.id, this.formVideo).subscribe({
        next: () => {
          this.guardando = false;
          this.mensajeExito = `¡Video "${this.formVideo.titulo}" actualizado con éxito!`;
          this.cerrarModalVideo();
          this.cargarDatos();
        },
        error: (err) => {
          this.guardando = false;
          this.mensajeError = err.error?.message || 'Error al actualizar el video.';
        }
      });
    } else {
      // Agregar nuevo video al taller
      this.diaService.agregarVideoTaller(this.tallerSeleccionado.id, this.formVideo).subscribe({
        next: () => {
          this.guardando = false;
          this.mensajeExito = `¡Nuevo video agregado con éxito al taller "${this.tallerSeleccionado?.nombre}"!`;
          this.cerrarModalVideo();
          this.cargarDatos();
        },
        error: (err) => {
          this.guardando = false;
          this.mensajeError = err.error?.message || 'Error al agregar el video.';
        }
      });
    }
  }

  eliminarVideo(taller: TallerEvento, video: VideoEvento): void {
    if (!confirm(`¿Estás seguro de eliminar el video "${video.titulo}"?`)) return;

    this.diaService.eliminarVideoTaller(taller.id, video.id).subscribe({
      next: () => {
        this.mensajeExito = `¡Video eliminado con éxito!`;
        this.cargarDatos();
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'Error al eliminar el video.';
      }
    });
  }

  // ── GESTIÓN DE MATRÍCULAS ──────────────────────────────────
  guardarMatriculaIndividual(): void {
    if (!this.formIndividual.correo || !this.formIndividual.nombres || !this.formIndividual.apellidos) {
      this.mensajeError = 'Por favor completa los nombres, apellidos y correo.';
      return;
    }

    const cursosIds = Object.keys(this.formIndividual.cursosSeleccionados)
      .filter(k => this.formIndividual.cursosSeleccionados[+k])
      .map(k => +k);

    if (cursosIds.length === 0) {
      this.mensajeError = 'Debes seleccionar al menos 1 taller para matricular.';
      return;
    }

    this.guardando = true;
    this.mensajeError = '';
    this.mensajeExito = '';
    this.resultadoMatricula = null;

    const req: MatriculaLoteEventoRequest = {
      correo: this.formIndividual.correo.trim(),
      nombres: this.formIndividual.nombres.trim(),
      apellidos: this.formIndividual.apellidos.trim(),
      telefono: this.formIndividual.telefono.trim(),
      password: this.formIndividual.password.trim() || undefined,
      cursosIds
    };

    this.diaService.matricularIndividual(req).subscribe({
      next: (res) => {
        this.guardando = false;
        this.resultadoMatricula = res;
        this.mensajeExito = `¡Alumno ${res.nombresCompletos} matriculado exitosamente en ${res.matriculas.length} taller(es)! Ficha(s) PDF lista(s) para descargar.`;
        this.limpiarFormIndividual();
        this.cargarDatos();
      },
      error: (err) => {
        this.guardando = false;
        this.mensajeError = err.error?.message || 'Error al guardar matrícula individual.';
      }
    });
  }

  procesarMatriculaLote(): void {
    if (!this.textoLote.trim()) {
      this.mensajeError = 'Ingresa los datos en lote antes de procesar.';
      return;
    }

    const lineas = this.textoLote.trim().split('\n');
    const solicitudes: MatriculaLoteEventoRequest[] = [];

    for (const linea of lineas) {
      const parts = linea.split(',').map(p => p.trim());
      if (parts.length >= 3) {
        const correo = parts[0];
        const nombres = parts[1];
        const apellidos = parts[2];
        const telefono = parts[3] || '';
        const cursosIds: number[] = [];

        for (let i = 4; i < parts.length; i++) {
          const cId = parseInt(parts[i], 10);
          if (!isNaN(cId)) {
            cursosIds.push(cId);
          }
        }

        const finalCursos = cursosIds.length > 0 ? cursosIds : this.talleres.map(t => t.id);

        solicitudes.push({
          correo,
          nombres,
          apellidos,
          telefono,
          cursosIds: finalCursos
        });
      }
    }

    if (solicitudes.length === 0) {
      this.mensajeError = 'No se encontraron registros válidos en el texto ingresado.';
      return;
    }

    this.guardando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    this.diaService.matricularLote(solicitudes).subscribe({
      next: (resList) => {
        this.guardando = false;
        this.mensajeExito = `¡Se procesaron ${resList.length} alumnos en lote exitosamente!`;
        this.textoLote = '';
        this.cargarDatos();
      },
      error: (err) => {
        this.guardando = false;
        this.mensajeError = err.error?.message || 'Error al procesar matrículas en lote.';
      }
    });
  }

  descargarFicha(matriculaId: number, alumnoNombre?: string, tallerNombre?: string): void {
    if (!matriculaId) return;
    this.descargandoPdfId = matriculaId;
    this.matriculaService.descargarPdfMatricula(matriculaId).subscribe({
      next: (blob) => {
        this.descargandoPdfId = null;
        const nombreClean = (alumnoNombre || 'alumno').toLowerCase().replace(/[^a-z0-9]/g, '-');
        const tallerClean = (tallerNombre || 'dia-acupuntura').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 25);
        this.matriculaService.guardarArchivoPdf(blob, `ficha-matricula-${nombreClean}-${tallerClean}.pdf`);
      },
      error: (err) => {
        this.descargandoPdfId = null;
        console.error('Error al descargar ficha PDF', err);
        this.mensajeError = 'Error al generar la ficha consolidada en PDF.';
      }
    });
  }

  cerrarResultadoModal(): void {
    this.resultadoMatricula = null;
  }

  limpiarFormIndividual(): void {
    this.formIndividual = {
      nombres: '',
      apellidos: '',
      correo: '',
      telefono: '',
      password: '',
      cursosSeleccionados: {}
    };
  }

  marcarTodosTalleres(): void {
    for (const t of this.talleres) {
      this.formIndividual.cursosSeleccionados[t.id] = true;
    }
  }

  desmarcarTodosTalleres(): void {
    this.formIndividual.cursosSeleccionados = {};
  }

  // ── FILTRO EN VIVO PARA PESTAÑA 3 ──
  alumnosFiltrados(alumnos: AlumnoInscritoEvento[] | undefined | null): AlumnoInscritoEvento[] {
    if (!alumnos) return [];
    if (!this.busquedaReporte || !this.busquedaReporte.trim()) return alumnos;
    const q = this.busquedaReporte.toLowerCase().trim();
    return alumnos.filter(a =>
      (a.nombresCompletos || '').toLowerCase().includes(q) ||
      (a.correo || '').toLowerCase().includes(q) ||
      (a.telefono || '').toLowerCase().includes(q)
    );
  }

  // ── GESTIÓN / EDICIÓN DIRECTA DE TALLERES DE UNA ALUMNA ──
  abrirModalEditarTalleres(alumno: { usuarioId: number; nombresCompletos: string; correo: string; telefono?: string }): void {
    const rawName = (alumno.nombresCompletos || '').trim();
    const parts = rawName.split(/\s+/);
    let nombres = rawName;
    let apellidos = '';
    if (parts.length >= 2) {
      const half = Math.ceil(parts.length / 2);
      nombres = parts.slice(0, half).join(' ');
      apellidos = parts.slice(half).join(' ');
    }

    this.alumnoEditando = {
      usuarioId: alumno.usuarioId,
      nombresCompletos: alumno.nombresCompletos,
      nombres,
      apellidos: apellidos || 'Estudiante',
      correo: alumno.correo,
      telefono: alumno.telefono
    };

    this.talleresSeleccionadosEdit = {};
    this.matriculasPreviasEdit = {};
    this.modalEditarTalleresAbierto = true;
    this.cargandoTalleresAlumno = true;
    this.mensajeError = '';

    // Cargar las matrículas actuales del usuario para marcar los checkboxes
    this.matriculaService.listarPorUsuario(alumno.usuarioId).subscribe({
      next: (matriculas) => {
        this.cargandoTalleresAlumno = false;
        const talleresEventoIds = new Set(this.talleres.map(t => t.id));
        for (const m of (matriculas || [])) {
          if (m.cursoId && talleresEventoIds.has(m.cursoId)) {
            this.matriculasPreviasEdit[m.cursoId] = m.id;
            if (m.estado !== false) {
              this.talleresSeleccionadosEdit[m.cursoId] = true;
            }
          }
        }
      },
      error: (err) => {
        this.cargandoTalleresAlumno = false;
        console.error('Error al cargar matrículas del usuario', err);
      }
    });
  }

  cerrarModalEditarTalleres(): void {
    this.modalEditarTalleresAbierto = false;
    this.alumnoEditando = null;
    this.talleresSeleccionadosEdit = {};
    this.matriculasPreviasEdit = {};
  }

  marcarTodosEdit(): void {
    for (const t of this.talleres) {
      this.talleresSeleccionadosEdit[t.id] = true;
    }
  }

  desmarcarTodosEdit(): void {
    this.talleresSeleccionadosEdit = {};
  }

  guardarEdicionTalleres(): void {
    if (!this.alumnoEditando) return;

    const cursosIdsSeleccionados = Object.keys(this.talleresSeleccionadosEdit)
      .filter(k => this.talleresSeleccionadosEdit[+k])
      .map(k => +k);

    this.guardandoTalleresAlumno = true;
    this.mensajeError = '';

    // Si algún taller previo fue desmarcado, desactivar su matrícula
    const desmarcarPeticiones: Observable<void>[] = [];
    for (const [cursoIdStr, matriculaId] of Object.entries(this.matriculasPreviasEdit)) {
      const cId = +cursoIdStr;
      if (!this.talleresSeleccionadosEdit[cId] && matriculaId) {
        desmarcarPeticiones.push(this.matriculaService.cambiarEstado(matriculaId, false));
      }
    }

    const guardarNuevasMatriculas = () => {
      if (cursosIdsSeleccionados.length === 0) {
        this.guardandoTalleresAlumno = false;
        this.mensajeExito = `Talleres actualizados para ${this.alumnoEditando?.nombresCompletos}.`;
        this.cerrarModalEditarTalleres();
        this.cargarDatos();
        return;
      }

      const req: MatriculaLoteEventoRequest = {
        correo: this.alumnoEditando!.correo,
        nombres: this.alumnoEditando!.nombres,
        apellidos: this.alumnoEditando!.apellidos,
        telefono: this.alumnoEditando!.telefono || '',
        cursosIds: cursosIdsSeleccionados
      };

      this.diaService.matricularIndividual(req).subscribe({
        next: (res) => {
          this.guardandoTalleresAlumno = false;
          this.resultadoMatricula = res;
          this.mensajeExito = `¡Talleres actualizados con éxito para ${res.nombresCompletos}! Inscrita en ${res.matriculas.length} taller(es).`;
          this.cerrarModalEditarTalleres();
          this.cargarDatos();
        },
        error: (err) => {
          this.guardandoTalleresAlumno = false;
          this.mensajeError = err.error?.message || 'Error al actualizar los talleres del alumno.';
        }
      });
    };

    if (desmarcarPeticiones.length > 0) {
      forkJoin(desmarcarPeticiones).subscribe({
        next: () => guardarNuevasMatriculas(),
        error: (err) => {
          console.warn('Error al desactivar matrículas desmarcadas', err);
          guardarNuevasMatriculas();
        }
      });
    } else {
      guardarNuevasMatriculas();
    }
  }

  // ── BUSCADOR GENERAL DE ALUMNA EXISTENTE (Pestaña 3) ──
  abrirModalBuscarAlumno(): void {
    this.modalBuscarAlumnoAbierto = true;
    this.busquedaAlumnoTerm = '';
    this.alumnosEncontrados = [];
  }

  cerrarModalBuscarAlumno(): void {
    this.modalBuscarAlumnoAbierto = false;
    this.busquedaAlumnoTerm = '';
    this.alumnosEncontrados = [];
  }

  buscarAlumnosGeneral(): void {
    if (!this.busquedaAlumnoTerm || !this.busquedaAlumnoTerm.trim()) {
      this.alumnosEncontrados = [];
      return;
    }
    this.buscandoAlumnos = true;
    this.alumnoService.listarAlumnos(0, 20, this.busquedaAlumnoTerm.trim()).subscribe({
      next: (page) => {
        this.buscandoAlumnos = false;
        this.alumnosEncontrados = page.content || [];
      },
      error: (err) => {
        this.buscandoAlumnos = false;
        console.error('Error al buscar alumnos', err);
      }
    });
  }

  seleccionarAlumnoParaEditar(alumno: AlumnoResponse): void {
    this.cerrarModalBuscarAlumno();
    this.abrirModalEditarTalleres({
      usuarioId: alumno.id,
      nombresCompletos: `${alumno.nombres} ${alumno.apellidos}`,
      correo: alumno.correo,
      telefono: alumno.telefono
    });
  }

  // ── AUTOCOMPLETADO EN PESTAÑA 2 (Matrícula Individual) ──
  buscarAlumnosTab2(): void {
    if (!this.busquedaTab2 || !this.busquedaTab2.trim()) {
      this.alumnosSugeridosTab2 = [];
      return;
    }
    this.buscandoTab2 = true;
    this.alumnoService.listarAlumnos(0, 10, this.busquedaTab2.trim()).subscribe({
      next: (page) => {
        this.buscandoTab2 = false;
        this.alumnosSugeridosTab2 = page.content || [];
      },
      error: () => this.buscandoTab2 = false
    });
  }

  abrirModalSubirCertificado(alumno: { usuarioId?: number; id?: number; nombresCompletos: string; correo?: string }, cursoId: number, cursoNombre: string): void {
    const uId = alumno.usuarioId || (alumno as any).id;

    // Obtener todos los talleres del evento en los que este alumno está inscrito
    const talleresInscritosMap = new Map<number, string>();
    if (this.resumen && this.resumen.length > 0) {
      for (const r of this.resumen) {
        if (r.alumnos && r.alumnos.some(al => al.usuarioId === uId)) {
          talleresInscritosMap.set(r.cursoId, r.cursoNombre);
        }
      }
    }
    // Asegurarse de que el curso desde donde se abrió el botón esté incluido
    talleresInscritosMap.set(cursoId, cursoNombre);

    const talleresInscritos = Array.from(talleresInscritosMap.entries()).map(([cId, cNombre]) => ({
      cursoId: cId,
      cursoNombre: cNombre,
      seleccionado: true // Marcados por defecto
    }));

    this.alumnoCertificado = {
      usuarioId: uId,
      nombresCompletos: alumno.nombresCompletos,
      correo: alumno.correo,
      talleresInscritos
    };
    this.archivoCertificadoSeleccionado = null;
    this.limpiarPreviewImagen();
    this.mensajeExitoCertificado = '';
    this.mensajeErrorCertificado = '';
    this.modalSubirCertificadoAbierto = true;
  }

  toggleSeleccionarTodosTalleresCertificado(marcar: boolean): void {
    if (!this.alumnoCertificado) return;
    this.alumnoCertificado.talleresInscritos.forEach(t => t.seleccionado = marcar);
  }

  get totalTalleresCertificadoSeleccionados(): number {
    return this.alumnoCertificado?.talleresInscritos.filter(t => t.seleccionado).length || 0;
  }

  cerrarModalSubirCertificado(): void {
    this.modalSubirCertificadoAbierto = false;
    this.alumnoCertificado = null;
    this.archivoCertificadoSeleccionado = null;
    this.limpiarPreviewImagen();
    this.mensajeExitoCertificado = '';
    this.mensajeErrorCertificado = '';
  }

  onArchivoCertificadoSeleccionado(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
      const fileNameLower = file.name.toLowerCase();
      const isValid = allowedExtensions.some(ext => fileNameLower.endsWith(ext));

      if (!isValid) {
        this.mensajeErrorCertificado = 'Solo se permiten archivos en formato PDF o imágenes (JPG, PNG, WebP).';
        this.archivoCertificadoSeleccionado = null;
        this.limpiarPreviewImagen();
        return;
      }

      this.mensajeErrorCertificado = '';
      this.archivoCertificadoSeleccionado = file;

      // Si es imagen, crear preview para mostrar miniatura interactiva
      if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
        this.limpiarPreviewImagen();
        this.previewImagenCertificadoUrl = URL.createObjectURL(file);
      } else {
        this.limpiarPreviewImagen();
      }
    }
  }

  private limpiarPreviewImagen(): void {
    if (this.previewImagenCertificadoUrl) {
      URL.revokeObjectURL(this.previewImagenCertificadoUrl);
      this.previewImagenCertificadoUrl = null;
    }
  }

  guardarCertificadoOficial(): void {
    if (!this.alumnoCertificado || !this.archivoCertificadoSeleccionado) {
      this.mensajeErrorCertificado = 'Debes seleccionar un archivo (PDF o Imagen).';
      return;
    }

    const cursosSeleccionados = this.alumnoCertificado.talleresInscritos
      .filter(t => t.seleccionado)
      .map(t => t.cursoId);

    if (cursosSeleccionados.length === 0) {
      this.mensajeErrorCertificado = 'Debes seleccionar al menos un taller para asignar el certificado.';
      return;
    }

    this.subiendoCertificado = true;
    this.mensajeExitoCertificado = '';
    this.mensajeErrorCertificado = '';

    this.certificadoService.subirCertificadoOficialLote(
      this.alumnoCertificado.usuarioId,
      cursosSeleccionados,
      this.archivoCertificadoSeleccionado
    ).subscribe({
      next: (res) => {
        this.subiendoCertificado = false;
        const total = res.length;
        this.mensajeExitoCertificado = `¡Certificado subido y habilitado con éxito para ${total} taller(es)!`;
        setTimeout(() => {
          this.cerrarModalSubirCertificado();
        }, 1800);
      },
      error: (err) => {
        this.subiendoCertificado = false;
        this.mensajeErrorCertificado = err.error?.message || 'Error al subir el certificado oficial.';
      }
    });
  }

  seleccionarAlumnoTab2(alumno: AlumnoResponse): void {
    this.formIndividual.nombres = alumno.nombres;
    this.formIndividual.apellidos = alumno.apellidos;
    this.formIndividual.correo = alumno.correo;
    this.formIndividual.telefono = alumno.telefono || '';
    this.alumnosSugeridosTab2 = [];
    this.busquedaTab2 = `${alumno.nombres} ${alumno.apellidos} (${alumno.correo})`;

    // Cargar talleres que ya tenía marcados
    this.matriculaService.listarPorUsuario(alumno.id).subscribe({
      next: (matriculas) => {
        const talleresEventoIds = new Set(this.talleres.map(t => t.id));
        this.formIndividual.cursosSeleccionados = {};
        for (const m of (matriculas || [])) {
          if (m.cursoId && talleresEventoIds.has(m.cursoId) && m.estado !== false) {
            this.formIndividual.cursosSeleccionados[m.cursoId] = true;
          }
        }
      }
    });
  }
}
