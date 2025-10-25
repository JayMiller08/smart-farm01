import { supabase } from '@/integrations/supabase/client';

export interface WeatherData {
  id: string;
  observed_at: string;
  location_name: string;
  location_lat: number;
  location_lng: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  precipitation: {
    rain?: { '1h'?: number; '3h'?: number };
    snow?: { '1h'?: number; '3h'?: number };
  };
  clouds: {
    all: number;
  };
  visibility: number | null;
  raw_payload: any;
  source: string;
  created_at: string;
  created_by: string | null;
}

// OpenWeatherMap Current Weather API Response interface
export interface OpenWeatherMapResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  rain?: {
    '1h': number;
    '3h'?: number;
  };
  snow?: {
    '1h': number;
    '3h'?: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export class WeatherService {
  private static readonly OPENWEATHER_API_KEY = '7de55a19792e888f2323e76feb7f4f6d';
  private static readonly OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

  /**
   * Get user's current location using browser geolocation API
   */
  static async getCurrentLocation(): Promise<{ lat: number; lng: number; name?: string } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser');
        // Fallback to Nelspruit, Mpumalanga coordinates
        resolve({
          lat: -25.4744,
          lng: 30.9703,
          name: 'Nelspruit, Mpumalanga, South Africa'
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log('Geolocation successful:', { lat, lng });
          resolve({ lat, lng });
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          // Fallback to Nelspruit, Mpumalanga coordinates
          resolve({
            lat: -25.4744,
            lng: 30.9703,
            name: 'Nelspruit, Mpumalanga, South Africa'
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Fetch current weather data from OpenWeatherMap API
   */
  static async fetchWeatherFromOpenWeatherMap(lat: number, lng: number): Promise<WeatherData | null> {
    try {
      console.log('Fetching current weather from OpenWeatherMap API...', { lat, lng });
      
      // Use the current weather endpoint instead of daily forecast
      const url = `${this.OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lng}&appid=${this.OPENWEATHER_API_KEY}&units=metric`;
      
      console.log('API URL:', url);
      
      const response = await fetch(url);
      
      console.log('API Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`OpenWeatherMap API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const apiData = await response.json();
      console.log('OpenWeatherMap API response received:', apiData);

      if (!apiData.main || !apiData.weather) {
        throw new Error('Invalid weather data structure received from OpenWeatherMap API');
      }

      // Transform OpenWeatherMap current weather data to our WeatherData format
      const weatherData: WeatherData = {
        id: 'openweather-' + apiData.dt,
        observed_at: new Date(apiData.dt * 1000).toISOString(),
        location_name: `${apiData.name}, ${apiData.sys.country}`,
        location_lat: apiData.coord.lat,
        location_lng: apiData.coord.lon,
        main: {
          temp: apiData.main.temp,
          feels_like: apiData.main.feels_like,
          temp_min: apiData.main.temp_min,
          temp_max: apiData.main.temp_max,
          pressure: apiData.main.pressure,
          humidity: apiData.main.humidity,
        },
        weather: apiData.weather.map((w: any) => ({
          id: w.id,
          main: w.main,
          description: w.description,
          icon: w.icon,
        })),
        wind: {
          speed: this.convertMsToKmh(apiData.wind.speed),
          deg: apiData.wind.deg,
          gust: apiData.wind.gust ? this.convertMsToKmh(apiData.wind.gust) : undefined,
        },
        precipitation: {
          rain: apiData.rain ? { '1h': apiData.rain['1h'] } : undefined,
          snow: apiData.snow ? { '1h': apiData.snow['1h'] } : undefined,
        },
        clouds: {
          all: apiData.clouds.all,
        },
        visibility: apiData.visibility,
        raw_payload: apiData,
        source: 'openweathermap',
        created_at: new Date().toISOString(),
        created_by: null,
      };

      console.log('Transformed OpenWeatherMap data:', weatherData);
      return weatherData;
    } catch (error) {
      console.error('Error fetching weather from OpenWeatherMap API:', error);
      return null;
    }
  }

  /**
   * Get the latest weather observation (from OpenWeatherMap API or database)
   */
  static async getLatestWeather(): Promise<WeatherData | null> {
    try {
      console.log('Fetching latest weather...');
      
      // Get user's current location
      const location = await this.getCurrentLocation();
      if (!location) {
        console.error('Could not determine location');
        return null;
      }

      console.log('Using location:', location);

      // Try to get from OpenWeatherMap API first
      const apiWeather = await this.fetchWeatherFromOpenWeatherMap(location.lat, location.lng);
      if (apiWeather) {
        console.log('Using OpenWeatherMap API weather data');
        return apiWeather;
      }

      // Fallback to database
      console.log('OpenWeatherMap API failed, trying database...');
      const { data, error } = await supabase
        .from('weather_observations')
        .select('*')
        .order('observed_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching latest weather from database:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return null;
      }

      console.log('Using database weather data:', data);
      return data;
    } catch (error) {
      console.error('Error in getLatestWeather:', error);
      return null;
    }
  }

  /**
   * Get all weather observations
   */
  static async getAllWeatherObservations(): Promise<WeatherData[]> {
    try {
      const { data, error } = await supabase
        .from('weather_observations')
        .select('*')
        .order('observed_at', { ascending: false });

      if (error) {
        console.error('Error fetching weather observations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllWeatherObservations:', error);
      return [];
    }
  }

  /**
   * Get weather observations by location
   */
  static async getWeatherByLocation(locationName: string): Promise<WeatherData[]> {
    try {
      const { data, error } = await supabase
        .from('weather_observations')
        .select('*')
        .ilike('location_name', `%${locationName}%`)
        .order('observed_at', { ascending: false });

      if (error) {
        console.error('Error fetching weather by location:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getWeatherByLocation:', error);
      return [];
    }
  }

  /**
   * Subscribe to weather updates
   */
  static subscribeToWeatherUpdates(callback: (payload: any) => void) {
    const channel = supabase
      .channel('weather-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'weather_observations' },
        (payload) => {
          console.log('Weather change received!', payload);
          callback(payload);
        }
      )
      .subscribe();

    return channel;
  }

  /**
   * Add a new weather observation
   */
  static async addWeatherObservation(weatherData: Partial<WeatherData>): Promise<WeatherData | null> {
    try {
      console.log('Adding weather observation:', weatherData);
      
      const { data, error } = await supabase
        .from('weather_observations')
        .insert([weatherData])
        .select()
        .single();

      if (error) {
        console.error('Error adding weather observation:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return null;
      }

      console.log('Successfully added weather observation:', data);
      return data;
    } catch (error) {
      console.error('Error in addWeatherObservation:', error);
      return null;
    }
  }

  /**
   * Update weather observation
   */
  static async updateWeatherObservation(id: string, updates: Partial<WeatherData>): Promise<WeatherData | null> {
    try {
      const { data, error } = await supabase
        .from('weather_observations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating weather observation:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateWeatherObservation:', error);
      return null;
    }
  }

  /**
   * Delete weather observation
   */
  static async deleteWeatherObservation(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('weather_observations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting weather observation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteWeatherObservation:', error);
      return false;
    }
  }

  // Helper methods for data transformation

  /**
   * Convert meters per second to kilometers per hour
   */
  private static convertMsToKmh(ms: number): number {
    return Math.round(ms * 3.6 * 10) / 10; // Round to 1 decimal place
  }


  /**
   * Format temperature for display
   */
  static formatTemperature(temp: number, unit: 'celsius' | 'fahrenheit' = 'celsius'): string {
    if (unit === 'fahrenheit') {
      const fahrenheit = (temp * 9/5) + 32;
      return `${Math.round(fahrenheit)}°F`;
    }
    return `${Math.round(temp)}°C`;
  }

  /**
   * Format wind speed for display
   */
  static formatWindSpeed(speed: number): string {
    return `${Math.round(speed)} km/h`;
  }

  /**
   * Format wind direction for display
   */
  static formatWindDirection(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  /**
   * Format observed time for display
   */
  static formatObservedTime(observedAt: string): { relative: string; absolute: string } {
    const now = new Date();
    const observed = new Date(observedAt);
    const diffMs = now.getTime() - observed.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    let relative: string;
    if (diffMinutes < 1) {
      relative = 'Just now';
    } else if (diffMinutes < 60) {
      relative = `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      relative = `${diffHours}h ago`;
    } else {
      relative = `${diffDays}d ago`;
    }

    const absolute = observed.toLocaleString('en-ZA', {
      timeZone: 'Africa/Johannesburg',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    return { relative, absolute };
  }

  /**
   * Get weather icon based on icon code
   */
  static getWeatherIcon(iconCode: string): string {
    const iconMap: Record<string, string> = {
      '01d': '☀️', // clear sky day
      '01n': '🌙', // clear sky night
      '02d': '⛅', // few clouds day
      '02n': '☁️', // few clouds night
      '03d': '☁️', // scattered clouds
      '03n': '☁️', // scattered clouds
      '04d': '☁️', // broken clouds
      '04n': '☁️', // broken clouds
      '09d': '🌧️', // shower rain
      '09n': '🌧️', // shower rain
      '10d': '🌦️', // rain day
      '10n': '🌧️', // rain night
      '11d': '⛈️', // thunderstorm
      '11n': '⛈️', // thunderstorm
      '13d': '❄️', // snow
      '13n': '❄️', // snow
      '50d': '🌫️', // mist
      '50n': '🌫️', // mist
    };

    return iconMap[iconCode] || '☀️';
  }
}