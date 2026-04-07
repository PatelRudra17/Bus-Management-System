package com.buspass.management.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class TicketRequest {
    @SerializedName("routeId")
    private String routeId;

    @SerializedName("passengers")
    private List<Passenger> passengers;

    @SerializedName("paymentMethod")
    private String paymentMethod;

    @SerializedName("totalAmount")
    private int totalAmount;

    public TicketRequest(String routeId, List<Passenger> passengers, String paymentMethod, int totalAmount) {
        this.routeId = routeId;
        this.passengers = passengers;
        this.paymentMethod = paymentMethod;
        this.totalAmount = totalAmount;
    }

    public String getRouteId() { return routeId; }
    public void setRouteId(String routeId) { this.routeId = routeId; }

    public List<Passenger> getPassengers() { return passengers; }
    public void setPassengers(List<Passenger> passengers) { this.passengers = passengers; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public int getTotalAmount() { return totalAmount; }
    public void setTotalAmount(int totalAmount) { this.totalAmount = totalAmount; }

    public static class Passenger {
        @SerializedName("name")
        private String name;

        @SerializedName("age")
        private int age;

        @SerializedName("gender")
        private String gender;

        public Passenger(String name, int age, String gender) {
            this.name = name;
            this.age = age;
            this.gender = gender;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public int getAge() { return age; }
        public void setAge(int age) { this.age = age; }

        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }
    }
}
