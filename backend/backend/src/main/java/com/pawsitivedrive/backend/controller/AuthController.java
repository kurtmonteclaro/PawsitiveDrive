// File: com.pawsitivedrive.backend.controller.AuthController.java

package com.pawsitivedrive.backend.controller;

import com.pawsitivedrive.backend.entity.Roles;
import com.pawsitivedrive.backend.entity.Users;
import com.pawsitivedrive.backend.repository.RolesRepository;
import com.pawsitivedrive.backend.repository.UsersRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder; // <-- NEW IMPORT
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController // <-- CRITICAL: Must be a RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsersRepository usersRepository;
    private final RolesRepository rolesRepository;
    private final PasswordEncoder passwordEncoder; // <-- NEW: Inject the encoder

    // Inject PasswordEncoder into the constructor
    public AuthController(UsersRepository usersRepository, RolesRepository rolesRepository, PasswordEncoder passwordEncoder) {
        this.usersRepository = usersRepository;
        this.rolesRepository = rolesRepository;
        this.passwordEncoder = passwordEncoder; // <-- Initialize the encoder
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> body) {
        String name = body.getOrDefault("name", "").trim();
        String email = body.getOrDefault("email", "").trim().toLowerCase();
        String password = body.getOrDefault("password", "");
        String roleName = body.getOrDefault("role", "Donor");
        
        // 👇 CRITICAL FIXES: Extract the new fields from the request body map
        String contactNumber = body.getOrDefault("contact_number", null);
        String address = body.getOrDefault("address", null);

        if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Missing fields"));
        }
        if (usersRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email already registered"));
        }
        
        Optional<Roles> roleOpt = rolesRepository.findByRoleNameIgnoreCase(roleName);
        if (roleOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid role"));
        }
        
        Users user = new Users();
        user.setName(name);
        user.setEmail(email);
        
        // Encode the password before saving
        user.setPassword(passwordEncoder.encode(password)); 
        
        user.setRole(roleOpt.get());
        user.setStatus("active");
        
        // 👇 FIX APPLIED: Set the extracted values (which might be null if not provided, but not hardcoded null)
        user.setContact_number(contactNumber);
        user.setAddress(address);
        
        try {
            Users saved = usersRepository.save(user);
            // Optionally remove the password before sending the response body back
            saved.setPassword(null);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Registration failed due to data constraints."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "An unexpected server error occurred during registration."));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim().toLowerCase();
        String rawPassword = body.getOrDefault("password", "");
        Optional<Users> userOpt = usersRepository.findByEmail(email);

        // <-- CRITICAL FIX: Compare raw password with the hashed password -->
        if (userOpt.isEmpty() || !passwordEncoder.matches(rawPassword, userOpt.get().getPassword())) { 
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
        }
        
        Users user = userOpt.get();
        // Remove password hash before returning the user object
        user.setPassword(null); 
        
        return ResponseEntity.ok(user);
    }
}