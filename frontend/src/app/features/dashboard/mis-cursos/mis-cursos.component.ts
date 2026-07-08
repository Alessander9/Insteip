import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AlumnoDashboardService, AlumnoCurso } from '../../../core/services/alumno-dashboard.service';
import { FormsModule } from '@angular/forms';
import { matchesQuery, paginate, sortByDate, totalPages, SortOrder } from '../../../core/utils/listing.utils';

@Component({
  selector: 'app-mis-cursos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mis-cursos.component.html',
  styleUrls: ['./mis-cursos.component.css']
})
export class MisCursosComponent implements OnInit {
  private studentService = inject(AlumnoDashboardService);
  private router = inject(Router);

  cursos: AlumnoCurso[] = [];
  isLoading = true;
  searchTerm = '';
  dateSortOrder: SortOrder = 'desc';
  currentPage = 1;
  pageSize = 6;

  ngOnInit(): void {
    this.studentService.getEnrolledCursos().subscribe({
      next: (data) => {
        this.cursos = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching enrolled courses:', err);
        this.isLoading = false;
      }
    });
  }

  get filteredCursos(): AlumnoCurso[] {
    const matches = this.cursos.filter(curso =>
      matchesQuery([
        curso.nombre,
        curso.descripcion,
        curso.nivelSuscripcion,
        curso.fechaMatricula
      ], this.searchTerm)
    );
    return sortByDate(matches, curso => curso.fechaMatricula, this.dateSortOrder);
  }

  get totalPages(): number {
    return totalPages(this.filteredCursos.length, this.pageSize);
  }

  get pagedCursos(): AlumnoCurso[] {
    return paginate(this.filteredCursos, this.currentPage, this.pageSize);
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  toggleDateSort(): void {
    this.dateSortOrder = this.dateSortOrder === 'desc' ? 'asc' : 'desc';
    this.currentPage = 1;
  }

  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  continueCourse(courseId: number): void {
    this.router.navigate(['/dashboard/cursos-play', courseId]);
  }
}
