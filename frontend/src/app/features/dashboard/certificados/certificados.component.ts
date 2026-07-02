import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AlumnoDashboardService, AlumnoCertificado } from '../../../core/services/alumno-dashboard.service';
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
  private authService = inject(AuthService);
  private reportesService = inject(ReportesService);
  private archivoProtegidoService = inject(ArchivoProtegidoService);
  private sanitizer = inject(DomSanitizer);

  certificados: AlumnoCertificado[] = [];
  isLoading = true;
  isAdmin = false;
  selectedCertificado: AlumnoCertificado | null = null;
  showModal = false;
  previewPdfUrl: string | null = null;
  isPreviewLoading = false;

  ngOnInit(): void {
    this.isAdmin = this.authService.getUserRole() === 'ADMINISTRADOR';
    if (this.isAdmin) {
      this.isLoading = false;
      return;
    }

    this.studentService.getCertificados().subscribe({
      next: (data) => {
        this.certificados = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching certificates:', err);
        this.isLoading = false;
      }
    });
  }

  exportarCSV(): void {
    this.reportesService.exportarCertificados().subscribe({
      error: (err) => {
        console.error('Error al exportar certificados:', err);
      }
    });
  }

  openVerModal(cert: AlumnoCertificado): void {
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

  descargarCertificado(cert: AlumnoCertificado): void {
    this.archivoProtegidoService.descargar(cert.archivoPdf, `certificado-${cert.codigo}.pdf`).subscribe({
      error: (err) => console.error('Error al descargar certificado:', err)
    });
  }
}
