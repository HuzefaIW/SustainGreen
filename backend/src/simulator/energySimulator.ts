/**
 * EcoPulse Campus Energy Telemetry Simulator
 * Single source of truth for building states, NILM telemetry, leak simulations, and calculations.
 * 
 * Configured campus blocks:
 * 1. Main Block (Engineering & CSE/IT)
 * 2. Mechanical Engg Block
 * 3. MBA Block (Management Studies)
 * 4. Central Facilities (Hostel Mess)
 */

export const DEMO_TARIFF_INR_PER_KWH = 8.50;
export const GRID_EMISSION_FACTOR_KG_PER_KWH = 0.82;
export const LEAK_RESOLUTION_POINTS = 50;
export const CALCULATION_DURATION_HOURS = 1;

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
  building: 'Main Block' | 'Mechanical Engg Block' | 'MBA Block' | 'Central Facilities';
  floor: 1 | 2 | 3;
  roomNumber: string;
  department: string;
  category: 'LAB' | 'CLASSROOM' | 'SEMINAR' | 'MESS';
  capacity: number;
  
  // Virtual Occupancy
  wiFiClientCount: number;
  scheduledClass: string | null;
  isOccupied: boolean;
  occupancyConfidence: number;

  // Electrical Telemetry
  voltageRms: number;
  activePowerWatts: number;
  reactivePowerVar: number;
  powerFactor: number;
  baselineIdleWatts: number;
  
  // Ghost Leak Anomaly Detection
  hasGhostLeak: boolean;
  ghostLeakSeverity: number;
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
  kwhPrevented?: number;
  foodSavedKg?: number;
  costSavedInr: number;
  creditsAwarded: number;
  isSeeded?: boolean;
  type?: 'ENERGY' | 'FOOD_AUDIT';
}

export interface HourlyEnergyPoint {
  hour: string;
  actualKwh: number;
  baselineKwh: number;
  ghostWasteKwh: number;
}

export interface CampusSnapshot {
  timestamp: string;
  blocks: CampusBlock[];
  totalActiveWatts: number;
  totalActivePowerKW: number;
  totalBaselinePowerKW: number;
  totalExcessPowerKW: number;
  activeGhostLeaksCount: number;
  campusTotalPowerFactor: number;
  systemStatus: 'NORMAL' | 'ATTENTION_REQUIRED';
}

export interface ResolutionResult {
  success: boolean;
  reason?: 'NO_ACTIVE_LEAK' | 'BLOCK_NOT_FOUND';
  resolution?: {
    blockId: string;
    blockName: string;
    department: string;
    powerBeforeWatts: number;
    powerAfterWatts: number;
    powerReductionKW: number;
    timeAssumptionHours: number;
    estimatedEnergyAvoidedKWh: number;
    estimatedCostAvoidedINR: number;
    tariffINRPerKWh: number;
    pointsAwarded: number;
    updatedStatus: 'NORMAL';
  };
  log?: AuditLogEntry;
}

// ─── Calculation Helpers ──────────────────────────────────────────────────────
export function calculateExcessPowerKW(activeWatts: number, baselineWatts: number): number {
  return Number((Math.max(0, activeWatts - baselineWatts) / 1000).toFixed(3));
}

export function calculateEstimatedEnergyKWh(excessPowerKW: number, durationHours: number = CALCULATION_DURATION_HOURS): number {
  return Number((excessPowerKW * durationHours).toFixed(3));
}

export function calculateEstimatedCostINR(energyKWh: number, tariff: number = DEMO_TARIFF_INR_PER_KWH): number {
  return Number((energyKWh * tariff).toFixed(2));
}

export function calculateEstimatedCo2Kg(energyKWh: number, factor: number = GRID_EMISSION_FACTOR_KG_PER_KWH): number {
  return Number((energyKWh * factor).toFixed(2));
}

