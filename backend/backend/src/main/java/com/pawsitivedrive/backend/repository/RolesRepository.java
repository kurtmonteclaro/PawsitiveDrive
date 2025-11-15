package com.pawsitivedrive.backend.repository;

import com.pawsitivedrive.backend.entity.Roles;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RolesRepository extends JpaRepository<Roles, Long> {
	Optional<Roles> findByRole_nameIgnoreCase(String role_name);
}


