import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { DocenteDashboardService, DocenteEstudianteProgress } from '../../../../core/services/docente-dashboard.service';
import { CursoService } from '../../../../core/services/curso.service';
import { CursoResponse } from '../../../../core/models/curso.model';

@Component({
  selector: 'app-mis-alumnos-docente',
  standalone: true,
  imports: [CommonModule, RouterModule],
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

  goBack(): void {
    this.router.navigate(['/dashboard/mis-cursos-docente']);
  }
}
