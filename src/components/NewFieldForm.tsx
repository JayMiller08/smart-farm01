import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFarm } from '@/hooks/useFarm';
import { Loader2 } from 'lucide-react';

interface NewFieldFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function NewFieldForm({ onSuccess, onCancel }: NewFieldFormProps) {
  const { createField } = useFarm();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    size: '',
    crop: 'maize',
    planting_date: '',
    growth_stage: 'seedling',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.size || !formData.planting_date) {
      return;
    }

    setLoading(true);
    try {
      await createField({
        name: formData.name,
        size: parseFloat(formData.size),
        crop: formData.crop,
        planting_date: formData.planting_date,
        growth_stage: formData.growth_stage,
      });

      // Reset form
      setFormData({
        name: '',
        size: '',
        crop: 'maize',
        planting_date: '',
        growth_stage: 'seedling',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating field:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-medium border-primary/50">
      <CardHeader>
        <CardTitle>Add New Field</CardTitle>
        <CardDescription>Enter the details of your field</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fieldName">Field Name *</Label>
            <Input
              id="fieldName"
              placeholder="e.g., North Field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fieldSize">Field Size (hectares) *</Label>
            <Input
              id="fieldSize"
              type="number"
              step="0.1"
              min="0.1"
              placeholder="e.g., 2.5"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="crop">Primary Crop *</Label>
            <Select
              value={formData.crop}
              onValueChange={(value) => setFormData({ ...formData, crop: value })}
              disabled={loading}
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
                <SelectItem value="wheat">Wheat</SelectItem>
                <SelectItem value="rice">Rice</SelectItem>
                <SelectItem value="cotton">Cotton</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plantingDate">Planting Date *</Label>
            <Input
              id="plantingDate"
              type="date"
              value={formData.planting_date}
              onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="growthStage">Growth Stage *</Label>
            <Select
              value={formData.growth_stage}
              onValueChange={(value) => setFormData({ ...formData, growth_stage: value })}
              disabled={loading}
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

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Field
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
