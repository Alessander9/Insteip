import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, OnChanges, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlumnoCurso } from '../../services/alumno-dashboard.service';

@Component({
  selector: 'app-exp-course-picker-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exp-course-picker-modal.component.html',
  styleUrls: ['./exp-course-picker-modal.component.css']
})
export class ExpCoursePickerModalComponent implements OnInit, OnDestroy, OnChanges {
  private cdr = inject(ChangeDetectorRef);

  @Input() cursos: AlumnoCurso[] = [];
  @Output() selectionConfirmed = new EventEmitter<number[]>();

  selectedIds: number[] = [];
  failedImages: { [courseId: number]: boolean } = {};

  readonly maxSelection = 2;

  // Estado de carga con barra de progreso de 0 a 100
  isLoading: boolean = true;
  progressPercentage: number = 0;
  loadingStatusText: string = 'Conectando con el campus virtual...';
  private progressInterval: any = null;

  // Estado al iniciar sesión
  isStartingSession: boolean = false;
  startProgressPercentage: number = 0;

  ngOnInit(): void {
    this.iniciarSimulacionProgreso();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cursos'] && this.cursos && this.cursos.length > 0) {
      this.completarCarga();
    }
  }

  ngOnDestroy(): void {
    this.limpiarIntervalo();
  }

  private iniciarSimulacionProgreso(): void {
    this.isLoading = true;
    this.progressPercentage = 0;
    this.loadingStatusText = 'Conectando con el campus virtual...';

    this.limpiarIntervalo();

    this.progressInterval = setInterval(() => {
      if (this.cursos && this.cursos.length > 0) {
        this.completarCarga();
        return;
      }

      if (this.progressPercentage < 30) {
        this.progressPercentage += Math.floor(Math.random() * 8) + 4;
        this.loadingStatusText = 'Conectando con el servidor del campus...';
      } else if (this.progressPercentage < 65) {
        this.progressPercentage += Math.floor(Math.random() * 6) + 3;
        this.loadingStatusText = 'Cargando catálogo oficial de terapias integrales...';
      } else if (this.progressPercentage < 90) {
        this.progressPercentage += Math.floor(Math.random() * 3) + 1;
        this.loadingStatusText = 'Configurando clases y módulos interactivos...';
      } else if (this.progressPercentage < 98) {
        this.progressPercentage += 1;
        this.loadingStatusText = 'Sincronizando información de los cursos...';
      }

      if (this.progressPercentage > 98) {
        this.progressPercentage = 98;
      }

      this.cdr.markForCheck();
    }, 80);
  }

  private completarCarga(): void {
    this.limpiarIntervalo();
    this.loadingStatusText = '¡Catálogo cargado con éxito!';

    // Acelerar hasta 100%
    const finInterval = setInterval(() => {
      this.progressPercentage += 10;
      if (this.progressPercentage >= 100) {
        this.progressPercentage = 100;
        clearInterval(finInterval);
        this.cdr.markForCheck();
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }, 250);
      }
      this.cdr.markForCheck();
    }, 20);
  }

  private limpiarIntervalo(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  isSelected(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  onImgError(courseId: number): void {
    this.failedImages[courseId] = true;
  }

  hasImageFailed(courseId: number): boolean {
    return !!this.failedImages[courseId];
  }

  toggleCourse(id: number): void {
    if (this.isStartingSession) return;
    const index = this.selectedIds.indexOf(id);
    if (index >= 0) {
      this.selectedIds.splice(index, 1);
    } else {
      if (this.selectedIds.length < this.maxSelection) {
        this.selectedIds.push(id);
      }
    }
  }

  confirm(): void {
    if (this.selectedIds.length === this.maxSelection && !this.isStartingSession) {
      this.isStartingSession = true;
      this.startProgressPercentage = 0;

      const interval = setInterval(() => {
        this.startProgressPercentage += 12;
        if (this.startProgressPercentage >= 100) {
          this.startProgressPercentage = 100;
          clearInterval(interval);
          this.cdr.markForCheck();
          setTimeout(() => {
            this.selectionConfirmed.emit([...this.selectedIds]);
          }, 200);
        }
        this.cdr.markForCheck();
      }, 30);
    }
  }
}
