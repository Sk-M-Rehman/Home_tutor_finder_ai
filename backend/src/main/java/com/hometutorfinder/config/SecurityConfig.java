package com.hometutorfinder.config;

import com.hometutorfinder.repository.UserRepository;
import com.hometutorfinder.security.JwtAuthenticationFilter;
import com.hometutorfinder.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Stateless JWT security. The JWT is carried in a Secure/HttpOnly/SameSite=Lax cookie (or an Authorization header).
 * CSRF tokens are disabled because: no server session exists, the cookie is SameSite=Lax (not sent on cross-site
 * POST/PUT/PATCH/DELETE), CORS only allows the configured frontend origin, and all state-changing endpoints require JSON.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration c) throws Exception {
        return c.getAuthenticationManager();
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, JwtService jwt, UserRepository users) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(e -> e
                .authenticationEntryPoint((req, res, ex) -> json(res, 401, "Authentication required"))
                .accessDeniedHandler((req, res, ex) -> json(res, 403, "You do not have permission to perform this action")))
            .authorizeHttpRequests(a -> a
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/logout").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/ai/chat").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/api/tutors/me", "/api/tutors/me/**").hasRole("TUTOR")
                .requestMatchers(HttpMethod.GET, "/api/subjects", "/api/tutors", "/api/tutors/featured",
                        "/api/tutors/*", "/api/tutors/*/availability").permitAll()
                .requestMatchers("/api/students/me", "/api/students/me/**").hasRole("STUDENT")
                .requestMatchers(HttpMethod.POST, "/api/requests").hasRole("STUDENT")
                .requestMatchers(HttpMethod.POST, "/api/requests/*/payment/order", "/api/requests/*/payment/verify").hasRole("STUDENT")
                .requestMatchers("/api/requests/student/me").hasRole("STUDENT")
                .requestMatchers("/api/requests/tutor/me").hasRole("TUTOR")
                .requestMatchers(HttpMethod.PATCH, "/api/requests/*/status").hasRole("TUTOR")
                .requestMatchers(HttpMethod.PATCH, "/api/requests/*/cancel").hasRole("STUDENT")
                .anyRequest().authenticated())
            .addFilterBefore(new JwtAuthenticationFilter(jwt, users), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(@Value("${app.cors.allowed-origin}") String origin) {
        CorsConfiguration c = new CorsConfiguration();
        c.setAllowedOrigins(List.of(origin));
        c.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        c.setAllowedHeaders(List.of("Content-Type", "Authorization", "Accept"));
        c.setAllowCredentials(true);
        c.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", c);
        return src;
    }

    private static void json(jakarta.servlet.http.HttpServletResponse res, int status, String msg) throws java.io.IOException {
        res.setStatus(status);
        res.setContentType("application/json");
        res.getWriter().write("{\"status\":" + status + ",\"message\":\"" + msg + "\"}");
    }
}
