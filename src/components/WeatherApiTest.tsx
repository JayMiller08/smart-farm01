import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Cloud, RefreshCw, ExternalLink } from "lucide-react";
import { WeatherService, WeatherData } from "@/services/weatherService";

export const WeatherApiTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number; name?: string } | null>(null);

  const testApiConnection = async () => {
    setIsLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      console.log('Testing OpenWeatherMap API connection...');
      
      // Get current location first
      const userLocation = await WeatherService.getCurrentLocation();
      if (!userLocation) {
        setError('Could not determine your location');
        return;
      }
      
      setLocation(userLocation);
      console.log('Using location:', userLocation);
      
      // Fetch weather data
      const weather = await WeatherService.fetchWeatherFromOpenWeatherMap(userLocation.lat, userLocation.lng);
      
      if (weather) {
        setWeatherData(weather);
        setLastFetch(new Date());
        console.log('OpenWeatherMap API test successful:', weather);
      } else {
        setError('No weather data received from OpenWeatherMap API');
      }
    } catch (err: any) {
      console.error('OpenWeatherMap API test failed:', err);
      setError(err.message || 'Failed to fetch weather data from OpenWeatherMap API');
    } finally {
      setIsLoading(false);
    }
  };

  const testDatabaseFallback = async () => {
    setIsLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      console.log('Testing database fallback...');
      const weather = await WeatherService.getLatestWeather();
      
      if (weather) {
        setWeatherData(weather);
        setLastFetch(new Date());
        console.log('Database test successful:', weather);
      } else {
        setError('No weather data available from database');
      }
    } catch (err: any) {
      console.error('Database test failed:', err);
      setError(err.message || 'Failed to fetch weather data from database');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Weather API Integration Test
        </CardTitle>
        <CardDescription>
          Test the integration with OpenWeatherMap API using your current location.{' '}
          <a 
            href="https://openweathermap.org/api" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            OpenWeatherMap API
            <ExternalLink className="h-3 w-3" />
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testApiConnection} 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Testing API...
              </>
            ) : (
              <>
                <Cloud className="h-4 w-4 mr-2" />
                Test API Connection
              </>
            )}
          </Button>
          <Button 
            onClick={testDatabaseFallback} 
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            Test Database Fallback
          </Button>
        </div>

        {location && (
          <Alert className="border-blue-200 bg-blue-50">
            <Cloud className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Location:</strong> {location.name || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {weatherData && (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Weather data successfully fetched! 
                {lastFetch && ` Last updated: ${lastFetch.toLocaleTimeString()}`}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Location & Time</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <div className="text-sm font-medium">Location:</div>
                    <div className="text-sm text-muted-foreground">{weatherData.location_name}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Coordinates:</div>
                    <div className="text-sm text-muted-foreground">
                      {weatherData.location_lat.toFixed(4)}, {weatherData.location_lng.toFixed(4)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Observed:</div>
                    <div className="text-sm text-muted-foreground">
                      {WeatherService.formatObservedTime(weatherData.observed_at).absolute}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Source:</div>
                    <div className="text-sm text-muted-foreground capitalize">{weatherData.source}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Weather Conditions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Current Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{WeatherService.getWeatherIcon(weatherData.weather[0]?.icon || '01d')}</span>
                    <div>
                      <div className="text-lg font-semibold">{WeatherService.formatTemperature(weatherData.main.temp)}</div>
                      <div className="text-sm text-muted-foreground">{weatherData.weather[0]?.description}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="font-medium">Feels like:</div>
                      <div className="text-muted-foreground">{WeatherService.formatTemperature(weatherData.main.feels_like)}</div>
                    </div>
                    <div>
                      <div className="font-medium">Humidity:</div>
                      <div className="text-muted-foreground">{weatherData.main.humidity}%</div>
                    </div>
                    <div>
                      <div className="font-medium">Pressure:</div>
                      <div className="text-muted-foreground">{weatherData.main.pressure} hPa</div>
                    </div>
                    <div>
                      <div className="font-medium">Clouds:</div>
                      <div className="text-muted-foreground">{weatherData.clouds.all}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Wind & Precipitation */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Wind & Precipitation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <div className="text-sm font-medium">Wind Speed:</div>
                    <div className="text-sm text-muted-foreground">{WeatherService.formatWindSpeed(weatherData.wind.speed)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Wind Direction:</div>
                    <div className="text-sm text-muted-foreground">
                      {WeatherService.formatWindDirection(weatherData.wind.deg)} ({weatherData.wind.deg}°)
                    </div>
                  </div>
                  {weatherData.wind.gust && (
                    <div>
                      <div className="text-sm font-medium">Wind Gust:</div>
                      <div className="text-sm text-muted-foreground">{WeatherService.formatWindSpeed(weatherData.wind.gust)}</div>
                    </div>
                  )}
                  {weatherData.precipitation.rain && (
                    <div>
                      <div className="text-sm font-medium">Rainfall (3h):</div>
                      <div className="text-sm text-muted-foreground">{weatherData.precipitation.rain['3h']} mm</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Raw Data */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Raw API Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(weatherData.raw_payload, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <h4 className="font-semibold">What this test does:</h4>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Geolocation:</strong> Uses browser geolocation to get your current coordinates</li>
            <li><strong>OpenWeatherMap API:</strong> Tests connection to OpenWeatherMap's daily forecast API</li>
            <li><strong>Data Transformation:</strong> Shows how OpenWeatherMap data is converted to our internal format</li>
            <li><strong>Database Fallback:</strong> Tests the fallback to database if API fails</li>
            <li><strong>UI Mapping:</strong> Displays how the data maps to UI components</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
