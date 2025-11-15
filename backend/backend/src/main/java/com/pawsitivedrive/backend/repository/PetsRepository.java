package com.pawsitivedrive.backend.repository;

import com.pawsitivedrive.backend.entity.Pets;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PetsRepository extends JpaRepository<Pets, Long> {
	List<Pets> findBySpeciesIgnoreCase(String species);
	List<Pets> findByStatusIgnoreCase(String status);
}


