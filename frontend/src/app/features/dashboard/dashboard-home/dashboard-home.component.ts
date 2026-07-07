import { environment } from '../../../../environments/environment';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlumnoService } from '../../../core/services/alumno.service';
import { CursoService } from '../../../core/services/curso.service';
import { AuthService } from '../../../core/services/auth.service';
import { AlumnoDashboardService } from '../../../core/services/alumno-dashboard.service';
import { CertificadoService } from '../../../core/services/certificado.service';
import { AuditoriaService } from '../../../core/services/auditoria.service';
import { PagoService } from '../../../core/services/pago.service';
import { UserProfile } from '../../../core/models/user-profile.model';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  private authService = inject(AuthService);
  private alumnoService = inject(AlumnoService);
  private cursoService = inject(CursoService);
  private studentService = inject(AlumnoDashboardService);
  private certificadoService = inject(CertificadoService);
  private auditoriaService = inject(AuditoriaService);
  private pagoService = inject(PagoService);
  private http = inject(HttpClient);

  profile: UserProfile | null = null;
  isLoading = true;

  // Admin stats
  totalAlumnos = 0;
  totalCursos = 0;
  totalCertificados = 0;
  systemStatus: any = null;
  recentLogins: any[] = [];
  pendingPayments: any[] = [];
  coursesList: any[] = [];
  recentEvents: any[] = [];
  planStats: any[] = [];

  // Student stats
  studentCursosInscritos = 0;
  studentCursosCompletados = 0;
  studentCertificados = 0;
  studentCursos: any[] = [];

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.profile = user;
        if (user.rol === 'ADMINISTRADOR') {
          this.loadAdminStats();
        } else {
          this.loadStudentStats();
        }
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        this.isLoading = false;
      }
    });
  }

  loadAdminStats(): void {
    this.isLoading = true;

    // Load Alumnos
    this.alumnoService.listarAlumnos().subscribe({
      next: (alumnos) => {
        const total = alumnos.length;
        this.totalAlumnos = total;

        // Count subscriptions
        const counts = { BASICO: 0, INTERMEDIO: 0, PREMIUM: 0 };
        alumnos.forEach(alumno => {
          const sub = alumno.nivelSuscripcion || 'BASICO';
          if (sub in counts) {
            counts[sub as keyof typeof counts]++;
          } else {
            (counts as any)[sub] = ((counts as any)[sub] || 0) + 1;
          }
        });

        this.planStats = [
          { 
            name: 'BASICO', 
            count: counts.BASICO, 
            percentage: total > 0 ? Math.round((counts.BASICO / total) * 100) : 0,
            cssClass: 'bg-slate-50 text-slate-700 border border-slate-200', 
            barClass: 'bg-slate-400',
            icon: 'person' 
          },
          { 
            name: 'INTERMEDIO', 
            count: counts.INTERMEDIO, 
            percentage: total > 0 ? Math.round((counts.INTERMEDIO / total) * 100) : 0,
            cssClass: 'bg-blue-50 text-blue-700 border border-blue-200', 
            barClass: 'bg-blue-500',
            icon: 'school' 
          },
          { 
            name: 'PREMIUM', 
            count: counts.PREMIUM, 
            percentage: total > 0 ? Math.round((counts.PREMIUM / total) * 100) : 0,
            cssClass: 'bg-amber-50 text-amber-800 border border-amber-200', 
            barClass: 'bg-amber-500',
            icon: 'workspace_premium' 
          }
        ];
      }
    });

    // Load Cursos
    this.cursoService.listarCursos().subscribe({
      next: (cursos) => {
        this.totalCursos = cursos.length;
        this.coursesList = (cursos || []).slice(0, 5); // top 5 courses to display
      }
    });

    // Load Certificados
    this.certificadoService.listarCertificados().subscribe({
      next: (certs) => {
        this.totalCertificados = certs.length;
      }
    });

    // Load System status
    this.http.get<any>(environment.apiUrl + '/sistema/status').subscribe({
      next: (status) => {
        this.systemStatus = status;
      }
    });

    // Load Pending Payments
    this.pagoService.listarPagosPendientes().subscribe({
      next: (pagos) => {
        this.pendingPayments = pagos || [];
      }
    });

    // Load System events
    this.auditoriaService.getEventosSistema().subscribe({
      next: (events) => {
        this.recentEvents = (events || []).slice(0, 5);
      }
    });

    // Load Login audits
    this.auditoriaService.getLoginAuditoria().subscribe({
      next: (logins) => {
        this.recentLogins = (logins || []).slice(0, 5);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading audits:', err);
        this.isLoading = false;
      }
    });
  }

  aprobarPago(id: number): void {
    if (confirm('¿Confirmas la verificación del depósito y la activación de la suscripción del alumno?')) {
      this.pagoService.aprobarPago(id).subscribe({
        next: (res) => {
          alert(res.mensaje || 'Pago verificado y suscripción actualizada con éxito.');
          this.loadAdminStats();
        },
        error: (err) => {
          console.error('Error approving payment:', err);
          alert(err.error?.error || 'No se pudo aprobar el pago.');
        }
      });
    }
  }

  loadStudentStats(): void {
    this.isLoading = true;
    this.studentService.getMetrics().subscribe({
      next: (metrics) => {
        this.studentCursosInscritos = metrics.cursosInscritos;
        this.studentCursosCompletados = metrics.cursosCompletados;
        this.studentCertificados = metrics.certificados;
        
        // Fetch enrolled courses for display on home dashboard
        this.studentService.getEnrolledCursos().subscribe({
          next: (cursos) => {
            this.studentCursos = (cursos || []).slice(0, 3); // top 3 courses
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error loading enrolled courses:', err);
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error loading student metrics:', err);
        this.isLoading = false;
      }
    });
  }
}
