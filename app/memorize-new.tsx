import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { fonts } from '../constants/fonts';
import { setActiveMemorizePlan } from '../services/memorizePlanSession';

const LEVELS = ['1-5', '5-10', '10-15', '15-20', '20-25', '25-30', '30-35', '35-40', '40-45', '45-50', '50-55', '+55'];
const PAGES_PER_DAY = ['0.25', '0.5', '0.75', '1', '1.5', '2'];
const TIME_PER_DAY = ['1-5', '5-15', '15-30', '30-45', '45-60', '+60'];
const ORDER_OPTIONS = ['Random', 'Increasing', 'Decreasing', 'Specific'];

function HeaderIcon({ direction = 'left' }: { direction?: 'left' | 'right' }) {
  if (direction === 'right') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M18.031 16.617L22.314 20.899L20.899 22.314L16.617 18.031C15.0237 19.3082 13.042 20.0029 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20.0029 13.042 19.3082 15.0237 18.031 16.617Z"
          fill="#8B8FA9"
        />
      </Svg>
    );
  }

  return (
    <Svg width={26} height={26} viewBox="0 0 26 26" fill="none">
      <Circle cx={13} cy={13} r={13} fill="#006754" fillOpacity={0.11} />
      <Path
        d="M21.4167 12.5L6.375 12.5"
        stroke="#004B40"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.9167 18.0416L6.375 12.5L11.9167 6.95829"
        stroke="#004B40"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChipGroup({
  items,
  selectedValue,
  onSelect,
}: {
  items: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.chipGrid}>
      {items.map((item) => {
        const selected = item === selectedValue;
        return (
          <TouchableOpacity
            key={item}
            style={[styles.chip, selected && styles.chipSelected]}
            activeOpacity={0.88}
            onPress={() => onSelect(item)}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{item}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function MemorizeNewScreen() {
  const router = useRouter();
  const [level, setLevel] = useState('10-15');
  const [pagesPerDay, setPagesPerDay] = useState('1');
  const [minutesPerDay, setMinutesPerDay] = useState('15-30');
  const [order, setOrder] = useState('Increasing');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerGhost} activeOpacity={0.85}>
            <Text style={styles.headerGhostLine}> </Text>
          </TouchableOpacity>
          <Text style={styles.brand}>Halakat</Text>
          <TouchableOpacity style={styles.headerGhost} activeOpacity={0.85}>
            <HeaderIcon direction="right" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backButton} activeOpacity={0.85} onPress={() => router.back()}>
          <HeaderIcon />
        </TouchableOpacity>

        <Text style={styles.title}>Memorize Quran: New Plan</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Choose my level:</Text>
          <View style={styles.groupCard}>
            <Text style={styles.groupTitle}>Memorized Hizb</Text>
            <ChipGroup items={LEVELS} selectedValue={level} onSelect={setLevel} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.groupCard}>
            <Text style={styles.groupTitle}>Page to memorize per day</Text>
            <ChipGroup items={PAGES_PER_DAY} selectedValue={pagesPerDay} onSelect={setPagesPerDay} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.groupCard}>
            <Text style={styles.groupTitle}>Available time per day (min)</Text>
            <ChipGroup items={TIME_PER_DAY} selectedValue={minutesPerDay} onSelect={setMinutesPerDay} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.groupCard}>
            <Text style={styles.groupTitle}>Order of memorization</Text>
            <ChipGroup items={ORDER_OPTIONS} selectedValue={order} onSelect={setOrder} />
          </View>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.88}
          onPress={async () => {
            try {
              await setActiveMemorizePlan({
                kind: 'custom',
                level,
                pagesPerDay,
                minutesPerDay,
                order,
              });
              router.push('/track');
            } catch (error) {
              Alert.alert('Unable to start plan', error instanceof Error ? error.message : 'Please try again.');
            }
          }}
        >
          <Text style={styles.startButtonText}>Start the plan</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 38,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerGhost: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerGhostLine: {
    width: 24,
    height: 2,
    backgroundColor: 'transparent',
  },
  brand: {
    fontSize: 24,
    color: '#0B3727',
    fontFamily: fonts.bold,
  },
  backButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  title: {
    marginTop: 14,
    fontSize: 27,
    lineHeight: 34,
    color: '#0B3727',
    fontFamily: fonts.semiBold,
  },
  section: {
    marginTop: 18,
  },
  sectionLabel: {
    marginBottom: 10,
    fontSize: 18,
    color: '#0B3727',
    fontFamily: fonts.medium,
  },
  groupCard: {
    borderRadius: 24,
    backgroundColor: '#F8FBF8',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5EEEA',
  },
  groupTitle: {
    fontSize: 16,
    color: '#0D3B2D',
    fontFamily: fonts.semiBold,
  },
  chipGrid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    minWidth: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E4DD',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: '#0F6A53',
    borderColor: '#0F6A53',
  },
  chipText: {
    color: '#466257',
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  startButton: {
    marginTop: 28,
    borderRadius: 20,
    backgroundColor: '#0F6A53',
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
});
