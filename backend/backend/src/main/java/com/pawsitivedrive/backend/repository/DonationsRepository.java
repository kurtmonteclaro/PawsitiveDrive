package com.pawsitivedrive.backend.repository;

import com.pawsitivedrive.backend.entity.Donations;
import com.pawsitivedrive.backend.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface DonationsRepository extends JpaRepository<Donations, Long> {
	List<Donations> findByUser(Users user);
	
	@Query("SELECT d FROM Donations d LEFT JOIN FETCH d.user LEFT JOIN FETCH d.pet")
	List<Donations> findAllWithRelations();
}


