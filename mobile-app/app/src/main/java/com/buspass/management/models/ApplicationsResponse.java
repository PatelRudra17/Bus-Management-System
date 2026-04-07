package com.buspass.management.models;

import com.google.gson.annotations.SerializedName;
import java.util.ArrayList;
import java.util.List;

public class ApplicationsResponse {
    @SerializedName("success")
    private boolean success;

    @SerializedName("message")
    private String message;

    @SerializedName("count")
    private int count;

    @SerializedName("applications")
    private List<PassApplication> applications;

    @SerializedName("passes")
    private List<PassApplication> passes;

    @SerializedName("data")
    private List<ApplicationResponse.Application> data;

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public int getCount() { return count; }
    public void setCount(int count) { this.count = count; }

    public List<ApplicationResponse.Application> getData() { return data; }
    public void setData(List<ApplicationResponse.Application> data) { this.data = data; }

    public List<PassApplication> getApplications() {
        return applications != null ? applications : new ArrayList<>();
    }
    public void setApplications(List<PassApplication> applications) {
        this.applications = applications;
    }

    public List<PassApplication> getPasses() {
        if (passes != null) return passes;
        if (applications != null) return applications;
        return new ArrayList<>();
    }
    public void setPasses(List<PassApplication> passes) {
        this.passes = passes;
    }
}
