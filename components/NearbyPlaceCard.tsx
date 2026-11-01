import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ExternalLink, MapPin, Star } from 'lucide-react-native';
import { NearbyPlace } from '../services/circlesApi';
import { fonts } from '../constants/fonts';

export function NearbyPlaceCard({ place }: { place: NearbyPlace }) {
  const openMaps = () => {
    if (place.mapsUrl) void Linking.openURL(place.mapsUrl);
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.icon}><MapPin size={19} color="#0F6A53" /></View>
        <View style={styles.copy}>
          <Text style={styles.name} numberOfLines={2}>{place.name}</Text>
          <Text style={styles.address} numberOfLines={2}>{place.address}</Text>
          {typeof place.distanceKm === 'number' && <Text style={styles.distance}>{place.distanceKm < 1 ? `${Math.round(place.distanceKm * 1000)} m away` : `${place.distanceKm} km away`}</Text>}
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.source}><Text style={styles.sourceText}>{place.source}</Text>{place.rating ? <><Star size={12} color="#D69B32" fill="#D69B32" /><Text style={styles.rating}>{place.rating.toFixed(1)} ({place.ratingCount})</Text></> : null}</View>
        <TouchableOpacity style={styles.mapButton} onPress={openMaps} disabled={!place.mapsUrl}><Text style={styles.mapButtonText}>Open Maps</Text><ExternalLink size={14} color="#FFF" /></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 15, marginBottom: 12, shadowColor: '#123B2F', shadowOpacity: .06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  icon: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#E5F3E9', alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, minWidth: 0, marginLeft: 11 },
  name: { color: '#173B31', fontFamily: fonts.semiBold, fontSize: 15, lineHeight: 20 },
  address: { color: '#7B8C86', fontFamily: fonts.regular, fontSize: 11, lineHeight: 16, marginTop: 3 },
  distance: { color: '#0F6A53', fontFamily: fonts.semiBold, fontSize: 11, marginTop: 6 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 13 },
  source: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  sourceText: { color: '#5A7B6F', fontFamily: fonts.medium, fontSize: 10 },
  rating: { color: '#8A9A94', fontFamily: fonts.regular, fontSize: 10 },
  mapButton: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#0F6A53', borderRadius: 11, paddingHorizontal: 11, paddingVertical: 8 },
  mapButtonText: { color: '#FFF', fontFamily: fonts.semiBold, fontSize: 11 },
});
