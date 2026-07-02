import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuditoriaService } from '../../../core/services/auditoria.service';
import { AuthService } from '../../../core/services/auth.service';
import { EventoSistemaResponse, LoginAuditoriaResponse } from '../../../core/models/auditoria.model';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auditoria.component.html',
  styleUrls: ['./auditoria.component.css']
})
export class AuditoriaComponent implements OnInit {
  private auditoriaService = inject(AuditoriaService);
  private authService = inject(AuthService);
  private router = inject(Router);

  activeTab: 'login' | 'eventos' = 'login';
  isLoading = true;
  errorMsg = '';

  loginAuditoria: LoginAuditoriaResponse[] = [];
  eventosSistema: EventoSistemaResponse[] = [];

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (profile) => {
        if (profile.rol !== 'ADMINISTRADOR') {
          this.router.navigate(['/dashboard']);
          return;
        }
        this.loadData();
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.auditoriaService.getLoginAuditoria().subscribe({
      next: (data) => {
        this.loginAuditoria = data;
        this.auditoriaService.getEventosSistema().subscribe({
          next: (events) => {
            this.eventosSistema = events;
            this.isLoading = false;
          },
          error: (err) => this.handleError(err)
        });
      },
      error: (err) => this.handleError(err)
    });
  }

  setTab(tab: 'login' | 'eventos'): void {
    this.activeTab = tab;
  }

  get totalExitosos(): number {
    return this.loginAuditoria.filter(item => item.exitoso).length;
  }

  get totalFallidos(): number {
    return this.loginAuditoria.filter(item => !item.exitoso).length;
  }

  get usuariosBloqueados(): number {
    return this.loginAuditoria.filter(item => !!item.motivo?.toLowerCase().includes('bloque')).length;
  }

  get ultimosAccesos(): LoginAuditoriaResponse[] {
    return this.loginAuditoria.slice(0, 5);
  }

  get ultimosEventos(): EventoSistemaResponse[] {
    return this.eventosSistema.slice(0, 5);
  }

  private handleError(err: any): void {
    this.isLoading = false;
    this.errorMsg = err.error?.message || 'No se pudo cargar la auditoría.';
  }
}
