import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { AlumnoDashboardService } from '../../../core/services/alumno-dashboard.service';
import { UserProfile } from '../../../core/models/user-profile.model';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(AlumnoDashboardService);

  profile: UserProfile | null = null;
  isLoading = true;
  metrics: any = null;

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        if (data.rol === 'ALUMNO') {
          this.loadStudentMetrics();
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error fetching user profile:', err);
        this.isLoading = false;
      }
    });
  }

  loadStudentMetrics(): void {
    this.dashboardService.getMetrics().subscribe({
      next: (metricsData) => {
        this.metrics = metricsData;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading student metrics:', err);
        this.isLoading = false;
      }
    });
  }
}
