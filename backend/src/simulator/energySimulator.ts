/**
 * Deep Tech NILM & Campus Energy Telemetry Simulator
 * Structured for the 3 College Blocks (Main Block, Mechanical Engg Block, MBA Block)
 * with Floors 1, 2, 3 (Rooms 101 - 126 per floor) and Central Hostel Mess.
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
  
  building: 'Main Block' | 'Mechanical Engg Block' | 'MBA Block' | 'Central Facilities';
  floor: 1 | 2 | 3;
  roomNumber: string;
  department: string;
  category: 'LAB' | 'CLASSROOM' | 'SEMINAR' | 'MESS';
  capacity: number;
  
  // Virtual Occupancy (Zero-Hardware Sensor Fusion)
  wiFiClientCount: number;
  scheduledClass: string | null;
  isOccupied: boolean;
  occupancyConfidence: number;

  // NILM High-Frequency Telemetry
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

export class CampusEnergySimulator {
  private blocks: CampusBlock[] = [
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
      wastedCostPerHourInr: 21.44,
      wastedCo2KgPerHour: 2.08,
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
        { id: 'mb-proj', name: 'Epson High-Lumen Projector', type: 'MULTIMEDIA', ratedWatts: 320, reactiveVar: 50, status: 'ACTIVE' },
        { id: 'mb-fans', name: 'High-Efficiency Fan Bank', type: 'LIGHTING', ratedWatts: 580, reactiveVar: 110, status: 'ACTIVE' },
        { id: 'mb-podium', name: 'Smart Digital Podium', type: 'COMPUTING', ratedWatts: 450, reactiveVar: 150, status: 'ACTIVE' }
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
      activePowerWatts: 1820,
      reactivePowerVar: 460,
      powerFactor: 0.96,
      baselineIdleWatts: 150,
      hasGhostLeak: false,
      ghostLeakSeverity: 0.0,
      leakDescription: null,
      wastedCostPerHourInr: 0,
      wastedCo2KgPerHour: 0,
      appliances: [
        { id: 'mb-ds-workstations', name: 'Analytics Terminals (24x)', type: 'COMPUTING', ratedWatts: 1200, reactiveVar: 300, status: 'ACTIVE' },
        { id: 'mb-ds-ac', name: 'Split AC 1.5T', type: 'HVAC', ratedWatts: 480, reactiveVar: 120, status: 'ACTIVE' },
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
      wastedCostPerHourInr: 15.3,
      wastedCo2KgPerHour: 1.48,
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
      activePowerWatts: 1620,
      reactivePowerVar: 410,
      powerFactor: 0.97,
      baselineIdleWatts: 160,
      hasGhostLeak: false,
      ghostLeakSeverity: 0.0,
      leakDescription: null,
      wastedCostPerHourInr: 0,
      wastedCo2KgPerHour: 0,
      appliances: [
        { id: 'me-plc', name: 'PLC Robotic Trainer Arms', type: 'COMPUTING', ratedWatts: 920, reactiveVar: 240, status: 'ACTIVE' },
        { id: 'me-pneumatic', name: 'Mini-Compressor Air Unit', type: 'HVAC', ratedWatts: 520, reactiveVar: 130, status: 'ACTIVE' },
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
      wastedCostPerHourInr: 19.8,
      wastedCo2KgPerHour: 1.91,
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
      activePowerWatts: 1150,
      reactivePowerVar: 280,
      powerFactor: 0.97,
      baselineIdleWatts: 110,
      hasGhostLeak: false,
      ghostLeakSeverity: 0.0,
      leakDescription: null,
      wastedCostPerHourInr: 0,
      wastedCo2KgPerHour: 0,
      appliances: [
        { id: 'mba-proj-1', name: 'Laser Projector Unit', type: 'MULTIMEDIA', ratedWatts: 280, reactiveVar: 40, status: 'ACTIVE' },
        { id: 'mba-ac-inv', name: 'Inverter Split AC (Low Load)', type: 'HVAC', ratedWatts: 680, reactiveVar: 180, status: 'ACTIVE' },
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
      activePowerWatts: 3850,
      reactivePowerVar: 980,
      powerFactor: 0.96,
      baselineIdleWatts: 480,
      hasGhostLeak: false,
      ghostLeakSeverity: 0.0,
      leakDescription: null,
      wastedCostPerHourInr: 0,
      wastedCo2KgPerHour: 0,
      appliances: [
        { id: 'mess-coldstorage', name: 'Cold Storage Walk-in Compressor', type: 'HVAC', ratedWatts: 2100, reactiveVar: 610, status: 'ACTIVE' },
        { id: 'mess-exhaust', name: 'Commercial Chimney Hood Blowers', type: 'HVAC', ratedWatts: 1250, reactiveVar: 310, status: 'ACTIVE' },
        { id: 'mess-grinders', name: 'Commercial Grain Grinders', type: 'COMPUTING', ratedWatts: 500, reactiveVar: 60, status: 'ACTIVE' }
      ]
    }
  ];

  private auditLogs: AuditLogEntry[] = [
    {
      id: 'log-001',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      blockId: 'main-blk-fl2-r204',
      blockName: 'Advanced AI & Computing Lab (Room 204)',
      action: 'Simulated leak resolved: 18 workstations & cassette AC returned to idle baseline',
      resolvedBy: 'EcoPulse Guard',
      department: 'Computer Science & Engg',
      kwhPrevented: 4.2,
      costSavedInr: 35.7,
      creditsAwarded: 50,
      isSeeded: true,
      type: 'ENERGY',
    },
    {
      id: 'log-002',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      blockId: 'mech-blk-fl1-r112',
      blockName: 'CAD/CAM Simulation Suite (Room 112)',
      action: 'Simulated leak resolved: Isolated idle CAD workstations',
      resolvedBy: 'Aman Patel (ME 3rd Yr)',
      department: 'Mechanical Engineering',
      kwhPrevented: 5.8,
      costSavedInr: 49.3,
      creditsAwarded: 50,
      isSeeded: true,
      type: 'ENERGY',
    }
  ];

  public getStatus(): CampusBlock[] {
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
      action: `Simulated leak resolved: Loads reset to baseline (${preventedKw.toFixed(2)} kW reduction).`,
      resolvedBy,
      department: block.department,
      kwhPrevented: Number(preventedKw.toFixed(2)),
      costSavedInr: costSaved,
      creditsAwarded: 50,
      isSeeded: false,
      type: 'ENERGY',
    };

    this.auditLogs.unshift(newLog);
    return { success: true, log: newLog };
  }

  public addAuditLog(entry: AuditLogEntry): void {
    this.auditLogs.unshift(entry);
  }

  public triggerDemoLeak(blockId: string = 'main-blk-fl2-r204'): boolean {
    const block = this.blocks.find((b) => b.id === blockId);
    if (!block) return false;
    block.hasGhostLeak = true;
    block.ghostLeakSeverity = 0.88;
    block.activePowerWatts = block.baselineIdleWatts + 2540;
    block.leakDescription = 'Heavy cassette AC & workstation clusters left powered with 0 room occupants';
    block.wastedCostPerHourInr = 21.5;
    block.wastedCo2KgPerHour = 2.08;
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
      const actualKwh = isNight ? 32 + Math.round(Math.random() * 8) : 110 + Math.round(Math.random() * 25);
      const baselineKwh = isNight ? 14 : 75;
      const ghostWasteKwh = Math.max(0, actualKwh - (baselineKwh + (isNight ? 6 : 18)));
      return {
        hour: h,
        actualKwh,
        baselineKwh,
        ghostWasteKwh
      };
    });
  }
}
