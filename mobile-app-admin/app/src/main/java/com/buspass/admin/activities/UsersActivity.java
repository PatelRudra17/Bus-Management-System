package com.buspass.admin.activities;

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
import com.buspass.admin.models.ApiResponse;
import com.buspass.admin.models.UsersListResponse;
import com.buspass.admin.utils.ApiClient;
import com.buspass.admin.utils.TokenManager;
import com.google.android.material.button.MaterialButton;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class UsersActivity extends AppCompatActivity {

    private AdminApiService apiService;
    private RecyclerView usersRecycler;
    private EditText searchInput;
    private TextView chipAllRoles, chipUser, chipAdmin, chipActive, chipInactive;
    private LinearLayout emptyState;
    private ProgressBar progressBar;

    private UserAdapter adapter;
    private List<UsersListResponse.User> usersList = new ArrayList<>();
    private String currentRoleFilter = "";
    private String currentActiveFilter = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_users);

        TokenManager.init(this);
        apiService = ApiClient.getClient().create(AdminApiService.class);

        initViews();
        setupToolbar();
        setupRecyclerView();
        setupSearch();
        setupFilters();
        loadUsers();
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadUsers();
    }

    private void initViews() {
        usersRecycler = findViewById(R.id.usersRecycler);
        searchInput = findViewById(R.id.searchInput);
        chipAllRoles = findViewById(R.id.chipAllRoles);
        chipUser = findViewById(R.id.chipUser);
        chipAdmin = findViewById(R.id.chipAdmin);
        chipActive = findViewById(R.id.chipActive);
        chipInactive = findViewById(R.id.chipInactive);
        emptyState = findViewById(R.id.emptyState);
        progressBar = findViewById(R.id.progressBar);
    }

    private void setupToolbar() {
        findViewById(R.id.backButton).setOnClickListener(v -> onBackPressed());
        findViewById(R.id.refreshButton).setOnClickListener(v -> loadUsers());
    }

    private void setupRecyclerView() {
        adapter = new UserAdapter();
        usersRecycler.setLayoutManager(new LinearLayoutManager(this));
        usersRecycler.setAdapter(adapter);
    }

    private void setupSearch() {
        searchInput.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}
            @Override
            public void afterTextChanged(Editable s) {
                loadUsers();
            }
        });
    }

    private void setupFilters() {
        chipAllRoles.setOnClickListener(v -> {
            currentRoleFilter = "";
            currentActiveFilter = "";
            updateChipSelection(chipAllRoles);
            loadUsers();
        });
        chipAdmin.setOnClickListener(v -> {
            currentRoleFilter = "admin";
            currentActiveFilter = "";
            updateChipSelection(chipAdmin);
            loadUsers();
        });
        chipUser.setOnClickListener(v -> {
            currentRoleFilter = "user";
            currentActiveFilter = "";
            updateChipSelection(chipUser);
            loadUsers();
        });
        chipActive.setOnClickListener(v -> {
            currentRoleFilter = "";
            currentActiveFilter = "true";
            updateChipSelection(chipActive);
            loadUsers();
        });
        chipInactive.setOnClickListener(v -> {
            currentRoleFilter = "";
            currentActiveFilter = "false";
            updateChipSelection(chipInactive);
            loadUsers();
        });

        updateChipSelection(chipAllRoles);
    }

    private void updateChipSelection(TextView selected) {
        TextView[] chips = {chipAllRoles, chipUser, chipAdmin, chipActive, chipInactive};
        for (TextView chip : chips) {
            chip.setSelected(false);
            chip.setTextColor(getResources().getColor(R.color.text_secondary));
        }
        selected.setSelected(true);
        selected.setTextColor(getResources().getColor(R.color.white));
    }

    private void loadUsers() {
        progressBar.setVisibility(View.VISIBLE);
        emptyState.setVisibility(View.GONE);

        Map<String, String> params = new HashMap<>();
        if (!TextUtils.isEmpty(currentRoleFilter)) {
            params.put("role", currentRoleFilter);
        }
        if (!TextUtils.isEmpty(currentActiveFilter)) {
            params.put("isActive", currentActiveFilter);
        }
        String search = searchInput.getText().toString().trim();
        if (!TextUtils.isEmpty(search)) {
            params.put("search", search);
        }

        apiService.getUsers(params).enqueue(new Callback<UsersListResponse>() {
            @Override
            public void onResponse(Call<UsersListResponse> call, Response<UsersListResponse> response) {
                progressBar.setVisibility(View.GONE);
                try {
                    if (response.isSuccessful() && response.body() != null) {
                        usersList = response.body().getUsers();
                        adapter.notifyDataSetChanged();
                        emptyState.setVisibility(usersList.isEmpty() ? View.VISIBLE : View.GONE);
                        usersRecycler.setVisibility(usersList.isEmpty() ? View.GONE : View.VISIBLE);
                    } else {
                        Toast.makeText(UsersActivity.this, "Failed to load users", Toast.LENGTH_SHORT).show();
                    }
                } catch (Exception e) {
                    Toast.makeText(UsersActivity.this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<UsersListResponse> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(UsersActivity.this, "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }

    // ======================== Inner Adapter Class ========================

    class UserAdapter extends RecyclerView.Adapter<UserAdapter.ViewHolder> {

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(parent.getContext())
                    .inflate(R.layout.item_admin_user, parent, false);
            return new ViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            UsersListResponse.User user = usersList.get(position);

            // Avatar initial
            String name = user.getName() != null ? user.getName() : "?";
            holder.avatarInitial.setText(String.valueOf(name.charAt(0)).toUpperCase());

            // Name and email
            holder.userName.setText(name);
            holder.userEmail.setText(user.getEmail() != null ? user.getEmail() : "");

            // Role badge
            String role = user.getRole() != null ? user.getRole() : "user";
            holder.roleBadge.setText(role.toUpperCase());
            if ("admin".equalsIgnoreCase(role)) {
                holder.roleBadge.setBackgroundResource(R.drawable.bg_status_pending);
                holder.roleBadge.setTextColor(getResources().getColor(R.color.warning));
            } else {
                holder.roleBadge.setBackgroundResource(R.drawable.bg_status_approved);
                holder.roleBadge.setTextColor(getResources().getColor(R.color.success));
            }

            // Active/Inactive badge
            boolean isActive = user.isActive();
            holder.statusBadge.setText(isActive ? "ACTIVE" : "INACTIVE");
            if (isActive) {
                holder.statusBadge.setBackgroundResource(R.drawable.bg_status_approved);
                holder.statusBadge.setTextColor(getResources().getColor(R.color.success));
            } else {
                holder.statusBadge.setBackgroundResource(R.drawable.bg_status_rejected);
                holder.statusBadge.setTextColor(getResources().getColor(R.color.error));
            }

            // Toggle active button
            holder.toggleButton.setText(isActive ? "Deactivate" : "Activate");
            holder.toggleButton.setOnClickListener(v -> {
                Map<String, Object> body = new HashMap<>();
                body.put("isActive", !isActive);

                apiService.updateUser(user.getId(), body).enqueue(new Callback<ApiResponse>() {
                    @Override
                    public void onResponse(Call<ApiResponse> call, Response<ApiResponse> response) {
                        try {
                            if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                                Toast.makeText(UsersActivity.this,
                                        isActive ? "User deactivated" : "User activated",
                                        Toast.LENGTH_SHORT).show();
                                loadUsers();
                            } else {
                                Toast.makeText(UsersActivity.this, "Failed to update user", Toast.LENGTH_SHORT).show();
                            }
                        } catch (Exception e) {
                            Toast.makeText(UsersActivity.this, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<ApiResponse> call, Throwable t) {
                        Toast.makeText(UsersActivity.this, "Network error", Toast.LENGTH_SHORT).show();
                    }
                });
            });
        }

        @Override
        public int getItemCount() {
            return usersList.size();
        }

        class ViewHolder extends RecyclerView.ViewHolder {
            TextView avatarInitial, userName, userEmail, roleBadge, statusBadge;
            MaterialButton toggleButton;

            ViewHolder(@NonNull View itemView) {
                super(itemView);
                avatarInitial = itemView.findViewById(R.id.avatarInitial);
                userName = itemView.findViewById(R.id.userName);
                userEmail = itemView.findViewById(R.id.userEmail);
                roleBadge = itemView.findViewById(R.id.roleBadge);
                statusBadge = itemView.findViewById(R.id.statusBadge);
                toggleButton = itemView.findViewById(R.id.toggleButton);
            }
        }
    }
}
