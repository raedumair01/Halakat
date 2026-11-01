import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { getNearbyPlaces, NearbyPlace } from '../services/circlesApi';
import { fonts } from '../constants/fonts';
import { Header } from './circle-top';
import { NearbyPlaceCard } from '../components/NearbyPlaceCard';
import { getLiveLocation, LocationPermissionError } from '../services/location';
import { showHalakatDialog } from '../services/dialogService';

export default function CircleNearbyScreen() {
  const router = useRouter();
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationMessage, setLocationMessage] = useState('Requesting location permission…');
  const [permissionAction, setPermissionAction] = useState<'request' | 'settings' | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async (searchTerm = '') => {
    try {
      const position = await getLiveLocation();
      const nearbyPlaces = await getNearbyPlaces(position.coords.latitude, position.coords.longitude, 50, searchTerm);
      setPlaces(nearbyPlaces);
      setLocationMessage('Real places found around your current location');
      setPermissionAction(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to find nearby places right now.';
      setLocationMessage(message);
      if (error instanceof LocationPermissionError) {
        setPermissionAction(error.canAskAgain ? 'request' : 'settings');
        showHalakatDialog('Location permission needed', message, [
          { text: 'Not now', style: 'cancel' },
          ...(error.canAskAgain ? [] : [{ text: 'Open Settings', onPress: () => Linking.openSettings() }]),
        ]);
      }
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
            {permissionAction && <TouchableOpacity style={styles.permissionButton} onPress={() => permissionAction === 'settings' ? void Linking.openSettings() : void load()}><Text style={styles.permissionButtonText}>{permissionAction === 'settings' ? 'Open Settings' : 'Allow location'}</Text></TouchableOpacity>}
          </View>
        </View>
        <Text style={styles.disclaimer}>Listings come from OpenStreetMap. A listed mosque or Islamic center may not currently host a Halakah, so confirm the schedule before visiting.</Text>
        <View style={styles.searchRow}><TextInput value={search} onChangeText={setSearch} onSubmitEditing={() => void load(search)} returnKeyType="search" placeholder="Search nearby mosques" placeholderTextColor="#8A9A94" style={styles.searchInput} /><TouchableOpacity style={styles.searchButton} onPress={() => void load(search)}><Text style={styles.searchButtonText}>Search</Text></TouchableOpacity></View>
        {loading ? <ActivityIndicator color="#0F6A53" style={styles.loader} /> : places.length ? places.map(place => <NearbyPlaceCard key={place.id} place={place} />) : <View style={styles.empty}><Text style={styles.emptyTitle}>No nearby places found</Text><Text style={styles.emptyText}>Allow location access, then try again. We search up to 50 km for real mosques and Islamic centers.</Text></View>}
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
  permissionButton: { alignSelf: 'flex-start', backgroundColor: '#0F6A53', borderRadius: 10, paddingHorizontal: 11, paddingVertical: 7, marginTop: 9 },
  permissionButtonText: { color: '#FFF', fontFamily: fonts.semiBold, fontSize: 11 },
  disclaimer: { color: '#81918A', fontFamily: fonts.regular, fontSize: 11, lineHeight: 16, marginBottom: 16 },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  searchInput: { flex: 1, minWidth: 0, backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, color: '#173B31', fontFamily: fonts.regular, fontSize: 13, borderWidth: 1, borderColor: '#DCE9E0' },
  searchButton: { backgroundColor: '#0F6A53', borderRadius: 14, paddingHorizontal: 15, justifyContent: 'center' },
  searchButtonText: { color: '#FFF', fontFamily: fonts.semiBold, fontSize: 12 },
  loader: { marginTop: 30 },
  empty: { marginTop: 35, alignItems: 'center', padding: 22 },
  emptyTitle: { fontFamily: fonts.semiBold, color: '#173B31', fontSize: 17 },
  emptyText: { fontFamily: fonts.regular, color: '#71817B', textAlign: 'center', fontSize: 12, lineHeight: 18, marginTop: 7 },
});
