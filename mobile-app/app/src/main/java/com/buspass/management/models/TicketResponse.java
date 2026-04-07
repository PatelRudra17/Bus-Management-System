package com.buspass.management.models;

import com.google.gson.annotations.SerializedName;

public class TicketResponse {
    @SerializedName("success")
    private boolean success;

    @SerializedName("message")
    private String message;

    @SerializedName("data")
    private Ticket data;

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Ticket getData() { return data; }
    public void setData(Ticket data) { this.data = data; }

    public static class Ticket {
        @SerializedName("_id")
        private String id;

        @SerializedName("ticketNumber")
        private String ticketNumber;

        @SerializedName("bookingReference")
        private String bookingReference;

        @SerializedName("routeId")
        private String routeId;

        @SerializedName("totalAmount")
        private int totalAmount;

        @SerializedName("status")
        private String status;

        @SerializedName("createdAt")
        private String createdAt;

        public String getId() { return id; }
        public String getTicketNumber() { return ticketNumber; }
        public String getBookingReference() { return bookingReference; }
        public String getRouteId() { return routeId; }
        public int getTotalAmount() { return totalAmount; }
        public String getStatus() { return status; }
        public String getCreatedAt() { return createdAt; }
    }
}
