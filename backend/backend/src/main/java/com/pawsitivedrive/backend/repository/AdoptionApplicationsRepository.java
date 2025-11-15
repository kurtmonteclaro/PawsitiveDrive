package com.pawsitivedrive.backend.repository;

import com.pawsitivedrive.backend.entity.AdoptionApplications;
import com.pawsitivedrive.backend.entity.Pets;
import com.pawsitivedrive.backend.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AdoptionApplicationsRepository extends JpaRepository<AdoptionApplications, Long> {
	List<AdoptionApplications> findByPet(Pets pet);
	List<AdoptionApplications> findByUser(Users user);
}


