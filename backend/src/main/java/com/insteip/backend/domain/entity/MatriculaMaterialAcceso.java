package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "matricula_materiales_acceso", uniqueConstraints = {
    @UniqueConstraint(name = "uq_matricula_material_acceso", columnNames = {"matricula_id", "material_id"})
}, indexes = {
    @Index(name = "idx_matricula_materiales_matricula", columnList = "matricula_id"),
    @Index(name = "idx_matricula_materiales_material", columnList = "material_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatriculaMaterialAcceso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "matricula_id", nullable = false)
    private Matricula matricula;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @Column(nullable = false)
    @Builder.Default
    private Boolean habilitado = true;

    @Column(name = "fecha_habilitacion")
    @Builder.Default
    private LocalDateTime fechaHabilitacion = LocalDateTime.now();
}
