package com.buspass.admin.activities;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.buspass.admin.R;
import com.buspass.admin.api.AdminApiService;
import com.buspass.admin.models.ApiResponse;
import com.buspass.admin.models.RouteRequest;
import com.buspass.admin.models.RoutesListResponse;
import com.buspass.admin.utils.ApiClient;
import com.buspass.admin.utils.TokenManager;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RoutesActivity extends AppCompatActivity {

    private AdminApiService apiService;
    private RecyclerView routesRecycler;
    private FloatingActionButton fabAddRoute;
    private MaterialButton addRouteButton;
    private LinearLayout emptyState;
    private ProgressBar progressBar;

    private RouteAdapter adapter;
    private List<RoutesListResponse.Route> routesList = new ArrayList<>();

    private static final String[] BUS_TYPES = {"AC", "Non-AC", "Sleeper", "Semi-Sleeper", "Volvo"};

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_routes);

        TokenManager.init(this);
        apiService = ApiClient.getClient().create(AdminApiService.class);

        initViews();
        setupToolbar();
        setupRecyclerView();
        loadRoutes();

        fabAddRoute.setOnClickListener(v -> showRouteDialog(null));
        addRouteButton.setOnClickListener(v -> showRouteDialog(null));
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadRoutes();
    }

    private void initViews() {
        routesRecycler = findViewById(R.id.routesRecycler);
        fabAddRoute = findViewById(R.id.fabAddRoute);
        addRouteButton = findViewById(R.id.addRouteButton);
        emptyState = findViewById(R.id.emptyState);
        progressBar = findViewById(R.id.progressBar);
    }

    private void setupToolbar() {
        findViewById(R.id.backButton).setOnClickListener(v -> onBackPressed());
    }

    private void setupRecyclerView() {
        adapter = new RouteAdapter();
        routesRecycler.setLayoutManager(new LinearLayoutManager(this));
        routesRecycler.setAdapter(adapter);
    }

    private void loadRoutes() {
        progressBar.setVisibility(View.VISIBLE);
        emptyState.setVisibility(View.GONE);

        apiService.getRoutes().enqueue(new Callback<RoutesListResponse>() {
            @Override
            public void onResponse(Call<RoutesListResponse> call, Response<RoutesListResponse> response) {
                progressBar.setVisibility(View.GONE);
                try {
                    if (response.isSuccessful() && response.body() != null) {
                        routesList = response.body().getRoutes();
                        adapter.notifyDataSetChanged();
                        emptyState.setVisibility(routesList.isEmpty() ? View.VISIBLE : View.GONE);
                        routesRecycler.setVisibility(routesList.isEmpty() ? View.GONE : View.VISIBLE);
                    } else {
                        Toast.makeText(RoutesActivity.this, "Failed to load routes", Toast.LENGTH_SHORT).show();
                    }
                } catch (Exception e) {
                    Toast.makeText(RoutesActivity.this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<RoutesListResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(RoutesActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showRouteDialog(RoutesListResponse.Route existingRoute) {
        View dialogView = LayoutInflater.from(this).inflate(R.layout.dialog_add_route, null);

        EditText etRouteNumber = dialogView.findViewById(R.id.etRouteNumber);
        EditText etSource = dialogView.findViewById(R.id.etSource);
        EditText etDestination = dialogView.findViewById(R.id.etDestination);
        EditText etDistance = dialogView.findViewById(R.id.etDistance);
        EditText etFare = dialogView.findViewById(R.id.etFare);
        Spinner spinnerBusType = dialogView.findViewById(R.id.spinnerBusType);
        EditText etTotalSeats = dialogView.findViewById(R.id.etTotalSeats);

        ArrayAdapter<String> busTypeAdapter = new ArrayAdapter<>(this,
                android.R.layout.simple_spinner_dropdown_item, BUS_TYPES);
        spinnerBusType.setAdapter(busTypeAdapter);

        boolean isEditing = existingRoute != null;
        String dialogTitle = isEditing ? "Edit Route" : "Add New Route";

        if (isEditing) {
            etRouteNumber.setText(existingRoute.getRouteNumber());
            etSource.setText(existingRoute.getSource());
            etDestination.setText(existingRoute.getDestination());
            etDistance.setText(String.valueOf(existingRoute.getDistance()));
            etFare.setText(String.valueOf(existingRoute.getFare()));
            etTotalSeats.setText(String.valueOf(existingRoute.getTotalSeats()));

            // Set spinner selection
            String busType = existingRoute.getBusType();
            if (busType != null) {
                for (int i = 0; i < BUS_TYPES.length; i++) {
                    if (BUS_TYPES[i].equalsIgnoreCase(busType)) {
                        spinnerBusType.setSelection(i);
                        break;
                    }
                }
            }
        }

        AlertDialog dialog = new MaterialAlertDialogBuilder(this)
                .setTitle(dialogTitle)
                .setView(dialogView)
                .setPositiveButton(isEditing ? "Update" : "Create", null)
                .setNegativeButton("Cancel", null)
                .create();

        dialog.show();

        // Override positive button to add validation
        dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(v -> {
            String routeNumber = etRouteNumber.getText().toString().trim();
            String source = etSource.getText().toString().trim();
            String destination = etDestination.getText().toString().trim();
            String distanceStr = etDistance.getText().toString().trim();
            String fareStr = etFare.getText().toString().trim();
            String busType = spinnerBusType.getSelectedItem().toString();
            String seatsStr = etTotalSeats.getText().toString().trim();

            if (routeNumber.isEmpty() || source.isEmpty() || destination.isEmpty()
                    || distanceStr.isEmpty() || fareStr.isEmpty() || seatsStr.isEmpty()) {
                Toast.makeText(RoutesActivity.this, "Please fill all fields", Toast.LENGTH_SHORT).show();
                return;
            }

            int distance, fare, totalSeats;
            try {
                distance = Integer.parseInt(distanceStr);
                fare = Integer.parseInt(fareStr);
                totalSeats = Integer.parseInt(seatsStr);
            } catch (NumberFormatException e) {
                Toast.makeText(RoutesActivity.this, "Invalid number input", Toast.LENGTH_SHORT).show();
                return;
            }

            RouteRequest request = new RouteRequest(routeNumber, source, destination, distance, fare, busType, totalSeats);

            if (isEditing) {
                apiService.updateRoute(existingRoute.getId(), request).enqueue(new Callback<ApiResponse>() {
                    @Override
                    public void onResponse(Call<ApiResponse> call, Response<ApiResponse> response) {
                        try {
                            if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                                Toast.makeText(RoutesActivity.this, "Route updated", Toast.LENGTH_SHORT).show();
                                dialog.dismiss();
                                loadRoutes();
                            } else {
                                Toast.makeText(RoutesActivity.this, "Failed to update route", Toast.LENGTH_SHORT).show();
                            }
                        } catch (Exception e) {
                            Toast.makeText(RoutesActivity.this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<ApiResponse> call, Throwable t) {
                        Toast.makeText(RoutesActivity.this, "Network error", Toast.LENGTH_SHORT).show();
                    }
                });
            } else {
                apiService.createRoute(request).enqueue(new Callback<ApiResponse>() {
                    @Override
                    public void onResponse(Call<ApiResponse> call, Response<ApiResponse> response) {
                        try {
                            if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                                Toast.makeText(RoutesActivity.this, "Route created", Toast.LENGTH_SHORT).show();
                                dialog.dismiss();
                                loadRoutes();
                            } else {
                                Toast.makeText(RoutesActivity.this, "Failed to create route", Toast.LENGTH_SHORT).show();
                            }
                        } catch (Exception e) {
                            Toast.makeText(RoutesActivity.this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<ApiResponse> call, Throwable t) {
                        Toast.makeText(RoutesActivity.this, "Network error", Toast.LENGTH_SHORT).show();
                    }
                });
            }
        });
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }

    // ======================== Inner Adapter Class ========================

    class RouteAdapter extends RecyclerView.Adapter<RouteAdapter.ViewHolder> {

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(parent.getContext())
                    .inflate(R.layout.item_admin_route, parent, false);
            return new ViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            RoutesListResponse.Route route = routesList.get(position);

            // Route number
            holder.routeNumber.setText(route.getRouteNumber() != null
                    ? "Route #" + route.getRouteNumber() : "N/A");

            // Source -> Destination
            holder.routePath.setText(String.format("%s -> %s",
                    route.getSource() != null ? route.getSource() : "",
                    route.getDestination() != null ? route.getDestination() : ""));

            // Distance
            holder.distance.setText(String.format(Locale.getDefault(), "%d km", route.getDistance()));

            // Fare
            holder.fare.setText(String.format(Locale.getDefault(), "Rs.%d", route.getFare()));

            // Bus type badge
            holder.busType.setText(route.getBusType() != null ? route.getBusType() : "N/A");

            // Seats
            holder.seatsCount.setText(String.format(Locale.getDefault(), "%d seats", route.getTotalSeats()));

            // Active badge
            boolean isActive = route.isActive();
            holder.statusBadge.setText(isActive ? "ACTIVE" : "INACTIVE");
            if (isActive) {
                holder.statusBadge.setBackgroundResource(R.drawable.bg_status_approved);
                holder.statusBadge.setTextColor(getResources().getColor(R.color.success));
            } else {
                holder.statusBadge.setBackgroundResource(R.drawable.bg_status_rejected);
                holder.statusBadge.setTextColor(getResources().getColor(R.color.error));
            }

            // Edit button
            holder.editButton.setOnClickListener(v -> showRouteDialog(route));

            // Delete button
            holder.deleteButton.setOnClickListener(v -> {
                new MaterialAlertDialogBuilder(RoutesActivity.this)
                        .setTitle("Delete Route")
                        .setMessage("Are you sure you want to delete route " + route.getRouteNumber() + "?")
                        .setPositiveButton("Delete", (dialog, which) -> {
                            apiService.deleteRoute(route.getId()).enqueue(new Callback<ApiResponse>() {
                                @Override
                                public void onResponse(Call<ApiResponse> call, Response<ApiResponse> response) {
                                    try {
                                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                                            Toast.makeText(RoutesActivity.this, "Route deleted", Toast.LENGTH_SHORT).show();
                                            loadRoutes();
                                        } else {
                                            Toast.makeText(RoutesActivity.this, "Failed to delete route", Toast.LENGTH_SHORT).show();
                                        }
                                    } catch (Exception e) {
                                        Toast.makeText(RoutesActivity.this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                                    }
                                }

                                @Override
                                public void onFailure(Call<ApiResponse> call, Throwable t) {
                                    Toast.makeText(RoutesActivity.this, "Network error", Toast.LENGTH_SHORT).show();
                                }
                            });
                        })
                        .setNegativeButton("Cancel", null)
                        .show();
            });
        }

        @Override
        public int getItemCount() {
            return routesList.size();
        }

        class ViewHolder extends RecyclerView.ViewHolder {
            TextView routeNumber, routePath, distance, fare;
            TextView busType, seatsCount, statusBadge;
            ImageButton editButton, deleteButton;

            ViewHolder(@NonNull View itemView) {
                super(itemView);
                routeNumber = itemView.findViewById(R.id.routeNumber);
                routePath = itemView.findViewById(R.id.routePath);
                distance = itemView.findViewById(R.id.distance);
                fare = itemView.findViewById(R.id.fare);
                busType = itemView.findViewById(R.id.busType);
                seatsCount = itemView.findViewById(R.id.seatsCount);
                statusBadge = itemView.findViewById(R.id.statusBadge);
                editButton = itemView.findViewById(R.id.editButton);
                deleteButton = itemView.findViewById(R.id.deleteButton);
            }
        }
    }
}
