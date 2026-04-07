package com.buspass.management.utils;

import androidx.annotation.NonNull;
import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.Response;

import java.io.IOException;

public class AuthInterceptor implements Interceptor {

    @NonNull
    @Override
    public Response intercept(@NonNull Chain chain) throws IOException {
        Request.Builder requestBuilder = chain.request().newBuilder();

        // Get token from SharedPreferences
        String token = TokenManager.getToken();

        if (token != null && !token.isEmpty()) {
            requestBuilder.addHeader("Authorization", "Bearer " + token);
        }

        requestBuilder.addHeader("Content-Type", "application/json");

        return chain.proceed(requestBuilder.build());
    }
}
