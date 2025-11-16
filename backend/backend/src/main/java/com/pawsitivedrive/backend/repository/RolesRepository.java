package com.pawsitivedrive.backend.repository;

import com.pawsitivedrive.backend.entity.Roles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // Must be imported
import org.springframework.data.repository.query.Param; // Must be imported

import java.util.Optional;

public interface RolesRepository extends JpaRepository<Roles, Long> {
    
    /**
     * FIX: Uses the standard camelCase method name and explicitly defines the JPQL 
     * using @Query to target the snake_case column 'role_name' (r.role_name).
     * This bypasses the automatic property path parsing that was causing the error.
     */
    @Query("SELECT r FROM Roles r WHERE LOWER(r.role_name) = LOWER(:roleName)")
    Optional<Roles> findByRoleNameIgnoreCase(@Param("roleName") String roleName);
}