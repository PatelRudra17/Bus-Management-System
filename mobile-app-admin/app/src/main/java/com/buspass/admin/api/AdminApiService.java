package com.buspass.admin.api;

import com.buspass.admin.models.*;
import java.util.Map;
import retrofit2.Call;
import retrofit2.http.*;

public interface AdminApiService {
    // Auth
    @POST("auth/login")
    Call<AuthResponse> login(@Body LoginRequest request);

    @GET("auth/me")
    Call<AuthResponse> getProfile();

    // Dashboard
    @GET("admin/dashboard")
    Call<DashboardResponse> getDashboardStats();

    // Applications
    @GET("admin/applications")
    Call<ApplicationsListResponse> getApplications(@QueryMap Map<String, String> params);

    @GET("users/applications/{id}")
    Call<ApplicationDetailResponse> getApplicationDetail(@Path("id") String id);

    @PUT("applications/{id}/approve")
    Call<ApplicationDetailResponse> approveApplication(@Path("id") String id, @Body RemarksRequest request);

    @PUT("applications/{id}/reject")
    Call<ApplicationDetailResponse> rejectApplication(@Path("id") String id, @Body RemarksRequest request);

    // Users
    @GET("admin/users")
    Call<UsersListResponse> getUsers(@QueryMap Map<String, String> params);

    @PUT("admin/users/{id}")
    Call<ApiResponse> updateUser(@Path("id") String id, @Body Map<String, Object> body);

    // Routes
    @GET("routes")
    Call<RoutesListResponse> getRoutes();

    @POST("routes")
    Call<ApiResponse> createRoute(@Body RouteRequest request);

    @PUT("routes/{id}")
    Call<ApiResponse> updateRoute(@Path("id") String id, @Body RouteRequest request);

    @DELETE("routes/{id}")
    Call<ApiResponse> deleteRoute(@Path("id") String id);

    // Payments
    @GET("payments")
    Call<PaymentsListResponse> getPayments(@QueryMap Map<String, String> params);

    @GET("payments/stats")
    Call<PaymentStatsResponse> getPaymentStats();

    @PUT("payments/{id}/refund")
    Call<ApiResponse> refundPayment(@Path("id") String id, @Body Map<String, String> body);
}
