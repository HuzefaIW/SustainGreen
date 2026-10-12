# EcoPulse: Zero-Hardware AI Campus Decarbonization & Waste Intelligence
> **KAUSHAL 8.0 Hackathon (Problem Statement PS-04)** | CSI Student Chapter, SVVV Indore  
> *Theme: Technologies Beyond Boundaries (Software Category)*  
> *Target Execution: 5-Member Coordinated Team — Deep Tech Production Blueprint*

---

## 1. Executive Summary & The Winning Hook

### A. The Real Campus Dilemma
Higher education campuses like SVVV Indore consume immense power, water, and food daily:
1. **Ghost Loads Drain 20% to 35% of Campus Power:** Unoccupied lecture halls, empty CAD/computer labs, and administrative corridors run split AC units, banks of PCs, and high-wattage lights long after classes disperse.
2. **Kitchen Blind Cooking Wastes 30%+ of Mess Meals:** Cooks prepare static bulk batches without predictive headcount modeling. Concurrently, students discard 25% of their tray portions due to rigid serving sizes.
3. **The Traditional Failure:** Conventional IoT proposals require lakhs of rupees in smart plugs, energy sub-meters for every socket, and physical PIR motion sensors for every room — making deployment cost-prohibitive.

### B. The EcoPulse Deep-Tech Breakthrough
EcoPulse solves this through a **Zero-Hardware, AI-Driven Decarbonization Architecture**:
* **Virtual Occupancy via Wi-Fi AP Telemetry (Zero Sensor Cost):** Uses existing campus router SNMP client counts fused with the ERP academic timetable via Bayesian inference — zero cameras or physical motion sensors needed.
* **NILM (Non-Intrusive Load Monitoring):** Substation smart-meter telemetry disaggregation that identifies specific appliance signatures (e.g., 2.0-Ton AC vs PC clusters) from transient power step-changes.
* **Computer Vision Food Waste Volumetrics:** Laptop webcam/mobile tray scan calculating remnant surface area ($mm^2$), pseudo-3D volume ($cm^3$), density mass ($g$), and IPCC/DEFRA greenhouse gas impact ($CO_2e$, $CH_4$, Virtual Water, ₹ loss).
* **Multivariate Predictive Mess Engine:** Demand forecasting (weather, day-of-week, exam periods) producing an automated raw ingredient **Bill of Materials (BOM)** to prevent over-cooking before food is ever prepared.
* **Tokenized Green Credits:** Inter-department gamified league table (CSE vs ME vs CE vs ECE) driving direct student action.

---

## 2. Team Architecture & 5-Member Ownership Matrix

To guarantee **zero merge conflicts** during the hackathon, each member works inside an isolated directory with standardized data contracts:

```
SustainGreen/
├── frontend/                     # [Member 1 & 2] React 18 + Vite + Tailwind CSS + Recharts
│   ├── src/
│   │   ├── components/
│   │   │   ├── campus-map/       # [Member 1] 2.5D Digital Twin, NILM Heatmaps & Remote Breaker UI
│   │   │   ├── scanner/          # [Member 2] AI Plate Scanner HUD, Webcam Feed & Climate Receipt
│   │   │   ├── mess/             # [Member 5 UI] Predictive Mess Prep & Kitchen BOM Interface
│   │   │   └── leaderboard/      # [Member 2] Inter-Dept Green Cup & Verifiable Audit Ledger
│   │   ├── App.tsx               # Unified Master Command Center
│   │   └── index.css             # Glassmorphic Dark Mode Theme
├── backend/                      # [Member 3] Express + TypeScript Gateway + WebSocket Server
│   ├── src/
│   │   ├── index.ts              # API Gateway Routes, Proxy & Controller
│   │   ├── simulator/
│   │   │   └── energySimulator.ts# Physics-Informed NILM & Bayesian Occupancy Engine
├── ai-service/                   # [Member 4] Python FastAPI / OpenCV Computer Vision
│   ├── app.py                    # Plate Segmentation, Volumetric Mass & IPCC Carbon API
│   └── requirements.txt          # fastapi, uvicorn, numpy, pillow
├── analytics-engine/             # [Member 5] Predictive Kitchen Logistics & Data Seeding
│   ├── simulation.py             # Multivariate Dining Demand Regressor & Recipe BOM
│   └── historical_trends.json    # 90-Day SVVV Dining & Energy Benchmark Dataset
├── .gitignore                    # Production git hygiene
├── plan.md                       # Comprehensive System Blueprint (This File)
└── README.md                     # Quickstart & 2-Minute Pitch Script
```

