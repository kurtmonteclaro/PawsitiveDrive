package com.pawsitivedrive.backend.controller;

import com.pawsitivedrive.backend.entity.Donations;
import com.pawsitivedrive.backend.entity.Users;
import com.pawsitivedrive.backend.entity.Pets;
import com.pawsitivedrive.backend.entity.DonationHistory;
import com.pawsitivedrive.backend.entity.DonationReceipt;
import com.pawsitivedrive.backend.repository.DonationsRepository;
import com.pawsitivedrive.backend.repository.UsersRepository;
import com.pawsitivedrive.backend.repository.PetsRepository;
import com.pawsitivedrive.backend.repository.DonationHistoryRepository;
import com.pawsitivedrive.backend.repository.DonationReceiptRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import java.net.URI;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donations")
public class DonationsController {

	private final DonationsRepository donationsRepository;
	private final UsersRepository usersRepository;
	private final PetsRepository petsRepository;
	private final DonationHistoryRepository donationHistoryRepository;
	private final DonationReceiptRepository donationReceiptRepository;

	public DonationsController(
			DonationsRepository donationsRepository, 
			UsersRepository usersRepository,
			PetsRepository petsRepository,
			DonationHistoryRepository donationHistoryRepository,
			DonationReceiptRepository donationReceiptRepository) {
		this.donationsRepository = donationsRepository;
		this.usersRepository = usersRepository;
		this.petsRepository = petsRepository;
		this.donationHistoryRepository = donationHistoryRepository;
		this.donationReceiptRepository = donationReceiptRepository;
	}

	@GetMapping
	public List<Donations> list() {
		return donationsRepository.findAllWithRelations();
	}

	@GetMapping("/user/{userId}")
	public List<Donations> getByUser(@PathVariable Long userId) {
		Users user = usersRepository.findById(userId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		return donationsRepository.findByUser(user);
	}

	@GetMapping("/{id}")
	public ResponseEntity<Donations> get(@PathVariable Long id) {
		return donationsRepository.findById(id)
			.map(ResponseEntity::ok)
			.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
	@Transactional
	public ResponseEntity<Donations> create(@RequestBody Map<String, Object> request) {
		try {
			// Extract user from request
			Map<String, Object> userMap = (Map<String, Object>) request.get("user");
			if (userMap == null) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is required");
			}
			
			Long userId = null;
			if (userMap.get("user_id") != null) {
				userId = Long.valueOf(userMap.get("user_id").toString());
			} else if (userMap.get("id") != null) {
				userId = Long.valueOf(userMap.get("id").toString());
			}
			
			if (userId == null) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID is required");
			}
			
			// Fetch user from database
			Users user = usersRepository.findById(userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
			
			// Create new donation
			Donations donation = new Donations();
			donation.setUser(user);
			donation.setAmount(request.get("amount") != null ? 
				Double.parseDouble(request.get("amount").toString()) : 0.0);
			donation.setPayment_method(request.get("payment_method") != null ? 
				request.get("payment_method").toString() : "Unknown");
			donation.setStatus(request.get("status") != null ? 
				request.get("status").toString() : "Pending");
			
			// Handle pet if provided
			Map<String, Object> petMap = (Map<String, Object>) request.get("pet");
			if (petMap != null) {
				Long petId = null;
				if (petMap.get("pet_id") != null) {
					petId = Long.valueOf(petMap.get("pet_id").toString());
				} else if (petMap.get("id") != null) {
					petId = Long.valueOf(petMap.get("id").toString());
				}
				
				if (petId != null) {
					Pets pet = petsRepository.findById(petId)
						.orElse(null); // Pet is optional, so don't throw error if not found
					donation.setPet(pet);
				}
			}
			
			Donations saved = donationsRepository.save(donation);
			
			// Create donation history entry
			DonationHistory history = new DonationHistory();
			history.setDonation(saved);
			history.setAction("Created");
			history.setAction_date(LocalDateTime.now());
			donationHistoryRepository.save(history);
			
			// Create donation receipt
			DonationReceipt receipt = new DonationReceipt();
			receipt.setDonation(saved);
			// Generate receipt number: REC-{donation_id}-{timestamp}
			String receiptNumber = "REC-" + saved.getDonation_id() + "-" + 
				LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
			receipt.setReceipt_number(receiptNumber);
			receipt.setReceipt_date(LocalDateTime.now());
			receipt.setDonor_name(user.getName());
			receipt.setDonor_email(user.getEmail());
			receipt.setDonor_address(user.getAddress() != null ? user.getAddress() : "");
			receipt.setPayment_method(saved.getPayment_method());
			receipt.setStatus(saved.getStatus());
			receipt.setTransaction_id(receiptNumber); // Use receipt number as transaction ID
			donationReceiptRepository.save(receipt);
			
			return ResponseEntity.created(URI.create("/api/donations/" + saved.getDonation_id())).body(saved);
		} catch (ResponseStatusException e) {
			throw e;
		} catch (Exception e) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
				"Failed to create donation: " + e.getMessage());
		}
	}
}


