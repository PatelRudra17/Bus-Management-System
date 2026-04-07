package com.buspass.management.activities;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.ArrayAdapter;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.buspass.management.R;
import com.buspass.management.api.ApiService;
import com.buspass.management.models.ApiResponse;
import com.buspass.management.utils.ApiClient;
import com.google.gson.Gson;

import java.util.HashMap;
import java.util.Map;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ReportIssueActivity extends AppCompatActivity {

    private EditText etBusId, etLocation, etDescription, etIncidentTime;
    private Spinner spinnerIncidentType, spinnerSeverity;
    private Button btnSubmit, btnCancel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_report_issue);

        setupToolbar();
        initializeViews();
        setupSpinners();
        setupButtons();
    }

    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Report an Incident");
        }
    }

    private void initializeViews() {
        etBusId = findViewById(R.id.etBusId);
        etLocation = findViewById(R.id.etLocation);
        etDescription = findViewById(R.id.etDescription);
        etIncidentTime = findViewById(R.id.etIncidentTime);
        spinnerIncidentType = findViewById(R.id.spinnerIncidentType);
        spinnerSeverity = findViewById(R.id.spinnerSeverity);
        btnSubmit = findViewById(R.id.btnSubmit);
        btnCancel = findViewById(R.id.btnCancel);
    }

    private void setupSpinners() {
        // Incident Type Spinner
        String[] incidentTypes = {
            "Harassment",
            "Theft",
            "Accident",
            "Medical Emergency",
            "Misbehavior",
            "Fare Evasion",
            "Property Damage",
            "Safety Concern",
            "Other"
        };
        ArrayAdapter<String> typeAdapter = new ArrayAdapter<>(this,
                android.R.layout.simple_spinner_item, incidentTypes);
        typeAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerIncidentType.setAdapter(typeAdapter);

        // Severity Spinner
        String[] severities = {"Low", "Medium", "High", "Critical"};
        ArrayAdapter<String> severityAdapter = new ArrayAdapter<>(this,
                android.R.layout.simple_spinner_item, severities);
        severityAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerSeverity.setAdapter(severityAdapter);
        spinnerSeverity.setSelection(1); // Default to Medium
    }

    private void setupButtons() {
        btnSubmit.setOnClickListener(v -> submitReport());
        btnCancel.setOnClickListener(v -> finish());
    }

    private void submitReport() {
        // Validate inputs
        String busId = etBusId.getText().toString().trim();
        String location = etLocation.getText().toString().trim();
        String description = etDescription.getText().toString().trim();
        String incidentTime = etIncidentTime.getText().toString().trim();

        if (busId.isEmpty()) {
            Toast.makeText(this, "Please enter Bus ID", Toast.LENGTH_SHORT).show();
            return;
        }

        if (description.isEmpty()) {
            Toast.makeText(this, "Please provide a description", Toast.LENGTH_SHORT).show();
            return;
        }

        if (incidentTime.isEmpty()) {
            Toast.makeText(this, "Please enter incident time", Toast.LENGTH_SHORT).show();
            return;
        }

        // Disable button while submitting
        btnSubmit.setEnabled(false);
        btnSubmit.setText("Submitting...");

        // Prepare request data
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("busId", busId);
        requestData.put("incidentType", getIncidentTypeValue(spinnerIncidentType.getSelectedItem().toString()));
        requestData.put("severity", spinnerSeverity.getSelectedItem().toString().toLowerCase());
        requestData.put("description", description);
        requestData.put("incidentTime", incidentTime);

        Map<String, String> locationMap = new HashMap<>();
        locationMap.put("stopName", location);
        requestData.put("location", locationMap);

        // Submit to API
        ApiService apiService = ApiClient.getClient().create(ApiService.class);
        Call<ApiResponse> call = apiService.reportIncident(requestData);

        call.enqueue(new Callback<ApiResponse>() {
            @Override
            public void onResponse(Call<ApiResponse> call, Response<ApiResponse> response) {
                btnSubmit.setEnabled(true);
                btnSubmit.setText("Submit Report");

                if (response.isSuccessful()) {
                    Toast.makeText(ReportIssueActivity.this,
                        "Incident reported successfully. Authorities have been notified.",
                        Toast.LENGTH_LONG).show();
                    finish();
                } else {
                    Toast.makeText(ReportIssueActivity.this,
                        "Failed to submit report: " + response.message(),
                        Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse> call, Throwable t) {
                btnSubmit.setEnabled(true);
                btnSubmit.setText("Submit Report");
                Toast.makeText(ReportIssueActivity.this,
                    "Network error: " + t.getMessage(),
                    Toast.LENGTH_SHORT).show();
            }
        });
    }

    private String getIncidentTypeValue(String displayName) {
        switch (displayName) {
            case "Harassment": return "harassment";
            case "Theft": return "theft";
            case "Accident": return "accident";
            case "Medical Emergency": return "medical_emergency";
            case "Misbehavior": return "misbehavior";
            case "Fare Evasion": return "fare_evasion";
            case "Property Damage": return "property_damage";
            case "Safety Concern": return "safety_concern";
            default: return "other";
        }
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }
}
