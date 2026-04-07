package com.buspass.admin.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class PaymentStatsResponse {
    @SerializedName("success")
    private boolean success;
    @SerializedName("stats")
    private List<StatItem> stats;

    public boolean isSuccess() { return success; }
    public List<StatItem> getStats() { return stats; }

    public static class StatItem {
        @SerializedName("_id")
        private String id;
        @SerializedName("count")
        private int count;
        @SerializedName("total")
        private double total;

        public String getId() { return id; }
        public int getCount() { return count; }
        public double getTotal() { return total; }
    }
}
