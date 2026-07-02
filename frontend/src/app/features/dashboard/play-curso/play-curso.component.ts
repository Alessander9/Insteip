import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AlumnoDashboardService, AlumnoPlayCourse, AlumnoPlayVideo, AlumnoPlayModulo } from '../../../core/services/alumno-dashboard.service';
import { CertificadoService } from '../../../core/services/certificado.service';
import { AuthService } from '../../../core/services/auth.service';
import { ArchivoProtegidoService } from '../../../core/services/archivo-protegido.service';
import { UserProfile } from '../../../core/models/user-profile.model';

@Component({
  selector: 'app-play-curso',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './play-curso.component.html',
  styleUrls: ['./play-curso.component.css']
})
export class PlayCursoComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentService = inject(AlumnoDashboardService);
  private certificadoService = inject(CertificadoService);
  private authService = inject(AuthService);
  private archivoProtegidoService = inject(ArchivoProtegidoService);
  private sanitizer = inject(DomSanitizer);

  profile: UserProfile | null = null;
  cursoId!: number;
  curso: AlumnoPlayCourse | null = null;
  currentVideo: AlumnoPlayVideo | null = null;
  safeEmbedUrl: SafeResourceUrl | null = null;

  isLoading = true;
  activeTab = 'materiales'; // 'materiales' | 'info' | 'certificado'
  isSavingProgress = false;
  courseCompleted = false;
  certificatePdfUrl: string | null = null;
  certificateCode: string | null = null;
  totalVideos = 0;
  completedVideos = 0;
  completionPercentage = 0;

  // Watch progression ticker variables
  private tickerInterval: any = null;
  private secondsWatched = 0;
  private ytPlayer: any = null;
  private isVideoPlaying = false;

  ngOnInit(): void {
    // Cargar la API de iFrames de YouTube si no está presente en el objeto window
    if (!(window as any)['YT']) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    this.authService.getProfile().subscribe({
      next: (user) => {
        this.profile = user;
      }
    });

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.cursoId = Number(idParam);
        this.loadCoursePlaySession();
      } else {
        this.router.navigate(['/dashboard/mis-cursos']);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopTicker();
    if (this.ytPlayer) {
      try {
        this.ytPlayer.destroy();
      } catch (e) {}
    }
  }

  loadCoursePlaySession(): void {
    this.studentService.getPlayCourse(this.cursoId).subscribe({
      next: (data) => {
        this.curso = data;
        this.isLoading = false;
        
        // Auto-select first uncompleted video, or first video overall
        this.selectDefaultVideo();
        this.checkOverallCompletion();
      },
      error: (err) => {
        console.error('Error loading play session', err);
        this.router.navigate(['/dashboard/mis-cursos']);
      }
    });
  }

  selectDefaultVideo(): void {
    if (!this.curso || this.curso.modulos.length === 0) return;

    let targetVideo: AlumnoPlayVideo | null = null;

    // Find first uncompleted video
    for (const mod of this.curso.modulos) {
      for (const vid of mod.videos) {
        if (!vid.completado) {
          targetVideo = vid;
          break;
        }
      }
      if (targetVideo) break;
    }

    // If all completed, select the very first video
    if (!targetVideo) {
      for (const mod of this.curso.modulos) {
        if (mod.videos.length > 0) {
          targetVideo = mod.videos[0];
          break;
        }
      }
    }

    if (targetVideo) {
      this.playVideo(targetVideo);
    }
  }

  playVideo(video: AlumnoPlayVideo): void {
    this.stopTicker();
    this.currentVideo = video;
    this.secondsWatched = video.ultimoSegundo || 0;
    this.isVideoPlaying = false;
    
    // Sanitize URL for YouTube embed with parameter configurations to limit control actions
    const id = video.youtubeId || this.extractIdYoutube(video.youtubeUrl);
    this.safeEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${id}?enablejsapi=1&start=${this.secondsWatched}&controls=1&modestbranding=1&rel=0&showinfo=0&fs=0&iv_load_policy=3&disablekb=1`
    );

    this.startTicker();
  }

  extractIdYoutube(url: string): string {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  }

  onIframeLoad(): void {
    const iframe = document.getElementById('youtube-iframe');
    if (iframe && (window as any)['YT'] && (window as any)['YT'].Player) {
      this.initYoutubePlayer(iframe);
    } else if (iframe) {
      setTimeout(() => this.onIframeLoad(), 500);
    }
  }

  initYoutubePlayer(iframe: any): void {
    if (this.ytPlayer) {
      try {
        this.ytPlayer.destroy();
      } catch (e) {}
      this.ytPlayer = null;
    }

    this.isVideoPlaying = false;

    try {
      this.ytPlayer = new (window as any)['YT'].Player(iframe, {
        events: {
          'onStateChange': (event: any) => {
            // YT.PlayerState.PLAYING is 1, YT.PlayerState.PAUSED is 2, YT.PlayerState.ENDED is 0
            if (event.data === 1) {
              this.isVideoPlaying = true;
            } else {
              this.isVideoPlaying = false;
            }
          }
        }
      });
    } catch (err) {
      console.error('Error initializing YT Player', err);
      this.isVideoPlaying = true;
    }
  }

  startTicker(): void {
    // Save progress periodically every 15 seconds to avoid flooding API
    let secondsSinceLastSave = 0;

    this.tickerInterval = setInterval(() => {
      if (this.currentVideo && this.isVideoPlaying) {
        this.secondsWatched++;
        secondsSinceLastSave++;

        if (secondsSinceLastSave >= 15) {
          this.saveCurrentProgress(false);
          secondsSinceLastSave = 0;
        }
      }
    }, 1000);
  }

  stopTicker(): void {
    if (this.tickerInterval) {
      clearInterval(this.tickerInterval);
      this.tickerInterval = null;
    }
  }

  saveCurrentProgress(isManualComplete: boolean): void {
    if (!this.currentVideo || this.isSavingProgress) return;

    const secondsToSend = isManualComplete 
      ? (this.currentVideo.duracionSegundos || 600) 
      : Math.min(this.secondsWatched, this.currentVideo.duracionSegundos || 600);

    this.isSavingProgress = true;
    this.studentService.guardarProgreso(this.currentVideo.id, secondsToSend).subscribe({
      next: (progress) => {
        this.isSavingProgress = false;
        
        // Update local object states
        if (this.currentVideo) {
          this.currentVideo.ultimoSegundo = progress.ultimoSegundo;
          this.currentVideo.porcentajeVisto = progress.porcentajeVisto;
          this.currentVideo.completado = progress.completado;
        }

        // Re-check overall course completion status
        this.checkOverallCompletion();
      },
      error: (err) => {
        this.isSavingProgress = false;
        console.error('Error saving progress', err);
      }
    });
  }

  toggleCompletado(): void {
    if (!this.currentVideo) return;
    const markComplete = !this.currentVideo.completado;
    
    if (markComplete) {
      this.secondsWatched = this.currentVideo.duracionSegundos || 600;
      this.saveCurrentProgress(true);
    } else {
      this.secondsWatched = 0;
      this.saveCurrentProgress(false);
    }
  }

  checkOverallCompletion(): void {
    if (!this.curso) return;

    let totalVids = 0;
    let completedVids = 0;

    for (const mod of this.curso.modulos) {
      for (const vid of mod.videos) {
        totalVids++;
        if (vid.completado) {
          completedVids++;
        }
      }
    }

    this.totalVideos = totalVids;
    this.completedVideos = completedVids;
    this.completionPercentage = totalVids > 0 ? Math.round((completedVids / totalVids) * 100) : 0;
    this.courseCompleted = totalVids > 0 && completedVids === totalVids;
    
    if (this.courseCompleted && this.profile) {
      this.fetchOrCreateCertificate();
    }
  }

  fetchOrCreateCertificate(): void {
    if (!this.profile) return;
    
    this.certificadoService.generarCertificado(this.cursoId).subscribe({
      next: (cert) => {
        this.certificatePdfUrl = cert.archivoPdf;
        this.certificateCode = cert.codigo;
      },
      error: (err) => {
        console.error('Error handling certificate generation:', err);
      }
    });
  }

  descargarMaterial(url: string, nombre: string, tipoArchivo: string): void {
    const extension = this.getFileExtension(tipoArchivo);
    const fileName = nombre.toLowerCase().endsWith(`.${extension}`) ? nombre : `${nombre}.${extension}`;

    this.archivoProtegidoService.descargar(url, fileName).subscribe({
      error: (err) => console.error('Error al descargar material:', err)
    });
  }

  descargarCertificado(): void {
    if (!this.certificatePdfUrl || !this.certificateCode) return;

    this.archivoProtegidoService.descargar(
      this.certificatePdfUrl,
      `certificado-${this.certificateCode}.pdf`
    ).subscribe({
      error: (err) => console.error('Error al descargar certificado:', err)
    });
  }

  setTab(tab: string): void {
    this.activeTab = tab;
  }

  formatBytes(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getCleanFileType(tipo: string): string {
    const t = (tipo || '').toLowerCase();
    if (t.includes('pdf')) return 'PDF';
    if (t.includes('word') || t.includes('document') || t.includes('docx')) return 'DOC';
    if (t.includes('image') || t.includes('png') || t.includes('jpg')) return 'IMG';
    return 'DOC';
  }

  private getFileExtension(tipo: string): string {
    const t = (tipo || '').toLowerCase();
    if (t.includes('pdf')) return 'pdf';
    if (t.includes('vnd.openxmlformats-officedocument.wordprocessingml.document')) return 'docx';
    if (t.includes('msword') || t.includes('word')) return 'doc';
    if (t.includes('jpeg') || t.includes('jpg')) return 'jpg';
    if (t.includes('png')) return 'png';
    return 'bin';
  }

  toggleFullscreen(element: HTMLDivElement): void {
    if (!document.fullscreenElement) {
      element.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }
}
