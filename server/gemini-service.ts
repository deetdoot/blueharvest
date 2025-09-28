import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface FarmData {
  waterUsage: number;
  alerts: Array<{ type: string; message: string; severity: string }>;
  marketPrices: Array<{ crop: string; price: number; trend: string }>;
  efficiencyScore: number;
  soilConditions: Array<{ field: string; moisture: number; ph: number; temperature: number }>;
  weatherData?: {
    temperature: number;
    humidity: number;
    rainfall: number;
  };
}

export async function generateFarmerSummary(data: FarmData): Promise<string> {
  try {
    const prompt = `You are an agricultural AI assistant helping farmers understand their irrigation and farm data in simple, everyday language. 

Here's the farm data:
- Daily Water Usage: ${data.waterUsage} gallons
- Active Alerts: ${data.alerts.map(alert => `${alert.type}: ${alert.message}`).join('; ')}
- Market Prices: ${data.marketPrices.map(price => `${price.crop}: $${price.price} (${price.trend})`).join('; ')}
- Water Efficiency Score: ${data.efficiencyScore}%
- Soil Conditions: ${data.soilConditions.map(soil => `${soil.field}: ${soil.moisture}% moisture, pH ${soil.ph}, ${soil.temperature}°F`).join('; ')}

Please provide a friendly, easy-to-understand summary for a farmer that:
1. Explains what the current situation means for their farm
2. Highlights any important alerts or concerns in simple terms
3. Gives practical advice about water usage and irrigation
4. Mentions market opportunities if relevant
5. Uses everyday language, not technical jargon
6. Keeps it conversational and helpful

Limit the response to about 150-200 words.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    return response.text || "Unable to generate summary at this time.";
  } catch (error) {
    console.error("Error generating farmer summary:", error);
    return "Unable to generate summary at this time. Please try again later.";
  }
}

export async function generateGovernmentSummary(data: FarmData): Promise<string> {
  try {
    const prompt = `You are an agricultural policy AI assistant providing technical insights for government officials and agricultural regulators.

Farm Operation Data Analysis:
- Daily Water Consumption: ${data.waterUsage} gallons
- Active System Alerts: ${data.alerts.map(alert => `${alert.type} (${alert.severity}): ${alert.message}`).join('; ')}
- Crop Market Indicators: ${data.marketPrices.map(price => `${price.crop}: $${price.price}/unit (${price.trend} trend)`).join('; ')}
- Water Use Efficiency Rating: ${data.efficiencyScore}%
- Soil Analysis: ${data.soilConditions.map(soil => `${soil.field}: Moisture ${soil.moisture}%, pH ${soil.ph}, Temperature ${soil.temperature}°F`).join('; ')}

Please provide a technical summary for government officials that includes:
1. Water usage efficiency assessment and regulatory compliance indicators
2. Analysis of any critical alerts that may require intervention
3. Market impact assessment and economic implications
4. Technical recommendations for resource management
5. Environmental sustainability indicators
6. Risk assessment for water resource management
7. Use professional agricultural and policy terminology

Limit the response to about 200-250 words and focus on actionable insights for policy makers.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    return response.text || "Unable to generate technical analysis at this time.";
  } catch (error) {
    console.error("Error generating government summary:", error);
    return "Unable to generate technical analysis at this time. Please try again later.";
  }
}

export interface FarmerChatContext {
  farmerName: string;
  farmName: string;
  location: string;
  crops: Array<{ cropType: string; fieldName: string; acres: string; growthStage: string }>;
  waterUsage: number;
  efficiencyScore: number;
  alerts: Array<{ type: string; message: string; severity: string }>;
  weatherData?: {
    temperature: number;
    humidity: number;
    rainfall: number;
  };
  recommendations: Array<{ type: string; message: string; priority: string }>;
}

export async function generateChatResponse(userMessage: string, context: FarmerChatContext): Promise<string> {
  try {
    const prompt = `You are a friendly, knowledgeable Smart Farm Assistant helping John Doe with his Green Valley Farm in ${context.location}. 

Your role is to provide personalized, practical advice about irrigation, crops, and farm management based on John's specific farm data. Always be conversational, supportive, and use simple language.

CURRENT FARM CONTEXT:
- Farm: ${context.farmName} (${context.location})
- Crops: ${context.crops.map(crop => `${crop.cropType} in ${crop.fieldName} (${crop.acres} acres, ${crop.growthStage} stage)`).join('; ')}
- Today's water usage: ${context.waterUsage} gallons
- Water efficiency score: ${context.efficiencyScore}%
- Active alerts: ${context.alerts.map(alert => `${alert.type}: ${alert.message}`).join('; ') || 'None'}
- Current weather: ${context.weatherData ? `${context.weatherData.temperature}°F, ${context.weatherData.humidity}% humidity` : 'Data unavailable'}
- Recent recommendations: ${context.recommendations.map(rec => `${rec.type}: ${rec.message}`).join('; ') || 'None'}

CONVERSATION GUIDELINES:
- Be warm, friendly, and encouraging
- Give specific, actionable advice based on John's actual farm data
- Reference specific crops, fields, and current conditions when relevant
- Use simple, everyday language - avoid technical jargon
- Keep responses conversational and focused (under 200 words)
- If asked about irrigation, consider the current weather, crop stages, and water efficiency
- If asked about weather, use the actual current conditions
- If asked general questions, relate answers back to John's specific farm situation
- Use **bold formatting** for important points or key recommendations

USER'S QUESTION: "${userMessage}"

Provide a helpful, personalized response that addresses their question using John's specific farm data:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    return response.text || "I'm having trouble processing your question right now. Could you try asking in a different way?";
  } catch (error) {
    console.error("Error generating chat response:", error);
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
}