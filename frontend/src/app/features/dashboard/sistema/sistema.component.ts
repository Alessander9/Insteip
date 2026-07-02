import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-sistema',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sistema.component.html',
  styleUrls: ['./sistema.component.css']
})
export class SistemaComponent implements OnInit {
  private http = inject(HttpClient);

  statusData: any = null;
  isLoading = true;
  errorMsg = '';
  isBackupLoading = false;
  backupSuccessMsg = '';

  ngOnInit(): void {
    this.loadStatus();
  }

  loadStatus(): void {
    this.isLoading = true;
    this.errorMsg = '';
    this.http.get<any>('http://localhost:8081/api/sistema/status').subscribe({
      next: (data) => {
        this.statusData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching system status:', err);
        this.errorMsg = 'No se pudo conectar con el servicio de monitoreo.';
        this.isLoading = false;
      }
    });
  }

  triggerBackup(): void {
    this.isBackupLoading = true;
    this.backupSuccessMsg = '';
    this.errorMsg = '';

    this.http.post<any>('http://localhost:8081/api/sistema/backup', {}).subscribe({
      next: (res) => {
        this.isBackupLoading = false;
        this.backupSuccessMsg = res.mensaje || 'Backup generado exitosamente.';
        // Reload system status to reflect the new backup time
        this.loadStatus();
        setTimeout(() => {
          this.backupSuccessMsg = '';
        }, 5000);
      },
      error: (err) => {
        console.error('Error triggering backup:', err);
        this.errorMsg = err.error?.mensaje || 'Error al generar el backup en el servidor.';
        this.isBackupLoading = false;
      }
    });
  }
}
