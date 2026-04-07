package com.buspass.management.models;

import java.util.List;

public class NotificationsResponse {
    private boolean success;
    private String message;
    private List<Notification> data;

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public List<Notification> getData() { return data; }
    public void setData(List<Notification> data) { this.data = data; }

    public static class Notification {
        private String _id;
        private String userId;
        private String type;
        private String title;
        private String message;
        private boolean isRead;
        private String createdAt;

        // Getters and Setters
        public String get_id() { return _id; }
        public void set_id(String _id) { this._id = _id; }

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public boolean isRead() { return isRead; }
        public void setRead(boolean read) { isRead = read; }

        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }
}
