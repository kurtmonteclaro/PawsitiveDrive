package com.pawsitivedrive.backend.controller;

import com.pawsitivedrive.backend.entity.AdoptionApplications;
import com.pawsitivedrive.backend.repository.AdoptionApplicationsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class AdoptionApplicationsController {

	private final AdoptionApplicationsRepository repository;

	public AdoptionApplicationsController(AdoptionApplicationsRepository repository) {
		this.repository = repository;
	}

	@GetMapping
	public List<AdoptionApplications> list() {
		return repository.findAll();
	}

	@GetMapping("/{id}")
	public ResponseEntity<AdoptionApplications> get(@PathVariable Long id) {
		return repository.findById(id)
			.map(ResponseEntity::ok)
			.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
	public ResponseEntity<AdoptionApplications> create(@RequestBody AdoptionApplications app) {
		AdoptionApplications saved = repository.save(app);
		return ResponseEntity.created(URI.create("/api/applications/" + saved.getApplication_id())).body(saved);
	}
}


