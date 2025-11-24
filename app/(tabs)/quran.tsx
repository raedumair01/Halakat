import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Search, Play, Bookmark, Download } from 'lucide-react-native';

export default function QuranTab() {
  const [searchQuery, setSearchQuery] = useState('');

  const surahs = [
    { number: 1, name: 'Al-Fatiha', arabicName: 'الفاتحة', verses: 7, revelation: 'Meccan' },
    { number: 2, name: 'Al-Baqarah', arabicName: 'البقرة', verses: 286, revelation: 'Medinan' },
    { number: 3, name: 'Ali Imran', arabicName: 'آل عمران', verses: 200, revelation: 'Medinan' },
    { number: 4, name: 'An-Nisa', arabicName: 'النساء', verses: 176, revelation: 'Medinan' },
    { number: 5, name: 'Al-Maidah', arabicName: 'المائدة', verses: 120, revelation: 'Medinan' },
    { number: 6, name: 'Al-Anam', arabicName: 'الأنعام', verses: 165, revelation: 'Meccan' },
    { number: 7, name: 'Al-Araf', arabicName: 'الأعراف', verses: 206, revelation: 'Meccan' },
    { number: 8, name: 'Al-Anfal', arabicName: 'الأنفال', verses: 75, revelation: 'Medinan' },
  ];

  const filteredSurahs = surahs.filter(surah => 
    surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.arabicName.includes(searchQuery)
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Holy Quran</Text>
        <Text style={styles.subtitle}>Read, Listen & Reflect</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Surah..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Last Read */}
      <View style={styles.lastReadCard}>
        <View style={styles.lastReadContent}>
          <Text style={styles.lastReadLabel}>Continue Reading</Text>
          <Text style={styles.lastReadSurah}>Surah Al-Baqarah</Text>
          <Text style={styles.lastReadVerse}>Ayah 255 • Al-Kursi</Text>
        </View>
        <TouchableOpacity style={styles.continueButton}>
          <Play size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Surah List */}
      <ScrollView style={styles.surahList} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>All Surahs ({filteredSurahs.length})</Text>
        
        {filteredSurahs.map((surah, index) => (
          <TouchableOpacity key={surah.number} style={styles.surahItem}>
            <View style={styles.surahNumber}>
              <Text style={styles.surahNumberText}>{surah.number}</Text>
            </View>
            
            <View style={styles.surahInfo}>
              <View style={styles.surahHeader}>
                <Text style={styles.surahName}>{surah.name}</Text>
                <Text style={styles.surahArabic}>{surah.arabicName}</Text>
              </View>
              <View style={styles.surahMeta}>
                <Text style={styles.surahDetails}>
                  {surah.revelation} • {surah.verses} Ayahs
                </Text>
              </View>
            </View>

            <View style={styles.surahActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Download size={16} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Bookmark size={16} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.playButton}>
                <Play size={16} color="#059669" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  lastReadCard: {
    backgroundColor: '#059669',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastReadContent: {
    flex: 1,
  },
  lastReadLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  lastReadSurah: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 4,
  },
  lastReadVerse: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surahList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  surahItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  surahNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  surahNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  surahInfo: {
    flex: 1,
  },
  surahHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  surahName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  surahArabic: {
    fontSize: 18,
    color: '#059669',
    fontWeight: '500',
  },
  surahMeta: {
    marginTop: 4,
  },
  surahDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  surahActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  playButton: {
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    padding: 8,
  },
});