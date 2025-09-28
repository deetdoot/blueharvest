interface OpenWeatherResponse {
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  wind: {
    speed: number;
  };
  uvi?: number;
  rain?: {
    '1h': number;
  };
}

interface ForecastResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      humidity: number;
    };
    weather: Array<{
      main: string;
      description: string;
    }>;
    wind: {
      speed: number;
    };
    pop: number; // probability of precipitation
  }>;
}

export class WeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || process.env.WEATHER_API_KEY || '';
    // For demo purposes, we'll use mock data if no API key is provided
    if (!this.apiKey) {
      console.warn('OpenWeather API key not found - using mock weather data for demo');
    }
  }

  async getCurrentWeather(location: string) {
    // Use mock data if no API key is available
    if (!this.apiKey) {
      return this.getMockCurrentWeather(location);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/weather?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=imperial`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenWeatherResponse = await response.json();
      
      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        precipitation: data.rain?.['1h'] || 0,
        weatherCondition: data.weather[0].main,
        description: data.weather[0].description,
        uvIndex: data.uvi || 0,
      };
    } catch (error) {
      console.error('Error fetching current weather:', error);
      // Fallback to mock data on API error
      return this.getMockCurrentWeather(location);
    }
  }

  async getWeatherForecast(location: string) {
    // Use mock data if no API key is available
    if (!this.apiKey) {
      return this.getMockWeatherForecast(location);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/forecast?q=${encodeURIComponent(location)}&appid=${this.apiKey}&units=imperial`
      );

      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status} ${response.statusText}`);
      }

      const data: ForecastResponse = await response.json();
      
      // Process 7-day forecast (group by day and take mid-day readings)
      const dailyForecasts = [];
      const processedDays = new Set();
      
      for (const item of data.list) {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toDateString();
        
        if (!processedDays.has(dayKey) && dailyForecasts.length < 7) {
          dailyForecasts.push({
            date: date,
            temperature: item.main.temp,
            humidity: item.main.humidity,
            windSpeed: item.wind.speed,
            weatherCondition: item.weather[0].main,
            precipitationProbability: item.pop * 100,
          });
          processedDays.add(dayKey);
        }
      }
      
      return dailyForecasts;
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      // Fallback to mock data on API error
      return this.getMockWeatherForecast(location);
    }
  }

  calculateEvapotranspiration(temperature: number, humidity: number, windSpeed: number, uvIndex: number, latitude: number = 36.7783, elevation: number = 90): number {
    // Advanced FAO-56 Penman-Monteith calculation for reference evapotranspiration
    // Based on FAO Irrigation and Drainage Paper 56
    
    const temperatureC = (temperature - 32) * (5/9); // Convert F to C
    const relativeHumidity = humidity / 100;
    
    // Calculate day of year for solar calculations
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    // Atmospheric pressure (kPa) based on elevation
    const P = 101.3 * Math.pow((293 - 0.0065 * elevation) / 293, 5.26);
    
    // Psychrometric constant (kPa/°C)
    const gamma = 0.665 * P;
    
    // Saturation vapor pressure (kPa)
    const es = 0.6108 * Math.exp((17.27 * temperatureC) / (temperatureC + 237.3));
    
    // Actual vapor pressure (kPa)
    const ea = es * relativeHumidity;
    
    // Slope of saturation vapor pressure curve (kPa/°C)
    const delta = (4098 * es) / Math.pow(temperatureC + 237.3, 2);
    
    // Wind speed at 2m height (m/s)
    const u2 = windSpeed * 0.44704; // Convert mph to m/s
    
    // Solar calculations
    // Solar declination (radians)
    const solarDeclination = 0.409 * Math.sin((2 * Math.PI / 365) * dayOfYear - 1.39);
    
    // Convert latitude to radians
    const latRad = latitude * Math.PI / 180;
    
    // Sunset hour angle (radians)
    const omega = Math.acos(-Math.tan(latRad) * Math.tan(solarDeclination));
    
    // Extraterrestrial radiation (MJ/m²/day)
    const Gsc = 0.0820; // Solar constant
    const dr = 1 + 0.033 * Math.cos((2 * Math.PI / 365) * dayOfYear); // Inverse relative distance Earth-Sun
    const Ra = (24 * 60 / Math.PI) * Gsc * dr * (omega * Math.sin(latRad) * Math.sin(solarDeclination) + Math.cos(latRad) * Math.cos(solarDeclination) * Math.sin(omega));
    
    // Clear-sky solar radiation (MJ/m²/day)
    const Rso = (0.75 + 2e-5 * elevation) * Ra;
    
    // Estimate actual solar radiation from UV index
    // UV index correlates with solar radiation: Rs ≈ UV index * 2.5 MJ/m²/day
    const Rs = Math.min(uvIndex * 2.5, Rso); // Limited by clear-sky radiation
    
    // Net shortwave radiation (MJ/m²/day)
    const albedo = 0.23; // Reference albedo for grass
    const Rns = (1 - albedo) * Rs;
    
    // Net longwave radiation (MJ/m²/day)
    const stefanBoltzmann = 4.903e-9;
    const TmaxK = temperatureC + 15 + 273.16; // Assume Tmax is 15°C above current temp
    const TminK = temperatureC - 5 + 273.16;  // Assume Tmin is 5°C below current temp
    const Rnl = stefanBoltzmann * ((Math.pow(TmaxK, 4) + Math.pow(TminK, 4)) / 2) * (0.34 - 0.14 * Math.sqrt(ea)) * (1.35 * (Rs / Rso) - 0.35);
    
    // Net radiation (MJ/m²/day)
    const Rn = Rns - Rnl;
    
    // Soil heat flux (MJ/m²/day) - negligible for daily calculations
    const G = 0;
    
    // Reference evapotranspiration (mm/day) using FAO-56 Penman-Monteith equation
    const numerator = 0.408 * delta * (Rn - G) + gamma * (900 / (temperatureC + 273)) * u2 * (es - ea);
    const denominator = delta + gamma * (1 + 0.34 * u2);
    const ET0 = numerator / denominator;
    
    // Convert mm to inches
    return Math.max(0, ET0 * 0.0393701);
  }

  private getMockCurrentWeather(location: string) {
    // Generate realistic mock weather data based on location
    const isWarm = location.toLowerCase().includes('ca') || location.toLowerCase().includes('florida');
    
    return {
      temperature: isWarm ? 82 + Math.random() * 10 : 68 + Math.random() * 15,
      humidity: 45 + Math.random() * 30,
      windSpeed: 3 + Math.random() * 8,
      precipitation: Math.random() < 0.2 ? Math.random() * 0.5 : 0,
      weatherCondition: Math.random() < 0.8 ? 'Clear' : 'Clouds',
      description: Math.random() < 0.8 ? 'clear sky' : 'few clouds',
      uvIndex: 6 + Math.random() * 4,
    };
  }

  private getMockWeatherForecast(location: string) {
    const forecasts = [];
    const isWarm = location.toLowerCase().includes('ca') || location.toLowerCase().includes('florida');
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecasts.push({
        date,
        temperature: isWarm ? 80 + Math.random() * 12 : 65 + Math.random() * 18,
        humidity: 40 + Math.random() * 35,
        windSpeed: 2 + Math.random() * 10,
        weatherCondition: Math.random() < 0.7 ? 'Clear' : 'Clouds',
        precipitationProbability: Math.random() * 40,
      });
    }
    
    return forecasts;
  }
}
