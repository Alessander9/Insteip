import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificacionService } from '../../../../core/services/notificacion.service';
import { AnuncioModalService } from '../../../../core/services/anuncio-modal.service';
import { CursoService } from '../../../../core/services/curso.service';
import { ComunicadoRequest } from '../../../../core/models/notificacion.model';
import { AnuncioModalItem, AnuncioModalRequest } from '../../../../core/models/anuncio-modal.model';
import { CursoResponse } from '../../../../core/models/curso.model';

@Component({
  selector: 'app-comunicados-anuncios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comunicados-anuncios.component.html'
})
export class ComunicadosAnunciosComponent implements OnInit {
  activeTab: 'comunicado' | 'anuncios' = 'comunicado';

  // Formulario Comunicado
  comunicado: ComunicadoRequest = {
    titulo: '',
    mensaje: '',
    urlDestino: '',
    icono: 'campaign',
    audiencia: 'TODOS',
    cursoId: undefined
  };
  enviandoComunicado = false;
  mensajeExitoComunicado = '';
  mensajeErrorComunicado = '';

  // Formulario Anuncio Modal
  anuncioForm: AnuncioModalRequest = {
    titulo: '',
    mensaje: '',
    imagenUrl: '',
    botonTexto: 'Ver Promoción',
    botonUrl: '',
    audiencia: 'TODOS',
    activo: true
  };
  guardandoAnuncio = false;
  mensajeExitoAnuncio = '';
  mensajeErrorAnuncio = '';

  // Listado de Anuncios y Cursos
  anuncios: AnuncioModalItem[] = [];
  cursos: CursoResponse[] = [];
  cargandoAnuncios = false;

  constructor(
    private notificacionService: NotificacionService,
    private anuncioModalService: AnuncioModalService,
    private cursoService: CursoService
  ) {}

  ngOnInit(): void {
    this.cargarCursos();
    this.cargarAnuncios();
  }

  cargarCursos(): void {
    this.cursoService.listarCursos(0, 100).subscribe({
      next: (res) => {
        this.cursos = res.content || [];
      },
      error: (err) => console.error('Error cargando cursos:', err)
    });
  }

  cargarAnuncios(): void {
    this.cargandoAnuncios = true;
    this.anuncioModalService.listarTodos().subscribe({
      next: (data) => {
        this.anuncios = data;
        this.cargandoAnuncios = false;
      },
      error: () => this.cargandoAnuncios = false
    });
  }

  enviarComunicado(): void {
    if (!this.comunicado.titulo.trim() || !this.comunicado.mensaje.trim()) {
      this.mensajeErrorComunicado = 'Por favor completa el título y el mensaje del comunicado.';
      return;
    }

    if (this.comunicado.audiencia === 'POR_CURSO' && !this.comunicado.cursoId) {
      this.mensajeErrorComunicado = 'Debes seleccionar un curso específico para esta audiencia.';
      return;
    }

    this.enviandoComunicado = true;
    this.mensajeExitoComunicado = '';
    this.mensajeErrorComunicado = '';

    this.notificacionService.enviarComunicado(this.comunicado).subscribe({
      next: () => {
        this.enviandoComunicado = false;
        this.mensajeExitoComunicado = '¡Comunicado enviado exitosamente a todos los destinatarios seleccionados!';
        this.comunicado = {
          titulo: '',
          mensaje: '',
          urlDestino: '',
          icono: 'campaign',
          audiencia: 'TODOS',
          cursoId: undefined
        };
        setTimeout(() => this.mensajeExitoComunicado = '', 5000);
      },
      error: (err) => {
        this.enviandoComunicado = false;
        this.mensajeErrorComunicado = err.error?.message || 'Ocurrió un error al enviar el comunicado.';
      }
    });
  }

  guardarAnuncio(): void {
    if (!this.anuncioForm.titulo.trim()) {
      this.mensajeErrorAnuncio = 'El título del anuncio es obligatorio.';
      return;
    }

    this.guardandoAnuncio = true;
    this.mensajeExitoAnuncio = '';
    this.mensajeErrorAnuncio = '';

    this.anuncioModalService.crear(this.anuncioForm).subscribe({
      next: () => {
        this.guardandoAnuncio = false;
        this.mensajeExitoAnuncio = '¡Campaña / Anuncio creado y activado correctamente!';
        this.anuncioForm = {
          titulo: '',
          mensaje: '',
          imagenUrl: '',
          botonTexto: 'Ver Promoción',
          botonUrl: '',
          audiencia: 'TODOS',
          activo: true
        };
        this.cargarAnuncios();
        setTimeout(() => this.mensajeExitoAnuncio = '', 5000);
      },
      error: (err) => {
        this.guardandoAnuncio = false;
        this.mensajeErrorAnuncio = err.error?.message || 'Error al guardar el anuncio.';
      }
    });
  }

  toggleEstadoAnuncio(anuncio: AnuncioModalItem): void {
    const nuevoEstado = !anuncio.activo;
    this.anuncioModalService.cambiarEstado(anuncio.id, nuevoEstado).subscribe({
      next: () => {
        anuncio.activo = nuevoEstado;
      },
      error: (err) => console.error('Error cambiando estado:', err)
    });
  }

  eliminarAnuncio(id: number): void {
    if (!confirm('¿Estás seguro de eliminar este anuncio permanentemente?')) return;

    this.anuncioModalService.eliminar(id).subscribe({
      next: () => {
        this.anuncios = this.anuncios.filter(a => a.id !== id);
      },
      error: (err) => console.error('Error eliminando anuncio:', err)
    });
  }
}