// ─── Simulator Class ──────────────────────────────────────────────────────────
export class CampusEnergySimulator {
  private blocks: CampusBlock[];
  private auditLogs: AuditLogEntry[];

  constructor() {
    this.blocks = [
      // --- MAIN BLOCK (Engineering & CSE/IT) ---
      {
        id: 'main-blk-fl2-r204',
        code: 'MB-204',
        name: 'Advanced AI & Computing Lab (Room 204)',
        building: 'Main Block',
        floor: 2,
        roomNumber: '204',
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
        wastedCostPerHourInr: calculateEstimatedCostINR(calculateExcessPowerKW(2680, 140)),
        wastedCo2KgPerHour: calculateEstimatedCo2Kg(calculateExcessPowerKW(2680, 140)),
        appliances: [
          { id: 'mb-ac-1', name: 'Voltas 2.0T Cassette AC', type: 'HVAC', ratedWatts: 1850, reactiveVar: 620, status: 'ACTIVE' },
          { id: 'mb-pc-cluster', name: 'Core-i7 Desktop Bank (18 PCs)', type: 'COMPUTING', ratedWatts: 690, reactiveVar: 180, status: 'ACTIVE' },
          { id: 'mb-lights', name: 'LED Ceiling Panel Fixtures', type: 'LIGHTING', ratedWatts: 140, reactiveVar: 40, status: 'ACTIVE' }
        ]
      },
      {
        id: 'main-blk-fl1-r108',
        code: 'MB-108',
        name: 'Auditorium Lecture Hall 108',
        building: 'Main Block',
        floor: 1,
        roomNumber: '108',
        department: 'Computer Science & Engg',
        category: 'CLASSROOM',
        capacity: 80,
        wiFiClientCount: 68,
        scheduledClass: 'CS-402: Cloud Architecture & Systems',
        isOccupied: true,
        occupancyConfidence: 0.98,
        voltageRms: 229.8,
        activePowerWatts: 120,
        reactivePowerVar: 40,
        powerFactor: 0.97,
        baselineIdleWatts: 120,
        hasGhostLeak: false,
        ghostLeakSeverity: 0.0,
        leakDescription: null,
        wastedCostPerHourInr: 0,
        wastedCo2KgPerHour: 0,
        appliances: [
          { id: 'mb-proj', name: 'Epson High-Lumen Projector', type: 'MULTIMEDIA', ratedWatts: 320, reactiveVar: 50, status: 'IDLE' },
          { id: 'mb-fans', name: 'High-Efficiency Fan Bank', type: 'LIGHTING', ratedWatts: 580, reactiveVar: 110, status: 'IDLE' },
          { id: 'mb-podium', name: 'Smart Digital Podium', type: 'COMPUTING', ratedWatts: 450, reactiveVar: 150, status: 'IDLE' }
        ]
      },
      {
        id: 'main-blk-fl3-r315',
        code: 'MB-315',
        name: 'Data Science & Analytics Lab (Room 315)',
        building: 'Main Block',
        floor: 3,
        roomNumber: '315',
        department: 'Information Technology',
        category: 'LAB',
        capacity: 40,
        wiFiClientCount: 34,
        scheduledClass: 'IT-304: Big Data Frameworks',
        isOccupied: true,
        occupancyConfidence: 0.94,
        voltageRms: 230.1,
        activePowerWatts: 150,
        reactivePowerVar: 40,
        powerFactor: 0.96,
        baselineIdleWatts: 150,
        hasGhostLeak: false,
        ghostLeakSeverity: 0.0,
        leakDescription: null,
        wastedCostPerHourInr: 0,
        wastedCo2KgPerHour: 0,
        appliances: [
          { id: 'mb-ds-workstations', name: 'Analytics Terminals (24x)', type: 'COMPUTING', ratedWatts: 1200, reactiveVar: 300, status: 'IDLE' },
          { id: 'mb-ds-ac', name: 'Split AC 1.5T', type: 'HVAC', ratedWatts: 480, reactiveVar: 120, status: 'IDLE' },
          { id: 'mb-ds-lights', name: 'Diffused Lighting', type: 'LIGHTING', ratedWatts: 140, reactiveVar: 40, status: 'ACTIVE' }
        ]
      },

      // --- MECHANICAL ENGG BLOCK ---
      {
        id: 'mech-blk-fl1-r112',
        code: 'ME-112',
        name: 'CAD/CAM Simulation Suite (Room 112)',
        building: 'Mechanical Engg Block',
        floor: 1,
        roomNumber: '112',
        department: 'Mechanical Engineering',
        category: 'LAB',
        capacity: 35,
        wiFiClientCount: 1,
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
        wastedCostPerHourInr: calculateEstimatedCostINR(calculateExcessPowerKW(1980, 180)),
        wastedCo2KgPerHour: calculateEstimatedCo2Kg(calculateExcessPowerKW(1980, 180)),
        appliances: [
          { id: 'me-gpu', name: 'NVIDIA RTX CAD Render Nodes (8x)', type: 'COMPUTING', ratedWatts: 1420, reactiveVar: 380, status: 'ACTIVE' },
          { id: 'me-blowers', name: 'Thermal Exhaust Blowers', type: 'HVAC', ratedWatts: 380, reactiveVar: 110, status: 'ACTIVE' },
          { id: 'me-lights', name: 'Industrial High-Bay Lights', type: 'LIGHTING', ratedWatts: 180, reactiveVar: 30, status: 'ACTIVE' }
        ]
      },
      {
        id: 'mech-blk-fl2-r218',
        code: 'ME-218',
        name: 'Robotics & Automation Suite (Room 218)',
        building: 'Mechanical Engg Block',
        floor: 2,
        roomNumber: '218',
        department: 'Mechanical Engineering',
        category: 'LAB',
        capacity: 30,
        wiFiClientCount: 22,
        scheduledClass: 'ME-405: Mechatronics & PLC',
        isOccupied: true,
        occupancyConfidence: 0.95,
        voltageRms: 230.8,
        activePowerWatts: 160,
        reactivePowerVar: 40,
        powerFactor: 0.97,
        baselineIdleWatts: 160,
        hasGhostLeak: false,
        ghostLeakSeverity: 0.0,
        leakDescription: null,
        wastedCostPerHourInr: 0,
        wastedCo2KgPerHour: 0,
        appliances: [
          { id: 'me-plc', name: 'PLC Robotic Trainer Arms', type: 'COMPUTING', ratedWatts: 920, reactiveVar: 240, status: 'IDLE' },
          { id: 'me-pneumatic', name: 'Mini-Compressor Air Unit', type: 'HVAC', ratedWatts: 520, reactiveVar: 130, status: 'IDLE' },
          { id: 'me-bench', name: 'Worktable Task Lamps', type: 'LIGHTING', ratedWatts: 180, reactiveVar: 40, status: 'ACTIVE' }
        ]
      },

      // --- MBA BLOCK (Management Studies) ---
      {
        id: 'mba-blk-fl3-r305',
        code: 'MBA-305',
        name: 'Executive Seminar Hall (Room 305)',
        building: 'MBA Block',
        floor: 3,
        roomNumber: '305',
        department: 'Management Studies (MBA)',
        category: 'SEMINAR',
        capacity: 60,
        wiFiClientCount: 0,
        scheduledClass: null,
        isOccupied: false,
        occupancyConfidence: 0.97,
        voltageRms: 231.0,
        activePowerWatts: 2450,
        reactivePowerVar: 710,
        powerFactor: 0.95,
        baselineIdleWatts: 120,
        hasGhostLeak: true,
        ghostLeakSeverity: 0.85,
        leakDescription: 'Central Chiller Duct & Stage Spotlights running in empty seminar hall',
        wastedCostPerHourInr: calculateEstimatedCostINR(calculateExcessPowerKW(2450, 120)),
        wastedCo2KgPerHour: calculateEstimatedCo2Kg(calculateExcessPowerKW(2450, 120)),
        appliances: [
          { id: 'mba-chiller', name: 'Duct Chiller Air Conditioner', type: 'HVAC', ratedWatts: 1950, reactiveVar: 580, status: 'ACTIVE' },
          { id: 'mba-spots', name: 'Stage Spotlights & Stage Audio', type: 'LIGHTING', ratedWatts: 380, reactiveVar: 90, status: 'ACTIVE' },
          { id: 'mba-podium', name: 'Executive Presentation Console', type: 'MULTIMEDIA', ratedWatts: 120, reactiveVar: 40, status: 'ACTIVE' }
        ]
      },
      {
        id: 'mba-blk-fl1-r102',
        code: 'MBA-102',
        name: 'Case Study Interactive Theater (Room 102)',
        building: 'MBA Block',
        floor: 1,
        roomNumber: '102',
        department: 'Management Studies (MBA)',
        category: 'CLASSROOM',
        capacity: 70,
        wiFiClientCount: 58,
        scheduledClass: 'MBA-201: Strategic Financial Decisions',
        isOccupied: true,
        occupancyConfidence: 0.99,
        voltageRms: 229.5,
        activePowerWatts: 110,
        reactivePowerVar: 30,
        powerFactor: 0.97,
        baselineIdleWatts: 110,
        hasGhostLeak: false,
        ghostLeakSeverity: 0.0,
        leakDescription: null,
        wastedCostPerHourInr: 0,
        wastedCo2KgPerHour: 0,
        appliances: [
          { id: 'mba-proj-1', name: 'Laser Projector Unit', type: 'MULTIMEDIA', ratedWatts: 280, reactiveVar: 40, status: 'IDLE' },
          { id: 'mba-ac-inv', name: 'Inverter Split AC (Low Load)', type: 'HVAC', ratedWatts: 680, reactiveVar: 180, status: 'IDLE' },
          { id: 'mba-lights-c', name: 'Classroom LED Arrays', type: 'LIGHTING', ratedWatts: 190, reactiveVar: 60, status: 'ACTIVE' }
        ]
      },

      // --- CENTRAL HOSTEL MESS & DINING HALL ---
      {
        id: 'central-hostel-mess',
        code: 'MESS-CENTRAL',
        name: 'Central Hostel Mess & Food Preparation Hall',
        building: 'Central Facilities',
        floor: 1,
        roomNumber: '101',
        department: 'Hostel Administration',
        category: 'MESS',
        capacity: 350,
        wiFiClientCount: 42,
        scheduledClass: 'Central Kitchen & Dining Cycle',
        isOccupied: true,
        occupancyConfidence: 0.92,
        voltageRms: 228.9,
        activePowerWatts: 480,
        reactivePowerVar: 90,
        powerFactor: 0.96,
        baselineIdleWatts: 480,
        hasGhostLeak: false,
        ghostLeakSeverity: 0.0,
        leakDescription: null,
        wastedCostPerHourInr: 0,
        wastedCo2KgPerHour: 0,
        appliances: [
          { id: 'mess-coldstorage', name: 'Cold Storage Walk-in Compressor', type: 'HVAC', ratedWatts: 2100, reactiveVar: 610, status: 'IDLE' },
          { id: 'mess-exhaust', name: 'Commercial Chimney Hood Blowers', type: 'HVAC', ratedWatts: 1250, reactiveVar: 310, status: 'IDLE' },
          { id: 'mess-grinders', name: 'Commercial Grain Grinders', type: 'COMPUTING', ratedWatts: 500, reactiveVar: 60, status: 'IDLE' }
        ]
      }
    ];

    this.auditLogs = [
      {
        id: 'log-001',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        blockId: 'main-blk-fl2-r204',
        blockName: 'Advanced AI & Computing Lab (Room 204)',
        action: 'Simulated leak resolved: 18 workstations & cassette AC returned to idle baseline (2.54 kW reduction).',
        resolvedBy: 'EcoPulse Guard',
        department: 'Computer Science & Engg',
        kwhPrevented: 2.54,
        costSavedInr: 21.59,
        creditsAwarded: 50,
        isSeeded: true,
        type: 'ENERGY',
      },
      {
        id: 'log-002',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        blockId: 'mech-blk-fl1-r112',
        blockName: 'CAD/CAM Simulation Suite (Room 112)',
        action: 'Simulated leak resolved: Isolated idle CAD workstations (1.80 kW reduction).',
        resolvedBy: 'Aman Patel (ME 3rd Yr)',
        department: 'Mechanical Engineering',
        kwhPrevented: 1.80,
        costSavedInr: 15.30,
        creditsAwarded: 50,
        isSeeded: true,
        type: 'ENERGY',
      }
    ];
  }

