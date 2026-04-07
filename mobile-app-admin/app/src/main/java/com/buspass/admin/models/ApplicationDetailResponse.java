package com.buspass.admin.models;

import com.google.gson.annotations.SerializedName;

public class ApplicationDetailResponse {
    @SerializedName("success")
    private boolean success;
    @SerializedName("application")
    private ApplicationsListResponse.Application application;
    @SerializedName("message")
    private String message;

    public boolean isSuccess() { return success; }
    public ApplicationsListResponse.Application getApplication() { return application; }
    public String getMessage() { return message; }
}
