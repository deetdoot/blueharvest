interface CommodityPriceData {
  commodity: string;
  price: number;
  unit: string;
  change: number;
  change_percent: number;
  last_updated: string;
  high_52_week?: number;
  low_52_week?: number;
  volume?: number;
}

interface LocalRegionalPricing {
  region: string;
  commodity: string;
  price: number;
  unit: string;
  source: string;
  last_updated: string;
}

// Mock data for development - replace with real API calls
const MOCK_COMMODITY_DATA: Record<string, CommodityPriceData> = {
  "corn": {
    commodity: "Corn",
    price: 4.85,
    unit: "bushel",
    change: 0.12,
    change_percent: 2.54,
    last_updated: new Date().toISOString(),
    high_52_week: 6.95,
    low_52_week: 4.20,
    volume: 125000
  },
  "wheat": {
    commodity: "Wheat",
    price: 5.92,
    unit: "bushel",
    change: -0.08,
    change_percent: -1.33,
    last_updated: new Date().toISOString(),
    high_52_week: 8.15,
    low_52_week: 5.45,
    volume: 89000
  },
  "soybeans": {
    commodity: "Soybeans",
    price: 12.45,
    unit: "bushel",
    change: 0.25,
    change_percent: 2.05,
    last_updated: new Date().toISOString(),
    high_52_week: 15.20,
    low_52_week: 11.80,
    volume: 156000
  },
  "rice": {
    commodity: "Rice",
    price: 16.75,
    unit: "cwt",
    change: 0.45,
    change_percent: 2.76,
    last_updated: new Date().toISOString(),
    high_52_week: 19.50,
    low_52_week: 14.25,
    volume: 45000
  },
  "cotton": {
    commodity: "Cotton",
    price: 0.72,
    unit: "lb",
    change: -0.02,
    change_percent: -2.70,
    last_updated: new Date().toISOString(),
    high_52_week: 0.89,
    low_52_week: 0.65,
    volume: 78000
  }
};

// Mock regional pricing data for local markets
const MOCK_REGIONAL_DATA: Record<string, LocalRegionalPricing[]> = {
  "Fresno, CA": [
    {
      region: "Fresno, CA",
      commodity: "Corn",
      price: 4.92,
      unit: "bushel",
      source: "Central Valley Grain Exchange",
      last_updated: new Date().toISOString()
    },
    {
      region: "Fresno, CA",
      commodity: "Wheat",
      price: 6.05,
      unit: "bushel",
      source: "Central Valley Grain Exchange",
      last_updated: new Date().toISOString()
    },
    {
      region: "Fresno, CA",
      commodity: "Rice",
      price: 17.20,
      unit: "cwt",
      source: "California Rice Exchange",
      last_updated: new Date().toISOString()
    },
    {
      region: "Fresno, CA",
      commodity: "Cotton",
      price: 0.74,
      unit: "lb",
      source: "San Joaquin Valley Cotton Exchange",
      last_updated: new Date().toISOString()
    }
  ]
};

export class CropPricesService {
  private readonly API_NINJAS_BASE_URL = "https://api.api-ninjas.com/v1/commodityprice";
  private readonly API_KEY = process.env.API_NINJAS_KEY || null;

