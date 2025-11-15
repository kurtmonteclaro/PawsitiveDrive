package com.pawsitivedrive.backend.repository;

import com.pawsitivedrive.backend.entity.DonationHistory;
import com.pawsitivedrive.backend.entity.Donations;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DonationHistoryRepository extends JpaRepository<DonationHistory, Long> {
	List<DonationHistory> findByDonation(Donations donation);
}


