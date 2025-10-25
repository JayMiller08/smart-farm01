import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSoilData } from '@/hooks/useSoilData';
import { MapPin, Droplets, Thermometer, Zap, Loader2, AlertCircle, CheckCircle, RefreshCw, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SoilPropertiesWidgetProps {
  className?: string;
  selectedCoordinates?: { lat: number; lon: number } | null;
  selectedLocation?: string;
}

const DEPTH_OPTIONS = [
  { value: '0-20', label: '0-20 cm (Surface)' },
  { value: '20-50', label: '20-50 cm (Subsurface)' },
  { value: '50-100', label: '50-100 cm (Deep)' },
  { value: '100-200', label: '100-200 cm (Very Deep)' },
];

const PROPERTY_OPTIONS = [
  { value: 'ph', label: 'pH Level', icon: Droplets, description: 'Soil acidity/alkalinity' },
  { value: 'organic_carbon', label: 'Organic Carbon', icon: Zap, description: 'Carbon content in soil' },
  { value: 'nitrogen', label: 'Nitrogen', icon: Thermometer, description: 'Total nitrogen content' },
  { value: 'phosphorus', label: 'Phosphorus', icon: Zap, description: 'Available phosphorus' },
  { value: 'potassium', label: 'Potassium', icon: Zap, description: 'Available potassium' },
  { value: 'calcium', label: 'Calcium', icon: Zap, description: 'Exchangeable calcium' },
  { value: 'magnesium', label: 'Magnesium', icon: Zap, description: 'Exchangeable magnesium' },
  { value: 'sodium', label: 'Sodium', icon: Zap, description: 'Exchangeable sodium' },
  { value: 'cec', label: 'Cation Exchange Capacity', icon: Zap, description: 'Soil buffering capacity' },
  { value: 'sand', label: 'Sand Content', icon: Zap, description: 'Percentage of sand particles' },
  { value: 'silt', label: 'Silt Content', icon: Zap, description: 'Percentage of silt particles' },
  { value: 'clay', label: 'Clay Content', icon: Zap, description: 'Percentage of clay particles' },
];

export function SoilPropertiesWidget({ className, selectedCoordinates, selectedLocation }: SoilPropertiesWidgetProps) {
  const { data, loading, error, getSoilProperty, getSoilPH, getMultipleSoilProperties, clearData } = useSoilData();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [coordinates, setCoordinates] = useState({
    lat: selectedCoordinates?.lat || -25.4744, // Default to Nelspruit, Mpumalanga
    lon: selectedCoordinates?.lon || 30.9703,
  });
  const [selectedDepth, setSelectedDepth] = useState('0-20');
  const [selectedProperty, setSelectedProperty] = useState('ph');
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<boolean | null>(null);

  // Update coordinates when selectedCoordinates prop changes
  React.useEffect(() => {
    console.log('SoilPropertiesWidget received selectedCoordinates:', selectedCoordinates);
    if (selectedCoordinates) {
      setCoordinates({
        lat: selectedCoordinates.lat,
        lon: selectedCoordinates.lon,
      });
      console.log('Updated coordinates to:', selectedCoordinates);
    }
  }, [selectedCoordinates]);

  const handleGetSoilProperty = async () => {
    if (!coordinates.lat || !coordinates.lon) {
      toast({
        title: "Location Required",
        description: "Please select a location or enter coordinates before analyzing soil properties",
        variant: "destructive",
      });
      return;
    }

    try {
      setLastAction(`Getting ${PROPERTY_OPTIONS.find(p => p.value === selectedProperty)?.label}`);
      setActionSuccess(null);
      
      await getSoilProperty({
        lat: coordinates.lat,
        lon: coordinates.lon,
        property: selectedProperty,
        depth: selectedDepth,
      });
      
      setActionSuccess(true);
      toast({
        title: "Success",
        description: `Successfully retrieved ${PROPERTY_OPTIONS.find(p => p.value === selectedProperty)?.label} data`,
      });
    } catch (error) {
      console.error('Failed to get soil property:', error);
      setActionSuccess(false);
      toast({
        title: "Error",
        description: `Failed to retrieve ${PROPERTY_OPTIONS.find(p => p.value === selectedProperty)?.label} data`,
        variant: "destructive",
      });
    }
  };

  const handleGetSoilPH = async () => {
    if (!coordinates.lat || !coordinates.lon) {
      toast({
        title: "Location Required",
        description: "Please select a location or enter coordinates before analyzing soil properties",
        variant: "destructive",
      });
      return;
    }

    try {
      setLastAction('Getting pH Level');
      setActionSuccess(null);
      
      await getSoilPH(coordinates.lat, coordinates.lon, selectedDepth);
      
      setActionSuccess(true);
      toast({
        title: "Success",
        description: "Successfully retrieved pH data",
      });
    } catch (error) {
      console.error('Failed to get soil pH:', error);
      setActionSuccess(false);
      toast({
        title: "Error",
        description: "Failed to retrieve pH data",
        variant: "destructive",
      });
    }
  };

  const handleGetMultipleProperties = async () => {
    if (!coordinates.lat || !coordinates.lon) {
      toast({
        title: "Location Required",
        description: "Please select a location or enter coordinates before analyzing soil properties",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get all available properties
      const properties = PROPERTY_OPTIONS.map(p => p.value);
      setLastAction(`Getting ${properties.length} soil properties`);
      setActionSuccess(null);
      
      await getMultipleSoilProperties(coordinates.lat, coordinates.lon, properties, selectedDepth);
      
      setActionSuccess(true);
      toast({
        title: "Success",
        description: `Successfully retrieved ${properties.length} soil properties`,
      });
    } catch (error) {
      console.error('Failed to get multiple soil properties:', error);
      setActionSuccess(false);
      toast({
        title: "Error",
        description: "Failed to retrieve multiple soil properties",
        variant: "destructive",
      });
    }
  };

  const handleClearData = () => {
    clearData();
    setLastAction(null);
    setActionSuccess(null);
    toast({
      title: "Cleared",
      description: "Soil analysis data cleared",
    });
  };

  // Helper function to check if location is valid
  const isLocationValid = () => {
    const isValid = coordinates.lat && coordinates.lon && coordinates.lat !== 0 && coordinates.lon !== 0;
    console.log('isLocationValid check:', { coordinates, isValid });
    return isValid;
  };

  const handleAskAI = () => {
    console.log('handleAskAI called, data:', data);
    if (!data) {
      toast({
        title: "No Data Available",
        description: "Please analyze soil properties first before asking AI",
        variant: "destructive",
      });
      return;
    }

    // Prepare comprehensive soil analysis data for AI
    const soilAnalysisData = {
      location: selectedLocation || `${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)}`,
      depth: data.depth,
      properties: Object.entries(data.property).map(([propertyName, propertyData]) => {
        const propertyOption = PROPERTY_OPTIONS.find(p => p.value === propertyName);
        const dataArray = Array.isArray(propertyData) ? propertyData : [propertyData];
        const value = dataArray[0]?.value?.value;
        const unit = dataArray[0]?.value?.unit;
        
        return {
          name: propertyOption?.label || propertyName,
          value: value,
          unit: unit,
          description: propertyOption?.description
        };
      }).filter(prop => prop.value !== undefined && prop.value !== null),
      prompt: `I have soil analysis data for ${selectedLocation || `${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)}`} at ${data.depth} depth. Here are the soil properties found:

${Object.entries(data.property).map(([propertyName, propertyData]) => {
  const propertyOption = PROPERTY_OPTIONS.find(p => p.value === propertyName);
  const dataArray = Array.isArray(propertyData) ? propertyData : [propertyData];
  const value = dataArray[0]?.value?.value;
  const unit = dataArray[0]?.value?.unit;
  
  if (value !== undefined && value !== null) {
    return `• ${propertyOption?.label || propertyName}: ${value} ${unit || ''}`;
  }
  return null;
}).filter(Boolean).join('\n')}

Please analyze this soil data and provide comprehensive farming recommendations including:
1. Soil health assessment
2. Suitable crops for this soil type
3. Fertilizer recommendations
4. Irrigation needs
5. Any soil improvement suggestions
6. Seasonal planting advice for this location`
    };

    console.log('Prepared soil analysis data:', soilAnalysisData);

    // Store the soil analysis data in sessionStorage for AI Advisor
    sessionStorage.setItem('soilAnalysisData', JSON.stringify(soilAnalysisData));
    
    console.log('Navigating to AI Advisor...');
    // Navigate to AI Advisor
    navigate('/ai-advisor');
    
    toast({
      title: "AI Analysis Ready",
      description: "Soil analysis data has been prepared for AI consultation",
    });
  };

  const renderPropertyValue = (propertyData: any) => {
    if (!propertyData) {
      return (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline">No data available</Badge>
        </div>
      );
    }

    if (propertyData.error) {
      return (
        <div className="space-y-2">
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {propertyData.error}
          </Badge>
        </div>
      );
    }

    const value = propertyData.value?.value;
    const unit = propertyData.value?.unit;
    const uncertainty = propertyData.uncertainty;

    if (value === undefined || value === null) {
      return (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline">No data available</Badge>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-primary">
            {typeof value === 'number' ? value.toFixed(2) : value}
          </span>
          {unit && (
            <Badge variant="outline" className="text-sm">
              {unit}
            </Badge>
          )}
        </div>
        
        {uncertainty && uncertainty.length > 0 && (
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-1 mb-1">
              <AlertCircle className="h-3 w-3" />
              <span className="font-medium">Uncertainty Range:</span>
            </div>
            <div className="pl-4">
              {uncertainty.map((unc: any, index: number) => (
                <div key={index} className="text-xs">
                  {unc.lower_bound?.toFixed(2) || 'N/A'} - {unc.upper_bound?.toFixed(2) || 'N/A'}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Data Quality Indicator */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle className="h-3 w-3 text-green-600" />
          <span>Data retrieved successfully</span>
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Soil Properties Analysis
          </CardTitle>
          <CardDescription>
            {selectedLocation ? `Analyzing soil for ${selectedLocation}` : 'Get detailed soil property data for any location using the ISDA Africa API'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Location Input */}
          <div className="space-y-4">
            {selectedLocation && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-900">Selected Location</p>
                    <p className="text-green-700">{selectedLocation}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={coordinates.lat}
                  onChange={(e) => setCoordinates(prev => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))}
                  placeholder="e.g., -25.4744"
                  disabled={!!selectedCoordinates}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={coordinates.lon}
                  onChange={(e) => setCoordinates(prev => ({ ...prev, lon: parseFloat(e.target.value) || 0 }))}
                  placeholder="e.g., 30.9703"
                  disabled={!!selectedCoordinates}
                />
              </div>
            </div>
            
            {selectedCoordinates && (
              <p className="text-xs text-muted-foreground">
                Coordinates are automatically set based on your location selection. You can still manually adjust them if needed.
              </p>
            )}
            
            {/* Location Validation Notice */}
            {(!coordinates.lat || !coordinates.lon || coordinates.lat === 0 || coordinates.lon === 0) && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-900">Location Required</p>
                    <p className="text-amber-700">
                      Please select a location from the dropdown above or enter valid coordinates to analyze soil properties.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Depth Selection */}
          <div className="space-y-2">
            <Label>Soil Depth</Label>
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

          {/* Property Selection */}
          <div className="space-y-2">
            <Label>Soil Property</Label>
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger>
                <SelectValue placeholder="Select soil property" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Status Display */}
            {lastAction && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                ) : actionSuccess === true ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : actionSuccess === false ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : null}
                <span className="text-sm font-medium">
                  {loading ? lastAction + '...' : lastAction}
                </span>
              </div>
            )}

            {/* Button Row 1 */}
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleGetSoilProperty} 
                disabled={loading || !isLocationValid()}
                className="flex-1 min-w-[140px]"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Get {PROPERTY_OPTIONS.find(p => p.value === selectedProperty)?.label}
              </Button>
              
              <Button 
                onClick={handleGetSoilPH} 
                disabled={loading || !isLocationValid()}
                variant="outline"
                className="flex-1 min-w-[120px]"
              >
                <Droplets className="h-4 w-4 mr-2" />
                Get pH Only
              </Button>
            </div>

            {/* Button Row 2 */}
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleGetMultipleProperties} 
                disabled={loading || !isLocationValid()}
                variant="secondary"
                className="flex-1 min-w-[140px]"
              >
                <Zap className="h-4 w-4 mr-2" />
                Get All {PROPERTY_OPTIONS.length} Properties
              </Button>
              
              {data && (
                <>
                  <Button 
                    onClick={handleAskAI} 
                    disabled={loading}
                    className="min-w-[120px] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    Ask AI
                  </Button>
                  
                  <Button 
                    onClick={handleClearData} 
                    disabled={loading}
                    variant="outline"
                    className="min-w-[100px]"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Data
                  </Button>
                </>
              )}
            </div>
            
            {/* Button Status Notice */}
            {!isLocationValid() && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-900">Buttons Disabled</p>
                    <p className="text-amber-700">
                      All analysis buttons are disabled until you select a valid location or enter coordinates.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {data && (
            <div className="space-y-4">
              <Separator />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Soil Analysis Results</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {data.depth} depth
                    </Badge>
                    <Badge variant="secondary">
                      {Object.keys(data.property).length} properties found
                    </Badge>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Location: {data.location.lat.toFixed(4)}, {data.location.lon.toFixed(4)}
                  {selectedLocation && (
                    <span className="ml-2">• {selectedLocation}</span>
                  )}
                </div>

                {/* Properties Summary */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900 text-lg">Analysis Summary</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-900">
                        {Object.keys(data.property).length}
                      </div>
                      <div className="text-sm text-blue-700">Properties Found</div>
                    </div>
                    
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Object.keys(data.property).length}
                      </div>
                      <div className="text-sm text-green-700">Successfully Retrieved</div>
                    </div>
                    
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">
                        {PROPERTY_OPTIONS.length - Object.keys(data.property).length}
                      </div>
                      <div className="text-sm text-amber-700">Not Available</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-blue-700 mb-2">
                    Successfully retrieved {Object.keys(data.property).length} out of {PROPERTY_OPTIONS.length} available soil properties for this location
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(data.property).map((propertyName) => {
                      const propertyOption = PROPERTY_OPTIONS.find(p => p.value === propertyName);
                      return (
                        <Badge key={propertyName} variant="outline" className="text-xs bg-white/70">
                          {propertyOption?.label || propertyName}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Display all properties */}
                <div className="grid gap-4">
                  {Object.entries(data.property).map(([propertyName, propertyData]) => {
                    const propertyOption = PROPERTY_OPTIONS.find(p => p.value === propertyName);
                    const IconComponent = propertyOption?.icon || Zap;
                    
                    // Handle both single property response and multiple properties response
                    const dataArray = Array.isArray(propertyData) ? propertyData : [propertyData];
                    const currentData = dataArray[0];
                    
                    return (
                      <div key={propertyName} className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <span className="font-semibold text-lg">
                                {propertyOption?.label || propertyName}
                              </span>
                              {propertyOption?.description && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {propertyOption.description}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Property Status Badge */}
                          <div className="flex flex-col items-end gap-1">
                            {currentData && (currentData as any).error ? (
                              <Badge variant="destructive" className="text-xs">
                                Error
                              </Badge>
                            ) : currentData?.value?.value !== undefined && currentData?.value?.value !== null ? (
                              <Badge variant="default" className="text-xs bg-green-600">
                                Available
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                No Data
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="border-t pt-3">
                          {renderPropertyValue(currentData)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Missing Properties Notice */}
                {Object.keys(data.property).length < PROPERTY_OPTIONS.length && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-900">Some Properties Not Available</span>
                    </div>
                    <div className="text-sm text-yellow-700">
                      {PROPERTY_OPTIONS.length - Object.keys(data.property).length} properties were not available for this location or depth.
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {PROPERTY_OPTIONS
                        .filter(p => !Object.keys(data.property).includes(p.value))
                        .map((property) => (
                          <Badge key={property.value} variant="outline" className="text-xs text-muted-foreground">
                            {property.label}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
