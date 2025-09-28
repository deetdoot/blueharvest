import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WeatherService } from "./services/weatherService";
import { IrrigationService } from "./services/irrigationService";
import { EmailService } from "./services/emailService";
import { cropPricesService } from "./services/cropPricesService";
import { generateFarmerSummary, generateGovernmentSummary, generateChatResponse, type FarmerChatContext } from "./gemini-service";
import {
  insertFarmerSchema,
  insertCropSchema,
  insertIrrigationLogSchema,
  insertWaterAllocationSchema,
  insertComplianceRecordSchema,
  insertAlertSchema,
  insertIrrigationRecommendationSchema,
  insertCropYieldSchema,
  insertEnvironmentalConditionsSchema,
  insertPerformanceMetricsSchema,
  insertCropPricesSchema,
} from "@shared/schema";

// Seed comprehensive prototype data for demo
async function seedPrototypeData() {
  try {
    console.log("Checking prototype data...");
    
    // Get or create demo farmer
    let demoFarmer = await storage.getFarmerByEmail("john.doe@example.com");
    if (demoFarmer) {
      console.log("Prototype farmer already exists:", demoFarmer.id);
    } else {
      console.log("Creating prototype farmer...");
      demoFarmer = await storage.createFarmer({
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "(555) 123-4567",
        farmName: "Green Valley Farms",
        farmLocation: "Fresno, CA",
        latitude: "36.7783",
        longitude: "-119.4179",
        elevation: "90",
        totalAcres: "250",
        soilType: "Loam",
        irrigationMethod: "Drip",
      });
    }

    // Check if prototype data already exists to avoid duplicates
    const existingAlerts = await storage.getAlerts(demoFarmer.id);
    if (existingAlerts.length > 0) {
      console.log("Prototype data already seeded for farmer:", demoFarmer.id);
      return demoFarmer;
    }

    console.log("Creating comprehensive prototype data...");
    
    // Create multiple demo crops for variety
    const cornCrop = await storage.createCrop({
      farmerId: demoFarmer.id,
      cropType: "Corn",
      fieldName: "Field A",
      acres: "75",
      plantingDate: new Date("2024-04-15"),
      growthStage: "mature",
      waterRequirement: "1.2",
    });

    const wheatCrop = await storage.createCrop({
      farmerId: demoFarmer.id,
      cropType: "Wheat",
      fieldName: "Field B",
      acres: "100",
      plantingDate: new Date("2024-03-01"),
      growthStage: "harvested",
      waterRequirement: "0.8",
    });

    const soybeansACrop = await storage.createCrop({
      farmerId: demoFarmer.id,
      cropType: "Soybeans",
      fieldName: "Field C",
      acres: "75",
      plantingDate: new Date("2024-05-20"),
      growthStage: "flowering",
      waterRequirement: "1.0",
    });

    // Create water allocation
    await storage.createWaterAllocation({
      farmerId: demoFarmer.id,
      region: "Central Valley",
      monthlyAllocation: "200000",
      annualAllocation: "2400000",
      priorityLevel: "senior",
      restrictions: "None",
      validFrom: new Date("2024-01-01"),
      validTo: new Date("2024-12-31"),
    });

    // 1. Active Alerts - Heat wave warning and other alerts
    console.log("Adding active alerts...");
    await storage.createAlert({
      farmerId: demoFarmer.id,
      type: "weather",
      severity: "high",
      title: "Heat Wave Warning",
      message: "Extreme temperatures (105°F+) expected next week. Prepare irrigation systems and consider early morning watering to reduce crop stress.",
      isRead: false,
      actionRequired: true,
      metadata: {
        startDate: "2024-10-05",
        endDate: "2024-10-12",
        maxTemp: 108,
        recommendations: ["Increase irrigation frequency", "Apply mulch", "Check system pressure"]
      },
      expiresAt: new Date("2024-10-15"),
    });

    await storage.createAlert({
      farmerId: demoFarmer.id,
      type: "irrigation",
      severity: "medium",
      title: "Irrigation System Maintenance",
      message: "Quarterly maintenance due for drip irrigation system in Field A. Schedule inspection to maintain efficiency.",
      isRead: false,
      actionRequired: true,
      expiresAt: new Date("2024-11-01"),
    });

    await storage.createAlert({
      farmerId: demoFarmer.id,
      type: "compliance",
      severity: "low",
      title: "Water Usage Report Due",
      message: "Monthly water usage report due in 5 days. Current usage: 68% of allocation.",
      isRead: false,
      actionRequired: false,
      expiresAt: new Date("2024-10-30"),
    });

    // 2. Market Prices - Dummy crop prices
    console.log("Adding market prices...");
    const today = new Date();
    await storage.createCropPrices({
      commodity: "Corn",
      commoditySymbol: "CORN",
      localPrice: "6.85",
      internationalPrice: "6.92",
      unit: "bushel",
      currency: "USD",
      region: "Central Valley, CA",
      exchange: "CBOT",
      priceDate: today,
      priceChangePercent: "2.3",
      high52Week: "7.45",
      low52Week: "5.20",
      volume: "142500",
      marketData: {
        openPrice: 6.75,
        closePrice: 6.85,
        trend: "bullish",
        forecast: "steady"
      }
    });

    await storage.createCropPrices({
      commodity: "Wheat",
      commoditySymbol: "WHEAT",
      localPrice: "8.25",
      internationalPrice: "8.45",
      unit: "bushel",
      currency: "USD",
      region: "Central Valley, CA",
      exchange: "CBOT",
      priceDate: today,
      priceChangePercent: "-1.2",
      high52Week: "9.80",
      low52Week: "7.10",
      volume: "98700",
      marketData: {
        openPrice: 8.35,
        closePrice: 8.25,
        trend: "bearish",
        forecast: "declining"
      }
    });

    await storage.createCropPrices({
      commodity: "Soybeans",
      commoditySymbol: "SOYBEANS",
      localPrice: "13.75",
      internationalPrice: "13.90",
      unit: "bushel",
      currency: "USD",
      region: "Central Valley, CA",
      exchange: "CBOT",
      priceDate: today,
      priceChangePercent: "0.8",
      high52Week: "15.20",
      low52Week: "11.30",
      volume: "67800",
      marketData: {
        openPrice: 13.65,
        closePrice: 13.75,
        trend: "stable",
        forecast: "steady"
      }
    });

    // 3. AI-Powered Irrigation Recommendations
    console.log("Adding irrigation recommendations...");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    await storage.createIrrigationRecommendation({
      cropId: cornCrop.id,
      recommendedDate: tomorrow,
      waterAmount: "12500",
      duration: 180,
      priority: "high",
      reasoning: "Corn is in critical growth stage. Weather forecast shows no rain for 5 days. Soil moisture at 45% - below optimal range of 60-80%.",
      weatherFactors: {
        temperature: 89,
        humidity: 32,
        windSpeed: 8,
        precipitationProbability: 5,
        evapotranspiration: 0.28
      },
      status: "pending"
    });

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    await storage.createIrrigationRecommendation({
      cropId: soybeansACrop.id,
      recommendedDate: dayAfterTomorrow,
      waterAmount: "8750",
      duration: 120,
      priority: "medium",
      reasoning: "Soybeans in flowering stage require consistent moisture. Early morning irrigation recommended to reduce disease pressure.",
      weatherFactors: {
        temperature: 85,
        humidity: 38,
        windSpeed: 6,
        precipitationProbability: 15,
        evapotranspiration: 0.22
      },
      status: "pending"
    });

    // 4. Yield Trends & Performance - Historical crop yields
    console.log("Adding yield trends data...");
    const harvestDates = [
      new Date("2023-09-15"),
      new Date("2022-09-20"),
      new Date("2021-09-10"),
      new Date("2020-09-25")
    ];

    for (let i = 0; i < harvestDates.length; i++) {
      await storage.createCropYield({
        cropId: cornCrop.id,
        harvestDate: harvestDates[i],
        yieldPerAcre: (165 + Math.random() * 30).toFixed(2), // 165-195 bushels per acre
        qualityScore: (85 + Math.random() * 12).toFixed(2), // 85-97 quality score
        totalWaterUsed: (18000 + Math.random() * 4000).toFixed(2), // 18k-22k gallons
        totalFertilizerUsed: (280 + Math.random() * 40).toFixed(2), // 280-320 pounds
        totalCostPerAcre: (650 + Math.random() * 100).toFixed(2), // $650-750 per acre
        marketPrice: (6.20 + Math.random() * 1.5).toFixed(2), // $6.20-7.70 per bushel
        netProfitPerAcre: (450 + Math.random() * 200).toFixed(2), // $450-650 per acre
        weatherConditionsSummary: {
          avgTemperature: 78 + Math.random() * 8,
          totalPrecipitation: 12 + Math.random() * 8,
          growingDegreeDays: 2400 + Math.random() * 300
        },
        soilConditions: {
          ph: 6.8 + Math.random() * 0.6,
          organicMatter: 3.2 + Math.random() * 0.8,
          nitrogenLevel: "adequate"
        },
        varietyInfo: "Pioneer P1197",
        notes: i === 0 ? "Excellent season with optimal rainfall" : 
               i === 1 ? "Drought stress in August reduced yield" :
               i === 2 ? "Early frost affected late plantings" :
               "Strong performance despite hail damage"
      });
    }

    // 5. Water Efficiency Analytics - Performance metrics
    console.log("Adding water efficiency data...");
    const efficiencyDates = [
      new Date("2024-09-01"),
      new Date("2024-08-01"),
      new Date("2024-07-01"),
      new Date("2024-06-01")
    ];

    for (let i = 0; i < efficiencyDates.length; i++) {
      await storage.createPerformanceMetrics({
        farmerId: demoFarmer.id,
        cropId: cornCrop.id,
        metricType: "water_efficiency",
        value: (0.85 + Math.random() * 0.12).toFixed(4), // 0.85-0.97 efficiency
        unit: "yield_per_gallon",
        benchmarkValue: "0.89",
        comparisonPeriod: "monthly",
        factors: {
          irrigationMethod: "drip",
          soilType: "loam",
          weatherConditions: "favorable",
          cropStage: i === 0 ? "mature" : i === 1 ? "grain_filling" : i === 2 ? "tasseling" : "vegetative"
        },
        calculationDate: efficiencyDates[i]
      });
    }

    // 6. Soil Conditions - Environmental data
    console.log("Adding soil conditions data...");
    const soilDates = [
      new Date(),
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
    ];

    for (let i = 0; i < soilDates.length; i++) {
      await storage.createEnvironmentalConditions({
        farmerId: demoFarmer.id,
        recordDate: soilDates[i],
        soilMoisture: (55 + Math.random() * 25).toFixed(2), // 55-80% moisture
        soilTemperature: (72 + Math.random() * 12).toFixed(2), // 72-84°F
        soilPh: (6.5 + Math.random() * 1.0).toFixed(1), // 6.5-7.5 pH
        nutrientLevels: {
          nitrogen: Math.round(15 + Math.random() * 10), // 15-25 ppm
          phosphorus: Math.round(25 + Math.random() * 15), // 25-40 ppm
          potassium: Math.round(180 + Math.random() * 40), // 180-220 ppm
          organicMatter: (3.2 + Math.random() * 0.8).toFixed(1)
        },
        leafWetness: (10 + Math.random() * 20).toFixed(2), // 10-30%
        lightIntensity: (1800 + Math.random() * 400).toFixed(2), // 1800-2200 PAR
        vpdLevel: (1.2 + Math.random() * 0.8).toFixed(2), // 1.2-2.0 kPa
        fieldCapacity: (75 + Math.random() * 10).toFixed(2), // 75-85%
        stressIndicators: {
          waterStress: i > 2 ? "moderate" : "low",
          nutrientStress: "low",
          diseasePresence: Math.random() > 0.8 ? "detected" : "none"
        }
      });
    }

    // 7. Water Usage Analytics - Irrigation logs
    console.log("Adding water usage data...");
    const usageDates = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      usageDates.push(date);
    }

    for (let i = 0; i < usageDates.length; i++) {
      // Some days have multiple irrigation events
      const events = Math.random() > 0.6 ? 2 : 1;
      
      for (let j = 0; j < events; j++) {
        await storage.createIrrigationLog({
          cropId: Math.random() > 0.5 ? cornCrop.id : soybeansACrop.id,
          waterAmount: (3000 + Math.random() * 5000).toFixed(2), // 3k-8k gallons
          duration: Math.round(90 + Math.random() * 120), // 90-210 minutes
          irrigationDate: usageDates[i],
          method: "Drip",
          efficiency: (85 + Math.random() * 12).toFixed(2), // 85-97% efficiency
          notes: i < 5 ? "Automated schedule" : 
                 i < 15 ? "Manual override due to heat" :
                 Math.random() > 0.7 ? "Reduced due to rain forecast" : 
                 "Standard irrigation cycle"
        });
      }
    }

    console.log("Comprehensive prototype data seeded successfully:", demoFarmer.id);
    return demoFarmer;
  } catch (error) {
    console.warn("Failed to seed prototype data:", error);
    return null;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const weatherService = new WeatherService();
  const irrigationService = new IrrigationService();
  const emailService = new EmailService();

  // Seed prototype data
  await seedPrototypeData();

  // Farmer routes
  app.get("/api/farmers", async (req, res) => {
    try {
      const farmers = await storage.getAllFarmers();
      res.json(farmers);
    } catch (error) {
      console.error("Error fetching farmers:", error);
      res.status(500).json({ message: "Failed to fetch farmers" });
    }
  });

  app.get("/api/farmers/:id", async (req, res) => {
    try {
      const farmer = await storage.getFarmer(req.params.id);
      if (!farmer) {
        return res.status(404).json({ message: "Farmer not found" });
      }
      res.json(farmer);
    } catch (error) {
      console.error("Error fetching farmer:", error);
      res.status(500).json({ message: "Failed to fetch farmer" });
    }
  });

  app.post("/api/farmers", async (req, res) => {
    try {
      const farmerData = insertFarmerSchema.parse(req.body);
      const farmer = await storage.createFarmer(farmerData);
      res.status(201).json(farmer);
    } catch (error) {
      console.error("Error creating farmer:", error);
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          return res.status(409).json({ message: "Email already exists" });
        }
      }
      res.status(400).json({ message: "Invalid farmer data" });
    }
  });

  app.put("/api/farmers/:id", async (req, res) => {
    try {
      const farmerData = insertFarmerSchema.partial().parse(req.body);
      const farmer = await storage.updateFarmer(req.params.id, farmerData);
      res.json(farmer);
    } catch (error) {
      console.error("Error updating farmer:", error);
      res.status(400).json({ message: "Failed to update farmer" });
    }
  });

  // Crop routes
  app.get("/api/farmers/:farmerId/crops", async (req, res) => {
    try {
      const crops = await storage.getCropsByFarmerId(req.params.farmerId);
      res.json(crops);
    } catch (error) {
      console.error("Error fetching crops:", error);
      res.status(500).json({ message: "Failed to fetch crops" });
    }
  });

  app.post("/api/farmers/:farmerId/crops", async (req, res) => {
    try {
      const cropData = insertCropSchema.parse({
        ...req.body,
        farmerId: req.params.farmerId,
      });
      const crop = await storage.createCrop(cropData);
      res.status(201).json(crop);
    } catch (error) {
      console.error("Error creating crop:", error);
      res.status(400).json({ message: "Invalid crop data" });
    }
  });

  app.put("/api/crops/:id", async (req, res) => {
    try {
      const cropData = insertCropSchema.partial().parse(req.body);
      const crop = await storage.updateCrop(req.params.id, cropData);
      res.json(crop);
    } catch (error) {
      console.error("Error updating crop:", error);
      res.status(400).json({ message: "Failed to update crop" });
    }
  });

  // Weather routes
  app.get("/api/weather/:location", async (req, res) => {
    try {
      const location = decodeURIComponent(req.params.location);
      const weather = await weatherService.getCurrentWeather(location);
      res.json(weather);
    } catch (error) {
      console.error("Error fetching weather:", error);
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  app.get("/api/weather/:location/forecast", async (req, res) => {
    try {
      const location = decodeURIComponent(req.params.location);
      const forecast = await weatherService.getWeatherForecast(location);
      res.json(forecast);
    } catch (error) {
      console.error("Error fetching forecast:", error);
      res.status(500).json({ message: "Failed to fetch weather forecast" });
    }
  });

  // Irrigation routes
  app.get("/api/farmers/:farmerId/irrigation-logs", async (req, res) => {
    try {
      const logs = await storage.getIrrigationLogsByFarmerId(req.params.farmerId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching irrigation logs:", error);
      res.status(500).json({ message: "Failed to fetch irrigation logs" });
    }
  });

  app.post("/api/crops/:cropId/irrigation-logs", async (req, res) => {
    try {
      const logData = insertIrrigationLogSchema.parse({
        ...req.body,
        cropId: req.params.cropId,
      });
      const log = await storage.createIrrigationLog(logData);
      res.status(201).json(log);
    } catch (error) {
      console.error("Error creating irrigation log:", error);
      res.status(400).json({ message: "Invalid irrigation log data" });
    }
  });

  // Irrigation recommendations
  app.get("/api/farmers/:farmerId/recommendations", async (req, res) => {
    try {
      const recommendations = await storage.getRecommendationsByFarmerId(req.params.farmerId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  app.post("/api/farmers/:farmerId/recommendations/generate", async (req, res) => {
    try {
      const recommendations = await irrigationService.generateRecommendations(req.params.farmerId);
      
      // Send email notifications for high priority recommendations
      const farmer = await storage.getFarmer(req.params.farmerId);
      if (farmer && farmer.email) {
        for (const rec of recommendations) {
          if (rec.priority === 'high') {
            const crop = await storage.getCrop(rec.cropId);
            if (crop) {
              await emailService.sendIrrigationAlert(
                farmer.email,
                farmer.name,
                `${crop.fieldName} - ${crop.cropType}`,
                parseFloat(rec.waterAmount),
                new Date(rec.recommendedDate)
              );
            }
          }
        }
      }
      
      res.json(recommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  app.put("/api/recommendations/:id", async (req, res) => {
    try {
      const recommendation = await storage.updateIrrigationRecommendation(req.params.id, req.body);
      res.json(recommendation);
    } catch (error) {
      console.error("Error updating recommendation:", error);
      res.status(400).json({ message: "Failed to update recommendation" });
    }
  });

  // Water allocation routes
  app.get("/api/farmers/:farmerId/water-allocation", async (req, res) => {
    try {
      const allocation = await storage.getWaterAllocation(req.params.farmerId);
      res.json(allocation);
    } catch (error) {
      console.error("Error fetching water allocation:", error);
      res.status(500).json({ message: "Failed to fetch water allocation" });
    }
  });

  app.post("/api/farmers/:farmerId/water-allocation", async (req, res) => {
    try {
      const allocationData = insertWaterAllocationSchema.parse({
        ...req.body,
        farmerId: req.params.farmerId,
      });
      const allocation = await storage.createWaterAllocation(allocationData);
      res.status(201).json(allocation);
    } catch (error) {
      console.error("Error creating water allocation:", error);
      res.status(400).json({ message: "Invalid water allocation data" });
    }
  });

  // Analytics routes
  app.get("/api/farmers/:farmerId/water-usage", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();
      
      const totalUsage = await storage.getTotalWaterUsage(req.params.farmerId, start, end);
      const efficiency = await irrigationService.calculateWaterEfficiency(req.params.farmerId, start, end);
      
      res.json({
        totalUsage,
        efficiency,
        period: { start, end },
      });
    } catch (error) {
      console.error("Error fetching water usage:", error);
      res.status(500).json({ message: "Failed to fetch water usage data" });
    }
  });

  // Alert routes
  app.get("/api/farmers/:farmerId/alerts", async (req, res) => {
    try {
      const alerts = await storage.getAlerts(req.params.farmerId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.get("/api/farmers/:farmerId/alerts/unread", async (req, res) => {
    try {
      const alerts = await storage.getUnreadAlerts(req.params.farmerId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching unread alerts:", error);
      res.status(500).json({ message: "Failed to fetch unread alerts" });
    }
  });

  app.post("/api/farmers/:farmerId/alerts", async (req, res) => {
    try {
      const alertData = insertAlertSchema.parse({
        ...req.body,
        farmerId: req.params.farmerId,
      });
      const alert = await storage.createAlert(alertData);
      res.status(201).json(alert);
    } catch (error) {
      console.error("Error creating alert:", error);
      res.status(400).json({ message: "Invalid alert data" });
    }
  });

  app.put("/api/alerts/:id/read", async (req, res) => {
    try {
      const alert = await storage.markAlertAsRead(req.params.id);
      res.json(alert);
    } catch (error) {
      console.error("Error marking alert as read:", error);
      res.status(500).json({ message: "Failed to mark alert as read" });
    }
  });

  // Government dashboard routes
  app.get("/api/government/regional-usage", async (req, res) => {
    try {
      const regionalUsage = await storage.getRegionalWaterUsage();
      res.json(regionalUsage);
    } catch (error) {
      console.error("Error fetching regional usage:", error);
      res.status(500).json({ message: "Failed to fetch regional water usage" });
    }
  });

  app.get("/api/government/compliance-stats", async (req, res) => {
    try {
      const stats = await storage.getComplianceStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching compliance stats:", error);
      res.status(500).json({ message: "Failed to fetch compliance statistics" });
    }
  });

  app.get("/api/government/compliance-records", async (req, res) => {
    try {
      const records = await storage.getAllComplianceRecords();
      res.json(records);
    } catch (error) {
      console.error("Error fetching compliance records:", error);
      res.status(500).json({ message: "Failed to fetch compliance records" });
    }
  });

  app.post("/api/farmers/:farmerId/compliance-records", async (req, res) => {
    try {
      const recordData = insertComplianceRecordSchema.parse({
        ...req.body,
        farmerId: req.params.farmerId,
      });
      const record = await storage.createComplianceRecord(recordData);
      
      // Send compliance alert if violation
      if (record.complianceStatus === 'violation' || record.complianceStatus === 'warning') {
        const farmer = await storage.getFarmer(req.params.farmerId);
        if (farmer && farmer.email) {
          await emailService.sendComplianceAlert(
            farmer.email,
            farmer.name,
            record.complianceStatus === 'violation' ? 'Water Usage Violation' : 'Water Usage Warning',
            record.violations || 'Please review your water usage patterns.'
          );
        }
      }
      
      res.status(201).json(record);
    } catch (error) {
      console.error("Error creating compliance record:", error);
      res.status(400).json({ message: "Invalid compliance record data" });
    }
  });

  // Machine Learning API routes
  app.get("/api/farmers/:farmerId/crops/:cropId/yield-prediction", async (req, res) => {
    try {
      const { farmerId, cropId } = req.params;
      const { mlService } = await import('./services/mlService');
      
      const prediction = await mlService.predictYield(cropId, farmerId);
      res.json(prediction);
    } catch (error) {
      console.error("Error generating yield prediction:", error);
      res.status(500).json({ message: "Failed to generate yield prediction" });
    }
  });

  app.get("/api/farmers/:farmerId/crops/:cropId/optimize-irrigation", async (req, res) => {
    try {
      const { farmerId, cropId } = req.params;
      const daysAhead = parseInt(req.query.days as string) || 14;
      const { mlService } = await import('./services/mlService');
      
      const schedule = await mlService.optimizeIrrigationSchedule(cropId, farmerId, daysAhead);
      res.json(schedule);
    } catch (error) {
      console.error("Error optimizing irrigation schedule:", error);
      res.status(500).json({ message: "Failed to optimize irrigation schedule" });
    }
  });

  app.get("/api/farmers/:farmerId/water-efficiency-score", async (req, res) => {
    try {
      const { farmerId } = req.params;
      const cropId = req.query.cropId as string;
      const { mlService } = await import('./services/mlService');
      
      const score = await mlService.calculateWaterEfficiencyScore(farmerId, cropId);
      res.json({ efficiency_score: score });
    } catch (error) {
      console.error("Error calculating water efficiency score:", error);
      res.status(500).json({ message: "Failed to calculate water efficiency score" });
    }
  });

  app.post("/api/farmers/:farmerId/train-models", async (req, res) => {
    try {
      const { farmerId } = req.params;
      const { mlService } = await import('./services/mlService');
      
      // Start training in background
      mlService.trainModels(farmerId).catch(error => {
        console.error("Model training failed:", error);
      });
      
      res.json({ message: "Model training started" });
    } catch (error) {
      console.error("Error starting model training:", error);
      res.status(500).json({ message: "Failed to start model training" });
    }
  });

  // Historical data collection endpoints
  app.post("/api/farmers/:farmerId/crops/:cropId/yield-data", async (req, res) => {
    try {
      const { insertCropYieldSchema } = await import('@shared/schema');
      const yieldData = insertCropYieldSchema.parse({
        ...req.body,
        cropId: req.params.cropId,
      });
      
      const newYield = await storage.createCropYield(yieldData);
      res.status(201).json(newYield);
    } catch (error) {
      console.error("Error creating crop yield data:", error);
      res.status(400).json({ message: "Invalid crop yield data" });
    }
  });

  app.post("/api/farmers/:farmerId/environmental-conditions", async (req, res) => {
    try {
      const { insertEnvironmentalConditionsSchema } = await import('@shared/schema');
      const conditionsData = insertEnvironmentalConditionsSchema.parse({
        ...req.body,
        farmerId: req.params.farmerId,
      });
      
      const newConditions = await storage.createEnvironmentalConditions(conditionsData);
      res.status(201).json(newConditions);
    } catch (error) {
      console.error("Error creating environmental conditions:", error);
      res.status(400).json({ message: "Invalid environmental conditions data" });
    }
  });

  app.post("/api/farmers/:farmerId/performance-metrics", async (req, res) => {
    try {
      const { insertPerformanceMetricsSchema } = await import('@shared/schema');
      const metricsData = insertPerformanceMetricsSchema.parse({
        ...req.body,
        farmerId: req.params.farmerId,
      });
      
      const newMetrics = await storage.createPerformanceMetrics(metricsData);
      res.status(201).json(newMetrics);
    } catch (error) {
      console.error("Error creating performance metrics:", error);
      res.status(400).json({ message: "Invalid performance metrics data" });
    }
  });

  app.get("/api/farmers/:farmerId/historical-data", async (req, res) => {
    try {
      const { farmerId } = req.params;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const [yields, environmental, metrics] = await Promise.all([
        storage.getCropYieldsByFarmerId(farmerId),
        storage.getEnvironmentalConditions(farmerId, startDate, endDate),
        storage.getPerformanceMetrics(farmerId)
      ]);
      
      res.json({
        yields,
        environmental_conditions: environmental,
        performance_metrics: metrics
      });
    } catch (error) {
      console.error("Error fetching historical data:", error);
      res.status(500).json({ message: "Failed to fetch historical data" });
    }
  });

  // Crop prices routes
  app.get("/api/farmers/:farmerId/crop-prices", async (req, res) => {
    try {
      const { farmerId } = req.params;
      const farmer = await storage.getFarmer(farmerId);
      if (!farmer) {
        return res.status(404).json({ message: "Farmer not found" });
      }

      const crops = await storage.getCropsByFarmerId(farmerId);
      const cropTypes = crops.map(crop => crop.cropType);

      const prices = await cropPricesService.getCropPricesForFarmer(
        farmer.farmLocation,
        cropTypes
      );

      res.json(prices);
    } catch (error) {
      console.error("Error fetching crop prices:", error);
      res.status(500).json({ message: "Failed to fetch crop prices" });
    }
  });

  app.get("/api/crop-prices/region/:region", async (req, res) => {
    try {
      const { region } = req.params;
      const commodities = req.query.commodities ? 
        (req.query.commodities as string).split(',') : 
        ["corn", "wheat", "soybeans", "rice", "cotton"];

      const prices = await cropPricesService.getCropPricesForRegion(region, commodities);
      res.json(prices);
    } catch (error) {
      console.error("Error fetching regional crop prices:", error);
      res.status(500).json({ message: "Failed to fetch regional crop prices" });
    }
  });

  app.get("/api/crop-prices/international", async (req, res) => {
    try {
      const commodities = req.query.commodities ? 
        (req.query.commodities as string).split(',') : 
        ["corn", "wheat", "soybeans", "rice", "cotton"];

      const prices = await cropPricesService.fetchInternationalPrices(commodities);
      res.json(prices);
    } catch (error) {
      console.error("Error fetching international crop prices:", error);
      res.status(500).json({ message: "Failed to fetch international crop prices" });
    }
  });

  // AI Summary routes
  app.get("/api/farmers/:farmerId/ai-summary/farmer", async (req, res) => {
    try {
      const farmerId = req.params.farmerId;
      
      // Gather all farm data for the AI summary
      const farmer = await storage.getFarmer(farmerId);
      if (!farmer) {
        return res.status(404).json({ message: "Farmer not found" });
      }

      const alerts = await storage.getAlerts(farmerId);
      const cropPrices = await storage.getAllCropPrices();
      const irrigationLogs = await storage.getIrrigationLogsByFarmerId(farmerId);
      const environmentalConditions = await storage.getEnvironmentalConditions(farmerId);
      const performanceMetrics = await storage.getPerformanceMetrics(farmerId);

      // Calculate daily water usage from recent logs
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      
      const recentLogs = irrigationLogs.filter(log => 
        new Date(log.irrigationDate) >= yesterday
      );
      const dailyWaterUsage = recentLogs.reduce((total, log) => 
        total + parseFloat(log.waterAmount), 0
      );

      // Get efficiency score from latest performance metrics
      const efficiencyMetrics = performanceMetrics.filter((m: any) => m.metricType === 'water_efficiency');
      const latestEfficiency = efficiencyMetrics.length > 0 ? 
        parseFloat(efficiencyMetrics[0].value) * 100 : 88;

      // Prepare data for AI
      const farmData = {
        waterUsage: Math.round(dailyWaterUsage),
        alerts: alerts.slice(0, 5).map(alert => ({
          type: alert.type,
          message: alert.message,
          severity: alert.severity
        })),
        marketPrices: cropPrices.slice(0, 3).map((price: any) => ({
          crop: price.commodity,
          price: parseFloat(price.localPrice),
          trend: price.marketData?.trend || 'stable'
        })),
        efficiencyScore: Math.round(latestEfficiency),
        soilConditions: environmentalConditions.slice(0, 3).map((env: any) => ({
          field: `Field ${env.id}`,
          moisture: parseFloat(env.soilMoisture),
          ph: parseFloat(env.soilPh),
          temperature: parseFloat(env.soilTemperature)
        }))
      };

      const summary = await generateFarmerSummary(farmData);
      res.json({ summary });
    } catch (error) {
      console.error("Error generating farmer summary:", error);
      res.status(500).json({ message: "Failed to generate summary" });
    }
  });

  app.get("/api/farmers/:farmerId/ai-summary/government", async (req, res) => {
    try {
      const farmerId = req.params.farmerId;
      
      // Gather all farm data for the AI summary
      const farmer = await storage.getFarmer(farmerId);
      if (!farmer) {
        return res.status(404).json({ message: "Farmer not found" });
      }

      const alerts = await storage.getAlerts(farmerId);
      const cropPrices = await storage.getAllCropPrices();
      const irrigationLogs = await storage.getIrrigationLogsByFarmerId(farmerId);
      const environmentalConditions = await storage.getEnvironmentalConditions(farmerId);
      const performanceMetrics = await storage.getPerformanceMetrics(farmerId);

      // Calculate daily water usage from recent logs
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      
      const recentLogs = irrigationLogs.filter(log => 
        new Date(log.irrigationDate) >= yesterday
      );
      const dailyWaterUsage = recentLogs.reduce((total, log) => 
        total + parseFloat(log.waterAmount), 0
      );

      // Get efficiency score from latest performance metrics
      const efficiencyMetrics = performanceMetrics.filter((m: any) => m.metricType === 'water_efficiency');
      const latestEfficiency = efficiencyMetrics.length > 0 ? 
        parseFloat(efficiencyMetrics[0].value) * 100 : 88;

      // Prepare data for AI
      const farmData = {
        waterUsage: Math.round(dailyWaterUsage),
        alerts: alerts.slice(0, 5).map(alert => ({
          type: alert.type,
          message: alert.message,
          severity: alert.severity
        })),
        marketPrices: cropPrices.slice(0, 3).map((price: any) => ({
          crop: price.commodity,
          price: parseFloat(price.localPrice),
          trend: price.marketData?.trend || 'stable'
        })),
        efficiencyScore: Math.round(latestEfficiency),
        soilConditions: environmentalConditions.slice(0, 3).map((env: any) => ({
          field: `Field ${env.id}`,
          moisture: parseFloat(env.soilMoisture),
          ph: parseFloat(env.soilPh),
          temperature: parseFloat(env.soilTemperature)
        }))
      };

      const summary = await generateGovernmentSummary(farmData);
      res.json({ summary });
    } catch (error) {
      console.error("Error generating government summary:", error);
      res.status(500).json({ message: "Failed to generate summary" });
    }
  });

  // Chat endpoint for Smart Assistant
  app.post("/api/farmers/:farmerId/chat", async (req, res) => {
    try {
      const farmerId = req.params.farmerId;
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      // Gather all farm data for chat context
      const farmer = await storage.getFarmer(farmerId);
      if (!farmer) {
        return res.status(404).json({ message: "Farmer not found" });
      }

      const [crops, alerts, recommendations, irrigationLogs, performanceMetrics] = await Promise.all([
        storage.getCropsByFarmerId(farmerId),
        storage.getAlerts(farmerId),
        storage.getRecommendationsByFarmerId(farmerId),
        storage.getIrrigationLogsByFarmerId(farmerId),
        storage.getPerformanceMetrics(farmerId)
      ]);

      // Get current weather
      const weatherService = new WeatherService();
      let weatherData;
      try {
        const weather = await weatherService.getCurrentWeather(farmer.farmLocation);
        weatherData = {
          temperature: Math.round(weather.temperature),
          humidity: Math.round(weather.humidity),
          rainfall: weather.precipitation || 0
        };
      } catch (weatherError) {
        console.warn("Could not fetch weather data for chat:", weatherError);
        weatherData = undefined;
      }

      // Calculate daily water usage from recent logs
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      
      const recentLogs = irrigationLogs.filter(log => 
        new Date(log.irrigationDate) >= yesterday
      );
      const dailyWaterUsage = recentLogs.reduce((total, log) => 
        total + parseFloat(log.waterAmount), 0
      );

      // Get efficiency score from latest performance metrics
      const efficiencyMetrics = performanceMetrics.filter((m: any) => m.metricType === 'water_efficiency');
      const latestEfficiency = efficiencyMetrics.length > 0 ? 
        parseFloat(efficiencyMetrics[0].value) * 100 : 88;

      // Prepare chat context
      const chatContext: FarmerChatContext = {
        farmerName: farmer.name,
        farmName: farmer.farmName,
        location: farmer.farmLocation,
        crops: crops.map(crop => ({
          cropType: crop.cropType,
          fieldName: crop.fieldName,
          acres: crop.acres,
          growthStage: crop.growthStage
        })),
        waterUsage: Math.round(dailyWaterUsage),
        efficiencyScore: Math.round(latestEfficiency),
        alerts: alerts.slice(0, 5).map(alert => ({
          type: alert.type,
          message: alert.message,
          severity: alert.severity
        })),
        weatherData,
        recommendations: recommendations.slice(0, 3).map(rec => ({
          type: 'irrigation',
          message: rec.reasoning,
          priority: rec.priority
        }))
      };

      // Generate AI response
      const response = await generateChatResponse(message, chatContext);
      res.json({ response });

    } catch (error) {
      console.error("Error in chat endpoint:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
