import { environment } from '../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VideoRequest, VideoResponse } from '../models/video.model';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private http = inject(HttpClient);
  private baseApiUrl = environment.apiUrl + '';

  listarVideosPorModulo(moduloId: number): Observable<VideoResponse[]> {
    return this.http.get<VideoResponse[]>(`${this.baseApiUrl}/modulos/${moduloId}/videos`);
  }

  crearVideo(video: VideoRequest): Observable<VideoResponse> {
    return this.http.post<VideoResponse>(`${this.baseApiUrl}/videos`, video);
  }

  editarVideo(id: number, video: VideoRequest): Observable<VideoResponse> {
    return this.http.put<VideoResponse>(`${this.baseApiUrl}/videos/${id}`, video);
  }

  cambiarEstado(id: number, estado: boolean): Observable<void> {
    return this.http.patch<void>(`${this.baseApiUrl}/videos/${id}/estado`, { estado });
  }
}
