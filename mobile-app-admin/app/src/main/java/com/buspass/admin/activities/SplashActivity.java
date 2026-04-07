package com.buspass.admin.activities;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

import androidx.appcompat.app.AppCompatActivity;

import com.buspass.admin.R;
import com.buspass.admin.utils.TokenManager;

public class SplashActivity extends AppCompatActivity {

    private static final long SPLASH_DELAY = 2000;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        TokenManager.init(this);

        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            Intent intent;
            if (TokenManager.isLoggedIn()) {
                intent = new Intent(SplashActivity.this, DashboardActivity.class);
            } else {
                intent = new Intent(SplashActivity.this, LoginActivity.class);
            }
            startActivity(intent);
            finish();
        }, SPLASH_DELAY);
    }
}
