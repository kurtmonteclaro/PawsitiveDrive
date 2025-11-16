package com.pawsitivedrive.backend.controller;

import com.pawsitivedrive.backend.entity.Roles;
import com.pawsitivedrive.backend.entity.Users;
import com.pawsitivedrive.backend.repository.RolesRepository;
import com.pawsitivedrive.backend.repository.UsersRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsersRepository usersRepository;
    private final RolesRepository rolesRepository;
    private final PasswordEncoder passwordEncoder;

    // Inject PasswordEncoder into the constructor
    public AuthController(UsersRepository usersRepository, RolesRepository rolesRepository, PasswordEncoder passwordEncoder) {
        this.usersRepository = usersRepository;
        this.rolesRepository = rolesRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> body) {
        String name = body.getOrDefault("name", "").trim();
        String email = body.getOrDefault("email", "").trim().toLowerCase();
        String password = body.getOrDefault("password", "");
        String roleName = body.getOrDefault("role", "Donor");
        
        // Extract new fields using the keys sent by the React frontend
        String address = body.getOrDefault("address", "").trim();
        String contact = body.getOrDefault("contact", "").trim(); 

        // UPDATED VALIDATION CHECK: Check all six required fields
        if (name.isEmpty() || email.isEmpty() || password.isEmpty() || address.isEmpty() || contact.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "All fields are required."));
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
        
        // CRITICAL: Encode the password before saving
        user.setPassword(passwordEncoder.encode(password)); 
        
        user.setRole(roleOpt.get());
        user.setStatus("active");
        
        // ASSIGNMENT: Map the extracted 'contact' to the entity's 'contact_number'
        user.setContact_number(contact); 
        user.setAddress(address);
        
        try {
            Users saved = usersRepository.save(user);
            // Remove password hash before sending the response body back
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

        // CRITICAL: Compare raw password with the hashed password
        if (userOpt.isEmpty() || !passwordEncoder.matches(rawPassword, userOpt.get().getPassword())) { 
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
        }
        
        Users user = userOpt.get();
        // Remove password hash before returning the user object
        user.setPassword(null); 
        
        return ResponseEntity.ok(user);
    }
}