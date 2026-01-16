import type { RadarData, RadarModel, Nation } from "@shared/schema";

export interface IStorage {
  getRadarData(month: string, nation: Nation): Promise<RadarData | undefined>;
  setRadarData(data: RadarData): Promise<void>;
}

export class MemStorage implements IStorage {
  private radarCache: Map<string, RadarData>;

  constructor() {
    this.radarCache = new Map();
  }

  private getCacheKey(month: string, nation: Nation): string {
    return `${month}-${nation}`;
  }

  async getRadarData(month: string, nation: Nation): Promise<RadarData | undefined> {
    return this.radarCache.get(this.getCacheKey(month, nation));
  }

  async setRadarData(data: RadarData): Promise<void> {
    this.radarCache.set(this.getCacheKey(data.month, data.nation), data);
  }
}

export const storage = new MemStorage();
