package com.pawsitivedrive.backend.controller;

import com.pawsitivedrive.backend.entity.Donations;
import com.pawsitivedrive.backend.repository.DonationsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/donations")
public class DonationsController {

	private final DonationsRepository donationsRepository;

	public DonationsController(DonationsRepository donationsRepository) {
		this.donationsRepository = donationsRepository;
	}

	@GetMapping
	public List<Donations> list() {
		return donationsRepository.findAll();
	}

	@GetMapping("/{id}")
	public ResponseEntity<Donations> get(@PathVariable Long id) {
		return donationsRepository.findById(id)
			.map(ResponseEntity::ok)
			.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
	public ResponseEntity<Donations> create(@RequestBody Donations donation) {
		Donations saved = donationsRepository.save(donation);
		return ResponseEntity.created(URI.create("/api/donations/" + saved.getDonation_id())).body(saved);
	}
}


