import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sprout, MapPin, Trash2, RefreshCw } from 'lucide-react';
import { useFarm } from '@/hooks/useFarm';
import { useState } from 'react';
import { NewFieldForm } from './NewFieldForm';

export function FarmOverview() {
  const { farmProfile, fields, loading, refresh, deleteField } = useFarm();
  const [showNewFieldForm, setShowNewFieldForm] = useState(false);

  const handleFieldCreated = () => {
    setShowNewFieldForm(false);
  };

  const handleDeleteField = async (fieldId: string) => {
    if (confirm('Are you sure you want to delete this field?')) {
      await deleteField(fieldId);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">
            <RefreshCw className="h-8 w-8 mx-auto mb-3 animate-spin" />
            <p className="text-sm">Loading farm data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Farm Overview</CardTitle>
                <CardDescription>
                  {farmProfile?.farm_name || 'Your Farm'} • {fields.length} field{fields.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={refresh}
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Fields</p>
              <p className="text-2xl font-bold">{fields.length}</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Total Area</p>
              <p className="text-2xl font-bold">
                {fields.reduce((sum, f) => sum + f.size, 0).toFixed(1)} ha
              </p>
            </div>
            {farmProfile?.location && (
              <div className="text-center p-4 bg-muted/50 rounded-lg col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Location</p>
                <p className="text-lg font-medium">{farmProfile.location}</p>
              </div>
            )}
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Sprout className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm mb-4">No fields registered yet</p>
              <Button onClick={() => setShowNewFieldForm(true)}>
                Add Your First Field
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {fields.map((field) => (
                  <Card key={field.id} className="shadow-soft">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{field.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {field.size} hectares • {field.crop}
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Planted:</span>
                              <p className="font-medium">
                                {new Date(field.planting_date).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Stage:</span>
                              <p className="font-medium capitalize">{field.growth_stage}</p>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => field.id && handleDeleteField(field.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button 
                onClick={() => setShowNewFieldForm(true)}
                className="w-full mt-4"
                variant="outline"
              >
                Add Another Field
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {showNewFieldForm && (
        <NewFieldForm 
          onSuccess={handleFieldCreated}
          onCancel={() => setShowNewFieldForm(false)}
        />
      )}
    </div>
  );
}
