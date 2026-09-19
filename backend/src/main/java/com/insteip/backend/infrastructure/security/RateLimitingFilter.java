package com.insteip.backend.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimiterService rateLimiterService;

    // Configuración de límites por ventana de 60 segundos (1 minuto)
    private static final long ONE_MINUTE_MILLIS = 60_000L;
    private static final int MAX_CHATBOT_REQUESTS = 15;        // 15 peticiones/min para el Chatbot
    private static final int MAX_LOGIN_REQUESTS = 5;           // 5 intentos/min para Login (anti fuerza bruta)
    private static final int MAX_PASSWORD_RESET_REQUESTS = 5;  // 5 peticiones/min para recuperación
    private static final int MAX_CERT_VALIDATE_REQUESTS = 30;  // 30 consultas/min para validación pública

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // Ignorar peticiones preflight CORS (OPTIONS)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String uri = request.getRequestURI();
        String clientIp = extractClientIp(request);

        String limitCategory = null;
        int maxAllowed = 0;

        if (uri.startsWith("/api/chatbot")) {
            limitCategory = "CHATBOT";
            maxAllowed = MAX_CHATBOT_REQUESTS;
        } else if (uri.equals("/api/auth/login")) {
            limitCategory = "LOGIN";
            maxAllowed = MAX_LOGIN_REQUESTS;
        } else if (uri.equals("/api/auth/forgot-password") || uri.equals("/api/auth/reset-password")) {
            limitCategory = "RESET_PASSWORD";
            maxAllowed = MAX_PASSWORD_RESET_REQUESTS;
        } else if (uri.startsWith("/api/certificados/validar")) {
            limitCategory = "CERT_VALIDATE";
            maxAllowed = MAX_CERT_VALIDATE_REQUESTS;
        }

        if (limitCategory != null) {
            String rateKey = limitCategory + ":" + clientIp;
            boolean allowed = rateLimiterService.isAllowed(rateKey, maxAllowed, ONE_MINUTE_MILLIS);

            if (!allowed) {
                long retryAfterSeconds = rateLimiterService.getSecondsUntilReset(rateKey, ONE_MINUTE_MILLIS);
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json;charset=UTF-8");
                response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));

                String jsonResponse = String.format(
                        "{\"status\":429,\"error\":\"Demasiadas peticiones\",\"message\":\"Has superado el límite permitido para esta acción. Por favor espera %d segundos antes de reintentar.\"}",
                        retryAfterSeconds
                );
                response.getWriter().write(jsonResponse);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractClientIp(HttpServletRequest request) {
        // Soporte para Cloudflare
        String cfIp = request.getHeader("CF-Connecting-IP");
        if (cfIp != null && !cfIp.isBlank()) {
            return cfIp.trim();
        }

        // Soporte para Proxy / Nginx
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isBlank()) {
            return xfHeader.split(",")[0].trim();
        }

        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }

        return request.getRemoteAddr();
    }
}
