package com.buspass.admin.activities;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextUtils;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.buspass.admin.R;
import com.buspass.admin.api.AdminApiService;
import com.buspass.admin.models.ApplicationDetailResponse;
import com.buspass.admin.models.ApplicationsListResponse;
import com.buspass.admin.models.RemarksRequest;
import com.buspass.admin.utils.ApiClient;
import com.buspass.admin.utils.TokenManager;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ApplicationsActivity extends AppCompatActivity {

    private AdminApiService apiService;
    private RecyclerView applicationsRecycler;
    private EditText searchInput;
    private TextView chipAll, chipPending, chipApproved, chipRejected;
    private LinearLayout emptyState;
    private ProgressBar progressBar;

    private ApplicationAdapter adapter;
    private List<ApplicationsListResponse.Application> applicationsList = new ArrayList<>();
    private String currentFilter = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_applications);

        TokenManager.init(this);
        apiService = ApiClient.getClient().create(AdminApiService.class);

        initViews();
        setupToolbar();
        setupRecyclerView();
        setupSearch();
        setupFilters();
        loadApplications();
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadApplications();
    }

    private void initViews() {
        applicationsRecycler = findViewById(R.id.applicationsRecycler);
        searchInput = findViewById(R.id.searchInput);
        chipAll = findViewById(R.id.chipAll);
        chipPending = findViewById(R.id.chipPending);
        chipApproved = findViewById(R.id.chipApproved);
        chipRejected = findViewById(R.id.chipRejected);
        emptyState = findViewById(R.id.emptyState);
        progressBar = findViewById(R.id.progressBar);
    }

    private void setupToolbar() {
        findViewById(R.id.backButton).setOnClickListener(v -> onBackPressed());
        findViewById(R.id.refreshButton).setOnClickListener(v -> loadApplications());
    }

    private void setupRecyclerView() {
        adapter = new ApplicationAdapter();
        applicationsRecycler.setLayoutManager(new LinearLayoutManager(this));
        applicationsRecycler.setAdapter(adapter);
    }

    private void setupSearch() {
        searchInput.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}
            @Override
            public void afterTextChanged(Editable s) {
                loadApplications();
            }
        });
    }

    private void setupFilters() {
        chipAll.setOnClickListener(v -> {
            currentFilter = "";
            updateChipSelection(chipAll);
            loadApplications();
        });
        chipPending.setOnClickListener(v -> {
            currentFilter = "pending";
            updateChipSelection(chipPending);
            loadApplications();
        });
        chipApproved.setOnClickListener(v -> {
            currentFilter = "approved";
            updateChipSelection(chipApproved);
            loadApplications();
        });
        chipRejected.setOnClickListener(v -> {
            currentFilter = "rejected";
            updateChipSelection(chipRejected);
            loadApplications();
        });

        // Default selection
        updateChipSelection(chipAll);
    }

    private void updateChipSelection(TextView selected) {
        TextView[] chips = {chipAll, chipPending, chipApproved, chipRejected};
        for (TextView chip : chips) {
            chip.setSelected(false);
            chip.setBackgroundResource(R.drawable.bg_filter_chip);
            chip.setTextColor(getResources().getColor(R.color.text_secondary));
        }
        selected.setSelected(true);
        selected.setBackgroundResource(R.drawable.bg_filter_chip);
        selected.setTextColor(getResources().getColor(R.color.white));
    }

    private void loadApplications() {
        progressBar.setVisibility(View.VISIBLE);
        emptyState.setVisibility(View.GONE);

        Map<String, String> params = new HashMap<>();
        if (!TextUtils.isEmpty(currentFilter)) {
            params.put("status", currentFilter);
        }
        String search = searchInput.getText().toString().trim();
        if (!TextUtils.isEmpty(search)) {
            params.put("applicationId", search);
        }

        apiService.getApplications(params).enqueue(new Callback<ApplicationsListResponse>() {
            @Override
            public void onResponse(Call<ApplicationsListResponse> call, Response<ApplicationsListResponse> response) {
                progressBar.setVisibility(View.GONE);
                try {
                    if (response.isSuccessful() && response.body() != null) {
                        applicationsList = response.body().getApplications();
                        adapter.notifyDataSetChanged();
                        emptyState.setVisibility(applicationsList.isEmpty() ? View.VISIBLE : View.GONE);
                        applicationsRecycler.setVisibility(applicationsList.isEmpty() ? View.GONE : View.VISIBLE);
                    } else {
                        Toast.makeText(ApplicationsActivity.this, "Failed to load applications", Toast.LENGTH_SHORT).show();
                    }
                } catch (Exception e) {
                    Toast.makeText(ApplicationsActivity.this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApplicationsListResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(ApplicationsActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private String formatDate(String isoDate) {
        if (isoDate == null) return "N/A";
        try {
            SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault());
            Date date = inputFormat.parse(isoDate);
            SimpleDateFormat outputFormat = new SimpleDateFormat("MMM dd, yyyy", Locale.getDefault());
            return outputFormat.format(date);
        } catch (ParseException e) {
            return isoDate.length() > 10 ? isoDate.substring(0, 10) : isoDate;
        }
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }

    // ======================== Inner Adapter Class ========================

    class ApplicationAdapter extends RecyclerView.Adapter<ApplicationAdapter.ViewHolder> {

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(parent.getContext())
                    .inflate(R.layout.item_admin_application, parent, false);
            return new ViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            ApplicationsListResponse.Application app = applicationsList.get(position);

            // Application ID
            holder.applicationId.setText(app.getApplicationId() != null
                    ? "#" + app.getApplicationId() : "N/A");

            // Status badge
            String status = app.getStatus() != null ? app.getStatus() : "pending";
            holder.statusBadge.setText(status.toUpperCase());
            switch (status.toLowerCase()) {
                case "approved":
                    holder.statusBadge.setBackgroundResource(R.drawable.bg_status_approved);
                    holder.statusBadge.setTextColor(getResources().getColor(R.color.success));
                    break;
                case "rejected":
                    holder.statusBadge.setBackgroundResource(R.drawable.bg_status_rejected);
                    holder.statusBadge.setTextColor(getResources().getColor(R.color.error));
                    break;
                default:
                    holder.statusBadge.setBackgroundResource(R.drawable.bg_status_pending);
                    holder.statusBadge.setTextColor(getResources().getColor(R.color.warning));
                    break;
            }

            // User info
            if (app.getUserId() != null) {
                holder.userName.setText(app.getUserId().getName() != null
                        ? app.getUserId().getName() : "Unknown");
                holder.userEmail.setText(app.getUserId().getEmail() != null
                        ? app.getUserId().getEmail() : "");
            } else {
                holder.userName.setText("Unknown User");
                holder.userEmail.setText("");
            }

            // Pass details
            holder.passType.setText(app.getPassType() != null ? app.getPassType() : "N/A");
            holder.duration.setText(app.getDuration() != null ? app.getDuration() : "N/A");
            holder.amount.setText(String.format(Locale.getDefault(), "Rs.%d", app.getTotalAmount()));
            holder.dateText.setText(formatDate(app.getCreatedAt()));

            // Action buttons - only show for pending applications
            boolean isPending = "pending".equalsIgnoreCase(status);
            holder.approveButton.setVisibility(isPending ? View.VISIBLE : View.GONE);
            holder.rejectButton.setVisibility(isPending ? View.VISIBLE : View.GONE);

            holder.approveButton.setOnClickListener(v -> {
                RemarksRequest request = new RemarksRequest("");
                apiService.approveApplication(app.getId(), request).enqueue(new Callback<ApplicationDetailResponse>() {
                    @Override
                    public void onResponse(Call<ApplicationDetailResponse> call, Response<ApplicationDetailResponse> response) {
                        try {
                            if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                                Toast.makeText(ApplicationsActivity.this, "Application approved", Toast.LENGTH_SHORT).show();
                                loadApplications();
                            } else {
                                Toast.makeText(ApplicationsActivity.this, "Failed to approve", Toast.LENGTH_SHORT).show();
                            }
                        } catch (Exception e) {
                            Toast.makeText(ApplicationsActivity.this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<ApplicationDetailResponse> call, Throwable t) {
                        Toast.makeText(ApplicationsActivity.this, "Network error", Toast.LENGTH_SHORT).show();
                    }
                });
            });

            holder.rejectButton.setOnClickListener(v -> showRejectDialog(app.getId()));

            // Review button -> open detail
            holder.reviewButton.setOnClickListener(v -> {
                Intent intent = new Intent(ApplicationsActivity.this, ApplicationDetailActivity.class);
                intent.putExtra("app_id", app.getId());
                startActivity(intent);
            });

            // Click item to open detail
            holder.itemView.setOnClickListener(v -> {
                Intent intent = new Intent(ApplicationsActivity.this, ApplicationDetailActivity.class);
                intent.putExtra("app_id", app.getId());
                startActivity(intent);
            });
        }

        @Override
        public int getItemCount() {
            return applicationsList.size();
        }

        class ViewHolder extends RecyclerView.ViewHolder {
            TextView applicationId, statusBadge, userName, userEmail;
            TextView passType, duration, amount, dateText;
            MaterialButton approveButton, rejectButton, reviewButton;

            ViewHolder(@NonNull View itemView) {
                super(itemView);
                applicationId = itemView.findViewById(R.id.applicationId);
                statusBadge = itemView.findViewById(R.id.statusBadge);
                userName = itemView.findViewById(R.id.userName);
                userEmail = itemView.findViewById(R.id.userEmail);
                passType = itemView.findViewById(R.id.passType);
                duration = itemView.findViewById(R.id.duration);
                amount = itemView.findViewById(R.id.amount);
                dateText = itemView.findViewById(R.id.dateText);
                approveButton = itemView.findViewById(R.id.approveButton);
                rejectButton = itemView.findViewById(R.id.rejectButton);
                reviewButton = itemView.findViewById(R.id.reviewButton);
            }
        }
    }

    private void showRejectDialog(String appId) {
        final EditText input = new EditText(this);
        input.setHint("Enter rejection reason...");
        input.setPadding(48, 32, 48, 32);

        new MaterialAlertDialogBuilder(this)
                .setTitle("Reject Application")
                .setMessage("Please provide a reason for rejection:")
                .setView(input)
                .setPositiveButton("Reject", (dialog, which) -> {
                    String remarks = input.getText().toString().trim();
                    RemarksRequest request = new RemarksRequest(remarks);
                    apiService.rejectApplication(appId, request).enqueue(new Callback<ApplicationDetailResponse>() {
                        @Override
                        public void onResponse(Call<ApplicationDetailResponse> call, Response<ApplicationDetailResponse> response) {
                            try {
                                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                                    Toast.makeText(ApplicationsActivity.this, "Application rejected", Toast.LENGTH_SHORT).show();
                                    loadApplications();
                                } else {
                                    Toast.makeText(ApplicationsActivity.this, "Failed to reject", Toast.LENGTH_SHORT).show();
                                }
                            } catch (Exception e) {
                                Toast.makeText(ApplicationsActivity.this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                            }
                        }

                        @Override
                        public void onFailure(Call<ApplicationDetailResponse> call, Throwable t) {
                            Toast.makeText(ApplicationsActivity.this, "Network error", Toast.LENGTH_SHORT).show();
                        }
                    });
                })
                .setNegativeButton("Cancel", null)
                .show();
    }
}
