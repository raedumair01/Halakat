import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { CircleCard } from '../components/CircleCard';
import { Circle, getMyCircles } from '../services/circlesApi';
import { fonts } from '../constants/fonts';
import { Header } from './circle-top';

export default function CircleMyScreen() { const router = useRouter(); const [circles, setCircles] = useState<Circle[]>([]); const [loading, setLoading] = useState(true); const load = useCallback(async () => { try { setCircles(await getMyCircles()); } catch (error) { console.error('Failed to load my circles:', error); } finally { setLoading(false); } }, []); useFocusEffect(useCallback(() => { void load(); }, [load])); return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}><Header title="My Circles" onBack={() => router.back()} /><Text style={styles.intro}>Your accountability spaces will appear here. Keep showing up and supporting your circle.</Text>{loading ? <ActivityIndicator color="#0F6A53" style={styles.loader} /> : circles.length ? circles.map(circle => <CircleCard key={circle.id} circle={circle} />) : <View style={styles.empty}><Text style={styles.emptyTitle}>No circles yet</Text><Text style={styles.emptyText}>Join a community or create your own to begin.</Text></View>}</ScrollView></SafeAreaView>; }
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#F7FBF8' }, content: { padding: 20, paddingBottom: 40 }, intro: { color: '#71817B', fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, marginBottom: 18 }, loader: { marginTop: 30 }, empty: { backgroundColor: '#E8F5EB', borderRadius: 22, padding: 25, alignItems: 'center', marginTop: 35 }, emptyTitle: { fontFamily: fonts.semiBold, color: '#173B31', fontSize: 17 }, emptyText: { fontFamily: fonts.regular, color: '#71817B', textAlign: 'center', fontSize: 12, marginTop: 7 } });
