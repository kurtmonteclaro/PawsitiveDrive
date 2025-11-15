package com.pawsitivedrive.backend.repository;

import com.pawsitivedrive.backend.entity.Roles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface RolesRepository extends JpaRepository<Roles, Long> {
	@Query("SELECT r FROM Roles r WHERE LOWER(r.role_name) = LOWER(:roleName)")
	Optional<Roles> findByRole_nameIgnoreCase(@Param("roleName") String roleName);
}


