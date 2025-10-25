import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, MapPin } from 'lucide-react';
import { SOUTH_AFRICAN_LOCATIONS, getCoordinatesForLocation } from '@/data/southAfricanLocations';

export const DropdownTest: React.FC = () => {
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedLocationType, setSelectedLocationType] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const provinces = Object.keys(SOUTH_AFRICAN_LOCATIONS);
  const locationTypes = selectedProvince ? Object.keys(SOUTH_AFRICAN_LOCATIONS[selectedProvince as keyof typeof SOUTH_AFRICAN_LOCATIONS]) : [];
  const locations = selectedProvince && selectedLocationType ? 
    Object.keys((SOUTH_AFRICAN_LOCATIONS as any)[selectedProvince]?.[selectedLocationType] || {}) : [];

  const handleProvinceChange = (province: string) => {
    console.log('Province changed to:', province);
    setSelectedProvince(province);
    setSelectedLocationType('');
    setSelectedLocation('');
  };

  const handleLocationTypeChange = (locationType: string) => {
    console.log('Location type changed to:', locationType);
    setSelectedLocationType(locationType);
    setSelectedLocation('');
  };

  const handleLocationChange = (location: string) => {
    console.log('Location changed to:', location);
    setSelectedLocation(location);
  };

  const getCurrentCoordinates = () => {
    if (selectedProvince && selectedLocation) {
      const coords = getCoordinatesForLocation(selectedProvince, selectedLocation);
      console.log('Getting coordinates for:', selectedProvince, selectedLocation, coords);
      return coords;
    }
    return null;
  };

  const coordinates = getCurrentCoordinates();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Dropdown Test Component
        </CardTitle>
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
            <div className="text-xs text-muted-foreground">
              {provinces.length} provinces available
            </div>
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
            <div className="text-xs text-muted-foreground">
              {locationTypes.length} area types available
            </div>
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
            <div className="text-xs text-muted-foreground">
              {locations.length} locations available
            </div>
          </div>
        </div>

        {/* Selected Location Display */}
        {selectedProvince && selectedLocation && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Selected Location</p>
                <p className="text-blue-700">
                  {selectedLocation}, {selectedProvince}
                </p>
                {coordinates && (
                  <p className="text-blue-600 text-xs mt-1">
                    Coordinates: {coordinates.lat.toFixed(4)}, {coordinates.lon.toFixed(4)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Test Results */}
        <div className="space-y-2">
          <h4 className="font-medium">Test Results:</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              {provinces.length > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">Provinces Loaded</span>
            </div>
            <div className="flex items-center gap-2">
              {locationTypes.length > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">Location Types Loaded</span>
            </div>
            <div className="flex items-center gap-2">
              {locations.length > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">Locations Loaded</span>
            </div>
            <div className="flex items-center gap-2">
              {coordinates ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">Coordinates Retrieved</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            <strong>Check Browser Console</strong> for detailed logs about dropdown changes and coordinate retrieval.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
