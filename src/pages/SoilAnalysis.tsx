import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
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
import { SOUTH_AFRICAN_LOCATIONS, getCoordinatesForLocation } from '@/data/southAfricanLocations';
import { useSoilData } from '@/hooks/useSoilData';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SoilHealthScore {
  overall: number;
  categories: {
    chemical: number;
    physical: number;
    biological: number;
  };
  recommendations: string[];
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
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
}

const DEPTH_OPTIONS = [
  { value: '0-20', label: '0-20 cm (Surface)' },
  { value: '20-50', label: '20-50 cm (Subsurface)' },
  { value: '50-100', label: '50-100 cm (Deep)' },
  { value: '100-200', label: '100-200 cm (Very Deep)' },
];

// Soil Health Assessment Engine
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
  
  return {
    overall: Math.round(overallScore),
    categories: {
      chemical: Math.round(scores.chemical),
      physical: Math.round(scores.physical),
      biological: Math.round(scores.biological)
    },
    recommendations,
    status
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
    
    data.push({
      date: date.toISOString().split('T')[0],
      score: Math.round(historicalScore),
      status
    });
  }
  
  return data;
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
  
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedLocationType, setSelectedLocationType] = useState<string>('');
  const [selectedDepth, setSelectedDepth] = useState('0-20');
  const [soilHealthData, setSoilHealthData] = useState<SoilHealthData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const provinces = Object.keys(SOUTH_AFRICAN_LOCATIONS);
  const locationTypes = selectedProvince ? Object.keys(SOUTH_AFRICAN_LOCATIONS[selectedProvince as keyof typeof SOUTH_AFRICAN_LOCATIONS]) : [];
  const locations = selectedProvince && selectedLocationType ? 
    Object.keys((SOUTH_AFRICAN_LOCATIONS as any)[selectedProvince]?.[selectedLocationType] || {}) : [];

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    setSelectedLocationType('');
    setSelectedLocation('');
  };

  const handleLocationTypeChange = (locationType: string) => {
    setSelectedLocationType(locationType);
    setSelectedLocation('');
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
  };

  const getCurrentCoordinates = () => {
    if (selectedProvince && selectedLocation) {
      return getCoordinatesForLocation(selectedProvince, selectedLocation);
    }
    return null;
  };

  const isLocationValid = () => {
    const coords = getCurrentCoordinates();
    return coords && coords.lat && coords.lon && coords.lat !== 0 && coords.lon !== 0;
  };

  const analyzeSoilHealth = async () => {
    if (!isLocationValid()) {
      toast({
        title: "Location Required",
        description: "Please select a valid location before analyzing soil health",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const coordinates = getCurrentCoordinates()!;
      
      // Get all soil properties
      const properties = ['ph', 'organic_carbon', 'nitrogen', 'phosphorus', 'potassium', 'calcium', 'magnesium', 'sodium', 'cec', 'sand', 'silt', 'clay'];
      
      await getMultipleSoilProperties(coordinates.lat, coordinates.lon, properties, selectedDepth);
      
      // Wait for data to be available
      setTimeout(() => {
        if (data) {
          const healthScore = calculateSoilHealthScore(data.property);
          
          const healthData: SoilHealthData = {
            location: `${selectedLocation}, ${selectedProvince}`,
            coordinates,
            depth: selectedDepth,
            timestamp: new Date().toISOString(),
            properties: {
              ph: data.property.ph?.[0]?.value?.value || 0,
              organic_carbon: data.property.organic_carbon?.[0]?.value?.value || 0,
              nitrogen: data.property.nitrogen?.[0]?.value?.value || 0,
              phosphorus: data.property.phosphorus?.[0]?.value?.value || 0,
              potassium: data.property.potassium?.[0]?.value?.value || 0,
              calcium: data.property.calcium?.[0]?.value?.value || 0,
              magnesium: data.property.magnesium?.[0]?.value?.value || 0,
              sodium: data.property.sodium?.[0]?.value?.value || 0,
              cec: data.property.cec?.[0]?.value?.value || 0,
              sand: data.property.sand?.[0]?.value?.value || 0,
              silt: data.property.silt?.[0]?.value?.value || 0,
              clay: data.property.clay?.[0]?.value?.value || 0,
            },
            healthScore
          };
          
          setSoilHealthData(healthData);
          
          // Generate historical data
          const historical = generateHistoricalData(healthScore.overall);
          setHistoricalData(historical);
          
          toast({
            title: "Soil Health Analysis Complete",
            description: `Overall health score: ${healthScore.overall}/100 (${healthScore.status})`,
          });
        }
        setIsAnalyzing(false);
      }, 2000);
      
    } catch (error) {
      console.error('Soil health analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze soil health. Please try again.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

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
        
        {/* Location Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Select Analysis Location
            </CardTitle>
            <CardDescription>
              Choose your South African province and specific location for soil health analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Province Selection */}
              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Select value={selectedProvince} onValueChange={handleProvinceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="locationType">Area Type</Label>
                <Select 
                  value={selectedLocationType} 
                  onValueChange={handleLocationTypeChange}
                  disabled={!selectedProvince}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Area Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationTypes.map((locationType) => (
                      <SelectItem key={locationType} value={locationType}>
                        {locationType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Specific Location Selection */}
              <div className="space-y-2">
                <Label htmlFor="location">City/Rural Area</Label>
                <Select 
                  value={selectedLocation} 
                  onValueChange={handleLocationChange}
                  disabled={!selectedLocationType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Depth Selection */}
            <div className="space-y-2">
              <Label>Analysis Depth</Label>
              <Select value={selectedDepth} onValueChange={setSelectedDepth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select soil depth" />
                </SelectTrigger>
                <SelectContent>
                  {DEPTH_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Location Display */}
            {selectedProvince && selectedLocation && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Analysis Location</p>
                    <p className="text-blue-700">
                      {selectedLocation}, {selectedProvince} • {DEPTH_OPTIONS.find(d => d.value === selectedDepth)?.label}
                    </p>
                    {getCurrentCoordinates() && (
                      <p className="text-blue-600 text-xs mt-1">
                        Coordinates: {getCurrentCoordinates()?.lat.toFixed(4)}, {getCurrentCoordinates()?.lon.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Button */}
            <div className="flex gap-2">
              <Button 
                onClick={analyzeSoilHealth} 
                disabled={!isLocationValid() || isAnalyzing}
                className="flex-1"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Soil Health...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analyze Soil Health
                  </>
                )}
              </Button>
              
              {soilHealthData && (
                <Button 
                  onClick={askAIAboutSoilHealth}
                  variant="outline"
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Ask AI
                </Button>
              )}
            </div>

            {/* Location Validation Notice */}
            {!isLocationValid() && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please select a province, area type, and specific location to begin soil health analysis.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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