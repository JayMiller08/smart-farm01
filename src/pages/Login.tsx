import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, Leaf } from "lucide-react";
import farmHero from "@/assets/farm-hero.jpg";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple demo login - store user session
    localStorage.setItem("smartfarm_user", email);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* Hero Section - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src={farmHero} 
          alt="Smart Farm - Precision Agriculture"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70 flex flex-col justify-center p-12 text-primary-foreground">
          <div className="flex items-center gap-3 mb-6">
            <Sprout className="h-12 w-12" />
            <h1 className="text-4xl font-bold">Smart Farm</h1>
          </div>
          <p className="text-xl mb-4 opacity-95">AI-Powered Precision Agriculture</p>
          <p className="text-lg opacity-90 max-w-md">
            Optimize yields, reduce costs, and farm smarter with data-driven insights tailored for Mpumalanga farmers.
          </p>
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              <span>Weather-based recommendations</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              <span>AI farm advisor available 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              <span>Smart input calculators</span>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-muted/30">
        <Card className="w-full max-w-md shadow-large">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-2 lg:hidden">
              <Sprout className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to Smart Farm</CardTitle>
            <CardDescription>
              Sign in to access your farm dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="farmer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg" variant="hero">
                Sign In
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="text-primary hover:underline font-medium"
                >
                  Sign Up
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
