package com.buspass.admin.models;

import com.google.gson.annotations.SerializedName;

public class DashboardResponse {
    @SerializedName("success")
    private boolean success;
    @SerializedName("stats")
    private Stats stats;

    public boolean isSuccess() { return success; }
    public Stats getStats() { return stats; }

    public static class Stats {
        @SerializedName("users")
        private UsersStats users;
        @SerializedName("applications")
        private AppStats applications;
        @SerializedName("revenue")
        private RevenueStats revenue;
        @SerializedName("routes")
        private RoutesStats routes;

        public UsersStats getUsers() { return users; }
        public AppStats getApplications() { return applications; }
        public RevenueStats getRevenue() { return revenue; }
        public RoutesStats getRoutes() { return routes; }
    }

    public static class UsersStats {
        @SerializedName("total")
        private int total;
        public int getTotal() { return total; }
    }

    public static class AppStats {
        @SerializedName("total")
        private int total;
        @SerializedName("pending")
        private int pending;
        @SerializedName("approved")
        private int approved;
        @SerializedName("rejected")
        private int rejected;

        public int getTotal() { return total; }
        public int getPending() { return pending; }
        public int getApproved() { return approved; }
        public int getRejected() { return rejected; }
    }

    public static class RevenueStats {
        @SerializedName("total")
        private double total;
        @SerializedName("thisMonth")
        private double thisMonth;

        public double getTotal() { return total; }
        public double getThisMonth() { return thisMonth; }
    }

    public static class RoutesStats {
        @SerializedName("active")
        private int active;
        public int getActive() { return active; }
    }
}
