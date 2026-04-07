package com.buspass.admin.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.buspass.admin.R;
import com.buspass.admin.api.AdminApiService;
import com.buspass.admin.models.AuthResponse;
import com.buspass.admin.models.LoginRequest;
import com.buspass.admin.utils.ApiClient;
import com.buspass.admin.utils.TokenManager;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    private TextInputEditText emailInput, passwordInput;
    private MaterialButton loginButton;
    private ProgressBar loginProgress;
    private TextView errorText;
    private AdminApiService apiService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        TokenManager.init(this);

        // If already logged in, go to dashboard
        if (TokenManager.isLoggedIn()) {
            navigateToDashboard();
            return;
        }

        apiService = ApiClient.getClient().create(AdminApiService.class);

        emailInput = findViewById(R.id.emailInput);
        passwordInput = findViewById(R.id.passwordInput);
        loginButton = findViewById(R.id.loginButton);
        loginProgress = findViewById(R.id.loginProgress);
        errorText = findViewById(R.id.errorText);

        loginButton.setOnClickListener(v -> attemptLogin());
    }

    private void attemptLogin() {
        String email = emailInput.getText() != null ? emailInput.getText().toString().trim() : "";
        String password = passwordInput.getText() != null ? passwordInput.getText().toString().trim() : "";

        if (email.isEmpty() || password.isEmpty()) {
            showError("Please enter both email and password");
            return;
        }

        setLoading(true);
        errorText.setVisibility(View.GONE);

        LoginRequest request = new LoginRequest(email, password);
        apiService.login(request).enqueue(new Callback<AuthResponse>() {
            @Override
            public void onResponse(Call<AuthResponse> call, Response<AuthResponse> response) {
                setLoading(false);
                try {
                    if (response.isSuccessful() && response.body() != null) {
                        AuthResponse authResponse = response.body();
                        if (authResponse.isSuccess() && authResponse.getUser() != null) {
                            AuthResponse.User user = authResponse.getUser();

                            // Check if user is admin
                            if (!"admin".equals(user.getRole())) {
                                showError("Access denied. Admin accounts only.");
                                return;
                            }

                            // Save token and user data
                            TokenManager.saveToken(authResponse.getToken());
                            TokenManager.saveUser(
                                    user.getId(),
                                    user.getName(),
                                    user.getEmail(),
                                    user.getRole()
                            );

                            navigateToDashboard();
                        } else {
                            showError(authResponse.getMessage() != null
                                    ? authResponse.getMessage()
                                    : "Login failed");
                        }
                    } else {
                        showError("Invalid email or password");
                    }
                } catch (Exception e) {
                    showError("Login failed: " + e.getMessage());
                }
            }

            @Override
            public void onFailure(Call<AuthResponse> call, Throwable t) {
                setLoading(false);
                showError("Network error: " + t.getMessage());
            }
        });
    }

    private void setLoading(boolean loading) {
        loginProgress.setVisibility(loading ? View.VISIBLE : View.GONE);
        loginButton.setEnabled(!loading);
        loginButton.setAlpha(loading ? 0.6f : 1.0f);
    }

    private void showError(String message) {
        errorText.setText(message);
        errorText.setVisibility(View.VISIBLE);
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }

    private void navigateToDashboard() {
        Intent intent = new Intent(LoginActivity.this, DashboardActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}
