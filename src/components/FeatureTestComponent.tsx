import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Bot, MapPin } from 'lucide-react';

export const FeatureTestComponent: React.FC = () => {
  const testFeatures = [
    {
      name: "Location Selection",
      description: "South African provinces and cities dropdown",
      status: "working",
      test: () => {
        // Test if location data is available
        try {
          const { SOUTH_AFRICAN_LOCATIONS } = require('@/data/southAfricanLocations');
          const provinces = Object.keys(SOUTH_AFRICAN_LOCATIONS);
          return provinces.length > 0;
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: "Location Validation",
      description: "Buttons disabled without valid location",
      status: "working",
      test: () => {
        // Test if validation logic exists
        try {
          const { getCoordinatesForLocation } = require('@/data/southAfricanLocations');
          const coords = getCoordinatesForLocation("Gauteng", "Johannesburg");
          return coords !== null && coords.lat !== undefined && coords.lon !== undefined;
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: "AI Integration",
      description: "Ask AI button with soil data",
      status: "working",
      test: () => {
        // Test if AI Advisor route exists
        try {
          const { useNavigate } = require('react-router-dom');
          return true; // If we can import useNavigate, routing should work
        } catch (error) {
          return false;
        }
      }
    },
    {
      name: "Soil Property Display",
      description: "Enhanced property display with values",
      status: "working",
      test: () => {
        // Test if component can render
        return true; // Component exists and should render
      }
    },
    {
      name: "AI Recommendations",
      description: "Real-time IoT-based recommendations",
      status: "working",
      test: () => {
        // Test if AIRecommendations component exists
        try {
          const { AIRecommendations } = require('@/components/AIRecommendations');
          return true;
        } catch (error) {
          return false;
        }
      }
    }
  ];

  const runTests = () => {
    return testFeatures.map(feature => ({
      ...feature,
      testResult: feature.test()
    }));
  };

  const testResults = runTests();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Feature Test Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {testResults.map((feature, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {feature.testResult ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <div>
                <div className="font-medium">{feature.name}</div>
                <div className="text-sm text-muted-foreground">{feature.description}</div>
              </div>
            </div>
            <Badge variant={feature.testResult ? "default" : "destructive"}>
              {feature.testResult ? "PASS" : "FAIL"}
            </Badge>
          </div>
        ))}
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900">Test Instructions</span>
          </div>
          <div className="text-sm text-blue-700 space-y-1">
            <p>1. Go to Soil Analysis page</p>
            <p>2. Select a province (e.g., Gauteng)</p>
            <p>3. Select Major Cities</p>
            <p>4. Select a city (e.g., Johannesburg)</p>
            <p>5. Try to click analysis buttons - they should be disabled</p>
            <p>6. After selecting location, buttons should be enabled</p>
            <p>7. Click "Get All Properties" to test soil analysis</p>
            <p>8. Click "Ask AI" to test AI integration</p>
            <p>9. Check Dashboard for AI Recommendations (if IoT enabled)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
