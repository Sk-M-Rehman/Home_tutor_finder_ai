package com.hometutorfinder.security;

import com.hometutorfinder.entity.Role;

/** Authenticated principal placed in the SecurityContext by the JWT filter. */
public record CurrentUser(Long id, String email, Role role) {}
