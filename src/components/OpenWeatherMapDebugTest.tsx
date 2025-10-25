import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Cloud, RefreshCw, ExternalLink } from "lucide-react";

export const OpenWeatherMapDebugTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<Array<{ test: string; status: 'success' | 'error'; message: string; details?: any }>>([]);

  const runDebugTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    const results: Array<{ test: string; status: 'success' | 'error'; message: string; details?: any }> = [];

    try {
      // Test 1: Direct API call with known coordinates
      console.log('Testing direct OpenWeatherMap API call...');
      const testLat = -25.4744; // Nelspruit coordinates
      const testLng = 30.9703;
      const apiKey = '7de55a19792e888f2323e76feb7f4f6d';
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${testLat}&lon=${testLng}&appid=${apiKey}&units=metric`;
      
      console.log('Testing URL:', url);
      
      const response = await fetch(url);
      const responseText = await response.text();
      
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);
      
      if (response.ok) {
        const data = JSON.parse(responseText);
        results.push({
          test: 'Direct API Call',
          status: 'success',
          message: `API call successful: ${data.name}, ${data.main.temp}°C`,
          details: data
        });
      } else {
        results.push({
          test: 'Direct API Call',
          status: 'error',
          message: `API call failed: ${response.status} ${response.statusText}`,
          details: responseText
        });
      }

      // Test 2: Geolocation
      console.log('Testing geolocation...');
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            results.push({
              test: 'Geolocation',
              status: 'success',
              message: `Location detected: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
            });
          },
          (error) => {
            results.push({
              test: 'Geolocation',
              status: 'error',
              message: `Geolocation error: ${error.message}`
            });
          },
          { timeout: 5000 }
        );
      } else {
        results.push({
          test: 'Geolocation',
          status: 'error',
          message: 'Geolocation not supported by browser'
        });
      }

      // Test 3: API with user location (if available)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            const userUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${userLat}&lon=${userLng}&appid=${apiKey}&units=metric`;
            
            try {
              const userResponse = await fetch(userUrl);
              const userData = await userResponse.json();
              
              if (userResponse.ok) {
                results.push({
                  test: 'API with User Location',
                  status: 'success',
                  message: `User location API call successful: ${userData.name}, ${userData.main.temp}°C`,
                  details: userData
                });
              } else {
                results.push({
                  test: 'API with User Location',
                  status: 'error',
                  message: `User location API call failed: ${userResponse.status}`,
                  details: userData
                });
              }
            } catch (error: any) {
              results.push({
                test: 'API with User Location',
                status: 'error',
                message: `User location API error: ${error.message}`
              });
            }
            
            setTestResults([...results]);
          },
          (error) => {
            results.push({
              test: 'API with User Location',
              status: 'error',
              message: `Cannot test user location API: ${error.message}`
            });
            setTestResults([...results]);
          },
          { timeout: 5000 }
        );
      }

    } catch (error: any) {
      results.push({
        test: 'General Error',
        status: 'error',
        message: `Unexpected error: ${error.message}`,
        details: error
      });
    }

    setTestResults(results);
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          OpenWeatherMap API Debug Test
        </CardTitle>
        <CardDescription>
          Debug the OpenWeatherMap API connection and identify issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDebugTests} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Running Debug Tests...
            </>
          ) : (
            <>
              <Cloud className="h-4 w-4 mr-2" />
              Run Debug Tests
            </>
          )}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Debug Results:</h4>
            {testResults.map((result, index) => (
              <Alert 
                key={index}
                className={result.status === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}
              >
                <div className="flex items-center gap-2">
                  {result.status === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold">{result.test}</div>
                    <AlertDescription className={result.status === 'success' ? 'text-green-800' : 'text-red-800'}>
                      {result.message}
                    </AlertDescription>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-muted-foreground">
                          View Details
                        </summary>
                        <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <h4 className="font-semibold">What these tests check:</h4>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Direct API Call:</strong> Tests the API with known coordinates (Nelspruit)</li>
            <li><strong>Geolocation:</strong> Tests browser geolocation capability</li>
            <li><strong>API with User Location:</strong> Tests API with user's actual location</li>
            <li><strong>Error Details:</strong> Shows detailed error messages and responses</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
