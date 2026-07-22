import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards';

export const routes: Routes = [
  // ================================================================
  //  REDIRECCIÓN RAÍZ
  // ================================================================
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },

  // ================================================================
  //  RUTAS PÚBLICAS  (sin autenticación)
  // ================================================================
  {
    path: 'inicio',
    loadComponent: () => import('./features/inicio/inicio.component').then(m => m.InicioComponent)
  },
  {
    path: 'programas',
    loadComponent: () => import('./features/programas/programas.component').then(m => m.ProgramasComponent)
  },
  {
    path: 'recursos',
    loadComponent: () => import('./features/recursos/recursos.component').then(m => m.RecursosComponent)
  },
  {
    path: 'certificacion',
    loadComponent: () => import('./features/certificacion/certificacion.component').then(m => m.CertificacionComponent)
  },
  {
    path: 'por-que-elegirnos',
    loadComponent: () => import('./features/por-que-elegirnos/por-que-elegirnos.component').then(m => m.PorQueElegirnosComponent)
  },
  {
    path: 'como-aprenderas',
    loadComponent: () => import('./features/como-aprenderas/como-aprenderas.component').then(m => m.ComoAprenderasComponent)
  },
  {
    path: 'cursos',
    loadComponent: () => import('./features/cursos/cursos.component').then(m => m.PublicCursosComponent)
  },
  {
    path: 'TodosLosCursos.html',
    loadComponent: () => import('./features/cursos/cursos.component').then(m => m.PublicCursosComponent)
  },
  {
    path: 'cursos/auriculoterapia',
    loadComponent: () => import('./features/formaciones/auriculoterapia/auriculoterapia.component').then(m => m.AuriculoterapiaComponent)
  },
  {
    path: 'cursos/auriculoterapia.html',
    loadComponent: () => import('./features/formaciones/auriculoterapia/auriculoterapia.component').then(m => m.AuriculoterapiaComponent)
  },
  {
    path: 'cursos/acupuntura-china',
    loadComponent: () => import('./features/formaciones/acupuntura-china/acupuntura-china.component').then(m => m.AcupunturaChinaComponent)
  },
  {
    path: 'cursos/acupuntura-china.html',
    loadComponent: () => import('./features/formaciones/acupuntura-china/acupuntura-china.component').then(m => m.AcupunturaChinaComponent)
  },
  {
    path: 'cursos/masaje-terapeutico',
    loadComponent: () => import('./features/formaciones/masaje-terapeutico/masaje-terapeutico.component').then(m => m.MasajeTerapeticoComponent)
  },
  {
    path: 'cursos/masaje-terapeutico.html',
    loadComponent: () => import('./features/formaciones/masaje-terapeutico/masaje-terapeutico.component').then(m => m.MasajeTerapeticoComponent)
  },
  {
    path: 'cursos/paralisis-facial-acupuntura-fisioterapia-online',
    loadComponent: () => import('./features/formaciones/online-workshop/online-workshop.component').then(m => m.OnlineWorkshopComponent)
  },
  {
    path: 'cursos/control-peso-auriculoterapia-acupuntura-online',
    loadComponent: () => import('./features/formaciones/online-workshop/online-workshop.component').then(m => m.OnlineWorkshopComponent)
  },
  {
    path: 'cursos/stretching-terapeutico-online',
    loadComponent: () => import('./features/formaciones/online-workshop/online-workshop.component').then(m => m.OnlineWorkshopComponent)
  },
  {
    path: 'cursos/acupuntura-estetica-online',
    loadComponent: () => import('./features/formaciones/online-workshop/online-workshop.component').then(m => m.OnlineWorkshopComponent)
  },
  {
    path: 'cursos/reflexologia-online',
    loadComponent: () => import('./features/formaciones/online-workshop/online-workshop.component').then(m => m.OnlineWorkshopComponent)
  },
  {
    path: 'cursos/digitopresion-presencial',
    loadComponent: () => import('./features/formaciones/digitopresion-presencial/digitopresion-presencial.component').then(m => m.DigitopresionPresencialComponent)
  },
  {
    path: 'cursos/auriculoterapia-presencial',
    loadComponent: () => import('./features/formaciones/auriculoterapia-presencial/auriculoterapia-presencial.component').then(m => m.AuriculoterapiaPresencialComponent)
  },
  {
    path: 'cursos/acupuntura-presencial',
    loadComponent: () => import('./features/formaciones/acupuntura-presencial/acupuntura-presencial.component').then(m => m.AcupunturaPresencialComponent)
  },
  {
    path: 'cursos/dietetica-presencial',
    loadComponent: () => import('./features/formaciones/dietetica-presencial/dietetica-presencial.component').then(m => m.DieteticaPresencialComponent)
  },
  {
    path: 'cursos/:id',
    loadComponent: () => import('./features/cursos/curso-detalle-publico/curso-detalle-publico.component').then(m => m.CursoDetallePublicoComponent)
  },
  {
    path: 'certificados/validar/:codigo',
    loadComponent: () => import('./features/validar-certificado/validar-certificado.component').then(m => m.ValidarCertificadoComponent)
  },

  // ================================================================
  //  AUTENTICACIÓN
  // ================================================================
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },

  // ================================================================
  //  DASHBOARD  (requiere autenticación — authGuard)
  //  Sub-rutas protegidas por rol con roleGuard
  // ================================================================
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    children: [

      // ── Home (todos los roles) ──
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent)
      },

      // ── Perfil (todos los roles) ──
      {
        path: 'perfil',
        loadComponent: () => import('./features/dashboard/perfil/perfil.component').then(m => m.PerfilComponent)
      },

      // ── ADMINISTRADOR ─────────────────────────────────────────
      {
        path: 'alumnos',
        loadComponent: () => import('./features/dashboard/alumnos/alumnos.component').then(m => m.AlumnosComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR'] }
      },
      {
        path: 'docentes',
        loadComponent: () => import('./features/dashboard/docentes/docentes.component').then(m => m.DocentesComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR'] }
      },
      {
        path: 'cursos',
        loadComponent: () => import('./features/dashboard/cursos/cursos.component').then(m => m.CursosComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR'] },
        pathMatch: 'full'
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./features/dashboard/configuracion/configuracion.component').then(m => m.ConfiguracionComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR'] }
      },
      {
        path: 'auditoria',
        loadComponent: () => import('./features/dashboard/auditoria/auditoria.component').then(m => m.AuditoriaComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR'] }
      },
      {
        path: 'sistema',
        loadComponent: () => import('./features/dashboard/sistema/sistema.component').then(m => m.SistemaComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR'] }
      },

      // ── ADMINISTRADOR + DOCENTE ───────────────────────────────
      {
        path: 'cursos/:id',
        loadComponent: () => import('./features/dashboard/cursos/curso-detalle/curso-detalle.component').then(m => m.CursoDetalleComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'DOCENTE'] }
      },
      {
        path: 'modulos/:id/videos',
        loadComponent: () => import('./features/dashboard/videos/videos.component').then(m => m.VideosComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'DOCENTE'] }
      },
      {
        path: 'modulos/:id/materiales',
        loadComponent: () => import('./features/dashboard/materiales/materiales.component').then(m => m.MaterialesComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'DOCENTE'] }
      },

      // ── DOCENTE ───────────────────────────────────────────────
      {
        path: 'mis-cursos-docente',
        loadComponent: () => import('./features/dashboard/docente/mis-cursos-docente/mis-cursos-docente.component').then(m => m.MisCursosDocenteComponent),
        canActivate: [roleGuard],
        data: { roles: ['DOCENTE'] }
      },
      {
        path: 'mis-alumnos-docente/:id',
        loadComponent: () => import('./features/dashboard/docente/mis-alumnos-docente/mis-alumnos-docente.component').then(m => m.MisAlumnosDocenteComponent),
        canActivate: [roleGuard],
        data: { roles: ['DOCENTE'] }
      },

      // ── ALUMNO ────────────────────────────────────────────────
      {
        path: 'mis-cursos',
        loadComponent: () => import('./features/dashboard/mis-cursos/mis-cursos.component').then(m => m.MisCursosComponent)
      },
      {
        path: 'cursos-play/:id',
        loadComponent: () => import('./features/dashboard/play-curso/play-curso.component').then(m => m.PlayCursoComponent)
      },

      // ── ALUMNO + ADMINISTRADOR ────────────────────────────────
      {
        path: 'certificados',
        loadComponent: () => import('./features/dashboard/certificados/certificados.component').then(m => m.CertificadosComponent)
      },
    ]
  },

  // ================================================================
  //  WILDCARD — redirige al login si no hay match
  // ================================================================
  { path: '**', redirectTo: 'login' }
];
