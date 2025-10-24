import { useState, useCallback } from 'react';
import { isdaApiService, SoilPropertyRequest, ISDASoilPropertyResponse } from '@/services/isdaApiService';
import { useToast } from '@/hooks/use-toast';

export interface SoilDataState {
  data: ISDASoilPropertyResponse | null;
  loading: boolean;
  error: string | null;
}

export interface SoilPHData {
  value: number;
  unit: string;
  uncertainty: {
    lower_bound: number;
    upper_bound: number;
  };
}

export function useSoilData() {
  const { toast } = useToast();
  const [state, setState] = useState<SoilDataState>({
    data: null,
    loading: false,
    error: null,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setData = useCallback((data: ISDASoilPropertyResponse | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  /**
   * Get soil property data for a specific location and depth
   */
  const getSoilProperty = useCallback(async (request: SoilPropertyRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await isdaApiService.getSoilProperty(request);
      setData(data);
      
      toast({
        title: "Soil Data Retrieved",
        description: `Successfully retrieved ${request.property} data for location (${request.lat}, ${request.lon})`,
      });
      
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve soil data';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setData, toast]);

  /**
   * Get pH value for a specific location and depth
   */
  const getSoilPH = useCallback(async (
    lat: number, 
    lon: number, 
    depth: string = '0-20'
  ): Promise<SoilPHData> => {
    try {
      setLoading(true);
      setError(null);
      
      const phData = await isdaApiService.getSoilPH(lat, lon, depth);
      
      toast({
        title: "Soil pH Retrieved",
        description: `pH value: ${phData.value} ${phData.unit} for location (${lat}, ${lon})`,
      });
      
      return phData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve soil pH';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, toast]);

  /**
   * Get multiple soil properties for a specific location and depth
   */
  const getMultipleSoilProperties = useCallback(async (
    lat: number,
    lon: number,
    properties: string[],
    depth: string = '0-20'
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await isdaApiService.getMultipleSoilProperties(lat, lon, properties, depth);
      
      toast({
        title: "Soil Properties Retrieved",
        description: `Successfully retrieved ${properties.length} soil properties for location (${lat}, ${lon})`,
      });
      
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve soil properties';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, toast]);

  /**
   * Clear all soil data
   */
  const clearData = useCallback(() => {
    setData(null);
    setError(null);
  }, [setData, setError]);

  /**
   * Clear authentication token
   */
  const clearAuth = useCallback(() => {
    isdaApiService.clearAuth();
  }, []);

  return {
    // State
    data: state.data,
    loading: state.loading,
    error: state.error,
    
    // Actions
    getSoilProperty,
    getSoilPH,
    getMultipleSoilProperties,
    clearData,
    clearAuth,
  };
}
