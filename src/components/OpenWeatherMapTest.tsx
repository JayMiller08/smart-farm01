import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, MapPin, RefreshCw } from "lucide-react";
import { WeatherService } from "@/services/weatherService";

export const OpenWeatherMapTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<Array<{ test: string; status: 'success' | 'error'; message: string }>>([]);

  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    const results: Array<{ test: string; status: 'success' | 'error'; message: string }> = [];

    try {
      // Test 1: Geolocation
      console.log('Testing geolocation...');
      const location = await WeatherService.getCurrentLocation();
      
      if (location) {
        results.push({
          test: 'Geolocation',
          status: 'success',
          message: `Location detected: ${location.name || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}`
        });
      } else {
        results.push({
          test: 'Geolocation',
          status: 'error',
          message: 'Could not determine location'
        });
      }

      // Test 2: OpenWeatherMap API
      if (location) {
        console.log('Testing OpenWeatherMap API...');
        const weather = await WeatherService.fetchWeatherFromOpenWeatherMap(location.lat, location.lng);
        
        if (weather) {
          results.push({
            test: 'OpenWeatherMap API',
            status: 'success',
            message: `Weather data received: ${weather.main.temp}°C, ${weather.weather[0]?.description}`
          });
        } else {
          results.push({
            test: 'OpenWeatherMap API',
            status: 'error',
            message: 'No weather data received from OpenWeatherMap API'
          });
        }
      }

      // Test 3: Complete Weather Service
      console.log('Testing complete weather service...');
      const latestWeather = await WeatherService.getLatestWeather();
      
      if (latestWeather) {
        results.push({
          test: 'Complete Weather Service',
          status: 'success',
          message: `Service working: ${latestWeather.source} data for ${latestWeather.location_name}`
        });
      } else {
        results.push({
          test: 'Complete Weather Service',
          status: 'error',
          message: 'Weather service failed to return data'
        });
      }

    } catch (error: any) {
      results.push({
        test: 'General Error',
        status: 'error',
        message: `Unexpected error: ${error.message}`
      });
    }

    setTestResults(results);
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          OpenWeatherMap Integration Test
        </CardTitle>
        <CardDescription>
          Test the complete OpenWeatherMap integration including geolocation and API calls
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 mr-2" />
              Test OpenWeatherMap Integration
            </>
          )}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Test Results:</h4>
            {testResults.map((result, index) => (
              <Alert 
                key={index}
                className={result.status === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}
              >
                <div className="flex items-center gap-2">
                  {result.status === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <div>
                    <div className="font-semibold">{result.test}</div>
                    <AlertDescription className={result.status === 'success' ? 'text-green-800' : 'text-red-800'}>
                      {result.message}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <h4 className="font-semibold">Integration Features:</h4>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Browser Geolocation:</strong> Automatically detects your current location</li>
            <li><strong>OpenWeatherMap API:</strong> Fetches real-time weather data using your coordinates</li>
            <li><strong>Fallback System:</strong> Falls back to database if API fails</li>
            <li><strong>Data Transformation:</strong> Converts API data to internal format</li>
            <li><strong>Real-time Updates:</strong> Weather widget updates automatically</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