  /**
   * Fetches international commodity prices from API Ninjas
   */
  async fetchInternationalPrices(commodities: string[]): Promise<CommodityPriceData[]> {
    // For demo purposes, return mock data. Replace with actual API call when API key is available.
    if (!this.API_KEY) {
      console.log("API Ninjas key not found - using mock commodity price data for demo");
      return commodities.map(commodity => {
        const mockData = MOCK_COMMODITY_DATA[commodity.toLowerCase()];
        if (mockData) {
          return { ...mockData, commodity: commodity };
        }
        // Return default data for unknown commodities
        return {
          commodity: commodity,
          price: Math.random() * 10 + 5,
          unit: "bushel",
          change: (Math.random() - 0.5) * 0.5,
          change_percent: (Math.random() - 0.5) * 5,
          last_updated: new Date().toISOString()
        };
      });
    }

    const results: CommodityPriceData[] = [];
    
    try {
      for (const commodity of commodities) {
        const response = await fetch(`${this.API_NINJAS_BASE_URL}?commodity=${commodity}`, {
          headers: {
            'X-Api-Key': this.API_KEY
          }
        });

        if (response.ok) {
          const data = await response.json();
          results.push({
            commodity: commodity,
            price: data.price || 0,
            unit: data.unit || "unit",
            change: data.change || 0,
            change_percent: data.change_percent || 0,
            last_updated: new Date().toISOString(),
            high_52_week: data.high_52_week,
            low_52_week: data.low_52_week,
            volume: data.volume
          });
        } else {
          // Fallback to mock data if API fails
          const mockData = MOCK_COMMODITY_DATA[commodity.toLowerCase()];
          if (mockData) {
            results.push({ ...mockData, commodity: commodity });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching international commodity prices:", error);
      // Return mock data as fallback
      return commodities.map(commodity => {
        const mockData = MOCK_COMMODITY_DATA[commodity.toLowerCase()];
        return mockData ? { ...mockData, commodity: commodity } : {
          commodity: commodity,
          price: 0,
          unit: "unit",
          change: 0,
          change_percent: 0,
          last_updated: new Date().toISOString()
        };
      });
    }

    return results;
  }

  /**
   * Fetches local/regional commodity prices
   */
  async fetchLocalPrices(region: string, commodities: string[]): Promise<LocalRegionalPricing[]> {
    // For demo purposes, return mock regional data
    const regionalData = MOCK_REGIONAL_DATA[region] || MOCK_REGIONAL_DATA["Fresno, CA"];
    
    return regionalData.filter(item => 
      commodities.some(commodity => 
        item.commodity.toLowerCase() === commodity.toLowerCase()
      )
    );
  }

  /**
   * Gets comprehensive crop price data for a specific region
   */
  async getCropPricesForRegion(region: string, commodities: string[] = ["corn", "wheat", "soybeans", "rice", "cotton"]) {
    const [internationalPrices, localPrices] = await Promise.all([
      this.fetchInternationalPrices(commodities),
      this.fetchLocalPrices(region, commodities)
    ]);

    // Combine international and local prices
    const combinedPrices = internationalPrices.map(intlPrice => {
      const localPrice = localPrices.find(local => 
        local.commodity.toLowerCase() === intlPrice.commodity.toLowerCase()
      );

      return {
        commodity: intlPrice.commodity,
        international: {
          price: intlPrice.price,
          unit: intlPrice.unit,
          change: intlPrice.change,
          change_percent: intlPrice.change_percent,
          high_52_week: intlPrice.high_52_week,
          low_52_week: intlPrice.low_52_week,
          volume: intlPrice.volume,
          last_updated: intlPrice.last_updated
        },
        local: localPrice ? {
          price: localPrice.price,
          unit: localPrice.unit,
          source: localPrice.source,
          last_updated: localPrice.last_updated
        } : null,
        price_difference: localPrice ? 
          ((localPrice.price - intlPrice.price) / intlPrice.price * 100).toFixed(2) : null
      };
    });

    return combinedPrices;
  }

  /**
   * Gets crop prices for farmer's specific crops
   */
  async getCropPricesForFarmer(farmerLocation: string, farmerCrops: string[]) {
    // Map crop types to commodity symbols
    const commodityMapping: Record<string, string> = {
      "corn": "corn",
      "wheat": "wheat", 
      "soybeans": "soybeans",
      "soybean": "soybeans",
      "rice": "rice",
      "cotton": "cotton",
      "tomatoes": "corn", // Use corn as proxy for vegetables
      "tomato": "corn",
      "carrots": "corn",
      "carrot": "corn"
    };

    const commodities = farmerCrops.map(crop => 
      commodityMapping[crop.toLowerCase()] || "corn"
    ).filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

    return this.getCropPricesForRegion(farmerLocation, commodities);
  }
}

// Export singleton instance
export const cropPricesService = new CropPricesService();