import {
  farmers,
  crops,
  irrigationLogs,
  weatherData,
  waterAllocations,
  complianceRecords,
  irrigationRecommendations,
  alerts,
  cropYields,
  environmentalConditions,
  performanceMetrics,
  cropPrices,
  type Farmer,
  type InsertFarmer,
  type Crop,
  type InsertCrop,
  type IrrigationLog,
  type InsertIrrigationLog,
  type WeatherData,
  type InsertWeatherData,
  type WaterAllocation,
  type InsertWaterAllocation,
  type ComplianceRecord,
  type InsertComplianceRecord,
  type IrrigationRecommendation,
  type InsertIrrigationRecommendation,
  type Alert,
  type InsertAlert,
  type CropYield,
  type InsertCropYield,
  type EnvironmentalConditions,
  type InsertEnvironmentalConditions,
  type PerformanceMetrics,
  type InsertPerformanceMetrics,
  type CropPrices,
  type InsertCropPrices,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // Farmer operations
  getFarmer(id: string): Promise<Farmer | undefined>;
  getFarmerByEmail(email: string): Promise<Farmer | undefined>;
  createFarmer(farmer: InsertFarmer): Promise<Farmer>;
  updateFarmer(id: string, farmer: Partial<InsertFarmer>): Promise<Farmer>;
  getAllFarmers(): Promise<Farmer[]>;

  // Crop operations
  getCrop(id: string): Promise<Crop | undefined>;
  getCropsByFarmerId(farmerId: string): Promise<Crop[]>;
  createCrop(crop: InsertCrop): Promise<Crop>;
  updateCrop(id: string, crop: Partial<InsertCrop>): Promise<Crop>;

  // Irrigation log operations
  getIrrigationLogs(cropId: string): Promise<IrrigationLog[]>;
  createIrrigationLog(log: InsertIrrigationLog): Promise<IrrigationLog>;
  getIrrigationLogsByFarmerId(farmerId: string): Promise<IrrigationLog[]>;

  // Weather data operations
  getWeatherData(location: string, date?: Date): Promise<WeatherData | undefined>;
  createWeatherData(data: InsertWeatherData): Promise<WeatherData>;
  getLatestWeatherData(location: string): Promise<WeatherData | undefined>;

  // Water allocation operations
  getWaterAllocation(farmerId: string): Promise<WaterAllocation | undefined>;
  createWaterAllocation(allocation: InsertWaterAllocation): Promise<WaterAllocation>;
  updateWaterAllocation(id: string, allocation: Partial<InsertWaterAllocation>): Promise<WaterAllocation>;

  // Compliance record operations
  getComplianceRecords(farmerId: string): Promise<ComplianceRecord[]>;
  createComplianceRecord(record: InsertComplianceRecord): Promise<ComplianceRecord>;
  getAllComplianceRecords(): Promise<ComplianceRecord[]>;

  // Irrigation recommendation operations
  getIrrigationRecommendations(cropId: string): Promise<IrrigationRecommendation[]>;
  createIrrigationRecommendation(recommendation: InsertIrrigationRecommendation): Promise<IrrigationRecommendation>;
  updateIrrigationRecommendation(id: string, recommendation: Partial<InsertIrrigationRecommendation>): Promise<IrrigationRecommendation>;
  getRecommendationsByFarmerId(farmerId: string): Promise<IrrigationRecommendation[]>;

  // Alert operations
  getAlerts(farmerId: string): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertAsRead(id: string): Promise<Alert>;
  getUnreadAlerts(farmerId: string): Promise<Alert[]>;

  // Analytics operations
  getTotalWaterUsage(farmerId: string, startDate: Date, endDate: Date): Promise<number>;
  getRegionalWaterUsage(): Promise<{ region: string; totalUsage: number; farmerCount: number }[]>;
  getComplianceStats(): Promise<{ compliant: number; warning: number; violation: number }>;

  // Historical data operations for machine learning
  getCropYields(cropId: string): Promise<CropYield[]>;
  getCropYieldsByFarmerId(farmerId: string): Promise<CropYield[]>;
  createCropYield(yieldData: InsertCropYield): Promise<CropYield>;
  
  getEnvironmentalConditions(farmerId: string, startDate?: Date, endDate?: Date): Promise<EnvironmentalConditions[]>;
  createEnvironmentalConditions(conditions: InsertEnvironmentalConditions): Promise<EnvironmentalConditions>;
  getLatestEnvironmentalConditions(farmerId: string): Promise<EnvironmentalConditions | undefined>;
  
  getPerformanceMetrics(farmerId: string, metricType?: string): Promise<PerformanceMetrics[]>;
  createPerformanceMetrics(metrics: InsertPerformanceMetrics): Promise<PerformanceMetrics>;
  getPerformanceMetricsByCrop(cropId: string): Promise<PerformanceMetrics[]>;

  // Crop prices operations
  createCropPrices(priceData: InsertCropPrices): Promise<CropPrices>;
  getAllCropPrices(): Promise<CropPrices[]>;
}

