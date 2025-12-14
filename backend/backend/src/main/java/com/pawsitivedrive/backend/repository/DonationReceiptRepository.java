package com.pawsitivedrive.backend.repository;

import com.pawsitivedrive.backend.entity.DonationReceipt;
import com.pawsitivedrive.backend.entity.Donations;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DonationReceiptRepository extends JpaRepository<DonationReceipt, Long> {
    Optional<DonationReceipt> findByDonation(Donations donation);
}

