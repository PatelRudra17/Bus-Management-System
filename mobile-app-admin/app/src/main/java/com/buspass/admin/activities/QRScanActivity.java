package com.buspass.admin.activities;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.buspass.admin.R;
import com.buspass.admin.api.AdminApiService;
import com.buspass.admin.models.ApplicationDetailResponse;
import com.buspass.admin.models.ApplicationsListResponse;
import com.buspass.admin.utils.ApiClient;
import com.buspass.admin.utils.TokenManager;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.card.MaterialCardView;
import com.google.android.material.textfield.TextInputEditText;
import com.google.zxing.integration.android.IntentIntegrator;
import com.google.zxing.integration.android.IntentResult;

import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class QRScanActivity extends AppCompatActivity {

    private AdminApiService apiService;

    private MaterialButton verifyButton;
    private TextInputEditText passNumberInput;
    private ProgressBar progressBar;

    // Result card
    private MaterialCardView resultCard;
    private ImageView resultIcon;
    private TextView resultTitle;
    private TextView resultPassNumber, resultHolderName, resultRoute;
    private TextView resultPassType, resultValidUntil, resultStatus;

    // Error card
    private MaterialCardView errorCard;
    private TextView errorText;

    // Scanner placeholder - click to launch scanner
    private View scannerPlaceholder;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_qr_scan);

        TokenManager.init(this);
        apiService = ApiClient.getClient().create(AdminApiService.class);

        initViews();
        setupToolbar();
        setupListeners();
    }

    private void initViews() {
        verifyButton = findViewById(R.id.verifyButton);
        passNumberInput = findViewById(R.id.passNumberInput);
        progressBar = findViewById(R.id.progressBar);

        resultCard = findViewById(R.id.resultCard);
        resultIcon = findViewById(R.id.resultIcon);
        resultTitle = findViewById(R.id.resultTitle);
        resultPassNumber = findViewById(R.id.resultPassNumber);
        resultHolderName = findViewById(R.id.resultHolderName);
        resultRoute = findViewById(R.id.resultRoute);
        resultPassType = findViewById(R.id.resultPassType);
        resultValidUntil = findViewById(R.id.resultValidUntil);
        resultStatus = findViewById(R.id.resultStatus);

        errorCard = findViewById(R.id.errorCard);
        errorText = findViewById(R.id.errorText);

        scannerPlaceholder = findViewById(R.id.scannerPlaceholder);

        resultCard.setVisibility(View.GONE);
        errorCard.setVisibility(View.GONE);
    }

    private void setupToolbar() {
        findViewById(R.id.backButton).setOnClickListener(v -> onBackPressed());
    }

    private void setupListeners() {
        // Clicking the scanner placeholder or scanner container launches the scanner
        findViewById(R.id.scannerContainer).setOnClickListener(v -> launchScanner());
        if (scannerPlaceholder != null) {
            scannerPlaceholder.setOnClickListener(v -> launchScanner());
        }

        verifyButton.setOnClickListener(v -> {
            String passNumber = passNumberInput.getText() != null
                    ? passNumberInput.getText().toString().trim() : "";
            if (TextUtils.isEmpty(passNumber)) {
                passNumberInput.setError("Enter a pass number");
                return;
            }
            verifyPass(passNumber);
        });
    }

    private void launchScanner() {
        IntentIntegrator integrator = new IntentIntegrator(this);
        integrator.setDesiredBarcodeFormats(IntentIntegrator.QR_CODE);
        integrator.setPrompt("Scan bus pass QR code");
        integrator.setCameraId(0);
        integrator.setBeepEnabled(true);
        integrator.setBarcodeImageEnabled(false);
        integrator.setOrientationLocked(true);
        integrator.initiateScan();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        IntentResult result = IntentIntegrator.parseActivityResult(requestCode, resultCode, data);
        if (result != null) {
            if (result.getContents() != null) {
                String qrData = result.getContents();
                passNumberInput.setText(qrData);
                verifyPass(qrData);
            } else {
                Toast.makeText(this, "Scan cancelled", Toast.LENGTH_SHORT).show();
            }
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
    }

    private void verifyPass(String passNumberOrId) {
        resultCard.setVisibility(View.GONE);
        errorCard.setVisibility(View.GONE);
        progressBar.setVisibility(View.VISIBLE);

        apiService.getApplicationDetail(passNumberOrId).enqueue(new Callback<ApplicationDetailResponse>() {
            @Override
            public void onResponse(Call<ApplicationDetailResponse> call, Response<ApplicationDetailResponse> response) {
                progressBar.setVisibility(View.GONE);
                try {
                    if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                        ApplicationsListResponse.Application app = response.body().getApplication();
                        if (app != null) {
                            displayResult(app);
                        } else {
                            showError("Pass not found");
                        }
                    } else {
                        showError("Pass not found or invalid");
                    }
                } catch (Exception e) {
                    showError("Error: " + e.getMessage());
                }
            }

            @Override
            public void onFailure(Call<ApplicationDetailResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                showError("Network error: " + t.getMessage());
            }
        });
    }

    private void displayResult(ApplicationsListResponse.Application app) {
        resultCard.setVisibility(View.VISIBLE);
        errorCard.setVisibility(View.GONE);

        // Pass number
        resultPassNumber.setText(app.getPassNumber() != null ? app.getPassNumber()
                : (app.getApplicationId() != null ? app.getApplicationId() : "--"));

        // Holder name
        if (app.getUserId() != null && app.getUserId().getName() != null) {
            resultHolderName.setText(app.getUserId().getName());
        } else {
            resultHolderName.setText("Unknown");
        }

        // Route
        if (app.getRouteId() != null) {
            resultRoute.setText(String.format("%s -> %s",
                    app.getRouteId().getSource() != null ? app.getRouteId().getSource() : "",
                    app.getRouteId().getDestination() != null ? app.getRouteId().getDestination() : ""));
        } else {
            resultRoute.setText("N/A");
        }

        // Pass type
        resultPassType.setText(app.getPassType() != null ? app.getPassType() : "--");

        // Valid until
        resultValidUntil.setText("--");

        // Status
        String status = app.getStatus() != null ? app.getStatus() : "unknown";
        resultStatus.setText(status.toUpperCase());

        boolean isApproved = "approved".equalsIgnoreCase(status);
        if (isApproved) {
            resultStatus.setBackgroundResource(R.drawable.bg_status_approved);
            resultStatus.setTextColor(getResources().getColor(R.color.success));
            resultTitle.setText("Pass Verified");
            resultTitle.setTextColor(getResources().getColor(R.color.success));
            resultIcon.setColorFilter(getResources().getColor(R.color.success));
        } else if ("rejected".equalsIgnoreCase(status)) {
            resultStatus.setBackgroundResource(R.drawable.bg_status_rejected);
            resultStatus.setTextColor(getResources().getColor(R.color.error));
            resultTitle.setText("Pass Rejected");
            resultTitle.setTextColor(getResources().getColor(R.color.error));
            resultIcon.setColorFilter(getResources().getColor(R.color.error));
        } else {
            resultStatus.setBackgroundResource(R.drawable.bg_status_pending);
            resultStatus.setTextColor(getResources().getColor(R.color.warning));
            resultTitle.setText("Pass Pending");
            resultTitle.setTextColor(getResources().getColor(R.color.warning));
            resultIcon.setColorFilter(getResources().getColor(R.color.warning));
        }
    }

    private void showError(String message) {
        errorCard.setVisibility(View.VISIBLE);
        resultCard.setVisibility(View.GONE);
        errorText.setText(message);
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}
