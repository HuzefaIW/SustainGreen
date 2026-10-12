/**
 * Member 3: IoT Energy Telemetry Simulator
 * Simulates real-time energy draws across campus blocks.
 */
export interface CampusBlock {
  id: string;
  name: string;
  isOccupied: boolean;
  powerDrawWatts: number;
  baselineWatts: number;
  hasGhostLeak: boolean;
  leakType: string | null;
  wastedCostPerHour: number;
}

export class CampusEnergySimulator {
  private blocks: CampusBlock[] = [
    {
      id: 'block-a-cs-lab-2',
      name: 'CS Lab 2 (Block A)',
      isOccupied: false,
      powerDrawWatts: 2450,
      baselineWatts: 150,
      hasGhostLeak: true,
      leakType: '12 PCs & Central Split AC left running while empty',
      wastedCostPerHour: 19.6,
    },
    {
      id: 'block-b-lh-101',
      name: 'Lecture Hall 101',
      isOccupied: true,
      powerDrawWatts: 1180,
      baselineWatts: 120,
      hasGhostLeak: false,
      leakType: null,
      wastedCostPerHour: 0,
    },
    {
      id: 'block-c-library-reading',
      name: 'Central Library Hall',
      isOccupied: true,
      powerDrawWatts: 3400,
      baselineWatts: 400,
      hasGhostLeak: false,
      leakType: null,
      wastedCostPerHour: 0,
    },
    {
      id: 'block-mech-cad-lab',
      name: 'Mech CAD Lab (Ground Fl)',
      isOccupied: false,
      powerDrawWatts: 1850,
      baselineWatts: 200,
      hasGhostLeak: true,
      leakType: 'Heavy workstations on standby without scheduled class',
      wastedCostPerHour: 14.8,
    },
  ];

  public getStatus(): CampusBlock[] {
    // Add realistic jitter (+/- 25W)
    return this.blocks.map((b) => ({
      ...b,
      powerDrawWatts: Math.round(b.powerDrawWatts + (Math.random() * 50 - 25)),
    }));
  }

  public resolveLeak(blockId: string): boolean {
    const block = this.blocks.find((b) => b.id === blockId);
    if (block) {
      block.hasGhostLeak = false;
      block.powerDrawWatts = block.baselineWatts;
      block.leakType = null;
      block.wastedCostPerHour = 0;
      return true;
    }
    return false;
  }
}
