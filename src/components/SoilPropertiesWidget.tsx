import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSoilData } from '@/hooks/useSoilData';
import { MapPin, Droplets, Thermometer, Zap, Loader2 } from 'lucide-react';

interface SoilPropertiesWidgetProps {
  className?: string;
}

const DEPTH_OPTIONS = [
  { value: '0-20', label: '0-20 cm (Surface)' },
  { value: '20-50', label: '20-50 cm (Subsurface)' },
  { value: '50-100', label: '50-100 cm (Deep)' },
  { value: '100-200', label: '100-200 cm (Very Deep)' },
];

const PROPERTY_OPTIONS = [
  { value: 'ph', label: 'pH Level', icon: Droplets },
  { value: 'organic_carbon', label: 'Organic Carbon', icon: Zap },
  { value: 'nitrogen', label: 'Nitrogen', icon: Thermometer },
  { value: 'phosphorus', label: 'Phosphorus', icon: Zap },
  { value: 'potassium', label: 'Potassium', icon: Zap },
  { value: 'calcium', label: 'Calcium', icon: Zap },
  { value: 'magnesium', label: 'Magnesium', icon: Zap },
  { value: 'sodium', label: 'Sodium', icon: Zap },
  { value: 'cec', label: 'Cation Exchange Capacity', icon: Zap },
  { value: 'sand', label: 'Sand Content', icon: Zap },
  { value: 'silt', label: 'Silt Content', icon: Zap },
  { value: 'clay', label: 'Clay Content', icon: Zap },
];

export function SoilPropertiesWidget({ className }: SoilPropertiesWidgetProps) {
  const { data, loading, error, getSoilProperty, getSoilPH, getMultipleSoilProperties } = useSoilData();
  
  const [coordinates, setCoordinates] = useState({
    lat: -0.7196, // Default Kenya coordinates
    lon: 35.2400,
  });
  const [selectedDepth, setSelectedDepth] = useState('0-20');
  const [selectedProperty, setSelectedProperty] = useState('ph');

  const handleGetSoilProperty = async () => {
    try {
      await getSoilProperty({
        lat: coordinates.lat,
        lon: coordinates.lon,
        property: selectedProperty,
        depth: selectedDepth,
      });
    } catch (error) {
      console.error('Failed to get soil property:', error);
    }
  };

  const handleGetSoilPH = async () => {
    try {
      await getSoilPH(coordinates.lat, coordinates.lon, selectedDepth);
    } catch (error) {
      console.error('Failed to get soil pH:', error);
    }
  };

  const handleGetMultipleProperties = async () => {
    const properties = ['ph', 'organic_carbon', 'nitrogen', 'phosphorus', 'potassium'];
    try {
      await getMultipleSoilProperties(coordinates.lat, coordinates.lon, properties, selectedDepth);
    } catch (error) {
      console.error('Failed to get multiple soil properties:', error);
    }
  };

  const renderPropertyValue = (propertyData: any) => {
    if (propertyData.error) {
      return <Badge variant="destructive">{propertyData.error}</Badge>;
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">
            {propertyData.value?.value?.toFixed(2) || 'N/A'}
          </span>
          <Badge variant="outline">
            {propertyData.value?.unit || 'N/A'}
          </Badge>
        </div>
        
        {propertyData.uncertainty && propertyData.uncertainty.length > 0 && (
          <div className="text-sm text-muted-foreground">
            <span>Uncertainty: </span>
            <span className="font-medium">
              {propertyData.uncertainty[1]?.lower_bound?.toFixed(2) || 'N/A'} - {propertyData.uncertainty[1]?.upper_bound?.toFixed(2) || 'N/A'}
            </span>
          </div>
        )}
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
            Get detailed soil property data for any location using the ISDA Africa API
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Location Input */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={coordinates.lat}
                onChange={(e) => setCoordinates(prev => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))}
                placeholder="e.g., -0.7196"
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
                placeholder="e.g., 35.2400"
              />
            </div>
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
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleGetSoilProperty} 
              disabled={loading}
              className="flex-1 min-w-[120px]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Get {PROPERTY_OPTIONS.find(p => p.value === selectedProperty)?.label}
            </Button>
            
            <Button 
              onClick={handleGetSoilPH} 
              disabled={loading}
              variant="outline"
              className="flex-1 min-w-[120px]"
            >
              Get pH Only
            </Button>
            
            <Button 
              onClick={handleGetMultipleProperties} 
              disabled={loading}
              variant="secondary"
              className="flex-1 min-w-[120px]"
            >
              Get All Properties
            </Button>
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
                  <Badge variant="outline">
                    {data.depth} depth
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Location: {data.location.lat.toFixed(4)}, {data.location.lon.toFixed(4)}
                </div>

                {/* Display all properties */}
                <div className="grid gap-4">
                  {Object.entries(data.property).map(([propertyName, propertyData]) => {
                    const propertyOption = PROPERTY_OPTIONS.find(p => p.value === propertyName);
                    const IconComponent = propertyOption?.icon || Zap;
                    
                    return (
                      <div key={propertyName} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <IconComponent className="h-4 w-4" />
                          <span className="font-medium">
                            {propertyOption?.label || propertyName}
                          </span>
                        </div>
                        {renderPropertyValue(propertyData[0])}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
