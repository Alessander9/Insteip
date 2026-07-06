import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DocenteDashboardService, DocenteCurso } from '../../../../core/services/docente-dashboard.service';

@Component({
  selector: 'app-mis-cursos-docente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-cursos-docente.component.html',
  styleUrls: ['./mis-cursos-docente.component.css']
})
export class MisCursosDocenteComponent implements OnInit {
  private docenteService = inject(DocenteDashboardService);
  private router = inject(Router);

  cursos: DocenteCurso[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.docenteService.getCursosAsignados().subscribe({
      next: (data) => {
        this.cursos = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching assigned courses:', err);
        this.isLoading = false;
      }
    });
  }

  manageContent(courseId: number): void {
    this.router.navigate(['/dashboard/cursos', courseId]);
  }

  viewStudents(courseId: number): void {
    this.router.navigate(['/dashboard/mis-alumnos-docente', courseId]);
  }
}
