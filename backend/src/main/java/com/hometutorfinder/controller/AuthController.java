package com.hometutorfinder.controller;

import com.hometutorfinder.dto.Dtos.*;
import com.hometutorfinder.entity.User;
import com.hometutorfinder.exception.ApiException;
import com.hometutorfinder.mapper.Mapper;
import com.hometutorfinder.repository.UserRepository;
import com.hometutorfinder.security.CurrentUser;
import com.hometutorfinder.security.JwtService;
import com.hometutorfinder.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthController {
    private final AuthService authService;
    private final JwtService jwt;
    private final AuthenticationManager authManager;
    private final UserRepository users;

    @Value("${app.jwt.cookie-secure}")
    private boolean cookieSecure;

    @Operation(summary = "Register a student or tutor; signs the user in via HttpOnly cookie")
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest r) {
        return signedIn(HttpStatus.CREATED, authService.register(r));
    }

    @Operation(summary = "Sign in with email and password; sets the HttpOnly auth cookie")
    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@Valid @RequestBody LoginRequest r) {
        String email = r.email().trim().toLowerCase();
        try {
            authManager.authenticate(new UsernamePasswordAuthenticationToken(email, r.password()));
        } catch (AuthenticationException e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        User u = users.findByEmailIgnoreCase(email).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        return signedIn(HttpStatus.OK, u);
    }

    @Operation(summary = "Sign out: clears the auth cookie")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, cookie("", Duration.ZERO).toString()).build();
    }

    @Operation(summary = "Current authenticated user")
    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal CurrentUser me) {
        return authService.me(me.id());
    }

    @Operation(summary = "Change password")
    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal CurrentUser me, @Valid @RequestBody ChangePasswordRequest r) {
        authService.changePassword(me.id(), r);
        return ResponseEntity.noContent().build();
    }

    private ResponseEntity<UserResponse> signedIn(HttpStatus status, User u) {
        return ResponseEntity.status(status)
                .header(HttpHeaders.SET_COOKIE, cookie(jwt.generate(u), jwt.lifetime()).toString())
                .body(Mapper.user(u));
    }

    private ResponseCookie cookie(String value, Duration maxAge) {
        return ResponseCookie.from(JwtService.COOKIE_NAME, value)
                .httpOnly(true).secure(cookieSecure).sameSite("Lax").path("/").maxAge(maxAge).build();
    }
}
