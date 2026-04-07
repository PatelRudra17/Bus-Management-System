package com.buspass.management.models;

import com.google.gson.annotations.SerializedName;

public class PassApplication {
    @SerializedName("_id")
    private String id;

    @SerializedName("applicationId")
    private String applicationId;

    @SerializedName("userId")
    private User userId;

    @SerializedName("routeId")
    private Route routeId;

    @SerializedName("passType")
    private String passType;

    @SerializedName("duration")
    private String duration;

    @SerializedName("startDate")
    private String startDate;

    @SerializedName("endDate")
    private String endDate;

    @SerializedName("totalAmount")
    private int totalAmount;

    @SerializedName("status")
    private String status;

    @SerializedName("passNumber")
    private String passNumber;

    @SerializedName("qrCode")
    private String qrCode;

    @SerializedName("documents")
    private Documents documents;

    @SerializedName("createdAt")
    private Object createdAt;  // Can be String or Long

    @SerializedName("updatedAt")
    private Object updatedAt;  // Can be String or Long

    // Getters
    public String getId() { return id; }
    public String getApplicationId() { return applicationId; }
    public User getUserId() { return userId; }
    public Route getRouteId() { return routeId; }
    public String getPassType() { return passType; }
    public String getDuration() { return duration; }
    public String getStartDate() { return startDate; }
    public String getEndDate() { return endDate; }
    public int getTotalAmount() { return totalAmount; }
    public String getStatus() { return status; }
    public String getPassNumber() { return passNumber; }
    public String getQrCode() { return qrCode; }
    public Documents getDocuments() { return documents; }
    public String getCreatedAt() {
        return createdAt != null ? createdAt.toString() : "";
    }
    public String getUpdatedAt() {
        return updatedAt != null ? updatedAt.toString() : "";
    }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setApplicationId(String applicationId) { this.applicationId = applicationId; }
    public void setUserId(User userId) { this.userId = userId; }
    public void setRouteId(Route routeId) { this.routeId = routeId; }
    public void setPassType(String passType) { this.passType = passType; }
    public void setDuration(String duration) { this.duration = duration; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
    public void setTotalAmount(int totalAmount) { this.totalAmount = totalAmount; }
    public void setStatus(String status) { this.status = status; }
    public void setPassNumber(String passNumber) { this.passNumber = passNumber; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }
    public void setDocuments(Documents documents) { this.documents = documents; }
    public void setCreatedAt(Object createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(Object updatedAt) { this.updatedAt = updatedAt; }

    // Nested classes
    public static class Route {
        @SerializedName("_id")
        private String id;

        @SerializedName("routeNumber")
        private String routeNumber;

        @SerializedName("source")
        private String source;

        @SerializedName("destination")
        private String destination;

        public String getId() { return id; }
        public String getRouteNumber() { return routeNumber; }
        public String getSource() { return source; }
        public String getDestination() { return destination; }

        public void setId(String id) { this.id = id; }
        public void setRouteNumber(String routeNumber) { this.routeNumber = routeNumber; }
        public void setSource(String source) { this.source = source; }
        public void setDestination(String destination) { this.destination = destination; }
    }

    public static class Documents {
        @SerializedName("idProof")
        private String idProof;

        @SerializedName("photo")
        private String photo;

        public String getIdProof() { return idProof; }
        public String getPhoto() { return photo; }

        public void setIdProof(String idProof) { this.idProof = idProof; }
        public void setPhoto(String photo) { this.photo = photo; }
    }
}
