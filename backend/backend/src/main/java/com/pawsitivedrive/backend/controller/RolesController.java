package com.pawsitivedrive.backend.controller;

import com.pawsitivedrive.backend.entity.Roles;
import com.pawsitivedrive.backend.repository.RolesRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RolesController {

	private final RolesRepository rolesRepository;

	public RolesController(RolesRepository rolesRepository) {
		this.rolesRepository = rolesRepository;
	}

	@GetMapping
	public List<Roles> list() {
		return rolesRepository.findAll();
	}

	@PostMapping
	public ResponseEntity<Roles> create(@RequestBody Roles role) {
		Roles saved = rolesRepository.save(role);
		return ResponseEntity.created(URI.create("/api/roles/" + saved.getRole_id())).body(saved);
	}
}


