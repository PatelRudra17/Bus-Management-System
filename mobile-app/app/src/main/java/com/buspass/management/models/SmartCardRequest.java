package com.buspass.management.models;

public class SmartCardRequest {
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String photoUrl;

    public SmartCardRequest(String fullName, String email, String phone, String address, String photoUrl) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.photoUrl = photoUrl;
    }

    // Getters and Setters
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
}
