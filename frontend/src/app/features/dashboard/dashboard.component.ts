import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/';
import { UserProfile } from '../../core/models/';
import { SkeletonLoaderComponent } from '../../core/components/skeleton-loader/skeleton-loader.component';
import { ThemeService } from '../../core/services/';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SkeletonLoaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  
  private authService = inject(AuthService);
  private router = inject(Router);
  themeService = inject(ThemeService);

  profile: UserProfile | null = null;
  isLoading = true;
  errorMsg = '';

  /** Controls the mobile slide-out sidebar drawer */
  sidebarOpen = false;

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.profile = user;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = 'No se pudo cargar el perfil del usuario autenticado.';
      }
    });
  }

  onLogout(): void {
    this.authService.logoutRemote().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }
}
