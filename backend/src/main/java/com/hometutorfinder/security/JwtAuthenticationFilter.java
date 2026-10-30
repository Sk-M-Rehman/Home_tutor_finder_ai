package com.hometutorfinder.security;

import com.hometutorfinder.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/** Reads the JWT from the Authorization header or the HttpOnly cookie and authenticates the request. */
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwt;
    private final UserRepository users;

    public JwtAuthenticationFilter(JwtService jwt, UserRepository users) {
        this.jwt = jwt;
        this.users = users;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String token = resolveToken(req);
        if (token != null) {
            try {
                Claims c = jwt.parse(token);
                String email = c.get("email", String.class);
                users.findById(Long.valueOf(c.getSubject()))
                        .filter(u -> u.isEnabled() && u.getEmail().equals(email))
                        .ifPresent(u -> {
                            var auth = new UsernamePasswordAuthenticationToken(
                                    new CurrentUser(u.getId(), u.getEmail(), u.getRole()), null,
                                    List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole().name())));
                            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                            SecurityContextHolder.getContext().setAuthentication(auth);
                        });
            } catch (JwtException | IllegalArgumentException ignored) {
                // invalid/expired token: request stays unauthenticated -> 401 for protected routes
            }
        }
        chain.doFilter(req, res);
    }

    private String resolveToken(HttpServletRequest req) {
        String h = req.getHeader("Authorization");
        if (h != null && h.startsWith("Bearer ")) return h.substring(7);
        if (req.getCookies() != null) {
            for (Cookie c : req.getCookies()) {
                if (JwtService.COOKIE_NAME.equals(c.getName())) return c.getValue();
            }
        }
        return null;
    }
}
