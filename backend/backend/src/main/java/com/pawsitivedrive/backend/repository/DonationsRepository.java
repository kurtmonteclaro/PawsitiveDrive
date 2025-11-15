package com.pawsitivedrive.backend.repository;

import com.pawsitivedrive.backend.entity.Donations;
import com.pawsitivedrive.backend.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DonationsRepository extends JpaRepository<Donations, Long> {
	List<Donations> findByUser(Users user);
}


