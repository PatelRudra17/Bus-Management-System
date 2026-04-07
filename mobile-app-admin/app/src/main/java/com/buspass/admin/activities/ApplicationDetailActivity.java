package com.buspass.admin.activities;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Base64;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.buspass.admin.R;
import com.buspass.admin.api.AdminApiService;
import com.buspass.admin.models.ApplicationDetailResponse;
import com.buspass.admin.models.ApplicationsListResponse;
import com.buspass.admin.models.RemarksRequest;
import com.buspass.admin.utils.ApiClient;
import com.buspass.admin.utils.TokenManager;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ApplicationDetailActivity extends AppCompatActivity {

    private AdminApiService apiService;
    private String appId;

    // Application info card
    private TextView applicationIdText, statusBadge, passNumber;
    // User info card
    private TextView userName, userEmail, userPhone;
    // Route info card
    private TextView routeNumber, routePath;
    // Pass details card
    private TextView passType, passDuration, passAmount, startDate, endDate;
    // Documents
    private ImageView idProofImage, photoImage;
    // Remarks
    private TextInputEditText remarksInput;
    // Action buttons
    private LinearLayout actionButtons;
    private MaterialButton approveButton, rejectButton;
    // Loading
    private ProgressBar progressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_application_detail);

        TokenManager.init(this);
        apiService = ApiClient.getClient().create(AdminApiService.class);

        appId = getIntent().getStringExtra("app_id");
        if (TextUtils.isEmpty(appId)) {
            Toast.makeText(this, "Invalid application ID", Toast.LENGTH_SHORT).show();
            finish();
            return;
        }

        initViews();
        setupToolbar();
        loadApplicationDetail();
    }

    private void initViews() {
        applicationIdText = findViewById(R.id.applicationId);
        statusBadge = findViewById(R.id.statusBadge);
        passNumber = findViewById(R.id.passNumber);
        userName = findViewById(R.id.userName);
        userEmail = findViewById(R.id.userEmail);
        userPhone = findViewById(R.id.userPhone);
        routeNumber = findViewById(R.id.routeNumber);
        routePath = findViewById(R.id.routePath);
        passType = findViewById(R.id.passType);
        passDuration = findViewById(R.id.passDuration);
        passAmount = findViewById(R.id.passAmount);
        startDate = findViewById(R.id.startDate);
        endDate = findViewById(R.id.endDate);
        idProofImage = findViewById(R.id.idProofImage);
        photoImage = findViewById(R.id.photoImage);
        remarksInput = findViewById(R.id.remarksInput);
        actionButtons = findViewById(R.id.actionButtons);
        approveButton = findViewById(R.id.approveButton);
        rejectButton = findViewById(R.id.rejectButton);
        progressBar = findViewById(R.id.progressBar);
    }

    private void setupToolbar() {
        findViewById(R.id.backButton).setOnClickListener(v -> onBackPressed());
    }

    private void loadApplicationDetail() {
        progressBar.setVisibility(View.VISIBLE);

        apiService.getApplicationDetail(appId).enqueue(new Callback<ApplicationDetailResponse>() {
            @Override
            public void onResponse(Call<ApplicationDetailResponse> call, Response<ApplicationDetailResponse> response) {
                progressBar.setVisibility(View.GONE);
                try {
                    if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                        ApplicationsListResponse.Application app = response.body().getApplication();
                        if (app != null) {
                            populateDetails(app);
                        } else {
                            Toast.makeText(ApplicationDetailActivity.this, "Application not found", Toast.LENGTH_SHORT).show();
                            finish();
                        }
                    } else {
                        Toast.makeText(ApplicationDetailActivity.this, "Failed to load details", Toast.LENGTH_SHORT).show();
                        finish();
                    }
                } catch (Exception e) {
                    Toast.makeText(ApplicationDetailActivity.this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApplicationDetailResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(ApplicationDetailActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void populateDetails(ApplicationsListResponse.Application app) {
        // Application ID
        applicationIdText.setText(app.getApplicationId() != null ? "#" + app.getApplicationId() : "N/A");

        // Status badge
        String status = app.getStatus() != null ? app.getStatus() : "pending";
        statusBadge.setText(status.toUpperCase());
        switch (status.toLowerCase()) {
            case "approved":
                statusBadge.setBackgroundResource(R.drawable.bg_status_approved);
                statusBadge.setTextColor(getResources().getColor(R.color.success));
                break;
            case "rejected":
                statusBadge.setBackgroundResource(R.drawable.bg_status_rejected);
                statusBadge.setTextColor(getResources().getColor(R.color.error));
                break;
            default:
                statusBadge.setBackgroundResource(R.drawable.bg_status_pending);
                statusBadge.setTextColor(getResources().getColor(R.color.warning));
                break;
        }

        // Pass number
        passNumber.setText(app.getPassNumber() != null ? app.getPassNumber() : "--");

        // User info
        if (app.getUserId() != null) {
            userName.setText(app.getUserId().getName() != null ? app.getUserId().getName() : "N/A");
            userEmail.setText(app.getUserId().getEmail() != null ? app.getUserId().getEmail() : "N/A");
            userPhone.setText(app.getUserId().getPhone() != null ? app.getUserId().getPhone() : "--");
        } else {
            userName.setText("N/A");
            userEmail.setText("N/A");
            userPhone.setText("--");
        }

        // Route info
        if (app.getRouteId() != null) {
            routeNumber.setText(app.getRouteId().getRouteNumber() != null
                    ? app.getRouteId().getRouteNumber() : "--");
            String path = String.format("%s -> %s",
                    app.getRouteId().getSource() != null ? app.getRouteId().getSource() : "",
                    app.getRouteId().getDestination() != null ? app.getRouteId().getDestination() : "");
            routePath.setText(path);
        } else {
            routeNumber.setText("--");
            routePath.setText("N/A");
        }

        // Pass details
        passType.setText(app.getPassType() != null ? app.getPassType() : "N/A");
        passDuration.setText(app.getDuration() != null ? app.getDuration() : "N/A");
        passAmount.setText(String.format(Locale.getDefault(), "Rs.%d", app.getTotalAmount()));
        startDate.setText(formatDate(app.getCreatedAt()));
        endDate.setText("--");

        // Existing remarks
        if (app.getRemarks() != null && !app.getRemarks().isEmpty()) {
            remarksInput.setText(app.getRemarks());
        }

        // Documents
        if (app.getDocuments() != null) {
            if (app.getDocuments().getIdProof() != null && !app.getDocuments().getIdProof().isEmpty()) {
                loadBase64Image(app.getDocuments().getIdProof(), idProofImage);
            }
            if (app.getDocuments().getPhoto() != null && !app.getDocuments().getPhoto().isEmpty()) {
                loadBase64Image(app.getDocuments().getPhoto(), photoImage);
            }
        }

        // Action buttons - only for pending
        boolean isPending = "pending".equalsIgnoreCase(status);
        actionButtons.setVisibility(isPending ? View.VISIBLE : View.GONE);
        remarksInput.setEnabled(isPending);

        if (isPending) {
            approveButton.setOnClickListener(v -> approveApplication());
            rejectButton.setOnClickListener(v -> rejectApplication());
        }
    }

    private void loadBase64Image(String base64String, ImageView imageView) {
        try {
            // Remove data URI prefix if present
            String base64Data = base64String;
            if (base64Data.contains(",")) {
                base64Data = base64Data.substring(base64Data.indexOf(",") + 1);
            }
            byte[] decodedBytes = Base64.decode(base64Data, Base64.DEFAULT);
            Bitmap bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.length);
            if (bitmap != null) {
                imageView.setImageBitmap(bitmap);
            }
        } catch (Exception e) {
            // Failed to decode image, leave default
        }
    }

    private void approveApplication() {
        String remarks = remarksInput.getText() != null ? remarksInput.getText().toString().trim() : "";
        approveButton.setEnabled(false);
        rejectButton.setEnabled(false);

        RemarksRequest request = new RemarksRequest(remarks);
        apiService.approveApplication(appId, request).enqueue(new Callback<ApplicationDetailResponse>() {
            @Override
            public void onResponse(Call<ApplicationDetailResponse> call, Response<ApplicationDetailResponse> response) {
                try {
                    if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                        Toast.makeText(ApplicationDetailActivity.this, "Application approved successfully", Toast.LENGTH_SHORT).show();
                        finish();
                    } else {
                        String msg = response.body() != null && response.body().getMessage() != null
                                ? response.body().getMessage() : "Failed to approve";
                        Toast.makeText(ApplicationDetailActivity.this, msg, Toast.LENGTH_SHORT).show();
                        approveButton.setEnabled(true);
                        rejectButton.setEnabled(true);
                    }
                } catch (Exception e) {
                    Toast.makeText(ApplicationDetailActivity.this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                    approveButton.setEnabled(true);
                    rejectButton.setEnabled(true);
                }
            }

            @Override
            public void onFailure(Call<ApplicationDetailResponse> call, Throwable t) {
                Toast.makeText(ApplicationDetailActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                approveButton.setEnabled(true);
                rejectButton.setEnabled(true);
            }
        });
    }

    private void rejectApplication() {
        String remarks = remarksInput.getText() != null ? remarksInput.getText().toString().trim() : "";
        if (remarks.isEmpty()) {
            remarksInput.setError("Please provide a reason for rejection");
            return;
        }
        approveButton.setEnabled(false);
        rejectButton.setEnabled(false);

        RemarksRequest request = new RemarksRequest(remarks);
        apiService.rejectApplication(appId, request).enqueue(new Callback<ApplicationDetailResponse>() {
            @Override
            public void onResponse(Call<ApplicationDetailResponse> call, Response<ApplicationDetailResponse> response) {
                try {
                    if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                        Toast.makeText(ApplicationDetailActivity.this, "Application rejected successfully", Toast.LENGTH_SHORT).show();
                        finish();
                    } else {
                        String msg = response.body() != null && response.body().getMessage() != null
                                ? response.body().getMessage() : "Failed to reject";
                        Toast.makeText(ApplicationDetailActivity.this, msg, Toast.LENGTH_SHORT).show();
                        approveButton.setEnabled(true);
                        rejectButton.setEnabled(true);
                    }
                } catch (Exception e) {
                    Toast.makeText(ApplicationDetailActivity.this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                    approveButton.setEnabled(true);
                    rejectButton.setEnabled(true);
                }
            }

            @Override
            public void onFailure(Call<ApplicationDetailResponse> call, Throwable t) {
                Toast.makeText(ApplicationDetailActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                approveButton.setEnabled(true);
                rejectButton.setEnabled(true);
            }
        });
    }

    private String formatDate(String isoDate) {
        if (isoDate == null) return "--";
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
}
