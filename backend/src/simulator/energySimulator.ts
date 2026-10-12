/**
 * Deep Tech NILM (Non-Intrusive Load Monitoring) & Campus IoT Energy Telemetry Simulator
 * Simulates high-frequency smart-meter streams, Bayesian virtual occupancy, and ghost leak detection.
 */

export interface ApplianceLoad {
  id: string;
  name: string;
  type: 'HVAC' | 'COMPUTING' | 'LIGHTING' | 'MULTIMEDIA';
  ratedWatts: number;
  reactiveVar: number;
  status: 'ACTIVE' | 'IDLE' | 'CUT_OFF';
}

export interface CampusBlock {
  id: string;
  code: string;
  name: string;
  department: string;
  category: 'LAB' | 'CLASSROOM' | 'LIBRARY' | 'MESS';
  capacity: number;
  
  // Virtual Occupancy (Zero-Hardware Sensor Fusion)
  wiFiClientCount: number;
  scheduledClass: string | null;
  isOccupied: boolean;
  occupancyConfidence: number; // 0.0 to 1.0 (Bayesian filter)

  // NILM High-Frequency Telemetry
  voltageRms: number;
  activePowerWatts: number;
  reactivePowerVar: number;
  powerFactor: number;
  baselineIdleWatts: number;
  
  // Ghost Leak Anomaly Detection
  hasGhostLeak: boolean;
  ghostLeakSeverity: number; // 0.0 to 1.0
  leakDescription: string | null;
  wastedCostPerHourInr: number;
  wastedCo2KgPerHour: number;
  
