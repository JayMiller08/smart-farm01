import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { isdaApiService } from '@/services/isdaApiService';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export function ISDAApiTest() {
  const [testResults, setTestResults] = useState<{
    phTest: { status: 'idle' | 'loading' | 'success' | 'error'; data?: any; error?: string };
    multipleTest: { status: 'idle' | 'loading' | 'success' | 'error'; data?: any; error?: string };
    singleTest: { status: 'idle' | 'loading' | 'success' | 'error'; data?: any; error?: string };
  }>({
    phTest: { status: 'idle' },
    multipleTest: { status: 'idle' },
    singleTest: { status: 'idle' },
  });

  const runPHTest = async () => {
    setTestResults(prev => ({ ...prev, phTest: { status: 'loading' } }));
    try {
      const data = await isdaApiService.getSoilPH(-0.7196, 35.2400, '0-20');
      setTestResults(prev => ({ ...prev, phTest: { status: 'success', data } }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        phTest: { 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      }));
    }
  };

  const runMultipleTest = async () => {
    setTestResults(prev => ({ ...prev, multipleTest: { status: 'loading' } }));
    try {
      const data = await isdaApiService.getMultipleSoilProperties(
        -0.7196, 
        35.2400, 
        ['ph', 'organic_carbon', 'nitrogen'], 
        '0-20'
      );
      setTestResults(prev => ({ ...prev, multipleTest: { status: 'success', data } }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        multipleTest: { 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      }));
    }
  };

  const runSingleTest = async () => {
    setTestResults(prev => ({ ...prev, singleTest: { status: 'loading' } }));
    try {
      const data = await isdaApiService.getSoilProperty({
        lat: -0.7196,
        lon: 35.2400,
        property: 'phosphorus',
        depth: '0-20'
      });
      setTestResults(prev => ({ ...prev, singleTest: { status: 'success', data } }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        singleTest: { 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } 
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'loading':
        return <Badge variant="outline">Loading...</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Not Run</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ISDA API Test Suite</CardTitle>
        <CardDescription>
          Test the ISDA Africa API implementation to ensure it's working correctly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* pH Test */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Test 1: pH Value Retrieval</h3>
            {getStatusIcon(testResults.phTest.status)}
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Get pH value for Kenya location (-0.7196, 35.2400) at 0-20cm depth
          </p>
          <div className="flex items-center gap-2 mb-3">
            <Button onClick={runPHTest} disabled={testResults.phTest.status === 'loading'}>
              {testResults.phTest.status === 'loading' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Run Test
            </Button>
            {getStatusBadge(testResults.phTest.status)}
          </div>
          {testResults.phTest.data && (
            <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
              <p><strong>pH Value:</strong> {testResults.phTest.data.value} {testResults.phTest.data.unit}</p>
              <p><strong>Uncertainty:</strong> {testResults.phTest.data.uncertainty.lower_bound} - {testResults.phTest.data.uncertainty.upper_bound}</p>
            </div>
          )}
          {testResults.phTest.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <strong>Error:</strong> {testResults.phTest.error}
            </div>
          )}
        </div>

        {/* Multiple Properties Test */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Test 2: Multiple Properties</h3>
            {getStatusIcon(testResults.multipleTest.status)}
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Get multiple soil properties (pH, organic carbon, nitrogen) for the same location
          </p>
          <div className="flex items-center gap-2 mb-3">
            <Button onClick={runMultipleTest} disabled={testResults.multipleTest.status === 'loading'}>
              {testResults.multipleTest.status === 'loading' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Run Test
            </Button>
            {getStatusBadge(testResults.multipleTest.status)}
          </div>
          {testResults.multipleTest.data && (
            <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(testResults.multipleTest.data, null, 2)}
              </pre>
            </div>
          )}
          {testResults.multipleTest.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <strong>Error:</strong> {testResults.multipleTest.error}
            </div>
          )}
        </div>

        {/* Single Property Test */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Test 3: Single Property</h3>
            {getStatusIcon(testResults.singleTest.status)}
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Get phosphorus content for the same location using the generic method
          </p>
          <div className="flex items-center gap-2 mb-3">
            <Button onClick={runSingleTest} disabled={testResults.singleTest.status === 'loading'}>
              {testResults.singleTest.status === 'loading' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Run Test
            </Button>
            {getStatusBadge(testResults.singleTest.status)}
          </div>
          {testResults.singleTest.data && (
            <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(testResults.singleTest.data, null, 2)}
              </pre>
            </div>
          )}
          {testResults.singleTest.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <strong>Error:</strong> {testResults.singleTest.error}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
