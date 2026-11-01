import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { getNearbyPlaces, NearbyPlace } from '../services/circlesApi';
import { fonts } from '../constants/fonts';
import { NearbyPlaceCard } from '../components/NearbyPlaceCard';
import { showHalakatDialog } from '../services/dialogService';

export default function CircleTopScreen() {
  const router = useRouter();
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Finding popular Islamic centers near you…');

  const load = useCallback(async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setMessage('Location permission is required to rank nearby places.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const results = await getNearbyPlaces(position.coords.latitude, position.coords.longitude, 50);
      setPlaces([...results].sort((first, second) => ((second.rating || 0) * Math.log10((second.ratingCount || 0) + 1)) - ((first.rating || 0) * Math.log10((first.ratingCount || 0) + 1))));
      setMessage('Popular locations ranked from real nearby place data');
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Unable to load popular locations right now.';
      setMessage(text);
      showHalakatDialog('Top locations unavailable', text);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Header title="Top Nearby Locations" onBack={() => router.back()} />
        <Text style={styles.intro}>These are real mosques and Islamic centers found around your live location. They are not automatically confirmed Halakat, so check their schedule before attending.</Text>
        <View style={styles.status}><Text style={styles.statusTitle}>Live location ranking</Text><Text style={styles.statusText}>{message}</Text></View>
        {loading ? <ActivityIndicator color="#0F6A53" style={styles.loader} /> : places.length ? places.map(place => <NearbyPlaceCard key={place.id} place={place} />) : <View style={styles.empty}><Text style={styles.emptyTitle}>No real locations found</Text><Text style={styles.emptyText}>Enable Google Places and location permission, then try again.</Text></View>}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return <View style={styles.header}><TouchableOpacity onPress={onBack} style={styles.back}><ArrowLeft size={20} color="#173B31" /></TouchableOpacity><Text style={styles.title} numberOfLines={1}>{title}</Text><View style={styles.back} /></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7FBF8' },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  back: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },
  title: { flex: 1, textAlign: 'center', marginHorizontal: 8, fontFamily: fonts.semiBold, fontSize: 18, color: '#173B31' },
  intro: { color: '#71817B', fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  status: { backgroundColor: '#E8F5EB', borderRadius: 18, padding: 15, marginBottom: 17 },
  statusTitle: { fontFamily: fonts.semiBold, color: '#173B31', fontSize: 13 },
  statusText: { fontFamily: fonts.regular, color: '#71817B', fontSize: 11, lineHeight: 16, marginTop: 3 },
  loader: { marginTop: 30 },
  empty: { marginTop: 35, alignItems: 'center', padding: 22 },
  emptyTitle: { fontFamily: fonts.semiBold, color: '#173B31', fontSize: 17 },
  emptyText: { fontFamily: fonts.regular, color: '#71817B', textAlign: 'center', fontSize: 12, lineHeight: 18, marginTop: 7 },
});
