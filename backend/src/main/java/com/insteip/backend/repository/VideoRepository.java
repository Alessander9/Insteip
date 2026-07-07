package com.insteip.backend.repository;

import com.insteip.backend.entity.Video;
import org.springframework.data.jpa.repository.JpaRepository;
public interface VideoRepository extends JpaRepository<Video, Long> {

    java.util.List<Video> findByModuloIdOrderByOrdenAsc(Long moduloId);
}