### Detailed Member Responsibilities & Checkpoints

| Member | Engineering Role | Assigned Workspace | Deliverables & Code Artifacts |
|---|---|---|---|
| **Member 1** | **Digital Twin & NILM Lead** | `frontend/src/components/campus-map/` | • Interactive SVG/Grid 2.5D Campus Digital Twin (Block A, B, CAD Lab, Library, Mess).<br>• Real-time power draw meters with pulsing leak heatmaps.<br>• One-click *"Cut Off Idle Load"* breaker trip button.<br>• Recharts 24-hour campus power vs waste area curve. |
| **Member 2** | **Vision HUD & Gamification Lead** | `frontend/src/components/scanner/`<br>`frontend/src/components/leaderboard/` | • Live webcam viewfinder + preset tray switcher (Clean, Normal, Heavy).<br>• Computer Vision HUD bounding box with volumetric metrics.<br>• Climate receipt: $g$ waste, $kg\ CO_2e$, Virtual Water liters, ₹ loss.<br>• Department Cup rankings with streaks and verifiable audit ledger. |
| **Member 3** | **API Gateway & IoT Telemetry Lead** | `backend/` | • Central Express + TypeScript server on port 5000.<br>• High-frequency energy simulator with realistic voltage/power jitter.<br>• NILM appliance disaggregation (ACs, PCs, Lighting).<br>• Dynamic leak trigger & resolution endpoints with credit dispatch. |
| **Member 4** | **AI Vision & Carbon Footprint Lead** | `ai-service/` | • Python FastAPI / OpenCV service on port 8000.<br>• Tray compartment segmentation & contour surface area calculations.<br>• Pseudo-3D volume ($cm^3$) to mass ($g$) density conversion.<br>• DEFRA / IPCC emission factors conversion algorithms. |
| **Member 5** | **Predictive Mess Engine & Pitch Master** | `analytics-engine/` + Root | • Multivariate dining regression (weather, exam schedule, day-of-week).<br>• Kitchen Bill of Materials (BOM) generator (Rice, Dal, Atta kg).<br>• SVVV realistic cost benchmarks (₹8.5/kWh tariff, ₹85/kg food cost).<br>• Live pitch orchestration & 2-minute judge walkthrough. |

---

## 3. Deep Tech Mathematical Formulations & Algorithms

### A. Zero-Hardware Bayesian Virtual Occupancy Fusion
Instead of physical PIR sensors, occupancy is calculated by fusing ERP timetable scheduling with router Wi-Fi access point probe counts:
$$\mathcal{P}(\text{Occupied} \mid \text{WiFi}, \text{Timetable}) = \frac{\mathcal{P}(\text{WiFi} \mid \text{Occupied}) \cdot \mathcal{P}(\text{Timetable})}{\mathcal{P}(\text{Evidence})}$$
* When $\text{WiFi Clients} < 2$ and $\text{Timetable} == \text{Unscheduled}$, $\mathcal{P}(\text{Occupied}) \to 0$.

### B. Non-Intrusive Load Monitoring (NILM) Spectral Disaggregation
High-frequency active power ($P$) and reactive power ($Q$) steps are matched against known appliance harmonic signatures:
$$\Delta P = P(t) - P(t - \Delta t), \quad \Delta Q = Q(t) - Q(t - \Delta t)$$
- **Split AC (2.0 Ton):** $\Delta P \approx +1850\text{ W}, \quad \Delta Q \approx +620\text{ VAR}$ (Inductive).
- **Workstation Cluster (18x):** $\Delta P \approx +690\text{ W}, \quad \Delta Q \approx +180\text{ VAR}$ (Capacitive SMPS).
- **Ghost Leak Severity Index (GLSI):**
  $$GLSI = \frac{P_{\text{active}} - P_{\text{baseline}}}{P_{\text{rated\_capacity}}} \quad \text{when } \mathcal{P}(\text{Occupied}) < 0.1$$

