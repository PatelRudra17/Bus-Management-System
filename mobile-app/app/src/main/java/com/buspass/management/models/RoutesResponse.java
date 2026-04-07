package com.buspass.management.models;

import com.google.gson.annotations.SerializedName;
import java.util.ArrayList;
import java.util.List;

public class RoutesResponse {
    @SerializedName("success")
    private boolean success;

    @SerializedName("message")
    private String message;

    @SerializedName("data")
    private List<Route> data;

    @SerializedName("routes")
    private List<Route> routes;

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public List<Route> getData() { return data; }
    public void setData(List<Route> data) { this.data = data; }

    public List<Route> getRoutes() {
        if (routes != null) return routes;
        if (data != null) return data;
        return new ArrayList<>();
    }
    public void setRoutes(List<Route> routes) { this.routes = routes; }

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

        @SerializedName("duration")
        private String duration;

        @SerializedName("busType")
        private String busType;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getRouteNumber() { return routeNumber; }
        public void setRouteNumber(String routeNumber) { this.routeNumber = routeNumber; }

        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }

        public String getDestination() { return destination; }
        public void setDestination(String destination) { this.destination = destination; }

        public int getDistance() { return distance; }
        public void setDistance(int distance) { this.distance = distance; }

        public int getFare() { return fare; }
        public void setFare(int fare) { this.fare = fare; }

        public String getDuration() { return duration; }
        public void setDuration(String duration) { this.duration = duration; }

        public String getBusType() { return busType; }
        public void setBusType(String busType) { this.busType = busType; }
    }
}
