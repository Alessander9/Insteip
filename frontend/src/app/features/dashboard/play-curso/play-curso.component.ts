import { Component, OnInit, OnDestroy, AfterViewInit, inject, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SkeletonLoaderComponent } from '../../../core/components/skeleton-loader/skeleton-loader.component';
import { AlumnoDashboardService, AlumnoPlayCourse, AlumnoPlayVideo } from '../../../core/services/';
import { CertificadoService } from '../../../core/services/';
import { AuthService } from '../../../core/services/';
import { ArchivoProtegidoService } from '../../../core/services/';
import { VideoService } from '../../../core/services/';
import { UserProfile } from '../../../core/models/';
import { extraerIdYoutube } from '../../../core/utils/';
import { formatBytes, getCleanFileType, getFileExtension } from '../../../core/utils/';
import { environment } from '../../../../environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-play-curso',
  standalone: true,
  imports: [CommonModule, RouterModule, SkeletonLoaderComponent],
  templateUrl: './play-curso.component.html',
  styleUrls: ['./play-curso.component.css']
})
export class PlayCursoComponent implements OnInit, OnDestroy, AfterViewInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentService = inject(AlumnoDashboardService);
  private certificadoService = inject(CertificadoService);
  private authService = inject(AuthService);
  private archivoProtegidoService = inject(ArchivoProtegidoService);
  private videoService = inject(VideoService);
  private ngZone = inject(NgZone);

  profile: UserProfile | null = null;
  cursoId!: number;
  curso: AlumnoPlayCourse | null = null;
  currentVideo: AlumnoPlayVideo | null = null;
  embedError = false;

  isLoading = true;
  isPlayerLoading = false;
  activeTab: 'materiales' | 'info' | 'certificado' | '' = 'materiales';
  isSavingProgress = false;
  courseCompleted = false;
  showCompletionModal = false;
  completionModalSecondsLeft = 0;
  showNextChapterCountdown = false;
  nextChapterSecondsLeft = 5;
  nextChapterLabel = '';
  certificatePdfUrl: string | null = null;
  certificateCode: string | null = null;
  totalVideos = 0;
  completedVideos = 0;
  completionPercentage = 0;

  // Ticker tracking
  private tickerInterval: ReturnType<typeof setInterval> | null = null;
  private secondsWatched = 0;
  private isVideoPlaying = false;
  private pendingAutoCompleteVideoId: number | null = null;

  // YouTube Player instance
  private player: any = null;
  private isPlayerReady = false;

  private isViewInitialized = false;
  private pendingVideoToPlay: AlumnoPlayVideo | null = null;
  private completionModalShown = false;
  private pendingNextVideo: AlumnoPlayVideo | null = null;

  // Robustness: cleanup subject for subscriptions
  private destroy$ = new Subject<void>();
  // Robustness: retry timeout reference for cancellation
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;
  // Robustness: track script load retries
  private scriptLoadRetries = 0;
  private readonly MAX_SCRIPT_RETRIES = 3;
  // Robustness: track if component is alive
  private isComponentAlive = true;
  // Robustness: track unsaved progress
  private hasUnsavedProgress = false;
  private durationPersistedForVideoId: number | null = null;
  // Completion modal timers
  private completionModalTimeout: ReturnType<typeof setTimeout> | null = null;
  private completionCountdownInterval: ReturnType<typeof setInterval> | null = null;
  private nextChapterCountdownInterval: ReturnType<typeof setInterval> | null = null;
  private nextChapterTimeout: ReturnType<typeof setTimeout> | null = null;

  private pendingVideoIdFromQuery: number | null = null;

  ngOnInit(): void {
    this.authService.getProfile().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (user) => { this.profile = user; }
    });

    // Read query params for specific videoId
    this.route.queryParamMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(queryParams => {
      const videoIdParam = queryParams.get('videoId');
      this.pendingVideoIdFromQuery = videoIdParam ? Number(videoIdParam) : null;
    });

    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const idParam = params.get('id');
      if (!idParam) {
        this.router.navigate(['/dashboard/mis-cursos']);
        return;
      }
      this.cursoId = Number(idParam);
      this.loadCoursePlaySession();
    });
  }

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    if (this.pendingVideoToPlay) {
      this.playVideo(this.pendingVideoToPlay);
      this.pendingVideoToPlay = null;
    }
  }

  ngOnDestroy(): void {
    this.isComponentAlive = false;

    // Cancel all subscriptions
    this.destroy$.next();
    this.destroy$.complete();

    // Cancel pending retry timeouts
    this.cancelRetryTimeout();
    this.clearCompletionModalTimers();
    this.clearNextChapterTimers();

    // Stop ticker
    this.stopTicker();

    // Save any unsaved progress before destroying
    this.saveProgressOnExit();

    // Destroy YouTube player
    if (this.player) {
      try {
        this.player.destroy();
      } catch (e) {}
      this.player = null;
      this.isPlayerReady = false;
    }
  }

  /** Save progress when user closes tab or navigates away */
  @HostListener('window:beforeunload')
  onBeforeUnload(): void {
    this.saveProgressOnExit();
  }

  /** Attempt to persist current progress using sendBeacon (non-blocking) */
  private saveProgressOnExit(): void {
    if (!this.hasUnsavedProgress || !this.currentVideo || this.currentVideo.completado) return;

    const duration = this.getCurrentVideoDurationSeconds();
    const secondsToSend = Math.min(duration, Math.max(0, Math.ceil(this.secondsWatched)));

    // Use sendBeacon for reliable delivery even during page unload
    try {
      const token = localStorage.getItem('token');
      const payload = JSON.stringify({
        videoId: this.currentVideo.id,
        ultimoSegundo: secondsToSend,
        duracionSegundos: duration
      });
      const headers = { type: 'application/json' };
      const blob = new Blob([payload], headers);

      // sendBeacon doesn't support custom headers, so we fall back to sync XHR for auth
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${environment.apiUrl}/avance`, false); // synchronous
      xhr.setRequestHeader('Content-Type', 'application/json');
      if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      xhr.send(payload);
    } catch (e) {
      // Best effort — if it fails, progress was already saved periodically
    }

    this.hasUnsavedProgress = false;
  }

  private flattenVideos(): AlumnoPlayVideo[] {
    if (!this.curso) return [];
    return this.curso.modulos.flatMap(mod => mod.videos);
  }

  private getNextVideoAfter(videoId: number): AlumnoPlayVideo | null {
    const videos = this.flattenVideos();
    const currentIndex = videos.findIndex(v => v.id === videoId);
    if (currentIndex === -1 || currentIndex + 1 >= videos.length) return null;
    return videos[currentIndex + 1];
  }

  private syncVideoCompletionState(videoId: number, progress: Partial<AlumnoPlayVideo>): void {
    if (!this.curso) return;

    for (const modulo of this.curso.modulos) {
      for (const video of modulo.videos) {
        if (video.id !== videoId) continue;
        if (progress.ultimoSegundo !== undefined) video.ultimoSegundo = progress.ultimoSegundo;
        if (progress.porcentajeVisto !== undefined) video.porcentajeVisto = progress.porcentajeVisto;
        if (progress.completado !== undefined) video.completado = progress.completado;
      }
    }
  }

  private guardarDuracionReal(): void {
    if (!this.currentVideo || !this.player) return;
    if (this.durationPersistedForVideoId === this.currentVideo.id) return;
    try {
      const ytDuration = this.player.getDuration();
      if (ytDuration && ytDuration > 0) {
        this.durationPersistedForVideoId = this.currentVideo.id;
        this.currentVideo.duracionSegundos = ytDuration;
        this.videoService.actualizarDuracion(this.currentVideo.id, ytDuration).subscribe({
          error: () => {}
        });
      }
    } catch (_e) {}
  }

  private forceCompleteCurrentVideo(): void {
    if (!this.currentVideo || this.currentVideo.completado) return;

    this.pendingAutoCompleteVideoId = this.currentVideo.id;
    this.secondsWatched = this.getCurrentVideoDurationSeconds();
    this.currentVideo.ultimoSegundo = this.secondsWatched;
    this.currentVideo.porcentajeVisto = 100;
    this.currentVideo.completado = true;
    this.syncVideoCompletionState(this.currentVideo.id, {
      ultimoSegundo: this.secondsWatched,
      porcentajeVisto: 100,
      completado: true
    });
    this.checkOverallCompletion(true);
  }

  loadCoursePlaySession(): void {
    this.studentService.getPlayCourse(this.cursoId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.curso = data;
        this.isLoading = false;
        this.selectDefaultVideo(this.pendingVideoIdFromQuery);
        this.checkOverallCompletion(false);
      },
      error: () => {
        this.router.navigate(['/dashboard/mis-cursos']);
      }
    });
  }

  selectDefaultVideo(videoId?: number | null): void {
    if (!this.curso || this.curso.modulos.length === 0) return;

    let targetVideo: AlumnoPlayVideo | null = null;

    // If a specific videoId was requested, find it
    if (videoId) {
      for (const mod of this.curso.modulos) {
        for (const vid of mod.videos) {
          if (vid.id === videoId) {
            targetVideo = vid;
            break;
          }
        }
        if (targetVideo) break;
      }
    }

    // Otherwise, find first uncompleted video
    if (!targetVideo) {
      for (const mod of this.curso.modulos) {
        for (const vid of mod.videos) {
          if (!vid.completado) { targetVideo = vid; break; }
        }
        if (targetVideo) break;
      }
    }

    // Fallback to first video
    if (!targetVideo) {
      for (const mod of this.curso.modulos) {
        if (mod.videos.length > 0) { targetVideo = mod.videos[0]; break; }
      }
    }

    if (targetVideo) this.playVideo(targetVideo);
  }

  playVideo(video: AlumnoPlayVideo): void {
    // Save progress of previous video before switching
    if (this.currentVideo && this.hasUnsavedProgress && this.currentVideo.id !== video.id) {
      this.saveCurrentProgress(false);
    }

    this.stopTicker();
    this.cancelRetryTimeout();
    this.clearNextChapterTimers();
    this.isVideoPlaying = false;
    this.currentVideo = video;
    this.secondsWatched = this.getPlaybackStartSeconds(video);
    this.embedError = false;
    this.isPlayerLoading = true;
    this.hasUnsavedProgress = false;

    if (!this.isViewInitialized) {
      this.pendingVideoToPlay = video;
      return;
    }

    const id = (video.youtubeId || '').trim() || extraerIdYoutube(video.youtubeUrl);
    if (!id) {
      this.embedError = true;
      this.isPlayerLoading = false;
      return;
    }

    if (this.player && this.isPlayerReady && this.isPlayerIframeValid()) {
      try {
        this.player.loadVideoById({
          videoId: id,
          startSeconds: this.getPlaybackStartSeconds(video)
        });
        this.isPlayerLoading = false;
        this.startTicker();
      } catch (e) {
        console.warn('Player loadVideoById failed, recreating player:', e);
        this.destroyPlayerSafely();
        this.initYoutubePlayer(id, this.getPlaybackStartSeconds(video));
      }
    } else {
      this.destroyPlayerSafely();
      this.initYoutubePlayer(id, this.getPlaybackStartSeconds(video));
    }
  }

  /** Verify the player's iframe still exists in the DOM */
  private isPlayerIframeValid(): boolean {
    if (!this.player) return false;
    try {
      const iframe = this.player.getIframe?.();
      return !!(iframe && iframe.parentNode && document.body.contains(iframe));
    } catch {
      return false;
    }
  }

  /** Safely destroy the player without throwing */
  private destroyPlayerSafely(): void {
    if (this.player) {
      try { this.player.destroy(); } catch (e) {}
      this.player = null;
      this.isPlayerReady = false;
    }
  }

  private initYoutubePlayer(videoId: string, startSeconds: number): void {
    const YT = (window as any)['YT'];

    if (!YT || !YT.Player) {
      this.loadYouTubeScript(videoId, startSeconds);
    } else {
      this.createPlayer(videoId, startSeconds);
    }
  }

  /** Load the YouTube IFrame API script with error handling and retries */
  private loadYouTubeScript(videoId: string, startSeconds: number): void {
    // Check if script tag already exists (but API not ready yet)
    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
    if (existingScript) {
      // Script is loading, just wait for the callback
      this.setYouTubeReadyCallback(videoId, startSeconds);
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';

    // Robustness: handle script load failure
    tag.onerror = () => {
      if (!this.isComponentAlive) return;

      this.scriptLoadRetries++;
      console.warn(`YouTube API script failed to load (attempt ${this.scriptLoadRetries}/${this.MAX_SCRIPT_RETRIES})`);

      // Remove the failed script tag
      tag.remove();

      if (this.scriptLoadRetries < this.MAX_SCRIPT_RETRIES) {
        // Retry with exponential backoff (500ms, 1000ms, 2000ms)
        const delay = 500 * Math.pow(2, this.scriptLoadRetries - 1);
        this.retryTimeout = setTimeout(() => {
          if (this.isComponentAlive) {
            this.loadYouTubeScript(videoId, startSeconds);
          }
        }, delay);
      } else {
        this.ngZone.run(() => {
          this.embedError = true;
          this.isPlayerLoading = false;
        });
      }
    };

    this.setYouTubeReadyCallback(videoId, startSeconds);

    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  }

  /** Set the global onYouTubeIframeAPIReady callback without overwriting existing ones */
  private setYouTubeReadyCallback(videoId: string, startSeconds: number): void {
    const existingCallback = (window as any)['onYouTubeIframeAPIReady'];

    (window as any)['onYouTubeIframeAPIReady'] = () => {
      // Chain previous callback if it existed from another component
      if (existingCallback && existingCallback !== (window as any)['onYouTubeIframeAPIReady']) {
        try { existingCallback(); } catch (e) {}
      }
      if (this.isComponentAlive) {
        this.createPlayer(videoId, startSeconds);
      }
    };
  }

  private createPlayer(videoId: string, startSeconds: number, retryCount = 0): void {
    if (!this.isComponentAlive) return;

    const maxRetries = 10;
    const playerEl = document.getElementById('youtube-player');

    if (!this.isViewInitialized || !playerEl) {
      if (retryCount < maxRetries) {
        // DOM not ready yet (Angular hasn't rendered *ngIf="curso"), retry shortly
        this.retryTimeout = setTimeout(() => {
          if (this.isComponentAlive) {
            this.createPlayer(videoId, startSeconds, retryCount + 1);
          }
        }, 100);
      } else {
        console.error('YouTube player container not found after retries');
        this.embedError = true;
        this.isPlayerLoading = false;
      }
      return;
    }

    // Validate that YT.Player constructor is available
    const YT = (window as any)['YT'];
    if (!YT || typeof YT.Player !== 'function') {
      console.error('YT.Player constructor not available');
      this.embedError = true;
      this.isPlayerLoading = false;
      return;
    }

    this.destroyPlayerSafely();

    try {
      this.player = new YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          start: startSeconds,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          'onReady': () => {
            if (!this.isComponentAlive) return;
            this.ngZone.run(() => {
              this.isPlayerReady = true;
              this.isPlayerLoading = false;
              // Desactivar subtítulos por defecto
              try {
                if (this.player && this.player.setOption) {
                  this.player.setOption('captions', 'track', {});
                }
              } catch (_e) {}
              // Persistir duración real ni bien el player esté listo
              this.guardarDuracionReal();
              this.startTicker();
            });
          },
          'onStateChange': (event: any) => {
            if (!this.isComponentAlive) return;
            this.ngZone.run(() => {
              this.onPlayerStateChange(event);
            });
          },
          'onError': (event: any) => {
            if (!this.isComponentAlive) return;
            const errorCode = event?.data;
            console.warn('YouTube player error, code:', errorCode);
            this.ngZone.run(() => {
              this.embedError = true;
              this.isPlayerLoading = false;
              this.stopTicker();
            });
          }
        }
      });
    } catch (e) {
      console.error('Error creating YouTube player:', e);
      this.embedError = true;
      this.isPlayerLoading = false;
    }
  }

  private onPlayerStateChange(event: any): void {
    const state = event.data;

    // Dynamically update duration if available
    if (this.player && typeof this.player.getDuration === 'function' && this.currentVideo) {
      try {
        const ytDuration = this.player.getDuration();
        if (ytDuration > 0) {
          this.currentVideo.duracionSegundos = ytDuration;
        }
      } catch (e) {}
    }

    // YT.PlayerState.PLAYING is 1
    if (state === 1) {
      this.isVideoPlaying = true;
      this.isPlayerLoading = false;
      // Persistir duración real al empezar a reproducir
      this.guardarDuracionReal();
    } else if (state === 0) {
      // YT.PlayerState.ENDED is 0
      this.isVideoPlaying = false;
      this.stopTicker();
      if (this.currentVideo && !this.currentVideo.completado) {
        this.forceCompleteCurrentVideo();
        if (!this.isSavingProgress) {
          this.saveCurrentProgress(true);
        }
      }
    } else if (state === 3) {
      // BUFFERING — show loading
      this.isPlayerLoading = true;
      this.isVideoPlaying = false;
    } else {
      // PAUSED (2), CUED (5), UNSTARTED (-1)
      this.isVideoPlaying = false;
      this.isPlayerLoading = false;
    }
  }

  getCurrentVideoLink(): string {
    return this.currentVideo?.youtubeUrl || '#';
  }

  startTicker(): void {
    this.stopTicker();
    let secondsSinceLastSave = 0;

    this.tickerInterval = setInterval(() => {
      if (!this.isComponentAlive) { this.stopTicker(); return; }

      // Double check current duration dynamically
      if (this.player && typeof this.player.getDuration === 'function' && this.currentVideo) {
        try {
          const ytDuration = this.player.getDuration();
          if (ytDuration > 0) {
            this.currentVideo.duracionSegundos = ytDuration;
          }
        } catch (e) {}
      }

      if (!this.currentVideo || !this.isVideoPlaying) return;

      const duration = this.getCurrentVideoDurationSeconds();
      const playerSeconds = this.player && typeof this.player.getCurrentTime === 'function'
        ? Number(this.player.getCurrentTime() || 0)
        : this.secondsWatched + 1;
      this.secondsWatched = Math.min(Math.max(0, playerSeconds), duration);
      this.hasUnsavedProgress = true;
      secondsSinceLastSave++;

      // Completion fallback threshold: wait until the video is effectively finished,
      // but do not cut playback a full second early.
      const completionThreshold = Math.max(duration - 0.25, 1);
      if (this.secondsWatched >= completionThreshold) {
        if (!this.currentVideo.completado) {
          this.forceCompleteCurrentVideo();
          if (!this.isSavingProgress) {
            this.saveCurrentProgress(true);
          }
        }
        this.stopTicker();
        return;
      }

      if (secondsSinceLastSave >= 15) {
        this.saveCurrentProgress(false);
        secondsSinceLastSave = 0;
      }
    }, 1000);
  }

  stopTicker(): void {
    if (this.tickerInterval) {
      clearInterval(this.tickerInterval);
      this.tickerInterval = null;
    }
  }

  /** Cancel any pending retry timeout */
  private cancelRetryTimeout(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
  }

  saveCurrentProgress(isManualComplete: boolean): void {
    if (!this.currentVideo || this.isSavingProgress) return;

    const duration = this.getCurrentVideoDurationSeconds();
    const secondsToSend = isManualComplete
      ? duration
      : Math.min(duration, Math.max(0, Math.ceil(this.secondsWatched)));

    this.isSavingProgress = true;
    this.studentService.guardarProgreso(this.currentVideo.id, secondsToSend, duration).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (progress) => {
        this.isSavingProgress = false;
        this.hasUnsavedProgress = false;
        const isAutoCompleteAttempt = this.pendingAutoCompleteVideoId === this.currentVideo?.id;
        const completedByThisSave = progress.completado && isAutoCompleteAttempt;
        const normalizedProgress = isAutoCompleteAttempt
          ? {
              ...progress,
              ultimoSegundo: duration,
              porcentajeVisto: 100,
              completado: true
            }
          : progress;

        if (this.currentVideo) {
          this.syncVideoCompletionState(this.currentVideo.id, {
            ultimoSegundo: normalizedProgress.ultimoSegundo,
            porcentajeVisto: normalizedProgress.porcentajeVisto,
            completado: normalizedProgress.completado
          });
          if (normalizedProgress.completado) {
            this.currentVideo.completado = true;
          }
        }

        this.checkOverallCompletion(normalizedProgress.completado === true);

        if (
          this.currentVideo &&
          completedByThisSave &&
          !this.courseCompleted
        ) {
          const nextVideo = this.getNextVideoAfter(this.currentVideo.id);
          if (nextVideo) {
            this.openNextChapterCountdown(nextVideo);
          }
        }

        if (this.currentVideo && isAutoCompleteAttempt && !this.currentVideo.completado) {
          this.pendingAutoCompleteVideoId = null;
          this.saveCurrentProgress(true);
          return;
        }

        if (this.currentVideo?.completado) {
          this.pendingAutoCompleteVideoId = null;
        }
      },
      error: () => { this.isSavingProgress = false; }
    });
  }

  checkOverallCompletion(showCelebration = false): void {
    if (!this.curso) return;

    let totalVids = 0;
    let completedVids = 0;

    for (const mod of this.curso.modulos) {
      for (const vid of mod.videos) {
        totalVids++;
        if (vid.completado) completedVids++;
      }
    }

    this.totalVideos = totalVids;
    this.completedVideos = completedVids;
    this.completionPercentage = totalVids > 0 ? Math.round((completedVids / totalVids) * 100) : 0;
    this.courseCompleted = totalVids > 0 && completedVids === totalVids;

    if (this.courseCompleted) {
      this.fetchOrCreateCertificate();
      if (showCelebration) {
        this.openCompletionModal();
      }
    }
  }

  private openCompletionModal(): void {
    if (this.completionModalShown || !this.courseCompleted) return;

    this.completionModalShown = true;
    this.showCompletionModal = true;
    this.clearCompletionModalTimers();
    this.completionModalSecondsLeft = 6;

    this.completionCountdownInterval = setInterval(() => {
      if (this.completionModalSecondsLeft > 0) {
        this.completionModalSecondsLeft--;
      }
    }, 1000);

    this.completionModalTimeout = setTimeout(() => {
      this.closeCompletionModal();
    }, 6000);
  }

  closeCompletionModal(): void {
    this.showCompletionModal = false;
    this.clearCompletionModalTimers();
  }

  private clearCompletionModalTimers(): void {
    if (this.completionModalTimeout) {
      clearTimeout(this.completionModalTimeout);
      this.completionModalTimeout = null;
    }
    if (this.completionCountdownInterval) {
      clearInterval(this.completionCountdownInterval);
      this.completionCountdownInterval = null;
    }
    this.completionModalSecondsLeft = 0;
  }

  private openNextChapterCountdown(nextVideo: AlumnoPlayVideo): void {
    this.clearNextChapterTimers();

    if (!this.currentVideo || this.courseCompleted) return;

    this.pendingNextVideo = nextVideo;
    this.showNextChapterCountdown = true;
    this.nextChapterSecondsLeft = 5;
    this.nextChapterLabel = nextVideo.titulo;

    this.nextChapterCountdownInterval = setInterval(() => {
      if (this.nextChapterSecondsLeft > 0) {
        this.nextChapterSecondsLeft--;
      }
    }, 1000);

    this.nextChapterTimeout = setTimeout(() => {
      const target = this.pendingNextVideo;
      this.clearNextChapterTimers();
      if (target && this.isComponentAlive) {
        this.ngZone.run(() => this.playVideo(target));
      }
    }, 5000);
  }

  closeNextChapterCountdown(): void {
    this.clearNextChapterTimers();
  }

  goToNextChapterNow(): void {
    const target = this.pendingNextVideo;
    this.clearNextChapterTimers();
    if (target && this.isComponentAlive) {
      this.ngZone.run(() => this.playVideo(target));
    }
  }

  private clearNextChapterTimers(): void {
    if (this.nextChapterTimeout) {
      clearTimeout(this.nextChapterTimeout);
      this.nextChapterTimeout = null;
    }
    if (this.nextChapterCountdownInterval) {
      clearInterval(this.nextChapterCountdownInterval);
      this.nextChapterCountdownInterval = null;
    }
    this.showNextChapterCountdown = false;
    this.nextChapterSecondsLeft = 5;
    this.nextChapterLabel = '';
    this.pendingNextVideo = null;
  }

  fetchOrCreateCertificate(): void {
    this.certificadoService.generarCertificado(this.cursoId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (cert) => {
        this.certificatePdfUrl = cert.archivoPdf;
        this.certificateCode = cert.codigo;
      },
      error: (err) => console.error('Error al generar certificado:', err)
    });
  }

  descargarMaterial(url: string, nombre: string, tipoArchivo: string): void {
    const extension = getFileExtension(tipoArchivo);
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

  formatBytes = formatBytes;
  getCleanFileType = getCleanFileType;

  toggleFullscreen(element: HTMLDivElement): void {
    if (!document.fullscreenElement) {
      element.requestFullscreen().catch(err => console.error(err.message));
    } else {
      document.exitFullscreen();
    }
  }

  private getCurrentVideoDurationSeconds(): number {
    return Math.max(1, this.currentVideo?.duracionSegundos || 600);
  }

  private getPlaybackStartSeconds(video: AlumnoPlayVideo): number {
    if (video.completado) {
      return 0;
    }

    const duration = Math.max(1, video.duracionSegundos || 0);
    const watched = Math.max(0, video.ultimoSegundo || 0);
    return Math.min(watched, duration - 1);
  }
}
