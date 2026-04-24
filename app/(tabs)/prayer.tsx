import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { fonts } from '../../constants/fonts';

type PrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

type PrayerTimes = Record<PrayerName, string>;

type AladhanResponse = {
  data: {
    timings: Record<string, string>;
    date: {
      gregorian: { date: string };
      hijri: { date: string };
    };
    meta: {
      timezone: string;
    };
  };
};

type CachedPrayerPayload = {
  locationLabel: string;
  timezone: string;
  gregorianDate: string;
  hijriDate: string;
  timings: PrayerTimes;
  latitude: number;
  longitude: number;
  savedAt: string;
};

const PRAYER_ORDER: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const PRAYER_CACHE_KEY = 'halakat_prayer_cache_v1';
const PRAYER_CALCULATION_METHOD = 1;

const cleanTime = (time: string) => (time || '').split(' ')[0];

const formatTimeWithMeridiem = (time: string) => {
  const cleaned = cleanTime(time);
  const [rawHour, rawMinute] = cleaned.split(':').map((value) => Number(value) || 0);
  const isPM = rawHour >= 12;
  const hour12 = rawHour % 12 || 12;
  const minute = String(rawMinute).padStart(2, '0');
  return `${hour12}:${minute} ${isPM ? 'PM' : 'AM'}`;
};

const toMinutes = (time: string) => {
  const [hour, minute] = cleanTime(time).split(':').map((value) => Number(value) || 0);
  return hour * 60 + minute;
};

const getNowMinutesInTimeZone = (timeZone?: string) => {
  try {
    if (!timeZone) {
      const now = new Date();
      return now.getHours() * 60 + now.getMinutes();
    }

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date());
    const hour = Number(parts.find((p) => p.type === 'hour')?.value || 0);
    const minute = Number(parts.find((p) => p.type === 'minute')?.value || 0);
    return hour * 60 + minute;
  } catch {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }
};

const getNextPrayer = (timings: PrayerTimes, timeZone?: string) => {
  const nowMinutes = getNowMinutesInTimeZone(timeZone);

  for (const prayer of PRAYER_ORDER) {
    if (toMinutes(timings[prayer]) > nowMinutes) {
      return prayer;
    }
  }

  return 'Fajr';
};

