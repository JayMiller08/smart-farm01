import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Droplets, 
  Thermometer, 
  Zap, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Leaf,
  BarChart3,
  Target,
  RefreshCw,
  Loader2,
  Info,
  Calendar,
  History,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { useSoilData } from '@/hooks/useSoilData';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// IoT Sensor Data Interface (from IoTDashboard)
interface IoTSensorData {
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

interface SoilHealthScore {
  overall: number;
  categories: {
    chemical: number;
    physical: number;
    biological: number;
  };
  recommendations: string[];
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  healthStatus: 'Poor' | 'Moderate' | 'Healthy';
}

interface SoilHealthData {
  location: string;
  coordinates: { lat: number; lon: number };
  depth: string;
  timestamp: string;
  properties: {
    ph: number;
    organic_carbon: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    calcium: number;
    magnesium: number;
    sodium: number;
    cec: number;
    sand: number;
    silt: number;
    clay: number;
  };
  healthScore: SoilHealthScore;
}

interface HistoricalData {
  date: string;
  score: number;
  status: SoilHealthScore['status'];
  healthStatus: SoilHealthScore['healthStatus'];
}


// IoT Sensor Data Generator (from IoTDashboard)
const generateIoTSensorData = (): IoTSensorData => {
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

// Soil Health Assessment Engine for IoT Sensor Data
const calculateSoilHealthFromIoT = (sensorData: IoTSensorData): SoilHealthScore => {
  const scores = {
    chemical: 0,
    physical: 0,
    biological: 0
  };
  
  const recommendations: string[] = [];
  
  // Chemical Health Assessment (pH and NPK)
  let chemicalScore = 0;
  let chemicalFactors = 0;
  
  // pH Assessment (0-100 points)
  if (sensorData.sensors.soilPH.value) {
    chemicalFactors++;
    if (sensorData.sensors.soilPH.value >= 6.0 && sensorData.sensors.soilPH.value <= 7.5) {
      chemicalScore += 100;
    } else if (sensorData.sensors.soilPH.value >= 5.5 && sensorData.sensors.soilPH.value <= 8.0) {
      chemicalScore += 80;
    } else if (sensorData.sensors.soilPH.value >= 5.0 && sensorData.sensors.soilPH.value <= 8.5) {
      chemicalScore += 60;
    } else {
      chemicalScore += 30;
      if (sensorData.sensors.soilPH.value < 5.5) {
        recommendations.push('Apply lime to raise soil pH to optimal range (6.0-7.5)');
      } else if (sensorData.sensors.soilPH.value > 7.5) {
        recommendations.push('Apply sulfur or organic matter to lower soil pH');
      }
    }
  }
  
  // NPK Assessment
  if (sensorData.sensors.npk.nitrogen) {
    chemicalFactors++;
    if (sensorData.sensors.npk.nitrogen >= 50) {
      chemicalScore += 100;
    } else if (sensorData.sensors.npk.nitrogen >= 30) {
      chemicalScore += 80;
    } else if (sensorData.sensors.npk.nitrogen >= 20) {
      chemicalScore += 60;
    } else {
      chemicalScore += 30;
      recommendations.push('Apply nitrogen-rich fertilizer (urea or ammonium nitrate)');
    }
  }
  
  if (sensorData.sensors.npk.phosphorus) {
    chemicalFactors++;
    if (sensorData.sensors.npk.phosphorus >= 25) {
      chemicalScore += 100;
    } else if (sensorData.sensors.npk.phosphorus >= 15) {
      chemicalScore += 80;
    } else if (sensorData.sensors.npk.phosphorus >= 10) {
      chemicalScore += 60;
    } else {
      chemicalScore += 30;
      recommendations.push('Apply phosphorus-rich fertilizer (superphosphate)');
    }
  }
  
  if (sensorData.sensors.npk.potassium) {
    chemicalFactors++;
    if (sensorData.sensors.npk.potassium >= 150) {
      chemicalScore += 100;
    } else if (sensorData.sensors.npk.potassium >= 100) {
      chemicalScore += 80;
    } else if (sensorData.sensors.npk.potassium >= 75) {
      chemicalScore += 60;
    } else {
      chemicalScore += 30;
      recommendations.push('Apply potassium-rich fertilizer (potassium chloride)');
    }
  }
  
  scores.chemical = chemicalFactors > 0 ? chemicalScore / chemicalFactors : 0;
  
  // Physical Health Assessment (Soil Moisture and Temperature)
  let physicalScore = 0;
  let physicalFactors = 0;
  
  // Soil Moisture Assessment
  if (sensorData.sensors.soilMoisture.value) {
    physicalFactors++;
    if (sensorData.sensors.soilMoisture.value >= 45 && sensorData.sensors.soilMoisture.value <= 60) {
      physicalScore += 100;
    } else if (sensorData.sensors.soilMoisture.value >= 35 && sensorData.sensors.soilMoisture.value <= 70) {
      physicalScore += 80;
    } else if (sensorData.sensors.soilMoisture.value >= 25 && sensorData.sensors.soilMoisture.value <= 80) {
      physicalScore += 60;
    } else {
      physicalScore += 30;
      if (sensorData.sensors.soilMoisture.value < 35) {
        recommendations.push('Irrigate soil - moisture levels are too low');
      } else if (sensorData.sensors.soilMoisture.value > 70) {
        recommendations.push('Improve drainage - soil is too wet');
      }
    }
  }
  
  // Soil Temperature Assessment
  if (sensorData.sensors.soilTemperature.value) {
    physicalFactors++;
    if (sensorData.sensors.soilTemperature.value >= 20 && sensorData.sensors.soilTemperature.value <= 25) {
      physicalScore += 100;
    } else if (sensorData.sensors.soilTemperature.value >= 15 && sensorData.sensors.soilTemperature.value <= 30) {
      physicalScore += 80;
    } else if (sensorData.sensors.soilTemperature.value >= 10 && sensorData.sensors.soilTemperature.value <= 35) {
      physicalScore += 60;
    } else {
      physicalScore += 30;
      if (sensorData.sensors.soilTemperature.value < 15) {
        recommendations.push('Consider soil warming techniques');
      } else if (sensorData.sensors.soilTemperature.value > 30) {
        recommendations.push('Implement soil cooling measures');
      }
    }
  }
  
  scores.physical = physicalFactors > 0 ? physicalScore / physicalFactors : 0;
  
  // Biological Health Assessment (based on soil moisture and temperature)
  if (sensorData.sensors.soilMoisture.value && sensorData.sensors.soilTemperature.value) {
    const moistureScore = sensorData.sensors.soilMoisture.value >= 40 && sensorData.sensors.soilMoisture.value <= 60 ? 100 : 60;
    const tempScore = sensorData.sensors.soilTemperature.value >= 20 && sensorData.sensors.soilTemperature.value <= 25 ? 100 : 60;
    scores.biological = (moistureScore + tempScore) / 2;
    
    if (scores.biological < 80) {
      recommendations.push('Improve soil biological activity by maintaining optimal moisture and temperature');
    }
  } else {
    scores.biological = 50; // Default if no data
  }
  
  // Calculate overall score
  const overallScore = (scores.chemical + scores.physical + scores.biological) / 3;
  
  // Determine status
  let status: SoilHealthScore['status'];
  if (overallScore >= 90) status = 'excellent';
  else if (overallScore >= 75) status = 'good';
  else if (overallScore >= 60) status = 'fair';
  else if (overallScore >= 40) status = 'poor';
  else status = 'critical';
  
  // Determine simplified health status
  let healthStatus: SoilHealthScore['healthStatus'];
  if (overallScore >= 70) healthStatus = 'Healthy';
  else if (overallScore >= 40) healthStatus = 'Moderate';
  else healthStatus = 'Poor';
  
  return {
    overall: Math.round(overallScore),
    categories: {
      chemical: Math.round(scores.chemical),
      physical: Math.round(scores.physical),
      biological: Math.round(scores.biological)
    },
    recommendations,
    status,
    healthStatus
  };
};

// Soil Health Assessment Engine (Original API-based)
const calculateSoilHealthScore = (properties: any): SoilHealthScore => {
  const scores = {
    chemical: 0,
    physical: 0,
    biological: 0
  };
  
  const recommendations: string[] = [];
  
  // Chemical Health Assessment
  let chemicalScore = 0;
  let chemicalFactors = 0;
  
  // pH Assessment (0-100 points)
  if (properties.ph) {
    chemicalFactors++;
    if (properties.ph >= 6.0 && properties.ph <= 7.5) {
      chemicalScore += 100;
    } else if (properties.ph >= 5.5 && properties.ph <= 8.0) {
      chemicalScore += 80;
    } else if (properties.ph >= 5.0 && properties.ph <= 8.5) {
      chemicalScore += 60;
    } else {
      chemicalScore += 30;
      if (properties.ph < 5.5) {
        recommendations.push('Apply lime to raise soil pH to optimal range (6.0-7.5)');
      } else if (properties.ph > 7.5) {
        recommendations.push('Apply sulfur or organic matter to lower soil pH');
      }
    }
  }
  
  // Nutrient Assessment
  if (properties.nitrogen) {
    chemicalFactors++;
    if (properties.nitrogen >= 50) {
      chemicalScore += 100;
    } else if (properties.nitrogen >= 30) {
      chemicalScore += 80;
    } else if (properties.nitrogen >= 20) {
      chemicalScore += 60;
    } else {
      chemicalScore += 30;
      recommendations.push('Apply nitrogen-rich fertilizer (urea or ammonium nitrate)');
    }
  }
  
  if (properties.phosphorus) {
    chemicalFactors++;
    if (properties.phosphorus >= 25) {
      chemicalScore += 100;
    } else if (properties.phosphorus >= 15) {
      chemicalScore += 80;
    } else if (properties.phosphorus >= 10) {
      chemicalScore += 60;
    } else {
      chemicalScore += 30;
      recommendations.push('Apply phosphorus-rich fertilizer (superphosphate)');
    }
  }
  
  if (properties.potassium) {
    chemicalFactors++;
    if (properties.potassium >= 150) {
      chemicalScore += 100;
    } else if (properties.potassium >= 100) {
      chemicalScore += 80;
    } else if (properties.potassium >= 75) {
      chemicalScore += 60;
    } else {
      chemicalScore += 30;
      recommendations.push('Apply potassium-rich fertilizer (potassium chloride)');
    }
  }
  
  if (properties.organic_carbon) {
    chemicalFactors++;
    if (properties.organic_carbon >= 2.0) {
      chemicalScore += 100;
    } else if (properties.organic_carbon >= 1.5) {
      chemicalScore += 80;
    } else if (properties.organic_carbon >= 1.0) {
      chemicalScore += 60;
    } else {
      chemicalScore += 30;
      recommendations.push('Add organic matter (compost, manure) to improve soil carbon');
    }
  }
  
  scores.chemical = chemicalFactors > 0 ? chemicalScore / chemicalFactors : 0;
  
  // Physical Health Assessment
  let physicalScore = 0;
  let physicalFactors = 0;
  
  if (properties.sand && properties.silt && properties.clay) {
    physicalFactors++;
    const total = properties.sand + properties.silt + properties.clay;
    const sandPercent = (properties.sand / total) * 100;
    const clayPercent = (properties.clay / total) * 100;
    
    // Ideal texture: 40-60% sand, 20-40% clay
    if (sandPercent >= 40 && sandPercent <= 60 && clayPercent >= 20 && clayPercent <= 40) {
      physicalScore += 100;
    } else if (sandPercent >= 30 && sandPercent <= 70 && clayPercent >= 15 && clayPercent <= 45) {
      physicalScore += 80;
    } else {
      physicalScore += 60;
      recommendations.push('Improve soil texture by adding organic matter');
    }
  }
  
  if (properties.cec) {
    physicalFactors++;
    if (properties.cec >= 15) {
      physicalScore += 100;
    } else if (properties.cec >= 10) {
      physicalScore += 80;
    } else if (properties.cec >= 5) {
      physicalScore += 60;
    } else {
      physicalScore += 30;
      recommendations.push('Improve cation exchange capacity by adding organic matter');
    }
  }
  
  scores.physical = physicalFactors > 0 ? physicalScore / physicalFactors : 0;
  
  // Biological Health Assessment (based on organic carbon)
  if (properties.organic_carbon) {
    if (properties.organic_carbon >= 2.0) {
      scores.biological = 100;
    } else if (properties.organic_carbon >= 1.5) {
      scores.biological = 80;
    } else if (properties.organic_carbon >= 1.0) {
      scores.biological = 60;
    } else {
      scores.biological = 30;
      recommendations.push('Increase biological activity by adding compost and reducing tillage');
    }
  } else {
    scores.biological = 50; // Default if no data
  }
  
  // Calculate overall score
  const overallScore = (scores.chemical + scores.physical + scores.biological) / 3;
  
  // Determine status
  let status: SoilHealthScore['status'];
  if (overallScore >= 90) status = 'excellent';
  else if (overallScore >= 75) status = 'good';
  else if (overallScore >= 60) status = 'fair';
  else if (overallScore >= 40) status = 'poor';
  else status = 'critical';
  
  // Determine simplified health status
  let healthStatus: SoilHealthScore['healthStatus'];
  if (overallScore >= 70) healthStatus = 'Healthy';
  else if (overallScore >= 40) healthStatus = 'Moderate';
  else healthStatus = 'Poor';
  
  
  return {
    overall: Math.round(overallScore),
    categories: {
      chemical: Math.round(scores.chemical),
      physical: Math.round(scores.physical),
      biological: Math.round(scores.biological)
    },
    recommendations,
    status,
    healthStatus
  };
};

const getStatusColor = (status: SoilHealthScore['status']) => {
  switch (status) {
    case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
    case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'poor': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'critical': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getStatusIcon = (status: SoilHealthScore['status']) => {
  switch (status) {
    case 'excellent': return <CheckCircle className="h-5 w-5" />;
    case 'good': return <TrendingUp className="h-5 w-5" />;
    case 'fair': return <Activity className="h-5 w-5" />;
    case 'poor': return <AlertTriangle className="h-5 w-5" />;
    case 'critical': return <AlertTriangle className="h-5 w-5" />;
    default: return <Info className="h-5 w-5" />;
  }
};

const getHealthStatusColor = (healthStatus: SoilHealthScore['healthStatus']) => {
  switch (healthStatus) {
    case 'Healthy': return 'text-green-600 bg-green-50 border-green-200';
    case 'Moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'Poor': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getHealthStatusIcon = (healthStatus: SoilHealthScore['healthStatus']) => {
  switch (healthStatus) {
    case 'Healthy': return <CheckCircle className="h-6 w-6" />;
    case 'Moderate': return <Activity className="h-6 w-6" />;
    case 'Poor': return <AlertTriangle className="h-6 w-6" />;
    default: return <Info className="h-6 w-6" />;
  }
};

// Generate mock historical data
const generateHistoricalData = (currentScore: number): HistoricalData[] => {
  const data: HistoricalData[] = [];
  const today = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);
    
    // Generate realistic historical scores with some variation
    const variation = (Math.random() - 0.5) * 20; // ±10 points variation
    const historicalScore = Math.max(0, Math.min(100, currentScore + variation));
    
    let status: SoilHealthScore['status'];
    if (historicalScore >= 90) status = 'excellent';
    else if (historicalScore >= 75) status = 'good';
    else if (historicalScore >= 60) status = 'fair';
    else if (historicalScore >= 40) status = 'poor';
    else status = 'critical';
    
    let healthStatus: SoilHealthScore['healthStatus'];
    if (historicalScore >= 70) healthStatus = 'Healthy';
    else if (historicalScore >= 40) healthStatus = 'Moderate';
    else healthStatus = 'Poor';
    
    data.push({
      date: date.toISOString().split('T')[0],
      score: Math.round(historicalScore),
      status,
      healthStatus
    });
  }
  
  return data;
};

// Simplified Soil Health Status Card Component
const SoilHealthStatusCard: React.FC<{ healthData: SoilHealthData }> = ({ healthData }) => {
  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">Soil Health Status</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(healthData.timestamp).toLocaleDateString()}
          </Badge>
        </div>
        <CardDescription>
          Analysis completed for {healthData.location} at {healthData.depth}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className={`p-8 rounded-xl border-2 ${getHealthStatusColor(healthData.healthScore.healthStatus)}`}>
          <div className="flex items-center justify-center mb-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                {getHealthStatusIcon(healthData.healthScore.healthStatus)}
              </div>
              <div className="text-6xl font-bold mb-2">
                {healthData.healthScore.healthStatus}
              </div>
              <div className="text-lg font-medium">
                Soil Health
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              {healthData.healthScore.overall}/100
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              Overall Health Score
            </div>
            <Progress value={healthData.healthScore.overall} className="h-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Soil Health Display Card Component
const SoilHealthCard: React.FC<{ healthData: SoilHealthData; historicalData: HistoricalData[] }> = ({ 
  healthData, 
  historicalData 
}) => {
  const currentScore = healthData.healthScore.overall;
  const previousScore = historicalData.length > 1 ? historicalData[historicalData.length - 2].score : currentScore;
  const scoreChange = currentScore - previousScore;
  
  const getTrendIcon = () => {
    if (scoreChange > 5) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (scoreChange < -5) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = () => {
    if (scoreChange > 5) return 'text-green-600';
    if (scoreChange < -5) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">Soil Health Dashboard</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(healthData.timestamp).toLocaleDateString()}
            </Badge>
          </div>
        </div>
        <CardDescription>
          Comprehensive soil health analysis for {healthData.location} at {healthData.depth}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Health Score */}
        <div className={`p-6 rounded-xl border-2 ${getStatusColor(healthData.healthScore.status)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {getStatusIcon(healthData.healthScore.status)}
              <div>
                <div className="text-5xl font-bold">
                  {healthData.healthScore.overall}
                </div>
                <div className="text-lg font-medium capitalize">
                  {healthData.healthScore.status} Health
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                {getTrendIcon()}
                <span className={`text-sm font-medium ${getTrendColor()}`}>
                  {scoreChange > 0 ? '+' : ''}{scoreChange.toFixed(1)} from last month
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Score out of 100
              </div>
            </div>
          </div>
          
          <Progress value={healthData.healthScore.overall} className="h-4" />
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Chemical Health */}
          <div className="p-4 border rounded-lg bg-blue-50/50">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">Chemical Health</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {healthData.healthScore.categories.chemical}/100
            </div>
            <Progress value={healthData.healthScore.categories.chemical} className="h-2 mb-2" />
            <div className="text-xs text-muted-foreground">
              pH, Nutrients, CEC
            </div>
          </div>

          {/* Physical Health */}
          <div className="p-4 border rounded-lg bg-green-50/50">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-5 w-5 text-green-600" />
              <span className="font-semibold">Physical Health</span>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {healthData.healthScore.categories.physical}/100
            </div>
            <Progress value={healthData.healthScore.categories.physical} className="h-2 mb-2" />
            <div className="text-xs text-muted-foreground">
              Texture, Structure, CEC
            </div>
          </div>

          {/* Biological Health */}
          <div className="p-4 border rounded-lg bg-purple-50/50">
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="h-5 w-5 text-purple-600" />
              <span className="font-semibold">Biological Health</span>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {healthData.healthScore.categories.biological}/100
            </div>
            <Progress value={healthData.healthScore.categories.biological} className="h-2 mb-2" />
            <div className="text-xs text-muted-foreground">
              Organic Matter, Activity
            </div>
          </div>
        </div>

        {/* Key Soil Properties */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Key Soil Properties
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 border rounded-lg text-center bg-white">
              <div className="text-sm text-muted-foreground mb-1">pH Level</div>
              <div className="text-lg font-bold text-blue-600">
                {healthData.properties.ph.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">pH</div>
            </div>
            <div className="p-3 border rounded-lg text-center bg-white">
              <div className="text-sm text-muted-foreground mb-1">Organic Carbon</div>
              <div className="text-lg font-bold text-green-600">
                {healthData.properties.organic_carbon.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">%</div>
            </div>
            <div className="p-3 border rounded-lg text-center bg-white">
              <div className="text-sm text-muted-foreground mb-1">Nitrogen</div>
              <div className="text-lg font-bold text-purple-600">
                {healthData.properties.nitrogen.toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground">ppm</div>
            </div>
            <div className="p-3 border rounded-lg text-center bg-white">
              <div className="text-sm text-muted-foreground mb-1">CEC</div>
              <div className="text-lg font-bold text-orange-600">
                {healthData.properties.cec.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">cmol/kg</div>
            </div>
          </div>
        </div>

        {/* Historical Trends */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <History className="h-4 w-4" />
            Health Trends (Last 12 Months)
          </h4>
          <div className="p-4 border rounded-lg bg-gray-50/50">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">
                Monthly Health Scores
              </div>
              <div className="text-sm font-medium">
                Current: {currentScore} | Previous: {previousScore}
              </div>
            </div>
            <div className="grid grid-cols-12 gap-1">
              {historicalData.map((data, index) => (
                <div key={index} className="text-center">
                  <div 
                    className={`h-8 rounded-sm border ${
                      data.status === 'excellent' ? 'bg-green-200 border-green-300' :
                      data.status === 'good' ? 'bg-blue-200 border-blue-300' :
                      data.status === 'fair' ? 'bg-yellow-200 border-yellow-300' :
                      data.status === 'poor' ? 'bg-orange-200 border-orange-300' :
                      'bg-red-200 border-red-300'
                    }`}
                    title={`${data.date}: ${data.score}/100 (${data.status})`}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {index === historicalData.length - 1 ? 'Now' : 
                     index === historicalData.length - 2 ? 'Prev' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {healthData.healthScore.recommendations.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Improvement Recommendations
            </h4>
            <div className="space-y-2">
              {healthData.healthScore.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-blue-900">{recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function SoilAnalysis() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, loading, error, getMultipleSoilProperties, clearData } = useSoilData();
  
  const [soilHealthData, setSoilHealthData] = useState<SoilHealthData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ioTSensorData, setIoTSensorData] = useState<IoTSensorData | null>(null);

  // Generate IoT sensor data on component mount
  useEffect(() => {
    const generateData = () => {
      const sensorData = generateIoTSensorData();
      setIoTSensorData(sensorData);
      
      // Calculate soil health from IoT data
      const healthScore = calculateSoilHealthFromIoT(sensorData);
      
      const healthData: SoilHealthData = {
        location: "IoT Sensor Field",
        coordinates: { lat: -26.2041, lon: 28.0473 }, // Johannesburg coordinates
        depth: "0-20",
        timestamp: sensorData.timestamp,
        properties: {
          ph: sensorData.sensors.soilPH.value,
          organic_carbon: 1.5, // Default value
          nitrogen: sensorData.sensors.npk.nitrogen,
          phosphorus: sensorData.sensors.npk.phosphorus,
          potassium: sensorData.sensors.npk.potassium,
          calcium: 0,
          magnesium: 0,
          sodium: 0,
          cec: 0,
          sand: 0,
          silt: 0,
          clay: 0,
        },
        healthScore
      };
      
      setSoilHealthData(healthData);
      
      // Generate historical data
      const historical = generateHistoricalData(healthScore.overall);
      setHistoricalData(historical);
    };

    generateData(); // Initial generation
    
    // Update every 10 seconds
    const interval = setInterval(generateData, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const askAIAboutSoilHealth = () => {
    if (!soilHealthData) {
      toast({
        title: "No Analysis Data",
        description: "Please complete soil health analysis first",
        variant: "destructive",
      });
      return;
    }

    const aiPrompt = `I have completed a comprehensive soil health analysis for ${soilHealthData.location} at ${soilHealthData.depth} depth. Here are the results:

OVERALL HEALTH SCORE: ${soilHealthData.healthScore.overall}/100 (${soilHealthData.healthScore.status.toUpperCase()})

CATEGORY SCORES:
- Chemical Health: ${soilHealthData.healthScore.categories.chemical}/100
- Physical Health: ${soilHealthData.healthScore.categories.physical}/100  
- Biological Health: ${soilHealthData.healthScore.categories.biological}/100

SOIL PROPERTIES:
- pH: ${soilHealthData.properties.ph}
- Organic Carbon: ${soilHealthData.properties.organic_carbon}%
- Nitrogen: ${soilHealthData.properties.nitrogen} ppm
- Phosphorus: ${soilHealthData.properties.phosphorus} ppm
- Potassium: ${soilHealthData.properties.potassium} ppm
- CEC: ${soilHealthData.properties.cec} cmol/kg
- Texture: ${soilHealthData.properties.sand}% sand, ${soilHealthData.properties.silt}% silt, ${soilHealthData.properties.clay}% clay

CURRENT RECOMMENDATIONS:
${soilHealthData.healthScore.recommendations.map(rec => `• ${rec}`).join('\n')}

Please provide detailed farming recommendations based on this soil health analysis, including:
1. Immediate actions to improve soil health
2. Long-term soil management strategy
3. Suitable crops for this soil type
4. Fertilizer and amendment recommendations
5. Irrigation and tillage practices
6. Timeline for implementing improvements`;

    sessionStorage.setItem('soilAnalysisData', JSON.stringify({
      location: soilHealthData.location,
      depth: soilHealthData.depth,
      properties: Object.entries(soilHealthData.properties).map(([name, value]) => ({
        name: name.replace('_', ' ').toUpperCase(),
        value: value,
        unit: name === 'ph' ? 'pH' : name === 'organic_carbon' ? '%' : 'ppm'
      })),
      prompt: aiPrompt
    }));

    navigate('/ai-advisor');
    
    toast({
      title: "AI Analysis Ready",
      description: "Soil health data prepared for AI consultation",
    });
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-6">
      {/* Header */}
      <header className="bg-card border-b shadow-soft">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <Leaf className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <div>
              <h1 className="text-lg md:text-xl font-bold">Soil Health Analysis</h1>
              <p className="text-xs md:text-sm text-muted-foreground">Comprehensive soil health assessment and recommendations</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <RefreshCw className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-3 md:px-4 py-4 md:py-6 space-y-4 md:space-y-6">

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Soil Health Status Card - Using IoT Sensor Data */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Soil Health Status (IoT Sensors)
            </CardTitle>
            <CardDescription>
              Real-time soil health analysis from IoT sensors
            </CardDescription>
          </CardHeader>
          <CardContent>
            {soilHealthData && ioTSensorData ? (
              (() => {
                const healthStatus = soilHealthData.healthScore.healthStatus || 
                  (soilHealthData.healthScore.overall >= 70 ? 'Healthy' : 
                   soilHealthData.healthScore.overall >= 40 ? 'Moderate' : 'Poor');
                const statusColor = getHealthStatusColor(healthStatus);
                
                return (
                  <div className="space-y-4">
                    <div className={`p-8 rounded-xl border-2 ${statusColor}`}>
                      <div className="text-center">
                        <div className="text-6xl font-bold mb-2">
                          {healthStatus}
                        </div>
                        <div className="text-lg font-medium">Soil Health</div>
                        <div className="text-3xl font-bold mt-4">
                          {soilHealthData.healthScore.overall}/100
                        </div>
                      </div>
                    </div>
                    
                    {/* IoT Sensor Values */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 border rounded-lg text-center bg-white">
                        <div className="text-sm text-muted-foreground mb-1">Soil Moisture</div>
                        <div className="text-lg font-bold text-blue-600">
                          {ioTSensorData.sensors.soilMoisture.value.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {ioTSensorData.sensors.soilMoisture.status}
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg text-center bg-white">
                        <div className="text-sm text-muted-foreground mb-1">Soil pH</div>
                        <div className="text-lg font-bold text-green-600">
                          {ioTSensorData.sensors.soilPH.value.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">pH</div>
                      </div>
                      <div className="p-3 border rounded-lg text-center bg-white">
                        <div className="text-sm text-muted-foreground mb-1">Soil Temp</div>
                        <div className="text-lg font-bold text-orange-600">
                          {ioTSensorData.sensors.soilTemperature.value.toFixed(1)}°C
                        </div>
                        <div className="text-xs text-muted-foreground">Temperature</div>
                      </div>
                      <div className="p-3 border rounded-lg text-center bg-white">
                        <div className="text-sm text-muted-foreground mb-1">Nitrogen</div>
                        <div className="text-lg font-bold text-purple-600">
                          {ioTSensorData.sensors.npk.nitrogen.toFixed(0)}
                        </div>
                        <div className="text-xs text-muted-foreground">ppm</div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="p-8 rounded-xl border-2 text-gray-600 bg-gray-50 border-gray-200">
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2">Loading...</div>
                  <div className="text-lg font-medium">Initializing IoT sensors</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Soil Health Dashboard Card */}
        {soilHealthData && (
          <SoilHealthCard 
            healthData={soilHealthData} 
            historicalData={historicalData} 
          />
        )}
      </main>
    </div>
  );
}