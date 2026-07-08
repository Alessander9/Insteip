import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ModuloService } from '../../../core/services/modulo.service';
import { VideoService } from '../../../core/services/video.service';
import { ModuloResponse } from '../../../core/models/modulo.model';
import { VideoRequest, VideoResponse } from '../../../core/models/video.model';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.css']
})
export class VideosComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private moduloService = inject(ModuloService);
  private videoService = inject(VideoService);
  private fb = inject(FormBuilder);
  private sanitizer = inject(DomSanitizer);

  moduloId!: number;
  modulo: ModuloResponse | null = null;
  videos: VideoResponse[] = [];
  filteredVideos: VideoResponse[] = [];
  searchQuery = '';
  dateSortOrder: 'desc' | 'asc' = 'desc';
  currentPage = 1;
  readonly pageSize = 10;

  // Modal controls
  showVideoModal = false;
  isEditMode = false;
  isFormSubmitting = false;
  modalErrorMsg = '';

  selectedVideo: VideoResponse | null = null;

  // Youtube Live Preview
  youtubeId = '';
  safeEmbedUrl: SafeResourceUrl | null = null;

  videoForm: FormGroup = this.fb.group({
    titulo: ['', [Validators.required]],
    descripcion: ['', [Validators.required]],
    youtubeUrl: ['', [Validators.required]],
    orden: [1, [Validators.required, Validators.min(1)]],
    estado: [true]
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.moduloId = Number(idParam);
        this.loadModuloData();
      } else {
        this.router.navigate(['/dashboard/cursos']);
      }
    });
  }

  loadModuloData(): void {
    this.moduloService.obtenerModulo(this.moduloId).subscribe({
      next: (data) => {
        this.modulo = data;
        this.loadVideos();
      },
      error: (err) => {
        console.error('Error al obtener modulo', err);
        this.router.navigate(['/dashboard/cursos']);
      }
    });
  }

  loadVideos(): void {
    this.videoService.listarVideosPorModulo(this.moduloId).subscribe({
      next: (data) => {
        this.videos = data;
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error al listar videos', err);
      }
    });
  }

  applyFilter(): void {
    const query = this.searchQuery.trim().toLowerCase();
    this.filteredVideos = this.videos.filter(v =>
      !query ||
      v.titulo.toLowerCase().includes(query) ||
      v.descripcion.toLowerCase().includes(query) ||
      v.fechaCreacion.toLowerCase().includes(query)
    ).sort((a, b) => {
      const d1 = new Date(a.fechaCreacion).getTime() || 0;
      const d2 = new Date(b.fechaCreacion).getTime() || 0;
      return this.dateSortOrder === 'asc' ? d1 - d2 : d2 - d1;
    });
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredVideos.length / this.pageSize));
  }

  get paginatedVideos(): VideoResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredVideos.slice(start, start + this.pageSize);
  }

  onDateSortChange(order: string): void {
    this.dateSortOrder = order === 'asc' ? 'asc' : 'desc';
    this.applyFilter();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.modalErrorMsg = '';
    this.selectedVideo = null;
    this.youtubeId = '';
    this.safeEmbedUrl = null;
    this.videoForm.reset({
      titulo: '',
      descripcion: '',
      youtubeUrl: '',
      orden: this.videos.length + 1,
      estado: true
    });
    this.showVideoModal = true;
  }

  openEditModal(video: VideoResponse): void {
    this.isEditMode = true;
    this.modalErrorMsg = '';
    this.selectedVideo = video;
    
    this.videoForm.patchValue({
      titulo: video.titulo,
      descripcion: video.descripcion,
      youtubeUrl: video.youtubeUrl,
      orden: video.orden,
      estado: video.estado
    });

    this.onUrlInput();
    this.showVideoModal = true;
  }

  closeVideoModal(): void {
    this.showVideoModal = false;
    this.isFormSubmitting = false;
  }

  onUrlInput(): void {
    const url = this.videoForm.value.youtubeUrl || '';
    const id = this.extraerIdYoutube(url);
    if (id) {
      this.youtubeId = id;
      this.safeEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + id);
    } else {
      this.youtubeId = '';
      this.safeEmbedUrl = null;
    }
  }

  toggleEstado(video: VideoResponse): void {
    const nuevoEstado = !video.estado;
    this.videoService.cambiarEstado(video.id, nuevoEstado).subscribe({
      next: () => {
        video.estado = nuevoEstado;
      },
      error: (err) => {
        console.error('Error al cambiar estado del video', err);
      }
    });
  }

  onSubmit(): void {
    if (this.videoForm.invalid) {
      return;
    }

    this.isFormSubmitting = true;
    this.modalErrorMsg = '';

    const req: VideoRequest = {
      moduloId: this.moduloId,
      titulo: this.videoForm.value.titulo,
      descripcion: this.videoForm.value.descripcion,
      youtubeUrl: this.videoForm.value.youtubeUrl,
      orden: Number(this.videoForm.value.orden)
    };

    if (this.isEditMode && this.selectedVideo) {
      this.videoService.editarVideo(this.selectedVideo.id, req).subscribe({
        next: () => {
          const stateChanged = this.videoForm.value.estado !== this.selectedVideo!.estado;
          if (stateChanged) {
            this.videoService.cambiarEstado(this.selectedVideo!.id, this.videoForm.value.estado).subscribe({
              next: () => {
                this.loadVideos();
                this.closeVideoModal();
              },
              error: (err) => this.handleError(err)
            });
          } else {
            this.loadVideos();
            this.closeVideoModal();
          }
        },
        error: (err) => this.handleError(err)
      });
    } else {
      this.videoService.crearVideo(req).subscribe({
        next: () => {
          this.loadVideos();
          this.closeVideoModal();
        },
        error: (err) => this.handleError(err)
      });
    }
  }

  extraerIdYoutube(url: string): string {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  }

  private handleError(err: any): void {
    this.isFormSubmitting = false;
    this.modalErrorMsg = err.error?.message || 'Error al procesar el video.';
  }
}