  /**
   * Returns a complete, consistent snapshot of the campus energy state.
   * Derived in a single internal pass to guarantee totals and building readings match 100%.
   */
  public getSnapshot(): CampusSnapshot {
    const blocks = this.getStatus();
    const totalActiveWatts = blocks.reduce((sum, b) => sum + b.activePowerWatts, 0);
    const totalBaselineWatts = blocks.reduce((sum, b) => sum + b.baselineIdleWatts, 0);
    const totalActivePowerKW = Number((totalActiveWatts / 1000).toFixed(2));
    const totalBaselinePowerKW = Number((totalBaselineWatts / 1000).toFixed(2));
    const totalExcessPowerKW = Number((Math.max(0, totalActiveWatts - totalBaselineWatts) / 1000).toFixed(2));
    const activeGhostLeaksCount = blocks.filter((b) => b.hasGhostLeak).length;

    return {
      timestamp: new Date().toISOString(),
      blocks,
      totalActiveWatts,
      totalActivePowerKW,
      totalBaselinePowerKW,
      totalExcessPowerKW,
      activeGhostLeaksCount,
      campusTotalPowerFactor: 0.96,
      systemStatus: activeGhostLeaksCount === 0 ? 'NORMAL' : 'ATTENTION_REQUIRED',
    };
  }

