package com.pawsitivedrive.backend.controller;

import com.pawsitivedrive.backend.entity.Pets;
import com.pawsitivedrive.backend.entity.Users;
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
@RequestMapping("/api/pets")
public class PetsController {

    private final PetsRepository petsRepository;
    private final UsersRepository usersRepository;

    public PetsController(PetsRepository petsRepository, UsersRepository usersRepository) {
        this.petsRepository = petsRepository;
        this.usersRepository = usersRepository;
    }

    @GetMapping
    public List<Pets> list(@RequestParam(required = false) String species,
                           @RequestParam(required = false) String status) {
        if (species != null) {
            return petsRepository.findBySpeciesIgnoreCase(species);
        }
        if (status != null) {
            return petsRepository.findByStatusIgnoreCase(status);
        }
        return petsRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pets> get(@PathVariable Long id) {
        return petsRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Helper function to safely extract the user ID from the 'addedBy' field.
     * Fixes: Unchecked cast, Unnecessary temporary.
     */
    @SuppressWarnings("unchecked") // Fixes: Type safety: Unchecked cast
    private Long extractUserId(Map<String, Object> payload) {
        Object addedByObj = payload.get("addedBy");
        
        if (addedByObj == null) {
             throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valid user (addedBy) ID is required.");
        }

        if (addedByObj instanceof Map) {
            // Case 1: 'addedBy' is sent as an object (e.g., {user_id: 1})
            Map<String, Object> userMap = (Map<String, Object>) addedByObj; 
            Object userIdObj = userMap.getOrDefault("user_id", userMap.get("id"));
            
            if (userIdObj instanceof Number) {
                // If it's already a number, convert directly to Long (Fixes "Unnecessary temporary")
                return ((Number) userIdObj).longValue();
            } else if (userIdObj != null) {
                // If it's a String, parse it
                return Long.valueOf(userIdObj.toString());
            }
        } else {
            // Case 2: 'addedBy' is sent as a raw user ID (e.g., 1 or "1")
            if (addedByObj instanceof Number) {
                // If it's a number, convert directly to Long (Fixes "Unnecessary temporary")
                return ((Number) addedByObj).longValue();
            } else {
                // If it's a String, parse it
                return Long.valueOf(addedByObj.toString());
            }
        }
        
        // If map was present but ID was missing or invalid format
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valid user (addedBy) ID is required.");
    }
    
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> payload) {
        try {
            Pets pet = new Pets();
            pet.setName((String) payload.get("name"));
            pet.setSpecies((String) payload.get("species"));
            pet.setBreed((String) payload.get("breed"));
            
            // Safely handle 'age' conversion
            Object ageObj = payload.get("age");
            if (ageObj == null) {
                 return ResponseEntity.badRequest().body(Map.of("message", "Age is required and must be a number."));
            }
            
            // Use Number.intValue() if it's already a number (Fixes "Unboxing possibly null value")
            if (ageObj instanceof Number) {
                pet.setAge(((Number) ageObj).intValue());
            } else {
                // If it's a String (e.g., "2"), parse it
                pet.setAge(Integer.valueOf(ageObj.toString()));
            }

            pet.setGender((String) payload.get("gender"));
            pet.setStatus((String) payload.get("status"));
            pet.setDescription((String) payload.get("description"));
            pet.setImage_url((String) payload.get("image_url"));

            // FIX: The result of extractUserId is assigned to a final variable, resolving the compilation errors.
            final Long userId = extractUserId(payload);
            
            // Fetch the user
            Users addedBy = usersRepository.findById(userId)
                    // The use of 'userId' here is now valid because it is final.
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found for addedBy ID: " + userId));

            pet.setAddedBy(addedBy);
            Pets saved = petsRepository.save(pet);
            return ResponseEntity.created(URI.create("/api/pets/" + saved.getPet_id())).body(saved);
        
        } catch (NumberFormatException e) {
             return ResponseEntity.badRequest().body(Map.of("message", "Invalid number format for ID or Age."));
        } catch (ResponseStatusException e) {
             return ResponseEntity.status(e.getStatusCode()).body(Map.of("message", e.getReason()));
        } catch (ClassCastException e) {
             return ResponseEntity.badRequest().body(Map.of("message", "Invalid data type for one of the fields."));
        } catch (Exception e) {
             // Keep the generic catch-all at the end for robustness
             return ResponseEntity.internalServerError().body(Map.of("message", "An unexpected error occurred: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pets> update(@PathVariable Long id, @RequestBody Pets input) {
        return petsRepository.findById(id).map(existing -> {
            existing.setName(input.getName());
            existing.setSpecies(input.getSpecies());
            existing.setBreed(input.getBreed());
            existing.setAge(input.getAge());
            existing.setGender(input.getGender());
            existing.setStatus(input.getStatus());
            existing.setDescription(input.getDescription());
            existing.setImage_url(input.getImage_url());
            
            if (input.getAddedBy() != null) {
                existing.setAddedBy(input.getAddedBy());
            }
            
            return ResponseEntity.ok(petsRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!petsRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        petsRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
