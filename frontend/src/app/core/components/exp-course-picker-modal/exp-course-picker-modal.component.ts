import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlumnoCurso } from '../../services/alumno-dashboard.service';

@Component({
  selector: 'app-exp-course-picker-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exp-course-picker-modal.component.html',
  styleUrls: ['./exp-course-picker-modal.component.css']
})
export class ExpCoursePickerModalComponent {
  @Input() cursos: AlumnoCurso[] = [];
  @Output() selectionConfirmed = new EventEmitter<number[]>();

  selectedIds: number[] = [];
  failedImages: { [courseId: number]: boolean } = {};

  readonly maxSelection = 2;

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
    if (this.selectedIds.length === this.maxSelection) {
      this.selectionConfirmed.emit([...this.selectedIds]);
    }
  }
}
