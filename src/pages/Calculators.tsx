import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calculator as CalcIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Calculators = () => {
  const navigate = useNavigate();
  const [fertilizerResult, setFertilizerResult] = useState<any>(null);
  const [pesticideResult, setPesticideResult] = useState<any>(null);
  const [irrigationResult, setIrrigationResult] = useState<any>(null);

  const calculateFertilizer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const size = parseFloat(formData.get("size") as string);
    
    // Simple calculation logic
    const npk = {
      n: Math.round(size * 50),
      p: Math.round(size * 30),
      k: Math.round(size * 40),
    };
    const cost = Math.round(size * 850);
    const savings = Math.round(cost * 0.15);

    setFertilizerResult({
      npk,
      cost,
      savings,
      timing: "Apply at planting and repeat after 4-6 weeks",
    });
  };

  const calculatePesticide = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const area = parseFloat(formData.get("area") as string);
    const pestType = formData.get("pestType") as string;
    const infestation = formData.get("infestation") as string;

    // Simple calculation logic
    const baseAmount = area * 2;
    const multiplier = infestation === "high" ? 1.5 : infestation === "medium" ? 1.2 : 1;
    const amount = Math.round(baseAmount * multiplier * 100) / 100;
    const cost = Math.round(amount * 120);

    const pesticideNames: Record<string, string> = {
      aphids: "Imidacloprid",
      whiteflies: "Acetamiprid",
      blight: "Mancozeb",
      cutworms: "Cypermethrin",
      fungus: "Copper Oxychloride",
    };

    setPesticideResult({
      pestType,
      pesticide: pesticideNames[pestType] || "Contact local agricultural advisor",
      amount: `${amount} liters`,
      cost,
      instructions: "Apply early morning or late evening. Wear protective equipment. Avoid windy conditions.",
      safety: "Keep away from children and pets. Do not apply before rain. Follow label instructions.",
    });
  };

  const calculateIrrigation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const size = parseFloat(formData.get("fieldSize") as string);
    const cropType = formData.get("cropType") as string;
    const soilType = formData.get("soilType") as string;

    // Simple calculation logic based on crop water requirements
    const cropWaterReq: Record<string, number> = {
      maize: 500,
      citrus: 700,
      tomatoes: 600,
      sugarcane: 800,
      vegetables: 450,
    };

    const soilMultiplier: Record<string, number> = {
      sandy: 1.3,
      loam: 1.0,
      clay: 0.8,
      "sandy-loam": 1.1,
    };

    const dailyWater = Math.round(
      size * 10000 * (cropWaterReq[cropType] || 500) / 150 * (soilMultiplier[soilType] || 1)
    );
    const weeklyWater = dailyWater * 7;

    setIrrigationResult({
      dailyWater,
      weeklyWater,
      frequency: soilType === "sandy" ? "Daily" : soilType === "clay" ? "Every 3-4 days" : "Every 2-3 days",
      optimalTime: "Early morning (5-7 AM) or evening (5-7 PM)",
      tips: [
        "Monitor soil moisture regularly",
        "Adjust for rainfall",
        "Use mulch to reduce evaporation",
        "Check for uniform water distribution",
      ],
    });
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-6">
      {/* Header */}
      <header className="bg-card border-b shadow-soft">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4 flex items-center gap-2 md:gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <div>
            <h1 className="text-lg md:text-xl font-bold">Input Calculators</h1>
            <p className="text-xs md:text-sm text-muted-foreground">Optimize your farm inputs</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 md:px-4 py-4 md:py-6">
        <Tabs defaultValue="fertilizer" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="fertilizer" className="text-xs md:text-sm py-2">Fertilizer</TabsTrigger>
            <TabsTrigger value="pesticide" className="text-xs md:text-sm py-2">Pesticide</TabsTrigger>
            <TabsTrigger value="irrigation" className="text-xs md:text-sm py-2">Irrigation</TabsTrigger>
          </TabsList>

          {/* Fertilizer Calculator */}
          <TabsContent value="fertilizer">
            <Card className="shadow-medium">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-lg md:text-2xl">
                  <CalcIcon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Fertilizer Calculator
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">Calculate optimal fertilizer amounts for your crops</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={calculateFertilizer} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="crop">Crop Type</Label>
                    <Select name="crop" defaultValue="maize">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maize">Maize</SelectItem>
                        <SelectItem value="citrus">Citrus</SelectItem>
                        <SelectItem value="tomatoes">Tomatoes</SelectItem>
                        <SelectItem value="sugarcane">Sugarcane</SelectItem>
                        <SelectItem value="vegetables">Vegetables</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">Field Size (hectares)</Label>
                    <Input
                      id="size"
                      name="size"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 5"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stage">Growth Stage</Label>
                    <Select name="stage" defaultValue="vegetative">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seedling">Seedling</SelectItem>
                        <SelectItem value="vegetative">Vegetative</SelectItem>
                        <SelectItem value="flowering">Flowering</SelectItem>
                        <SelectItem value="fruiting">Fruiting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fertility">Soil Fertility</Label>
                    <Select name="fertility" defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" size="lg">Calculate</Button>
                </form>

                {fertilizerResult && (
                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <h3 className="font-semibold mb-3">Recommended NPK Amounts</h3>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">{fertilizerResult.npk.n}</div>
                          <div className="text-sm text-muted-foreground">Nitrogen (kg)</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary">{fertilizerResult.npk.p}</div>
                          <div className="text-sm text-muted-foreground">Phosphorus (kg)</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-primary">{fertilizerResult.npk.k}</div>
                          <div className="text-sm text-muted-foreground">Potassium (kg)</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Estimated Cost</span>
                        <span className="font-semibold">R {fertilizerResult.cost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Potential Savings</span>
                        <span className="font-semibold text-primary">R {fertilizerResult.savings}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-sm"><strong>Application Timing:</strong> {fertilizerResult.timing}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pesticide Calculator */}
          <TabsContent value="pesticide">
            <Card className="shadow-medium">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-lg md:text-2xl">
                  <CalcIcon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Pesticide Calculator
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">Calculate pesticide requirements for pest control</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={calculatePesticide} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pestType">Pest/Disease Type</Label>
                    <Select name="pestType" defaultValue="aphids">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aphids">Aphids</SelectItem>
                        <SelectItem value="whiteflies">Whiteflies</SelectItem>
                        <SelectItem value="blight">Blight</SelectItem>
                        <SelectItem value="cutworms">Cutworms</SelectItem>
                        <SelectItem value="fungus">Fungus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Affected Area (hectares)</Label>
                    <Input
                      id="area"
                      name="area"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 3"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="infestation">Infestation Level</Label>
                    <Select name="infestation" defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" size="lg">Calculate</Button>
                </form>

                {pesticideResult && (
                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <h3 className="font-semibold mb-2">Recommended Pesticide</h3>
                      <p className="text-lg font-bold text-primary">{pesticideResult.pesticide}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        For {pesticideResult.pestType}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Required Amount</span>
                        <span className="font-semibold">{pesticideResult.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Estimated Cost</span>
                        <span className="font-semibold">R {pesticideResult.cost}</span>
                      </div>
                    </div>

                    <div className="pt-4 space-y-3 border-t">
                      <div>
                        <p className="text-sm font-semibold mb-1">Application Instructions:</p>
                        <p className="text-sm text-muted-foreground">{pesticideResult.instructions}</p>
                      </div>
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm font-semibold mb-1 text-destructive">Safety Precautions:</p>
                        <p className="text-sm text-muted-foreground">{pesticideResult.safety}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Irrigation Calculator */}
          <TabsContent value="irrigation">
            <Card className="shadow-medium">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-lg md:text-2xl">
                  <CalcIcon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  Irrigation Calculator
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">Calculate optimal water requirements</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={calculateIrrigation} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cropType">Crop Type</Label>
                    <Select name="cropType" defaultValue="maize">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maize">Maize</SelectItem>
                        <SelectItem value="citrus">Citrus</SelectItem>
                        <SelectItem value="tomatoes">Tomatoes</SelectItem>
                        <SelectItem value="sugarcane">Sugarcane</SelectItem>
                        <SelectItem value="vegetables">Vegetables</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fieldSize">Field Size (hectares)</Label>
                    <Input
                      id="fieldSize"
                      name="fieldSize"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 5"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="soilType">Soil Type</Label>
                    <Select name="soilType" defaultValue="loam">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandy">Sandy</SelectItem>
                        <SelectItem value="loam">Loam</SelectItem>
                        <SelectItem value="clay">Clay</SelectItem>
                        <SelectItem value="sandy-loam">Sandy Loam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" size="lg">Calculate</Button>
                </form>

                {irrigationResult && (
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-1">Daily Water</p>
                        <p className="text-2xl font-bold text-primary">{irrigationResult.dailyWater.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">liters</p>
                      </div>
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground mb-1">Weekly Water</p>
                        <p className="text-2xl font-bold text-primary">{irrigationResult.weeklyWater.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">liters</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Irrigation Frequency</span>
                        <span className="font-semibold">{irrigationResult.frequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Optimal Time</span>
                        <span className="font-semibold">{irrigationResult.optimalTime}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm font-semibold mb-2">Water Conservation Tips:</p>
                      <ul className="space-y-1">
                        {irrigationResult.tips.map((tip: string, index: number) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Calculators;