export class DatabaseStorage implements IStorage {
  // Farmer operations
  async getFarmer(id: string): Promise<Farmer | undefined> {
    const [farmer] = await db.select().from(farmers).where(eq(farmers.id, id));
    return farmer;
  }

  async getFarmerByEmail(email: string): Promise<Farmer | undefined> {
    const [farmer] = await db.select().from(farmers).where(eq(farmers.email, email));
    return farmer;
  }

  async createFarmer(farmer: InsertFarmer): Promise<Farmer> {
    const [newFarmer] = await db.insert(farmers).values(farmer).returning();
    return newFarmer;
  }

  async updateFarmer(id: string, farmer: Partial<InsertFarmer>): Promise<Farmer> {
    const [updatedFarmer] = await db
      .update(farmers)
      .set({ ...farmer, updatedAt: new Date() })
      .where(eq(farmers.id, id))
      .returning();
    return updatedFarmer;
  }

  async getAllFarmers(): Promise<Farmer[]> {
    return await db.select().from(farmers).orderBy(desc(farmers.createdAt));
  }

  // Crop operations
  async getCrop(id: string): Promise<Crop | undefined> {
    const [crop] = await db.select().from(crops).where(eq(crops.id, id));
    return crop;
  }

  async getCropsByFarmerId(farmerId: string): Promise<Crop[]> {
    return await db.select().from(crops).where(eq(crops.farmerId, farmerId)).orderBy(desc(crops.createdAt));
  }

  async createCrop(crop: InsertCrop): Promise<Crop> {
    const [newCrop] = await db.insert(crops).values(crop).returning();
    return newCrop;
  }

  async updateCrop(id: string, crop: Partial<InsertCrop>): Promise<Crop> {
    const [updatedCrop] = await db
      .update(crops)
      .set({ ...crop, updatedAt: new Date() })
      .where(eq(crops.id, id))
      .returning();
    return updatedCrop;
  }

  // Irrigation log operations
  async getIrrigationLogs(cropId: string): Promise<IrrigationLog[]> {
    return await db.select().from(irrigationLogs).where(eq(irrigationLogs.cropId, cropId)).orderBy(desc(irrigationLogs.irrigationDate));
  }

  async createIrrigationLog(log: InsertIrrigationLog): Promise<IrrigationLog> {
    const [newLog] = await db.insert(irrigationLogs).values(log).returning();
    return newLog;
  }

  async getIrrigationLogsByFarmerId(farmerId: string): Promise<IrrigationLog[]> {
    return await db
      .select({
        id: irrigationLogs.id,
        cropId: irrigationLogs.cropId,
        waterAmount: irrigationLogs.waterAmount,
        duration: irrigationLogs.duration,
        irrigationDate: irrigationLogs.irrigationDate,
        method: irrigationLogs.method,
        efficiency: irrigationLogs.efficiency,
        notes: irrigationLogs.notes,
        createdAt: irrigationLogs.createdAt,
      })
      .from(irrigationLogs)
      .innerJoin(crops, eq(irrigationLogs.cropId, crops.id))
      .where(eq(crops.farmerId, farmerId))
      .orderBy(desc(irrigationLogs.irrigationDate));
  }

