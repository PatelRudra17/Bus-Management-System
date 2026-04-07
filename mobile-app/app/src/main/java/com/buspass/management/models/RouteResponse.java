package com.buspass.management.models;

import java.util.List;

public class RouteResponse {
    private boolean success;
    private String message;
    private Route data;

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Route getData() { return data; }
    public void setData(Route data) { this.data = data; }

    public static class Route {
        private String _id;
        private String routeNumber;
        private String routeName;
        private String startPoint;
        private String endPoint;
        private List<String> stops;
        private double distance;
        private double fare;
        private String schedule;
        private boolean isActive;

        // Getters and Setters
        public String get_id() { return _id; }
        public void set_id(String _id) { this._id = _id; }

        public String getRouteNumber() { return routeNumber; }
        public void setRouteNumber(String routeNumber) { this.routeNumber = routeNumber; }

        public String getRouteName() { return routeName; }
        public void setRouteName(String routeName) { this.routeName = routeName; }

        public String getStartPoint() { return startPoint; }
        public void setStartPoint(String startPoint) { this.startPoint = startPoint; }

        public String getEndPoint() { return endPoint; }
        public void setEndPoint(String endPoint) { this.endPoint = endPoint; }

        public List<String> getStops() { return stops; }
        public void setStops(List<String> stops) { this.stops = stops; }

        public double getDistance() { return distance; }
        public void setDistance(double distance) { this.distance = distance; }

        public double getFare() { return fare; }
        public void setFare(double fare) { this.fare = fare; }

        public String getSchedule() { return schedule; }
        public void setSchedule(String schedule) { this.schedule = schedule; }

        public boolean isActive() { return isActive; }
        public void setActive(boolean active) { isActive = active; }
    }
}
