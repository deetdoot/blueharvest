import { storage } from '../storage';
import { WeatherService } from './weatherService';
import type { Crop, WeatherData, IrrigationRecommendation } from '@shared/schema';

export class IrrigationService {
  private weatherService: WeatherService;

  constructor() {
    this.weatherService = new WeatherService();
  }

  async generateRecommendations(farmerId: string): Promise<IrrigationRecommendation[]> {
    try {
      const crops = await storage.getCropsByFarmerId(farmerId);
      const recommendations: IrrigationRecommendation[] = [];

      for (const crop of crops) {
        const recommendation = await this.generateCropRecommendation(crop);
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating irrigation recommendations:', error);
      throw error;
    }
  }

  private async generateCropRecommendation(crop: Crop): Promise<IrrigationRecommendation | null> {
    try {
      // Get farmer's location to fetch weather data
      const farmer = await storage.getFarmer(crop.farmerId);
      if (!farmer) return null;

      // Get current weather and forecast
      const currentWeather = await this.weatherService.getCurrentWeather(farmer.farmLocation);
      const forecast = await this.weatherService.getWeatherForecast(farmer.farmLocation);

      // Calculate evapotranspiration using farm's location data
      const latitude = farmer.latitude ? parseFloat(farmer.latitude) : 36.7783; // Default to Central Valley, CA
      const elevation = farmer.elevation ? parseFloat(farmer.elevation) : 90; // Default elevation in meters
      
      const et = this.weatherService.calculateEvapotranspiration(
        currentWeather.temperature,
        currentWeather.humidity,
        currentWeather.windSpeed,
        currentWeather.uvIndex,
        latitude,
        elevation
      );

      // Get crop water requirements based on type and growth stage
      const cropWaterRequirement = this.getCropWaterRequirement(crop.cropType, crop.growthStage);
      
      // Calculate soil moisture depletion
      const dailyWaterNeed = cropWaterRequirement * et;
      
      // Check recent irrigation logs
      const recentLogs = await storage.getIrrigationLogs(crop.id);
      const lastIrrigation = recentLogs[0];
      
      const daysSinceLastIrrigation = lastIrrigation 
        ? Math.floor((Date.now() - new Date(lastIrrigation.irrigationDate).getTime()) / (1000 * 60 * 60 * 24))
        : 7;

      // Calculate water deficit
      const waterDeficit = dailyWaterNeed * daysSinceLastIrrigation;
      
      // Check forecast for rain
      const nextRain = forecast.find(day => day.precipitationProbability > 70);
      const daysUntilRain = nextRain 
        ? Math.floor((nextRain.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

      // Decision logic
      let shouldIrrigate = false;
      let priority = 'medium';
      let reasoning = '';
      let recommendedDate = new Date();
      let waterAmount = 0;

      if (waterDeficit > 0.5) { // More than 0.5 inches needed
        if (daysUntilRain && daysUntilRain <= 2 && nextRain) {
          // Skip if rain is coming within 2 days
          reasoning = `Soil moisture low but rain expected in ${daysUntilRain} days. Delaying irrigation.`;
          shouldIrrigate = false;
        } else {
          shouldIrrigate = true;
          waterAmount = waterDeficit;
          priority = waterDeficit > 1.0 ? 'high' : 'medium';
          
          // Schedule for early morning (6:30 AM) tomorrow if high priority, or optimize timing
          recommendedDate = new Date();
          if (priority === 'high') {
            recommendedDate.setDate(recommendedDate.getDate() + 1);
            recommendedDate.setHours(6, 30, 0, 0);
            reasoning = `Critical water deficit of ${waterDeficit.toFixed(2)} inches. Immediate irrigation required.`;
          } else {
            // Schedule for optimal time based on weather conditions
            const optimalHour = currentWeather.temperature > 80 ? 6 : 14; // Early morning if hot, afternoon if cooler
            recommendedDate.setHours(optimalHour, 0, 0, 0);
            reasoning = `Water deficit of ${waterDeficit.toFixed(2)} inches detected. Optimal irrigation timing based on current weather.`;
          }
        }
      } else {
        reasoning = 'Soil moisture adequate. No irrigation needed at this time.';
      }

      if (!shouldIrrigate) {
        return null; // Don't create recommendation if irrigation not needed
      }

      // Calculate irrigation duration based on flow rate (estimated)
      const flowRateGPM = this.getFlowRate(farmer.irrigationMethod);
      const totalGallons = waterAmount * parseFloat(crop.acres) * 27154; // Convert acre-inches to gallons
      const duration = Math.round(totalGallons / flowRateGPM);

      const recommendation = await storage.createIrrigationRecommendation({
        cropId: crop.id,
        recommendedDate,
        waterAmount: totalGallons.toString(),
        duration,
        priority,
        reasoning,
        weatherFactors: {
          currentTemperature: currentWeather.temperature,
          humidity: currentWeather.humidity,
          et: et,
          forecast: forecast.slice(0, 3), // Next 3 days
        },
      });

      return recommendation;
    } catch (error) {
      console.error('Error generating crop recommendation:', error);
      return null;
    }
  }

  private getCropWaterRequirement(cropType: string, growthStage: string): number {
    // Crop coefficient (Kc) values based on FAO-56 guidelines
    const cropCoefficients: Record<string, Record<string, number>> = {
      corn: {
        seedling: 0.3,
        vegetative: 0.7,
        flowering: 1.2,
        maturity: 0.6,
      },
      tomatoes: {
        seedling: 0.6,
        vegetative: 0.8,
        flowering: 1.15,
        maturity: 0.8,
      },
      wheat: {
        seedling: 0.4,
        vegetative: 0.7,
        flowering: 1.15,
        maturity: 0.4,
      },
      soybeans: {
        seedling: 0.5,
        vegetative: 0.75,
        flowering: 1.0,
        maturity: 0.75,
      },
      carrots: {
        seedling: 0.7,
        vegetative: 0.9,
        flowering: 1.05,
        maturity: 0.95,
      },
    };

    const crop = cropType.toLowerCase();
    const stage = growthStage.toLowerCase();
    
    return cropCoefficients[crop]?.[stage] || 0.8; // Default coefficient
  }

  private getFlowRate(irrigationMethod: string): number {
    // Estimated flow rates in gallons per minute
    const flowRates: Record<string, number> = {
      drip: 2,
      sprinkler: 15,
      flood: 50,
      pivot: 30,
      furrow: 25,
    };

    return flowRates[irrigationMethod.toLowerCase()] || 15;
  }

  async calculateWaterEfficiency(farmerId: string, startDate: Date, endDate: Date): Promise<number> {
    try {
      const crops = await storage.getCropsByFarmerId(farmerId);
      let totalWaterUsed = 0;
      let totalWaterNeeded = 0;

      for (const crop of crops) {
        const logs = await storage.getIrrigationLogs(crop.id);
        const relevantLogs = logs.filter(log => {
          const logDate = new Date(log.irrigationDate);
          return logDate >= startDate && logDate <= endDate;
        });

        // Sum actual water used
        const cropWaterUsed = relevantLogs.reduce((sum, log) => sum + parseFloat(log.waterAmount), 0);
        totalWaterUsed += cropWaterUsed;

        // Calculate theoretical water needed
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const dailyRequirement = this.getCropWaterRequirement(crop.cropType, crop.growthStage) * 0.25; // Assume 0.25" ET
        const cropWaterNeeded = dailyRequirement * days * parseFloat(crop.acres) * 27154; // Convert to gallons
        totalWaterNeeded += cropWaterNeeded;
      }

      // Calculate efficiency as (theoretical need / actual use) * 100
      if (totalWaterUsed === 0) return 100;
      return Math.min(100, (totalWaterNeeded / totalWaterUsed) * 100);
    } catch (error) {
      console.error('Error calculating water efficiency:', error);
      return 0;
    }
  }
}
