import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DiaAcupunturaService } from '../../../core/services/dia-acupuntura.service';
import { MatriculaService } from '../../../core/services/matricula.service';
import { ResumenInscritosEvento, TallerEvento, VideoEvento, MatriculaLoteEventoRequest, ActualizarVideoTallerRequest, MatriculaResultadoResponse } from '../../../core/models/dia-acupuntura.model';

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

  talleres: TallerEvento[] = [];
  resumen: ResumenInscritosEvento[] = [];
  cargando = true;
  guardando = false;
  descargandoPdfId: number | null = null;
  mensajeExito = '';
  mensajeError = '';

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

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
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
}
