import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../core/components/footer/footer.component';

@Component({
  selector: 'app-certificacion',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './certificacion.component.html',
  styleUrls: []
})
export class CertificacionComponent {
  validationResult: any = null;
  showError = false;
  isLoading = false;

  validarCodigo(codigo: string) {
    const cleanCode = codigo.trim();
    if (!cleanCode) return;
    
    this.isLoading = true;
    this.showError = false;
    this.validationResult = null;

    setTimeout(() => {
      this.isLoading = false;
      const codeUpper = cleanCode.toUpperCase();
      if (codeUpper === 'INST-2026-9842' || codeUpper.startsWith('INST-')) {
        this.validationResult = {
          code: codeUpper,
          student: 'Alessander de la Cruz',
          program: 'Diplomado en Terapia Integral',
          date: '14 de Junio, 2026',
          status: 'VERIFICADO',
          grade: 'Sobresaliente'
        };
      } else {
        this.showError = true;
      }
    }, 800);
  }

  limpiar() {
    this.validationResult = null;
    this.showError = false;
  }
}
