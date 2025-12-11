package com.pawsitivedrive.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "adoption_applications")
public class AdoptionApplications {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long application_id;

    @ManyToOne
    @JoinColumn(name = "pet_id", nullable = false)
    @JsonIgnoreProperties({"applications", "addedBy"}) // Prevent circular reference
    private Pets pet;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"profiles", "donations", "password", "applications"})
    private Users user;

    @ManyToOne
    @JoinColumn(name = "reviewed_by")
    private Users reviewedBy; // Admin user

    private LocalDateTime application_date = LocalDateTime.now();
    private String status; // Pending / Approved / Rejected

    // Getters and Setters
    public Long getApplication_id() {
        return application_id;
    }

    public void setApplication_id(Long application_id) {
        this.application_id = application_id;
    }

    public Pets getPet() {
        return pet;
    }

    public void setPet(Pets pet) {
        this.pet = pet;
    }

    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    public Users getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(Users reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public LocalDateTime getApplication_date() {
        return application_date;
    }

    public void setApplication_date(LocalDateTime application_date) {
        this.application_date = application_date;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
