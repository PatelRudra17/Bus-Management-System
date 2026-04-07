package com.buspass.management.models;

import java.util.List;

public class PaymentsResponse {
    private boolean success;
    private String message;
    private List<PaymentResponse.Payment> data;

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public List<PaymentResponse.Payment> getData() { return data; }
    public void setData(List<PaymentResponse.Payment> data) { this.data = data; }
}
