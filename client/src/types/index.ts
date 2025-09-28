// Re-export types from shared schema
export type { 
  Farmer, 
  Crop, 
  IrrigationLog, 
  WeatherData as DBWeatherData, 
  WaterAllocation, 
  ComplianceRecord, 
  IrrigationRecommendation, 
  Alert 
} from '@shared/schema';

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  weatherCondition: string;
  description: string;
  uvIndex: number;
}

export interface ForecastDay {
  date: Date;
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCondition: string;
  precipitationProbability: number;
}

export interface DashboardStats {
  waterUsedToday: number;
  efficiencyScore: number;
  waterAllocationUsed: number;
  nextIrrigationTime: string;
  nextIrrigationField: string;
}

export interface RegionalStats {
  totalWaterUsage: number;
  activeFarmers: number;
  complianceRate: number;
  waterEfficiency: number;
}

export interface ComplianceStats {
  compliant: number;
  warning: number;
  violation: number;
}
