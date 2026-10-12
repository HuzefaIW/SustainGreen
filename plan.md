# EcoPulse: Sustainable Tech Without Limits
> **KAUSHAL 8.0 Hackathon (PS-04)** | CSI Student Chapter, SVVV Indore  
> *Theme: Technologies Beyond Boundaries (Software Category)*

---

## 1. Executive Summary & Winning Hook
**Problem:** Colleges consume massive electricity, water, and food daily. In colleges like SVVV, 20–35% of energy is wasted through **ghost loads** (empty lecture halls and labs running lights/ACs), and 30%+ of mess food is thrown away due to inaccurate cooking predictions.  
**Solution (EcoPulse):** A lightweight, zero-hardware campus sustainability platform that combines:
1. **Interactive Campus Digital Twin:** Real-time visual heatmaps of campus blocks detecting ghost energy leaks.
2. **AI Vision Plate Waste Scanner:** Laptop/webcam food audit estimating waste mass, ₹ loss, and $CO_2e$ footprint.
3. **Behavioral Gamification & Green Credits:** Inter-department leaderboards driving real student action.
4. **Predictive Mess Engine:** Forecasting kitchen prep quantities based on schedule & attendance trends.

---

## 2. Team Division & Ownership (5 Members — Zero Merge Conflicts)

```
SustainGreen/
├── frontend/                     # Member 1 & 2 (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── campus-map/       # [Member 1] Digital Twin & Ghost Leak UI
│   │   │   ├── scanner/          # [Member 2] AI Plate Scanner Card
│   │   │   └── leaderboard/      # [Member 2] Green Credits & Dept Leaderboard
├── backend/                      # [Member 3] Express / FastAPI Server
│   ├── src/
│   │   ├── routes/               # REST API endpoints (Campus, Scanner, Leaderboard)
│   │   └── simulator/            # Real-time IoT Energy Telemetry Simulator
├── ai-service/                   # [Member 4] AI Vision & Carbon Footprint Service
│   └── app.py                    # Plate Waste Detection & CO2e formula
├── analytics-engine/             # [Member 5] Predictive Mess Engine & Pitch Master
│   └── simulation.py             # Food waste prediction algorithm & demo seed data
├── plan.md                       # Comprehensive Project Blueprint & API Contracts
└── README.md                     # Quickstart & Demo Guide
```

---

### Detailed Member Responsibilities

| Member | Focus Area | Directory | Key Deliverables |
|---|---|---|---|
| **Member 1** | **Digital Twin & Leak UI** | `frontend/src/components/campus-map/` | • Interactive SVG/Grid map of SVVV (Block A, B, CS Lab, Library, Mess).<br>• Room status cards with live watts & schedule correlation.<br>• One-click *"Resolve Ghost Leak"* action button. |
| **Member 2** | **Food Scanner & Leaderboard UI** | `frontend/src/components/scanner/`<br>`frontend/src/components/leaderboard/` | • Webcam capture or file drop for plate photos.<br>• Result badge: Leftover %, Waste Grams, $CO_2e$, ₹ loss.<br>• Department leaderboard (CS vs Mechanical vs Civil). |
| **Member 3** | **API Server & IoT Telemetry** | `backend/` | • Central Express or FastAPI backend on port 5000.<br>• Telemetry engine pushing fluctuating power data every 3 seconds.<br>• REST endpoints for room statuses, resolved leaks, and leaderboards. |
| **Member 4** | **AI Vision & Carbon Calculator** | `ai-service/` | • Python FastAPI / Flask on port 8000 (or Vision API integration).<br>• Accepts plate image, detects percentage food leftover.<br>• Converts leftover to grams, financial loss, and carbon footprint. |
| **Member 5** | **Mess Analytics & Demo Lead** | `analytics-engine/` + Root | • Mess meal requirement predictor (schedule vs cooking kg).<br>• Authentic SVVV data seeding (₹8/unit tariff, emissions factors).<br>• Pitch narration & 2-minute live demo orchestration for judges. |

---

## 3. Data Contracts & API Specifications

### A. Campus Telemetry (`GET /api/campus-status`)
```json
{
  "timestamp": "2026-10-12T10:30:00Z",
  "blocks": [
    {
      "id": "block-a-cs-lab-2",
      "name": "CS Lab 2 (Block A)",
      "isOccupied": false,
      "powerDrawWatts": 2400,
      "baselineWatts": 150,
      "hasGhostLeak": true,
      "leakType": "AC & 12 PCs Running While Empty",
      "wastedCostPerHour": 19.2
    },
    {
      "id": "block-b-lh-101",
      "name": "Lecture Hall 101",
      "isOccupied": true,
      "powerDrawWatts": 1200,
      "baselineWatts": 150,
      "hasGhostLeak": false,
      "leakType": null,
      "wastedCostPerHour": 0
    }
  ]
}
```

### B. Plate Scan Analysis (`POST /api/scan-plate`)
**Request:** `multipart/form-data` with image file  
**Response:**
```json
{
  "leftoverPercentage": 35,
  "estimatedFoodWastedGrams": 140,
  "co2eEmittedKg": 0.35,
  "financialLossInr": 28.0,
  "greenCreditsEarned": 15,
  "streakBonus": "Zero Waste Warrior +5"
}
```

### C. Department Leaderboard (`GET /api/leaderboard`)
```json
[
  { "rank": 1, "department": "Computer Science & Engg", "greenCredits": 4250, "kwhSaved": 340, "streakDays": 12 },
  { "rank": 2, "department": "Mechanical Engineering", "greenCredits": 3890, "kwhSaved": 295, "streakDays": 8 },
  { "rank": 3, "department": "Civil Engineering", "greenCredits": 3120, "kwhSaved": 210, "streakDays": 5 }
]
```

---

## 4. 6-Hour Hackathon Execution Timeline

| Hour | Goal | Checkpoint |
|---|---|---|
| **00:00 – 01:00** | Environment setup & independent folder scaffolding | All 5 team members have their respective directories and sample mocks running. |
| **01:00 – 03:30** | Pure independent coding | • Member 1 finishes Campus Map.<br>• Member 2 finishes Scanner & Leaderboard cards.<br>• Member 3 finishes backend endpoints.<br>• Member 4 finishes AI image analysis endpoint.<br>• Member 5 completes mess analytics & sample datasets. |
| **03:30 – 04:30** | Frontend-to-Backend Integration | Wire API calls from Frontend to Backend & AI endpoints. |
| **04:30 – 05:30** | Polish & Edge Case Handling | Add smooth animations, alert notifications on leak detection, clean responsive view. |
| **05:30 – 06:00** | Live Demo Dry Run (No PPT!) | 2-minute verbal pitch drill: Demo Map -> Trigger Leak -> Resolve -> Scan Plate -> Leaderboard. |

---

## 5. Judge Evaluation Alignment (Why This Wins)
1. **Real Problem:** Solves real campus wastage without unrealistic hardware demands.
2. **Working Core:** Live simulator streams real-time fluctuating data; vision API actually detects food plates.
3. **Action-Driven:** Bridges passive analytics with active student gamification and kitchen prep optimization.
4. **Verbal Pitch Impact:** Visual heatmaps + Webcam plate scan create an instant, memorable "WOW" factor in under 2 minutes.
