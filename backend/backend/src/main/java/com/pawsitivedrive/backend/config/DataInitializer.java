package com.pawsitivedrive.backend.config;

import com.pawsitivedrive.backend.entity.Roles;
import com.pawsitivedrive.backend.repository.RolesRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

	private final RolesRepository rolesRepository;

	public DataInitializer(RolesRepository rolesRepository) {
		this.rolesRepository = rolesRepository;
	}

	@Override
	public void run(String... args) throws Exception {
		System.out.println("Initializing roles...");
		
		// Initialize roles if they don't exist
		if (rolesRepository.findByRole_nameIgnoreCase("Donor").isEmpty()) {
			Roles donor = new Roles();
			donor.setRole_name("Donor");
			rolesRepository.save(donor);
			System.out.println("✓ Created Donor role");
		} else {
			System.out.println("✓ Donor role already exists");
		}

		if (rolesRepository.findByRole_nameIgnoreCase("Admin").isEmpty()) {
			Roles admin = new Roles();
			admin.setRole_name("Admin");
			rolesRepository.save(admin);
			System.out.println("✓ Created Admin role");
		} else {
			System.out.println("✓ Admin role already exists");
		}
		
		System.out.println("Role initialization complete!");
	}
}

