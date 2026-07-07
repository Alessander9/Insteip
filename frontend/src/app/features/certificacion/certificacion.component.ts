import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../core/components/footer/footer.component';
import { CertificadoService } from '../../core/services/certificado.service';

@Component({
  selector: 'app-certificacion',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './certificacion.component.html',
  styleUrls: []
})
export class CertificacionComponent {
  private certificadoService = inject(CertificadoService);

  validationResult: any = null;
  showError = false;
  isLoading = false;

  validarCodigo(codigo: string) {
    const cleanCode = codigo.trim();
    if (!cleanCode) return;
    
    this.isLoading = true;
    this.showError = false;
    this.validationResult = null;

    this.certificadoService.validarCertificado(cleanCode).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.validationResult = {
          code: res.codigo,
          student: res.alumno,
          program: res.curso,
          date: res.fechaEmision,
          status: res.valido ? 'VERIFICADO' : 'NO VÁLIDO',
          grade: 'Aprobado / Acreditado'
        };
      },
      error: (err) => {
        this.isLoading = false;
        this.showError = true;
        console.error('Error al validar certificado:', err);
      }
    });
  }

  limpiar() {
    this.validationResult = null;
    this.showError = false;
  }
}
