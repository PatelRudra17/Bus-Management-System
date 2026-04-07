package com.buspass.admin.models;

import com.google.gson.annotations.SerializedName;
import java.util.ArrayList;
import java.util.List;

public class UsersListResponse {
    @SerializedName("success")
    private boolean success;
    @SerializedName("users")
    private List<User> users;
    @SerializedName("pagination")
    private ApplicationsListResponse.Pagination pagination;

    public boolean isSuccess() { return success; }
    public List<User> getUsers() { return users != null ? users : new ArrayList<>(); }
    public ApplicationsListResponse.Pagination getPagination() { return pagination; }

    public static class User {
        @SerializedName("_id")
        private String id;
        @SerializedName("name")
        private String name;
        @SerializedName("email")
        private String email;
        @SerializedName("phone")
        private String phone;
        @SerializedName("role")
        private String role;
        @SerializedName("isActive")
        private boolean isActive;
        @SerializedName("createdAt")
        private String createdAt;

        public String getId() { return id; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getPhone() { return phone; }
        public String getRole() { return role; }
        public boolean isActive() { return isActive; }
        public String getCreatedAt() { return createdAt; }
    }
}
