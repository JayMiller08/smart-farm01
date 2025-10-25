import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, CloudRain, RefreshCw } from "lucide-react";
import { WeatherService } from "@/services/weatherService";

export const WeatherDataTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    location_name: 'Nelspruit, Mpumalanga, South Africa',
    location_lat: -25.4744,
    location_lng: 30.9703,
    temperature: 24.5,
    feelsLike: 26.2,
    humidity: 65,
    pressure: 1013,
    windSpeed: 3.6,
    windDirection: 180,
    rain: 0,
    clouds: 20,
    visibility: 10000,
    condition: 'Clouds',
    description: 'few clouds',
    icon: '02d',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const weatherData = await WeatherService.addWeatherObservation({
        location_name: formData.location_name,
        location_lat: formData.location_lat,
        location_lng: formData.location_lng,
        main: {
          temp: formData.temperature,
          feels_like: formData.feelsLike,
          temp_min: formData.temperature - 2,
          temp_max: formData.temperature + 2,
          pressure: formData.pressure,
          humidity: formData.humidity,
        },
        weather: [{
          id: 801,
          main: formData.condition,
          description: formData.description,
          icon: formData.icon,
        }],
        wind: {
          speed: formData.windSpeed,
          deg: formData.windDirection,
          gust: formData.windSpeed + 2,
        },
        precipitation: {
          rain: formData.rain > 0 ? { '1h': formData.rain } : {},
        },
        clouds: {
          all: formData.clouds,
        },
        visibility: formData.visibility,
        source: 'manual',
      });

      if (weatherData) {
        setResult({
          type: 'success',
          message: 'Weather observation added successfully! The data should now appear in real-time on the weather widgets.',
        });
      } else {
        setResult({
          type: 'error',
          message: 'Failed to add weather observation. Please check your database connection.',
        });
      }
    } catch (error: any) {
      setResult({
        type: 'error',
        message: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomWeather = () => {
    const conditions = [
      { main: 'Clear', description: 'clear sky', icon: '01d' },
      { main: 'Clouds', description: 'few clouds', icon: '02d' },
      { main: 'Clouds', description: 'scattered clouds', icon: '03d' },
      { main: 'Rain', description: 'light rain', icon: '10d' },
      { main: 'Thunderstorm', description: 'thunderstorm', icon: '11d' },
    ];
    
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    setFormData({
      ...formData,
      temperature: Math.round((Math.random() * 20 + 15) * 10) / 10, // 15-35°C
      feelsLike: Math.round((Math.random() * 20 + 15) * 10) / 10, // 15-35°C
      humidity: Math.floor(Math.random() * 40 + 40), // 40-80%
      windSpeed: Math.round((Math.random() * 20 + 5) * 10) / 10, // 5-25 km/h
      windDirection: Math.floor(Math.random() * 360), // 0-360°
      rain: Math.round(Math.random() * 10 * 10) / 10, // 0-10 mm
      pressure: Math.floor(Math.random() * 20 + 1000), // 1000-1020 hPa
      clouds: Math.floor(Math.random() * 100), // 0-100%
      visibility: Math.floor(Math.random() * 15000 + 5000), // 5-20 km
      condition: randomCondition.main,
      description: randomCondition.description,
      icon: randomCondition.icon,
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudRain className="h-5 w-5" />
          Weather Data Test
        </CardTitle>
        <CardDescription>
          Add test weather observations to see real-time updates in the weather widgets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="locationName">Location Name</Label>
              <Input
                id="locationName"
                value={formData.location_name}
                onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                placeholder="Nelspruit, Mpumalanga, South Africa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                placeholder="24.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feelsLike">Feels Like (°C)</Label>
              <Input
                id="feelsLike"
                type="number"
                step="0.1"
                value={formData.feelsLike}
                onChange={(e) => setFormData({ ...formData, feelsLike: parseFloat(e.target.value) })}
                placeholder="26.2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="humidity">Humidity (%)</Label>
              <Input
                id="humidity"
                type="number"
                min="0"
                max="100"
                value={formData.humidity}
                onChange={(e) => setFormData({ ...formData, humidity: parseInt(e.target.value) })}
                placeholder="65"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pressure">Pressure (hPa)</Label>
              <Input
                id="pressure"
                type="number"
                value={formData.pressure}
                onChange={(e) => setFormData({ ...formData, pressure: parseInt(e.target.value) })}
                placeholder="1013"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="windSpeed">Wind Speed (km/h)</Label>
              <Input
                id="windSpeed"
                type="number"
                step="0.1"
                value={formData.windSpeed}
                onChange={(e) => setFormData({ ...formData, windSpeed: parseFloat(e.target.value) })}
                placeholder="3.6"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="windDirection">Wind Direction (°)</Label>
              <Input
                id="windDirection"
                type="number"
                min="0"
                max="360"
                value={formData.windDirection}
                onChange={(e) => setFormData({ ...formData, windDirection: parseInt(e.target.value) })}
                placeholder="180"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rain">Rain (mm)</Label>
              <Input
                id="rain"
                type="number"
                step="0.1"
                value={formData.rain}
                onChange={(e) => setFormData({ ...formData, rain: parseFloat(e.target.value) })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clouds">Cloud Cover (%)</Label>
              <Input
                id="clouds"
                type="number"
                min="0"
                max="100"
                value={formData.clouds}
                onChange={(e) => setFormData({ ...formData, clouds: parseInt(e.target.value) })}
                placeholder="20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility (m)</Label>
              <Input
                id="visibility"
                type="number"
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: parseInt(e.target.value) })}
                placeholder="10000"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Adding Weather Data..." : "Add Weather Observation"}
            </Button>
            <Button type="button" variant="outline" onClick={generateRandomWeather}>
              Generate Random
            </Button>
          </div>
        </form>

        {result && (
          <Alert className={result.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-center gap-2">
              {result.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={result.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {result.message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <h4 className="font-semibold">Instructions:</h4>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Fill in the weather data above or click "Generate Random" for test data</li>
            <li>Click "Add Weather Observation" to insert the data into the database</li>
            <li>Watch the weather widgets update in real-time</li>
            <li>The latest weather observation will be displayed on both the Dashboard and Weather page</li>
            <li>Test real-time updates by adding multiple observations with different data</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
