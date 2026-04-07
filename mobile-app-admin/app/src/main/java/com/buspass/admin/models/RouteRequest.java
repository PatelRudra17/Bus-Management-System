package com.buspass.admin.models;

public class RouteRequest {
    private String routeNumber;
    private String source;
    private String destination;
    private int distance;
    private int fare;
    private String busType;
    private int totalSeats;

    public RouteRequest(String routeNumber, String source, String destination, int distance, int fare, String busType, int totalSeats) {
        this.routeNumber = routeNumber;
        this.source = source;
        this.destination = destination;
        this.distance = distance;
        this.fare = fare;
        this.busType = busType;
        this.totalSeats = totalSeats;
    }
}
