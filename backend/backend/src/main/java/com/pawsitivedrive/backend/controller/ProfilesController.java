package com.pawsitivedrive.backend.controller;

import com.pawsitivedrive.backend.entity.Profiles;
import com.pawsitivedrive.backend.entity.Users;
import com.pawsitivedrive.backend.repository.ProfilesRepository;
import com.pawsitivedrive.backend.repository.UsersRepository;
import com.pawsitivedrive.backend.service.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profiles")
public class ProfilesController {

	private final ProfilesRepository profilesRepository;
	private final UsersRepository usersRepository;
	private final FileStorageService fileStorageService;

	public ProfilesController(ProfilesRepository profilesRepository, UsersRepository usersRepository, FileStorageService fileStorageService) {
		this.profilesRepository = profilesRepository;
		this.usersRepository = usersRepository;
		this.fileStorageService = fileStorageService;
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

	@GetMapping("/user/{userId}")
	public ResponseEntity<Profiles> getByUserId(@PathVariable Long userId) {
		Optional<Users> userOpt = usersRepository.findById(userId);
		if (userOpt.isEmpty()) {
			return ResponseEntity.notFound().build();
		}
		List<Profiles> profiles = profilesRepository.findByUser(userOpt.get());
		if (profiles.isEmpty()) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok(profiles.get(0));
	}

	@PostMapping("/upload-image")
	public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
		try {
			String filename = fileStorageService.store(file);
			String url = fileStorageService.buildPublicUrl(filename);
			return ResponseEntity.ok(Map.of("url", url, "filename", filename));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
		} catch (Exception e) {
			return ResponseEntity.internalServerError().body(Map.of("message", "Failed to upload image: " + e.getMessage()));
		}
	}

	@PostMapping
	public ResponseEntity<Profiles> create(@RequestBody Map<String, Object> payload) {
		Long userId = Long.valueOf(payload.get("user_id").toString());
		Optional<Users> userOpt = usersRepository.findById(userId);
		if (userOpt.isEmpty()) {
			return ResponseEntity.badRequest().build();
		}

		Profiles profile = new Profiles();
		profile.setUser(userOpt.get());
		profile.setBio((String) payload.getOrDefault("bio", ""));
		profile.setProfile_picture((String) payload.getOrDefault("profile_picture", ""));

		Profiles saved = profilesRepository.save(profile);
		return ResponseEntity.created(URI.create("/api/profiles/" + saved.getProfile_id())).body(saved);
	}

	@PutMapping("/{id}")
	public ResponseEntity<Profiles> update(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
		return profilesRepository.findById(id).map(existing -> {
			String oldProfilePicture = existing.getProfile_picture();
			
			if (payload.containsKey("bio")) {
				existing.setBio((String) payload.get("bio"));
			}
			if (payload.containsKey("profile_picture")) {
				String newProfilePicture = payload.get("profile_picture") != null ? (String) payload.get("profile_picture") : "";
				// Delete old profile picture file if it's being replaced or removed
				if (oldProfilePicture != null && !oldProfilePicture.isEmpty() && !oldProfilePicture.equals(newProfilePicture)) {
					fileStorageService.deleteFileByUrl(oldProfilePicture);
				}
				existing.setProfile_picture(newProfilePicture);
			}
			return ResponseEntity.ok(profilesRepository.save(existing));
		}).orElse(ResponseEntity.notFound().build());
	}

	@PutMapping("/user/{userId}")
	public ResponseEntity<Profiles> updateByUserId(@PathVariable Long userId, @RequestBody Map<String, Object> payload) {
		Optional<Users> userOpt = usersRepository.findById(userId);
		if (userOpt.isEmpty()) {
			return ResponseEntity.notFound().build();
		}

		List<Profiles> profiles = profilesRepository.findByUser(userOpt.get());
		if (profiles.isEmpty()) {
			// Create new profile if it doesn't exist
			Profiles newProfile = new Profiles();
			newProfile.setUser(userOpt.get());
			newProfile.setBio(payload.get("bio") != null ? (String) payload.get("bio") : "");
			newProfile.setProfile_picture(payload.get("profile_picture") != null ? (String) payload.get("profile_picture") : "");
			Profiles saved = profilesRepository.save(newProfile);
			return ResponseEntity.ok(saved);
		}

		Profiles existing = profiles.get(0);
		String oldProfilePicture = existing.getProfile_picture();
		String newProfilePicture = payload.get("profile_picture") != null ? (String) payload.get("profile_picture") : "";
		
		// Delete old profile picture file if it's being replaced or removed
		if (oldProfilePicture != null && !oldProfilePicture.isEmpty() && !oldProfilePicture.equals(newProfilePicture)) {
			fileStorageService.deleteFileByUrl(oldProfilePicture);
		}
		
		// Always update bio and profile_picture from payload
		existing.setBio(payload.get("bio") != null ? (String) payload.get("bio") : "");
		existing.setProfile_picture(newProfilePicture);
		Profiles saved = profilesRepository.save(existing);
		return ResponseEntity.ok(saved);
	}
}


