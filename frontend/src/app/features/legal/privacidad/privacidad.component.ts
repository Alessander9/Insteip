import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../core/components/navbar/navbar.component';
import { FooterComponent } from '../../../core/components/footer/footer.component';

@Component({
  selector: 'app-privacidad',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './privacidad.component.html',
  styleUrls: ['./privacidad.component.css']
})
export class PrivacidadComponent {
  readonly fechaActualizacion = 'Septiembre 2026';
}
