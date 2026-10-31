import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MapPin, Users } from 'lucide-react-native';
import { Circle } from '../services/circlesApi';
import { fonts } from '../constants/fonts';

export function CircleCard({ circle, onJoin, joining = false }: { circle: Circle; onJoin?: () => void; joining?: boolean }) {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{circle.name.charAt(0).toUpperCase()}</Text></View>
        <View style={styles.titleCopy}>
          <Text style={styles.name} numberOfLines={1}>{circle.name}</Text>
          <Text style={styles.creator} numberOfLines={1}>Created by {circle.creatorName}</Text>
        </View>
        {circle.isMember ? <Text style={styles.joined}>Joined</Text> : onJoin ? <TouchableOpacity style={styles.joinButton} onPress={onJoin} disabled={joining}><Text style={styles.joinButtonText}>{joining ? '...' : 'Join'}</Text></TouchableOpacity> : null}
      </View>
      <Text style={styles.description} numberOfLines={3}>{circle.description || 'A Quran circle for steady practice and accountability.'}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>{circle.level}</Text>
        <Text style={styles.meta}>{circle.pagesPerDay} pages/day</Text>
        <View style={styles.metaWithIcon}><Users size={13} color="#5A7B6F" /><Text style={styles.meta}>{circle.memberCount}/{circle.maxMembers}</Text></View>
      </View>
      <View style={styles.locationRow}><MapPin size={13} color="#7B8C86" /><Text style={styles.location}>{circle.distanceKm != null ? `${circle.distanceKm} km · ` : ''}{circle.locationLabel}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 16, marginBottom: 12, shadowColor: '#123B2F', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#DCEFE5', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.bold, fontSize: 18, color: '#0F6A53' },
  titleCopy: { flex: 1, minWidth: 0, marginLeft: 11, marginRight: 8 },
  name: { fontFamily: fonts.semiBold, color: '#173B31', fontSize: 16 },
  creator: { fontFamily: fonts.regular, color: '#8A9A94', fontSize: 11, marginTop: 2 },
  description: { fontFamily: fonts.regular, color: '#60726B', fontSize: 12, lineHeight: 18, marginTop: 13, flexShrink: 1 },
  metaRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 13, flexWrap: 'wrap' },
  meta: { fontFamily: fonts.medium, color: '#5A7B6F', fontSize: 11 },
  metaWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 9 },
  location: { fontFamily: fonts.regular, color: '#8A9A94', fontSize: 11 },
  joinButton: { backgroundColor: '#0F6A53', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 9 },
  joinButtonText: { color: '#FFF', fontFamily: fonts.semiBold, fontSize: 12 },
  joined: { color: '#0F6A53', fontFamily: fonts.semiBold, fontSize: 12 },
});
