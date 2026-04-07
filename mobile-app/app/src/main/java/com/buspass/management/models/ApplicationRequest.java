package com.buspass.management.models;

public class ApplicationRequest {
    private String routeId;
    private String passType;
    private String duration;
    private String startDate;
    private String idProof;
    private String photo;
    private int totalAmount;

    // Empty constructor
    public ApplicationRequest() {}

    // Full constructor
    public ApplicationRequest(String routeId, String passType, String duration,
                            String startDate, String idProof, String photo, int totalAmount) {
        this.routeId = routeId;
        this.passType = passType;
        this.duration = duration;
        this.startDate = startDate;
        this.idProof = idProof;
        this.photo = photo;
        this.totalAmount = totalAmount;
    }

    // Getters and Setters
    public String getRouteId() { return routeId; }
    public void setRouteId(String routeId) { this.routeId = routeId; }

    public String getPassType() { return passType; }
    public void setPassType(String passType) { this.passType = passType; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getIdProof() { return idProof; }
    public void setIdProof(String idProof) { this.idProof = idProof; }

    public String getPhoto() { return photo; }
    public void setPhoto(String photo) { this.photo = photo; }

    public int getTotalAmount() { return totalAmount; }
    public void setTotalAmount(int totalAmount) { this.totalAmount = totalAmount; }
}
