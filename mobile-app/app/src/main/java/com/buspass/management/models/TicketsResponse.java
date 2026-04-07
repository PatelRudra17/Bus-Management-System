package com.buspass.management.models;

import com.google.gson.annotations.SerializedName;
import java.util.List;

public class TicketsResponse {
    @SerializedName("success")
    private boolean success;

    @SerializedName("message")
    private String message;

    @SerializedName("data")
    private List<TicketResponse.Ticket> data;

    @SerializedName("tickets")
    private List<TicketResponse.Ticket> tickets;

    public boolean isSuccess() { return success; }
    public List<TicketResponse.Ticket> getData() {
        if (data != null) return data;
        return tickets;
    }
}
