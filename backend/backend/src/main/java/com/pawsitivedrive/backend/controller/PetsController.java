package com.pawsitivedrive.backend.controller;

import com.pawsitivedrive.backend.entity.Pets;
import com.pawsitivedrive.backend.entity.Users;
import com.pawsitivedrive.backend.repository.PetsRepository;
import com.pawsitivedrive.backend.repository.UsersRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> payload) {
        try {
            Pets pet = new Pets();
            pet.setName(getStringValue(payload, "name"));
            pet.setSpecies(getStringValue(payload, "species"));
            pet.setBreed(getStringValue(payload, "breed"));
            
            // Safe integer conversion
            pet.setAge(getIntegerValue(payload, "age"));
            
            pet.setGender(getStringValue(payload, "gender"));
            pet.setStatus(getStringValue(payload, "status"));
            pet.setDescription(getStringValue(payload, "description"));
            pet.setImage_url(getStringValue(payload, "image_url"));

            // Handle addedBy
            Object addedByObj = payload.get("addedBy");
            Users addedBy = null;

            if (addedByObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> userMap = (Map<String, Object>) addedByObj;
                
                Object userIdObj = userMap.get("user_id");
                if (userIdObj == null) {
                    userIdObj = userMap.get("id");
                }
                // Line 119 in original code was here. Calls the improved findUserFromIdObject.
                addedBy = findUserFromIdObject(userIdObj);

            } else if (addedByObj != null) {
                // Line 136 in original code was here. Calls the improved findUserFromIdObject.
                addedBy = findUserFromIdObject(addedByObj);
            }

            if (addedBy == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Valid user (addedBy) is required and must exist."));
            }

            pet.setAddedBy(addedBy);
            Pets saved = petsRepository.save(pet);
            return ResponseEntity.created(URI.create("/api/pets/" + saved.getPet_id())).body(saved);
        } catch (NumberFormatException e) { 
            return ResponseEntity.badRequest().body(Map.of("message", "Error creating pet: Invalid number format for 'age' or 'addedBy' ID."));
        } catch (RuntimeException e) { 
            return ResponseEntity.internalServerError().body(Map.of("message", "Error creating pet: " + e.getMessage()));
        }
    }
    
    // --- Utility Methods (Optimized) ---

    private String getStringValue(Map<String, Object> payload, String key) {
        Object value = payload.get(key);
        return value != null ? value.toString() : null;
    }
    
    private Integer getIntegerValue(Map<String, Object> payload, String key) throws NumberFormatException {
        Object value = payload.get(key);
        if (value == null) {
            throw new NumberFormatException("Required field '" + key + "' is missing or null."); 
        }
        if (value instanceof Integer) {
            return (Integer) value;
        }
        // Direct conversion: fixes "Unnecessary temporary" warning
        return Integer.valueOf(value.toString()); 
    }
    
    private Users findUserFromIdObject(Object userIdObj) throws NumberFormatException {
        if (userIdObj == null) {
            return null;
        }
        
        Long userId;
        if (userIdObj instanceof Number) {
             // Unified handling for Long, Integer, etc.
             userId = ((Number) userIdObj).longValue();
        } else {
             // Direct conversion: fixes "Unnecessary temporary" warning
             userId = Long.valueOf(userIdObj.toString());
        }
        
        return usersRepository.findById(userId).orElse(null);
    }
    
    // -----------------------------------------------------------------

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
            existing.setAddedBy(input.getAddedBy());
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