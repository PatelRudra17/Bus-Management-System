package com.buspass.admin.activities;

import android.os.Bundle;
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
import com.buspass.admin.models.ApiResponse;
import com.buspass.admin.models.PaymentStatsResponse;
import com.buspass.admin.models.PaymentsListResponse;
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

public class PaymentsActivity extends AppCompatActivity {

    private AdminApiService apiService;
    private RecyclerView paymentsRecycler;
    private TextView chipAll, chipSuccess, chipPending, chipFailed, chipRefunded;
    private LinearLayout emptyState;
    private ProgressBar progressBar;
    private TextView statTotalRevenue, statSuccessful, statRefunded;

    private PaymentAdapter adapter;
    private List<PaymentsListResponse.Payment> paymentsList = new ArrayList<>();
    private String currentFilter = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_payments);

        TokenManager.init(this);
        apiService = ApiClient.getClient().create(AdminApiService.class);

        initViews();
        setupToolbar();
        setupRecyclerView();
        setupFilters();
        loadPayments();
        loadPaymentStats();
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadPayments();
        loadPaymentStats();
    }

    private void initViews() {
        paymentsRecycler = findViewById(R.id.paymentsRecycler);
        chipAll = findViewById(R.id.chipAll);
        chipSuccess = findViewById(R.id.chipSuccess);
        chipPending = findViewById(R.id.chipPending);
        chipFailed = findViewById(R.id.chipFailed);
        chipRefunded = findViewById(R.id.chipRefunded);
        emptyState = findViewById(R.id.emptyState);
        progressBar = findViewById(R.id.progressBar);
        statTotalRevenue = findViewById(R.id.statTotalRevenue);
        statSuccessful = findViewById(R.id.statSuccessful);
        statRefunded = findViewById(R.id.statRefunded);
    }

    private void setupToolbar() {
        findViewById(R.id.backButton).setOnClickListener(v -> onBackPressed());
        findViewById(R.id.refreshButton).setOnClickListener(v -> {
            loadPayments();
            loadPaymentStats();
        });
    }

    private void setupRecyclerView() {
        adapter = new PaymentAdapter();
        paymentsRecycler.setLayoutManager(new LinearLayoutManager(this));
        paymentsRecycler.setAdapter(adapter);
    }

    private void setupFilters() {
        chipAll.setOnClickListener(v -> {
            currentFilter = "";
            updateChipSelection(chipAll);
            loadPayments();
        });
        chipSuccess.setOnClickListener(v -> {
            currentFilter = "success";
            updateChipSelection(chipSuccess);
            loadPayments();
        });
        chipPending.setOnClickListener(v -> {
            currentFilter = "pending";
            updateChipSelection(chipPending);
            loadPayments();
        });
        chipFailed.setOnClickListener(v -> {
            currentFilter = "failed";
            updateChipSelection(chipFailed);
            loadPayments();
        });
        chipRefunded.setOnClickListener(v -> {
            currentFilter = "refunded";
            updateChipSelection(chipRefunded);
            loadPayments();
        });

        updateChipSelection(chipAll);
    }

    private void updateChipSelection(TextView selected) {
        TextView[] chips = {chipAll, chipSuccess, chipPending, chipFailed, chipRefunded};
        for (TextView chip : chips) {
            chip.setSelected(false);
            chip.setTextColor(getResources().getColor(R.color.text_secondary));
        }
        selected.setSelected(true);
        selected.setTextColor(getResources().getColor(R.color.white));
    }

    private void loadPayments() {
        progressBar.setVisibility(View.VISIBLE);
        emptyState.setVisibility(View.GONE);

        Map<String, String> params = new HashMap<>();
        if (!currentFilter.isEmpty()) {
            params.put("paymentStatus", currentFilter);
        }

        apiService.getPayments(params).enqueue(new Callback<PaymentsListResponse>() {
            @Override
            public void onResponse(Call<PaymentsListResponse> call, Response<PaymentsListResponse> response) {
                progressBar.setVisibility(View.GONE);
                try {
                    if (response.isSuccessful() && response.body() != null) {
                        paymentsList = response.body().getPayments();
                        adapter.notifyDataSetChanged();
                        emptyState.setVisibility(paymentsList.isEmpty() ? View.VISIBLE : View.GONE);
                        paymentsRecycler.setVisibility(paymentsList.isEmpty() ? View.GONE : View.VISIBLE);
                    } else {
                        Toast.makeText(PaymentsActivity.this, "Failed to load payments", Toast.LENGTH_SHORT).show();
                    }
                } catch (Exception e) {
                    Toast.makeText(PaymentsActivity.this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<PaymentsListResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(PaymentsActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void loadPaymentStats() {
        apiService.getPaymentStats().enqueue(new Callback<PaymentStatsResponse>() {
            @Override
            public void onResponse(Call<PaymentStatsResponse> call, Response<PaymentStatsResponse> response) {
                try {
                    if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                        List<PaymentStatsResponse.StatItem> stats = response.body().getStats();
                        if (stats != null) {
                            double totalAmount = 0;
                            double successAmount = 0;
                            double refundedAmount = 0;

                            for (PaymentStatsResponse.StatItem stat : stats) {
                                totalAmount += stat.getTotal();
                                if (stat.getId() != null) {
                                    switch (stat.getId().toLowerCase()) {
                                        case "success":
                                        case "completed":
                                            successAmount = stat.getTotal();
                                            break;
                                        case "refunded":
                                            refundedAmount = stat.getTotal();
                                            break;
                                    }
                                }
                            }

                            statTotalRevenue.setText(String.format(Locale.getDefault(), "Rs.%.0f", totalAmount));
                            statSuccessful.setText(String.format(Locale.getDefault(), "Rs.%.0f", successAmount));
                            statRefunded.setText(String.format(Locale.getDefault(), "Rs.%.0f", refundedAmount));
                        }
                    }
                } catch (Exception e) {
                    // Stats are non-critical, fail silently
                }
            }

            @Override
            public void onFailure(Call<PaymentStatsResponse> call, Throwable t) {
                // Stats are non-critical, fail silently
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

    class PaymentAdapter extends RecyclerView.Adapter<PaymentAdapter.ViewHolder> {

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(parent.getContext())
                    .inflate(R.layout.item_admin_payment, parent, false);
            return new ViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            PaymentsListResponse.Payment payment = paymentsList.get(position);

            // Transaction ID (truncated via ellipsize in XML)
            holder.transactionId.setText(payment.getTransactionId() != null
                    ? payment.getTransactionId() : "N/A");

            // User name and email
            if (payment.getUserId() != null) {
                holder.userName.setText(payment.getUserId().getName() != null
                        ? payment.getUserId().getName() : "Unknown");
                holder.userEmail.setText(payment.getUserId().getEmail() != null
                        ? payment.getUserId().getEmail() : "");
            } else {
                holder.userName.setText("Unknown");
                holder.userEmail.setText("");
            }

            // Amount
            holder.amount.setText(String.format(Locale.getDefault(), "Rs.%d", payment.getAmount()));

            // Payment method
            holder.paymentMethod.setText(payment.getPaymentMethod() != null
                    ? payment.getPaymentMethod() : "N/A");

            // Status badge
            String status = payment.getPaymentStatus() != null ? payment.getPaymentStatus() : "pending";
            holder.statusBadge.setText(status.toUpperCase());
            switch (status.toLowerCase()) {
                case "success":
                case "completed":
                    holder.statusBadge.setBackgroundResource(R.drawable.bg_status_approved);
                    holder.statusBadge.setTextColor(getResources().getColor(R.color.success));
                    break;
                case "failed":
                    holder.statusBadge.setBackgroundResource(R.drawable.bg_status_rejected);
                    holder.statusBadge.setTextColor(getResources().getColor(R.color.error));
                    break;
                case "refunded":
                    holder.statusBadge.setBackgroundResource(R.drawable.bg_status_rejected);
                    holder.statusBadge.setTextColor(getResources().getColor(R.color.error));
                    break;
                default:
                    holder.statusBadge.setBackgroundResource(R.drawable.bg_status_pending);
                    holder.statusBadge.setTextColor(getResources().getColor(R.color.warning));
                    break;
            }

            // Date
            holder.dateText.setText(formatDate(payment.getCreatedAt()));

            // Refund button - only show for successful payments
            boolean canRefund = "success".equalsIgnoreCase(status) || "completed".equalsIgnoreCase(status);
            holder.refundButton.setVisibility(canRefund ? View.VISIBLE : View.GONE);

            holder.refundButton.setOnClickListener(v -> showRefundDialog(payment.getId()));
        }

        @Override
        public int getItemCount() {
            return paymentsList.size();
        }

        class ViewHolder extends RecyclerView.ViewHolder {
            TextView transactionId, userName, userEmail, amount, paymentMethod, statusBadge, dateText;
            MaterialButton refundButton;

            ViewHolder(@NonNull View itemView) {
                super(itemView);
                transactionId = itemView.findViewById(R.id.transactionId);
                userName = itemView.findViewById(R.id.userName);
                userEmail = itemView.findViewById(R.id.userEmail);
                amount = itemView.findViewById(R.id.amount);
                paymentMethod = itemView.findViewById(R.id.paymentMethod);
                statusBadge = itemView.findViewById(R.id.statusBadge);
                dateText = itemView.findViewById(R.id.dateText);
                refundButton = itemView.findViewById(R.id.refundButton);
            }
        }
    }

    private void showRefundDialog(String paymentId) {
        final EditText input = new EditText(this);
        input.setHint("Enter refund reason...");
        input.setPadding(48, 32, 48, 32);

        new MaterialAlertDialogBuilder(this)
                .setTitle("Refund Payment")
                .setMessage("Please provide a reason for the refund:")
                .setView(input)
                .setPositiveButton("Refund", (dialog, which) -> {
                    String reason = input.getText().toString().trim();
                    Map<String, String> body = new HashMap<>();
                    body.put("reason", reason);

                    apiService.refundPayment(paymentId, body).enqueue(new Callback<ApiResponse>() {
                        @Override
                        public void onResponse(Call<ApiResponse> call, Response<ApiResponse> response) {
                            try {
                                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                                    Toast.makeText(PaymentsActivity.this, "Payment refunded", Toast.LENGTH_SHORT).show();
                                    loadPayments();
                                    loadPaymentStats();
                                } else {
                                    Toast.makeText(PaymentsActivity.this, "Failed to refund", Toast.LENGTH_SHORT).show();
                                }
                            } catch (Exception e) {
                                Toast.makeText(PaymentsActivity.this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                            }
                        }

                        @Override
                        public void onFailure(Call<ApiResponse> call, Throwable t) {
                            Toast.makeText(PaymentsActivity.this, "Network error", Toast.LENGTH_SHORT).show();
                        }
                    });
                })
                .setNegativeButton("Cancel", null)
                .show();
    }
}
