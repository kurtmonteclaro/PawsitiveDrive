package com.pawsitivedrive.backend.controller;

import com.pawsitivedrive.backend.entity.Users;
import com.pawsitivedrive.backend.repository.UsersRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UsersController {

	private final UsersRepository usersRepository;

	public UsersController(UsersRepository usersRepository) {
		this.usersRepository = usersRepository;
	}

	@GetMapping
	public List<Users> list() {
		return usersRepository.findAll();
	}

	@GetMapping("/{id}")
	public ResponseEntity<Users> get(@PathVariable Long id) {
		return usersRepository.findById(id)
			.map(ResponseEntity::ok)
			.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
	public ResponseEntity<Users> create(@RequestBody Users user) {
		Users saved = usersRepository.save(user);
		return ResponseEntity.created(URI.create("/api/users/" + saved.getUser_id())).body(saved);
	}
}


