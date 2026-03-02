import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
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

const PRAYER_ORDER: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

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
  const url = `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch prayer timings');
  }

  const payload = (await response.json()) as AladhanResponse;
  if (!payload?.data?.timings) {
    throw new Error('Invalid prayer timings response');
  }

  return payload;
};

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

  const loadPrayerTimes = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        throw new Error('Location permission is required to fetch accurate prayer times.');
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      try {
        const places = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (places.length > 0) {
          const place = places[0];
          const city = place.city || place.subregion || place.region || 'Unknown city';
          const country = place.country || '';
          setLocationLabel(country ? `${city}, ${country}` : city);
        } else {
          setLocationLabel(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
        }
      } catch {
        setLocationLabel(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
      }

      const payload = await fetchPrayerTimesByCoordinates(latitude, longitude);
      const nextTimings: PrayerTimes = {
        Fajr: cleanTime(payload.data.timings.Fajr),
        Dhuhr: cleanTime(payload.data.timings.Dhuhr),
        Asr: cleanTime(payload.data.timings.Asr),
        Maghrib: cleanTime(payload.data.timings.Maghrib),
        Isha: cleanTime(payload.data.timings.Isha),
      };

      setGregorianDate(payload.data.date.gregorian.date);
      setHijriDate(payload.data.date.hijri.date);
      setTimezone(payload.data.meta.timezone);
      setTimings(nextTimings);
      setNextPrayer(getNextPrayer(nextTimings, payload.data.meta.timezone));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load prayer times right now.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPrayerTimes();
  }, [loadPrayerTimes]);

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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Asslamualaikum</Text>
          <Text style={styles.title}>Prayer Times</Text>
          <Text style={styles.subtitle}>Daily salah schedule based on your location.</Text>
        </View>

        <LinearGradient colors={['#6F9A84', '#BDCCC1']} style={styles.heroCard}>
          <Text style={styles.heroLabel}>Current Location</Text>
          <Text style={styles.heroLocation}>{locationLabel}</Text>
          <Text style={styles.heroDate}>{gregorianDate || '---'}  |  {hijriDate || '---'}</Text>
          <Text style={styles.heroTimezone}>{timezone || 'Timezone unavailable'}</Text>
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
        </View>

        {isLoading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color="#0F6A4C" />
            <Text style={styles.loadingText}>Loading prayer times...</Text>
          </View>
        )}

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.listSection}>
          {todayRows.map((row) => (
            <View key={row.name} style={[styles.prayerRow, row.isNext && styles.prayerRowActive]}>
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
    marginBottom: 10,
    fontFamily: fonts.medium,
  },
  heroNextPrayer: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: fonts.semiBold,
  },
  actionRow: {
    marginBottom: 12,
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

