package com.insteip.backend.security;

import com.insteip.backend.entity.LoginAuditoria;
import com.insteip.backend.entity.Usuario;
import com.insteip.backend.repository.LoginAuditoriaRepository;
import com.insteip.backend.repository.UsuarioRepository;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final LoginAuditoriaRepository loginAuditoriaRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
        } else {
            jwt = request.getParameter("token");
        }

        if (jwt == null) {
            filterChain.doFilter(request, response);
            return;
        }
        try {
            final String userEmail = jwtService.extractUsername(jwt);

            // Si el usuario no está ya autenticado en el contexto actual
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    // Registrar autenticación en Spring Security
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (ExpiredJwtException e) {
            String ip = getClientIp(request);
            String userAgent = request.getHeader("User-Agent");
            String claimsEmail = e.getClaims().getSubject();
            
            Usuario usuario = null;
            if (claimsEmail != null) {
                usuario = usuarioRepository.findByCorreo(claimsEmail).orElse(null);
            }

            LoginAuditoria audit = LoginAuditoria.builder()
                    .usuario(usuario)
                    .correo(claimsEmail)
                    .ip(ip)
                    .userAgent(userAgent)
                    .exitoso(false)
                    .motivo("Token expirado")
                    .fecha(LocalDateTime.now())
                    .build();
            loginAuditoriaRepository.save(audit);
        } catch (Exception e) {
            String ip = getClientIp(request);
            String userAgent = request.getHeader("User-Agent");
            LoginAuditoria audit = LoginAuditoria.builder()
                    .ip(ip)
                    .userAgent(userAgent)
                    .exitoso(false)
                    .motivo("JWT inválido o dañado")
                    .fecha(LocalDateTime.now())
                    .build();
            loginAuditoriaRepository.save(audit);
        }
        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
