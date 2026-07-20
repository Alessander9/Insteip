import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { SkeletonLoaderComponent } from '../../../../core/components/skeleton-loader/skeleton-loader.component';
import { DocenteDashboardService, DocenteEstudianteProgress } from '../../../../core/services/';
import { CursoService } from '../../../../core/services/';
import { CursoResponse } from '../../../../core/models/';
import { FormsModule } from '@angular/forms';
import { matchesQuery, paginate, sortByDate, totalPages, SortOrder } from '../../../../core/utils/';

@Component({
  selector: 'app-mis-alumnos-docente',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SkeletonLoaderComponent],
  templateUrl: './mis-alumnos-docente.component.html',
  styleUrls: ['./mis-alumnos-docente.component.css']
})
export class MisAlumnosDocenteComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private docenteService = inject(DocenteDashboardService);
  private cursoService = inject(CursoService);
  private router = inject(Router);

  cursoId = 0;
  curso: CursoResponse | null = null;
  estudiantes: DocenteEstudianteProgress[] = [];
  isLoading = true;
  searchTerm = '';
  dateSortOrder: SortOrder = 'desc';
  currentPage = 1;
  pageSize = 10;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.cursoId = +idParam;
        this.loadCurso();
        this.loadEstudiantes();
      }
    });
  }

  loadCurso(): void {
    this.cursoService.obtenerCurso(this.cursoId).subscribe({
      next: (data) => {
        this.curso = data;
      },
      error: (err) => {
        console.error('Error fetching course detail:', err);
      }
    });
  }

  loadEstudiantes(): void {
    this.docenteService.getAlumnosCurso(this.cursoId).subscribe({
      next: (data) => {
        this.estudiantes = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching students:', err);
        this.isLoading = false;
      }
    });
  }

  get filteredEstudiantes(): DocenteEstudianteProgress[] {
    const matches = this.estudiantes.filter(estudiante =>
      matchesQuery([
        estudiante.nombres,
        estudiante.apellidos,
        estudiante.correo,
        estudiante.fechaActualizacion
      ], this.searchTerm)
    );
    return sortByDate(matches, estudiante => estudiante.fechaActualizacion, this.dateSortOrder);
  }

  get totalPages(): number {
    return totalPages(this.filteredEstudiantes.length, this.pageSize);
  }

  get pagedEstudiantes(): DocenteEstudianteProgress[] {
    return paginate(this.filteredEstudiantes, this.currentPage, this.pageSize);
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

  goBack(): void {
    this.router.navigate(['/dashboard/mis-cursos-docente']);
  }
}