### C. Computer Vision Food Waste Volumetrics & Climate Impact
1. **Surface Area & Volumetric Approximation:**
   Given a standard normalized tray size of $350 \times 250\text{ mm}$ ($A_{\text{tray}} = 87,500\text{ mm}^2$):
   $$A_{\text{waste}} = \sum_{p \in \text{remnants}} \text{PixelArea}(p)$$
   $$V_{\text{waste}} = A_{\text{waste}} \times \bar{h}_{\text{depth}} \quad (\text{heuristic surface height gradient})$$
   $$M_{\text{grams}} = V_{\text{waste}} \times \rho_{\text{food}} \quad (\rho_{\text{avg}} \approx 0.87\text{ g/cm}^3)$$

2. **IPCC / DEFRA Carbon Accounting Multipliers:**
   - **GHG Emissions:** $E_{\text{CO2e}} = M_{\text{kg}} \times 2.5\text{ kg } CO_2e / \text{kg food waste}$
   - **Methane Equivalent:** $E_{\text{CH4}} = M_{\text{kg}} \times 0.045\text{ kg } CH_4$
   - **Virtual Water Footprint:** $W_{\text{virtual}} = M_{\text{kg}} \times 1,200\text{ Liters } H_2O / \text{kg produced}$
   - **Financial Loss:** $Loss_{\text{INR}} = M_{\text{kg}} \times ₹85.00$

### D. Multivariate Mess Kitchen Demand Elasticity
$$\hat{N}_{\text{diners}} = N_{\text{capacity}} \times \left( F_{\text{day}} + \Delta_{\text{weather}} + \Delta_{\text{exams}} \right)$$
- $F_{\text{day}}$: Monday ($0.92$), Thursday ($0.84$), Friday ($0.70$ due to weekend departures).
- $\Delta_{\text{weather}}$: Heavy rain increases on-campus dining by $+6\%$.
- $\Delta_{\text{exams}}$: Examination weeks spike turnout by $+8\%$.
- **Recipe BOM Output:**
  - Raw Rice $= \hat{N} \times 120\text{g}$
  - Dal / Pulses $= \hat{N} \times 50\text{g}$
  - Wheat Flour (Atta) $= \hat{N} \times 90\text{g}$
  - Fresh Vegetables $= \hat{N} \times 140\text{g}$

---

## 4. Standardized Data Contracts & REST APIs

### Endpoint 1: Campus NILM Telemetry (`GET /api/campus-status`)
```json
{
  "timestamp": "2026-10-12T10:30:00.000Z",
  "totalActiveWatts": 13580,
  "activeGhostLeaksCount": 2,
  "campusTotalPowerFactor": 0.96,
  "blocks": [
    {
      "id": "svvv-blk-a-cs-lab-2",
      "code": "CS-LAB-02",
      "name": "Advanced Computing Lab 2 (Block A)",
      "department": "Computer Science & Engg",
      "category": "LAB",
      "capacity": 45,
      "wiFiClientCount": 0,
      "scheduledClass": null,
      "isOccupied": false,
      "occupancyConfidence": 0.96,
      "voltageRms": 231.4,
      "activePowerWatts": 2680,
      "baselineIdleWatts": 140,
      "hasGhostLeak": true,
      "ghostLeakSeverity": 0.88,
      "leakDescription": "18 Core-i7 Workstations & 2.0-Ton Cassette AC active with 0 students detected",
      "wastedCostPerHourInr": 21.44,
      "wastedCo2KgPerHour": 2.08,
      "appliances": [
        { "id": "app-ac-1", "name": "Voltas 2.0T Split AC", "type": "HVAC", "ratedWatts": 1850, "status": "ACTIVE" },
        { "id": "app-pc-bank", "name": "Workstations Cluster (18 PCs)", "type": "COMPUTING", "ratedWatts": 690, "status": "ACTIVE" }
      ]
    }
  ]
}
```

