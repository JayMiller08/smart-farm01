import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CloudRain, Sun, Wind, Droplets, AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWeather } from "@/hooks/useWeather";
import { WeatherService } from "@/services/weatherService";

const Weather = () => {
  const navigate = useNavigate();
  const { weather, loading, error, refresh, isConnected, lastUpdated, isLive } = useWeather();

  // Generate AI insights based on current weather
  const aiInsights = weather ? [
    {
      type: "positive" as const,
      message: `Current temperature ${Math.round(weather.main?.temp || 0)}°C is optimal for most crops.`,
    },
    {
      type: "info" as const,
      message: `Humidity at ${weather.main?.humidity || 0}% - ${(weather.main?.humidity || 0) > 70 ? 'watch for fungal diseases' : 'good air circulation'}.`,
    },
    {
      type: "info" as const,
      message: `Wind speed ${Math.round(weather.wind?.speed || 0)} km/h from ${WeatherService.formatWindDirection(weather.wind?.deg || 0)}.`,
    },
  ] : [
    {
      type: "info" as const,
      message: "Weather data is loading. AI insights will appear once data is available.",
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-6">
      {/* Header */}
      <header className="bg-card border-b shadow-soft">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4 flex items-center gap-2 md:gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <div>
            <h1 className="text-lg md:text-xl font-bold">Weather Dashboard</h1>
            <p className="text-xs md:text-sm text-muted-foreground">{weather?.location_name || 'Loading location...'}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 md:px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Current Weather */}
        <Card className="shadow-medium bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg md:text-2xl">Current Conditions</CardTitle>
                <CardDescription className="text-xs md:text-sm flex items-center gap-2">
                  {weather?.location_name || 'Loading location...'}
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refresh}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <p className="text-destructive mb-2">{error}</p>
                <Button onClick={refresh} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : !weather ? (
              <div className="text-center py-8">
                <Sun className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No weather data available</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6">
                  <span className="text-6xl md:text-8xl">
                    {WeatherService.getWeatherIcon(weather.weather?.[0]?.icon || '01d')}
                  </span>
                  <div>
                    <div className="text-3xl md:text-5xl font-bold">
                      {WeatherService.formatTemperature(weather.main?.temp || 0)}
                    </div>
                    <div className="text-base md:text-lg text-muted-foreground">
                      {weather.weather?.[0]?.description || 'Unknown'}
                    </div>
                    {weather.main?.feels_like && weather.main.feels_like !== weather.main.temp && (
                      <div className="text-xs md:text-sm text-muted-foreground">
                        Feels like {WeatherService.formatTemperature(weather.main.feels_like)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2">
                    <Droplets className="h-4 w-4 md:h-5 md:w-5 text-accent flex-shrink-0" />
                    <div className="text-center sm:text-left">
                      <div className="font-semibold text-sm md:text-base">{weather.main?.humidity || 0}%</div>
                      <div className="text-xs text-muted-foreground">Humidity</div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2">
                    <Wind className="h-4 w-4 md:h-5 md:w-5 text-accent flex-shrink-0" />
                    <div className="text-center sm:text-left">
                      <div className="font-semibold text-sm md:text-base">{WeatherService.formatWindSpeed(weather.wind?.speed || 0)}</div>
                      <div className="text-xs text-muted-foreground">{WeatherService.formatWindDirection(weather.wind?.deg || 0)}</div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2">
                    <CloudRain className="h-4 w-4 md:h-5 md:w-5 text-accent flex-shrink-0" />
                    <div className="text-center sm:text-left">
                      <div className="font-semibold text-sm md:text-base">
                        {weather.precipitation?.rain?.['1h'] || weather.precipitation?.rain?.['3h'] || 0} mm
                      </div>
                      <div className="text-xs text-muted-foreground">Rainfall</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">
                    {WeatherService.formatObservedTime(weather.observed_at).relative} — {WeatherService.formatObservedTime(weather.observed_at).absolute}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              AI Farming Insights
            </CardTitle>
            <CardDescription>Weather-based recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiInsights.map((insight, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${
                  insight.type === "positive"
                    ? "bg-primary/5 border-primary/20"
                    : "bg-accent/5 border-accent/20"
                }`}
              >
                <p className="text-sm">{insight.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Additional Weather Details */}
        {weather && (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Additional Weather Information</CardTitle>
              <CardDescription>Detailed weather metrics for your farm</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-lg font-semibold">{weather.main?.pressure || 0} hPa</div>
                  <div className="text-xs text-muted-foreground">Pressure</div>
                </div>
                {weather.visibility && (
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-lg font-semibold">{Math.round(weather.visibility / 1000)} km</div>
                    <div className="text-xs text-muted-foreground">Visibility</div>
                  </div>
                )}
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-lg font-semibold">{weather.clouds?.all || 0}%</div>
                  <div className="text-xs text-muted-foreground">Cloud Cover</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-lg font-semibold">{WeatherService.formatWindDirection(weather.wind?.deg || 0)}</div>
                  <div className="text-xs text-muted-foreground">Wind Direction</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Weather;
