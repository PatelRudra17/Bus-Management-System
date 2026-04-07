package com.buspass.management.utils;

import android.content.Context;
import android.content.SharedPreferences;

public class TokenManager {

    private static final String PREF_NAME = "BusPassPrefs";
    private static final String KEY_TOKEN = "auth_token";
    private static final String KEY_USER_ID = "user_id";
    private static final String KEY_USER_NAME = "user_name";
    private static final String KEY_USER_EMAIL = "user_email";
    private static final String KEY_USER_ROLE = "user_role";

    private static SharedPreferences prefs;

    public static void init(Context context) {
        if (prefs == null) {
            prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        }
    }

    public static void saveToken(String token) {
        prefs.edit().putString(KEY_TOKEN, token).apply();
    }

    public static String getToken() {
        return prefs.getString(KEY_TOKEN, null);
    }

    public static void saveUser(String userId, String name, String email, String role) {
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString(KEY_USER_ID, userId);
        editor.putString(KEY_USER_NAME, name);
        editor.putString(KEY_USER_EMAIL, email);
        editor.putString(KEY_USER_ROLE, role);
        editor.apply();
    }

    public static String getUserId() {
        return prefs.getString(KEY_USER_ID, null);
    }

    public static String getUserName() {
        return prefs.getString(KEY_USER_NAME, null);
    }

    public static String getUserEmail() {
        return prefs.getString(KEY_USER_EMAIL, null);
    }

    public static String getUserRole() {
        return prefs.getString(KEY_USER_ROLE, "user");
    }

    public static boolean isLoggedIn() {
        return getToken() != null;
    }

    public static void clearAll() {
        prefs.edit().clear().apply();
    }
}
