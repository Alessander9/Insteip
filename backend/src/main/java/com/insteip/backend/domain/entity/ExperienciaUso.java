package com.insteip.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "experiencias_usos", indexes = {
    @Index(name = "idx_exp_usos_correo", columnList = "correo"),
    @Index(name = "idx_exp_usos_ip", columnList = "ip"),
    @Index(name = "idx_exp_usos_cookie", columnList = "cookie_id"),
    @Index(name = "idx_exp_usos_expira_en", columnList = "expira_en")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExperienciaUso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_uso", nullable = false)
    @Builder.Default
    private Integer numeroUso = 1;

    @Column(nullable = false, length = 150)
    private String correo;

    @Column(length = 100)
    private String ip;

    @Column(name = "cookie_id", length = 100)
    private String cookieId;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "cursos_vistos", columnDefinition = "bigint[]", nullable = false)
    private List<Long> cursosVistos;

    @Column(name = "fecha_uso", updatable = false)
    @Builder.Default
    private LocalDateTime fechaUso = LocalDateTime.now();

    @Column(name = "expira_en", nullable = false)
    private LocalDateTime expiraEn;
}
