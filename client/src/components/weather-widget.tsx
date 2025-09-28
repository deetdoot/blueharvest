import { useQuery } from "@tanstack/react-query";
import { Cloud, CloudRain, Sun, Wind } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { WeatherData, ForecastDay } from "@/types";

interface WeatherWidgetProps {
  location: string;
}

const getWeatherIcon = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'clear':
    case 'sunny':
      return <Sun className="h-12 w-12 text-yellow-500" />;
    case 'clouds':
    case 'cloudy':
      return <Cloud className="h-12 w-12 text-gray-500" />;
    case 'rain':
    case 'drizzle':
      return <CloudRain className="h-12 w-12 text-blue-500" />;
    default:
      return <Sun className="h-12 w-12 text-yellow-500" />;
  }
};

const getForecastIcon = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'clear':
    case 'sunny':
      return "fas fa-sun";
    case 'clouds':
    case 'cloudy':
      return "fas fa-cloud-sun";
    case 'rain':
    case 'drizzle':
      return "fas fa-cloud-rain";
    default:
      return "fas fa-sun";
  }
};

export default function WeatherWidget({ location }: WeatherWidgetProps) {
  const { data: weather, isLoading: weatherLoading } = useQuery<WeatherData>({
    queryKey: ["/api/weather", location],
    enabled: !!location,
  });

  const { data: forecast, isLoading: forecastLoading } = useQuery<ForecastDay[]>({
    queryKey: ["/api/weather", location, "forecast"],
    enabled: !!location,
  });

  if (weatherLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Weather data unavailable for {location}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Weather */}
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-weather-title">Current Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-4">
              {getWeatherIcon(weather.weatherCondition)}
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="text-temperature">
                  {Math.round(weather.temperature)}°F
                </p>
                <p className="text-muted-foreground text-sm" data-testid="text-weather-condition">
                  {weather.description}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Humidity</span>
                <span className="text-foreground font-medium" data-testid="text-humidity">
                  {Math.round(weather.humidity)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Wind</span>
                <span className="text-foreground font-medium" data-testid="text-wind">
                  {Math.round(weather.windSpeed)} mph
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">UV Index</span>
                <span className="text-foreground font-medium" data-testid="text-uv-index">
                  {weather.uvIndex} (High)
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Precipitation</span>
                <span className="text-foreground font-medium" data-testid="text-precipitation">
                  {weather.precipitation.toFixed(1)} in
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Soil Moisture</span>
                <span className="text-foreground font-medium" data-testid="text-soil-moisture">
                  72%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Evapotranspiration</span>
                <span className="text-foreground font-medium" data-testid="text-evapotranspiration">
                  0.28 in
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 7-Day Forecast */}
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-forecast-title">7-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          {forecastLoading ? (
            <div className="grid grid-cols-7 gap-2">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : forecast && forecast.length > 0 ? (
            <div className="grid grid-cols-7 gap-2">
              {forecast.slice(0, 7).map((day, index) => (
                <div 
                  key={index} 
                  className="text-center p-3 rounded-lg hover:bg-muted cursor-pointer"
                  data-testid={`forecast-day-${index}`}
                >
                  <p className="text-xs text-muted-foreground font-medium">
                    {index === 0 ? 'TODAY' : (day.date ? new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase() : 'N/A')}
                  </p>
                  <i className={`${getForecastIcon(day.weatherCondition)} text-lg my-2 ${
                    day.weatherCondition.toLowerCase().includes('sun') ? 'text-yellow-500' :
                    day.weatherCondition.toLowerCase().includes('cloud') ? 'text-gray-500' :
                    'text-blue-500'
                  }`}></i>
                  <p className="text-sm font-medium" data-testid={`text-temp-${index}`}>
                    {Math.round(day.temperature)}°
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(day.temperature - 10)}°
                  </p>
                  <p className="text-xs text-blue-600 font-medium" data-testid={`text-precip-${index}`}>
                    {Math.round(day.precipitationProbability)}%
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Forecast data unavailable</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
