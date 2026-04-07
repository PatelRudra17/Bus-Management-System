package com.buspass.admin.models;

import com.google.gson.annotations.SerializedName;
import java.util.ArrayList;
import java.util.List;

public class ApplicationsListResponse {
    @SerializedName("success")
    private boolean success;
    @SerializedName("applications")
    private List<Application> applications;
    @SerializedName("pagination")
    private Pagination pagination;

    public boolean isSuccess() { return success; }
    public List<Application> getApplications() { return applications != null ? applications : new ArrayList<>(); }
    public Pagination getPagination() { return pagination; }

    public static class Application {
        @SerializedName("_id")
        private String id;
        @SerializedName("applicationId")
        private String applicationId;
        @SerializedName("passNumber")
        private String passNumber;
        @SerializedName("status")
        private String status;
        @SerializedName("passType")
        private String passType;
        @SerializedName("duration")
        private String duration;
        @SerializedName("totalAmount")
        private int totalAmount;
        @SerializedName("remarks")
        private String remarks;
        @SerializedName("createdAt")
        private String createdAt;
        @SerializedName("userId")
        private UserRef userId;
        @SerializedName("routeId")
        private RouteRef routeId;
        @SerializedName("documents")
        private Documents documents;

        public String getId() { return id; }
        public String getApplicationId() { return applicationId; }
        public String getPassNumber() { return passNumber; }
        public String getStatus() { return status; }
        public String getPassType() { return passType; }
        public String getDuration() { return duration; }
        public int getTotalAmount() { return totalAmount; }
        public String getRemarks() { return remarks; }
        public String getCreatedAt() { return createdAt; }
        public UserRef getUserId() { return userId; }
        public RouteRef getRouteId() { return routeId; }
        public Documents getDocuments() { return documents; }
    }

    public static class UserRef {
        @SerializedName("_id")
        private String id;
        @SerializedName("name")
        private String name;
        @SerializedName("email")
        private String email;
        @SerializedName("phone")
        private String phone;

        public String getId() { return id; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getPhone() { return phone; }
    }

    public static class RouteRef {
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
    }

    public static class Documents {
        @SerializedName("idProof")
        private String idProof;
        @SerializedName("photo")
        private String photo;

        public String getIdProof() { return idProof; }
        public String getPhoto() { return photo; }
    }

    public static class Pagination {
        @SerializedName("page")
        private int page;
        @SerializedName("pages")
        private int pages;
        @SerializedName("total")
        private int total;

        public int getPage() { return page; }
        public int getPages() { return pages; }
        public int getTotal() { return total; }
    }
}