  // Appliance-Level Disaggregation
  appliances: ApplianceLoad[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  blockId: string;
  blockName: string;
  action: string;
  resolvedBy: string;
  department: string;
  kwhPrevented: number;
  costSavedInr: number;
  creditsAwarded: number;
}

export interface HourlyEnergyPoint {
  hour: string;
  actualKwh: number;
  baselineKwh: number;
  ghostWasteKwh: number;
}

export class CampusEnergySimulator {
  private blocks: CampusBlock[] = [
    {
      id: 'svvv-blk-a-cs-lab-2',
      code: 'CS-LAB-02',
      name: 'Advanced Computing Lab 2 (Block A)',
      department: 'Computer Science & Engg',
      category: 'LAB',
      capacity: 45,
      wiFiClientCount: 0,
      scheduledClass: null,
      isOccupied: false,
      occupancyConfidence: 0.96,
      voltageRms: 231.4,
      activePowerWatts: 2680,
      reactivePowerVar: 840,
      powerFactor: 0.95,
      baselineIdleWatts: 140,
      hasGhostLeak: true,
      ghostLeakSeverity: 0.88,
      leakDescription: '18 Core-i7 Workstations & 2.0-Ton Cassette AC active with 0 students detected',
      wastedCostPerHourInr: 21.44, // ₹8.5 / kWh * 2.54 kW
      wastedCo2KgPerHour: 2.08,    // 0.82 kg CO2 / kWh
      appliances: [
        { id: 'app-ac-1', name: 'Voltas 2.0T Split AC', type: 'HVAC', ratedWatts: 1850, reactiveVar: 620, status: 'ACTIVE' },
        { id: 'app-pc-bank', name: 'Workstations Cluster (18 PCs)', type: 'COMPUTING', ratedWatts: 690, reactiveVar: 180, status: 'ACTIVE' },
        { id: 'app-lights', name: 'Ceiling LED Fixtures (8x)', type: 'LIGHTING', ratedWatts: 140, reactiveVar: 40, status: 'ACTIVE' }
      ]
    },
    {
      id: 'svvv-blk-b-lh-101',
      code: 'LH-101',
      name: 'Auditorium Lecture Hall 101 (Block B)',
      department: 'Computer Science & Engg',
      category: 'CLASSROOM',
      capacity: 80,
      wiFiClientCount: 68,
      scheduledClass: 'CS-402: Cloud Computing & Distributed Systems',
      isOccupied: true,
      occupancyConfidence: 0.98,
      voltageRms: 229.8,
      activePowerWatts: 1350,
      reactivePowerVar: 310,
      powerFactor: 0.97,
      baselineIdleWatts: 120,
      hasGhostLeak: false,
      ghostLeakSeverity: 0.0,
      leakDescription: null,
      wastedCostPerHourInr: 0,
      wastedCo2KgPerHour: 0,
      appliances: [
        { id: 'app-proj-1', name: 'Epson High-Lumen Projector', type: 'MULTIMEDIA', ratedWatts: 320, reactiveVar: 50, status: 'ACTIVE' },
        { id: 'app-fan-lights', name: 'Fans & Ambient Tube Fixtures', type: 'LIGHTING', ratedWatts: 580, reactiveVar: 110, status: 'ACTIVE' },
        { id: 'app-podium', name: 'Smart Podium & Mic System', type: 'COMPUTING', ratedWatts: 450, reactiveVar: 150, status: 'ACTIVE' }
      ]
    },
    {
      id: 'svvv-blk-mech-cad',
      code: 'ME-CAD-01',
      name: 'Mechanical CAD/CAM Simulation Suite',
      department: 'Mechanical Engineering',
      category: 'LAB',
      capacity: 35,
      wiFiClientCount: 1, // Single stray device / cleaner
      scheduledClass: null,
      isOccupied: false,
      occupancyConfidence: 0.91,
      voltageRms: 232.1,
      activePowerWatts: 1980,
      reactivePowerVar: 520,
      powerFactor: 0.96,
      baselineIdleWatts: 180,
      hasGhostLeak: true,
      ghostLeakSeverity: 0.74,
      leakDescription: 'Heavy GPU Workstations left rendering overnight without timetable slot',
      wastedCostPerHourInr: 15.3,
      wastedCo2KgPerHour: 1.48,
      appliances: [
        { id: 'app-mech-workstations', name: 'NVIDIA RTX Workstations (8x)', type: 'COMPUTING', ratedWatts: 1420, reactiveVar: 380, status: 'ACTIVE' },
        { id: 'app-mech-exhaust', name: 'Thermal Exhaust Blowers', type: 'HVAC', ratedWatts: 380, reactiveVar: 110, status: 'ACTIVE' },
        { id: 'app-mech-lights', name: 'High-Bay Lighting', type: 'LIGHTING', ratedWatts: 180, reactiveVar: 30, status: 'ACTIVE' }
      ]
    },
    {
      id: 'svvv-blk-c-library',
      code: 'LIB-CENTRAL',
      name: 'Central University Library (Silent Reading Hall)',
      department: 'Central Campus Facilities',
      category: 'LIBRARY',
      capacity: 150,
      wiFiClientCount: 94,
      scheduledClass: 'Open Reading Hours (08:00 - 20:00)',
      isOccupied: true,
      occupancyConfidence: 0.99,
      voltageRms: 230.5,
      activePowerWatts: 3450,
      reactivePowerVar: 910,
      powerFactor: 0.96,
      baselineIdleWatts: 420,
      hasGhostLeak: false,
      ghostLeakSeverity: 0.0,
      leakDescription: null,
      wastedCostPerHourInr: 0,
      wastedCo2KgPerHour: 0,
      appliances: [
        { id: 'app-lib-ac-central', name: 'Central Chiller Duct Unit', type: 'HVAC', ratedWatts: 2400, reactiveVar: 680, status: 'ACTIVE' },
        { id: 'app-lib-lights', name: 'Stack Illumination & Desk Lamps', type: 'LIGHTING', ratedWatts: 630, reactiveVar: 130, status: 'ACTIVE' },
        { id: 'app-lib-kiosk', name: 'RFID Book Return Terminals', type: 'COMPUTING', ratedWatts: 420, reactiveVar: 100, status: 'ACTIVE' }
      ]
    },
    {
      id: 'svvv-blk-mess-hall',
      code: 'MESS-HOSTEL-1',
      name: 'Hostel Dining Hall & Central Kitchen',
      department: 'Hostel Administration',
      category: 'MESS',
      capacity: 300,
      wiFiClientCount: 38,
      scheduledClass: 'Lunch Prep Cycle',
      isOccupied: true,
      occupancyConfidence: 0.88,
      voltageRms: 228.9,
      activePowerWatts: 4120,
      reactivePowerVar: 1150,
      powerFactor: 0.96,
      baselineIdleWatts: 500,
      hasGhostLeak: false,
      ghostLeakSeverity: 0.0,
      leakDescription: null,
      wastedCostPerHourInr: 0,
      wastedCo2KgPerHour: 0,
      appliances: [
        { id: 'app-mess-coldstorage', name: 'Walk-in Cold Storage Compressor', type: 'HVAC', ratedWatts: 2200, reactiveVar: 640, status: 'ACTIVE' },
        { id: 'app-mess-exhaust', name: 'Commercial Chimney Hood Blowers', type: 'HVAC', ratedWatts: 1420, reactiveVar: 410, status: 'ACTIVE' },
        { id: 'app-mess-prep', name: 'Commercial Grain Grinders & Mixers', type: 'COMPUTING', ratedWatts: 500, reactiveVar: 100, status: 'IDLE' }
      ]
    }
  ];

