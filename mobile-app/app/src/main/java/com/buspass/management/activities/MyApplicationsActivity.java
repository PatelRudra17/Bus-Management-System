package com.buspass.management.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.cardview.widget.CardView;

import com.buspass.management.R;
import com.buspass.management.api.ApiService;
import com.buspass.management.models.ApplicationsResponse;
import com.buspass.management.models.PassApplication;
import com.buspass.management.utils.ApiClient;
import com.google.android.material.chip.Chip;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MyApplicationsActivity extends AppCompatActivity {

    private Toolbar toolbar;
    private Button btnAll, btnPending, btnApproved, btnRejected;
    private LinearLayout applicationsContainer;
    private ProgressBar progressBar;
    private TextView tvEmptyState;
    private Button btnApplyNew;

    private List<PassApplication> allApplications = new ArrayList<>();
    private String currentFilter = "all";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_my_applications);

        setupToolbar();
        initializeViews();
        setupFilterButtons();
        fetchApplications();
    }

    private void setupToolbar() {
        toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("My Applications");
        }
    }

    private void initializeViews() {
        btnAll = findViewById(R.id.btnAll);
        btnPending = findViewById(R.id.btnPending);
        btnApproved = findViewById(R.id.btnApproved);
        btnRejected = findViewById(R.id.btnRejected);
        applicationsContainer = findViewById(R.id.applicationsContainer);
        progressBar = findViewById(R.id.progressBar);
        tvEmptyState = findViewById(R.id.tvEmptyState);
        btnApplyNew = findViewById(R.id.btnApplyNew);

        btnApplyNew.setOnClickListener(v -> {
            startActivity(new Intent(this, ApplyPassActivity.class));
        });
    }

    private void setupFilterButtons() {
        btnAll.setOnClickListener(v -> applyFilter("all"));
        btnPending.setOnClickListener(v -> applyFilter("pending"));
        btnApproved.setOnClickListener(v -> applyFilter("approved"));
        btnRejected.setOnClickListener(v -> applyFilter("rejected"));
    }

    private void fetchApplications() {
        progressBar.setVisibility(View.VISIBLE);
        applicationsContainer.setVisibility(View.GONE);
        tvEmptyState.setVisibility(View.GONE);

        ApiService apiService = ApiClient.getClient().create(ApiService.class);
        Call<ApplicationsResponse> call = apiService.getMyApplications();

        call.enqueue(new Callback<ApplicationsResponse>() {
            @Override
            public void onResponse(Call<ApplicationsResponse> call, Response<ApplicationsResponse> response) {
                progressBar.setVisibility(View.GONE);

                if (response.isSuccessful() && response.body() != null) {
                    allApplications = response.body().getApplications();
                    updateFilterCounts();
                    displayApplications();
                } else {
                    Toast.makeText(MyApplicationsActivity.this,
                        "Failed to load applications", Toast.LENGTH_SHORT).show();
                    tvEmptyState.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public void onFailure(Call<ApplicationsResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                tvEmptyState.setVisibility(View.VISIBLE);
                tvEmptyState.setText("Unable to load applications. Please check your connection.");
                // Log the error but don't show technical details to user
                android.util.Log.e("MyApplications", "Error loading applications", t);
            }
        });
    }

    private void applyFilter(String filter) {
        currentFilter = filter;

        // Update button states
        resetFilterButtons();
        switch (filter) {
            case "all":
                btnAll.setBackgroundColor(getResources().getColor(R.color.primary));
                btnAll.setTextColor(getResources().getColor(android.R.color.white));
                break;
            case "pending":
                btnPending.setBackgroundColor(getResources().getColor(R.color.primary));
                btnPending.setTextColor(getResources().getColor(android.R.color.white));
                break;
            case "approved":
                btnApproved.setBackgroundColor(getResources().getColor(R.color.primary));
                btnApproved.setTextColor(getResources().getColor(android.R.color.white));
                break;
            case "rejected":
                btnRejected.setBackgroundColor(getResources().getColor(R.color.primary));
                btnRejected.setTextColor(getResources().getColor(android.R.color.white));
                break;
        }

        displayApplications();
    }

    private void resetFilterButtons() {
        int defaultBg = getResources().getColor(android.R.color.white);
        int defaultText = getResources().getColor(R.color.primary);

        btnAll.setBackgroundColor(defaultBg);
        btnAll.setTextColor(defaultText);
        btnPending.setBackgroundColor(defaultBg);
        btnPending.setTextColor(defaultText);
        btnApproved.setBackgroundColor(defaultBg);
        btnApproved.setTextColor(defaultText);
        btnRejected.setBackgroundColor(defaultBg);
        btnRejected.setTextColor(defaultText);
    }

    private void updateFilterCounts() {
        int pendingCount = 0, approvedCount = 0, rejectedCount = 0;

        for (PassApplication app : allApplications) {
            if (app.getStatus() == null) continue;
            switch (app.getStatus().toLowerCase()) {
                case "pending":
                    pendingCount++;
                    break;
                case "approved":
                    approvedCount++;
                    break;
                case "rejected":
                    rejectedCount++;
                    break;
            }
        }

        btnAll.setText("All (" + allApplications.size() + ")");
        btnPending.setText("Pending (" + pendingCount + ")");
        btnApproved.setText("Approved (" + approvedCount + ")");
        btnRejected.setText("Rejected (" + rejectedCount + ")");
    }

    private void displayApplications() {
        applicationsContainer.removeAllViews();

        List<PassApplication> filtered = getFilteredApplications();

        if (filtered.isEmpty()) {
            applicationsContainer.setVisibility(View.GONE);
            tvEmptyState.setVisibility(View.VISIBLE);
            tvEmptyState.setText("No " + currentFilter + " applications found");
        } else {
            applicationsContainer.setVisibility(View.VISIBLE);
            tvEmptyState.setVisibility(View.GONE);

            for (PassApplication app : filtered) {
                applicationsContainer.addView(createApplicationCard(app));
            }
        }
    }

    private List<PassApplication> getFilteredApplications() {
        if (currentFilter.equals("all")) {
            return allApplications;
        }

        List<PassApplication> filtered = new ArrayList<>();
        for (PassApplication app : allApplications) {
            if (app.getStatus().toLowerCase().equals(currentFilter)) {
                filtered.add(app);
            }
        }
        return filtered;
    }

    private View createApplicationCard(PassApplication app) {
        View cardView = getLayoutInflater().inflate(R.layout.item_application, null);

        TextView tvApplicationId = cardView.findViewById(R.id.tvApplicationId);
        TextView tvPassType = cardView.findViewById(R.id.tvPassType);
        TextView tvDuration = cardView.findViewById(R.id.tvDuration);
        TextView tvAmount = cardView.findViewById(R.id.tvAmount);
        TextView tvDate = cardView.findViewById(R.id.tvDate);
        Chip chipStatus = cardView.findViewById(R.id.chipStatus);
        Button btnView = cardView.findViewById(R.id.btnViewApplication);

        tvApplicationId.setText(app.getId().substring(0, Math.min(8, app.getId().length())).toUpperCase());
        tvPassType.setText(capitalizeFirst(app.getPassType()));
        tvDuration.setText(formatDuration(app.getDuration()));
        tvAmount.setText("₹" + app.getTotalAmount());

        SimpleDateFormat sdf = new SimpleDateFormat("MMM dd, yyyy", Locale.US);
        try {
            tvDate.setText("Applied: " + sdf.format(new java.util.Date(app.getCreatedAt())));
        } catch (Exception e) {
            tvDate.setText("Applied: " + app.getCreatedAt());
        }

        // Set status chip
        String status = app.getStatus().toLowerCase();
        chipStatus.setText(capitalizeFirst(status));
        switch (status) {
            case "pending":
                chipStatus.setChipBackgroundColorResource(android.R.color.holo_orange_light);
                break;
            case "approved":
                chipStatus.setChipBackgroundColorResource(android.R.color.holo_green_light);
                break;
            case "rejected":
                chipStatus.setChipBackgroundColorResource(android.R.color.holo_red_light);
                break;
            default:
                chipStatus.setChipBackgroundColorResource(android.R.color.darker_gray);
        }

        btnView.setOnClickListener(v -> {
            Intent intent = new Intent(this, PassDetailsActivity.class);
            intent.putExtra("applicationId", app.getId());
            startActivity(intent);
        });

        return cardView;
    }

    private String capitalizeFirst(String text) {
        if (text == null || text.isEmpty()) return text;
        return text.substring(0, 1).toUpperCase() + text.substring(1);
    }

    private String formatDuration(String duration) {
        if (duration == null) return "";
        return duration.replace("month", " Month").replace("months", " Months");
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}
