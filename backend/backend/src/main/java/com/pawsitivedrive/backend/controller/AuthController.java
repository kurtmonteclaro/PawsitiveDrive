package com.pawsitivedrive.backend.controller;

import com.pawsitivedrive.backend.entity.Roles;
import com.pawsitivedrive.backend.entity.Users;
import com.pawsitivedrive.backend.repository.RolesRepository;
import com.pawsitivedrive.backend.repository.UsersRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final UsersRepository usersRepository;
	private final RolesRepository rolesRepository;

	public AuthController(UsersRepository usersRepository, RolesRepository rolesRepository) {
		this.usersRepository = usersRepository;
		this.rolesRepository = rolesRepository;
	}

	@PostMapping("/signup")
	public ResponseEntity<?> signup(@RequestBody Map<String, String> body) {
		String name = body.getOrDefault("name", "").trim();
		String email = body.getOrDefault("email", "").trim().toLowerCase();
		String password = body.getOrDefault("password", "");
		String roleName = body.getOrDefault("role", "Donor");

		if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Missing fields"));
		}
		if (usersRepository.findByEmail(email).isPresent()) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email already registered"));
		}
		Optional<Roles> roleOpt = rolesRepository.findByRole_nameIgnoreCase(roleName);
		if (roleOpt.isEmpty()) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid role"));
		}
		Users user = new Users();
		user.setName(name);
		user.setEmail(email);
		user.setPassword(password); // NOTE: For demo only; hash in production
		user.setRole(roleOpt.get());
		user.setStatus("active");
		Users saved = usersRepository.save(user);
		return ResponseEntity.status(HttpStatus.CREATED).body(saved);
	}

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
		String email = body.getOrDefault("email", "").trim().toLowerCase();
		String password = body.getOrDefault("password", "");
		Optional<Users> user = usersRepository.findByEmail(email);
		if (user.isEmpty() || !password.equals(user.get().getPassword())) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
		}
		return ResponseEntity.ok(user.get());
	}
}


