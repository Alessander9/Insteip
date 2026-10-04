package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "demo_sesiones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemoSesion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cuenta_demo", nullable = false, length = 150)
    private String cuentaDemo;

    @Column(name = "curso_id_1")
    private Long cursoId1;

    @Column(name = "curso_id_2")
    private Long cursoId2;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime inicio = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime expira;

    @Column(length = 50)
    private String ip;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;
}
