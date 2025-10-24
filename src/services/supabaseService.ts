import { supabase } from '@/integrations/supabase/client';
import { authService } from './authService';

export interface FarmProfile {
  id?: string;
  user_id?: string;
  email: string;
  farm_name?: string;
  location?: string;
  farm_size?: number;
  irrigation_method?: string;
  farming_type?: string;
  iot_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Field {
  id?: string;
  user_id?: string;
  name: string;
  size: number;
  crop: string;
  planting_date: string;
  growth_stage: string;
  created_at?: string;
  updated_at?: string;
}

export const supabaseService = {
  // Farm Profile operations
  async createFarmProfile(profile: Omit<FarmProfile, 'id' | 'created_at' | 'updated_at'>): Promise<FarmProfile> {
    // Ensure user_id is set from current authenticated user
    let userId = profile.user_id;
    if (!userId) {
      const user = await authService.getCurrentUser();
      userId = user?.id;
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([{ ...profile, id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateFarmProfile(id: string, updates: Partial<FarmProfile>): Promise<FarmProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getFarmProfilesByUser(userId: string): Promise<FarmProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId);

    if (error) throw error;
    return data || [];
  },

  async getFarmProfile(userId: string): Promise<FarmProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Field operations
  async createField(field: Omit<Field, 'id' | 'created_at' | 'updated_at'>): Promise<Field> {
    // Ensure user_id is set from current authenticated user
    let userId = field.user_id;
    if (!userId) {
      const user = await authService.getCurrentUser();
      userId = user?.id;
    }

    const { data, error } = await supabase
      .from('fields')
      .insert([{ ...field, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateField(id: string, updates: Partial<Field>): Promise<Field> {
    const { data, error } = await supabase
      .from('fields')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteField(id: string): Promise<void> {
    const { error } = await supabase
      .from('fields')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getFieldsByUser(userId: string): Promise<Field[]> {
    const { data, error } = await supabase
      .from('fields')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
