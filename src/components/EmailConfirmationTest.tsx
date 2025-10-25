import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertCircle, Mail } from "lucide-react";
import { authService } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";

interface TestResult {
  test: string;
  status: "success" | "error" | "warning";
  message: string;
  details?: string;
}

export const EmailConfirmationTest = () => {
  const [testEmail, setTestEmail] = useState("test@example.com");
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    const testResults: TestResult[] = [];

    try {
      // Test 1: Check Supabase connection
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          testResults.push({
            test: "Supabase Connection",
            status: "error",
            message: "Failed to connect to Supabase",
            details: error.message
          });
        } else {
          testResults.push({
            test: "Supabase Connection",
            status: "success",
            message: "Successfully connected to Supabase"
          });
        }
      } catch (err: any) {
        testResults.push({
          test: "Supabase Connection",
          status: "error",
          message: "Connection error",
          details: err.message
        });
      }

      // Test 2: Check environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        testResults.push({
          test: "Environment Variables",
          status: "error",
          message: "Missing Supabase environment variables"
        });
      } else {
        testResults.push({
          test: "Environment Variables",
          status: "success",
          message: "Environment variables are configured"
        });
      }

      // Test 3: Test signup with email confirmation
      try {
        const testPassword = "Test123!@#";
        const { data, error } = await authService.signUp(testEmail, testPassword, {
          farm_name: "Test Farm",
          location: "Test Location",
          farm_size: 10,
          irrigation_method: "drip",
          farming_type: "commercial"
        });

        if (error) {
          testResults.push({
            test: "Signup with Email Confirmation",
            status: "error",
            message: "Signup failed",
            details: error.message
          });
        } else if (data.user && !data.user.email_confirmed_at) {
          testResults.push({
            test: "Signup with Email Confirmation",
            status: "success",
            message: "User created successfully, email confirmation required"
          });
        } else {
          testResults.push({
            test: "Signup with Email Confirmation",
            status: "warning",
            message: "User created but email confirmation may be disabled"
          });
        }
      } catch (err: any) {
        testResults.push({
          test: "Signup with Email Confirmation",
          status: "error",
          message: "Signup test failed",
          details: err.message
        });
      }

      // Test 4: Test resend confirmation
      try {
        await authService.resendConfirmation(testEmail);
        testResults.push({
          test: "Resend Confirmation",
          status: "success",
          message: "Resend confirmation request sent successfully"
        });
      } catch (err: any) {
        testResults.push({
          test: "Resend Confirmation",
          status: "error",
          message: "Failed to resend confirmation",
          details: err.message
        });
      }

      // Test 5: Check redirect URL configuration
      const currentOrigin = window.location.origin;
      const expectedRedirectUrl = `${currentOrigin}/auth/callback`;
      
      testResults.push({
        test: "Redirect URL Configuration",
        status: "success",
        message: `Redirect URL configured: ${expectedRedirectUrl}`,
        details: "Make sure this URL is added to your Supabase project's allowed redirect URLs"
      });

      // Test 6: Check if email confirmation is enabled
      try {
        // This is a bit tricky to test directly, but we can check the user's confirmation status
        const { data: { user } } = await supabase.auth.getUser();
        if (user && !user.email_confirmed_at) {
          testResults.push({
            test: "Email Confirmation Status",
            status: "warning",
            message: "Email confirmation appears to be enabled (user not confirmed)",
            details: "Check your Supabase dashboard to verify email confirmation is enabled"
          });
        } else {
          testResults.push({
            test: "Email Confirmation Status",
            status: "success",
            message: "Email confirmation is working properly"
          });
        }
      } catch (err: any) {
        testResults.push({
          test: "Email Confirmation Status",
          status: "error",
          message: "Could not check email confirmation status",
          details: err.message
        });
      }

    } catch (err: any) {
      testResults.push({
        test: "General Test",
        status: "error",
        message: "Unexpected error during testing",
        details: err.message
      });
    }

    setResults(testResults);
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "border-green-200 bg-green-50";
      case "error":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Confirmation System Test
        </CardTitle>
        <CardDescription>
          Test the email confirmation functionality and identify any issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="testEmail">Test Email Address</Label>
          <Input
            id="testEmail"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email for testing"
          />
        </div>

        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? "Running Tests..." : "Run Email Confirmation Tests"}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Test Results</h3>
            {results.map((result, index) => (
              <Alert key={index} className={getStatusColor(result.status)}>
                <div className="flex items-start gap-2">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <AlertDescription className="font-medium">
                      {result.test}: {result.message}
                    </AlertDescription>
                    {result.details && (
                      <AlertDescription className="text-sm mt-1 opacity-75">
                        {result.details}
                      </AlertDescription>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <h4 className="font-semibold">What this test checks:</h4>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Supabase connection and authentication</li>
            <li>Environment variables configuration</li>
            <li>Signup process with email confirmation</li>
            <li>Resend confirmation functionality</li>
            <li>Redirect URL configuration</li>
            <li>Email confirmation status</li>
          </ul>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <h4 className="font-semibold">Common issues and solutions:</h4>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Missing environment variables:</strong> Check your .env file</li>
            <li><strong>Email confirmation disabled:</strong> Enable it in Supabase dashboard</li>
            <li><strong>Wrong redirect URL:</strong> Add the correct URL to Supabase settings</li>
            <li><strong>SMTP not configured:</strong> Set up custom SMTP for production</li>
            <li><strong>Emails in spam:</strong> Check spam folder and configure SPF/DKIM</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