  /**
   * Returns cloned array of blocks with stable baseline and active power readings.
   */
  public getStatus(): CampusBlock[] {
    return this.blocks.map((b) => ({
      ...b,
      appliances: b.appliances.map((a) => ({ ...a })),
    }));
  }

  /**
   * Resolves an active simulated leak on a building.
   * Returns failure if building is not found or has no active simulated leak.
   * Cannot be applied repeatedly to award duplicate points.
   */
  public resolveLeak(blockId: string, resolvedBy: string = 'Campus EcoPulse User'): ResolutionResult {
    const block = this.blocks.find((b) => b.id === blockId);
    if (!block) {
      return { success: false, reason: 'BLOCK_NOT_FOUND' };
    }
    if (!block.hasGhostLeak) {
      return { success: false, reason: 'NO_ACTIVE_LEAK' };
    }

    const powerBeforeWatts = block.activePowerWatts;
    const powerAfterWatts = block.baselineIdleWatts;
    const excessWatts = Math.max(0, powerBeforeWatts - powerAfterWatts);
    const powerReductionKW = Number((excessWatts / 1000).toFixed(3));
    const estimatedEnergyAvoidedKWh = calculateEstimatedEnergyKWh(powerReductionKW, CALCULATION_DURATION_HOURS);
    const estimatedCostAvoidedINR = calculateEstimatedCostINR(estimatedEnergyAvoidedKWh, DEMO_TARIFF_INR_PER_KWH);

    // Update block state back to clean baseline
    block.hasGhostLeak = false;
    block.ghostLeakSeverity = 0;
    block.activePowerWatts = block.baselineIdleWatts;
    block.leakDescription = null;
    block.wastedCostPerHourInr = 0;
    block.wastedCo2KgPerHour = 0;

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
      action: `Simulated leak resolved: Loads reset to baseline (${powerReductionKW.toFixed(2)} kW reduction).`,
      resolvedBy,
      department: block.department,
      kwhPrevented: estimatedEnergyAvoidedKWh,
      costSavedInr: estimatedCostAvoidedINR,
      creditsAwarded: LEAK_RESOLUTION_POINTS,
      isSeeded: false,
      type: 'ENERGY',
    };

