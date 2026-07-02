package com.insteip.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "matriculas", uniqueConstraints = {
    @UniqueConstraint(name = "uq_matricula_usuario_curso", columnNames = {"usuario_id", "curso_id"})
}, indexes = {
    @Index(name = "idx_matriculas_usuario", columnList = "usuario_id"),
    @Index(name = "idx_matriculas_curso", columnList = "curso_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Matricula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    @Column(name = "fecha_matricula", updatable = false)
    @Builder.Default
    private LocalDateTime fechaMatricula = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private Boolean estado = true;
}
