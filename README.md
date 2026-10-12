# 🌱 EcoPulse — Zero-Hardware Campus Decarbonization System
> **KAUSHAL 8.0 Hackathon (Problem Statement PS-04)** | CSI Student Chapter, SVVV Indore  
> *Theme: Technologies Beyond Boundaries (Software Category)*

EcoPulse is an AI-driven, zero-additional-hardware campus energy and food waste intelligence platform designed for colleges and universities.

---

## 🚀 Key Features (Deep-Tech Core)

1. **2.5D Campus Digital Twin & NILM:**
   - Detects unoccupied lecture halls running ACs and computer workstations using **Non-Intrusive Load Monitoring (NILM)** and **Bayesian Wi-Fi Access Point sensor fusion**.
   - One-click remote breaker cut-off to eliminate ghost loads.

2. **AI Computer Vision Plate Waste Scanner:**
   - Live camera viewfinder & volumetric estimation measuring food remnant surface area ($mm^2$), volume ($cm^3$), and density mass ($g$).
   - Calculates **IPCC AR6 / DEFRA** climate metrics: $CO_2e$ emissions, methane equivalent ($CH_4$), virtual water footprint, and financial loss in ₹.

3. **Multivariate Predictive Mess Engine:**
   - Calibrates kitchen cooking volumes based on day-of-week decay curves, precipitation weather signals, and exam calendar spikes.
   - Generates automated raw ingredient **Bill of Materials (BOM)** (Rice, Dal, Atta kg) to prevent kitchen over-cooking.

4. **Department Sustainability Cup & Verifiable Audit Ledger:**
   - Gamified inter-department leaderboard (CSE vs ME vs CE vs ECE) rewarding student energy saves and zero-waste dining with tokenized Green Credits.

---

## 🛠️ Quickstart (Running Locally)

### 1. Start the Backend Gateway (Port 5000)
```bash
cd backend
npm install
npm run dev
```

### 2. Start the Frontend Dashboard (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

Visit **http://localhost:5173** to view the live dashboard.

### 3. Optional: Run the Python AI / Analytics Engine
```bash
# Python Mess Simulation
python analytics-engine/simulation.py

# Python FastAPI Vision Service
cd ai-service
pip install -r requirements.txt
python app.py
```

---

## 👥 5-Member Team Division

Detailed responsibilities, API schemas, mathematical formulas, and the 2-minute pitch script are documented in **[plan.md](./plan.md)**.