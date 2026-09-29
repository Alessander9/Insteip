import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    // Captura segura de errores en producción sin bloquear la navegación del usuario
    const message = error?.message || (typeof error === 'string' ? error : 'Error no identificado');
    const stack = error?.stack || '';

    // En desarrollo/consola se muestra el detalle
    if (typeof console !== 'undefined') {
      console.error('[INSTEIP Error Handler]:', message, stack);
    }

    // Aquí se puede enviar silenciosamente a un endpoint de logs o Sentry si está configurado
  }
}
