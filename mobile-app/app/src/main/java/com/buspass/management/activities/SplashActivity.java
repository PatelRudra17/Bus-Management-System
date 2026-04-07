package com.buspass.management.activities;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

import androidx.appcompat.app.AppCompatActivity;

import com.buspass.management.R;
import com.buspass.management.utils.TokenManager;

public class SplashActivity extends AppCompatActivity {

    private static final int SPLASH_DELAY = 2000; // 2 seconds

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        // Initialize TokenManager
        TokenManager.init(this);

        // Delay and navigate to appropriate screen
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            Intent intent;
            if (TokenManager.isLoggedIn()) {
                // User is logged in
                String role = TokenManager.getUserRole();
                if ("admin".equals(role)) {
                    intent = new Intent(SplashActivity.this, AdminDashboardActivity.class);
                } else {
                    intent = new Intent(SplashActivity.this, DashboardActivity.class);
                }
            } else {
                // User not logged in
                intent = new Intent(SplashActivity.this, LoginActivity.class);
            }
            startActivity(intent);
            finish();
        }, SPLASH_DELAY);
    }
}
