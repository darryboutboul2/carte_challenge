import { useState } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface GeolocationState {
  location: LocationCoords | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
}

const GYM_LOCATION: LocationCoords = {
  latitude: 48.877053,
  longitude: 2.817765
};

const MAX_DISTANCE_METERS = 60;

const calculateDistance = (coord1: LocationCoords, coord2: LocationCoords): number => {
  const R = 6371e3;
  const φ1 = coord1.latitude * Math.PI / 180;
  const φ2 = coord2.latitude * Math.PI / 180;
  const Δφ = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    isLoading: false,
    error: null,
    hasPermission: false
  });

  const requestLocation = async (): Promise<LocationCoords> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (Platform.OS === 'web') {
        return await new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            const error = 'La géolocalisation n\'est pas supportée par ce navigateur';
            setState(prev => ({ ...prev, isLoading: false, error }));
            return reject(new Error(error));
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const coords: LocationCoords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              };
              setState(prev => ({
                ...prev,
                location: coords,
                isLoading: false,
                hasPermission: true
              }));
              resolve(coords);
            },
            (error) => {
              let errorMessage = 'Erreur de géolocalisation';
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  errorMessage = 'Permission de géolocalisation refusée';
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMessage = 'Position non disponible';
                  break;
                case error.TIMEOUT:
                  errorMessage = 'Délai d\'attente dépassé';
                  break;
              }
              setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
              reject(new Error(errorMessage));
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000
            }
          );
        });
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Permission de géolocalisation refusée');
        }

        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest
        });

        const coordsObj: LocationCoords = {
          latitude: coords.latitude,
          longitude: coords.longitude
        };

        setState(prev => ({
          ...prev,
          location: coordsObj,
          isLoading: false,
          hasPermission: true
        }));

        return coordsObj;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      throw new Error(message);
    }
  };

  const isUserAtGym = (userLocation: LocationCoords): boolean => {
    const distance = calculateDistance(userLocation, GYM_LOCATION);
    return distance <= MAX_DISTANCE_METERS;
  };

  const validateLocationForVisit = async (): Promise<{
    isValid: boolean;
    distance?: number;
    error?: string;
  }> => {
    try {
      const location = await requestLocation();
      const distance = calculateDistance(location, GYM_LOCATION);
      const isValid = distance <= MAX_DISTANCE_METERS;

      return {
        isValid,
        distance: Math.round(distance),
        error: isValid ? undefined : 'Vous n\'êtes pas à la salle de sport'
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Erreur de géolocalisation'
      };
    }
  };

  return {
    ...state,
    requestLocation,
    isUserAtGym,
    validateLocationForVisit,
    gymLocation: GYM_LOCATION,
    maxDistance: MAX_DISTANCE_METERS
  };
};
