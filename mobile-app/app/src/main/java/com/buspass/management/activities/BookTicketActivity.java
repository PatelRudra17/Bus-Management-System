package com.buspass.management.activities;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.cardview.widget.CardView;

import com.buspass.management.R;
import com.buspass.management.api.ApiService;
import com.buspass.management.models.RoutesResponse;
import com.buspass.management.models.TicketRequest;
import com.buspass.management.models.TicketResponse;
import com.buspass.management.utils.ApiClient;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class BookTicketActivity extends AppCompatActivity {

    // Location data (same as web)
    private static final Map<String, String[]> LOCATION_DATA = new LinkedHashMap<>();
    static {
        LOCATION_DATA.put("Gujarat", new String[]{"Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"});
        LOCATION_DATA.put("Maharashtra", new String[]{"Mumbai", "Pune", "Nagpur", "Nashik"});
        LOCATION_DATA.put("Delhi", new String[]{"New Delhi", "Dwarka", "Rohini", "Noida"});
        LOCATION_DATA.put("Karnataka", new String[]{"Bengaluru", "Mysuru", "Hubli"});
        LOCATION_DATA.put("Tamil Nadu", new String[]{"Chennai", "Coimbatore", "Madurai"});
        LOCATION_DATA.put("Rajasthan", new String[]{"Jaipur", "Jodhpur", "Udaipur"});
        LOCATION_DATA.put("Uttar Pradesh", new String[]{"Lucknow", "Kanpur", "Agra", "Varanasi"});
        LOCATION_DATA.put("West Bengal", new String[]{"Kolkata", "Howrah", "Durgapur"});
    }

    // Step indicators
    private View step1Indicator, step2Indicator, step3Indicator, step4Indicator;
    private View line1, line2, line3;
    private TextView step1Text, step2Text, step3Text, step4Text;

    // Step containers
    private LinearLayout step1Container, step2Container, step3Container, step4Container;

    // Step 1 - State/City + Route Cards
    private Spinner spinnerState, spinnerCity, spinnerRoute;
    private TextView tvCityInfo, tvRouteCount, tvNoRoutes, tvRouteInfo;
    private LinearLayout routeCardsContainer;
    private ProgressBar routeLoading;
    private CardView cardRouteDetails;
    private TextView tvRouteSource, tvRouteDestination, tvRouteDistance, tvRouteFare;

    // Step 2 - Passenger Details
    private LinearLayout passengersContainer;
    private Button btnAddPassenger;
    private List<PassengerView> passengerViews = new ArrayList<>();

    // Step 3 - Payment
    private CardView btnPaymentUpi, btnPaymentCard, btnPaymentNetbanking, btnPaymentWallet;
    private TextView tvSummaryRoute, tvSummaryPassengers, tvSummaryPayment, tvSummaryTotal;

    // Main Summary Card
    private LinearLayout summaryRouteSection, summaryEmptyState, summaryContent;
    private TextView tvSummaryRouteMain, tvSummaryPassengersMain, tvSummaryBaseFare, tvSummaryPassengerCount, tvSummaryTotalMain;

    // Step 4 - Confirmation
    private TextView tvBookingRef, tvConfirmRoute, tvConfirmPassengers, tvConfirmPayment, tvConfirmAmount;

    // Navigation
    private Button btnNext, btnBack, btnPayNow, btnConfirmBooking;

    // Data
    private int currentStep = 0;
    private List<RoutesResponse.Route> allRoutes = new ArrayList<>();
    private List<RoutesResponse.Route> filteredRoutes = new ArrayList<>();
    private RoutesResponse.Route selectedRoute;
    private String paymentMethod = "upi";
    private String bookingReference;
    private String selectedState = "Gujarat";
    private String selectedCity = "Ahmedabad";
    private View selectedRouteCard = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_book_ticket);

        setupToolbar();
        initializeViews();
        setupStateSpinner();
        setupStepIndicators();
        fetchRoutes();
        showStep(0);
        updateMainSummary();
    }

    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Book Ticket");
        }
    }

    private void initializeViews() {
        // Step indicators
        step1Indicator = findViewById(R.id.step1Indicator);
        step2Indicator = findViewById(R.id.step2Indicator);
        step3Indicator = findViewById(R.id.step3Indicator);
        step4Indicator = findViewById(R.id.step4Indicator);
        line1 = findViewById(R.id.line1);
        line2 = findViewById(R.id.line2);
        line3 = findViewById(R.id.line3);
        step1Text = findViewById(R.id.step1Text);
        step2Text = findViewById(R.id.step2Text);
        step3Text = findViewById(R.id.step3Text);
        step4Text = findViewById(R.id.step4Text);

        // Step containers
        step1Container = findViewById(R.id.step1Container);
        step2Container = findViewById(R.id.step2Container);
        step3Container = findViewById(R.id.step3Container);
        step4Container = findViewById(R.id.step4Container);

        // Step 1 views - State/City + Route Cards
        spinnerState = findViewById(R.id.spinnerState);
        spinnerCity = findViewById(R.id.spinnerCity);
        spinnerRoute = findViewById(R.id.spinnerRoute); // hidden, kept for compat
        tvCityInfo = findViewById(R.id.tvCityInfo);
        tvRouteCount = findViewById(R.id.tvRouteCount);
        tvNoRoutes = findViewById(R.id.tvNoRoutes);
        tvRouteInfo = findViewById(R.id.tvRouteInfo);
        routeCardsContainer = findViewById(R.id.routeCardsContainer);
        routeLoading = findViewById(R.id.routeLoading);
        cardRouteDetails = findViewById(R.id.cardRouteDetails);
        tvRouteSource = findViewById(R.id.tvRouteSource);
        tvRouteDestination = findViewById(R.id.tvRouteDestination);
        tvRouteDistance = findViewById(R.id.tvRouteDistance);
        tvRouteFare = findViewById(R.id.tvRouteFare);

        // Step 2 views
        passengersContainer = findViewById(R.id.passengersContainer);
        btnAddPassenger = findViewById(R.id.btnAddPassenger);

        // Step 3 views
        btnPaymentUpi = findViewById(R.id.btnPaymentUpi);
        btnPaymentCard = findViewById(R.id.btnPaymentCard);
        btnPaymentNetbanking = findViewById(R.id.btnPaymentNetbanking);
        btnPaymentWallet = findViewById(R.id.btnPaymentWallet);
        tvSummaryRoute = findViewById(R.id.tvSummaryRoute);
        tvSummaryPassengers = findViewById(R.id.tvSummaryPassengers);
        tvSummaryPayment = findViewById(R.id.tvSummaryPayment);
        tvSummaryTotal = findViewById(R.id.tvSummaryTotal);

        // Main summary
        summaryEmptyState = findViewById(R.id.summaryEmptyState);
        summaryContent = findViewById(R.id.summaryContent);
        summaryRouteSection = findViewById(R.id.summaryRouteSection);
        tvSummaryRouteMain = findViewById(R.id.tvSummaryRouteMain);
        tvSummaryPassengersMain = findViewById(R.id.tvSummaryPassengersMain);
        tvSummaryBaseFare = findViewById(R.id.tvSummaryBaseFare);
        tvSummaryPassengerCount = findViewById(R.id.tvSummaryPassengerCount);
        tvSummaryTotalMain = findViewById(R.id.tvSummaryTotalMain);

        // Step 4 views
        tvBookingRef = findViewById(R.id.tvBookingRef);
        tvConfirmRoute = findViewById(R.id.tvConfirmRoute);
        tvConfirmPassengers = findViewById(R.id.tvConfirmPassengers);
        tvConfirmPayment = findViewById(R.id.tvConfirmPayment);
        tvConfirmAmount = findViewById(R.id.tvConfirmAmount);

        // Navigation
        btnNext = findViewById(R.id.btnNext);
        btnBack = findViewById(R.id.btnBack);
        btnPayNow = findViewById(R.id.btnPayNow);
        btnConfirmBooking = findViewById(R.id.btnConfirmBooking);

        setupListeners();
        addPassenger();
    }

    private void setupStateSpinner() {
        List<String> states = new ArrayList<>(LOCATION_DATA.keySet());
        ArrayAdapter<String> stateAdapter = new ArrayAdapter<>(this,
                R.layout.spinner_item, states);
        stateAdapter.setDropDownViewResource(R.layout.spinner_dropdown_item);
        spinnerState.setAdapter(stateAdapter);

        spinnerState.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(android.widget.AdapterView<?> parent, View view, int pos, long id) {
                selectedState = states.get(pos);
                updateCitySpinner();
            }
            @Override
            public void onNothingSelected(android.widget.AdapterView<?> parent) {}
        });

        updateCitySpinner();
    }

    private void updateCitySpinner() {
        String[] cities = LOCATION_DATA.get(selectedState);
        if (cities == null) cities = new String[]{"Select City"};
        ArrayAdapter<String> cityAdapter = new ArrayAdapter<>(this,
                R.layout.spinner_item, cities);
        cityAdapter.setDropDownViewResource(R.layout.spinner_dropdown_item);
        spinnerCity.setAdapter(cityAdapter);

        spinnerCity.setOnItemSelectedListener(new android.widget.AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(android.widget.AdapterView<?> parent, View view, int pos, long id) {
                String[] c = LOCATION_DATA.get(selectedState);
                if (c != null && pos < c.length) {
                    selectedCity = c[pos];
                    filterAndShowRoutes();
                }
            }
            @Override
            public void onNothingSelected(android.widget.AdapterView<?> parent) {}
        });

        if (cities.length > 0) {
            selectedCity = cities[0];
            filterAndShowRoutes();
        }
    }

    private void filterAndShowRoutes() {
        // Clear selection
        selectedRoute = null;
        selectedRouteCard = null;
        updateMainSummary();

        // Update info banner
        tvCityInfo.setText("Routes in: " + selectedCity + ", " + selectedState);

        // Filter routes by city
        filteredRoutes.clear();
        String cityLower = selectedCity.toLowerCase();
        for (RoutesResponse.Route route : allRoutes) {
            String src = route.getSource() != null ? route.getSource().toLowerCase() : "";
            String dst = route.getDestination() != null ? route.getDestination().toLowerCase() : "";
            if (src.contains(cityLower) || dst.contains(cityLower)) {
                filteredRoutes.add(route);
            }
        }

        tvRouteCount.setText(filteredRoutes.size() + " routes");

        // Render route cards
        renderRouteCards();
    }

    private void renderRouteCards() {
        routeCardsContainer.removeAllViews();

        if (filteredRoutes.isEmpty()) {
            tvNoRoutes.setVisibility(View.VISIBLE);
            return;
        }

        tvNoRoutes.setVisibility(View.GONE);
        LayoutInflater inflater = LayoutInflater.from(this);

        for (int i = 0; i < filteredRoutes.size(); i++) {
            RoutesResponse.Route route = filteredRoutes.get(i);
            View card = inflater.inflate(R.layout.item_route_card, routeCardsContainer, false);

            TextView tvSrc = card.findViewById(R.id.tvRouteSource);
            TextView tvDst = card.findViewById(R.id.tvRouteDestination);
            TextView tvNum = card.findViewById(R.id.tvRouteNumber);
            TextView tvDist = card.findViewById(R.id.tvRouteDistance);
            TextView tvDur = card.findViewById(R.id.tvRouteDuration);
            TextView tvFare = card.findViewById(R.id.tvRouteFare);
            TextView tvBusType = card.findViewById(R.id.tvBusType);

            tvSrc.setText(route.getSource());
            tvDst.setText(route.getDestination());
            tvNum.setText(route.getRouteNumber() != null ? route.getRouteNumber() : "");
            tvDist.setText((route.getDistance() > 0 ? route.getDistance() + " km" : ""));
            tvDur.setText(route.getDuration() != null ? route.getDuration() : "~60 min");
            tvFare.setText("₹" + route.getFare());
            tvBusType.setText(route.getBusType() != null ? route.getBusType().toUpperCase() : "STANDARD");

            // Bus type icon color
            View iconBg = card.findViewById(R.id.busIconBg);
            if (route.getBusType() != null) {
                switch (route.getBusType().toLowerCase()) {
                    case "ac":
                        iconBg.setBackgroundResource(R.drawable.bg_card_icon_info);
                        break;
                    case "luxury":
                        iconBg.setBackgroundResource(R.drawable.bg_card_icon_purple);
                        break;
                    default:
                        iconBg.setBackgroundResource(R.drawable.bg_card_icon);
                        break;
                }
            }

            card.setOnClickListener(v -> {
                // Deselect previous
                if (selectedRouteCard != null) {
                    selectedRouteCard.setSelected(false);
                }
                // Select new
                v.setSelected(true);
                selectedRouteCard = v;
                selectedRoute = route;
                updateMainSummary();
            });

            routeCardsContainer.addView(card);
        }
    }

    private void setupListeners() {
        btnAddPassenger.setOnClickListener(v -> addPassenger());

        btnNext.setOnClickListener(v -> {
            if (validateCurrentStep()) {
                showStep(currentStep + 1);
            }
        });

        btnBack.setOnClickListener(v -> {
            if (currentStep > 0) showStep(currentStep - 1);
            else finish();
        });

        btnPayNow.setOnClickListener(v -> {
            paymentMethod = getSelectedPaymentMethod();
            saveTicketToBackend();
        });

        btnConfirmBooking.setOnClickListener(v -> {
            Toast.makeText(this, "Ticket booked successfully!", Toast.LENGTH_LONG).show();
            finish();
        });

        // Payment buttons
        btnPaymentUpi.setOnClickListener(v -> selectPaymentMethod("upi", btnPaymentUpi));
        btnPaymentCard.setOnClickListener(v -> selectPaymentMethod("card", btnPaymentCard));
        btnPaymentNetbanking.setOnClickListener(v -> selectPaymentMethod("netbanking", btnPaymentNetbanking));
        btnPaymentWallet.setOnClickListener(v -> selectPaymentMethod("wallet", btnPaymentWallet));
        selectPaymentMethod("upi", btnPaymentUpi);
    }

    private void selectPaymentMethod(String method, CardView selectedButton) {
        paymentMethod = method;
        int inactiveColor = 0xFFF8FAFC;
        int activeColor = 0xFF0C4A6E;
        btnPaymentUpi.setCardBackgroundColor(inactiveColor);
        btnPaymentCard.setCardBackgroundColor(inactiveColor);
        btnPaymentNetbanking.setCardBackgroundColor(inactiveColor);
        btnPaymentWallet.setCardBackgroundColor(inactiveColor);
        selectedButton.setCardBackgroundColor(activeColor);
        updateBookingSummary();
    }

    private void fetchRoutes() {
        if (routeLoading != null) routeLoading.setVisibility(View.VISIBLE);
        ApiService apiService = ApiClient.getClient().create(ApiService.class);
        Call<RoutesResponse> call = apiService.getRoutes();
        call.enqueue(new Callback<RoutesResponse>() {
            @Override
            public void onResponse(Call<RoutesResponse> call, Response<RoutesResponse> response) {
                if (routeLoading != null) routeLoading.setVisibility(View.GONE);
                if (response.isSuccessful() && response.body() != null) {
                    allRoutes = response.body().getRoutes();
                    filterAndShowRoutes();
                }
            }
            @Override
            public void onFailure(Call<RoutesResponse> call, Throwable t) {
                if (routeLoading != null) routeLoading.setVisibility(View.GONE);
                Toast.makeText(BookTicketActivity.this, "Failed to load routes", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void addPassenger() {
        if (passengerViews.size() >= 5) {
            Toast.makeText(this, "Maximum 5 passengers", Toast.LENGTH_SHORT).show();
            return;
        }
        PassengerView pv = new PassengerView(this, passengerViews.size() + 1);
        pv.setOnRemoveListener(() -> removePassenger(pv));
        passengersContainer.addView(pv.getView());
        passengerViews.add(pv);
        if (passengerViews.size() >= 5) btnAddPassenger.setVisibility(View.GONE);
        updateMainSummary();
    }

    private void removePassenger(PassengerView pv) {
        if (passengerViews.size() <= 1) return;
        passengersContainer.removeView(pv.getView());
        passengerViews.remove(pv);
        btnAddPassenger.setVisibility(View.VISIBLE);
        for (int i = 0; i < passengerViews.size(); i++) {
            passengerViews.get(i).setPassengerNumber(i + 1);
        }
        updateMainSummary();
    }

    private boolean validateCurrentStep() {
        if (currentStep == 0) {
            if (selectedRoute == null) {
                Toast.makeText(this, "Please select a route", Toast.LENGTH_SHORT).show();
                return false;
            }
            return true;
        } else if (currentStep == 1) {
            for (PassengerView pv : passengerViews) {
                if (!pv.isValid()) {
                    Toast.makeText(this, "Please fill all passenger details", Toast.LENGTH_SHORT).show();
                    return false;
                }
            }
            return true;
        }
        return true;
    }

    private String getSelectedPaymentMethod() { return paymentMethod.toUpperCase(); }

    private void updateBookingSummary() {
        if (tvSummaryRoute != null) {
            tvSummaryRoute.setText(selectedRoute != null ? selectedRoute.getSource() + " → " + selectedRoute.getDestination() : "-");
            tvSummaryPassengers.setText(String.valueOf(passengerViews.size()));
            tvSummaryPayment.setText(paymentMethod.toUpperCase());
            tvSummaryTotal.setText(selectedRoute != null ? "₹" + (selectedRoute.getFare() * passengerViews.size()) : "₹0");
        }
        updateMainSummary();
    }

    private void updateMainSummary() {
        if (summaryEmptyState == null || summaryContent == null) return;
        if (selectedRoute == null) {
            summaryEmptyState.setVisibility(View.VISIBLE);
            summaryContent.setVisibility(View.GONE);
            return;
        }
        summaryEmptyState.setVisibility(View.GONE);
        summaryContent.setVisibility(View.VISIBLE);
        summaryRouteSection.setVisibility(View.VISIBLE);
        tvSummaryRouteMain.setText(selectedRoute.getSource() + " → " + selectedRoute.getDestination());
        tvSummaryBaseFare.setText("₹" + selectedRoute.getFare());
        tvSummaryPassengersMain.setText(String.valueOf(passengerViews.size()));
        tvSummaryPassengerCount.setText(String.valueOf(passengerViews.size()));
        int total = selectedRoute.getFare() * passengerViews.size();
        tvSummaryTotalMain.setText("₹" + total);
    }

    private void showStep(int step) {
        currentStep = step;
        step1Container.setVisibility(View.GONE);
        step2Container.setVisibility(View.GONE);
        step3Container.setVisibility(View.GONE);
        step4Container.setVisibility(View.GONE);
        btnNext.setVisibility(View.GONE);
        btnBack.setVisibility(View.GONE);
        btnPayNow.setVisibility(View.GONE);
        btnConfirmBooking.setVisibility(View.GONE);

        switch (step) {
            case 0:
                step1Container.setVisibility(View.VISIBLE);
                btnNext.setVisibility(View.VISIBLE);
                btnBack.setVisibility(View.VISIBLE);
                btnBack.setText("Cancel");
                break;
            case 1:
                step2Container.setVisibility(View.VISIBLE);
                btnNext.setVisibility(View.VISIBLE);
                btnBack.setVisibility(View.VISIBLE);
                btnBack.setText("Back");
                break;
            case 2:
                step3Container.setVisibility(View.VISIBLE);
                btnPayNow.setVisibility(View.VISIBLE);
                btnBack.setVisibility(View.VISIBLE);
                updatePaymentSummary();
                updateBookingSummary();
                break;
            case 3:
                step4Container.setVisibility(View.VISIBLE);
                btnConfirmBooking.setVisibility(View.VISIBLE);
                showConfirmation();
                break;
        }
        setupStepIndicators();
    }

    private void updatePaymentSummary() {
        if (selectedRoute != null) {
            int total = selectedRoute.getFare() * passengerViews.size();
            btnPayNow.setText("Pay ₹" + total + " and Confirm");
        }
    }

    private void saveTicketToBackend() {
        btnPayNow.setEnabled(false);
        btnPayNow.setText("Processing...");

        List<TicketRequest.Passenger> passengers = new ArrayList<>();
        for (PassengerView pv : passengerViews) {
            passengers.add(new TicketRequest.Passenger(
                pv.etName.getText().toString().trim(),
                Integer.parseInt(pv.etAge.getText().toString().trim()),
                pv.spinnerGender.getSelectedItem().toString().toLowerCase()
            ));
        }

        int totalAmount = selectedRoute.getFare() * passengerViews.size();
        TicketRequest request = new TicketRequest(selectedRoute.getId(), passengers, paymentMethod.toLowerCase(), totalAmount);

        ApiService apiService = ApiClient.getClient().create(ApiService.class);
        apiService.bookTicket(request).enqueue(new Callback<TicketResponse>() {
            @Override
            public void onResponse(Call<TicketResponse> call, Response<TicketResponse> response) {
                btnPayNow.setEnabled(true);
                btnPayNow.setText("Pay ₹" + totalAmount + " and Confirm");
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    bookingReference = response.body().getData().getBookingReference();
                } else {
                    bookingReference = "BT" + String.format(Locale.US, "%08d", new Random().nextInt(100000000));
                }
                showStep(3);
            }
            @Override
            public void onFailure(Call<TicketResponse> call, Throwable t) {
                btnPayNow.setEnabled(true);
                btnPayNow.setText("Pay ₹" + totalAmount + " and Confirm");
                bookingReference = "BT" + String.format(Locale.US, "%08d", new Random().nextInt(100000000));
                showStep(3);
            }
        });
    }

    private void showConfirmation() {
        tvBookingRef.setText(bookingReference);
        tvConfirmRoute.setText(selectedRoute.getSource() + " → " + selectedRoute.getDestination());
        tvConfirmPassengers.setText(String.valueOf(passengerViews.size()));
        tvConfirmPayment.setText(paymentMethod);
        tvConfirmAmount.setText("₹" + (selectedRoute.getFare() * passengerViews.size()));
    }

    private void setupStepIndicators() {
        resetIndicator(step1Indicator, step1Text, line1);
        resetIndicator(step2Indicator, step2Text, line2);
        resetIndicator(step3Indicator, step3Text, line3);
        resetIndicator(step4Indicator, step4Text, null);
        switch (currentStep) {
            case 0: setActiveIndicator(step1Indicator, step1Text); break;
            case 1: setCompletedIndicator(step1Indicator, step1Text, line1); setActiveIndicator(step2Indicator, step2Text); break;
            case 2: setCompletedIndicator(step1Indicator, step1Text, line1); setCompletedIndicator(step2Indicator, step2Text, line2); setActiveIndicator(step3Indicator, step3Text); break;
            case 3: setCompletedIndicator(step1Indicator, step1Text, line1); setCompletedIndicator(step2Indicator, step2Text, line2); setCompletedIndicator(step3Indicator, step3Text, line3); setActiveIndicator(step4Indicator, step4Text); break;
        }
    }

    private void resetIndicator(View indicator, TextView text, View line) {
        indicator.setBackgroundResource(R.drawable.step_inactive);
        text.setTextColor(getResources().getColor(R.color.text_muted));
        if (line != null) line.setBackgroundColor(getResources().getColor(R.color.border));
    }

    private void setActiveIndicator(View indicator, TextView text) {
        indicator.setBackgroundResource(R.drawable.step_active);
        text.setTextColor(getResources().getColor(R.color.primary));
    }

    private void setCompletedIndicator(View indicator, TextView text, View line) {
        indicator.setBackgroundResource(R.drawable.step_completed);
        text.setTextColor(getResources().getColor(R.color.success));
        if (line != null) line.setBackgroundColor(getResources().getColor(R.color.success));
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }

    // Inner class for passenger view
    private static class PassengerView {
        private View view;
        EditText etName, etAge;
        Spinner spinnerGender;
        private Button btnRemove;
        private TextView tvPassengerNumber;
        private OnRemoveListener onRemoveListener;

        public PassengerView(BookTicketActivity activity, int passengerNumber) {
            view = activity.getLayoutInflater().inflate(R.layout.item_passenger, null);
            tvPassengerNumber = view.findViewById(R.id.tvPassengerNumber);
            etName = view.findViewById(R.id.etPassengerName);
            etAge = view.findViewById(R.id.etPassengerAge);
            spinnerGender = view.findViewById(R.id.spinnerGender);
            btnRemove = view.findViewById(R.id.btnRemovePassenger);
            tvPassengerNumber.setText("Passenger " + passengerNumber);

            ArrayAdapter<String> adapter = new ArrayAdapter<>(activity,
                    android.R.layout.simple_spinner_item, new String[]{"Male", "Female", "Other"});
            adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
            spinnerGender.setAdapter(adapter);
            btnRemove.setOnClickListener(v -> { if (onRemoveListener != null) onRemoveListener.onRemove(); });
        }

        public View getView() { return view; }
        public boolean isValid() { return !etName.getText().toString().trim().isEmpty() && !etAge.getText().toString().trim().isEmpty(); }
        public void setPassengerNumber(int n) { tvPassengerNumber.setText("Passenger " + n); }
        public void setOnRemoveListener(OnRemoveListener l) { this.onRemoveListener = l; }
        interface OnRemoveListener { void onRemove(); }
    }
}