const fetchPrayerTimesByCoordinates = async (latitude: number, longitude: number): Promise<AladhanResponse> => {
  const url = `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=${PRAYER_CALCULATION_METHOD}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch prayer timings.');
  }

  const payload = (await response.json()) as AladhanResponse;
  if (!payload?.data?.timings) {
    throw new Error('Invalid prayer timings response.');
  }

  return payload;
};

async function getReadableLocationLabel(latitude: number, longitude: number) {
  try {
    const places = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (places.length > 0) {
      const place = places[0];
      const city = place.city || place.subregion || place.region || 'Unknown city';
      const country = place.country || '';
      return country ? `${city}, ${country}` : city;
    }
  } catch {
    return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
  }

  return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
}

async function getBestAvailablePosition() {
  const lastKnown = await Location.getLastKnownPositionAsync({
    maxAge: 1000 * 60 * 30,
    requiredAccuracy: 1000,
  });

  try {
    const current = await Promise.race([
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        mayShowUserSettingsDialog: true,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timed out while fetching current location.')), 12000)
      ),
    ]);

    return current;
  } catch (error) {
    if (lastKnown) {
      return lastKnown;
    }

    throw error;
  }
}

function buildPrayerPayload(
  apiPayload: AladhanResponse,
  latitude: number,
  longitude: number,
  locationLabel: string
): CachedPrayerPayload {
  return {
    locationLabel,
    latitude,
    longitude,
    gregorianDate: apiPayload.data.date.gregorian.date,
    hijriDate: apiPayload.data.date.hijri.date,
    timezone: apiPayload.data.meta.timezone,
    timings: {
      Fajr: cleanTime(apiPayload.data.timings.Fajr),
      Dhuhr: cleanTime(apiPayload.data.timings.Dhuhr),
      Asr: cleanTime(apiPayload.data.timings.Asr),
      Maghrib: cleanTime(apiPayload.data.timings.Maghrib),
      Isha: cleanTime(apiPayload.data.timings.Isha),
    },
    savedAt: new Date().toISOString(),
  };
}

export default function PrayerTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState('Detecting location...');
  const [timezone, setTimezone] = useState('');
  const [gregorianDate, setGregorianDate] = useState('');
  const [hijriDate, setHijriDate] = useState('');
  const [timings, setTimings] = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<PrayerName | null>(null);
  const [isUsingCachedData, setIsUsingCachedData] = useState(false);
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState('');

  const applyPrayerPayload = useCallback((payload: CachedPrayerPayload, cached = false) => {
    setLocationLabel(payload.locationLabel);
    setTimezone(payload.timezone);
    setGregorianDate(payload.gregorianDate);
    setHijriDate(payload.hijriDate);
    setTimings(payload.timings);
    setNextPrayer(getNextPrayer(payload.timings, payload.timezone));
    setIsUsingCachedData(cached);
    setLastUpdatedLabel(new Date(payload.savedAt).toLocaleString());
  }, []);

  const loadCachedPrayerTimes = useCallback(async () => {
    const raw = await AsyncStorage.getItem(PRAYER_CACHE_KEY);
    if (!raw) return null;

    try {
      const cached = JSON.parse(raw) as CachedPrayerPayload;
      applyPrayerPayload(cached, true);
      return cached;
    } catch {
      return null;
    }
  }, [applyPrayerPayload]);

  const loadPrayerTimes = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setError(null);

        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          const cached = await loadCachedPrayerTimes();
          if (cached) {
            setError('Location services are off. Showing the last saved prayer times for your recent location.');
            return;
          }

          throw new Error('Turn on location services to load prayer times for your current location.');
        }

        let permission = await Location.getForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
          permission = await Location.requestForegroundPermissionsAsync();
        }

        if (permission.status !== 'granted') {
          const cached = await loadCachedPrayerTimes();
          if (cached) {
            setError('Location permission was denied. Showing the most recent saved prayer times.');
            return;
          }

          throw new Error('Location permission is required to fetch prayer times for your current location.');
        }

        const position = await getBestAvailablePosition();
        const { latitude, longitude } = position.coords;
        const readableLocation = await getReadableLocationLabel(latitude, longitude);
        const apiPayload = await fetchPrayerTimesByCoordinates(latitude, longitude);
        const nextPayload = buildPrayerPayload(apiPayload, latitude, longitude, readableLocation);

        applyPrayerPayload(nextPayload, false);
        await AsyncStorage.setItem(PRAYER_CACHE_KEY, JSON.stringify(nextPayload));
      } catch (err) {
        const cached = await loadCachedPrayerTimes();
        if (cached) {
          setError(
            err instanceof Error
              ? `${err.message} Showing your last saved prayer times instead.`
              : 'Unable to refresh current location, so the last saved prayer times are shown.'
          );
        } else {
          setError(err instanceof Error ? err.message : 'Unable to load prayer times right now.');
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [applyPrayerPayload, loadCachedPrayerTimes]
  );

  useEffect(() => {
    loadPrayerTimes();
  }, [loadPrayerTimes]);

  useFocusEffect(
    useCallback(() => {
      loadPrayerTimes();
    }, [loadPrayerTimes])
  );

  const todayRows = useMemo(
    () =>
      PRAYER_ORDER.map((name) => ({
        name,
        time: timings?.[name] ? formatTimeWithMeridiem(timings[name]) : '--:--',
        isNext: nextPrayer === name,
      })),
    [timings, nextPrayer]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Asslamualaikum</Text>
          <Text style={styles.title}>Prayer Times</Text>
          <Text style={styles.subtitle}>Daily salah schedule based on your current location.</Text>
        </View>

        <LinearGradient colors={['#6F9A84', '#BDCCC1']} style={styles.heroCard}>
          <Text style={styles.heroLabel}>Current Location</Text>
          <Text style={styles.heroLocation}>{locationLabel}</Text>
          <Text style={styles.heroDate}>
            {gregorianDate || '---'} | {hijriDate || '---'}
          </Text>
          <Text style={styles.heroTimezone}>{timezone || 'Timezone unavailable'}</Text>
          {lastUpdatedLabel ? <Text style={styles.heroMeta}>Updated: {lastUpdatedLabel}</Text> : null}
          {isUsingCachedData ? <Text style={styles.heroMeta}>Showing saved timings until live location is available.</Text> : null}
          {nextPrayer && timings && (
            <Text style={styles.heroNextPrayer}>
              Next: {nextPrayer} at {formatTimeWithMeridiem(timings[nextPrayer])}
            </Text>
          )}
        </LinearGradient>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.refreshButton} onPress={() => loadPrayerTimes(true)} disabled={isRefreshing}>
            <Text style={styles.refreshButtonText}>{isRefreshing ? 'Refreshing...' : 'Refresh Location'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => Linking.openSettings()}>
            <Text style={styles.secondaryButtonText}>Location Settings</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color="#0F6A4C" />
            <Text style={styles.loadingText}>Loading prayer times...</Text>
          </View>
        )}

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.listSection}>
          {todayRows.map((row, index) => (
            <View
              key={row.name}
              style={[
                styles.prayerRow,
                row.isNext && styles.prayerRowActive,
                index === todayRows.length - 1 && styles.prayerRowLast,
              ]}
            >
              <Text style={[styles.prayerName, row.isNext && styles.prayerNameActive]}>{row.name}</Text>
              <Text style={[styles.prayerTime, row.isNext && styles.prayerTimeActive]}>{row.time}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#B7B1CE',
    marginBottom: 4,
    fontFamily: fonts.medium,
  },
  title: {
    fontSize: 30,
    color: '#0B3727',
    marginBottom: 6,
    fontFamily: fonts.bold,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: fonts.regular,
  },
  heroCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 13,
    color: '#EAF7EE',
    marginBottom: 6,
    fontFamily: fonts.semiBold,
  },
  heroLocation: {
    fontSize: 22,
    color: '#FFFFFF',
    marginBottom: 6,
    fontFamily: fonts.bold,
  },
  heroDate: {
    fontSize: 13,
    color: '#F3F4F6',
    marginBottom: 4,
    fontFamily: fonts.regular,
  },
  heroTimezone: {
    fontSize: 12,
    color: '#ECFDF5',
    marginBottom: 4,
    fontFamily: fonts.medium,
  },
  heroMeta: {
    fontSize: 12,
    color: '#F5FFF8',
    marginBottom: 4,
    fontFamily: fonts.regular,
  },
  heroNextPrayer: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 6,
    fontFamily: fonts.semiBold,
  },
  actionRow: {
    marginBottom: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  refreshButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#0F6A4C',
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: fonts.semiBold,
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#E7F3EC',
  },
  secondaryButtonText: {
    color: '#0F6A4C',
    fontSize: 13,
    fontFamily: fonts.semiBold,
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: fonts.medium,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    marginBottom: 12,
    lineHeight: 20,
    fontFamily: fonts.medium,
  },
  listSection: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
    backgroundColor: '#FFFFFF',
  },
  prayerRowLast: {
    borderBottomWidth: 0,
  },
  prayerRowActive: {
    backgroundColor: '#ECFDF5',
  },
  prayerName: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: fonts.semiBold,
  },
  prayerNameActive: {
    color: '#0F6A4C',
  },
  prayerTime: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: fonts.medium,
  },
  prayerTimeActive: {
    color: '#0F6A4C',
  },
});
