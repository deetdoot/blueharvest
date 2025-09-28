import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const farmers = pgTable("farmers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  farmName: text("farm_name").notNull(),
  farmLocation: text("farm_location").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  elevation: decimal("elevation", { precision: 8, scale: 2 }).default("90"), // meters above sea level
  totalAcres: decimal("total_acres", { precision: 10, scale: 2 }).notNull(),
  soilType: text("soil_type").notNull(),
  irrigationMethod: text("irrigation_method").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const crops = pgTable("crops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmerId: varchar("farmer_id").references(() => farmers.id).notNull(),
  cropType: text("crop_type").notNull(),
  fieldName: text("field_name").notNull(),
  acres: decimal("acres", { precision: 10, scale: 2 }).notNull(),
  plantingDate: timestamp("planting_date").notNull(),
  growthStage: text("growth_stage").notNull().default("seedling"),
  waterRequirement: decimal("water_requirement", { precision: 5, scale: 2 }).notNull(), // inches per day
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const irrigationLogs = pgTable("irrigation_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cropId: varchar("crop_id").references(() => crops.id).notNull(),
  waterAmount: decimal("water_amount", { precision: 10, scale: 2 }).notNull(), // gallons
  duration: integer("duration").notNull(), // minutes
  irrigationDate: timestamp("irrigation_date").notNull(),
  method: text("method").notNull(),
  efficiency: decimal("efficiency", { precision: 5, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const weatherData = pgTable("weather_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  location: text("location").notNull(),
  date: timestamp("date").notNull(),
  temperature: decimal("temperature", { precision: 5, scale: 2 }).notNull(),
  humidity: decimal("humidity", { precision: 5, scale: 2 }).notNull(),
  windSpeed: decimal("wind_speed", { precision: 5, scale: 2 }),
  precipitation: decimal("precipitation", { precision: 5, scale: 2 }).default("0"),
  evapotranspiration: decimal("evapotranspiration", { precision: 5, scale: 2 }),
  uvIndex: decimal("uv_index", { precision: 3, scale: 1 }),
  weatherCondition: text("weather_condition").notNull(),
  forecast: jsonb("forecast"), // 7-day forecast data
  createdAt: timestamp("created_at").defaultNow(),
});

export const waterAllocations = pgTable("water_allocations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmerId: varchar("farmer_id").references(() => farmers.id).notNull(),
  region: text("region").notNull(),
  monthlyAllocation: decimal("monthly_allocation", { precision: 12, scale: 2 }).notNull(), // gallons
  annualAllocation: decimal("annual_allocation", { precision: 12, scale: 2 }).notNull(), // gallons
  priorityLevel: text("priority_level").notNull().default("standard"),
  restrictions: text("restrictions"),
  validFrom: timestamp("valid_from").notNull(),
  validTo: timestamp("valid_to").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const complianceRecords = pgTable("compliance_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmerId: varchar("farmer_id").references(() => farmers.id).notNull(),
  period: text("period").notNull(), // "monthly" or "annual"
  totalUsage: decimal("total_usage", { precision: 12, scale: 2 }).notNull(),
  allocatedAmount: decimal("allocated_amount", { precision: 12, scale: 2 }).notNull(),
  complianceStatus: text("compliance_status").notNull(), // "compliant", "warning", "violation"
  efficiencyScore: decimal("efficiency_score", { precision: 5, scale: 2 }),
  violations: text("violations"),
  reportDate: timestamp("report_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const irrigationRecommendations = pgTable("irrigation_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cropId: varchar("crop_id").references(() => crops.id).notNull(),
  recommendedDate: timestamp("recommended_date").notNull(),
  waterAmount: decimal("water_amount", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(),
  priority: text("priority").notNull().default("medium"),
  reasoning: text("reasoning").notNull(),
  weatherFactors: jsonb("weather_factors"),
  status: text("status").notNull().default("pending"), // "pending", "scheduled", "completed", "skipped"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmerId: varchar("farmer_id").references(() => farmers.id).notNull(),
  type: text("type").notNull(), // "irrigation", "weather", "compliance", "water_shortage"
  severity: text("severity").notNull(), // "low", "medium", "high", "critical"
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  actionRequired: boolean("action_required").default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Historical yield and performance tracking tables for machine learning
export const cropYields = pgTable("crop_yields", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cropId: varchar("crop_id").references(() => crops.id).notNull(),
  harvestDate: timestamp("harvest_date").notNull(),
  yieldPerAcre: decimal("yield_per_acre", { precision: 10, scale: 2 }).notNull(), // yield in appropriate units
  qualityScore: decimal("quality_score", { precision: 5, scale: 2 }), // 0-100 quality rating
  totalWaterUsed: decimal("total_water_used", { precision: 12, scale: 2 }).notNull(), // gallons
  totalFertilizerUsed: decimal("total_fertilizer_used", { precision: 10, scale: 2 }), // pounds
  totalCostPerAcre: decimal("total_cost_per_acre", { precision: 10, scale: 2 }),
  marketPrice: decimal("market_price", { precision: 8, scale: 2 }), // price per unit
  netProfitPerAcre: decimal("net_profit_per_acre", { precision: 10, scale: 2 }),
  weatherConditionsSummary: jsonb("weather_conditions_summary"), // Average weather during growing season
  soilConditions: jsonb("soil_conditions"), // Soil health metrics
  diseaseIncidents: jsonb("disease_incidents"), // Disease/pest data
  varietyInfo: text("variety_info"), // Crop variety details
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const environmentalConditions = pgTable("environmental_conditions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmerId: varchar("farmer_id").references(() => farmers.id).notNull(),
  recordDate: timestamp("record_date").notNull(),
  soilMoisture: decimal("soil_moisture", { precision: 5, scale: 2 }), // percentage
  soilTemperature: decimal("soil_temperature", { precision: 5, scale: 2 }), // degrees F
  soilPh: decimal("soil_ph", { precision: 3, scale: 1 }), // pH level
  nutrientLevels: jsonb("nutrient_levels"), // N, P, K, other nutrients
  leafWetness: decimal("leaf_wetness", { precision: 5, scale: 2 }), // percentage
  lightIntensity: decimal("light_intensity", { precision: 8, scale: 2 }), // PAR or lux
  vpdLevel: decimal("vpd_level", { precision: 5, scale: 2 }), // vapor pressure deficit
  fieldCapacity: decimal("field_capacity", { precision: 5, scale: 2 }), // percentage
  stressIndicators: jsonb("stress_indicators"), // Plant stress signals
  createdAt: timestamp("created_at").defaultNow(),
});

export const performanceMetrics = pgTable("performance_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  farmerId: varchar("farmer_id").references(() => farmers.id).notNull(),
  cropId: varchar("crop_id").references(() => crops.id),
  metricType: text("metric_type").notNull(), // "water_efficiency", "yield_consistency", "cost_effectiveness"
  value: decimal("value", { precision: 10, scale: 4 }).notNull(),
  unit: text("unit").notNull(),
  benchmarkValue: decimal("benchmark_value", { precision: 10, scale: 4 }), // Industry/regional benchmark
  comparisonPeriod: text("comparison_period").notNull(), // "season", "year", "multi_year"
  factors: jsonb("factors"), // Contributing factors for this metric
  calculationDate: timestamp("calculation_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cropPrices = pgTable("crop_prices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commodity: text("commodity").notNull(), // "corn", "wheat", "soybeans", "rice", etc.
  commoditySymbol: text("commodity_symbol").notNull(), // API symbol like "CORN", "WHEAT"
  localPrice: decimal("local_price", { precision: 10, scale: 2 }), // Local market price per unit
  internationalPrice: decimal("international_price", { precision: 10, scale: 2 }), // International market price per unit
  unit: text("unit").notNull(), // "bushel", "ton", "cwt"
  currency: text("currency").notNull().default("USD"), // Price currency
  region: text("region").notNull(), // Local region for local pricing
  exchange: text("exchange"), // Market exchange (CME, CBOT, etc.)
  priceDate: timestamp("price_date").notNull(), // When the price was recorded
  priceChangePercent: decimal("price_change_percent", { precision: 6, scale: 3 }), // Daily change percentage
  high52Week: decimal("high_52_week", { precision: 10, scale: 2 }), // 52-week high
  low52Week: decimal("low_52_week", { precision: 10, scale: 2 }), // 52-week low
  volume: decimal("volume", { precision: 15, scale: 2 }), // Trading volume
  marketData: jsonb("market_data"), // Additional market information
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const farmersRelations = relations(farmers, ({ many }) => ({
  crops: many(crops),
  waterAllocations: many(waterAllocations),
  complianceRecords: many(complianceRecords),
  alerts: many(alerts),
  environmentalConditions: many(environmentalConditions),
  performanceMetrics: many(performanceMetrics),
}));

export const cropsRelations = relations(crops, ({ one, many }) => ({
  farmer: one(farmers, {
    fields: [crops.farmerId],
    references: [farmers.id],
  }),
  irrigationLogs: many(irrigationLogs),
  recommendations: many(irrigationRecommendations),
  cropYields: many(cropYields),
}));

export const cropYieldsRelations = relations(cropYields, ({ one }) => ({
  crop: one(crops, {
    fields: [cropYields.cropId],
    references: [crops.id],
  }),
}));

export const environmentalConditionsRelations = relations(environmentalConditions, ({ one }) => ({
  farmer: one(farmers, {
    fields: [environmentalConditions.farmerId],
    references: [farmers.id],
  }),
}));

export const performanceMetricsRelations = relations(performanceMetrics, ({ one }) => ({
  farmer: one(farmers, {
    fields: [performanceMetrics.farmerId],
    references: [farmers.id],
  }),
  crop: one(crops, {
    fields: [performanceMetrics.cropId],
    references: [crops.id],
  }),
}));

export const irrigationLogsRelations = relations(irrigationLogs, ({ one }) => ({
  crop: one(crops, {
    fields: [irrigationLogs.cropId],
    references: [crops.id],
  }),
}));

export const waterAllocationsRelations = relations(waterAllocations, ({ one }) => ({
  farmer: one(farmers, {
    fields: [waterAllocations.farmerId],
    references: [farmers.id],
  }),
}));

export const complianceRecordsRelations = relations(complianceRecords, ({ one }) => ({
  farmer: one(farmers, {
    fields: [complianceRecords.farmerId],
    references: [farmers.id],
  }),
}));

export const irrigationRecommendationsRelations = relations(irrigationRecommendations, ({ one }) => ({
  crop: one(crops, {
    fields: [irrigationRecommendations.cropId],
    references: [crops.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  farmer: one(farmers, {
    fields: [alerts.farmerId],
    references: [farmers.id],
  }),
}));

// Insert schemas
export const insertFarmerSchema = createInsertSchema(farmers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCropSchema = createInsertSchema(crops).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIrrigationLogSchema = createInsertSchema(irrigationLogs).omit({
  id: true,
  createdAt: true,
});

export const insertWeatherDataSchema = createInsertSchema(weatherData).omit({
  id: true,
  createdAt: true,
});

export const insertWaterAllocationSchema = createInsertSchema(waterAllocations).omit({
  id: true,
  createdAt: true,
});

export const insertComplianceRecordSchema = createInsertSchema(complianceRecords).omit({
  id: true,
  createdAt: true,
});

export const insertIrrigationRecommendationSchema = createInsertSchema(irrigationRecommendations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export const insertCropYieldSchema = createInsertSchema(cropYields).omit({
  id: true,
  createdAt: true,
});

export const insertEnvironmentalConditionsSchema = createInsertSchema(environmentalConditions).omit({
  id: true,
  createdAt: true,
});

export const insertPerformanceMetricsSchema = createInsertSchema(performanceMetrics).omit({
  id: true,
  createdAt: true,
});

export const insertCropPricesSchema = createInsertSchema(cropPrices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Farmer = typeof farmers.$inferSelect;
export type InsertFarmer = z.infer<typeof insertFarmerSchema>;
export type Crop = typeof crops.$inferSelect;
export type InsertCrop = z.infer<typeof insertCropSchema>;
export type IrrigationLog = typeof irrigationLogs.$inferSelect;
export type InsertIrrigationLog = z.infer<typeof insertIrrigationLogSchema>;
export type WeatherData = typeof weatherData.$inferSelect;
export type InsertWeatherData = z.infer<typeof insertWeatherDataSchema>;
export type WaterAllocation = typeof waterAllocations.$inferSelect;
export type InsertWaterAllocation = z.infer<typeof insertWaterAllocationSchema>;
export type ComplianceRecord = typeof complianceRecords.$inferSelect;
export type InsertComplianceRecord = z.infer<typeof insertComplianceRecordSchema>;
export type IrrigationRecommendation = typeof irrigationRecommendations.$inferSelect;
export type InsertIrrigationRecommendation = z.infer<typeof insertIrrigationRecommendationSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type CropYield = typeof cropYields.$inferSelect;
export type InsertCropYield = z.infer<typeof insertCropYieldSchema>;
export type EnvironmentalConditions = typeof environmentalConditions.$inferSelect;
export type InsertEnvironmentalConditions = z.infer<typeof insertEnvironmentalConditionsSchema>;
export type PerformanceMetrics = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetrics = z.infer<typeof insertPerformanceMetricsSchema>;
export type CropPrices = typeof cropPrices.$inferSelect;
export type InsertCropPrices = z.infer<typeof insertCropPricesSchema>;
