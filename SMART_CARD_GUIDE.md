# Smart Card System - Implementation Guide

## Overview

The Smart Card System is a comprehensive enhancement to the Bus Pass Management System that provides:
- **Identity Verification**: Aadhaar + PAN verified cards (One card per person)
- **Tap & Travel**: Cashless, contactless bus travel
- **Safety Features**: SOS, family tracking, incident management
- **Travel Logs**: Complete journey history with CCTV linkage
- **Incident Tracing**: Identify passengers during incidents

## System Architecture

### Backend Components

#### 1. Models
- **SmartCard.js** - Main smart card with identity verification, balance, safety features
- **TravelLog.js** - Records each journey with tap-on/tap-off
- **Incident.js** - Incident reporting and investigation system

#### 2. Controllers
- **smartCardController.js** - Card application, recharge, verification
- **travelLogController.js** - Trip start/end, SOS, travel history
- **incidentController.js** - Report incidents, track investigations

#### 3. Routes
- `/api/cards/*` - Smart card operations
- `/api/travel/*` - Travel log operations
- `/api/incidents/*` - Incident management

### Frontend Components

#### User Pages
1. **ApplySmartCard.js** - Application form with Aadhaar/PAN
2. **MySmartCard.js** - Card dashboard, balance, travel history
3. **ReportIncident.js** - Incident reporting form

#### Admin Pages
1. **AdminSmartCards.js** - Verify cards, manage users, view statistics

## Features Implementation

### 1. Registration & Verification (Phase 1)

**Flow:**
1. User applies with Aadhaar (12 digits) + PAN (format: ABCDE1234F)
2. Upload photo for card display
3. Select concession type (student 50%, senior 50%, disabled 75%, women 25%)
4. Add emergency contacts for safety
5. Admin verifies Aadhaar & PAN
6. Card status changes: pending → active

**Key Features:**
- One card per person (enforced by unique Aadhaar/PAN)
- Photo on card for conductor verification
- Concession auto-applied on each trip
- 5-year validity

### 2. Payment & Balance (Phase 1)

**Features:**
- Prepaid balance system
- Online/offline recharge
- Auto-recharge when balance < threshold
- Real-time balance updates
- Transaction history

**API Endpoints:**
```
POST /api/cards/recharge
GET /api/cards/transactions
```

### 3. Tap & Travel (Phase 2)

**Flow:**
1. **Boarding**: Tap card at bus entry
   - Creates TravelLog with status='ongoing'
   - Records boarding point, timestamp, bus ID
   - Increments trip counter

2. **Journey**: Live tracking (optional)
   - Update live location
   - ETA to destination
   - Family can track via app

3. **Alighting**: Tap card at exit
   - Records alighting point, timestamp
   - Calculates distance & fare
   - Applies concession discount
   - Deducts from card balance
   - Stores 90-day travel history

**API Endpoints:**
```
POST /api/travel/start
PUT /api/travel/end/:tripId
GET /api/travel/live/:tripId
GET /api/travel/history
```

### 4. Safety Features (Phase 2-3)

#### SOS Panic Button
- Triggered during emergency
- Sends location + trip details to:
  - Emergency contacts
  - Control room
  - Police (for critical incidents)
- Marks travel log with SOS flag

```
POST /api/travel/sos/:tripId
```

#### Family Tracking
- Family members can see:
  - Which bus you boarded
  - Live location
  - ETA
- Requires opt-in during card application

#### Night Travel Alert
- Auto SMS to emergency contacts after 9 PM
- Configurable in card settings

#### Women-Only Zone Tag
- Card flagged for women passengers
- Priority seat reservation
- Enhanced monitoring

### 5. Incident Management (Phase 3)

**Safety Flow:**
1. Incident reported (by passenger, driver, or system)
2. Bus log pulled → identifies all passengers on bus
3. Aadhaar-linked identities retrieved
4. CCTV footage secured (90 days retention)
5. Investigation assigned
6. Police action if required

**Incident Types:**
- Harassment
- Theft
- Accident
- Medical emergency
- Misbehavior
- Fare evasion
- Property damage
- Safety concern

**API Endpoints:**
```
POST /api/incidents/report
GET /api/incidents/my-reports
GET /api/incidents/:id
POST /api/incidents/:id/witness
```

**Admin Operations:**
```
GET /api/incidents/admin/all
PUT /api/incidents/admin/:id/assign
PUT /api/incidents/admin/:id/status
POST /api/incidents/admin/:id/identify
```

