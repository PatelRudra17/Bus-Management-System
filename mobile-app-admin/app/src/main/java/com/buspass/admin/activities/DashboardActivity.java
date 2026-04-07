package com.buspass.admin.activities;

import android.content.Intent;
import android.os.Bundle;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;

import com.buspass.admin.R;
import com.buspass.admin.api.AdminApiService;
import com.buspass.admin.models.DashboardResponse;
import com.buspass.admin.utils.ApiClient;
import com.buspass.admin.utils.TokenManager;
import com.google.android.material.card.MaterialCardView;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;

import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DashboardActivity extends AppCompatActivity {

    private AdminApiService apiService;

    private TextView adminNameText, avatarInitial;
    private TextView statTotalUsers, statPendingApps, statApprovedApps, statRevenue;
    private MaterialCardView cardApplications, cardUsers, cardRoutes, cardPayments, cardQrVerify, cardReports;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_dashboard);

        TokenManager.init(this);
        apiService = ApiClient.getClient().create(AdminApiService.class);

        initViews();
        setupWelcome();
        setupClickListeners();
        loadDashboardStats();
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadDashboardStats();
    }

    private void initViews() {
        adminNameText = findViewById(R.id.adminNameText);
        avatarInitial = findViewById(R.id.avatarInitial);
        statTotalUsers = findViewById(R.id.statTotalUsers);
        statPendingApps = findViewById(R.id.statPendingApps);
        statApprovedApps = findViewById(R.id.statApprovedApps);
        statRevenue = findViewById(R.id.statRevenue);
        cardApplications = findViewById(R.id.cardApplications);
        cardUsers = findViewById(R.id.cardUsers);
        cardRoutes = findViewById(R.id.cardRoutes);
        cardPayments = findViewById(R.id.cardPayments);
        cardQrVerify = findViewById(R.id.cardQrVerify);
        cardReports = findViewById(R.id.cardReports);
    }

    private void setupWelcome() {
        String name = TokenManager.getUserName();
        if (name != null && !name.isEmpty()) {
            adminNameText.setText(name);
            avatarInitial.setText(String.valueOf(name.charAt(0)).toUpperCase());
        } else {
            adminNameText.setText("Administrator");
            avatarInitial.setText("A");
        }
    }

    private void setupClickListeners() {
        cardApplications.setOnClickListener(v ->
                startActivity(new Intent(this, ApplicationsActivity.class)));

        cardUsers.setOnClickListener(v ->
                startActivity(new Intent(this, UsersActivity.class)));

        cardRoutes.setOnClickListener(v ->
                startActivity(new Intent(this, RoutesActivity.class)));

        cardPayments.setOnClickListener(v ->
                startActivity(new Intent(this, PaymentsActivity.class)));

        cardQrVerify.setOnClickListener(v ->
                startActivity(new Intent(this, QRScanActivity.class)));

        cardReports.setOnClickListener(v ->
                Toast.makeText(this, "Coming soon", Toast.LENGTH_SHORT).show());

        findViewById(R.id.logoutButton).setOnClickListener(v -> showLogoutDialog());
    }

    private void showLogoutDialog() {
        new MaterialAlertDialogBuilder(this)
                .setTitle("Logout")
                .setMessage("Are you sure you want to logout?")
                .setPositiveButton("Logout", (dialog, which) -> {
                    TokenManager.clearAll();
                    Intent intent = new Intent(DashboardActivity.this, LoginActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(intent);
                    finish();
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void loadDashboardStats() {
        apiService.getDashboardStats().enqueue(new Callback<DashboardResponse>() {
            @Override
            public void onResponse(Call<DashboardResponse> call, Response<DashboardResponse> response) {
                try {
                    if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                        DashboardResponse.Stats stats = response.body().getStats();
                        if (stats != null) {
                            updateStatsUI(stats);
                        }
                    }
                } catch (Exception e) {
                    Toast.makeText(DashboardActivity.this, "Failed to load stats", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<DashboardResponse> call, Throwable t) {
                Toast.makeText(DashboardActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void updateStatsUI(DashboardResponse.Stats stats) {
        if (stats.getUsers() != null) {
            statTotalUsers.setText(String.valueOf(stats.getUsers().getTotal()));
        }
        if (stats.getApplications() != null) {
            statPendingApps.setText(String.valueOf(stats.getApplications().getPending()));
            statApprovedApps.setText(String.valueOf(stats.getApplications().getApproved()));
        }
        if (stats.getRevenue() != null) {
            statRevenue.setText(String.format(Locale.getDefault(), "Rs.%.0f", stats.getRevenue().getTotal()));
        }
    }
}
