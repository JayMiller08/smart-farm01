import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bot, 
  Droplets, 
  Thermometer, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SensorData {
  timestamp: string;
  sensors: {
    soilMoisture: { value: number; status: string };
    soilTemperature: { value: number };
    soilPH: { value: number };
    airTemperature: { value: number };
    humidity: { value: number };
    npk: { nitrogen: number; phosphorus: number; potassium: number };
  };
  alerts: Array<{ type: string; message: string; severity: string }>;
}

interface AIRecommendation {
  id: string;
  type: 'irrigation' | 'fertilizer' | 'pest_control' | 'weather' | 'soil_health' | 'general';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  icon: React.ComponentType<any>;
  timestamp: string;
  confidence: number;
}

// Simulated sensor data generator (same as IoT Dashboard)
const generateSensorData = (): SensorData => {
  const soilMoisture = 30 + Math.random() * 30; // 30-60%
  const status = soilMoisture < 35 ? "critical" : soilMoisture < 45 ? "warning" : "optimal";
  
  const alerts = [];
  if (soilMoisture < 35) {
    alerts.push({
      type: "irrigation",
      message: "Soil moisture below optimal range. Consider irrigation.",
      severity: "warning"
    });
  }

  return {
    timestamp: new Date().toISOString(),
    sensors: {
      soilMoisture: { value: soilMoisture, status },
      soilTemperature: { value: 20 + Math.random() * 8 }, // 20-28°C
      soilPH: { value: 6.0 + Math.random() * 1.5 }, // 6.0-7.5
      airTemperature: { value: 22 + Math.random() * 10 }, // 22-32°C
      humidity: { value: 50 + Math.random() * 30 }, // 50-80%
      npk: {
        nitrogen: 40 + Math.random() * 30,
        phosphorus: 20 + Math.random() * 20,
        potassium: 150 + Math.random() * 50
      }
    },
    alerts
  };
};

