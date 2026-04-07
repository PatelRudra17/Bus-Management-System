package com.buspass.admin.utils;

import android.content.Context;
import android.content.SharedPreferences;

public class TokenManager {
    private static final String PREF_NAME = "admin_auth_prefs";
    private static SharedPreferences prefs;

    public static void init(Context context) {
        prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    }

    public static void saveToken(String token) { prefs.edit().putString("auth_token", token).apply(); }
    public static String getToken() { return prefs.getString("auth_token", null); }

    public static void saveUser(String id, String name, String email, String role) {
        prefs.edit().putString("user_id", id).putString("user_name", name)
            .putString("user_email", email).putString("user_role", role).apply();
    }

    public static String getUserName() { return prefs.getString("user_name", ""); }
    public static String getUserEmail() { return prefs.getString("user_email", ""); }
    public static String getUserRole() { return prefs.getString("user_role", ""); }
    public static boolean isLoggedIn() { return getToken() != null && "admin".equals(getUserRole()); }
    public static void clearAll() { prefs.edit().clear().apply(); }
}
