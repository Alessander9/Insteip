package com.insteip.backend.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RateLimiterTest {

    private RateLimiterService rateLimiterService;
    private RateLimitingFilter rateLimitingFilter;

    @BeforeEach
    void setUp() {
        rateLimiterService = new RateLimiterService();
        rateLimitingFilter = new RateLimitingFilter(rateLimiterService);
    }

    @Test
    void testServiceAllowsUpToLimit() {
        String key = "TEST:127.0.0.1";
        int limit = 3;
        long window = 10000;

        assertTrue(rateLimiterService.isAllowed(key, limit, window));
        assertTrue(rateLimiterService.isAllowed(key, limit, window));
        assertTrue(rateLimiterService.isAllowed(key, limit, window));
        // 4th request exceeds limit of 3
        assertFalse(rateLimiterService.isAllowed(key, limit, window));
    }

    @Test
    void testChatbotRateLimitingFilterBlocksAfter15Requests() throws ServletException, IOException {
        FilterChain filterChain = mock(FilterChain.class);

        for (int i = 1; i <= 15; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/chatbot");
            request.setRemoteAddr("10.0.0.1");
            MockHttpServletResponse response = new MockHttpServletResponse();

            rateLimitingFilter.doFilter(request, response, filterChain);
            assertEquals(200, response.getStatus());
        }

        // 16th request should return 429 Too Many Requests
        MockHttpServletRequest blockedRequest = new MockHttpServletRequest("POST", "/api/chatbot");
        blockedRequest.setRemoteAddr("10.0.0.1");
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();

        rateLimitingFilter.doFilter(blockedRequest, blockedResponse, filterChain);
        assertEquals(429, blockedResponse.getStatus());
        assertTrue(blockedResponse.getContentAsString().contains("Demasiadas peticiones"));
        assertNotNull(blockedResponse.getHeader("Retry-After"));
    }

    @Test
    void testLoginRateLimitingFilterBlocksAfter5Requests() throws ServletException, IOException {
        FilterChain filterChain = mock(FilterChain.class);

        for (int i = 1; i <= 5; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
            request.setRemoteAddr("192.168.1.50");
            MockHttpServletResponse response = new MockHttpServletResponse();

            rateLimitingFilter.doFilter(request, response, filterChain);
            assertEquals(200, response.getStatus());
        }

        // 6th login attempt should be blocked with 429
        MockHttpServletRequest blockedRequest = new MockHttpServletRequest("POST", "/api/auth/login");
        blockedRequest.setRemoteAddr("192.168.1.50");
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();

        rateLimitingFilter.doFilter(blockedRequest, blockedResponse, filterChain);
        assertEquals(429, blockedResponse.getStatus());
        assertTrue(blockedResponse.getContentAsString().contains("Demasiadas peticiones"));
    }

    @Test
    void testPreflightOptionsRequestsAreNotLimited() throws ServletException, IOException {
        FilterChain filterChain = mock(FilterChain.class);

        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", "/api/chatbot");
        MockHttpServletResponse response = new MockHttpServletResponse();

        rateLimitingFilter.doFilter(request, response, filterChain);
        verify(filterChain, times(1)).doFilter(request, response);
        assertEquals(200, response.getStatus());
    }

    @Test
    void testCloudflareIpExtraction() throws ServletException, IOException {
        FilterChain filterChain = mock(FilterChain.class);

        for (int i = 1; i <= 5; i++) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
            request.addHeader("CF-Connecting-IP", "203.0.113.195");
            MockHttpServletResponse response = new MockHttpServletResponse();
            rateLimitingFilter.doFilter(request, response, filterChain);
        }

        // 6th request from the same CF-Connecting-IP should be blocked
        MockHttpServletRequest blockedRequest = new MockHttpServletRequest("POST", "/api/auth/login");
        blockedRequest.addHeader("CF-Connecting-IP", "203.0.113.195");
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();
        rateLimitingFilter.doFilter(blockedRequest, blockedResponse, filterChain);

        assertEquals(429, blockedResponse.getStatus());
    }
}
