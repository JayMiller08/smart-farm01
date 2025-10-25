import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, MapPin } from 'lucide-react';

export const LocationDataTest: React.FC = () => {
  const testLocationData = () => {
    try {
      const { SOUTH_AFRICAN_LOCATIONS, getCoordinatesForLocation } = require('@/data/southAfricanLocations');
      
      console.log('SOUTH_AFRICAN_LOCATIONS:', SOUTH_AFRICAN_LOCATIONS);
      
      const provinces = Object.keys(SOUTH_AFRICAN_LOCATIONS);
      console.log('Provinces:', provinces);
      
      if (provinces.length > 0) {
        const firstProvince = provinces[0];
        console.log('First province:', firstProvince);
        
        const provinceData = SOUTH_AFRICAN_LOCATIONS[firstProvince];
        console.log('Province data:', provinceData);
        
        const locationTypes = Object.keys(provinceData);
        console.log('Location types:', locationTypes);
        
        if (locationTypes.length > 0) {
          const firstLocationType = locationTypes[0];
          console.log('First location type:', firstLocationType);
          
          const locations = Object.keys(provinceData[firstLocationType]);
          console.log('Locations:', locations);
          
          if (locations.length > 0) {
            const firstLocation = locations[0];
            console.log('First location:', firstLocation);
            
            const coords = getCoordinatesForLocation(firstProvince, firstLocation);
            console.log('Coordinates:', coords);
            
            return {
              success: true,
              provinces: provinces.length,
              locationTypes: locationTypes.length,
              locations: locations.length,
              coordinates: coords
            };
          }
        }
      }
      
      return { success: false, error: 'No data found' };
    } catch (error) {
      console.error('Error testing location data:', error);
      return { success: false, error: error.message };
    }
  };

  const testResult = testLocationData();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Data Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          {testResult.success ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          <div>
            <div className="font-medium">
              {testResult.success ? 'Location Data Loaded Successfully' : 'Location Data Failed to Load'}
            </div>
            {!testResult.success && (
              <div className="text-sm text-red-600">Error: {testResult.error}</div>
            )}
          </div>
        </div>

        {testResult.success && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{testResult.provinces}</div>
              <div className="text-sm text-blue-700">Provinces</div>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{testResult.locationTypes}</div>
              <div className="text-sm text-green-700">Location Types</div>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">{testResult.locations}</div>
              <div className="text-sm text-purple-700">Locations</div>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="text-sm font-bold text-orange-900">
                {testResult.coordinates ? 'Valid' : 'Invalid'}
              </div>
              <div className="text-sm text-orange-700">Coordinates</div>
            </div>
          </div>
        )}

        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            <strong>Check Browser Console</strong> for detailed logs about the location data structure.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
