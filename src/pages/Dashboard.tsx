import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudRain, Calculator, Bug, Sprout, Bell, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";
import WeatherWidget from "@/components/WeatherWidget";
import { FarmOverview } from "@/components/FarmOverview";
import { useAuth } from "@/hooks/useAuth";
import { useFarm } from "@/hooks/useFarm";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { farmProfile } = useFarm();
  
  const userName = user?.email?.split("@")[0] || "Farmer";
  const iotEnabled = farmProfile?.iot_enabled || false;

  // AI-generated farming tips (simulated)
  const farmingTips = [
    {
      title: "Soil Preparation",
      tip: "Test your soil pH before planting. Most crops prefer a pH between 6.0-7.0 for optimal nutrient absorption.",
      icon: Sprout,
    },
    {
      title: "Water Management",
      tip: "Water crops early morning to reduce evaporation. Drip irrigation can save up to 50% more water than traditional methods.",
      icon: CloudRain,
    },
    {
      title: "Pest Control",
      tip: "Inspect crops weekly for early pest detection. Natural predators like ladybugs can help control aphid populations.",
      icon: Bug,
    },
    {
      title: "Fertilizer Timing",
      tip: "Apply nitrogen fertilizers in split doses during the growing season for better nutrient uptake and reduced leaching.",
      icon: Calculator,
    },
  ];

  // Sensor-based tips (simulated based on typical sensor readings)
  const getSensorTips = () => {
    if (!iotEnabled) return [];
    
    return [
      {
        type: "soil_moisture",
        message: "Soil moisture at optimal levels (42%). Continue current irrigation schedule.",
        severity: "success",
      },
      {
        type: "temperature",
        message: "Day/night temperature differential is ideal for crop growth.",
        severity: "success",
      },
      {
        type: "npk",
        message: "Nitrogen levels slightly low. Consider applying 20kg/ha of urea fertilizer this week.",
        severity: "warning",
      },
    ];
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-6">
      {/* Header */}
      <header className="bg-card border-b shadow-soft">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <Sprout className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <div>
              <h1 className="text-lg md:text-xl font-bold">Smart Farm</h1>
              <p className="text-xs md:text-sm text-muted-foreground">Welcome back, {userName}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-3 md:px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Weather Widget */}
        <WeatherWidget />

        {/* Quick Farming Tips */}
        <div className="space-y-3">
          <h2 className="text-base md:text-lg font-semibold">Quick Farming Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {farmingTips.map((tip) => (
              <Card key={tip.title} className="shadow-soft">
                <CardHeader className="p-3 md:p-4 pb-2 md:pb-3">
                  <div className="flex items-start gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 rounded-lg bg-primary/10 flex-shrink-0">
                      <tip.icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm md:text-base mb-1 md:mb-2">{tip.title}</CardTitle>
                      <CardDescription className="text-xs md:text-sm leading-relaxed">
                        {tip.tip}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Tips From Sensors */}
        {iotEnabled && (
          <Card className="shadow-soft border-primary/30">
            <CardHeader className="p-4 md:p-6">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <CardTitle className="text-base md:text-lg">Tips From Sensors</CardTitle>
              </div>
              <CardDescription className="text-xs md:text-sm">AI insights based on your field data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 md:space-y-3 p-4 md:p-6 pt-0">
              {getSensorTips().map((tip, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 md:p-3 rounded-lg border ${
                    tip.severity === "success"
                      ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                      : "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                  }`}
                >
                  <p className="text-xs md:text-sm">{tip.message}</p>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full mt-2"
                size="sm"
                onClick={() => navigate("/iot-dashboard")}
              >
                View Live Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Farm Overview */}
        <FarmOverview />
      </main>
    </div>
  );
};

export default Dashboard;
