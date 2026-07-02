import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AlumnoDashboardService, AlumnoCurso } from '../../../core/services/alumno-dashboard.service';

@Component({
  selector: 'app-mis-cursos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-cursos.component.html',
  styleUrls: ['./mis-cursos.component.css']
})
export class MisCursosComponent implements OnInit {
  private studentService = inject(AlumnoDashboardService);
  private router = inject(Router);

  cursos: AlumnoCurso[] = [];
  isLoading = true;

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

  continueCourse(courseId: number): void {
    this.router.navigate(['/dashboard/cursos-play', courseId]);
  }
}
