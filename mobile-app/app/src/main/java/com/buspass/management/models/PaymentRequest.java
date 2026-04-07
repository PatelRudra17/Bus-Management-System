package com.buspass.management.models;

public class PaymentRequest {
    private String applicationId;
    private double amount;
    private String paymentMethod;

    public PaymentRequest(String applicationId, double amount, String paymentMethod) {
        this.applicationId = applicationId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
    }

    public String getApplicationId() { return applicationId; }
    public void setApplicationId(String applicationId) { this.applicationId = applicationId; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}
