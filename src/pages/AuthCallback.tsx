import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sprout, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Processing email confirmation...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the current session after email confirmation
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          setStatus("error");
          setMessage("Failed to confirm email. Please try again or contact support.");
          return;
        }

        if (session?.user) {
          setStatus("success");
          setMessage("Your email has been confirmed! Redirecting to dashboard...");
          
          // Redirect to dashboard after a brief delay
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        } else {
          setStatus("error");
          setMessage("Email confirmed, but no active session found. Please sign in.");
          
          // Redirect to login after delay
          setTimeout(() => {
            navigate("/");
          }, 3000);
        }
      } catch (err) {
        console.error("Callback error:", err);
        setStatus("error");
        setMessage("An unexpected error occurred. Please try signing in manually.");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            {status === "processing" && <Sprout className="h-8 w-8 text-primary animate-pulse" />}
            {status === "success" && <CheckCircle2 className="h-8 w-8 text-green-600" />}
            {status === "error" && <XCircle className="h-8 w-8 text-destructive" />}
          </div>
          <CardTitle className="text-2xl">
            {status === "processing" && "Confirming Email"}
            {status === "success" && "Email Confirmed!"}
            {status === "error" && "Confirmation Issue"}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "processing" && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          {status === "error" && (
            <div className="space-y-4">
              <Button 
                onClick={() => navigate("/")} 
                className="w-full"
              >
                Go to Sign In
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                If you continue to have issues, please contact support.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
