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
import java.util.Optional;

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
			pet.setName((String) payload.get("name"));
			pet.setSpecies((String) payload.get("species"));
			pet.setBreed((String) payload.get("breed"));
			pet.setAge(payload.get("age") instanceof Integer ? (Integer) payload.get("age") : Integer.parseInt(payload.get("age").toString()));
			pet.setGender((String) payload.get("gender"));
			pet.setStatus((String) payload.get("status"));
			pet.setDescription((String) payload.get("description"));
			pet.setImage_url((String) payload.get("image_url"));

			// Handle addedBy - can be a user object or just user_id
			Object addedByObj = payload.get("addedBy");
			Users addedBy = null;
			if (addedByObj instanceof Map) {
				Map<String, Object> userMap = (Map<String, Object>) addedByObj;
				Object userIdObj = userMap.get("user_id");
				if (userIdObj == null) {
					userIdObj = userMap.get("id");
				}
				if (userIdObj != null) {
					Long userId = userIdObj instanceof Long ? (Long) userIdObj : Long.parseLong(userIdObj.toString());
					Optional<Users> userOpt = usersRepository.findById(userId);
					if (userOpt.isPresent()) {
						addedBy = userOpt.get();
					}
				}
			} else if (addedByObj != null) {
				// Try to parse as user_id directly
				try {
					Long userId = addedByObj instanceof Long ? (Long) addedByObj : Long.parseLong(addedByObj.toString());
					Optional<Users> userOpt = usersRepository.findById(userId);
					if (userOpt.isPresent()) {
						addedBy = userOpt.get();
					}
				} catch (Exception e) {
					// Ignore
				}
			}

			if (addedBy == null) {
				return ResponseEntity.badRequest().body(Map.of("message", "Valid user (addedBy) is required"));
			}

			pet.setAddedBy(addedBy);
			Pets saved = petsRepository.save(pet);
			return ResponseEntity.created(URI.create("/api/pets/" + saved.getPet_id())).body(saved);
		} catch (Exception e) {
			return ResponseEntity.badRequest().body(Map.of("message", "Error creating pet: " + e.getMessage()));
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