### 6. Card Features (As per your diagram)

#### Identity Features
- Aadhaar verified name + photo
- PAN verification
- Photo on card display
- Conductor can verify face

#### Payment Features
- Prepaid balance
- Auto deduction on tap
- Online/offline recharge
- Monthly/weekly pass option

#### Travel Log Features
- Route + time stored securely
- 90-day history
- Export capability
- Linked to CCTV timestamps

#### Concession Features
- Student/senior discount auto-applied
- Disabled priority
- Women safety discount
- Document verification required

### 7. Blacklist System (Admin)

**Reasons for Blacklisting:**
- Fare evasion
- Repeated misbehavior
- Safety violations
- Fraud

**Process:**
```
PUT /api/cards/admin/:id/block
Body: { action: 'block', reason: 'Fare evasion' }
```

Card blocked → Cannot board bus → Must resolve with admin

## Database Schema

### SmartCard
```javascript
{
  cardNumber: String (unique),
  userId: ObjectId (ref User),
  verification: {
    aadhaarNumber: String (12 digits, unique),
    panNumber: String (format: XXXXX9999X, unique),
    aadhaarVerified: Boolean,
    panVerified: Boolean,
    photo: String
  },
  balance: Number,
  concessionType: Enum,
  concessionPercentage: Number,
  safetyFeatures: {
    sosEnabled: Boolean,
    emergencyContacts: Array,
    familyTrackingEnabled: Boolean,
    nightTravelAlert: Boolean,
    womenOnlyZone: Boolean
  },
  blacklisted: {
    isBlacklisted: Boolean,
    reason: String
  },
  stats: {
    totalTrips: Number,
    totalSpent: Number,
    lastUsed: Date
  }
}
```

### TravelLog
```javascript
{
  tripId: String (unique),
  cardId: ObjectId (ref SmartCard),
  userId: ObjectId (ref User),
  busId: String,
  routeId: ObjectId (ref Route),
  boardingPoint: {
    stopName: String,
    location: GeoJSON Point,
    timestamp: Date
  },
  alightingPoint: {
    stopName: String,
    location: GeoJSON Point,
    timestamp: Date
  },
  fare: {
    baseFare: Number,
    concessionApplied: Number,
    finalFare: Number
  },
  safetyData: {
    isNightTravel: Boolean,
    sosTriggered: Boolean,
    occupancy: Enum
  },
  cctvFootage: {
    available: Boolean,
    cameraIds: Array,
    footageRetainedUntil: Date
  }
}
```

### Incident
```javascript
{
  incidentId: String (unique),
  reportedBy: { userId, cardId },
  travelLogId: ObjectId (ref TravelLog),
  busId: String,
  incidentType: Enum,
  severity: Enum,
  description: String,
  identifiedPersons: [{
    cardId: ObjectId (ref SmartCard),
    userId: ObjectId (ref User),
    aadhaarLinked: String,
    role: Enum (suspect/witness/victim)
  }],
  investigation: {
    findings: String,
    actionTaken: String,
    policeInvolved: Boolean,
    firNumber: String
  }
}
```

## Implementation Phases

### Phase 1: Basic Smart Card (Completed)
- ✅ Card application with Aadhaar/PAN
- ✅ Admin verification
- ✅ Balance & recharge
- ✅ Card dashboard

### Phase 2: Tap & Travel (Hardware Required)
- ⏳ NFC/RFID card readers on buses
- ⏳ Tap-on/tap-off implementation
- ⏳ Real-time fare calculation
- ⏳ GPS integration for location

### Phase 3: Safety & Tracking (In Progress)
- ✅ Incident reporting system
- ✅ Travel log tracking
- ⏳ Family tracking app
- ⏳ SMS/Push notifications
- ⏳ CCTV integration API

### Phase 4: Advanced Features (Future)
- ⏳ Overcrowd detection sensors
- ⏳ Silent alert mode
- ⏳ Safe drop confirmation
- ⏳ AI-powered anomaly detection

## Installation & Setup

### 1. Backend Setup
Already integrated! The routes are added to `server.js`:
```javascript
app.use('/api/cards', smartCardRoutes);
app.use('/api/travel', travelLogRoutes);
app.use('/api/incidents', incidentRoutes);
```

