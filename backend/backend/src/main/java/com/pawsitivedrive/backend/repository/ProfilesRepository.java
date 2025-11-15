package com.pawsitivedrive.backend.repository;

import com.pawsitivedrive.backend.entity.Profiles;
import com.pawsitivedrive.backend.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProfilesRepository extends JpaRepository<Profiles, Long> {
	List<Profiles> findByUser(Users user);
}


