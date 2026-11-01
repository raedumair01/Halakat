import * as Location from 'expo-location';

export class LocationPermissionError extends Error {
  canAskAgain: boolean;

  constructor(canAskAgain: boolean) {
    super(canAskAgain
      ? 'Location permission is needed to find nearby Halakaat.'
      : 'Location permission is blocked. Enable it from Android Settings to find nearby Halakaat.');
    this.name = 'LocationPermissionError';
    this.canAskAgain = canAskAgain;
  }
}

export async function getLiveLocation() {
  const current = await Location.getForegroundPermissionsAsync();
  const permission = current.status === 'granted'
    ? current
    : await Location.requestForegroundPermissionsAsync();

  if (permission.status !== 'granted') {
    throw new LocationPermissionError(permission.canAskAgain);
  }

  return Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
}
