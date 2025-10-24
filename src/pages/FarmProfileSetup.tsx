import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Field {
  id: string;
  name: string;
  size: number;
  crop: string;
  plantingDate: string;
  growthStage: string;
}

const FarmProfileSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [fields, setFields] = useState<Field[]>([]);
  const [showAddField, setShowAddField] = useState(false);
  const [iotEnabled, setIotEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newField, setNewField] = useState({
    name: "",
    size: "",
    crop: "maize",
    plantingDate: "",
    growthStage: "seedling",
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      // Load profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setIotEnabled(profile.iot_enabled || false);
      }

      // Load fields
      const { data: fieldsData } = await supabase
        .from("fields")
        .select("*")
        .eq("user_id", user.id);

      if (fieldsData) {
        setFields(
          fieldsData.map((f) => ({
            id: f.id,
            name: f.name,
            size: f.size,
            crop: f.crop,
            plantingDate: f.planting_date,
            growthStage: f.growth_stage,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = async () => {
    if (!newField.name || !newField.size || !newField.plantingDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all field details",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("fields")
        .insert({
          user_id: user.id,
          name: newField.name,
          size: parseFloat(newField.size),
          crop: newField.crop,
          planting_date: newField.plantingDate,
          growth_stage: newField.growthStage,
        })
        .select()
        .single();

      if (error) throw error;

      const field: Field = {
        id: data.id,
        name: data.name,
        size: data.size,
        crop: data.crop,
        plantingDate: data.planting_date,
        growthStage: data.growth_stage,
      };

      setFields([...fields, field]);
      setNewField({
        name: "",
        size: "",
        crop: "maize",
        plantingDate: "",
        growthStage: "seedling",
      });
      setShowAddField(false);

      toast({
        title: "Field Added",
        description: `${field.name} has been added to your farm`,
      });
    } catch (error) {
      console.error("Error adding field:", error);
      toast({
        title: "Error",
        description: "Failed to add field",
        variant: "destructive",
      });
    }
  };

  const handleRemoveField = async (id: string) => {
    try {
      const { error } = await supabase.from("fields").delete().eq("id", id);

      if (error) throw error;

      setFields(fields.filter((f) => f.id !== id));
      toast({
        title: "Field Removed",
        description: "Field has been removed from your farm",
      });
    } catch (error) {
      console.error("Error removing field:", error);
      toast({
        title: "Error",
        description: "Failed to remove field",
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ iot_enabled: iotEnabled })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile Saved",
        description: "Your farm profile has been updated",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-6">
      <header className="bg-card border-b shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Farm Profile Setup</h1>
            <p className="text-sm text-muted-foreground">Manage your fields and crops</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Farm Overview */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Farm Overview
            </CardTitle>
            <CardDescription>
              {fields.length === 0
                ? "Add your first field to get started"
                : `Managing ${fields.length} field${fields.length !== 1 ? "s" : ""}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Fields</p>
                <p className="text-2xl font-bold">{fields.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Area</p>
                <p className="text-2xl font-bold">
                  {fields.reduce((sum, f) => sum + f.size, 0).toFixed(1)} ha
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Existing Fields */}
        {fields.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Your Fields</h2>
            {fields.map((field) => (
              <Card key={field.id} className="shadow-soft">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{field.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {field.size} hectares • {field.crop}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveField(field.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Planted:</span>
                      <p className="font-medium">{new Date(field.plantingDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Stage:</span>
                      <p className="font-medium capitalize">{field.growthStage}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
            }
          </div>
        )}

        {/* Add Field Form */}
        {!showAddField ? (
          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={() => setShowAddField(true)}
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Field
          </Button>
        ) : (
          <Card className="shadow-medium border-primary/50">
            <CardHeader>
              <CardTitle>Add New Field</CardTitle>
              <CardDescription>Enter the details of your field</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fieldName">Field Name</Label>
                <Input
                  id="fieldName"
                  placeholder="e.g., North Field"
                  value={newField.name}
                  onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fieldSize">Field Size (hectares)</Label>
                <Input
                  id="fieldSize"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 2.5"
                  value={newField.size}
                  onChange={(e) => setNewField({ ...newField, size: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="crop">Primary Crop</Label>
                <Select
                  value={newField.crop}
                  onValueChange={(value) => setNewField({ ...newField, crop: value })}
                >
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
                <Label htmlFor="plantingDate">Planting Date</Label>
                <Input
                  id="plantingDate"
                  type="date"
                  value={newField.plantingDate}
                  onChange={(e) => setNewField({ ...newField, plantingDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="growthStage">Growth Stage</Label>
                <Select
                  value={newField.growthStage}
                  onValueChange={(value) => setNewField({ ...newField, growthStage: value })}
                >
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

              <div className="flex gap-2">
                <Button onClick={handleAddField} className="flex-1">
                  Add Field
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddField(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* IoT Monitoring Toggle */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>IoT Sensor Monitoring</CardTitle>
            <CardDescription>Enable real-time field monitoring with IoT sensors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="iot-enabled"
                checked={iotEnabled}
                onChange={(e) => setIotEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-input"
              />
              <label htmlFor="iot-enabled" className="text-sm font-medium cursor-pointer">
                Enable IoT Sensor Monitoring
              </label>
            </div>

            {iotEnabled && (
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm mb-3 flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  IoT sensors connected (simulated)
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/iot-dashboard")}
                >
                  View Live Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        {fields.length > 0 && (
          <Button onClick={handleSaveProfile} className="w-full" size="lg">
            Save Profile
          </Button>
        )}
      </main>
    </div>
  );
};

export default FarmProfileSetup;
