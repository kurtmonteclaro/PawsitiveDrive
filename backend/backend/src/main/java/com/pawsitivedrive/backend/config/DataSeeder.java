package com.pawsitivedrive.backend.config;

import com.pawsitivedrive.backend.entity.Roles;
import com.pawsitivedrive.backend.repository.RolesRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

/**
 * Ensures critical data (like application roles) are present in the database on startup.
 * This prevents the "Invalid role" error during the first user signup by guaranteeing 
 * that the "Donor" and "Admin" roles are available for lookup.
 */
@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner initDatabase(RolesRepository rolesRepository) {
        return args -> {
            // These are the exact role names expected by your frontend (Signup.jsx)
            List<String> requiredRoles = Arrays.asList("Donor", "Admin");

            System.out.println("Starting database role seeding...");

            requiredRoles.forEach(roleName -> {
                // Check if the role already exists using the case-insensitive repository method
                if (rolesRepository.findByRoleNameIgnoreCase(roleName).isEmpty()) {
                    Roles newRole = new Roles();
                    newRole.setRole_name(roleName);
                    rolesRepository.save(newRole);
                    System.out.println("-> Successfully seeded required role: " + roleName);
                } else {
                    System.out.println("-> Role already exists: " + roleName);
                }
            });
            
            System.out.println("Database role seeding complete.");
        };
    }
}