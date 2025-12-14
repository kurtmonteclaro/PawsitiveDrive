package com.pawsitivedrive.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "donation_receipt")
public class DonationReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long receipt_id;

    private String receipt_number; // Unique receipt number/identifier
    
    @Column(name = "receipt_date")
    private LocalDateTime receipt_date = LocalDateTime.now();
    
    private String donor_name;
    private String donor_email;
    private String donor_address;
    private String payment_method;
    private String status;
    private String transaction_id;
    private String notes;

    @OneToOne
    @JoinColumn(name = "donation_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"histories", "user", "pet"})
    private Donations donation;

    // Getters and Setters
    public Long getReceipt_id() {
        return receipt_id;
    }

    public void setReceipt_id(Long receipt_id) {
        this.receipt_id = receipt_id;
    }

    public String getReceipt_number() {
        return receipt_number;
    }

    public void setReceipt_number(String receipt_number) {
        this.receipt_number = receipt_number;
    }

    public LocalDateTime getReceipt_date() {
        return receipt_date;
    }

    public void setReceipt_date(LocalDateTime receipt_date) {
        this.receipt_date = receipt_date;
    }

    public String getDonor_name() {
        return donor_name;
    }

    public void setDonor_name(String donor_name) {
        this.donor_name = donor_name;
    }

    public String getDonor_email() {
        return donor_email;
    }

    public void setDonor_email(String donor_email) {
        this.donor_email = donor_email;
    }

    public String getDonor_address() {
        return donor_address;
    }

    public void setDonor_address(String donor_address) {
        this.donor_address = donor_address;
    }

    public String getPayment_method() {
        return payment_method;
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

    public String getTransaction_id() {
        return transaction_id;
    }

    public void setTransaction_id(String transaction_id) {
        this.transaction_id = transaction_id;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Donations getDonation() {
        return donation;
    }

    public void setDonation(Donations donation) {
        this.donation = donation;
    }
}

