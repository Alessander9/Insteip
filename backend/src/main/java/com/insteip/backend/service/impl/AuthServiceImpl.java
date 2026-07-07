package com.insteip.backend.service.impl;

import com.insteip.backend.dto.LoginRequest;
import com.insteip.backend.dto.LoginResponse;
import com.insteip.backend.dto.UserProfileResponse;
import com.insteip.backend.dto.TokenRefreshRequest;
import com.insteip.backend.dto.TokenRefreshResponse;
import com.insteip.backend.dto.LogoutRequest;
import com.insteip.backend.entity.Usuario;
import com.insteip.backend.entity.LoginAuditoria;
import com.insteip.backend.entity.RefreshToken;
import com.insteip.backend.exception.BadRequestException;
import com.insteip.backend.exception.ResourceNotFoundException;
import com.insteip.backend.repository.UsuarioRepository;
import com.insteip.backend.repository.LoginAuditoriaRepository;
import com.insteip.backend.repository.RefreshTokenRepository;
import com.insteip.backend.security.JwtService;
import com.insteip.backend.service.interfaces.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final LoginAuditoriaRepository loginAuditoriaRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final HttpServletRequest httpServletRequest;
    private final Optional<org.springframework.mail.javamail.JavaMailSender> mailSender;

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        String ip = getClientIp(httpServletRequest);
        String userAgent = httpServletRequest.getHeader("User-Agent");
        
        Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(request.getCorreo());
        
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            if (usuario.getBloqueadoHasta() != null && usuario.getBloqueadoHasta().isAfter(LocalDateTime.now())) {
                String msg = "Su cuenta ha sido bloqueada temporalmente por múltiples intentos fallidos. Intente nuevamente más tarde.";
                logLoginFailure(usuario, request.getCorreo(), ip, userAgent, msg);
                throw new BadRequestException(msg);
            }
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getCorreo(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();
                int attempts = usuario.getIntentosFallidos() != null ? usuario.getIntentosFallidos() + 1 : 1;
                usuario.setIntentosFallidos(attempts);
                String motivo = "Credenciales inválidas";
                String responseMessage = "Credenciales inválidas";
                if (attempts >= 5) {
                    usuario.setBloqueadoHasta(LocalDateTime.now().plusMinutes(15));
                    motivo = "Bloqueo por superar el límite de intentos fallidos (5)";
                    responseMessage = "Su cuenta ha sido bloqueada temporalmente por múltiples intentos fallidos. Intente nuevamente más tarde.";
                }
                usuarioRepository.save(usuario);
                logLoginFailure(usuario, request.getCorreo(), ip, userAgent, motivo);
                throw new BadRequestException(responseMessage);
            } else {
                logLoginFailure(null, request.getCorreo(), ip, userAgent, "Usuario no encontrado");
            }
            throw new BadRequestException("Credenciales inválidas");
        }

        Usuario usuario = usuarioOpt.get();

        if (usuario.getEstado() != null && !usuario.getEstado()) {
            logLoginFailure(usuario, request.getCorreo(), ip, userAgent, "La cuenta de usuario está inactiva");
            throw new BadRequestException("La cuenta de usuario está inactiva");
        }

        // Reset attempts
        usuario.setIntentosFallidos(0);
        usuario.setBloqueadoHasta(null);
        usuarioRepository.save(usuario);

        // Audit success
        LoginAuditoria audit = LoginAuditoria.builder()
                .usuario(usuario)
                .correo(usuario.getCorreo())
                .ip(ip)
                .userAgent(userAgent)
                .exitoso(true)
                .build();
        loginAuditoriaRepository.save(audit);

        // Generate Access Token (JWT)
        String token = jwtService.generateToken(usuario.getId(), usuario.getCorreo(), usuario.getRol().getNombre());

        // Generate Refresh Token
        String refreshTokenStr = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .usuario(usuario)
                .token(refreshTokenStr)
                .expiracion(LocalDateTime.now().plusDays(7)) // Valid for 7 days
                .activo(true)
                .build();
        refreshTokenRepository.save(refreshToken);

        return LoginResponse.builder()
                .token(token)
                .refreshToken(refreshTokenStr)
                .nombres(usuario.getNombres())
                .apellidos(usuario.getApellidos())
                .rol(usuario.getRol().getNombre())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        return UserProfileResponse.builder()
                .id(usuario.getId())
                .nombres(usuario.getNombres())
                .apellidos(usuario.getApellidos())
                .correo(usuario.getCorreo())
                .rol(usuario.getRol().getNombre())
                .nivelSuscripcion(usuario.getNivelSuscripcion() != null ? usuario.getNivelSuscripcion().getNombre() : "NINGUNO")
                .build();
    }

    @Override
    @Transactional
    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        String tokenStr = request.getRefreshToken();
        String ip = getClientIp(httpServletRequest);
        String userAgent = httpServletRequest.getHeader("User-Agent");
        RefreshToken refreshTokenEntity = refreshTokenRepository.findByToken(tokenStr)
                .orElseGet(() -> {
                    logLoginFailure(null, null, ip, userAgent, "Refresh token inválido");
                    throw new BadRequestException("Refresh token inválido o no encontrado");
                });

        if (!refreshTokenEntity.getActivo()) {
            Usuario usuario = refreshTokenEntity.getUsuario();
            logLoginFailure(usuario, usuario != null ? usuario.getCorreo() : null, ip, userAgent, "Refresh token inactivo");
            throw new BadRequestException("Refresh token inactivo");
        }

        if (refreshTokenEntity.getExpiracion().isBefore(LocalDateTime.now())) {
            Usuario usuario = refreshTokenEntity.getUsuario();
            logLoginFailure(usuario, usuario != null ? usuario.getCorreo() : null, ip, userAgent, "Token expirado");
            throw new BadRequestException("Refresh token expirado. Por favor, inicie sesión nuevamente.");
        }

        Usuario usuario = refreshTokenEntity.getUsuario();
        if (usuario.getEstado() != null && !usuario.getEstado()) {
            logLoginFailure(usuario, usuario.getCorreo(), ip, userAgent, "La cuenta de usuario está inactiva");
            throw new BadRequestException("La cuenta de usuario está inactiva");
        }

        // Generate new access token
        String newAccessToken = jwtService.generateToken(usuario.getId(), usuario.getCorreo(), usuario.getRol().getNombre());

        // Rotate refresh token
        refreshTokenRepository.delete(refreshTokenEntity);

        String newRefreshTokenStr = UUID.randomUUID().toString();
        RefreshToken newRefreshTokenEntity = RefreshToken.builder()
                .usuario(usuario)
                .token(newRefreshTokenStr)
                .expiracion(LocalDateTime.now().plusDays(7))
                .activo(true)
                .build();
        refreshTokenRepository.save(newRefreshTokenEntity);

        return TokenRefreshResponse.builder()
                .token(newAccessToken)
                .refreshToken(newRefreshTokenStr)
                .build();
    }

    @Override
    @Transactional
    public void logout(LogoutRequest request) {
        refreshTokenRepository.findByToken(request.getRefreshToken()).ifPresent(refreshToken -> {
            refreshToken.setActivo(false);
            refreshTokenRepository.save(refreshToken);
        });
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    private void logLoginFailure(Usuario usuario, String correo, String ip, String userAgent, String motivo) {
        if (usuario == null) {
            usuario = usuarioRepository.findById(1L).orElse(null);
        }
        LoginAuditoria audit = LoginAuditoria.builder()
                .usuario(usuario)
                .correo(correo)
                .ip(ip)
                .userAgent(userAgent)
                .exitoso(false)
                .motivo(motivo)
                .build();
        loginAuditoriaRepository.save(audit);
    }

    @Override
    @Transactional
    public void forgotPassword(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con correo: " + correo));

        String token = String.format("%06d", new java.util.Random().nextInt(1000000));
        usuario.setPasswordResetToken(token);
        usuario.setPasswordResetTokenExpira(LocalDateTime.now().plusMinutes(15));
        usuarioRepository.save(usuario);

        System.out.println("==================================================");
        System.out.println("RECUPERACIÓN DE CONTRASEÑA MOCK:");
        System.out.println("Usuario: " + correo);
        System.out.println("Token temporal de 15 min: " + token);
        System.out.println("==================================================");

        mailSender.ifPresent(sender -> {
            try {
                org.springframework.mail.SimpleMailMessage message = new org.springframework.mail.SimpleMailMessage();
                message.setTo(correo);
                message.setSubject("Recuperación de contraseña - INSTEIP");
                message.setText("Hola " + usuario.getNombres() + ",\n\n" +
                        "Has solicitado restablecer tu contraseña. Utiliza el siguiente código temporal válido por 15 minutos:\n\n" +
                        "CÓDIGO: " + token + "\n\n" +
                        "Si no solicitaste esto, puedes ignorar este mensaje.\n\n" +
                        "Saludos,\nEquipo INSTEIP");
                sender.send(message);
            } catch (Exception e) {
                System.err.println("No se pudo enviar el correo de recuperación real (SMTP no configurado). Error: " + e.getMessage());
            }
        });
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        Usuario usuario = usuarioRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new BadRequestException("El token de recuperación no es válido o ya fue utilizado."));

        if (usuario.getPasswordResetTokenExpira() == null || usuario.getPasswordResetTokenExpira().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("El token de recuperación ha expirado.");
        }

        usuario.setPasswordHash(passwordEncoder.encode(newPassword));
        usuario.setPasswordResetToken(null);
        usuario.setPasswordResetTokenExpira(null);
        usuario.setIntentosFallidos(0);
        usuario.setBloqueadoHasta(null);
        usuarioRepository.save(usuario);
    }
}
