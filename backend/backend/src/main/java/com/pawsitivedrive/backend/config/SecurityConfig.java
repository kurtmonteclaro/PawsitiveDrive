// File: com.pawsitivedrive.backend.config.SecurityConfig.java

package com.pawsitivedrive.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; 
import org.springframework.security.crypto.password.PasswordEncoder;     
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Defines the PasswordEncoder (BCrypt) required by AuthController for hashing passwords.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Explicitly enable and apply CORS configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) 
            
            // 2. Disable CSRF (Critical for fixing 403 on POST/PUT/DELETE requests)
            .csrf(AbstractHttpConfigurer::disable)
            
            // 3. Configure request authorization
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/roles/**").permitAll()
                .requestMatchers("/api/pets/**").permitAll()
                .requestMatchers("/api/profiles/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                .anyRequest().authenticated()
            )
            
            // 4. Ensure session management is stateless (standard for REST APIs)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );

        // Disable unnecessary default security features
        http.httpBasic(AbstractHttpConfigurer::disable);
        http.formLogin(AbstractHttpConfigurer::disable);

        return http.build();
    }
    
    /**
     * Defines the CORS policy used by the .cors() method above.
     */
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow the frontend origin
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        // Allow necessary methods, including OPTIONS for CORS pre-flight
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this CORS configuration to all API paths
        source.registerCorsConfiguration("/api/**", configuration); 
        return source;
    }
}