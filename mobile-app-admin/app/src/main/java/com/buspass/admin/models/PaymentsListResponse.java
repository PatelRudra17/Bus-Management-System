package com.buspass.admin.models;

import com.google.gson.annotations.SerializedName;
import java.util.ArrayList;
import java.util.List;

public class PaymentsListResponse {
    @SerializedName("success")
    private boolean success;
    @SerializedName("payments")
    private List<Payment> payments;
    @SerializedName("pagination")
    private ApplicationsListResponse.Pagination pagination;

    public boolean isSuccess() { return success; }
    public List<Payment> getPayments() { return payments != null ? payments : new ArrayList<>(); }
    public ApplicationsListResponse.Pagination getPagination() { return pagination; }

    public static class Payment {
        @SerializedName("_id")
        private String id;
        @SerializedName("transactionId")
        private String transactionId;
        @SerializedName("amount")
        private int amount;
        @SerializedName("paymentMethod")
        private String paymentMethod;
        @SerializedName("paymentStatus")
        private String paymentStatus;
        @SerializedName("createdAt")
        private String createdAt;
        @SerializedName("userId")
        private ApplicationsListResponse.UserRef userId;
        @SerializedName("applicationId")
        private AppRef applicationId;

        public String getId() { return id; }
        public String getTransactionId() { return transactionId; }
        public int getAmount() { return amount; }
        public String getPaymentMethod() { return paymentMethod; }
        public String getPaymentStatus() { return paymentStatus; }
        public String getCreatedAt() { return createdAt; }
        public ApplicationsListResponse.UserRef getUserId() { return userId; }
        public AppRef getApplicationId() { return applicationId; }
    }

    public static class AppRef {
        @SerializedName("_id")
        private String id;
        @SerializedName("applicationId")
        private String applicationId;
        public String getId() { return id; }
        public String getApplicationId() { return applicationId; }
    }
}
