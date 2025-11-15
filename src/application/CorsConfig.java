package application;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Allows the frontend origin(s) to access /api/** endpoints.
 * Replace the origins with your real frontend domains/ports.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:5173",
                        "http://localhost:3000",
                        "https://your-frontend-domain.com"
                )
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowCredentials(false);
    }
}
