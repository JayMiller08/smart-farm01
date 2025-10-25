import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudRain, Sun, Wind, Droplets, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";
import { WeatherService } from "@/services/weatherService";

const WeatherWidget = () => {
  const { weather, loading, error, refresh, isConnected, lastUpdated, isLive } = useWeather();

  if (loading) {
    return (
      <Card className="shadow-soft bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Current Weather</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                Loading weather data...
              </CardDescription>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div>
              <div className="text-4xl font-bold text-muted-foreground">--°C</div>
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium text-muted-foreground">--%</div>
                <div className="text-xs text-muted-foreground">Humidity</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium text-muted-foreground">-- km/h</div>
                <div className="text-xs text-muted-foreground">Wind</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CloudRain className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium text-muted-foreground">-- mm</div>
                <div className="text-xs text-muted-foreground">Rain</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-soft bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-destructive">Weather Error</CardTitle>
              <CardDescription className="text-destructive/70">{error}</CardDescription>
            </div>
            <CloudRain className="h-8 w-8 text-destructive" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-destructive/70">{error}</p>
            <button
              onClick={refresh}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card className="shadow-soft bg-gradient-to-br from-muted/5 to-muted/10 border-muted/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Current Weather</CardTitle>
              <CardDescription>No weather data available</CardDescription>
            </div>
            <Sun className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No weather observations found in the database.</p>
        </CardContent>
      </Card>
    );
  }

  const weatherIcon = weather.weather?.[0]?.icon || '01d';
  const weatherDescription = weather.weather?.[0]?.description || 'Unknown';
  const temperature = weather.main?.temp || 0;
  const feelsLike = weather.main?.feels_like || temperature;
  const humidity = weather.main?.humidity || 0;
  const windSpeed = weather.wind?.speed || 0;
  const windDirection = weather.wind?.deg || 0;
  const rainfall = weather.precipitation?.rain?.['1h'] || weather.precipitation?.rain?.['3h'] || 0;

  return (
    <Card className="shadow-soft bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Current Weather</CardTitle>
            <CardDescription className="flex items-center gap-2">
              {weather.location_name}
              {isLive ? (
                <span className="inline-flex items-center gap-1 text-xs text-green-600">
                  <Wifi className="h-3 w-3" />
                  Live
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <WifiOff className="h-3 w-3" />
                  Offline
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{WeatherService.getWeatherIcon(weatherIcon)}</span>
            <button
              onClick={refresh}
              className="p-1 hover:bg-muted rounded"
              title="Refresh weather data"
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div>
            <div className="text-4xl font-bold">
              {WeatherService.formatTemperature(temperature)}
            </div>
            <div className="text-sm text-muted-foreground">{weatherDescription}</div>
            {feelsLike !== temperature && (
              <div className="text-xs text-muted-foreground">
                Feels like {WeatherService.formatTemperature(feelsLike)}
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 text-sm mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-accent" />
            <div>
              <div className="font-medium">{humidity}%</div>
              <div className="text-xs text-muted-foreground">Humidity</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-accent" />
            <div>
              <div className="font-medium">{WeatherService.formatWindSpeed(windSpeed)}</div>
              <div className="text-xs text-muted-foreground">
                {WeatherService.formatWindDirection(windDirection)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-accent" />
            <div>
              <div className="font-medium">{rainfall} mm</div>
              <div className="text-xs text-muted-foreground">Rain</div>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          {lastUpdated ? (
            <>
              Last updated: {lastUpdated.toLocaleTimeString()} — 
              {WeatherService.formatObservedTime(weather.observed_at).relative}
            </>
          ) : (
            WeatherService.formatObservedTime(weather.observed_at).relative
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