    this.auditLogs.unshift(newLog);

    return {
      success: true,
      resolution: {
        blockId: block.id,
        blockName: block.name,
        department: block.department,
        powerBeforeWatts,
        powerAfterWatts,
        powerReductionKW,
        timeAssumptionHours: CALCULATION_DURATION_HOURS,
        estimatedEnergyAvoidedKWh,
        estimatedCostAvoidedINR,
        tariffINRPerKWh: DEMO_TARIFF_INR_PER_KWH,
        pointsAwarded: LEAK_RESOLUTION_POINTS,
        updatedStatus: 'NORMAL',
      },
      log: newLog,
    };
  }

  /**
   * Injects a predictable simulated ghost leak for demo and testing purposes.
   * Defaults to 'main-blk-fl2-r204' (Room 204).
   */
  public triggerDemoLeak(blockId: string = 'main-blk-fl2-r204'): { success: boolean; block?: CampusBlock } {
    const block = this.blocks.find((b) => b.id === blockId);
    if (!block) return { success: false };

    const excessWatts = 2540;
    block.hasGhostLeak = true;
    block.ghostLeakSeverity = 0.88;
    block.activePowerWatts = block.baselineIdleWatts + excessWatts;
    block.leakDescription = 'Heavy cassette AC & workstation clusters left powered with 0 room occupants';

    const excessPowerKW = calculateExcessPowerKW(block.activePowerWatts, block.baselineIdleWatts);
    block.wastedCostPerHourInr = calculateEstimatedCostINR(excessPowerKW, DEMO_TARIFF_INR_PER_KWH);
    block.wastedCo2KgPerHour = calculateEstimatedCo2Kg(excessPowerKW, GRID_EMISSION_FACTOR_KG_PER_KWH);

    block.appliances.forEach((a) => (a.status = 'ACTIVE'));
    return { success: true, block: { ...block } };
  }

  public addAuditLog(entry: AuditLogEntry): void {
    this.auditLogs.unshift(entry);
  }

  public getAuditLogs(): AuditLogEntry[] {
    return this.auditLogs;
  }

  /**
   * Generates a coherent 24-hour demonstration consumption profile.
   * Derived from the total campus baseline and active simulated leak loads,
   * providing a stable, reproducible history across repeated poll requests.
   */
  public get24HourTelemetry(): HourlyEnergyPoint[] {
    const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    
    // Sum active leak excess in kW
    const activeLeakKw = this.blocks.reduce(
      (sum, b) => (b.hasGhostLeak ? sum + calculateExcessPowerKW(b.activePowerWatts, b.baselineIdleWatts) : sum),
      0
    );

    return hours.map((h, i) => {
      const isDay = i >= 4 && i <= 9; // 08:00 to 18:00
      // Baseline 2-hour energy consumption
      const baselineKwh = isDay ? 36.0 : 12.0;
      // Simulated ghost waste: active leak kW * 2h interval
      const ghostWasteKwh = Number((activeLeakKw * 2.0).toFixed(1));
      const actualKwh = Number((baselineKwh + ghostWasteKwh).toFixed(1));

      return {
        hour: h,
        actualKwh,
        baselineKwh,
        ghostWasteKwh,
      };
    });
  }
}
