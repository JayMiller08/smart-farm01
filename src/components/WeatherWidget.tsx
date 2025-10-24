import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudRain, Sun, Wind, Droplets } from "lucide-react";

const WeatherWidget = () => {
  // Mock weather data - will be replaced with real API
  const weather = {
    temp: 24,
    condition: "Partly Cloudy",
    humidity: 65,
    wind: 12,
    rainfall: 0,
  };

  return (
    <Card className="shadow-soft bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Current Weather</CardTitle>
            <CardDescription>Nelspruit, Mpumalanga</CardDescription>
          </div>
          <Sun className="h-8 w-8 text-accent" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div>
            <div className="text-4xl font-bold">{weather.temp}°C</div>
            <div className="text-sm text-muted-foreground">{weather.condition}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-accent" />
            <div>
              <div className="font-medium">{weather.humidity}%</div>
              <div className="text-xs text-muted-foreground">Humidity</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-accent" />
            <div>
              <div className="font-medium">{weather.wind} km/h</div>
              <div className="text-xs text-muted-foreground">Wind</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-accent" />
            <div>
              <div className="font-medium">{weather.rainfall} mm</div>
              <div className="text-xs text-muted-foreground">Rain</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