  private auditLogs: AuditLogEntry[] = [
    {
      id: 'log-001',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      blockId: 'svvv-blk-b-lh-101',
      blockName: 'Auditorium Lecture Hall 101',
      action: 'Automated relay cut-off: 4 Projectors & Fan bank idle post-lecture',
      resolvedBy: 'Smart NILM Guard (Auto)',
      department: 'Computer Science & Engg',
      kwhPrevented: 3.8,
      costSavedInr: 32.3,
      creditsAwarded: 40
    },
    {
      id: 'log-002',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      blockId: 'svvv-blk-mech-cad',
      blockName: 'Mechanical CAD/CAM Suite',
      action: 'Manual override via Student App: Turned off idle render bank',
      resolvedBy: 'Aman Verma (ME 3rd Yr)',
      department: 'Mechanical Engineering',
      kwhPrevented: 6.2,
      costSavedInr: 52.7,
      creditsAwarded: 50
    }
  ];

  public getStatus(): CampusBlock[] {
    // Add realistic physics jitter (+/- 15W active power, +/- 0.4V)
    return this.blocks.map((b) => {
      const jitterWatts = Math.round((Math.random() * 30 - 15));
      const jitterVoltage = Number((Math.random() * 0.8 - 0.4).toFixed(1));
      return {
        ...b,
        voltageRms: Number((b.voltageRms + jitterVoltage).toFixed(1)),
        activePowerWatts: Math.max(b.baselineIdleWatts, b.activePowerWatts + jitterWatts),
      };
    });
  }

  public resolveLeak(blockId: string, resolvedBy: string = 'Campus EcoPulse User'): { success: boolean; log?: AuditLogEntry } {
    const block = this.blocks.find((b) => b.id === blockId);
    if (!block || !block.hasGhostLeak) {
      return { success: false };
    }

    const preventedKw = (block.activePowerWatts - block.baselineIdleWatts) / 1000.0;
    const costSaved = Number((preventedKw * 8.5).toFixed(2));

    // Reset block power to nominal baseline
    block.hasGhostLeak = false;
    block.ghostLeakSeverity = 0;
    block.activePowerWatts = block.baselineIdleWatts;
    block.leakDescription = null;
    block.wastedCostPerHourInr = 0;
    block.wastedCo2KgPerHour = 0;
    
    // Shut off non-essential appliances
    block.appliances.forEach((app) => {
      if (app.type !== 'LIGHTING') {
        app.status = 'CUT_OFF';
      }
    });

    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      blockId: block.id,
      blockName: block.name,
      action: `Remote load cut-off applied. All idle loads isolated.`,
      resolvedBy,
      department: block.department,
      kwhPrevented: Number(preventedKw.toFixed(2)),
      costSavedInr: costSaved,
      creditsAwarded: 50
    };

    this.auditLogs.unshift(newLog);
    return { success: true, log: newLog };
  }

  public triggerDemoLeak(blockId: string): boolean {
    const block = this.blocks.find((b) => b.id === blockId);
    if (!block) return false;
    block.hasGhostLeak = true;
    block.ghostLeakSeverity = 0.85;
    block.activePowerWatts = block.baselineIdleWatts + 2200;
    block.leakDescription = 'High-draw Split AC & 15 PCs powered with zero room occupancy';
    block.wastedCostPerHourInr = 18.7;
    block.wastedCo2KgPerHour = 1.8;
    block.appliances.forEach((a) => (a.status = 'ACTIVE'));
    return true;
  }

  public getAuditLogs(): AuditLogEntry[] {
    return this.auditLogs;
  }

  public get24HourTelemetry(): HourlyEnergyPoint[] {
    const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    return hours.map((h, i) => {
      const isNight = i < 3 || i > 9;
      const actualKwh = isNight ? 28 + Math.round(Math.random() * 8) : 95 + Math.round(Math.random() * 25);
      const baselineKwh = isNight ? 12 : 70;
      const ghostWasteKwh = Math.max(0, actualKwh - (baselineKwh + (isNight ? 5 : 15)));
      return {
        hour: h,
        actualKwh,
        baselineKwh,
        ghostWasteKwh
      };
    });
  }
}
