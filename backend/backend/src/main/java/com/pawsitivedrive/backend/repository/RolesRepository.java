// File: com.pawsitivedrive.backend.repository.RolesRepository.java

package com.pawsitivedrive.backend.repository;

import com.pawsitivedrive.backend.entity.Roles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // <-- IMPORTANT: NEW IMPORT
import java.util.Optional;

public interface RolesRepository extends JpaRepository<Roles, Long> {

    // THIS IS THE LINE THAT MUST BE CHANGED/ADDED TO FIX YOUR ERROR:
    @Query("SELECT r FROM Roles r WHERE LOWER(r.role_name) = LOWER(:roleName)")
    Optional<Roles> findByRoleNameIgnoreCase(String roleName);
}