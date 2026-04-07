package com.buspass.management.models;

public class PaymentResponse {
    private boolean success;
    private String message;
    private Payment data;

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Payment getData() { return data; }
    public void setData(Payment data) { this.data = data; }

    public static class Payment {
        private String _id;
        private String userId;
        private String applicationId;
        private double amount;
        private String paymentMethod;
        private String status;
        private String transactionId;
        private String createdAt;
        private String updatedAt;

        // Getters and Setters
        public String get_id() { return _id; }
        public void set_id(String _id) { this._id = _id; }

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public String getApplicationId() { return applicationId; }
        public void setApplicationId(String applicationId) { this.applicationId = applicationId; }

        public double getAmount() { return amount; }
        public void setAmount(double amount) { this.amount = amount; }

        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

        public String getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
    }
}
