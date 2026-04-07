package com.buspass.management.activities;

import android.app.DatePickerDialog;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Base64;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.AdapterView;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.buspass.management.R;
import com.buspass.management.api.ApiService;
import com.buspass.management.models.ApplicationRequest;
import com.buspass.management.models.ApplicationResponse;
import com.buspass.management.models.RoutesResponse;
import com.buspass.management.utils.ApiClient;

import java.io.ByteArrayOutputStream;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.ArrayList;
import java.util.Arrays;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ApplyPassActivity extends AppCompatActivity {

    private Spinner spinnerState, spinnerCity, spinnerPassType, spinnerDuration;
    private EditText editStartDate;
    private Button btnUploadIdProof, btnUploadPhoto, btnSubmitApplication;
    private TextView tvIdProofStatus, tvPhotoStatus, tvTotalAmount, tvPassDetails;

    private Calendar calendar = Calendar.getInstance();
    private String idProofBase64 = "";
    private String photoBase64 = "";
    private String routeId = ""; // Will be loaded from backend
    private boolean routesLoaded = false;

    // Location data
    private Map<String, String[]> locationData = new HashMap<>();
    private String selectedState = "Gujarat";
    private String selectedCity = "Ahmedabad";

    // Pass pricing
    private final Map<String, Integer> basePrices = new HashMap<>();
    private final Map<String, Double> typeMultipliers = new HashMap<>();

    // Activity result launchers
    private ActivityResultLauncher<Intent> idProofLauncher;
    private ActivityResultLauncher<Intent> photoLauncher;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_apply_pass);

        setupActivityResultLaunchers();
        setupToolbar();
        initializeViews();
        initializeData();
        setupSpinners();
        setupDatePicker();
        setupButtons();
        updatePrice();
        fetchFirstRoute();
    }

    private void fetchFirstRoute() {
        btnSubmitApplication.setEnabled(false);
        btnSubmitApplication.setText("Loading Routes...");

        ApiService apiService = ApiClient.getClient().create(ApiService.class);
        Call<RoutesResponse> call = apiService.getRoutes();
        call.enqueue(new Callback<RoutesResponse>() {
            @Override
            public void onResponse(Call<RoutesResponse> call, Response<RoutesResponse> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getRoutes() != null) {
                    if (!response.body().getRoutes().isEmpty()) {
                        routeId = response.body().getRoutes().get(0).getId();
                        routesLoaded = true;
                        btnSubmitApplication.setEnabled(true);
                        btnSubmitApplication.setText("SUBMIT APPLICATION");
                    } else {
                        // No routes available - use fallback route ID
                        routeId = "69bb146ccbd715778e343b4d"; // First route from database
                        routesLoaded = true;
                        btnSubmitApplication.setEnabled(true);
                        btnSubmitApplication.setText("SUBMIT APPLICATION");
                        Toast.makeText(ApplyPassActivity.this,
                            "Using default route (no routes configured in system)",
                            Toast.LENGTH_SHORT).show();
                    }
                } else {
                    // API error - use fallback route ID
                    routeId = "69bb146ccbd715778e343b4d"; // First route from database
                    routesLoaded = true;
                    btnSubmitApplication.setEnabled(true);
                    btnSubmitApplication.setText("SUBMIT APPLICATION");
                    Toast.makeText(ApplyPassActivity.this,
                        "Could not load routes, using default",
                        Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<RoutesResponse> call, Throwable t) {
                // Network error - use fallback route ID
                routeId = "69bb146ccbd715778e343b4d"; // First route from database
                routesLoaded = true;
                btnSubmitApplication.setEnabled(true);
                btnSubmitApplication.setText("SUBMIT APPLICATION");
                Toast.makeText(ApplyPassActivity.this,
                    "Network error, using default route: " + t.getMessage(),
                    Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void setupActivityResultLaunchers() {
        idProofLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                    Uri imageUri = result.getData().getData();
                    if (imageUri != null) {
                        try {
                            Bitmap bitmap = MediaStore.Images.Media.getBitmap(getContentResolver(), imageUri);
                            idProofBase64 = "data:image/jpeg;base64," + bitmapToBase64(bitmap);
                            btnUploadIdProof.setText("✓ ID Proof Uploaded Successfully");
                            btnUploadIdProof.setTextColor(getResources().getColor(android.R.color.holo_green_dark));
                        } catch (Exception e) {
                            Toast.makeText(this, "Error loading image", Toast.LENGTH_SHORT).show();
                        }
                    }
                }
            }
        );

        photoLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                    Uri imageUri = result.getData().getData();
                    if (imageUri != null) {
                        try {
                            Bitmap bitmap = MediaStore.Images.Media.getBitmap(getContentResolver(), imageUri);
                            photoBase64 = "data:image/jpeg;base64," + bitmapToBase64(bitmap);
                            btnUploadPhoto.setText("✓ Passport Photo Uploaded Successfully");
                            btnUploadPhoto.setTextColor(getResources().getColor(android.R.color.holo_green_dark));
                        } catch (Exception e) {
                            Toast.makeText(this, "Error loading image", Toast.LENGTH_SHORT).show();
                        }
                    }
                }
            }
        );
    }

    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Apply for Bus Pass");
        }
    }

    private void initializeViews() {
        spinnerState = findViewById(R.id.spinnerState);
        spinnerCity = findViewById(R.id.spinnerCity);
        spinnerPassType = findViewById(R.id.spinnerPassType);
        spinnerDuration = findViewById(R.id.spinnerDuration);
        editStartDate = findViewById(R.id.editStartDate);
        btnUploadIdProof = findViewById(R.id.btnUploadIdProof);
        btnUploadPhoto = findViewById(R.id.btnUploadPhoto);
        btnSubmitApplication = findViewById(R.id.btnSubmitApplication);
        tvIdProofStatus = findViewById(R.id.tvIdProofStatus);
        tvPhotoStatus = findViewById(R.id.tvPhotoStatus);
        tvTotalAmount = findViewById(R.id.tvTotalAmount);
        tvPassDetails = findViewById(R.id.tvPassDetails);
    }

    private void initializeData() {
        // Location data
        locationData.put("Gujarat", new String[]{"Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"});
        locationData.put("Maharashtra", new String[]{"Mumbai", "Pune", "Nagpur", "Nashik"});
        locationData.put("Delhi", new String[]{"New Delhi", "Dwarka", "Rohini", "Noida"});
        locationData.put("Karnataka", new String[]{"Bengaluru", "Mysuru", "Hubli"});
        locationData.put("Tamil Nadu", new String[]{"Chennai", "Coimbatore", "Madurai"});
        locationData.put("Rajasthan", new String[]{"Jaipur", "Jodhpur", "Udaipur"});

        // Base prices
        basePrices.put("1 Month", 500);
        basePrices.put("3 Months", 1400);
        basePrices.put("6 Months", 2500);
        basePrices.put("12 Months", 4500);

        // Type multipliers
        typeMultipliers.put("General", 1.0);
        typeMultipliers.put("Student (50% off)", 0.5);
        typeMultipliers.put("Senior Citizen (50% off)", 0.5);
        typeMultipliers.put("Disabled (70% off)", 0.3);

        // Set default date
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
        editStartDate.setText(sdf.format(calendar.getTime()));
    }

    private void setupSpinners() {
        // State Spinner
        List<String> stateList = new ArrayList<>();
        stateList.add("Select State");
        stateList.addAll(locationData.keySet());

        ArrayAdapter<String> stateAdapter = new ArrayAdapter<>(this,
                R.layout.spinner_item, stateList);
        stateAdapter.setDropDownViewResource(R.layout.spinner_dropdown_item);
        spinnerState.setAdapter(stateAdapter);
        spinnerState.setSelection(0); // Show "Select State" inside the box

        spinnerState.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                if (position > 0) {
                    selectedState = parent.getItemAtPosition(position).toString();
                    updateCitySpinner();
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });

        // Pass Type Spinner
        String[] passTypes = {"Select Pass Type", "General", "Student (50% off)", "Senior Citizen (50% off)", "Disabled (70% off)"};
        ArrayAdapter<String> passTypeAdapter = new ArrayAdapter<>(this,
                R.layout.spinner_item, passTypes);
        passTypeAdapter.setDropDownViewResource(R.layout.spinner_dropdown_item);
        spinnerPassType.setAdapter(passTypeAdapter);
        spinnerPassType.setSelection(0); // Show "Select Pass Type" inside the box

        spinnerPassType.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                if (position > 0) {
                    updatePrice();
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });

        // Duration Spinner
        String[] durations = {"Select Duration", "1 Month", "3 Months", "6 Months", "12 Months"};
        ArrayAdapter<String> durationAdapter = new ArrayAdapter<>(this,
                R.layout.spinner_item, durations);
        durationAdapter.setDropDownViewResource(R.layout.spinner_dropdown_item);
        spinnerDuration.setAdapter(durationAdapter);
        spinnerDuration.setSelection(0); // Show "Select Duration" inside the box

        spinnerDuration.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                if (position > 0) {
                    updatePrice();
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });

        // Initialize city spinner
        updateCitySpinner();
    }

    private void updateCitySpinner() {
        String[] cities = locationData.get(selectedState);
        if (cities != null) {
            List<String> cityList = new ArrayList<>();
            cityList.add("Select City");
            cityList.addAll(Arrays.asList(cities));

            ArrayAdapter<String> cityAdapter = new ArrayAdapter<>(this,
                    R.layout.spinner_item, cityList);
            cityAdapter.setDropDownViewResource(R.layout.spinner_dropdown_item);
            spinnerCity.setAdapter(cityAdapter);
            spinnerCity.setSelection(0); // Show "Select City" inside the box
            selectedCity = cities[0];
        }
    }

    private void setupDatePicker() {
        editStartDate.setOnClickListener(v -> {
            DatePickerDialog datePickerDialog = new DatePickerDialog(
                    this,
                    (view, year, month, dayOfMonth) -> {
                        calendar.set(Calendar.YEAR, year);
                        calendar.set(Calendar.MONTH, month);
                        calendar.set(Calendar.DAY_OF_MONTH, dayOfMonth);
                        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
                        editStartDate.setText(sdf.format(calendar.getTime()));
                    },
                    calendar.get(Calendar.YEAR),
                    calendar.get(Calendar.MONTH),
                    calendar.get(Calendar.DAY_OF_MONTH)
            );
            datePickerDialog.getDatePicker().setMinDate(System.currentTimeMillis());
            datePickerDialog.show();
        });
    }

    private void setupButtons() {
        btnUploadIdProof.setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
            idProofLauncher.launch(intent);
        });

        btnUploadPhoto.setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
            photoLauncher.launch(intent);
        });

        btnSubmitApplication.setOnClickListener(v -> submitApplication());
    }

    private void updatePrice() {
        String passType = spinnerPassType.getSelectedItem() != null && spinnerPassType.getSelectedItemPosition() > 0 ?
                spinnerPassType.getSelectedItem().toString() : "General";
        String duration = spinnerDuration.getSelectedItem() != null && spinnerDuration.getSelectedItemPosition() > 0 ?
                spinnerDuration.getSelectedItem().toString() : "1 Month";

        // If still showing placeholder, use defaults
        if (passType.equals("Select Pass Type")) passType = "General";
        if (duration.equals("Select Duration")) duration = "1 Month";

        Integer basePrice = basePrices.get(duration);
        Double multiplier = typeMultipliers.get(passType);
        if (basePrice == null) basePrice = 500;
        if (multiplier == null) multiplier = 1.0;
        int finalPrice = (int) Math.round(basePrice * multiplier);

        tvTotalAmount.setText("₹" + finalPrice);
        tvPassDetails.setText(passType + " • " + duration);
    }


    private String bitmapToBase64(Bitmap bitmap) {
        // Resize if too large
        int maxSize = 1024;
        if (bitmap.getWidth() > maxSize || bitmap.getHeight() > maxSize) {
            float scale = Math.min(((float)maxSize / bitmap.getWidth()), ((float)maxSize / bitmap.getHeight()));
            int width = Math.round(scale * bitmap.getWidth());
            int height = Math.round(scale * bitmap.getHeight());
            bitmap = Bitmap.createScaledBitmap(bitmap, width, height, true);
        }

        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.JPEG, 80, byteArrayOutputStream);
        byte[] byteArray = byteArrayOutputStream.toByteArray();
        return Base64.encodeToString(byteArray, Base64.DEFAULT);
    }

    private void submitApplication() {
        // Validation
        if (!routesLoaded || routeId.isEmpty()) {
            Toast.makeText(this, "Routes not loaded yet, please wait", Toast.LENGTH_SHORT).show();
            return;
        }
        if (idProofBase64.isEmpty()) {
            Toast.makeText(this, "Please upload ID proof", Toast.LENGTH_SHORT).show();
            return;
        }
        if (photoBase64.isEmpty()) {
            Toast.makeText(this, "Please upload your photo", Toast.LENGTH_SHORT).show();
            return;
        }

        if (spinnerPassType.getSelectedItem() == null || spinnerPassType.getSelectedItemPosition() == 0) {
            Toast.makeText(this, "Please select a pass type", Toast.LENGTH_SHORT).show();
            return;
        }
        if (spinnerDuration.getSelectedItem() == null || spinnerDuration.getSelectedItemPosition() == 0) {
            Toast.makeText(this, "Please select a duration", Toast.LENGTH_SHORT).show();
            return;
        }

        String passType = getPassTypeKey(spinnerPassType.getSelectedItem().toString());
        String duration = getDurationKey(spinnerDuration.getSelectedItem().toString());
        String startDate = editStartDate.getText().toString();

        String passTypeStr = spinnerPassType.getSelectedItem().toString();
        String durationStr = spinnerDuration.getSelectedItem().toString();
        Integer basePrice = basePrices.get(durationStr);
        Double multiplier = typeMultipliers.get(passTypeStr);
        if (basePrice == null) basePrice = 500;
        if (multiplier == null) multiplier = 1.0;
        int totalAmount = (int) Math.round(basePrice * multiplier);

        btnSubmitApplication.setEnabled(false);
        btnSubmitApplication.setText("Submitting...");

        ApiService apiService = ApiClient.getClient().create(ApiService.class);

        // Create application request - using the loaded routeId
        ApplicationRequest request = new ApplicationRequest(
                routeId, // Using the actual route ID loaded from backend
                passType,
                duration,
                startDate,
                idProofBase64,
                photoBase64,
                totalAmount
        );

        Call<ApplicationResponse> call = apiService.createApplication(request);
        call.enqueue(new Callback<ApplicationResponse>() {
            @Override
            public void onResponse(Call<ApplicationResponse> call, Response<ApplicationResponse> response) {
                btnSubmitApplication.setEnabled(true);
                btnSubmitApplication.setText("Submit Application");

                if (response.isSuccessful() && response.body() != null) {
                    Toast.makeText(ApplyPassActivity.this,
                            "Application submitted successfully!", Toast.LENGTH_LONG).show();
                    finish();
                } else {
                    Toast.makeText(ApplyPassActivity.this,
                            "Error: " + response.message(), Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApplicationResponse> call, Throwable t) {
                btnSubmitApplication.setEnabled(true);
                btnSubmitApplication.setText("Submit Application");
                Toast.makeText(ApplyPassActivity.this,
                        "Network error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private String getPassTypeKey(String displayName) {
        if (displayName.contains("Student")) return "student";
        if (displayName.contains("Senior")) return "senior";
        if (displayName.contains("Disabled")) return "disabled";
        return "general";
    }

    private String getDurationKey(String displayName) {
        if (displayName.contains("1")) return "1month";
        if (displayName.contains("3")) return "3months";
        if (displayName.contains("6")) return "6months";
        return "12months";
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}
