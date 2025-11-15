package com.pawsitivedrive.backend.controller;

import com.pawsitivedrive.backend.entity.Roles;
import com.pawsitivedrive.backend.entity.Users;
import com.pawsitivedrive.backend.repository.RolesRepository;
import com.pawsitivedrive.backend.repository.UsersRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

	private final UsersRepository usersRepository;
	private final RolesRepository rolesRepository;

	public AuthController(UsersRepository usersRepository, RolesRepository rolesRepository) {
		this.usersRepository = usersRepository;
		this.rolesRepository = rolesRepository;
	}

	@PostMapping("/signup")
	public ResponseEntity<?> signup(@RequestBody Map<String, String> body) {
		try {
			System.out.println("Signup request received: " + body);
			
			String name = body.getOrDefault("name", "").trim();
			String email = body.getOrDefault("email", "").trim().toLowerCase();
			String password = body.getOrDefault("password", "");
			String roleName = body.getOrDefault("role", "Donor");

			// Validate input
			if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
				System.out.println("Validation failed: Missing fields");
				return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body(createErrorResponse("Missing required fields: name, email, and password are required"));
			}

			// Check if email already exists
			if (usersRepository.findByEmail(email).isPresent()) {
				System.out.println("Email already exists: " + email);
				return ResponseEntity.status(HttpStatus.CONFLICT)
					.body(createErrorResponse("Email already registered"));
			}

			// Find or create role
			Optional<Roles> roleOpt = rolesRepository.findByRole_nameIgnoreCase(roleName);
			if (roleOpt.isEmpty()) {
				System.out.println("Role not found: " + roleName + ", creating it...");
				// Create the role if it doesn't exist
				Roles newRole = new Roles();
				newRole.setRole_name(roleName);
				Roles savedRole = rolesRepository.save(newRole);
				roleOpt = Optional.of(savedRole);
				System.out.println("Created role: " + roleName);
			}

			// Create user
			Users user = new Users();
			user.setName(name);
			user.setEmail(email);
			user.setPassword(password);
			user.setRole(roleOpt.get());
			user.setStatus("active");
			
			Users saved = usersRepository.save(user);
			System.out.println("User created successfully: " + saved.getUser_id());
			
			return ResponseEntity.status(HttpStatus.CREATED).body(saved);
			
		} catch (Exception e) {
			System.err.println("Error during signup: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(createErrorResponse("Registration failed: " + e.getMessage()));
		}
	}

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
		try {
			System.out.println("Login request received for: " + body.get("email"));
			
			String email = body.getOrDefault("email", "").trim().toLowerCase();
			String password = body.getOrDefault("password", "");

			if (email.isEmpty() || password.isEmpty()) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST)
					.body(createErrorResponse("Email and password are required"));
			}

			Optional<Users> userOpt = usersRepository.findByEmail(email);
			if (userOpt.isEmpty()) {
				System.out.println("User not found: " + email);
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(createErrorResponse("Invalid email or password"));
			}

			Users user = userOpt.get();
			if (!password.equals(user.getPassword())) {
				System.out.println("Invalid password for: " + email);
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
					.body(createErrorResponse("Invalid email or password"));
			}

			System.out.println("Login successful for: " + email);
			return ResponseEntity.ok(user);
			
		} catch (Exception e) {
			System.err.println("Error during login: " + e.getMessage());
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(createErrorResponse("Login failed: " + e.getMessage()));
		}
	}

	private Map<String, String> createErrorResponse(String message) {
		Map<String, String> error = new HashMap<>();
		error.put("message", message);
		return error;
	}
}


