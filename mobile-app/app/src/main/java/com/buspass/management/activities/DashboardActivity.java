package com.buspass.management.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;

import com.buspass.management.R;
import com.buspass.management.utils.TokenManager;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;

public class DashboardActivity extends AppCompatActivity {

    private TextView tvWelcome, tvAvatar;
    private CardView cardApplyPass, cardBookTicket, cardApplications, cardMyPasses, cardSmartCard, cardReportIssue, cardProfile;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            setContentView(R.layout.activity_dashboard);

            // Initialize views
            tvWelcome = findViewById(R.id.tvWelcome);
            tvAvatar = findViewById(R.id.tvAvatar);
            cardApplyPass = findViewById(R.id.cardApplyPass);
            cardBookTicket = findViewById(R.id.cardBookTicket);
            cardApplications = findViewById(R.id.cardApplications);
            cardMyPasses = findViewById(R.id.cardMyPasses);
            cardSmartCard = findViewById(R.id.cardSmartCard);
            cardReportIssue = findViewById(R.id.cardReportIssue);
            cardProfile = findViewById(R.id.cardProfile);

            // Set welcome message
            String userName = TokenManager.getUserName();
            if (userName == null || userName.isEmpty()) {
                userName = "User";
            }
            tvWelcome.setText("Welcome, " + userName);

            // Set avatar initial
            if (tvAvatar != null) {
                tvAvatar.setText(String.valueOf(userName.charAt(0)).toUpperCase());
            }

            // Logout button
            FrameLayout btnLogout = findViewById(R.id.btnLogout);
            if (btnLogout != null) {
                btnLogout.setOnClickListener(v -> showLogoutDialog());
            }

            // Set click listeners
            cardApplyPass.setOnClickListener(v -> {
                try {
                    startActivity(new Intent(this, ApplyPassActivity.class));
                } catch (Exception e) {
                    Toast.makeText(this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });

            cardBookTicket.setOnClickListener(v -> {
                try {
                    startActivity(new Intent(this, BookTicketActivity.class));
                } catch (Exception e) {
                    Toast.makeText(this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });

            cardApplications.setOnClickListener(v -> {
                try {
                    startActivity(new Intent(this, MyApplicationsActivity.class));
                } catch (Exception e) {
                    Toast.makeText(this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });

            cardMyPasses.setOnClickListener(v -> {
                try {
                    startActivity(new Intent(this, MyPassesActivity.class));
                } catch (Exception e) {
                    Toast.makeText(this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });

            cardSmartCard.setOnClickListener(v -> {
                try {
                    startActivity(new Intent(this, EnhancedSmartCardActivity.class));
                } catch (Exception e) {
                    Toast.makeText(this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });

            cardReportIssue.setOnClickListener(v -> {
                try {
                    startActivity(new Intent(this, ReportIssueActivity.class));
                } catch (Exception e) {
                    Toast.makeText(this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });

            cardProfile.setOnClickListener(v -> {
                Toast.makeText(this, "Profile feature coming soon", Toast.LENGTH_SHORT).show();
            });

        } catch (Exception e) {
            Toast.makeText(this, "Dashboard Error: " + e.getMessage(), Toast.LENGTH_LONG).show();
            e.printStackTrace();
        }
    }

    private void showLogoutDialog() {
        new MaterialAlertDialogBuilder(this)
                .setTitle("Logout")
                .setMessage("Are you sure you want to logout?")
                .setPositiveButton("Yes", (dialog, which) -> {
                    TokenManager.clearAll();
                    Intent intent = new Intent(DashboardActivity.this, LoginActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(intent);
                    finish();
                })
                .setNegativeButton("No", null)
                .show();
    }
}
