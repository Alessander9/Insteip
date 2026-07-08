import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AlumnoDashboardService, AlumnoCertificado } from '../../../core/services/alumno-dashboard.service';
import { CertificadoResponse, CertificadoService } from '../../../core/services/certificado.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReportesService } from '../../../core/services/reportes.service';
import { ArchivoProtegidoService } from '../../../core/services/archivo-protegido.service';

@Component({
  selector: 'app-certificados',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './certificados.component.html',
  styleUrls: ['./certificados.component.css']
})
export class CertificadosComponent implements OnInit {
  private studentService = inject(AlumnoDashboardService);
  private certificadoService = inject(CertificadoService);
  private authService = inject(AuthService);
  private reportesService = inject(ReportesService);
  private archivoProtegidoService = inject(ArchivoProtegidoService);
  private sanitizer = inject(DomSanitizer);

  certificados: Array<AlumnoCertificado | CertificadoResponse> = [];
  isLoading = true;
  isAdmin = false;
  selectedCertificado: AlumnoCertificado | CertificadoResponse | null = null;
  showModal = false;
  previewPdfUrl: string | null = null;
  isPreviewLoading = false;

  ngOnInit(): void {
    this.isAdmin = this.authService.getUserRole() === 'ADMINISTRADOR';
    this.loadCertificados();
  }

  private loadCertificados(): void {
    if (this.isAdmin) {
      this.certificadoService.listarCertificados().subscribe({
        next: (data) => {
          this.certificados = data;
          this.isLoading = false;
        },
        error: (err: unknown) => {
          console.error('Error fetching certificates:', err);
          this.isLoading = false;
        }
      });
      return;
    }

    this.studentService.getCertificados().subscribe({
      next: (data) => {
        this.certificados = data;
        this.isLoading = false;
      },
      error: (err: unknown) => {
        console.error('Error fetching certificates:', err);
        this.isLoading = false;
      }
    });
  }

  getAlumnoNombre(cert: AlumnoCertificado | CertificadoResponse): string {
    return (cert as CertificadoResponse).alumnoNombre || 'N/D';
  }

  getAlumnoCorreo(cert: AlumnoCertificado | CertificadoResponse): string {
    return (cert as CertificadoResponse).alumnoCorreo || 'N/D';
  }

  getCursoNombre(cert: AlumnoCertificado | CertificadoResponse): string {
    return (cert as CertificadoResponse).cursoNombre || (cert as AlumnoCertificado).cursoNombre || 'N/D';
  }

  exportarCSV(): void {
    this.reportesService.exportarCertificados().subscribe({
      error: (err) => {
        console.error('Error al exportar certificados:', err);
      }
    });
  }

  openVerModal(cert: AlumnoCertificado | CertificadoResponse): void {
    this.selectedCertificado = cert;
    this.showModal = true;
    this.previewPdfUrl = null;
    this.isPreviewLoading = true;

    this.archivoProtegidoService.obtenerBlob(cert.archivoPdf).subscribe({
      next: (blob) => {
        this.previewPdfUrl = URL.createObjectURL(blob);
        this.isPreviewLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar la vista previa del certificado:', err);
        this.isPreviewLoading = false;
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCertificado = null;
    if (this.previewPdfUrl) {
      URL.revokeObjectURL(this.previewPdfUrl);
      this.previewPdfUrl = null;
    }
    this.isPreviewLoading = false;
  }

  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  descargarCertificado(cert: AlumnoCertificado | CertificadoResponse): void {
    this.archivoProtegidoService.descargar(cert.archivoPdf, `certificado-${cert.codigo}.pdf`).subscribe({
      error: (err) => console.error('Error al descargar certificado:', err)
    });
  }
}
