import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AnuncioModalService } from '../../services/anuncio-modal.service';
import { AnuncioModalItem } from '../../models/anuncio-modal.model';

@Component({
  selector: 'app-anuncio-modal-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './anuncio-modal-dialog.component.html',
  styleUrls: ['./anuncio-modal-dialog.component.css']
})
export class AnuncioModalDialogComponent implements OnInit {
  anuncio: AnuncioModalItem | null = null;
  isVisible = false;

  constructor(
    private anuncioModalService: AnuncioModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.verificarAnuncio();
  }

  verificarAnuncio(): void {
    this.anuncioModalService.obtenerAnuncioActivo().subscribe({
      next: (anuncio) => {
        if (!anuncio || !anuncio.activo) return;

        // Comprobar control de frecuencia en localStorage
        const storageKey = `insteip_anuncio_visto_${anuncio.id}`;
        const lastSeen = localStorage.getItem(storageKey);
        const hoy = new Date().toDateString();

        // Si ya lo vio hoy, no mostrar
        if (lastSeen === hoy) {
          return;
        }

        this.anuncio = anuncio;
        // Pequeño delay estético para que el dashboard cargue primero suavemente
        setTimeout(() => {
          this.isVisible = true;
        }, 1200);
      },
      error: () => {
        // En caso de fallo de red silencioso no bloquea la experiencia
      }
    });
  }

  cerrar(): void {
    this.marcarComoVistoHoy();
    this.isVisible = false;
  }

  ejecutarAccion(): void {
    if (!this.anuncio) return;

    this.marcarComoVistoHoy();
    this.isVisible = false;

    if (this.anuncio.botonUrl && this.anuncio.botonUrl.trim() !== '') {
      const url = this.anuncio.botonUrl.trim();
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('https://wa.me')) {
        window.open(url, '_blank');
      } else {
        this.router.navigateByUrl(url);
      }
    }
  }

  private marcarComoVistoHoy(): void {
    if (!this.anuncio) return;
    const storageKey = `insteip_anuncio_visto_${this.anuncio.id}`;
    localStorage.setItem(storageKey, new Date().toDateString());
  }
}
