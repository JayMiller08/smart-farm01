import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Bot, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AIIntegrationTest: React.FC = () => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState<{
    navigation: boolean | null;
    sessionStorage: boolean | null;
    dataPreparation: boolean | null;
  }>({
    navigation: null,
    sessionStorage: null,
    dataPreparation: null
  });

  const testNavigation = () => {
    try {
      console.log('Testing navigation...');
      // Test if navigate function is available
      if (typeof navigate === 'function') {
        console.log('Navigate function is available');
        setTestResults(prev => ({ ...prev, navigation: true }));
        return true;
      } else {
        console.error('Navigate function not available');
        setTestResults(prev => ({ ...prev, navigation: false }));
        return false;
      }
    } catch (error) {
      console.error('Navigation test failed:', error);
      setTestResults(prev => ({ ...prev, navigation: false }));
      return false;
    }
  };

  const testSessionStorage = () => {
    try {
      console.log('Testing sessionStorage...');
      const testData = { test: 'data', timestamp: new Date().toISOString() };
      sessionStorage.setItem('testData', JSON.stringify(testData));
      const retrieved = JSON.parse(sessionStorage.getItem('testData') || '{}');
      sessionStorage.removeItem('testData');
      
      if (retrieved.test === 'data') {
        console.log('SessionStorage working correctly');
        setTestResults(prev => ({ ...prev, sessionStorage: true }));
        return true;
      } else {
        console.error('SessionStorage test failed');
        setTestResults(prev => ({ ...prev, sessionStorage: false }));
        return false;
      }
    } catch (error) {
      console.error('SessionStorage test failed:', error);
      setTestResults(prev => ({ ...prev, sessionStorage: false }));
      return false;
    }
  };

  const testDataPreparation = () => {
    try {
      console.log('Testing data preparation...');
      
      // Mock soil data
      const mockSoilData = {
        location: 'Johannesburg, Gauteng',
        depth: '0-20',
        properties: [
          { name: 'pH Level', value: 6.5, unit: 'pH', description: 'Soil acidity/alkalinity' },
          { name: 'Nitrogen', value: 45, unit: 'ppm', description: 'Total nitrogen content' }
        ],
        prompt: 'Test prompt for AI analysis'
      };

      const soilAnalysisData = {
        ...mockSoilData,
        prompt: `I have soil analysis data for ${mockSoilData.location} at ${mockSoilData.depth} depth. Here are the soil properties found:

${mockSoilData.properties.map(prop => `• ${prop.name}: ${prop.value} ${prop.unit || ''}`).join('\n')}

Please analyze this soil data and provide farming recommendations.`
      };

      console.log('Prepared soil analysis data:', soilAnalysisData);
      
      if (soilAnalysisData.prompt && soilAnalysisData.properties.length > 0) {
        console.log('Data preparation successful');
        setTestResults(prev => ({ ...prev, dataPreparation: true }));
        return true;
      } else {
        console.error('Data preparation failed');
        setTestResults(prev => ({ ...prev, dataPreparation: false }));
        return false;
      }
    } catch (error) {
      console.error('Data preparation test failed:', error);
      setTestResults(prev => ({ ...prev, dataPreparation: false }));
      return false;
    }
  };

  const testFullAIWorkflow = () => {
    console.log('Testing full AI workflow...');
    
    // Test all components
    const navTest = testNavigation();
    const storageTest = testSessionStorage();
    const dataTest = testDataPreparation();
    
    if (navTest && storageTest && dataTest) {
      // Prepare mock data
      const mockData = {
        location: 'Johannesburg, Gauteng',
        depth: '0-20',
        properties: [
          { name: 'pH Level', value: 6.5, unit: 'pH', description: 'Soil acidity/alkalinity' },
          { name: 'Nitrogen', value: 45, unit: 'ppm', description: 'Total nitrogen content' }
        ],
        prompt: `I have soil analysis data for Johannesburg, Gauteng at 0-20 depth. Here are the soil properties found:

• pH Level: 6.5 pH
• Nitrogen: 45 ppm

Please analyze this soil data and provide comprehensive farming recommendations including:
1. Soil health assessment
2. Suitable crops for this soil type
3. Fertilizer recommendations
4. Irrigation needs
5. Any soil improvement suggestions
6. Seasonal planting advice for this location`
      };

      // Store data
      sessionStorage.setItem('soilAnalysisData', JSON.stringify(mockData));
      console.log('Mock soil data stored in sessionStorage');
      
      // Navigate to AI Advisor
      console.log('Navigating to AI Advisor...');
      navigate('/ai-advisor');
    }
  };

  const runAllTests = () => {
    testNavigation();
    testSessionStorage();
    testDataPreparation();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Integration Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h4 className="font-medium">Test Results:</h4>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                {testResults.navigation === true ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : testResults.navigation === false ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                )}
                <span className="text-sm">Navigation Function</span>
              </div>
              <Badge variant={testResults.navigation === true ? "default" : testResults.navigation === false ? "destructive" : "outline"}>
                {testResults.navigation === true ? "PASS" : testResults.navigation === false ? "FAIL" : "NOT TESTED"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                {testResults.sessionStorage === true ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : testResults.sessionStorage === false ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                )}
                <span className="text-sm">Session Storage</span>
              </div>
              <Badge variant={testResults.sessionStorage === true ? "default" : testResults.sessionStorage === false ? "destructive" : "outline"}>
                {testResults.sessionStorage === true ? "PASS" : testResults.sessionStorage === false ? "FAIL" : "NOT TESTED"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                {testResults.dataPreparation === true ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : testResults.dataPreparation === false ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                )}
                <span className="text-sm">Data Preparation</span>
              </div>
              <Badge variant={testResults.dataPreparation === true ? "default" : testResults.dataPreparation === false ? "destructive" : "outline"}>
                {testResults.dataPreparation === true ? "PASS" : testResults.dataPreparation === false ? "FAIL" : "NOT TESTED"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={runAllTests} variant="outline" size="sm">
            Run All Tests
          </Button>
          <Button onClick={testFullAIWorkflow} size="sm">
            Test Full AI Workflow
          </Button>
        </div>

        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-700">
            <strong>Check Browser Console</strong> for detailed logs about AI integration tests.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
