package com.buspass.management.models;

public class ApplicationResponse {
    private boolean success;
    private String message;
    private Application data;

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Application getData() { return data; }
    public void setData(Application data) { this.data = data; }

    public static class Application {
        private String _id;
        private String userId;
        private String applicationId;
        private String passType;
        private String routeId;
        private String fullName;
        private String dateOfBirth;
        private String gender;
        private String address;
        private String photoUrl;
        private String idProofType;
        private String idProofNumber;
        private String idProofUrl;
        private String validFrom;
        private String validUntil;
        private String status;
        private String passNumber;
        private String qrCode;
        private String createdAt;
        private String updatedAt;

        // Getters and Setters
        public String get_id() { return _id; }
        public void set_id(String _id) { this._id = _id; }

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public String getApplicationId() { return applicationId; }
        public void setApplicationId(String applicationId) { this.applicationId = applicationId; }

        public String getPassType() { return passType; }
        public void setPassType(String passType) { this.passType = passType; }

        public String getRouteId() { return routeId; }
        public void setRouteId(String routeId) { this.routeId = routeId; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getDateOfBirth() { return dateOfBirth; }
        public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getPhotoUrl() { return photoUrl; }
        public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

        public String getIdProofType() { return idProofType; }
        public void setIdProofType(String idProofType) { this.idProofType = idProofType; }

        public String getIdProofNumber() { return idProofNumber; }
        public void setIdProofNumber(String idProofNumber) { this.idProofNumber = idProofNumber; }

        public String getIdProofUrl() { return idProofUrl; }
        public void setIdProofUrl(String idProofUrl) { this.idProofUrl = idProofUrl; }

        public String getValidFrom() { return validFrom; }
        public void setValidFrom(String validFrom) { this.validFrom = validFrom; }

        public String getValidUntil() { return validUntil; }
        public void setValidUntil(String validUntil) { this.validUntil = validUntil; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getPassNumber() { return passNumber; }
        public void setPassNumber(String passNumber) { this.passNumber = passNumber; }

        public String getQrCode() { return qrCode; }
        public void setQrCode(String qrCode) { this.qrCode = qrCode; }

        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

        public String getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
    }
}
