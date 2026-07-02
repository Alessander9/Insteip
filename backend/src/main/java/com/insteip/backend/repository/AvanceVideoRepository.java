package com.insteip.backend.repository;

import com.insteip.backend.entity.AvanceVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AvanceVideoRepository extends JpaRepository<AvanceVideo, Long> {

    java.util.Optional<AvanceVideo> findByUsuarioIdAndVideoId(Long usuarioId, Long videoId);
    java.util.List<AvanceVideo> findByUsuarioId(Long usuarioId);
}