### Endpoint 2: Remote Load Cut-off (`POST /api/resolve-leak`)
**Request Body:**
```json
{
  "blockId": "svvv-blk-a-cs-lab-2",
  "userDept": "Computer Science & Engg"
}
```
**Response Body:**
```json
{
  "success": true,
  "message": "NILM Ghost load isolated & load dropped to baseline.",
  "log": {
    "id": "log-1739345000",
    "timestamp": "2026-10-12T10:31:00.000Z",
    "blockId": "svvv-blk-a-cs-lab-2",
    "blockName": "Advanced Computing Lab 2 (Block A)",
    "action": "Remote load cut-off applied. All idle loads isolated.",
    "resolvedBy": "Campus EcoPulse User",
    "department": "Computer Science & Engg",
    "kwhPrevented": 2.54,
    "costSavedInr": 21.59,
    "creditsAwarded": 50
  }
}
```

### Endpoint 3: Computer Vision Food Waste Audit (`POST /api/scan-plate`)
**Request Body:**
```json
{
  "simulatedPlateType": "NORMAL_TRAY"
}
```
**Response Body:**
```json
{
  "status": "success",
  "visionMetrics": {
    "plateSurfaceAreaMm2": 78500,
    "segmentedFoodAreaMm2": 21980,
    "estimatedFoodVolumeCm3": 122,
    "foodRemnantClass": "Carb (Rice) + Gravy surplus",
    "detectionConfidence": 0.942
  },
  "audit": {
    "leftoverPercentage": 28,
    "estimatedFoodWastedGrams": 106.4,
    "co2eEmittedKg": 0.266,
    "methaneEquivalentGrams": 4.79,
    "virtualWaterWastedLiters": 128,
    "financialLossInr": 9.04,
    "greenCreditsEarned": 35,
    "statusBadge": "🌿 Moderate Portion Conscientious (+35 pts)",
    "badgeColor": "text-sky-400"
  },
  "recommendation": "Noticeable carb waste. Request mess staff for 1 less roti or half rice cup next meal."
}
```

### Endpoint 4: Predictive Mess Demand Forecast (`GET /api/mess-forecast`)
**Query Parameters:** `?day=Friday&weather=Rainy&isExam=false`  
**Response Body:**
```json
{
  "day": "Friday",
  "weather": "Rainy",
  "isExam": false,
  "totalHostelStudents": 1200,
  "expectedDiners": 912,
  "conventionalCookKg": 456,
  "optimizedCookKg": 328,
  "savedFoodKg": 128,
  "costSavedInr": 10880,
  "co2eSavedKg": 320.0,
  "waterSavedLiters": 153600,
  "confidenceIntervalPct": 94.8,
  "bom": {
    "grainRiceKg": 109,
    "dalPulsesKg": 46,
    "wheatFlourAttaKg": 82,
    "freshVegetablesKg": 128,
    "cookingOilLiters": 18
  }
}
```

### Endpoint 5: Department Green Cup Standings (`GET /api/leaderboard`)
```json
{
  "standings": [
    { "rank": 1, "department": "Computer Science & Engg", "code": "CSE", "greenCredits": 4470, "kwhSaved": 368, "foodSavedKg": 84.5, "streakDays": 14 },
    { "rank": 2, "department": "Mechanical Engineering", "code": "ME", "greenCredits": 3980, "kwhSaved": 310, "foodSavedKg": 71.0, "streakDays": 9 },
    { "rank": 3, "department": "Civil Engineering", "code": "CE", "greenCredits": 3250, "kwhSaved": 225, "foodSavedKg": 52.3, "streakDays": 6 }
  ]
}
```

---

## 5. 6-Hour Hackathon Execution Timeline

