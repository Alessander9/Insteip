import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { HttpEventType } from '@angular/common/http';
import { TareaService } from '../../../../core/services/tarea.service';
import { EntregaTareaService } from '../../../../core/services/entrega-tarea.service';
import { ArchivoProtegidoService } from '../../../../core/services/archivo-protegido.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AlumnoTareaItem } from '../../../../core/models/tarea.model';
import { environment } from '../../../../../environments/environment';
import { formatBytes, getFileExtension } from '../../../../core/utils';

@Component({
  selector: 'app-mis-tareas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mis-tareas.component.html'
})
export class MisTareasComponent implements OnInit, OnDestroy {
  private tareaService = inject(TareaService);
  private entregaTareaService = inject(EntregaTareaService);
  private archivoProtegidoService = inject(ArchivoProtegidoService);
  private toastService = inject(ToastService);
  private destroy$ = new Subject<void>();

  tareas: AlumnoTareaItem[] = [];
  isLoading = true;
  searchQuery = '';
  selectedFilter: 'TODAS' | 'PENDIENTE' | 'ENTREGADO' | 'APROBADO' | 'DESAPROBADO' = 'TODAS';

  // Subida de archivos inline
  uploadingTareaId: number | null = null;
  uploadProgress = 0;
  selectedFiles: { [tareaId: number]: File } = {};
  selectedFileNames: { [tareaId: number]: string } = {};
  comentariosEntrega: { [tareaId: number]: string } = {};

  // Contadores
  totalTareas = 0;
  totalPendientes = 0;
  totalEnRevision = 0;
  totalAprobadas = 0;
  totalDesaprobadas = 0;

  ngOnInit(): void {
    this.cargarTareas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarTareas(): void {
    this.isLoading = true;
    this.tareaService.listarTodasMisTareas().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.tareas = data;
        this.calcularContadores();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar tareas del alumno:', err);
        this.toastService.error('No se pudieron cargar tus tareas');
        this.isLoading = false;
      }
    });
  }

  private calcularContadores(): void {
    this.totalTareas = this.tareas.length;
    this.totalPendientes = this.tareas.filter(t => t.estadoEntrega === 'PENDIENTE').length;
    this.totalEnRevision = this.tareas.filter(t => t.estadoEntrega === 'ENTREGADO').length;
    this.totalAprobadas = this.tareas.filter(t => t.estadoEntrega === 'APROBADO').length;
    this.totalDesaprobadas = this.tareas.filter(t => t.estadoEntrega === 'DESAPROBADO').length;
  }

  get tareasFiltradas(): AlumnoTareaItem[] {
    let result = this.tareas;

    // Filtro por tab de estado
    if (this.selectedFilter !== 'TODAS') {
      result = result.filter(t => t.estadoEntrega === this.selectedFilter);
    }

    // Filtro por buscador
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(t => 
        (t.titulo && t.titulo.toLowerCase().includes(q)) ||
        (t.cursoNombre && t.cursoNombre.toLowerCase().includes(q)) ||
        (t.moduloNombre && t.moduloNombre.toLowerCase().includes(q))
      );
    }

    return result;
  }

  onFileSelected(tareaId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.size > 100 * 1024 * 1024) {
        this.toastService.error('El archivo no puede superar los 100MB');
        input.value = '';
        return;
      }
      this.selectedFiles[tareaId] = file;
      this.selectedFileNames[tareaId] = file.name;
    }
  }

  subirEntrega(tareaId: number): void {
    const file = this.selectedFiles[tareaId];
    if (!file) {
      this.toastService.warning('Debes seleccionar un archivo para entregar');
      return;
    }

    const comentario = this.comentariosEntrega[tareaId] || '';
    this.uploadingTareaId = tareaId;
    this.uploadProgress = 0;

    this.entregaTareaService.entregarTareaConProgreso(tareaId, file, comentario).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round(100 * event.loaded / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.uploadingTareaId = null;
          this.uploadProgress = 0;
          delete this.selectedFiles[tareaId];
          delete this.selectedFileNames[tareaId];
          delete this.comentariosEntrega[tareaId];
          this.toastService.success('¡Tarea entregada exitosamente!');
          this.cargarTareas();
        }
      },
      error: (err) => {
        this.uploadingTareaId = null;
        this.uploadProgress = 0;
        const msg = err?.error?.message || 'Error al subir la entrega de la tarea';
        this.toastService.error(msg);
      }
    });
  }

  descargarArchivoEntrega(entregaId?: number, nombreTarea?: string, tipoArchivo?: string): void {
    if (!entregaId) return;
    const url = `${environment.apiUrl}/entregas-tareas/${entregaId}/download`;
    const extension = getFileExtension(tipoArchivo || '');
    const filename = `Mi_Entrega_${(nombreTarea || 'Tarea').replace(/\s+/g, '_')}.${extension}`;
    this.archivoProtegidoService.descargar(url, filename).subscribe({
      error: (err) => {
        console.error('Error al descargar archivo de entrega:', err);
        this.toastService.error('No se pudo descargar el archivo de la entrega');
      }
    });
  }

  formatBytes(bytes?: number): string {
    return formatBytes(bytes || 0);
  }
}
