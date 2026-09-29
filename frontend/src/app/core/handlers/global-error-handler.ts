import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    const message = error?.message || (typeof error === 'string' ? error : 'Error no identificado');
    const stack = error?.stack || '';

    // En desarrollo/consola se muestra el detalle
    if (typeof console !== 'undefined') {
      console.error('[INSTEIP Error Handler]:', message, stack);
    }

    // Auto-recuperación ante ChunkLoadError (ocurre al desplegar nueva versión mientras el usuario navega)
    const isChunkError = /Loading chunk|ChunkLoadError|failed to load chunk/i.test(message) || /Loading chunk|ChunkLoadError/i.test(stack);
    if (isChunkError && typeof window !== 'undefined') {
      const chunkReloadKey = 'insteip_chunk_reload_attempt';
      const lastReload = sessionStorage.getItem(chunkReloadKey);
      if (!lastReload) {
        sessionStorage.setItem(chunkReloadKey, 'true');
        console.warn('[INSTEIP Error Handler]: Detectada nueva versión desplegada. Recargando aplicación...');
        window.location.reload();
        return;
      }
    }
  }
}

