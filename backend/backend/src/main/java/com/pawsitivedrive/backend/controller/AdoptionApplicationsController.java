package com.pawsitivedrive.backend.controller;

import com.pawsitivedrive.backend.entity.AdoptionApplications;
import com.pawsitivedrive.backend.entity.Pets;
import com.pawsitivedrive.backend.entity.Users;
import com.pawsitivedrive.backend.repository.AdoptionApplicationsRepository;
import com.pawsitivedrive.backend.repository.PetsRepository;
import com.pawsitivedrive.backend.repository.UsersRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class AdoptionApplicationsController {

	private final AdoptionApplicationsRepository repository;
	private final PetsRepository petsRepository;
	private final UsersRepository usersRepository;

	public AdoptionApplicationsController(
			AdoptionApplicationsRepository repository,
			PetsRepository petsRepository,
			UsersRepository usersRepository) {
		this.repository = repository;
		this.petsRepository = petsRepository;
		this.usersRepository = usersRepository;
	}

	@GetMapping
	public List<AdoptionApplications> list() {
		return repository.findAll();
	}

	@GetMapping("/user/{userId}")
	public List<AdoptionApplications> getByUser(@PathVariable Long userId) {
		Users user = usersRepository.findById(userId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		return repository.findByUser(user);
	}

	@GetMapping("/{id}")
	public ResponseEntity<AdoptionApplications> get(@PathVariable Long id) {
		return repository.findById(id)
			.map(ResponseEntity::ok)
			.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
	public ResponseEntity<AdoptionApplications> create(@RequestBody Map<String, Object> request) {
		try {
			// Extract pet and user from request
			Map<String, Object> petMap = (Map<String, Object>) request.get("pet");
			Map<String, Object> userMap = (Map<String, Object>) request.get("user");
			
			if (petMap == null || userMap == null) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pet and user are required");
			}
			
			// Get pet_id and user_id
			Long petId = null;
			Long userId = null;
			
			// Try different possible field names for IDs
			if (petMap.get("pet_id") != null) {
				petId = Long.valueOf(petMap.get("pet_id").toString());
			} else if (petMap.get("id") != null) {
				petId = Long.valueOf(petMap.get("id").toString());
			}
			
			if (userMap.get("user_id") != null) {
				userId = Long.valueOf(userMap.get("user_id").toString());
			} else if (userMap.get("id") != null) {
				userId = Long.valueOf(userMap.get("id").toString());
			}
			
			if (petId == null || userId == null) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pet ID and User ID are required");
			}
			
			// Fetch entities from database
			Pets pet = petsRepository.findById(petId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet not found"));
			
			Users user = usersRepository.findById(userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
			
			// Create new application
			AdoptionApplications app = new AdoptionApplications();
			app.setPet(pet);
			app.setUser(user);
			app.setStatus(request.get("status") != null ? request.get("status").toString() : "Pending");
			
			AdoptionApplications saved = repository.save(app);
			return ResponseEntity.created(URI.create("/api/applications/" + saved.getApplication_id())).body(saved);
		} catch (ResponseStatusException e) {
			throw e;
		} catch (Exception e) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to create application: " + e.getMessage());
		}
	}

	@PutMapping("/{id}")
	public ResponseEntity<AdoptionApplications> updateStatus(
			@PathVariable Long id,
			@RequestBody Map<String, Object> request) {
		AdoptionApplications app = repository.findById(id)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
		
		// Update status
		if (request.get("status") != null) {
			String status = request.get("status").toString();
			app.setStatus(status);
			
			// If approved, update pet status to Adopted
			if ("Approved".equalsIgnoreCase(status)) {
				Pets pet = app.getPet();
				pet.setStatus("Adopted");
				petsRepository.save(pet);
			}
		}
		
		// Update reviewed_by if provided
		if (request.get("reviewed_by") != null) {
			Long reviewerId = Long.valueOf(request.get("reviewed_by").toString());
			Users reviewer = usersRepository.findById(reviewerId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reviewer not found"));
			app.setReviewedBy(reviewer);
		}
		
		AdoptionApplications updated = repository.save(app);
		return ResponseEntity.ok(updated);
	}
}


