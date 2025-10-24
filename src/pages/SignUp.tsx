import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sprout, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    farmName: "",
    email: "",
    location: "",
    farmSize: "",
    irrigationMethod: "",
    farmingType: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const [isLoading, setIsLoading] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await authService.signUp(formData.email, formData.password, {
        farm_name: formData.farmName,
        location: formData.location,
        farm_size: parseFloat(formData.farmSize),
        irrigation_method: formData.irrigationMethod,
        farming_type: formData.farmingType,
      });
      
      setConfirmationEmail(formData.email);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!confirmationEmail) return;
    
    setIsLoading(true);
    try {
      await authService.resendConfirmation(confirmationEmail);
      toast({
        title: "Email Sent",
        description: "Confirmation email has been resent. Please check your inbox.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend confirmation email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (confirmationEmail) {
    const mailtoLink = `mailto:${confirmationEmail}`;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-elegant">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sprout className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">Check Your Email</CardTitle>
            <CardDescription>We've sent a confirmation link to verify your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-center mb-2">
                We sent a confirmation link to:
              </p>
              <p className="text-center font-semibold text-lg">
                {confirmationEmail}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Please click the link in your email to verify your account and complete sign-up.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleResendConfirmation} 
                  variant="outline" 
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Resend confirmation email"}
                </Button>
                
                <Button 
                  asChild 
                  className="flex-1"
                >
                  <a href={mailtoLink}>Open email app</a>
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground space-y-2 border-t pt-4">
              <p className="font-medium">Didn't receive the email?</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Check your spam or junk folder</li>
                <li>Wait a few minutes and check again</li>
                <li>Click "Resend confirmation email" above</li>
              </ul>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-sm text-primary hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-elegant">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Sprout className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Create Your Farm Profile</CardTitle>
          <CardDescription>Join Smart Farm to optimize your agricultural operations</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="farmName">Farm Name *</Label>
                <Input
                  id="farmName"
                  placeholder="e.g., Greenfield Farm"
                  required
                  value={formData.farmName}
                  onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Farm Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="farm@example.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Nelspruit, Mpumalanga"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmSize">Farm Size (hectares) *</Label>
                <Input
                  id="farmSize"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 5"
                  required
                  value={formData.farmSize}
                  onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="irrigationMethod">Irrigation Method *</Label>
                <Select required value={formData.irrigationMethod} onValueChange={(value) => setFormData({ ...formData, irrigationMethod: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="drip">Drip</SelectItem>
                    <SelectItem value="sprinkler">Sprinkler</SelectItem>
                    <SelectItem value="flood">Flood</SelectItem>
                    <SelectItem value="rainfed">Rain-fed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmingType">Type of Farming *</Label>
                <Select required value={formData.farmingType} onValueChange={(value) => setFormData({ ...formData, farmingType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="subsistence">Subsistence</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 mt-2">
                <p className="font-semibold">Password Requirements:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>At least 8 characters long</li>
                  <li>Contains uppercase and lowercase letters</li>
                  <li>Contains at least one number</li>
                  <li>Contains at least one special character (@$!%*?&)</li>
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-primary hover:underline font-medium"
              >
                Sign In
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;
