package com.buspass.management.api;

import com.buspass.management.models.*;

import retrofit2.Call;
import retrofit2.http.*;

import java.util.List;

public interface ApiService {

    // Authentication
    @POST("auth/register")
    Call<AuthResponse> register(@Body RegisterRequest request);

    @POST("auth/login")
    Call<AuthResponse> login(@Body LoginRequest request);

    @GET("auth/me")
    Call<UserResponse> getProfile();

    @PUT("auth/update-password")
    Call<ApiResponse> updatePassword(@Body PasswordUpdateRequest request);

    // Routes
    @GET("routes")
    Call<RoutesResponse> getRoutes();

    @GET("routes/{id}")
    Call<RouteResponse> getRoute(@Path("id") String id);

    @GET("routes/search")
    Call<RoutesResponse> searchRoutes(@Query("q") String query);

    // Applications
    @POST("applications")
    Call<ApplicationResponse> createApplication(@Body ApplicationRequest request);

    @GET("users/applications")
    Call<ApplicationsResponse> getMyApplications();

    @GET("users/applications/{id}")
    Call<ApplicationResponse> getApplication(@Path("id") String id);

    @POST("applications/{id}/renew")
    Call<ApplicationResponse> renewApplication(@Path("id") String id);

    @DELETE("applications/{id}/cancel")
    Call<ApiResponse> cancelApplication(@Path("id") String id);

    @GET("users/passes")
    Call<ApplicationsResponse> getMyPasses();

    // Smart Cards
    @POST("cards/apply")
    Call<SmartCardResponse> applySmartCard(@Body SmartCardRequest request);

    @GET("cards/my-card")
    Call<SmartCardResponse> getMySmartCard();

    @POST("cards/recharge")
    Call<SmartCardResponse> rechargeCard(@Body RechargeRequest request);

    @GET("travel/history")
    Call<TravelHistoryResponse> getTravelHistory();

    // Payments
    @POST("payments")
    Call<PaymentResponse> createPayment(@Body PaymentRequest request);

    @GET("users/payments")
    Call<PaymentsResponse> getMyPayments();

    // Notifications
    @GET("users/notifications")
    Call<NotificationsResponse> getNotifications();

    @PUT("users/notifications/{id}")
    Call<ApiResponse> markNotificationRead(@Path("id") String id);

    // Incidents
    @POST("incidents/report")
    Call<ApiResponse> reportIncident(@Body java.util.Map<String, Object> request);

    // Tickets
    @POST("tickets/book")
    Call<TicketResponse> bookTicket(@Body TicketRequest request);

    @GET("tickets/my-tickets")
    Call<TicketsResponse> getMyTickets();
}
