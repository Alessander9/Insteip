import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
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
    path: 'cursos', 
    loadComponent: () => import('./features/cursos/cursos.component').then(m => m.PublicCursosComponent) 
  },
  { 
    path: 'cursos/:id', 
    loadComponent: () => import('./features/cursos/curso-detalle-publico/curso-detalle-publico.component').then(m => m.CursoDetallePublicoComponent) 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'certificados/validar/:codigo', 
    loadComponent: () => import('./features/validar-certificado/validar-certificado.component').then(m => m.ValidarCertificadoComponent) 
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent), 
    canActivate: [authGuard],
    children: [
      { 
        path: '', 
        loadComponent: () => import('./features/dashboard/dashboard-home/dashboard-home.component').then(m => m.DashboardHomeComponent) 
      },
      { 
        path: 'alumnos', 
        loadComponent: () => import('./features/dashboard/alumnos/alumnos.component').then(m => m.AlumnosComponent), 
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
        path: 'cursos/:id', 
        loadComponent: () => import('./features/dashboard/cursos/curso-detalle/curso-detalle.component').then(m => m.CursoDetalleComponent), 
        canActivate: [roleGuard], 
        data: { roles: ['ADMINISTRADOR'] } 
      },
      { 
        path: 'modulos/:id/videos', 
        loadComponent: () => import('./features/dashboard/videos/videos.component').then(m => m.VideosComponent), 
        canActivate: [roleGuard], 
        data: { roles: ['ADMINISTRADOR'] } 
      },
      { 
        path: 'modulos/:id/materiales', 
        loadComponent: () => import('./features/dashboard/materiales/materiales.component').then(m => m.MaterialesComponent), 
        canActivate: [roleGuard], 
        data: { roles: ['ADMINISTRADOR'] } 
      },
      { 
        path: 'mis-cursos', 
        loadComponent: () => import('./features/dashboard/mis-cursos/mis-cursos.component').then(m => m.MisCursosComponent) 
      },
      { 
        path: 'certificados', 
        loadComponent: () => import('./features/dashboard/certificados/certificados.component').then(m => m.CertificadosComponent) 
      },
      { 
        path: 'perfil', 
        loadComponent: () => import('./features/dashboard/perfil/perfil.component').then(m => m.PerfilComponent) 
      },
      { 
        path: 'cursos-play/:id', 
        loadComponent: () => import('./features/dashboard/play-curso/play-curso.component').then(m => m.PlayCursoComponent) 
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
      { 
        path: 'configuracion', 
        loadComponent: () => import('./features/dashboard/configuracion/configuracion.component').then(m => m.ConfiguracionComponent), 
        canActivate: [roleGuard], 
        data: { roles: ['ADMINISTRADOR'] } 
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
