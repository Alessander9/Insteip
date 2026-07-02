package com.insteip.backend.repository;

import com.insteip.backend.entity.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {

    java.util.List<Video> findByModuloIdOrderByOrdenAsc(Long moduloId);
}
