package com.buspass.admin.utils;

import java.io.IOException;
import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.Response;

public class AuthInterceptor implements Interceptor {
    @Override
    public Response intercept(Chain chain) throws IOException {
        Request.Builder builder = chain.request().newBuilder()
            .addHeader("Content-Type", "application/json");
        String token = TokenManager.getToken();
        if (token != null) {
            builder.addHeader("Authorization", "Bearer " + token);
        }
        return chain.proceed(builder.build());
    }
}
