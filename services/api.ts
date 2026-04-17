import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = '4000';

function getExpoHost() {
  const hostUri = Constants.expoConfig?.hostUri;

  if (!hostUri) {
    return null;
  }

  return hostUri.split(':')[0] || null;
}

function isLoopbackHost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

function getDefaultBaseUrl() {
  const expoHost = getExpoHost();

  if (expoHost) {
    return `http://${expoHost}:${API_PORT}`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}`;
  }

  return `http://localhost:${API_PORT}`;
}

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, '');
}

function resolveBaseUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (!configuredUrl) {
    return getDefaultBaseUrl();
  }

  try {
    const url = new URL(configuredUrl);

    if (isLoopbackHost(url.hostname)) {
      const expoHost = getExpoHost();

      if (expoHost) {
        url.hostname = expoHost;
        return url.toString();
      }

      if (Platform.OS === 'android') {
        url.hostname = '10.0.2.2';
        return url.toString();
      }
    }

    return url.toString();
  } catch {
    return configuredUrl;
  }
}

export const API_BASE_URL = normalizeBaseUrl(resolveBaseUrl());
