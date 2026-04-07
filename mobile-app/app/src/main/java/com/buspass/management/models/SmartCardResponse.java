package com.buspass.management.models;

public class SmartCardResponse {
    private boolean success;
    private String message;
    private SmartCard data;

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public SmartCard getData() { return data; }
    public void setData(SmartCard data) { this.data = data; }

    public static class SmartCard {
        private String _id;
        private String userId;
        private String cardNumber;
        private String fullName;
        private String email;
        private String phone;
        private String address;
        private String photoUrl;
        private double balance;
        private String status;
        private String expiryDate;
        private String concessionType;
        private int concessionPercentage;
        private Stats stats;
        private String createdAt;
        private String updatedAt;

        // Getters and Setters
        public String get_id() { return _id; }
        public void set_id(String _id) { this._id = _id; }

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public String getCardNumber() { return cardNumber; }
        public void setCardNumber(String cardNumber) { this.cardNumber = cardNumber; }

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

        public double getBalance() { return balance; }
        public void setBalance(double balance) { this.balance = balance; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getExpiryDate() { return expiryDate; }
        public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }

        public String getConcessionType() { return concessionType != null ? concessionType : "none"; }
        public void setConcessionType(String concessionType) { this.concessionType = concessionType; }

        public int getConcessionPercentage() { return concessionPercentage; }
        public void setConcessionPercentage(int concessionPercentage) { this.concessionPercentage = concessionPercentage; }

        public Stats getStats() { return stats != null ? stats : new Stats(); }
        public void setStats(Stats stats) { this.stats = stats; }

        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

        public String getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class Stats {
        private int totalTrips = 0;
        private double totalSpent = 0.0;

        public int getTotalTrips() { return totalTrips; }
        public void setTotalTrips(int totalTrips) { this.totalTrips = totalTrips; }

        public double getTotalSpent() { return totalSpent; }
        public void setTotalSpent(double totalSpent) { this.totalSpent = totalSpent; }
    }
}
