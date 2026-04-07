package com.buspass.management.models;

import java.util.List;

public class TravelHistoryResponse {
    private boolean success;
    private String message;
    private List<TravelLog> data;

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public List<TravelLog> getData() { return data; }
    public void setData(List<TravelLog> data) { this.data = data; }

    public static class TravelLog {
        private String _id;
        private String cardId;
        private String routeId;
        private String busNumber;
        private String fromStop;
        private String toStop;
        private double fare;
        private String timestamp;
        private String createdAt;

        // Getters and Setters
        public String get_id() { return _id; }
        public void set_id(String _id) { this._id = _id; }

        public String getCardId() { return cardId; }
        public void setCardId(String cardId) { this.cardId = cardId; }

        public String getRouteId() { return routeId; }
        public void setRouteId(String routeId) { this.routeId = routeId; }

        public String getBusNumber() { return busNumber; }
        public void setBusNumber(String busNumber) { this.busNumber = busNumber; }

        public String getFromStop() { return fromStop; }
        public void setFromStop(String fromStop) { this.fromStop = fromStop; }

        public String getToStop() { return toStop; }
        public void setToStop(String toStop) { this.toStop = toStop; }

        public double getFare() { return fare; }
        public void setFare(double fare) { this.fare = fare; }

        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

        public String getTravelDate() {
            return timestamp != null ? timestamp : createdAt;
        }
    }
}
