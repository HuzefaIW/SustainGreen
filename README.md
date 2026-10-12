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

### 3. Seeded SVVV Dev Accounts
For fast development/demo auth, the backend exposes seeded `@svvv.in` accounts:

| Role | Email | Password | Scope |
|---|---|---|---|
| Super Admin | `super.admin@svvv.in` | `Super@123` | Full campus, blocks, mess, leaderboard, accounts |
| Block Admin | `main.block.admin@svvv.in` | `MainBlock@123` | Main Block rooms/labs |
| Block Admin | `mech.block.admin@svvv.in` | `MechBlock@123` | Mechanical Engineering Block |
| Block Admin | `mba.block.admin@svvv.in` | `MbaBlock@123` | MBA Block |
| Canteen Admin | `canteen.admin@svvv.in` | `Canteen@123` | Central Hostel Mess |

Login returns a signed bearer token, and protected endpoints require `Authorization: Bearer <token>`.
```bash
curl -X POST http://localhost:5000/api/auth/dev-login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"super.admin@svvv.in\",\"password\":\"Super@123\"}"

curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"

curl http://localhost:5000/api/dev-accounts \
  -H "Authorization: Bearer <super-admin-token>"
```

The known credentials are local-development seeds only. They are hashed in code, sanitized from API responses, and disabled when `NODE_ENV=production` or `DISABLE_DEV_AUTH=true`.

urBackend MCP/docs note: the public docs describe `x-api-key` auth, publishable/secret keys, built-in auth/JWT, and REST CRUD. These local seeds keep hackathon development moving; swap the backing store to urBackend once the project keys and final auth API paths are available.

### 4. Optional: Run the Python AI / Analytics Engine
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
