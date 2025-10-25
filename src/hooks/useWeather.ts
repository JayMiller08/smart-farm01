import { useState, useEffect, useCallback, useRef } from 'react';
import { WeatherService, type WeatherData } from '@/services/weatherService';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseWeatherReturn {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isConnected: boolean;
  lastUpdated: Date | null;
  isLive: boolean;
}

export const useWeather = (): UseWeatherReturn => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchWeather = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching fresh weather data...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Weather fetch timeout')), 10000);
      });
      
      const weatherPromise = WeatherService.getLatestWeather();
      
      const weatherData = await Promise.race([weatherPromise, timeoutPromise]);
      
      setWeather(weatherData);
      setLastUpdated(new Date());
      setIsLive(true);
      console.log('Weather data updated:', weatherData?.location_name, weatherData?.main?.temp + '°C');
    } catch (err: any) {
      console.error('Error fetching weather:', err);
      setError(err.message || 'Failed to fetch weather data');
      setIsLive(false);
      
      // Set fallback weather data
      setWeather({
        id: 'fallback-' + Date.now(),
        observed_at: new Date().toISOString(),
        location_name: 'Nelspruit, Mpumalanga, South Africa',
        location_lat: -25.4744,
        location_lng: 30.9703,
        main: {
          temp: 25,
          feels_like: 26,
          temp_min: 22,
          temp_max: 28,
          pressure: 1013,
          humidity: 65,
        },
        weather: [{
          id: 800,
          main: 'Clear',
          description: 'clear sky',
          icon: '01d',
        }],
        wind: {
          speed: 5,
          deg: 180,
        },
        precipitation: {},
        clouds: {
          all: 0,
        },
        visibility: 10000,
        raw_payload: {},
        source: 'fallback',
        created_at: new Date().toISOString(),
        created_by: null,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    console.log('Manual weather refresh triggered');
    await fetchWeather();
  }, [fetchWeather]);

  // Auto-refresh function
  const startAutoRefresh = useCallback(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval (refresh every 5 minutes)
    intervalRef.current = setInterval(() => {
      console.log('Auto-refreshing weather data...');
      fetchWeather();
    }, 5 * 60 * 1000); // 5 minutes

    console.log('Auto-refresh started (every 5 minutes)');
  }, [fetchWeather]);

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('Auto-refresh stopped');
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchWeather();

    // Start auto-refresh
    startAutoRefresh();

    // Set up real-time subscription for database changes
    try {
      const weatherChannel = WeatherService.subscribeToWeatherUpdates((payload) => {
        console.log('Database weather update received:', payload);
        
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          // Refresh weather data when new data is added or updated in database
          console.log('Database change detected, refreshing weather...');
          fetchWeather();
        }
      });

      setChannel(weatherChannel);
    } catch (err) {
      console.warn('Could not set up real-time subscription:', err);
    }

    // Cleanup function
    return () => {
      stopAutoRefresh();
      if (channel) {
        try {
          channel.unsubscribe();
        } catch (err) {
          console.warn('Error unsubscribing from channel:', err);
        }
      }
    };
  }, [fetchWeather, startAutoRefresh, stopAutoRefresh]);

  // Update connection status
  useEffect(() => {
    if (channel) {
      try {
        const { data: { subscription } } = channel;
        subscription.on('CHANNEL_STATE', (payload) => {
          setIsConnected(payload.current === 'SUBSCRIBED');
        });
      } catch (err) {
        console.warn('Error setting up channel state listener:', err);
      }
    }
  }, [channel]);

  return {
    weather,
    loading,
    error,
    refresh,
    isConnected,
    lastUpdated,
    isLive,
  };
};