  // Weather data operations
  async getWeatherData(location: string, date?: Date): Promise<WeatherData | undefined> {
    if (date) {
      const [weather] = await db.select().from(weatherData).where(
        and(
          eq(weatherData.location, location),
          gte(weatherData.date, new Date(date.getFullYear(), date.getMonth(), date.getDate())),
          lte(weatherData.date, new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59))
        )
      );
      return weather;
    }
    
    const [weather] = await db.select().from(weatherData)
      .where(eq(weatherData.location, location))
      .orderBy(desc(weatherData.date))
      .limit(1);
    return weather;
  }

  async createWeatherData(data: InsertWeatherData): Promise<WeatherData> {
    const [newWeatherData] = await db.insert(weatherData).values(data).returning();
    return newWeatherData;
  }

  async getLatestWeatherData(location: string): Promise<WeatherData | undefined> {
    const [weather] = await db
      .select()
      .from(weatherData)
      .where(eq(weatherData.location, location))
      .orderBy(desc(weatherData.date))
      .limit(1);
    return weather;
  }

  // Water allocation operations
  async getWaterAllocation(farmerId: string): Promise<WaterAllocation | undefined> {
    const [allocation] = await db
      .select()
      .from(waterAllocations)
      .where(eq(waterAllocations.farmerId, farmerId))
      .orderBy(desc(waterAllocations.validFrom))
      .limit(1);
    return allocation;
  }

  async createWaterAllocation(allocation: InsertWaterAllocation): Promise<WaterAllocation> {
    const [newAllocation] = await db.insert(waterAllocations).values(allocation).returning();
    return newAllocation;
  }

  async updateWaterAllocation(id: string, allocation: Partial<InsertWaterAllocation>): Promise<WaterAllocation> {
    const [updatedAllocation] = await db
      .update(waterAllocations)
      .set(allocation)
      .where(eq(waterAllocations.id, id))
      .returning();
    return updatedAllocation;
  }

  // Compliance record operations
  async getComplianceRecords(farmerId: string): Promise<ComplianceRecord[]> {
    return await db
      .select()
      .from(complianceRecords)
      .where(eq(complianceRecords.farmerId, farmerId))
      .orderBy(desc(complianceRecords.reportDate));
  }

  async createComplianceRecord(record: InsertComplianceRecord): Promise<ComplianceRecord> {
    const [newRecord] = await db.insert(complianceRecords).values(record).returning();
    return newRecord;
  }

  async getAllComplianceRecords(): Promise<ComplianceRecord[]> {
    return await db
      .select()
      .from(complianceRecords)
      .orderBy(desc(complianceRecords.reportDate));
  }

  // Irrigation recommendation operations
  async getIrrigationRecommendations(cropId: string): Promise<IrrigationRecommendation[]> {
    return await db
      .select()
      .from(irrigationRecommendations)
      .where(eq(irrigationRecommendations.cropId, cropId))
      .orderBy(desc(irrigationRecommendations.recommendedDate));
  }

  async createIrrigationRecommendation(recommendation: InsertIrrigationRecommendation): Promise<IrrigationRecommendation> {
    const [newRecommendation] = await db.insert(irrigationRecommendations).values(recommendation).returning();
    return newRecommendation;
  }

  async updateIrrigationRecommendation(id: string, recommendation: Partial<InsertIrrigationRecommendation>): Promise<IrrigationRecommendation> {
    const [updatedRecommendation] = await db
      .update(irrigationRecommendations)
      .set({ ...recommendation, updatedAt: new Date() })
      .where(eq(irrigationRecommendations.id, id))
      .returning();
    return updatedRecommendation;
  }

  async getRecommendationsByFarmerId(farmerId: string): Promise<IrrigationRecommendation[]> {
    return await db
      .select({
        id: irrigationRecommendations.id,
        cropId: irrigationRecommendations.cropId,
        recommendedDate: irrigationRecommendations.recommendedDate,
        waterAmount: irrigationRecommendations.waterAmount,
        duration: irrigationRecommendations.duration,
        priority: irrigationRecommendations.priority,
        reasoning: irrigationRecommendations.reasoning,
        weatherFactors: irrigationRecommendations.weatherFactors,
        status: irrigationRecommendations.status,
        createdAt: irrigationRecommendations.createdAt,
        updatedAt: irrigationRecommendations.updatedAt,
      })
      .from(irrigationRecommendations)
      .innerJoin(crops, eq(irrigationRecommendations.cropId, crops.id))
      .where(eq(crops.farmerId, farmerId))
      .orderBy(desc(irrigationRecommendations.recommendedDate));
  }

  // Alert operations
  async getAlerts(farmerId: string): Promise<Alert[]> {
    return await db
      .select()
      .from(alerts)
      .where(eq(alerts.farmerId, farmerId))
      .orderBy(desc(alerts.createdAt));
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db.insert(alerts).values(alert).returning();
    return newAlert;
  }

  async markAlertAsRead(id: string): Promise<Alert> {
    const [updatedAlert] = await db
      .update(alerts)
      .set({ isRead: true })
      .where(eq(alerts.id, id))
      .returning();
    return updatedAlert;
  }

  async getUnreadAlerts(farmerId: string): Promise<Alert[]> {
    return await db
      .select()
      .from(alerts)
      .where(and(eq(alerts.farmerId, farmerId), eq(alerts.isRead, false)))
      .orderBy(desc(alerts.createdAt));
  }

  // Analytics operations
  async getTotalWaterUsage(farmerId: string, startDate: Date, endDate: Date): Promise<number> {
    const result = await db
      .select({
        total: sql<number>`COALESCE(SUM(${irrigationLogs.waterAmount}), 0)`,
      })
      .from(irrigationLogs)
      .innerJoin(crops, eq(irrigationLogs.cropId, crops.id))
      .where(
        and(
          eq(crops.farmerId, farmerId),
          gte(irrigationLogs.irrigationDate, startDate),
          lte(irrigationLogs.irrigationDate, endDate)
        )
      );
    
    return result[0]?.total || 0;
  }

  async getRegionalWaterUsage(): Promise<{ region: string; totalUsage: number; farmerCount: number }[]> {
    const result = await db
      .select({
        region: farmers.farmLocation,
        totalUsage: sql<number>`COALESCE(SUM(${irrigationLogs.waterAmount}), 0)`,
        farmerCount: sql<number>`COUNT(DISTINCT ${farmers.id})`,
      })
      .from(farmers)
      .leftJoin(crops, eq(farmers.id, crops.farmerId))
      .leftJoin(irrigationLogs, eq(crops.id, irrigationLogs.cropId))
      .groupBy(farmers.farmLocation);
    
    return result.map(row => ({
      region: row.region,
      totalUsage: row.totalUsage || 0,
      farmerCount: row.farmerCount || 0,
    }));
  }

  async getComplianceStats(): Promise<{ compliant: number; warning: number; violation: number }> {
    const result = await db
      .select({
        status: complianceRecords.complianceStatus,
        count: sql<number>`COUNT(*)`,
      })
      .from(complianceRecords)
      .groupBy(complianceRecords.complianceStatus);
    
    const stats = { compliant: 0, warning: 0, violation: 0 };
    result.forEach(row => {
      if (row.status === 'compliant') stats.compliant = Number(row.count);
      else if (row.status === 'warning') stats.warning = Number(row.count);
      else if (row.status === 'violation') stats.violation = Number(row.count);
    });
    
    return stats;
  }

  // Historical data operations for machine learning
  async getCropYields(cropId: string): Promise<CropYield[]> {
    return await db.select().from(cropYields).where(eq(cropYields.cropId, cropId)).orderBy(desc(cropYields.harvestDate));
  }

  async getCropYieldsByFarmerId(farmerId: string): Promise<CropYield[]> {
    return await db
      .select({
        id: cropYields.id,
        cropId: cropYields.cropId,
        harvestDate: cropYields.harvestDate,
        yieldPerAcre: cropYields.yieldPerAcre,
        qualityScore: cropYields.qualityScore,
        totalWaterUsed: cropYields.totalWaterUsed,
        totalFertilizerUsed: cropYields.totalFertilizerUsed,
        totalCostPerAcre: cropYields.totalCostPerAcre,
        marketPrice: cropYields.marketPrice,
        netProfitPerAcre: cropYields.netProfitPerAcre,
        weatherConditionsSummary: cropYields.weatherConditionsSummary,
        soilConditions: cropYields.soilConditions,
        diseaseIncidents: cropYields.diseaseIncidents,
        varietyInfo: cropYields.varietyInfo,
        notes: cropYields.notes,
        createdAt: cropYields.createdAt,
      })
      .from(cropYields)
      .innerJoin(crops, eq(cropYields.cropId, crops.id))
      .where(eq(crops.farmerId, farmerId))
      .orderBy(desc(cropYields.harvestDate));
  }

  async createCropYield(yieldData: InsertCropYield): Promise<CropYield> {
    const [newYield] = await db.insert(cropYields).values(yieldData).returning();
    return newYield;
  }

  async getEnvironmentalConditions(farmerId: string, startDate?: Date, endDate?: Date): Promise<EnvironmentalConditions[]> {
    if (startDate && endDate) {
      return await db
        .select()
        .from(environmentalConditions)
        .where(
          and(
            eq(environmentalConditions.farmerId, farmerId),
            gte(environmentalConditions.recordDate, startDate),
            lte(environmentalConditions.recordDate, endDate)
          )
        )
        .orderBy(desc(environmentalConditions.recordDate));
    }
    
    return await db
      .select()
      .from(environmentalConditions)
      .where(eq(environmentalConditions.farmerId, farmerId))
      .orderBy(desc(environmentalConditions.recordDate));
  }

  async createEnvironmentalConditions(conditions: InsertEnvironmentalConditions): Promise<EnvironmentalConditions> {
    const [newConditions] = await db.insert(environmentalConditions).values(conditions).returning();
    return newConditions;
  }

  async getLatestEnvironmentalConditions(farmerId: string): Promise<EnvironmentalConditions | undefined> {
    const [latest] = await db
      .select()
      .from(environmentalConditions)
      .where(eq(environmentalConditions.farmerId, farmerId))
      .orderBy(desc(environmentalConditions.recordDate))
      .limit(1);
    return latest;
  }

  async getPerformanceMetrics(farmerId: string, metricType?: string): Promise<PerformanceMetrics[]> {
    if (metricType) {
      return await db
        .select()
        .from(performanceMetrics)
        .where(
          and(
            eq(performanceMetrics.farmerId, farmerId),
            eq(performanceMetrics.metricType, metricType)
          )
        )
        .orderBy(desc(performanceMetrics.calculationDate));
    }
    
    return await db
      .select()
      .from(performanceMetrics)
      .where(eq(performanceMetrics.farmerId, farmerId))
      .orderBy(desc(performanceMetrics.calculationDate));
  }

  async createPerformanceMetrics(metrics: InsertPerformanceMetrics): Promise<PerformanceMetrics> {
    const [newMetrics] = await db.insert(performanceMetrics).values(metrics).returning();
    return newMetrics;
  }

  async getPerformanceMetricsByCrop(cropId: string): Promise<PerformanceMetrics[]> {
    return await db
      .select()
      .from(performanceMetrics)
      .where(eq(performanceMetrics.cropId, cropId))
      .orderBy(desc(performanceMetrics.calculationDate));
  }

  // Crop prices operations
  async createCropPrices(priceData: InsertCropPrices): Promise<CropPrices> {
    const [newPriceData] = await db.insert(cropPrices).values(priceData).returning();
    return newPriceData;
  }

  async getAllCropPrices(): Promise<CropPrices[]> {
    const prices = await db.select().from(cropPrices).orderBy(desc(cropPrices.priceDate));
    return prices;
  }
}

export const storage = new DatabaseStorage();
