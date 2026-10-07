package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "matricula_videos_acceso", uniqueConstraints = {
    @UniqueConstraint(name = "uq_matricula_video_acceso", columnNames = {"matricula_id", "video_id"})
}, indexes = {
    @Index(name = "idx_matricula_videos_matricula", columnList = "matricula_id"),
    @Index(name = "idx_matricula_videos_video", columnList = "video_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatriculaVideoAcceso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "matricula_id", nullable = false)
    private Matricula matricula;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

    @Column(nullable = false)
    @Builder.Default
    private Boolean habilitado = true;

    @Column(name = "fecha_habilitacion")
    @Builder.Default
    private LocalDateTime fechaHabilitacion = LocalDateTime.now();
}
