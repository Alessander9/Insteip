package com.insteip.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TokenRefreshRequest {
    @NotBlank(message = "El refresh token es obligatorio")
    private String refreshToken;
}
