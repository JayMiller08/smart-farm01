# OpenWeatherMap API Integration

## Overview
The weather system has been successfully integrated with the OpenWeatherMap API using the daily forecast endpoint.

## API Configuration
- **API Key**: `7de55a19792e888f2323e76feb7f4f6d`
- **Base URL**: `https://api.openweathermap.org/data/2.5`
- **Endpoint**: `/forecast/daily`
- **Parameters**: `lat={lat}&lon={lon}&cnt={cnt}&appid={api_key}&units=metric`

## Geolocation Integration
The system automatically detects the user's location using the browser's Geolocation API:
- **Primary**: Uses `navigator.geolocation.getCurrentPosition()`
- **Fallback**: Defaults to Nelspruit, Mpumalanga coordinates (-25.4744, 30.9703)
- **Error Handling**: Graceful fallback if geolocation is denied or fails

## OpenWeatherMap API Response Structure
The API returns weather forecast data in the following format:

```json
{
  "cod": "200",
  "message": 0,
  "cnt": 5,
  "list": [
    {
      "dt": 1640995200,
      "main": {
        "temp": 25.5,
        "feels_like": 26.2,
        "temp_min": 22.0,
        "temp_max": 28.0,
        "pressure": 1013,
        "humidity": 65
      },
      "weather": [
        {
          "id": 800,
          "main": "Clear",
          "description": "clear sky",
          "icon": "01d"
        }
      ],
      "clouds": {"all": 0},
      "wind": {
        "speed": 3.6,
        "deg": 180,
        "gust": 5.2
      },
      "visibility": 10000,
      "pop": 0,
      "rain": {"3h": 0},
      "snow": {"3h": 0},
      "dt_txt": "2022-01-01 00:00:00"
    }
  ],
  "city": {
    "id": 964137,
    "name": "Nelspruit",
    "coord": {"lat": -25.4744, "lon": 30.9703},
    "country": "ZA",
    "population": 221474,
    "timezone": 7200,
    "sunrise": 1640995200,
    "sunset": 1641043200
  }
}
```

## Data Transformation
The `WeatherService` automatically transforms the OpenWeatherMap API data to match our internal `WeatherData` interface:

### Key Transformations:
- **Temperature**: Uses Celsius values from `main.temp` (metric units)
- **Wind Speed**: Converts m/s to km/h (`speed * 3.6`)
- **Wind Direction**: Uses `deg` directly
- **Precipitation**: Maps `rain` and `snow` objects
- **Location**: Maps to `city.name` and `city.coord`
- **Weather Icons**: Maps OpenWeatherMap icon codes to emoji
- **Timestamp**: Converts Unix timestamp to ISO string

## Components Updated

### 1. WeatherService (`src/services/weatherService.ts`)
- Added `getCurrentLocation()` method for geolocation
- Added `fetchWeatherFromOpenWeatherMap()` method
- Added `OpenWeatherMapResponse` interface
- Updated `getLatestWeather()` to use geolocation + OpenWeatherMap API
- Maintains database fallback functionality

### 2. WeatherWidget (`src/components/WeatherWidget.tsx`)
- Already uses `useWeather` hook, automatically gets OpenWeatherMap data
- Displays real-time weather information based on user's location
- Shows connection status and refresh capability

### 3. Weather Page (`src/pages/Weather.tsx`)
- Already uses `useWeather` hook, automatically gets OpenWeatherMap data
- Displays comprehensive weather information for user's location
- Shows AI farming insights based on real data

### 4. WeatherApiTest (`src/components/WeatherApiTest.tsx`)
- Updated to test OpenWeatherMap API integration
- Shows geolocation detection and API data
- Allows testing both API and database fallback

### 5. OpenWeatherMapTest (`src/components/OpenWeatherMapTest.tsx`)
- New comprehensive test component
- Tests geolocation, API connection, and data transformation
- Provides detailed test results and error reporting

## Usage

### Automatic Integration
The weather system automatically:
1. **Detects Location** - Uses browser geolocation to get user's coordinates
2. **Fetches from OpenWeatherMap** - Gets real-time weather data using coordinates
3. **Falls back to database** - If API fails, uses local database
4. **Updates UI in real-time** - Shows live weather information
5. **Handles errors gracefully** - Shows appropriate error messages

### Testing
To test the integration:
1. Go to the Dashboard
2. Use the "OpenWeatherMap Integration Test" component
3. Click "Test OpenWeatherMap Integration" to verify everything works
4. Use the "Weather API Integration Test" for detailed API testing

### Real-time Updates
The system subscribes to database changes and will update the UI when:
- New weather observations are added
- Existing observations are updated
- Observations are deleted

## API Endpoints

### Primary API
- **URL**: `https://api.openweathermap.org/data/2.5/forecast/daily`
- **Method**: GET
- **Parameters**: 
  - `lat`: Latitude (from geolocation)
  - `lon`: Longitude (from geolocation)
  - `cnt`: Number of days (default: 5)
  - `appid`: API key
  - `units`: metric (Celsius)
- **Response**: JSON weather forecast data

### Fallback Database
- **Table**: `weather_observations`
- **Access**: Supabase real-time subscriptions
- **Backup**: Local weather data storage

## Error Handling

The system handles various error scenarios:
- **Geolocation denied**: Falls back to default Nelspruit coordinates
- **API unavailable**: Falls back to database
- **Database unavailable**: Shows error message
- **Invalid data**: Gracefully handles malformed responses
- **Network issues**: Retries and shows appropriate messages

## Security Considerations

- **API Key**: Currently exposed in client code (should be moved to environment variables)
- **HTTPS**: All API calls use HTTPS
- **CORS**: OpenWeatherMap API supports CORS for web applications
- **Rate Limiting**: API has rate limits (1000 calls/day for free tier)

## Future Enhancements

Potential improvements:
1. **Environment Variables**: Move API key to server-side environment
2. **Multiple API sources**: Add backup weather APIs
3. **Caching**: Implement local storage for offline capability
4. **Historical data**: Store and display weather trends
5. **Alerts**: Weather-based farming alerts and notifications
6. **Multi-day forecast**: Display 5-day weather forecast
7. **Weather maps**: Add visual weather maps

## Testing Checklist

- [ ] Geolocation detection works
- [ ] OpenWeatherMap API connection works
- [ ] Data transformation is correct
- [ ] UI displays all weather information
- [ ] Database fallback works
- [ ] Real-time updates function
- [ ] Error handling works properly
- [ ] Mobile responsiveness maintained
- [ ] Performance is acceptable
- [ ] Location privacy is respected

## Support

If you encounter issues:
1. Check browser console for errors
2. Use the OpenWeatherMap Integration Test component
3. Verify geolocation permissions
4. Check network connectivity
5. Verify API key is valid
6. Review error messages in the UI

## API Key Management

**Important**: The API key is currently hardcoded in the client. For production:
1. Move API key to environment variables
2. Use server-side proxy for API calls
3. Implement proper API key rotation
4. Monitor API usage and rate limits