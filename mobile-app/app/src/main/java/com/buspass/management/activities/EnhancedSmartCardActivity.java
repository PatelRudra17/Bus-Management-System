package com.buspass.management.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.cardview.widget.CardView;

import com.buspass.management.R;
import com.buspass.management.api.ApiService;
import com.buspass.management.models.SmartCardResponse;
import com.buspass.management.models.TravelHistoryResponse;
import com.buspass.management.models.RechargeRequest;
import com.buspass.management.utils.ApiClient;
import com.google.android.material.tabs.TabLayout;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class EnhancedSmartCardActivity extends AppCompatActivity {

    private ProgressBar progressBar;
    private CardView cardContainer, noCardContainer;
    private Button btnApplyCard, btnRecharge;

    // Card Display
    private TextView tvCardNumber, tvBalance, tvTripCount, tvStatus, tvExpiryDate;
    private TextView tvConcession;
    private ImageView ivCardPhoto;

    // Tabs
    private TabLayout tabLayout;
    private LinearLayout tabOverview, tabHistory, tabTransactions;

    // Recharge
    private EditText etRechargeAmount;
    private Button btnSubmitRecharge, btnCancelRecharge;
    private LinearLayout rechargeSection;

    // Travel History
    private LinearLayout historyContainer;

    private SmartCardResponse.SmartCard smartCard;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_enhanced_smart_card);

        setupToolbar();
        initializeViews();
        setupTabs();
        fetchSmartCard();
    }

    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Smart Card");
        }
    }

    private void initializeViews() {
        progressBar = findViewById(R.id.progressBar);
        cardContainer = findViewById(R.id.cardContainer);
        noCardContainer = findViewById(R.id.noCardContainer);
        btnApplyCard = findViewById(R.id.btnApplyCard);

        // Card display
        tvCardNumber = findViewById(R.id.tvCardNumber);
        tvBalance = findViewById(R.id.tvBalance);
        tvTripCount = findViewById(R.id.tvTripCount);
        tvStatus = findViewById(R.id.tvStatus);
        tvExpiryDate = findViewById(R.id.tvExpiryDate);
        tvConcession = findViewById(R.id.tvConcession);
        ivCardPhoto = findViewById(R.id.ivCardPhoto);
        btnRecharge = findViewById(R.id.btnRecharge);

        // Tabs
        tabLayout = findViewById(R.id.tabLayout);
        tabOverview = findViewById(R.id.tabOverview);
        tabHistory = findViewById(R.id.tabHistory);
        tabTransactions = findViewById(R.id.tabTransactions);

        // Recharge section
        rechargeSection = findViewById(R.id.rechargeSection);
        etRechargeAmount = findViewById(R.id.etRechargeAmount);
        btnSubmitRecharge = findViewById(R.id.btnSubmitRecharge);
        btnCancelRecharge = findViewById(R.id.btnCancelRecharge);

        // History
        historyContainer = findViewById(R.id.historyContainer);

        // Button listeners
        btnApplyCard.setOnClickListener(v -> {
            // Navigate to Apply Smart Card activity
            Toast.makeText(this, "Apply Smart Card feature coming soon", Toast.LENGTH_SHORT).show();
        });

        btnRecharge.setOnClickListener(v -> showRechargeSection());
        btnSubmitRecharge.setOnClickListener(v -> submitRecharge());
        btnCancelRecharge.setOnClickListener(v -> hideRechargeSection());
    }

    private void setupTabs() {
        tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                int position = tab.getPosition();
                showTab(position);
            }

            @Override
            public void onTabUnselected(TabLayout.Tab tab) {}

            @Override
            public void onTabReselected(TabLayout.Tab tab) {}
        });
    }

    private void showTab(int position) {
        tabOverview.setVisibility(View.GONE);
        tabHistory.setVisibility(View.GONE);
        tabTransactions.setVisibility(View.GONE);

        switch (position) {
            case 0:
                tabOverview.setVisibility(View.VISIBLE);
                break;
            case 1:
                tabHistory.setVisibility(View.VISIBLE);
                loadTravelHistory();
                break;
            case 2:
                tabTransactions.setVisibility(View.VISIBLE);
                break;
        }
    }

    private void fetchSmartCard() {
        progressBar.setVisibility(View.VISIBLE);
        cardContainer.setVisibility(View.GONE);
        noCardContainer.setVisibility(View.GONE);

        ApiService apiService = ApiClient.getClient().create(ApiService.class);
        Call<SmartCardResponse> call = apiService.getMySmartCard();

        call.enqueue(new Callback<SmartCardResponse>() {
            @Override
            public void onResponse(Call<SmartCardResponse> call, Response<SmartCardResponse> response) {
                progressBar.setVisibility(View.GONE);

                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    smartCard = response.body().getData();
                    displayCard();
                } else {
                    showNoCard();
                }
            }

            @Override
            public void onFailure(Call<SmartCardResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                showNoCard();
                Toast.makeText(EnhancedSmartCardActivity.this,
                    "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void displayCard() {
        cardContainer.setVisibility(View.VISIBLE);
        noCardContainer.setVisibility(View.GONE);

        tvCardNumber.setText(smartCard.getCardNumber() != null ? smartCard.getCardNumber() : "N/A");
        tvBalance.setText("₹" + String.format(Locale.US, "%.2f", smartCard.getBalance()));
        tvTripCount.setText(smartCard.getStats() != null ? String.valueOf(smartCard.getStats().getTotalTrips()) : "0");
        tvStatus.setText(smartCard.getStatus() != null ? capitalizeFirst(smartCard.getStatus()) : "Unknown");

        try {
            SimpleDateFormat sdf = new SimpleDateFormat("MMM dd, yyyy", Locale.US);
            tvExpiryDate.setText("Valid until: " + sdf.format(new Date(smartCard.getExpiryDate())));
        } catch (Exception e) {
            tvExpiryDate.setText("Valid until: " + smartCard.getExpiryDate());
        }

        // Set status color
        switch (smartCard.getStatus().toLowerCase()) {
            case "active":
                tvStatus.setTextColor(getResources().getColor(android.R.color.holo_green_dark));
                break;
            case "blocked":
                tvStatus.setTextColor(getResources().getColor(android.R.color.holo_red_dark));
                break;
            default:
                tvStatus.setTextColor(getResources().getColor(android.R.color.holo_orange_dark));
        }

        // Concession
        if (smartCard.getConcessionType() != null && !smartCard.getConcessionType().equals("none")) {
            tvConcession.setVisibility(View.VISIBLE);
            tvConcession.setText("🎫 " + smartCard.getConcessionType().toUpperCase() +
                " - " + smartCard.getConcessionPercentage() + "% OFF");
        } else {
            tvConcession.setVisibility(View.GONE);
        }
    }

    private void showNoCard() {
        cardContainer.setVisibility(View.GONE);
        noCardContainer.setVisibility(View.VISIBLE);
    }

    private void showRechargeSection() {
        rechargeSection.setVisibility(View.VISIBLE);
        btnRecharge.setVisibility(View.GONE);
    }

    private void hideRechargeSection() {
        rechargeSection.setVisibility(View.GONE);
        btnRecharge.setVisibility(View.VISIBLE);
        etRechargeAmount.setText("");
    }

    private void submitRecharge() {
        String amountStr = etRechargeAmount.getText().toString().trim();
        if (amountStr.isEmpty()) {
            Toast.makeText(this, "Please enter amount", Toast.LENGTH_SHORT).show();
            return;
        }

        double amount = Double.parseDouble(amountStr);
        if (amount <= 0) {
            Toast.makeText(this, "Please enter a valid amount", Toast.LENGTH_SHORT).show();
            return;
        }

        btnSubmitRecharge.setEnabled(false);
        btnSubmitRecharge.setText("Processing...");

        ApiService apiService = ApiClient.getClient().create(ApiService.class);
        RechargeRequest request = new RechargeRequest(amount, "upi"); // Default payment method
        Call<SmartCardResponse> call = apiService.rechargeCard(request);

        call.enqueue(new Callback<SmartCardResponse>() {
            @Override
            public void onResponse(Call<SmartCardResponse> call, Response<SmartCardResponse> response) {
                btnSubmitRecharge.setEnabled(true);
                btnSubmitRecharge.setText("Recharge");

                if (response.isSuccessful()) {
                    Toast.makeText(EnhancedSmartCardActivity.this,
                        "Recharge successful!", Toast.LENGTH_LONG).show();
                    hideRechargeSection();
                    fetchSmartCard();
                } else {
                    Toast.makeText(EnhancedSmartCardActivity.this,
                        "Recharge failed: " + response.message(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<SmartCardResponse> call, Throwable t) {
                btnSubmitRecharge.setEnabled(true);
                btnSubmitRecharge.setText("Recharge");
                Toast.makeText(EnhancedSmartCardActivity.this,
                    "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void loadTravelHistory() {
        ApiService apiService = ApiClient.getClient().create(ApiService.class);
        Call<TravelHistoryResponse> call = apiService.getTravelHistory();

        call.enqueue(new Callback<TravelHistoryResponse>() {
            @Override
            public void onResponse(Call<TravelHistoryResponse> call, Response<TravelHistoryResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    displayTravelHistory(response.body().getData());
                }
            }

            @Override
            public void onFailure(Call<TravelHistoryResponse> call, Throwable t) {
                Toast.makeText(EnhancedSmartCardActivity.this,
                    "Failed to load history", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void displayTravelHistory(List<TravelHistoryResponse.TravelLog> history) {
        historyContainer.removeAllViews();

        if (history == null || history.isEmpty()) {
            TextView tvEmpty = new TextView(this);
            tvEmpty.setText("No travel history yet");
            tvEmpty.setTextSize(14);
            tvEmpty.setTextColor(getResources().getColor(android.R.color.darker_gray));
            tvEmpty.setPadding(16, 16, 16, 16);
            historyContainer.addView(tvEmpty);
            return;
        }

        for (TravelHistoryResponse.TravelLog log : history) {
            View itemView = getLayoutInflater().inflate(R.layout.item_travel_history, null);

            TextView tvRoute = itemView.findViewById(R.id.tvRoute);
            TextView tvDate = itemView.findViewById(R.id.tvDate);
            TextView tvFare = itemView.findViewById(R.id.tvFare);

            tvRoute.setText(log.getFromStop() + " → " + log.getToStop());
            tvDate.setText(log.getTravelDate());
            tvFare.setText("₹" + log.getFare());

            historyContainer.addView(itemView);
        }
    }

    private String capitalizeFirst(String text) {
        if (text == null || text.isEmpty()) return text;
        return text.substring(0, 1).toUpperCase() + text.substring(1);
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}
