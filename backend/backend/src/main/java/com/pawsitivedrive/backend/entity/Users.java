package com.pawsitivedrive.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "users")
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long user_id;

    private String name;
    
    // FIX 2: Set email as unique for data integrity
    @Column(unique = true) 
    private String email;
    
    // FIX 1: Set password length to 60 for BCrypt hash
    @Column(length = 60) 
    private String password;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Roles role; 

    private String status; // active/suspended
    
    @Column(nullable = true)
    private String contact_number;
    
    @Column(nullable = true)
    private String address;
    
    private LocalDateTime created_at = LocalDateTime.now();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private final List<Profiles> profiles = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private final List<Donations> donations = new ArrayList<>(); 
    
    // FIX 3: Required no-argument constructor for JPA
    public Users() {} 
    
    // UPDATED: Constructor for easy creation in AuthController, now accepts address and contactNumber
    public Users(String name, String email, String password, Roles role, String status, String address, String contactNumber) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.status = status;
        this.address = address; // Assignment added
        this.contact_number = contactNumber; // Assignment added (Note the entity name)
        this.created_at = LocalDateTime.now();
    }

    // --- Getters and Setters (The rest of your methods are fine) ---

    public Long getUser_id() { return user_id; }
    public void setUser_id(Long user_id) { this.user_id = user_id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Roles getRole() { return role; }
    public void setRole(Roles role) { this.role = role; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getContact_number() { return contact_number; }
    public void setContact_number(String contact_number) { this.contact_number = contact_number; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public LocalDateTime getCreated_at() { return created_at; }
    public void setCreated_at(LocalDateTime created_at) { this.created_at = created_at; }
    public List<Profiles> getProfiles() { return profiles; }
    public List<Donations> getDonations() { return donations; }
}