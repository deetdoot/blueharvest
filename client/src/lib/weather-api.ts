import type { WeatherData, ForecastDay } from '@/types';

export async function getCurrentWeather(location: string): Promise<WeatherData> {
  const response = await fetch(`/api/weather/${encodeURIComponent(location)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  return response.json();
}

export async function getWeatherForecast(location: string): Promise<ForecastDay[]> {
  const response = await fetch(`/api/weather/${encodeURIComponent(location)}/forecast`);
  if (!response.ok) {
    throw new Error('Failed to fetch weather forecast');
  }
  return response.json();
}
