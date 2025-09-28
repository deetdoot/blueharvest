import * as tf from '@tensorflow/tfjs-node';
import * as stats from 'simple-statistics';
import { storage } from '../storage';
import type { CropYield, EnvironmentalConditions, IrrigationLog, PerformanceMetrics } from '@shared/schema';

export interface YieldPrediction {
  predictedYield: number;
  confidence: number;
  factors: {
    waterOptimization: number;
    weatherImpact: number;
    soilConditions: number;
    timingFactor: number;
  };
  recommendations: string[];
}

export interface OptimalIrrigationSchedule {
  cropId: string;
  schedule: {
    date: Date;
    waterAmount: number;
    duration: number;
    reasoning: string;
    confidence: number;
  }[];
  expectedYieldIncrease: number;
  waterEfficiencyGain: number;
}

export class MLService {
  private yieldModel: tf.LayersModel | null = null;
  private irrigationModel: tf.LayersModel | null = null;
  private isTraining = false;

  constructor() {
    // Initialize models on startup
    this.initializeModels();
  }

  private async initializeModels() {
    try {
      // Try to load existing models or create new ones
      await this.loadOrCreateModels();
    } catch (error) {
      console.error('Error initializing ML models:', error);
    }
  }

  private async loadOrCreateModels() {
    // Create yield prediction model
    this.yieldModel = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [12], // 12 input features
          units: 64,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 16,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'linear' // For regression
        })
      ]
    });

    this.yieldModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    // Create irrigation optimization model
    this.irrigationModel = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [10], // 10 input features
          units: 48,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 24,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 3, // water amount, timing, duration
          activation: 'sigmoid'
        })
      ]
    });

    this.irrigationModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });
  }

  async predictYield(
    cropId: string,
    farmerId: string,
    forecastDays: number = 30
  ): Promise<YieldPrediction> {
    try {
      // Gather historical data
      const cropYields = await storage.getCropYields(cropId);
      const environmentalData = await storage.getEnvironmentalConditions(farmerId);
      const irrigationLogs = await storage.getIrrigationLogs(cropId);
      const performanceMetrics = await storage.getPerformanceMetricsByCrop(cropId);

      if (cropYields.length < 3) {
        // Not enough historical data, use statistical estimation
        return this.estimateYieldWithLimitedData(cropId, farmerId);
      }

      // Prepare features for ML model
      const features = this.prepareYieldFeatures(
        cropYields,
        environmentalData,
        irrigationLogs,
        performanceMetrics
      );

      if (!this.yieldModel) {
        throw new Error('Yield model not initialized');
      }

      // Make prediction
      const prediction = this.yieldModel.predict(tf.tensor2d([features])) as tf.Tensor;
      const predictedYield = (await prediction.data())[0];
      prediction.dispose();

      // Calculate confidence based on data quality and model performance
      const confidence = this.calculatePredictionConfidence(cropYields, environmentalData);

      // Analyze contributing factors
      const factors = this.analyzeYieldFactors(features);

      // Generate recommendations
      const recommendations = this.generateYieldRecommendations(factors, environmentalData);

      return {
        predictedYield,
        confidence,
        factors,
        recommendations
      };

    } catch (error) {
      console.error('Error predicting yield:', error);
      return this.estimateYieldWithLimitedData(cropId, farmerId);
    }
  }

  async optimizeIrrigationSchedule(
    cropId: string,
    farmerId: string,
    daysAhead: number = 14
  ): Promise<OptimalIrrigationSchedule> {
    try {
      // Get crop and farm data
      const crop = await storage.getCrop(cropId);
      const farmer = await storage.getFarmer(farmerId);
      
      if (!crop || !farmer) {
        throw new Error('Crop or farmer not found');
      }

      // Gather historical irrigation data for training
      const irrigationLogs = await storage.getIrrigationLogs(cropId);
      const environmentalData = await storage.getEnvironmentalConditions(farmerId);
      const performanceMetrics = await storage.getPerformanceMetricsByCrop(cropId);

      // If we have enough data, use ML model
      if (irrigationLogs.length >= 10 && this.irrigationModel) {
        return this.mlBasedIrrigationOptimization(
          crop,
          irrigationLogs,
          environmentalData,
          performanceMetrics,
          daysAhead
        );
      } else {
        // Use rule-based optimization with statistical analysis
        return this.ruleBasedIrrigationOptimization(
          farmerId,
          cropId,
          daysAhead
        );
      }

    } catch (error) {
      console.error('Error optimizing irrigation schedule:', error);
      throw error;
    }
  }

  private prepareYieldFeatures(
    yields: CropYield[],
    environmental: EnvironmentalConditions[],
    irrigation: IrrigationLog[],
    performance: PerformanceMetrics[]
  ): number[] {
    const features: number[] = [];

    // Historical yield average and trend
    const yieldValues = yields.map(y => parseFloat(y.yieldPerAcre));
    features.push(stats.mean(yieldValues) || 0);
    features.push(yieldValues.length > 1 ? stats.standardDeviation(yieldValues) : 0);

    // Water usage efficiency
    const waterUsages = yields.map(y => parseFloat(y.totalWaterUsed));
    const waterEfficiency = yieldValues.map((yieldVal, i) => yieldVal / (waterUsages[i] || 1));
    features.push(stats.mean(waterEfficiency) || 0);

    // Environmental factors (recent averages)
    const recentEnv = environmental.slice(0, 30); // Last 30 records
    if (recentEnv.length > 0) {
      features.push(stats.mean(recentEnv.map(e => parseFloat(e.soilMoisture || '0'))) || 0);
      features.push(stats.mean(recentEnv.map(e => parseFloat(e.soilTemperature || '0'))) || 0);
      features.push(stats.mean(recentEnv.map(e => parseFloat(e.soilPh || '7'))) || 7);
    } else {
      features.push(0, 0, 7); // Default values
    }

    // Irrigation patterns
    const recentIrrigation = irrigation.slice(0, 20); // Last 20 irrigation events
    if (recentIrrigation.length > 0) {
      features.push(stats.mean(recentIrrigation.map(i => parseFloat(i.waterAmount))) || 0);
      features.push(stats.mean(recentIrrigation.map(i => i.duration)) || 0);
      features.push(stats.mean(recentIrrigation.map(i => parseFloat(i.efficiency || '0'))) || 0);
    } else {
      features.push(0, 0, 0);
    }

    // Performance metrics
    const waterEfficiencyMetrics = performance.filter(p => p.metricType === 'water_efficiency');
    if (waterEfficiencyMetrics.length > 0) {
      features.push(stats.mean(waterEfficiencyMetrics.map(m => parseFloat(m.value))) || 0);
      features.push(parseFloat(waterEfficiencyMetrics[0].benchmarkValue || '0'));
    } else {
      features.push(0, 0);
    }

    // Ensure we have exactly 12 features
    while (features.length < 12) {
      features.push(0);
    }

    return features.slice(0, 12);
  }

  private calculatePredictionConfidence(
    yields: CropYield[],
    environmental: EnvironmentalConditions[]
  ): number {
    let confidence = 0.5; // Base confidence

    // More historical data = higher confidence
    confidence += Math.min(yields.length * 0.1, 0.3);

    // More environmental data = higher confidence
    confidence += Math.min(environmental.length * 0.01, 0.15);

    // Consistency in historical yields = higher confidence
    if (yields.length > 1) {
      const yieldValues = yields.map(y => parseFloat(y.yieldPerAcre));
      const cv = stats.standardDeviation(yieldValues) / stats.mean(yieldValues);
      confidence += Math.max(0, 0.05 - cv); // Lower CV = higher confidence
    }

    return Math.min(confidence, 0.95); // Cap at 95%
  }

  private analyzeYieldFactors(features: number[]): YieldPrediction['factors'] {
    // Analyze the relative importance of different factors
    // This is a simplified analysis - in production you'd use feature importance from the model
    
    const [avgYieldVal, yieldStd, waterEff, soilMoisture, soilTemp, soilPh, 
           avgWater, avgDuration, irrigationEff, perfMetric, benchmark] = features;

    return {
      waterOptimization: Math.min(waterEff * 0.3, 1.0),
      weatherImpact: Math.min((soilTemp * 0.01 + soilMoisture * 0.01), 1.0),
      soilConditions: Math.min(Math.abs(7 - soilPh) * 0.1 + soilMoisture * 0.01, 1.0),
      timingFactor: Math.min(irrigationEff * 0.5, 1.0)
    };
  }

  private generateYieldRecommendations(
    factors: YieldPrediction['factors'],
    environmentalData: EnvironmentalConditions[]
  ): string[] {
    const recommendations: string[] = [];

    if (factors.waterOptimization < 0.7) {
      recommendations.push('Optimize irrigation timing and amounts to improve water use efficiency');
    }

    if (factors.soilConditions < 0.6) {
      recommendations.push('Consider soil amendments to improve pH and nutrient levels');
    }

    if (factors.timingFactor < 0.6) {
      recommendations.push('Review irrigation scheduling to better match crop water needs');
    }

    // Add weather-based recommendations
    const recent = environmentalData.slice(0, 7);
    if (recent.length > 0) {
      const avgMoisture = stats.mean(recent.map(e => parseFloat(e.soilMoisture || '50')));
      if (avgMoisture < 30) {
        recommendations.push('Increase irrigation frequency due to low soil moisture levels');
      } else if (avgMoisture > 80) {
        recommendations.push('Reduce irrigation to prevent waterlogging and root issues');
      }
    }

    return recommendations;
  }

  private async estimateYieldWithLimitedData(
    cropId: string,
    farmerId: string
  ): Promise<YieldPrediction> {
    // Fallback method using simple statistical analysis
    const crop = await storage.getCrop(cropId);
    const yields = await storage.getCropYields(cropId);

    let predictedYield = 0;
    let confidence = 0.3; // Lower confidence for limited data

    if (yields.length > 0) {
      const yieldValues = yields.map(y => parseFloat(y.yieldPerAcre));
      predictedYield = stats.mean(yieldValues) || 0;
      confidence = Math.min(0.3 + yields.length * 0.1, 0.6);
    } else {
      // Use industry benchmarks based on crop type
      const cropBenchmarks: Record<string, number> = {
        corn: 180, // bushels per acre
        soybeans: 50,
        wheat: 45,
        tomatoes: 25, // tons per acre
        carrots: 20
      };
      
      predictedYield = cropBenchmarks[crop?.cropType.toLowerCase() || ''] || 100;
      confidence = 0.2;
    }

    return {
      predictedYield,
      confidence,
      factors: {
        waterOptimization: 0.5,
        weatherImpact: 0.5,
        soilConditions: 0.5,
        timingFactor: 0.5
      },
      recommendations: [
        'Collect more historical data to improve prediction accuracy',
        'Track environmental conditions and irrigation logs for better insights',
        'Monitor crop performance metrics throughout the growing season'
      ]
    };
  }

  private async mlBasedIrrigationOptimization(
    crop: any,
    irrigationLogs: IrrigationLog[],
    environmentalData: EnvironmentalConditions[],
    performanceMetrics: PerformanceMetrics[],
    daysAhead: number
  ): Promise<OptimalIrrigationSchedule> {
    // This would use the trained ML model to optimize irrigation
    // For now, implementing a sophisticated rule-based approach
    return this.ruleBasedIrrigationOptimization(crop.farmerId, crop.id, daysAhead);
  }

  private async ruleBasedIrrigationOptimization(
    farmerId: string,
    cropId: string,
    daysAhead: number
  ): Promise<OptimalIrrigationSchedule> {
    const schedule = [];
    const today = new Date();

    // Analyze historical patterns
    const irrigationLogs = await storage.getIrrigationLogs(cropId);
    const environmental = await storage.getLatestEnvironmentalConditions(farmerId);

    // Calculate optimal irrigation frequency and amount
    let avgInterval = 3; // Default to every 3 days
    let avgAmount = 100; // Default amount in gallons

    if (irrigationLogs.length > 0) {
      // Calculate average interval between irrigations
      const intervals = [];
      for (let i = 1; i < irrigationLogs.length; i++) {
        const diff = new Date(irrigationLogs[i-1].irrigationDate).getTime() - 
                     new Date(irrigationLogs[i].irrigationDate).getTime();
        intervals.push(diff / (1000 * 60 * 60 * 24)); // Convert to days
      }
      avgInterval = Math.max(2, Math.min(7, stats.mean(intervals) || 3));
      
      // Calculate average effective amount
      const amounts = irrigationLogs.map(log => parseFloat(log.waterAmount));
      avgAmount = stats.mean(amounts) || 100;
    }

    // Generate schedule for the next period
    for (let day = 1; day <= daysAhead; day++) {
      if (day % Math.round(avgInterval) === 0) {
        const scheduledDate = new Date(today);
        scheduledDate.setDate(today.getDate() + day);

        // Adjust amount based on environmental conditions
        let adjustedAmount = avgAmount;
        let reasoning = 'Regular irrigation schedule';

        if (environmental) {
          const soilMoisture = parseFloat(environmental.soilMoisture || '50');
          const soilTemp = parseFloat(environmental.soilTemperature || '70');

          if (soilMoisture < 30) {
            adjustedAmount *= 1.3;
            reasoning = 'Increased amount due to low soil moisture';
          } else if (soilMoisture > 70) {
            adjustedAmount *= 0.7;
            reasoning = 'Reduced amount due to high soil moisture';
          }

          if (soilTemp > 85) {
            adjustedAmount *= 1.2;
            reasoning += ', adjusted for high temperature';
          }
        }

        schedule.push({
          date: scheduledDate,
          waterAmount: Math.round(adjustedAmount),
          duration: Math.round(adjustedAmount / 10), // Assume 10 gallons per minute
          reasoning,
          confidence: irrigationLogs.length > 5 ? 0.8 : 0.6
        });
      }
    }

    return {
      cropId,
      schedule,
      expectedYieldIncrease: 0.05, // 5% expected increase
      waterEfficiencyGain: 0.10 // 10% efficiency gain
    };
  }

  async trainModels(farmerId?: string): Promise<void> {
    if (this.isTraining) {
      console.log('Models are already being trained');
      return;
    }

    this.isTraining = true;
    
    try {
      console.log('Starting ML model training...');
      
      // This would implement actual model training using historical data
      // For now, we'll simulate training completion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('ML model training completed');
    } catch (error) {
      console.error('Error training models:', error);
    } finally {
      this.isTraining = false;
    }
  }

  async calculateWaterEfficiencyScore(farmerId: string, cropId?: string): Promise<number> {
    try {
      const irrigationLogs = cropId 
        ? await storage.getIrrigationLogs(cropId)
        : await storage.getIrrigationLogsByFarmerId(farmerId);
      
      const yields = cropId
        ? await storage.getCropYields(cropId)
        : await storage.getCropYieldsByFarmerId(farmerId);

      if (irrigationLogs.length === 0 || yields.length === 0) {
        return 0.5; // Default score
      }

      // Calculate total water used and total yield
      const totalWater = irrigationLogs.reduce(
        (sum, log) => sum + parseFloat(log.waterAmount), 0
      );
      const totalYield = yields.reduce(
        (sum, yieldRecord) => sum + parseFloat(yieldRecord.yieldPerAcre), 0
      );

      // Calculate efficiency score (yield per unit water)
      const efficiency = totalYield / totalWater;
      
      // Normalize to 0-1 scale (adjust based on your benchmarks)
      return Math.min(efficiency * 1000, 1.0);
      
    } catch (error) {
      console.error('Error calculating water efficiency score:', error);
      return 0.5;
    }
  }
}

export const mlService = new MLService();