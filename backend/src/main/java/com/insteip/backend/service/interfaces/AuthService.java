package com.insteip.backend.service.interfaces;

import com.insteip.backend.dto.LoginRequest;
import com.insteip.backend.dto.LoginResponse;
import com.insteip.backend.dto.LogoutRequest;
import com.insteip.backend.dto.UserProfileResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    UserProfileResponse getProfile(String correo);
    com.insteip.backend.dto.TokenRefreshResponse refreshToken(com.insteip.backend.dto.TokenRefreshRequest request);
    void logout(LogoutRequest request);
    void forgotPassword(String correo);
    void resetPassword(String token, String newPassword);
}
