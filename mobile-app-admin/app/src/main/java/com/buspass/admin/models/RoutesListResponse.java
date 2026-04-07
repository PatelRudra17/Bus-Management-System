package com.buspass.admin.models;

import com.google.gson.annotations.SerializedName;
import java.util.ArrayList;
import java.util.List;

public class RoutesListResponse {
    @SerializedName("success")
    private boolean success;
    @SerializedName("routes")
    private List<Route> routes;
    @SerializedName("data")
    private List<Route> data;

    public boolean isSuccess() { return success; }
    public List<Route> getRoutes() {
        if (routes != null) return routes;
        if (data != null) return data;
        return new ArrayList<>();
    }

    public static class Route {
        @SerializedName("_id")
        private String id;
        @SerializedName("routeNumber")
        private String routeNumber;
        @SerializedName("source")
        private String source;
        @SerializedName("destination")
        private String destination;
        @SerializedName("distance")
        private int distance;
        @SerializedName("fare")
        private int fare;
        @SerializedName("busType")
        private String busType;
        @SerializedName("totalSeats")
        private int totalSeats;
        @SerializedName("isActive")
        private boolean isActive;

        public String getId() { return id; }
        public String getRouteNumber() { return routeNumber; }
        public String getSource() { return source; }
        public String getDestination() { return destination; }
        public int getDistance() { return distance; }
        public int getFare() { return fare; }
        public String getBusType() { return busType; }
        public int getTotalSeats() { return totalSeats; }
        public boolean isActive() { return isActive; }
    }
}