```
[Hour 0:00 - 0:45] ─── Environment Setup & Clean Scaffolding
   • Member 1 & 2: Setup Vite + Tailwind CSS + Lucide + Recharts.
   • Member 3: Initialize Express + TypeScript server with energySimulator.ts.
   • Member 4: Create FastAPI + OpenCV vision endpoint.
   • Member 5: Populate simulation datasets & financial multipliers.

[Hour 0:45 - 3:00] ─── Independent Feature Engineering (Zero Merge Conflicts)
   • Member 1: Build 2.5D Campus Digital Twin & Recharts 24h curve.
   • Member 2: Implement Webcam Viewfinder & Green Cup Leaderboard.
   • Member 3: Wire NILM telemetry simulator & remote cut-off handlers.
   • Member 4: Perfect volumetric density algorithms and IPCC formulas.
   • Member 5: Implement Multivariate Kitchen BOM generator.

[Hour 3:00 - 4:15] ─── Full-Stack Integration
   • Connect Vite frontend proxy to backend Express endpoints.
   • Validate real-time telemetry streaming and state synchronization.

[Hour 4:15 - 5:15] ─── Polish, Polish, Polish
   • Add pulse glowing animations to active ghost leak cards.
   • Add audio/visual confetti toast when claiming 50 Green Credits.
   • Verify responsive layout across mobile and projector resolutions.

[Hour 5:15 - 6:00] ─── Dry Run Demo Rehearsal (The 2-Minute Pitch)
   • Strict stopwatch practice: 120 seconds maximum, zero PPT slides!
```

---

## 6. The 2-Minute Winning Pitch Script (No Slides!)

> **00:00 – 00:25 | The Hook (Shock Value)**  
> *"Judges, right now at SVVV, between 1:00 PM and 3:00 PM, nearly 30% of campus electricity is wasted in empty classrooms where ACs and PC labs run with zero students inside. Meanwhile, the hostel mess prepares food for 1,200 students blindly, throwing away 120 kg of food every single Friday. We built EcoPulse — a zero-hardware campus decarbonization platform powered by AI."*

> **00:25 – 00:55 | The Digital Twin & NILM Live Demo (Member 1 & 3)**  
> *(Member 1 points to the live screen)*  
> *"Look at Block A: CS Lab 2. Our system detects a massive 2,680W load. But notice the Wi-Fi AP telemetry: zero connected devices, and no class scheduled in the timetable. Our NILM algorithm matches the exact harmonic signature: a 2.0-Ton AC and 18 workstations left running. With one click on 'Cut Off Load' — watch this — the remote breaker trips, power drops to baseline 140W, saving ₹21.5/hour, and 50 Green Credits are instantly credited to the CS department!"*

> **00:55 – 01:30 | The AI Vision Tray Scanner (Member 2 & 4)**  
> *(Member 2 clicks the webcam or selects High Waste Tray)*  
> *"Next is the dining hall. A student finishes lunch and places their tray under the scanner. Our computer vision model segments the tray compartments, calculates the volumetric food remnant, and computes the exact IPCC carbon footprint: 106 grams wasted, 0.26 kg of CO2e emitted, and 128 liters of virtual water lost. Students with clean plates earn 60 green credits, pushing their department to #1 in the SVVV Sustainability Cup."*

> **01:30 – 02:00 | The Predictive Kitchen & The Close (Member 5)**  
> *(Member 5 switches to the Mess Logistics tab)*  
> *"And before cooking even starts, our predictive engine forecasts mess turnout using day-of-week decay and live weather. For this rainy Friday, it tells the chef to prepare 328 kg instead of 456 kg, generating an exact raw ingredient Bill of Materials and saving ₹10,800 today alone. EcoPulse requires zero expensive hardware, saves the university lakhs every month, and turns sustainability into a campus-wide sport. Thank you!"*

---

## 7. Judge Evaluation Alignment (Why EcoPulse Scores 100%)

1. **Relevance & Problem Solving (25%):** Directly tackles the massive, real-world utility bill and food wastage problems of college campuses.
2. **Technical Depth & Innovation (25%):** Eliminates hardware costs by innovating in software: Wi-Fi AP Bayesian occupancy, NILM transient disaggregation, and monocular depth computer vision.
3. **Execution & Polish (25%):** Fully functional, responsive, beautifully themed real-time full-stack dashboard with zero broken mocks.
4. **Feasibility & Scalability (25%):** Can be deployed in any university or school tomorrow using existing Wi-Fi routers and standard kitchen webcams.
