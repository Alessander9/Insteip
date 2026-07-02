package com.insteip.backend.controller;

import com.insteip.backend.dto.LoginRequest;
import com.insteip.backend.dto.LoginResponse;
import com.insteip.backend.dto.LogoutRequest;
import com.insteip.backend.dto.ForgotPasswordRequest;
import com.insteip.backend.dto.ResetPasswordRequest;
import com.insteip.backend.dto.UserProfileResponse;
import com.insteip.backend.service.interfaces.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<com.insteip.backend.dto.TokenRefreshResponse> refreshToken(@Valid @RequestBody com.insteip.backend.dto.TokenRefreshRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody LogoutRequest request) {
        authService.logout(request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        String correo = authentication.getName();
        return ResponseEntity.ok(authService.getProfile(correo));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<java.util.Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getCorreo());
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("mensaje", "Si el correo está registrado, recibirás un código de recuperación.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<java.util.Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("mensaje", "Contraseña restablecida exitosamente.");
        return ResponseEntity.ok(response);
    }
}
