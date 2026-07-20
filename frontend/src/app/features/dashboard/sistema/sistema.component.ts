import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ToastService } from '../../../core/services/';
import { SkeletonLoaderComponent } from '../../../core/components/skeleton-loader/skeleton-loader.component';
import { ConfirmModalComponent } from '../../../core/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-sistema',
  standalone: true,
  imports: [CommonModule,    ConfirmModalComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './sistema.component.html',
  styleUrls: ['./sistema.component.css']
})
export class SistemaComponent implements OnInit {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);

  statusData: any = null;
  isLoading = true;
  errorMsg = '';
  isBackupLoading = false;
  backupSuccessMsg = '';

  // Confirm modal controls
  showConfirmModal = false;
  confirmModalType: 'success' | 'danger' | 'info' | 'warning' = 'warning';
  confirmModalTitle = '';
  confirmModalMessage = '';
  pendingAction: (() => void) | null = null;

  ngOnInit(): void {
    this.loadStatus();
  }

  loadStatus(): void {
    this.isLoading = true;
    this.errorMsg = '';
    this.http.get<any>(environment.apiUrl + '/sistema/status').subscribe({
      next: (data) => {
        this.statusData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching system status:', err);
        this.errorMsg = 'No se pudo conectar con el servicio de monitoreo.';
        this.toastService.error(this.errorMsg);
        this.isLoading = false;
      }
    });
  }

  triggerBackup(): void {
    this.confirmModalType = 'warning';
    this.confirmModalTitle = '¿Generar Respaldo?';
    this.confirmModalMessage = 'Se generará una copia de seguridad de la base de datos en el servidor. Esto podría tardar unos segundos.';
    
    this.pendingAction = () => {
      this.showConfirmModal = false;
      this.isBackupLoading = true;
      this.backupSuccessMsg = '';
      this.errorMsg = '';

      this.http.post<any>(environment.apiUrl + '/sistema/backup', {}).subscribe({
        next: (res) => {
          this.isBackupLoading = false;
          this.backupSuccessMsg = res.mensaje || 'Backup generado exitosamente.';
          this.toastService.success(this.backupSuccessMsg);
          this.loadStatus();
          setTimeout(() => {
            this.backupSuccessMsg = '';
          }, 5000);
        },
        error: (err) => {
          console.error('Error triggering backup:', err);
          this.errorMsg = err.error?.mensaje || 'Error al generar el backup en el servidor.';
          this.toastService.error(this.errorMsg);
          this.isBackupLoading = false;
        }
      });
    };
    
    this.showConfirmModal = true;
  }

  confirmAction(): void {
    if (this.pendingAction) {
      this.pendingAction();
    }
  }
}
