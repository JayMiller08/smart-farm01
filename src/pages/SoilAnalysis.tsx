import React from 'react';
import { SoilPropertiesWidget } from '@/components/SoilPropertiesWidget';
import { ISDAApiTest } from '@/components/ISDAApiTest';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Info } from 'lucide-react';

export default function SoilAnalysis() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Soil Analysis</h1>
        <p className="text-muted-foreground">
          Analyze soil properties for any location using the ISDA Africa API
        </p>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            About Soil Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This tool uses the ISDA Africa API to provide detailed soil property data for any location. 
            You can analyze various soil properties including pH, organic carbon, nutrients, and texture.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Available Properties:</h4>
              <div className="flex flex-wrap gap-1">
                {['pH Level', 'Organic Carbon', 'Nitrogen', 'Phosphorus', 'Potassium', 'Calcium', 'Magnesium', 'Sodium', 'CEC', 'Sand', 'Silt', 'Clay'].map((property) => (
                  <Badge key={property} variant="outline" className="text-xs">
                    {property}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Depth Options:</h4>
              <div className="space-y-1">
                {['0-20 cm (Surface)', '20-50 cm (Subsurface)', '50-100 cm (Deep)', '100-200 cm (Very Deep)'].map((depth) => (
                  <div key={depth} className="text-xs text-muted-foreground">
                    {depth}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Default Location</p>
                <p className="text-blue-700">
                  The default coordinates are set to Kenya (-0.7196, 35.2400). 
                  You can change these to any location you want to analyze.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Test Suite */}
      <ISDAApiTest />

      {/* Soil Properties Widget */}
      <SoilPropertiesWidget />
    </div>
  );
}
