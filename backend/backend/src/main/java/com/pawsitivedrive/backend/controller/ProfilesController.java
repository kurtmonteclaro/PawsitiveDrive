package com.pawsitivedrive.backend.controller;

import com.pawsitivedrive.backend.entity.Profiles;
import com.pawsitivedrive.backend.repository.ProfilesRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/profiles")
public class ProfilesController {

	private final ProfilesRepository profilesRepository;

	public ProfilesController(ProfilesRepository profilesRepository) {
		this.profilesRepository = profilesRepository;
	}

	@GetMapping
	public List<Profiles> list() {
		return profilesRepository.findAll();
	}

	@GetMapping("/{id}")
	public ResponseEntity<Profiles> get(@PathVariable Long id) {
		return profilesRepository.findById(id)
			.map(ResponseEntity::ok)
			.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
	public ResponseEntity<Profiles> create(@RequestBody Profiles profile) {
		Profiles saved = profilesRepository.save(profile);
		return ResponseEntity.created(URI.create("/api/profiles/" + saved.getProfile_id())).body(saved);
	}
}