// AI Recommendation Engine
const generateAIRecommendations = (sensorData: SensorData): AIRecommendation[] => {
  const recommendations: AIRecommendation[] = [];
  const { sensors } = sensorData;

  // Soil Moisture Analysis
  if (sensors.soilMoisture.value < 35) {
    recommendations.push({
      id: 'irrigation-1',
      type: 'irrigation',
      priority: 'high',
      title: 'Irrigation Required',
      description: `Soil moisture is at ${sensors.soilMoisture.value.toFixed(1)}%, which is below the optimal range of 40-60%.`,
      action: 'Start irrigation system for 30 minutes to restore optimal moisture levels.',
      icon: Droplets,
      timestamp: new Date().toISOString(),
      confidence: 95
    });
  } else if (sensors.soilMoisture.value > 60) {
    recommendations.push({
      id: 'irrigation-2',
      type: 'irrigation',
      priority: 'medium',
      title: 'Reduce Irrigation',
      description: `Soil moisture is high at ${sensors.soilMoisture.value.toFixed(1)}%. Overwatering can lead to root rot.`,
      action: 'Reduce irrigation frequency or duration to prevent waterlogging.',
      icon: Droplets,
      timestamp: new Date().toISOString(),
      confidence: 88
    });
  }

  // NPK Analysis
  if (sensors.npk.nitrogen < 50) {
    recommendations.push({
      id: 'fertilizer-1',
      type: 'fertilizer',
      priority: 'medium',
      title: 'Nitrogen Deficiency',
      description: `Nitrogen levels are low at ${sensors.npk.nitrogen.toFixed(1)} ppm. This affects plant growth and leaf development.`,
      action: 'Apply nitrogen-rich fertilizer (urea or ammonium nitrate) at 20kg/ha.',
      icon: Zap,
      timestamp: new Date().toISOString(),
      confidence: 92
    });
  }

  if (sensors.npk.phosphorus < 25) {
    recommendations.push({
      id: 'fertilizer-2',
      type: 'fertilizer',
      priority: 'medium',
      title: 'Phosphorus Deficiency',
      description: `Phosphorus levels are low at ${sensors.npk.phosphorus.toFixed(1)} ppm. This affects root development and flowering.`,
      action: 'Apply phosphorus-rich fertilizer (superphosphate) at 15kg/ha.',
      icon: Zap,
      timestamp: new Date().toISOString(),
      confidence: 90
    });
  }

  if (sensors.npk.potassium < 150) {
    recommendations.push({
      id: 'fertilizer-3',
      type: 'fertilizer',
      priority: 'low',
      title: 'Potassium Deficiency',
      description: `Potassium levels are moderate at ${sensors.npk.potassium.toFixed(1)} ppm. Consider supplementation for better fruit quality.`,
      action: 'Apply potassium-rich fertilizer (potassium chloride) at 25kg/ha.',
      icon: Zap,
      timestamp: new Date().toISOString(),
      confidence: 85
    });
  }

  // Soil pH Analysis
  if (sensors.soilPH < 6.0) {
    recommendations.push({
      id: 'soil-1',
      type: 'soil_health',
      priority: 'medium',
      title: 'Soil Too Acidic',
      description: `Soil pH is ${sensors.soilPH.toFixed(1)}, which is too acidic for most crops. Optimal range is 6.0-7.0.`,
      action: 'Apply lime at 2-3 tons/ha to raise soil pH gradually.',
      icon: Activity,
      timestamp: new Date().toISOString(),
      confidence: 94
    });
  } else if (sensors.soilPH > 7.5) {
    recommendations.push({
      id: 'soil-2',
      type: 'soil_health',
      priority: 'medium',
      title: 'Soil Too Alkaline',
      description: `Soil pH is ${sensors.soilPH.toFixed(1)}, which is too alkaline. This reduces nutrient availability.`,
      action: 'Apply sulfur or organic matter to lower soil pH gradually.',
      icon: Activity,
      timestamp: new Date().toISOString(),
      confidence: 91
    });
  }

  // Temperature Analysis
  if (sensors.airTemperature > 30) {
    recommendations.push({
      id: 'weather-1',
      type: 'weather',
      priority: 'medium',
      title: 'High Temperature Alert',
      description: `Air temperature is ${sensors.airTemperature.toFixed(1)}°C. High temperatures can stress plants and increase water needs.`,
      action: 'Increase irrigation frequency and consider shade cloth for sensitive crops.',
      icon: Thermometer,
      timestamp: new Date().toISOString(),
      confidence: 87
    });
  }

  // Humidity Analysis
  if (sensors.humidity > 80) {
    recommendations.push({
      id: 'pest-1',
      type: 'pest_control',
      priority: 'medium',
      title: 'High Humidity Risk',
      description: `Humidity is ${sensors.humidity.toFixed(1)}%. High humidity increases risk of fungal diseases.`,
      action: 'Improve air circulation and consider fungicide application as preventive measure.',
      icon: AlertTriangle,
      timestamp: new Date().toISOString(),
      confidence: 89
    });
  }

  // General recommendations based on optimal conditions
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'general-1',
      type: 'general',
      priority: 'low',
      title: 'Optimal Growing Conditions',
      description: 'All sensor readings are within optimal ranges. Continue current farming practices.',
      action: 'Monitor regularly and maintain current irrigation and fertilization schedule.',
      icon: CheckCircle,
      timestamp: new Date().toISOString(),
      confidence: 95
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

export const AIRecommendations: React.FC = () => {
  const navigate = useNavigate();
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch sensor data and generate recommendations
  useEffect(() => {
    if (!isLive) return;

    const fetchData = () => {
      const data = generateSensorData();
      setSensorData(data);
      
      const aiRecs = generateAIRecommendations(data);
      setRecommendations(aiRecs);
      setLastUpdated(new Date());
    };

    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-3 w-3" />;
      case 'medium': return <Clock className="h-3 w-3" />;
      case 'low': return <CheckCircle className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'irrigation': return <Droplets className="h-4 w-4" />;
      case 'fertilizer': return <Zap className="h-4 w-4" />;
      case 'pest_control': return <AlertTriangle className="h-4 w-4" />;
      case 'weather': return <Thermometer className="h-4 w-4" />;
      case 'soil_health': return <Activity className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  if (!sensorData) {
    return (
      <Card className="shadow-soft border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Recommendations
          </CardTitle>
          <CardDescription>Loading sensor data and generating recommendations...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft border-primary/30">
      <CardHeader className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            <CardTitle className="text-base md:text-lg">AI Recommendations</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isLive ? "default" : "outline"} className="text-xs">
              {isLive ? "Live" : "Paused"}
            </Badge>
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <CardDescription className="text-xs md:text-sm">
          Real-time farming recommendations based on IoT sensor data
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3 p-4 md:p-6 pt-0">
        {recommendations.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              No immediate recommendations. All sensor readings are within optimal ranges.
            </AlertDescription>
          </Alert>
        ) : (
          recommendations.map((rec) => {
            const IconComponent = rec.icon;
            return (
              <div
                key={rec.id}
                className={`p-3 rounded-lg border ${
                  rec.priority === 'high'
                    ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                    : rec.priority === 'medium'
                    ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
                    : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <IconComponent className="h-4 w-4 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <Badge variant={getPriorityColor(rec.priority)} className="text-xs">
                        {getPriorityIcon(rec.priority)}
                        <span className="ml-1">{rec.priority}</span>
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {rec.confidence}% confidence
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {rec.description}
                    </p>
                    
                    <div className="bg-white/50 dark:bg-black/20 p-2 rounded border-l-2 border-primary/30">
                      <p className="text-xs font-medium text-primary mb-1">Recommended Action:</p>
                      <p className="text-xs">{rec.action}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate("/iot-dashboard")}
          >
            <Activity className="h-4 w-4 mr-2" />
            View Live Sensors
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Resume
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
