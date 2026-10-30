package com.hometutorfinder.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    OpenAPI openAPI() {
        return new OpenAPI().info(new Info()
                .title("Home Tutor Finder API")
                .version("1.0.0")
                .description("Call POST /api/auth/login first. The server sets an HttpOnly cookie (htf_token) that the browser "
                        + "sends automatically to all other endpoints, including from Swagger UI. 401 = not signed in, 403 = wrong role/owner."));
    }
}