### 2. Frontend Routes
Added to `App.js`:
- `/apply-smart-card` - Apply for new card
- `/my-card` - View card & travel history
- `/report-incident` - Report incident
- `/admin/smart-cards` - Admin card management

### 3. Test the System

#### User Flow:
1. Register/Login
2. Go to `/apply-smart-card`
3. Fill Aadhaar (e.g., 123456789012)
4. Fill PAN (e.g., ABCDE1234F)
5. Upload photo
6. Select concession if applicable
7. Add emergency contacts
8. Submit application

#### Admin Flow:
1. Login as admin
2. Go to `/admin/smart-cards`
3. View pending applications
4. Click "Verify" to approve card
5. Card becomes active

#### Recharge:
1. Go to `/my-card`
2. Enter amount (e.g., ₹500)
3. Click "Recharge Now"
4. Balance updates instantly

## API Documentation

### User Endpoints

#### Apply for Card
```http
POST /api/cards/apply
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
{
  "aadhaarNumber": "123456789012",
  "panNumber": "ABCDE1234F",
  "concessionType": "student",
  "photo": <file>,
  "emergencyContacts": [
    {"name": "Parent", "phone": "9876543210", "relationship": "Father"}
  ],
  "nightTravelAlert": true,
  "familyTrackingEnabled": true
}
```

#### Get My Card
```http
GET /api/cards/my-card
Authorization: Bearer <token>
```

#### Recharge Card
```http
POST /api/cards/recharge
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "amount": 500
}
```

### Travel Endpoints

#### Start Trip
```http
POST /api/travel/start
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "busId": "BUS001",
  "routeId": "60d5f...",
  "boardingStop": "Central Station",
  "boardingLocation": [77.5946, 12.9716]  // [longitude, latitude]
}
```

#### End Trip
```http
PUT /api/travel/end/:tripId
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "alightingStop": "Airport",
  "alightingLocation": [77.7064, 13.1986]
}
```

#### Trigger SOS
```http
POST /api/travel/sos/:tripId
Authorization: Bearer <token>
```

### Admin Endpoints

#### Get All Cards
```http
GET /api/cards/admin/all?status=pending&page=1&limit=20
Authorization: Bearer <token>
```

#### Verify Card
```http
PUT /api/cards/admin/:cardId/verify
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "aadhaarVerified": true,
  "panVerified": true,
  "status": "active"
}
```

#### Block/Unblock Card
```http
PUT /api/cards/admin/:cardId/block
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "action": "block",  // or "unblock"
  "reason": "Fare evasion reported 3 times"
}
```

## Security Considerations

1. **Aadhaar Data**: Masked in frontend (XXXX-XXXX-1234)
2. **PAN Data**: Stored securely, only visible to admin
3. **Photo**: Secure storage, access controlled
4. **Balance**: Encrypted in transit
5. **Location**: Only stored during active trip
6. **CCTV**: Reference only, footage on secure server
7. **Incidents**: Sensitive data, admin-only access

## Benefits Summary (As per your diagram)

### Problems Solved:
1. ✅ **Safety Issue**: Unknown passengers identified
2. ✅ **Women's Safety**: Travel records traceable
3. ✅ **Incident Tracing**: Who was on bus, when
4. ✅ **No More Queues**: Tap card, board fast
5. ✅ **Regular Commuters**: Monthly/weekly pass card
6. ✅ **No Cash Needed**: Recharge online or offline

### Card Features:
1. ✅ **Identity**: Aadhaar verified name + photo
2. ✅ **Payment**: Prepaid balance, auto deduct
3. ✅ **Travel Log**: Route + time stored securely
4. ✅ **Concession**: Student/senior discount auto-applied

### Safety Flow:
Incident → Bus log pulled → Persons identified → Police action

## Future Enhancements

1. **Mobile App**: QR code-based virtual card
2. **UPI Integration**: Auto-recharge via UPI
3. **Pass System**: Monthly unlimited travel
4. **Family Cards**: Link family members
5. **Tourist Cards**: Special rates for tourists
6. **Senior Alert**: Auto-notify on fall detection
7. **Route Optimizer**: AI suggests best routes
8. **Carbon Credits**: Reward frequent users

---

## Support

For issues or questions:
- Backend: Check `/backend/controllers/smartCardController.js`
- Frontend: Check `/frontend/src/pages/ApplySmartCard.js`
- Database: MongoDB collections: `smartcards`, `travellogs`, `incidents`

**Your smart card system is now ready!** 🎉🚌💳
