import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { getNearbyPlaces, NearbyPlace } from '../services/circlesApi';
import { fonts } from '../constants/fonts';
import { Header } from './circle-top';
import { NearbyPlaceCard } from '../components/NearbyPlaceCard';

export default function CircleNearbyScreen() {
  const router = useRouter();
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationMessage, setLocationMessage] = useState('Finding real Islamic centers near you…');

  const load = useCallback(async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setLocationMessage('Location permission is needed to find nearby places.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const nearbyPlaces = await getNearbyPlaces(position.coords.latitude, position.coords.longitude);
      setPlaces(nearbyPlaces);
      setLocationMessage('Real places found around your current location');
    } catch (error) {
      setLocationMessage(error instanceof Error ? error.message : 'Unable to find nearby places right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Header title="Nearby Halakat" onBack={() => router.back()} />
        <View style={styles.locationCard}>
          <Text style={styles.pin}>⌖</Text>
          <View style={styles.locationCopy}>
            <Text style={styles.locationTitle}>Live location discovery</Text>
            <Text style={styles.locationText}>{locationMessage}</Text>
          </View>
        </View>
        <Text style={styles.disclaimer}>Listings come from OpenStreetMap. A listed mosque or Islamic center may not currently host a Halakah, so confirm the schedule before visiting.</Text>
        {loading ? <ActivityIndicator color="#0F6A53" style={styles.loader} /> : places.length ? places.map(place => <NearbyPlaceCard key={place.id} place={place} />) : <View style={styles.empty}><Text style={styles.emptyTitle}>No nearby places found</Text><Text style={styles.emptyText}>Try again from a different location or expand the search later.</Text></View>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7FBF8' },
  content: { padding: 20, paddingBottom: 40 },
  locationCard: { backgroundColor: '#E8F5EB', borderRadius: 18, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  pin: { color: '#0F6A53', fontSize: 26, marginRight: 12 },
  locationCopy: { flex: 1, minWidth: 0 },
  locationTitle: { fontFamily: fonts.semiBold, color: '#173B31', fontSize: 13 },
  locationText: { fontFamily: fonts.regular, color: '#71817B', fontSize: 11, lineHeight: 16, marginTop: 3 },
  disclaimer: { color: '#81918A', fontFamily: fonts.regular, fontSize: 11, lineHeight: 16, marginBottom: 16 },
  loader: { marginTop: 30 },
  empty: { marginTop: 35, alignItems: 'center', padding: 22 },
  emptyTitle: { fontFamily: fonts.semiBold, color: '#173B31', fontSize: 17 },
  emptyText: { fontFamily: fonts.regular, color: '#71817B', textAlign: 'center', fontSize: 12, lineHeight: 18, marginTop: 7 },
});
