import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts } from '../../constants/fonts';

const QUICK_TIPS = [
  {
    id: 'consistency',
    title: 'Small, Daily Consistency',
    description: 'Recite for 10-15 minutes every day instead of long sessions once a week.',
    tag: 'Habit',
  },
  {
    id: 'repeat',
    title: 'Use 3x Repeat Rule',
    description: 'Read each ayah slowly three times before moving to the next one.',
    tag: 'Memorization',
  },
  {
    id: 'listen-first',
    title: 'Listen Before You Recite',
    description: 'Play a trusted reciter first, then mimic the same rhythm and pauses.',
    tag: 'Tajweed',
  },
];

const REFLECTIONS = [
  {
    id: 'niyyah',
    title: 'Renew Your Intention',
    body: 'Start every session with intention. A sincere intention gives your practice barakah.',
  },
  {
    id: 'quality-over-speed',
    title: 'Quality Over Speed',
    body: 'Slow and correct recitation is better than fast recitation with frequent mistakes.',
  },
];

export default function TipsTab() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Asslamualaikum</Text>
          <Text style={styles.title}>Tips & Insights</Text>
          <Text style={styles.subtitle}>Improve recitation, memorization, and consistency.</Text>
        </View>

        <LinearGradient
          colors={['#6F9A84', '#BDCCC1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroLabel}>Today&apos;s Focus</Text>
          <Text style={styles.heroTitle}>Recite With Presence</Text>
          <Text style={styles.heroBody}>
            Read each ayah with calm pace, correct makharij, and mindful pauses between meanings.
          </Text>
          <TouchableOpacity style={styles.heroButton}>
            <Text style={styles.heroButtonText}>Start Practice</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Tips</Text>
          {QUICK_TIPS.map((tip) => (
            <View key={tip.id} style={styles.tipCard}>
              <View style={styles.tipRow}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipTag}>{tip.tag}</Text>
              </View>
              <Text style={styles.tipDescription}>{tip.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reflection</Text>
          {REFLECTIONS.map((item) => (
            <View key={item.id} style={styles.reflectionCard}>
              <Text style={styles.reflectionTitle}>{item.title}</Text>
              <Text style={styles.reflectionBody}>{item.body}</Text>
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
    paddingBottom: 30,
  },
  header: {
    marginBottom: 18,
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
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  heroLabel: {
    fontSize: 13,
    color: '#EAF7EE',
    marginBottom: 8,
    fontFamily: fonts.semiBold,
  },
  heroTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: fonts.bold,
  },
  heroBody: {
    fontSize: 14,
    color: '#F3F4F6',
    lineHeight: 21,
    marginBottom: 14,
    fontFamily: fonts.regular,
  },
  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#0F6A4C',
    borderRadius: 16,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#0B3727',
    marginBottom: 10,
    fontFamily: fonts.semiBold,
  },
  tipCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    padding: 14,
    marginBottom: 10,
  },
  tipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  tipTitle: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontFamily: fonts.semiBold,
  },
  tipTag: {
    fontSize: 12,
    color: '#0F6A4C',
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontFamily: fonts.medium,
  },
  tipDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
  reflectionCard: {
    borderRadius: 14,
    backgroundColor: '#F8FAF9',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 10,
  },
  reflectionTitle: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 6,
    fontFamily: fonts.semiBold,
  },
  reflectionBody: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
});

