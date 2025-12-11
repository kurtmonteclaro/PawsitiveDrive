package com.pawsitivedrive.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "donations")
public class Donations {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long donation_id;

    private double amount;
    private LocalDateTime donation_date = LocalDateTime.now();
    private String payment_method;
    private String status; // Completed / Pending / Failed

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne
    @JoinColumn(name = "pet_id", nullable = true)
    private Pets pet;

    @OneToMany(mappedBy = "donation", cascade = CascadeType.ALL)
    private List<DonationHistory> histories;

    // Getters and Setters
    public Long getDonation_id() {
        return donation_id;
    }

    public void setDonation_id(Long donation_id) {
        this.donation_id = donation_id;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public LocalDateTime getDonation_date() {
        return donation_date;
    }

    public void setDonation_date(LocalDateTime donation_date) {
        this.donation_date = donation_date;
    }

    public String getPayment_method() {
        return payment_method;

    }

    // Method to read the list of histories
    public List<DonationHistory> getHistories() {
        return histories;
    }

    public void setHistories(List<DonationHistory> histories) {
        this.histories = histories;
    }

    public void setPayment_method(String payment_method) {
        this.payment_method = payment_method;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Users getUser() {
        return user;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    public Pets getPet() {
        return pet;
    }

    public void setPet(Pets pet) {
        this.pet = pet;
    }
}
