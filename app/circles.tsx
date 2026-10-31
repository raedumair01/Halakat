import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, Compass, Plus, Trophy, Users } from 'lucide-react-native';
import { CircleCard } from '../components/CircleCard';
import { Circle, getTopCircles } from '../services/circlesApi';
import { fonts } from '../constants/fonts';

export default function CirclesScreen() {
  const router = useRouter();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async () => { try { setCircles(await getTopCircles()); } catch (error) { console.error('Failed to load circles:', error); } finally { setLoading(false); setRefreshing(false); } }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return <SafeAreaView style={styles.safe} edges={['top']}><ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor="#0F6A53" />} contentContainerStyle={styles.content}>
    <View style={styles.top}><TouchableOpacity onPress={() => router.back()} style={styles.icon}><ArrowLeft size={21} color="#173B31" /></TouchableOpacity><Text style={styles.topTitle}>Halakat Circles</Text><View style={styles.icon} /></View>
    <View style={styles.hero}><Text style={styles.eyebrow}>COMMUNITY CIRCLE</Text><Text style={styles.heroArabic}>حلقة القرآن</Text><Text style={styles.heroTitle}>Grow together, one ayah at a time.</Text><Text style={styles.heroText}>Find people with a similar Quran routine, stay accountable, and make your daily practice easier.</Text></View>
    <View style={styles.grid}>
      <Action icon={<Trophy size={21} color="#0F6A53" />} title="Top circles" subtitle="See active communities" onPress={() => router.push('/circle-top')} />
      <Action icon={<Users size={21} color="#0F6A53" />} title="My circles" subtitle="Your joined circles" onPress={() => router.push('/circle-my')} />
      <Action icon={<Compass size={21} color="#0F6A53" />} title="Nearby" subtitle="Use your location" onPress={() => router.push('/circle-nearby')} />
      <Action icon={<Plus size={21} color="#0F6A53" />} title="Create" subtitle="Start a new circle" onPress={() => router.push('/circle-create')} />
    </View>
    <TouchableOpacity style={styles.matchButton} onPress={() => router.push('/circle-match')}><Text style={styles.matchButtonText}>Find my best circle match</Text><ChevronRight size={17} color="#0F6A53" /></TouchableOpacity>
    <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Popular right now</Text><TouchableOpacity onPress={() => router.push('/circle-top')}><Text style={styles.seeAll}>See all</Text></TouchableOpacity></View>
    {loading ? <ActivityIndicator color="#0F6A53" style={styles.loader} /> : circles.slice(0, 3).map(circle => <CircleCard key={circle.id} circle={circle} />)}
  </ScrollView></SafeAreaView>;
}

function Action({ icon, title, subtitle, onPress }: { icon: React.ReactNode; title: string; subtitle: string; onPress: () => void }) { return <TouchableOpacity style={styles.action} onPress={onPress}><View style={styles.actionIcon}>{icon}</View><View style={styles.actionCopy}><Text style={styles.actionTitle}>{title}</Text><Text style={styles.actionSubtitle}>{subtitle}</Text></View><ChevronRight size={17} color="#A6B7AE" /></TouchableOpacity>; }

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#F7FBF8' }, content: { padding: 20, paddingBottom: 40 }, top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }, topTitle: { fontFamily: fonts.semiBold, color: '#173B31', fontSize: 18 }, icon: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center' }, hero: { backgroundColor: '#0F6A53', borderRadius: 26, padding: 22, marginBottom: 16 }, eyebrow: { color: '#BFE4CC', fontFamily: fonts.semiBold, fontSize: 10, letterSpacing: 1.4 }, heroArabic: { color: '#FFF', fontFamily: fonts.arabicQuran, fontSize: 26, marginTop: 10 }, heroTitle: { color: '#FFF', fontFamily: fonts.semiBold, fontSize: 21, marginTop: 8 }, heroText: { color: '#D8F0DF', fontFamily: fonts.regular, fontSize: 12, lineHeight: 19, marginTop: 8 }, grid: { gap: 10, marginBottom: 10 }, action: { backgroundColor: '#FFF', borderRadius: 18, padding: 13, flexDirection: 'row', alignItems: 'center' }, actionIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#E5F3E9', alignItems: 'center', justifyContent: 'center' }, actionCopy: { flex: 1, marginLeft: 11 }, actionTitle: { fontFamily: fonts.semiBold, color: '#173B31', fontSize: 14 }, actionSubtitle: { fontFamily: fonts.regular, color: '#8A9A94', fontSize: 11, marginTop: 2 }, matchButton: { borderWidth: 1, borderColor: '#B8D9C4', borderRadius: 16, padding: 13, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 23 }, matchButtonText: { color: '#0F6A53', fontFamily: fonts.semiBold, fontSize: 12 }, sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }, sectionTitle: { fontFamily: fonts.semiBold, color: '#173B31', fontSize: 17 }, seeAll: { fontFamily: fonts.medium, color: '#0F6A53', fontSize: 12 }, loader: { marginTop: 30 } });
