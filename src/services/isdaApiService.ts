/**
 * ISDA Africa API Service
 * 
 * This service handles authentication and soil property data retrieval from the ISDA Africa API.
 * 
 * Note: In production, move credentials to environment variables:
 * - VITE_ISDA_API_URL
 * - VITE_ISDA_USERNAME  
 * - VITE_ISDA_PASSWORD
 */

// API Configuration
const ISDA_CONFIG = {
  baseUrl: 'https://api.isda-africa.com',
  username: 'lbass1613@gmail.com',
  password: 'MrMoney789@ump',
  tokenExpiry: 60 * 60 * 1000, // 60 minutes in milliseconds
};

// Types for ISDA API responses
export interface ISDALoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface ISDASoilPropertyValue {
  value: number;
  unit: string;
}

export interface ISDASoilPropertyUncertainty {
  lower_bound: number;
  upper_bound: number;
}

export interface ISDASoilPropertyData {
  value: ISDASoilPropertyValue;
  uncertainty: ISDASoilPropertyUncertainty[];
}

export interface ISDASoilPropertyResponse {
  property: {
    [key: string]: ISDASoilPropertyData[];
  };
  location: {
    lat: number;
    lon: number;
  };
  depth: string;
}

export interface SoilPropertyRequest {
  lat: number;
  lon: number;
  property: string;
  depth: string;
}

class ISDAApiService {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  /**
   * Authenticate with ISDA API and get access token
   */
  private async authenticate(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`${ISDA_CONFIG.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: ISDA_CONFIG.username,
          password: ISDA_CONFIG.password,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }

      const data: ISDALoginResponse = await response.json();
      
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + ISDA_CONFIG.tokenExpiry;
      
      return this.accessToken;
    } catch (error) {
      console.error('ISDA API Authentication Error:', error);
      throw new Error('Failed to authenticate with ISDA API');
    }
  }

  /**
   * Get soil property data for a specific location and depth
   */
  async getSoilProperty(request: SoilPropertyRequest): Promise<ISDASoilPropertyResponse> {
    try {
      const token = await this.authenticate();
      
      const url = new URL(`${ISDA_CONFIG.baseUrl}/isdasoil/v2/soilproperty`);
      url.searchParams.append('lat', request.lat.toString());
      url.searchParams.append('lon', request.lon.toString());
      url.searchParams.append('property', request.property);
      url.searchParams.append('depth', request.depth);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Soil property request failed: ${response.status} ${response.statusText}`);
      }

      const data: ISDASoilPropertyResponse = await response.json();
      return data;
    } catch (error) {
      console.error('ISDA API Soil Property Error:', error);
      throw new Error('Failed to retrieve soil property data');
    }
  }

  /**
   * Get pH value for a specific location and depth
   */
  async getSoilPH(lat: number, lon: number, depth: string = '0-20'): Promise<{
    value: number;
    unit: string;
    uncertainty: {
      lower_bound: number;
      upper_bound: number;
    };
  }> {
    const response = await this.getSoilProperty({
      lat,
      lon,
      property: 'ph',
      depth,
    });

    const phData = response.property.ph[0];
    return {
      value: phData.value.value,
      unit: phData.value.unit,
      uncertainty: phData.uncertainty[1], // Using the second uncertainty range as in the example
    };
  }

  /**
   * Get multiple soil properties for a specific location and depth
   */
  async getMultipleSoilProperties(
    lat: number, 
    lon: number, 
    properties: string[], 
    depth: string = '0-20'
  ): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    
    // Request each property individually
    for (const property of properties) {
      try {
        const response = await this.getSoilProperty({
          lat,
          lon,
          property,
          depth,
        });
        
        results[property] = response.property[property][0];
      } catch (error) {
        console.error(`Failed to get ${property}:`, error);
        results[property] = { error: `Failed to retrieve ${property}` };
      }
    }
    
    return results;
  }

  /**
   * Clear stored authentication token
   */
  clearAuth(): void {
    this.accessToken = null;
    this.tokenExpiry = null;
  }
}

// Export singleton instance
export const isdaApiService = new ISDAApiService();
