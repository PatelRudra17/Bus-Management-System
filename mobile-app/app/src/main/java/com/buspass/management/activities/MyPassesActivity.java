package com.buspass.management.activities;

import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.util.Base64;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.buspass.management.R;
import com.buspass.management.api.ApiService;
import com.buspass.management.models.ApplicationsResponse;
import com.buspass.management.models.PassApplication;
import com.buspass.management.utils.ApiClient;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MyPassesActivity extends AppCompatActivity {

    private RecyclerView recyclerViewPasses;
    private LinearLayout emptyState;
    private TextView tvActiveCount, tvExpiringCount;
    private Button btnFilterAll, btnFilterActive, btnFilterExpired, btnApplyNewPass;
    private FloatingActionButton fabApplyPass;

    private List<PassApplication> allPasses = new ArrayList<>();
    private List<PassApplication> filteredPasses = new ArrayList<>();
    private PassesAdapter adapter;
    private String currentFilter = "all";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_my_passes);

        setupToolbar();
        initializeViews();
        setupRecyclerView();
        setupFilterButtons();
        fetchPasses();
    }

    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("My Bus Passes");
        }
    }

    private void initializeViews() {
        recyclerViewPasses = findViewById(R.id.recyclerViewPasses);
        emptyState = findViewById(R.id.emptyState);
        tvActiveCount = findViewById(R.id.tvActiveCount);
        tvExpiringCount = findViewById(R.id.tvExpiringCount);
        btnFilterAll = findViewById(R.id.btnFilterAll);
        btnFilterActive = findViewById(R.id.btnFilterActive);
        btnFilterExpired = findViewById(R.id.btnFilterExpired);
        btnApplyNewPass = findViewById(R.id.btnApplyNewPass);
        fabApplyPass = findViewById(R.id.fabApplyPass);

        btnApplyNewPass.setOnClickListener(v -> openApplyPassActivity());
        fabApplyPass.setOnClickListener(v -> openApplyPassActivity());
    }

    private void setupRecyclerView() {
        adapter = new PassesAdapter(filteredPasses);
        recyclerViewPasses.setLayoutManager(new LinearLayoutManager(this));
        recyclerViewPasses.setAdapter(adapter);
    }

    private void setupFilterButtons() {
        btnFilterAll.setOnClickListener(v -> {
            currentFilter = "all";
            updateFilterButtons();
            applyFilter();
        });

        btnFilterActive.setOnClickListener(v -> {
            currentFilter = "active";
            updateFilterButtons();
            applyFilter();
        });

        btnFilterExpired.setOnClickListener(v -> {
            currentFilter = "expired";
            updateFilterButtons();
            applyFilter();
        });
    }

    private void updateFilterButtons() {
        btnFilterAll.setBackgroundColor(currentFilter.equals("all") ?
            getResources().getColor(R.color.primary) : getResources().getColor(android.R.color.transparent));
        btnFilterActive.setBackgroundColor(currentFilter.equals("active") ?
            getResources().getColor(R.color.primary) : getResources().getColor(android.R.color.transparent));
        btnFilterExpired.setBackgroundColor(currentFilter.equals("expired") ?
            getResources().getColor(R.color.primary) : getResources().getColor(android.R.color.transparent));
    }

    private void fetchPasses() {
        ApiService apiService = ApiClient.getClient().create(ApiService.class);
        Call<ApplicationsResponse> call = apiService.getMyPasses();

        call.enqueue(new Callback<ApplicationsResponse>() {
            @Override
            public void onResponse(Call<ApplicationsResponse> call, Response<ApplicationsResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    allPasses = response.body().getPasses();
                    updateStats();
                    applyFilter();
                } else {
                    Toast.makeText(MyPassesActivity.this, "Error loading passes", Toast.LENGTH_SHORT).show();
                    showEmptyState(true);
                }
            }

            @Override
            public void onFailure(Call<ApplicationsResponse> call, Throwable t) {
                Toast.makeText(MyPassesActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                showEmptyState(true);
            }
        });
    }

    private void updateStats() {
        int activeCount = 0;
        int expiringCount = 0;
        long currentTime = System.currentTimeMillis();
        long thirtyDaysInMillis = 30L * 24 * 60 * 60 * 1000;

        for (PassApplication pass : allPasses) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US);
                Date endDate = sdf.parse(pass.getEndDate());
                if (endDate != null && endDate.getTime() > currentTime) {
                    activeCount++;
                    if (endDate.getTime() - currentTime <= thirtyDaysInMillis) {
                        expiringCount++;
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        tvActiveCount.setText(String.valueOf(activeCount));
        tvExpiringCount.setText(String.valueOf(expiringCount));
    }

    private void applyFilter() {
        filteredPasses.clear();
        long currentTime = System.currentTimeMillis();

        for (PassApplication pass : allPasses) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US);
                Date endDate = sdf.parse(pass.getEndDate());
                boolean isExpired = endDate != null && endDate.getTime() <= currentTime;

                if (currentFilter.equals("all") ||
                    (currentFilter.equals("active") && !isExpired) ||
                    (currentFilter.equals("expired") && isExpired)) {
                    filteredPasses.add(pass);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        adapter.notifyDataSetChanged();
        showEmptyState(filteredPasses.isEmpty());
    }

    private void showEmptyState(boolean show) {
        recyclerViewPasses.setVisibility(show ? View.GONE : View.VISIBLE);
        emptyState.setVisibility(show ? View.VISIBLE : View.GONE);
    }

    private void openApplyPassActivity() {
        startActivity(new Intent(this, ApplyPassActivity.class));
    }

    @Override
    protected void onResume() {
        super.onResume();
        fetchPasses();
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }

    private class PassesAdapter extends RecyclerView.Adapter<PassesAdapter.PassViewHolder> {
        private List<PassApplication> passes;

        public PassesAdapter(List<PassApplication> passes) {
            this.passes = passes;
        }

        @NonNull
        @Override
        public PassViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_pass_card, parent, false);
            return new PassViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull PassViewHolder holder, int position) {
            holder.bind(passes.get(position));
        }

        @Override
        public int getItemCount() {
            return passes.size();
        }

        class PassViewHolder extends RecyclerView.ViewHolder {
            TextView tvPassNumber, tvPassTypeInfo, tvStatusBadge, tvRoute, tvStartDate, tvEndDate, tvAmount;
            ImageView ivQrCode;
            Button btnDownload, btnRenew;
            LinearLayout cardHeader;

            public PassViewHolder(@NonNull View itemView) {
                super(itemView);
                tvPassNumber = itemView.findViewById(R.id.tvPassNumber);
                tvPassTypeInfo = itemView.findViewById(R.id.tvPassTypeInfo);
                tvStatusBadge = itemView.findViewById(R.id.tvStatusBadge);
                tvRoute = itemView.findViewById(R.id.tvRoute);
                tvStartDate = itemView.findViewById(R.id.tvStartDate);
                tvEndDate = itemView.findViewById(R.id.tvEndDate);
                tvAmount = itemView.findViewById(R.id.tvAmount);
                ivQrCode = itemView.findViewById(R.id.ivQrCode);
                btnDownload = itemView.findViewById(R.id.btnDownload);
                btnRenew = itemView.findViewById(R.id.btnRenew);
                cardHeader = itemView.findViewById(R.id.cardHeader);
            }

            public void bind(PassApplication pass) {
                tvPassNumber.setText(pass.getPassNumber());
                tvPassTypeInfo.setText(pass.getPassType().toUpperCase() + " • " + pass.getDuration().toUpperCase());
                tvRoute.setText(pass.getRouteId() != null ?
                    pass.getRouteId().getSource() + " → " + pass.getRouteId().getDestination() : "City-Wide Pass");
                tvAmount.setText("₹" + pass.getTotalAmount());

                SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US);
                SimpleDateFormat outputFormat = new SimpleDateFormat("dd/MM/yyyy", Locale.US);

                try {
                    Date startDate = inputFormat.parse(pass.getStartDate());
                    Date endDate = inputFormat.parse(pass.getEndDate());

                    if (startDate != null) tvStartDate.setText(outputFormat.format(startDate));
                    if (endDate != null) {
                        tvEndDate.setText(outputFormat.format(endDate));
                        boolean isExpired = endDate.getTime() <= System.currentTimeMillis();
                        if (isExpired) {
                            tvStatusBadge.setText("EXPIRED");
                            tvStatusBadge.setBackgroundColor(getResources().getColor(android.R.color.darker_gray));
                            cardHeader.setBackgroundColor(getResources().getColor(android.R.color.darker_gray));
                        } else {
                            long daysRemaining = (endDate.getTime() - System.currentTimeMillis()) / (1000 * 60 * 60 * 24);
                            if (daysRemaining <= 30) {
                                tvStatusBadge.setText(daysRemaining + " DAYS LEFT");
                                tvStatusBadge.setBackgroundColor(getResources().getColor(R.color.warning));
                            } else {
                                tvStatusBadge.setText("ACTIVE");
                                tvStatusBadge.setBackgroundColor(getResources().getColor(R.color.success));
                            }
                        }
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }

                if (pass.getQrCode() != null && !pass.getQrCode().isEmpty()) {
                    try {
                        String base64Image = pass.getQrCode().split(",")[1];
                        byte[] decodedString = Base64.decode(base64Image, Base64.DEFAULT);
                        Bitmap qrBitmap = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
                        ivQrCode.setImageBitmap(qrBitmap);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }

                btnDownload.setOnClickListener(v ->
                    Toast.makeText(MyPassesActivity.this, "Downloading pass...", Toast.LENGTH_SHORT).show());
                btnRenew.setOnClickListener(v -> {
                    Intent intent = new Intent(MyPassesActivity.this, ApplyPassActivity.class);
                    intent.putExtra("renew_id", pass.getId());
                    startActivity(intent);
                });
            }
        }
    }
}
