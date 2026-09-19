package com.insteip.backend.infrastructure.security;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class RateLimiterService {

    private static class RequestCounter {
        private final long windowStartTime;
        private final AtomicInteger count;

        public RequestCounter(long windowStartTime) {
            this.windowStartTime = windowStartTime;
            this.count = new AtomicInteger(1);
        }

        public long getWindowStartTime() {
            return windowStartTime;
        }

        public AtomicInteger getCount() {
            return count;
        }
    }

    private final ConcurrentHashMap<String, RequestCounter> requestCounts = new ConcurrentHashMap<>();

    /**
     * Verifica si una petición para una clave específica (IP + Endpoint) está permitida dentro del límite.
     *
     * @param key Identificador único (ej: "CHATBOT:192.168.1.1")
     * @param maxRequests Máximo número de peticiones permitidas en la ventana
     * @param windowMillis Duración de la ventana en milisegundos (ej: 60000ms = 1 minuto)
     * @return true si la petición es permitida, false si excedió el límite
     */
    public boolean isAllowed(String key, int maxRequests, long windowMillis) {
        long now = System.currentTimeMillis();

        RequestCounter counter = requestCounts.compute(key, (k, existingCounter) -> {
            if (existingCounter == null || (now - existingCounter.getWindowStartTime()) > windowMillis) {
                return new RequestCounter(now);
            }
            existingCounter.getCount().incrementAndGet();
            return existingCounter;
        });

        return counter.getCount().get() <= maxRequests;
    }

    /**
     * Calcula cuántos segundos faltan para que se reinicie la ventana de límite.
     */
    public long getSecondsUntilReset(String key, long windowMillis) {
        RequestCounter counter = requestCounts.get(key);
        if (counter == null) {
            return 0;
        }
        long now = System.currentTimeMillis();
        long elapsed = now - counter.getWindowStartTime();
        long remaining = windowMillis - elapsed;
        return remaining > 0 ? (remaining / 1000) + 1 : 0;
    }

    /**
     * Limpieza automática en memoria cada 3 minutos para evitar acumulación de IPs antiguas.
     */
    @Scheduled(fixedRate = 180000)
    public void cleanExpiredEntries() {
        long now = System.currentTimeMillis();
        // Eliminar registros de más de 5 minutos de inactividad
        requestCounts.entrySet().removeIf(entry -> (now - entry.getValue().getWindowStartTime()) > 300000);
    }
}
