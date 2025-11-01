package com.pawsitivedrive.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "donation_history")
public class DonationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long history_id;

    private String action; // Created / Updated / Refunded / etc.
    private LocalDateTime action_date = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "donation_id", nullable = false)
    private Donations donation;

    // Getters and Setters
    public Long getHistory_id() {
        return history_id;
    }

    public void setHistory_id(Long history_id) {
        this.history_id = history_id;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public LocalDateTime getAction_date() {
        return action_date;
    }

    public void setAction_date(LocalDateTime action_date) {
        this.action_date = action_date;
    }

    public Donations getDonation() {
        return donation;
    }

    public void setDonation(Donations donation) {
        this.donation = donation;
    }
}
