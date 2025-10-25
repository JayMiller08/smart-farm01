import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, RefreshCw, Clock, Activity } from "lucide-react";
import { useWeather } from "@/hooks/useWeather";

export const RealTimeStatusIndicator = () => {
  const { weather, loading, error, refresh, isConnected, lastUpdated, isLive } = useWeather();
  const [timeSinceUpdate, setTimeSinceUpdate] = useState<string>('');

  // Update time since last update
  useEffect(() => {
    const updateTimeSince = () => {
      if (lastUpdated) {
        const now = new Date();
        const diffMs = now.getTime() - lastUpdated.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        if (diffMinutes > 0) {
          setTimeSinceUpdate(`${diffMinutes}m ${diffSeconds}s ago`);
        } else {
          setTimeSinceUpdate(`${diffSeconds}s ago`);
        }
      } else {
        setTimeSinceUpdate('Never');
      }
    };

    updateTimeSince();
    const interval = setInterval(updateTimeSince, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  const getStatusColor = () => {
    if (loading) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (error) return 'bg-red-100 text-red-800 border-red-200';
    if (isLive) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = () => {
    if (loading) return 'Loading...';
    if (error) return 'Error';
    if (isLive) return 'Live';
    return 'Offline';
  };

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="h-3 w-3 animate-spin" />;
    if (error) return <WifiOff className="h-3 w-3" />;
    if (isLive) return <Wifi className="h-3 w-3" />;
    return <WifiOff className="h-3 w-3" />;
  };

  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" />
          Real-Time Status
        </CardTitle>
        <CardDescription>
          Weather data connection and update status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor()} flex items-center gap-1`}>
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
            {isConnected && (
              <Badge variant="outline" className="text-xs">
                DB Connected
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Update Information */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Last updated:</span>
            <span className="font-medium">{timeSinceUpdate}</span>
          </div>
          
          {lastUpdated && (
            <div className="text-xs text-muted-foreground">
              {lastUpdated.toLocaleString()}
            </div>
          )}

          {weather && (
            <div className="text-xs text-muted-foreground">
              Data source: <span className="font-medium capitalize">{weather.source}</span>
            </div>
          )}
        </div>

        {/* Auto-refresh Info */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          <div className="font-medium mb-1">Auto-refresh:</div>
          <div>• Weather data refreshes every 5 minutes</div>
          <div>• Database changes trigger immediate updates</div>
          <div>• Manual refresh available anytime</div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
            <div className="font-medium">Error:</div>
            <div>{error}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
