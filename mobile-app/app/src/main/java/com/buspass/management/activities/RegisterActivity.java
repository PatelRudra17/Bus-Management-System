package com.buspass.management.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.buspass.management.R;
import com.buspass.management.api.ApiService;
import com.buspass.management.models.AuthResponse;
import com.buspass.management.models.RegisterRequest;
import com.buspass.management.utils.ApiClient;
import com.buspass.management.utils.TokenManager;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RegisterActivity extends AppCompatActivity {

    private EditText etName, etEmail, etPhone, etPassword, etConfirmPassword;
    private Button btnRegister;
    private TextView tvLogin;
    private ProgressBar progressBar;
    private ApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        // Initialize views
        etName = findViewById(R.id.etName);
        etEmail = findViewById(R.id.etEmail);
        etPhone = findViewById(R.id.etPhone);
        etPassword = findViewById(R.id.etPassword);
        etConfirmPassword = findViewById(R.id.etConfirmPassword);
        btnRegister = findViewById(R.id.btnRegister);
        tvLogin = findViewById(R.id.tvLogin);
        progressBar = findViewById(R.id.progressBar);

        // Initialize API service
        apiService = ApiClient.getClient().create(ApiService.class);

        // Set click listeners
        btnRegister.setOnClickListener(v -> register());
        tvLogin.setOnClickListener(v -> finish());
    }

    private void register() {
        String name = etName.getText().toString().trim();
        String email = etEmail.getText().toString().trim();
        String phone = etPhone.getText().toString().trim();
        String password = etPassword.getText().toString().trim();
        String confirmPassword = etConfirmPassword.getText().toString().trim();

        // Validation
        if (name.isEmpty()) {
            etName.setError("Name is required");
            etName.requestFocus();
            return;
        }

        if (email.isEmpty()) {
            etEmail.setError("Email is required");
            etEmail.requestFocus();
            return;
        }

        if (phone.isEmpty()) {
            etPhone.setError("Phone is required");
            etPhone.requestFocus();
            return;
        }

        if (password.isEmpty()) {
            etPassword.setError("Password is required");
            etPassword.requestFocus();
            return;
        }

        if (password.length() < 6) {
            etPassword.setError("Password must be at least 6 characters");
            etPassword.requestFocus();
            return;
        }

        if (!password.equals(confirmPassword)) {
            etConfirmPassword.setError("Passwords do not match");
            etConfirmPassword.requestFocus();
            return;
        }

        // Show progress
        showLoading(true);

        // Make API call
        RegisterRequest request = new RegisterRequest(name, email, password, phone);
        Call<AuthResponse> call = apiService.register(request);

        call.enqueue(new Callback<AuthResponse>() {
            @Override
            public void onResponse(Call<AuthResponse> call, Response<AuthResponse> response) {
                showLoading(false);

                if (response.isSuccessful() && response.body() != null) {
                    AuthResponse authResponse = response.body();
                    if (authResponse.isSuccess() && authResponse.getUser() != null) {
                        // Save token and user data
                        TokenManager.saveToken(authResponse.getToken());
                        TokenManager.saveUser(
                                authResponse.getUser().getId(),
                                authResponse.getUser().getName(),
                                authResponse.getUser().getEmail(),
                                authResponse.getUser().getRole()
                        );

                        Toast.makeText(RegisterActivity.this, "Registration successful!", Toast.LENGTH_SHORT).show();

                        // Navigate to dashboard
                        Intent intent = new Intent(RegisterActivity.this, DashboardActivity.class);
                        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                        startActivity(intent);
                        finish();
                    } else {
                        Toast.makeText(RegisterActivity.this, authResponse.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                } else {
                    // Show detailed error message
                    String errorMsg = "Registration failed";
                    try {
                        if (response.errorBody() != null) {
                            errorMsg = response.errorBody().string();
                            // Try to extract message from JSON
                            if (errorMsg.contains("\"message\"")) {
                                int msgStart = errorMsg.indexOf("\"message\":\"") + 11;
                                int msgEnd = errorMsg.indexOf("\"", msgStart);
                                if (msgStart > 10 && msgEnd > msgStart) {
                                    errorMsg = errorMsg.substring(msgStart, msgEnd);
                                }
                            }
                        }
                    } catch (Exception e) {
                        errorMsg = "Registration failed. Please check your inputs.";
                    }
                    Toast.makeText(RegisterActivity.this, errorMsg, Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<AuthResponse> call, Throwable t) {
                showLoading(false);
                Toast.makeText(RegisterActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showLoading(boolean show) {
        progressBar.setVisibility(show ? View.VISIBLE : View.GONE);
        btnRegister.setEnabled(!show);
    }
}
