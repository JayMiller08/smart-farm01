import { useState, useEffect, useCallback } from 'react';
import { supabaseService, FarmProfile, Field } from '@/services/supabaseService';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export function useFarm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [farmProfile, setFarmProfile] = useState<FarmProfile | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load farm profile
      const profile = await supabaseService.getFarmProfile(user.id);
      setFarmProfile(profile);

      // Load fields
      const userFields = await supabaseService.getFieldsByUser(user.id);
      setFields(userFields);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load farm data');
      setError(error);
      console.error('Error loading farm data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const createField = useCallback(async (fieldData: Omit<Field, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    try {
      const newField = await supabaseService.createField(fieldData);
      // Optimistic UI update
      setFields(prev => [newField, ...prev]);
      
      toast({
        title: 'Field Created',
        description: `${newField.name} has been added successfully.`,
      });
      
      return newField;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create field');
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  const updateField = useCallback(async (id: string, updates: Partial<Field>) => {
    try {
      const updated = await supabaseService.updateField(id, updates);
      // Optimistic UI update
      setFields(prev => prev.map(f => f.id === id ? updated : f));
      
      toast({
        title: 'Field Updated',
        description: 'Field has been updated successfully.',
      });
      
      return updated;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update field');
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  const deleteField = useCallback(async (id: string) => {
    try {
      await supabaseService.deleteField(id);
      // Optimistic UI update
      setFields(prev => prev.filter(f => f.id !== id));
      
      toast({
        title: 'Field Deleted',
        description: 'Field has been removed successfully.',
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete field');
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  const updateProfile = useCallback(async (updates: Partial<FarmProfile>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const updated = await supabaseService.updateFarmProfile(user.id, updates);
      setFarmProfile(updated);
      
      toast({
        title: 'Profile Updated',
        description: 'Your farm profile has been updated successfully.',
      });
      
      return updated;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update profile');
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  }, [user, toast]);

  return {
    farmProfile,
    fields,
    loading,
    error,
    refresh,
    createField,
    updateField,
    deleteField,
    updateProfile,
  };
}
