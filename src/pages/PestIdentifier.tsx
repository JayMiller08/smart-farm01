import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Bug, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PestIdentifier = () => {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const symptoms = [
    { id: "discoloration", label: "Discoloration" },
    { id: "spots", label: "Spots" },
    { id: "wilting", label: "Wilting" },
    { id: "holes", label: "Holes" },
    { id: "stunted", label: "Stunted growth" },
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      setResult({
        pest: "Aphids (Greenfly)",
        confidence: 85,
        description:
          "Aphids are small, soft-bodied insects that feed on plant sap. They typically cause yellowing, curling leaves and stunted growth.",
        treatment: [
          "Use neem oil spray (organic option)",
          "Apply systemic insecticide if infestation is severe",
          "Introduce natural predators like ladybugs",
          "Remove heavily infested plant parts",
        ],
        prevention: [
          "Monitor plants regularly for early detection",
          "Use companion planting (marigolds, garlic)",
          "Maintain proper plant spacing for air circulation",
          "Avoid over-fertilizing with nitrogen",
        ],
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-6">
      {/* Header */}
      <header className="bg-card border-b shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Pest & Disease Identifier</h1>
            <p className="text-sm text-muted-foreground">AI-powered diagnostics</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Diagnostic Form */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-destructive" />
              Describe the Problem
            </CardTitle>
            <CardDescription>Provide details about the symptoms you're observing</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="crop">Affected Crop</Label>
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
                <Label htmlFor="part">Affected Plant Part</Label>
                <Select name="part" defaultValue="leaves">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leaves">Leaves</SelectItem>
                    <SelectItem value="stem">Stem</SelectItem>
                    <SelectItem value="fruit">Fruit</SelectItem>
                    <SelectItem value="roots">Roots</SelectItem>
                    <SelectItem value="entire">Entire plant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Symptom Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe what you see... (e.g., yellow spots on lower leaves, sticky residue present)"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Symptom Characteristics</Label>
                <div className="space-y-2">
                  {symptoms.map((symptom) => (
                    <div key={symptom.id} className="flex items-center space-x-2">
                      <Checkbox id={symptom.id} />
                      <label
                        htmlFor={symptom.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {symptom.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Identify Pest/Disease"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card className="shadow-medium border-destructive/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-destructive">{result.pest}</CardTitle>
                <div className="text-sm font-semibold bg-destructive/10 text-destructive px-3 py-1 rounded-full">
                  {result.confidence}% match
                </div>
              </div>
              <CardDescription>{result.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Treatment */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Treatment Options
                </h3>
                <ul className="space-y-2">
                  {result.treatment.map((item: string, idx: number) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prevention */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">Prevention Tips</h3>
                <ul className="space-y-2">
                  {result.prevention.map((item: string, idx: number) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default PestIdentifier;
