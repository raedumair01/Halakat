import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Users, Calendar, Clock, MapPin, Plus, Search } from 'lucide-react-native';

export default function HalakatTab() {
  const [activeTab, setActiveTab] = useState<'joined' | 'discover'>('joined');

  const joinedHalakat = [
    {
      id: 1,
      title: 'Tafseer Al-Baqarah',
      description: 'Weekly study of Surah Al-Baqarah with detailed commentary',
      instructor: 'Sheikh Ahmad Al-Rashid',
      participants: 24,
      maxParticipants: 30,
      schedule: 'Every Friday, 7:00 PM',
      location: 'Online',
      nextSession: 'Tomorrow',
      progress: 60,
    },
    {
      id: 2,
      title: 'Fiqh Fundamentals',
      description: 'Understanding Islamic jurisprudence and daily rulings',
      instructor: 'Dr. Fatima Hassan',
      participants: 18,
      maxParticipants: 25,
      schedule: 'Every Wednesday, 8:00 PM',
      location: 'Masjid Al-Noor',
      nextSession: 'In 2 days',
      progress: 40,
    },
  ];

  const discoverHalakat = [
    {
      id: 3,
      title: 'Hadith Sciences',
      description: 'Learn the methodology of Hadith authentication and interpretation',
      instructor: 'Prof. Omar Abdullah',
      participants: 15,
      maxParticipants: 20,
      schedule: 'Every Sunday, 6:00 PM',
      location: 'Online',
      level: 'Intermediate',
      duration: '8 weeks',
    },
    {
      id: 4,
      title: 'Islamic History',
      description: 'Journey through the golden age of Islamic civilization',
      instructor: 'Dr. Sarah Al-Zahra',
      participants: 12,
      maxParticipants: 30,
      schedule: 'Every Monday, 7:30 PM',
      location: 'Islamic Center',
      level: 'Beginner',
      duration: '12 weeks',
    },
    {
      id: 5,
      title: 'Arabic Grammar',
      description: 'Master Quranic Arabic through structured learning',
      instructor: 'Ustadh Khalil Ibrahim',
      participants: 8,
      maxParticipants: 15,
      schedule: 'Tue & Thu, 9:00 PM',
      location: 'Online',
      level: 'Advanced',
      duration: '16 weeks',
    },
  ];

  const renderHalakatCard = (halakat: any, isJoined: boolean = false) => (
    <View key={halakat.id} style={styles.halakatCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.halakatTitle}>{halakat.title}</Text>
        <View style={styles.participantsInfo}>
          <Users size={14} color="#6B7280" />
          <Text style={styles.participantsText}>
            {halakat.participants}/{halakat.maxParticipants}
          </Text>
        </View>
      </View>

      <Text style={styles.halakatDescription}>{halakat.description}</Text>

      <View style={styles.instructorInfo}>
        <View style={styles.instructorAvatar}>
          <Text style={styles.instructorInitial}>
            {halakat.instructor.split(' ').map((name: string) => name[0]).join('')}
          </Text>
        </View>
        <Text style={styles.instructorName}>{halakat.instructor}</Text>
      </View>

      <View style={styles.halakatDetails}>
        <View style={styles.detailItem}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.detailText}>{halakat.schedule}</Text>
        </View>
        <View style={styles.detailItem}>
          <MapPin size={16} color="#6B7280" />
          <Text style={styles.detailText}>{halakat.location}</Text>
        </View>
        {!isJoined && halakat.level && (
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{halakat.level}</Text>
          </View>
        )}
      </View>

      {isJoined && (
        <>
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Progress: {halakat.progress}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${halakat.progress}%` }]} />
            </View>
          </View>
          <View style={styles.nextSessionInfo}>
            <Calendar size={16} color="#059669" />
            <Text style={styles.nextSessionText}>Next session: {halakat.nextSession}</Text>
          </View>
        </>
      )}

      <TouchableOpacity style={[
        styles.actionButton,
        isJoined ? styles.continueButton : styles.joinButton
      ]}>
        <Text style={[
          styles.actionButtonText,
          isJoined ? styles.continueButtonText : styles.joinButtonText
        ]}>
          {isJoined ? 'Continue Learning' : 'Join Halakat'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Halakat</Text>
        <Text style={styles.subtitle}>Islamic Study Circles</Text>
        <TouchableOpacity style={styles.createButton}>
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'joined' && styles.activeTab]}
          onPress={() => setActiveTab('joined')}
        >
          <Text style={[styles.tabText, activeTab === 'joined' && styles.activeTabText]}>
            My Halakat (2)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
            Discover
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'joined' ? (
          <View style={styles.section}>
            {joinedHalakat.map(halakat => renderHalakatCard(halakat, true))}
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.searchContainer}>
              <Search size={20} color="#9CA3AF" />
              <Text style={styles.searchPlaceholder}>Search halakat by topic...</Text>
            </View>
            {discoverHalakat.map(halakat => renderHalakatCard(halakat, false))}
          </View>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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
  createButton: {
    backgroundColor: '#059669',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#059669',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#059669',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
    marginLeft: 12,
  },
  halakatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  halakatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  halakatDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  instructorInitial: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  instructorName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  halakatDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  levelBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400E',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#059669',
    borderRadius: 2,
  },
  nextSessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  nextSessionText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#059669',
  },
  joinButton: {
    backgroundColor: '#059669',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonText: {
    color: '#059669',
  },
  joinButtonText: {
    color: '#FFFFFF',
  },
});