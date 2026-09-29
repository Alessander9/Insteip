import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ExperienciaService } from './experiencia.service';
import { environment } from '../../../environments/environment';

describe('ExperienciaService', () => {
  let service: ExperienciaService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl + '/experiencias';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExperienciaService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ExperienciaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debe generar o recuperar un cookie ID de 30 días', () => {
    const cookieId = service.getOrCreateCookieId();
    expect(cookieId).toBeTruthy();
    expect(typeof cookieId).toBe('string');
  });

  it('debe llamar a POST /verificar con correo y cookieId', () => {
    const correoTest = 'prueba@insteip.com';

    service.verificarEstado(correoTest).subscribe((resp) => {
      expect(resp.estado).toBe('LIBRE');
      expect(resp.usosRestantes).toBe(3);
    });

    const req = httpMock.expectOne(`${apiUrl}/verificar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.correo).toBe(correoTest);
    req.flush({ estado: 'LIBRE', usosRestantes: 3, numeroUsoActual: 1 });
  });

  it('debe guardar, leer y limpiar la sesión activa en sessionStorage', () => {
    const sesionMock = {
      sessionToken: 'test-token',
      inicioSesion: new Date().toISOString(),
      expiraSesion: new Date(Date.now() + 900000).toISOString(),
      duracionSegundos: 900,
      numeroUso: 1,
      correo: 'test@insteip.com',
      cursos: []
    };

    service.guardarSesion(sesionMock);
    const sesionRecuperada = service.getSesionActual();
    expect(sesionRecuperada).toBeTruthy();
    expect(sesionRecuperada?.sessionToken).toBe('test-token');

    service.limpiarSesion();
    expect(service.getSesionActual()).toBeNull();
  });
});
