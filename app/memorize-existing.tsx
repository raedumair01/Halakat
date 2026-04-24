import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';
import { fonts } from '../constants/fonts';
import { setActiveMemorizePlan, type ExistingPlanId } from '../services/memorizePlanSession';

const EXISTING_PLANS = [
  {
    id: 'focused',
    title: 'Focused Track',
    details: ['Pages per day: 3', 'Days per week: 5', 'End date: 10 Months'],
    image: require('../assets/images/kid.png'),
    panelColor: '#B99A86',
    buttonColor: '#D9C2B4',
    buttonTextColor: '#2C1F1A',
  },
  {
    id: 'balanced',
    title: 'Balanced Track',
    details: ['Pages per day: 2', 'Days per week: 5', 'End date: 15 Months'],
    image: require('../assets/images/quranread.png'),
    panelColor: '#3E6D5F',
    buttonColor: '#2E5B4F',
    buttonTextColor: '#EAF4EF',
  },
  {
    id: 'steady',
    title: 'Steady Track',
    details: ['Pages per day: 1', 'Days per week: 5', 'End date: 30 Months'],
    image: require('../assets/images/desert.png'),
    panelColor: '#163B5A',
    buttonColor: '#5AA3E0',
    buttonTextColor: '#0B1D2D',
  },
];

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

function MenuIcon({ size = 24, color = '#588B76' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6H21V8H3V6ZM3 11H21V13H3V11ZM3 16H21V18H3V16Z" fill={color} />
    </Svg>
  );
}

export default function MemorizeExistingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.85}>
            <MenuIcon size={22} color="#588B76" />
          </TouchableOpacity>
          <Text style={styles.brand}>Halakat</Text>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.85}>
            <HeaderIcon direction="right" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backButton} activeOpacity={0.85} onPress={() => router.back()}>
          <HeaderIcon />
        </TouchableOpacity>

        <Text style={styles.title}>
          Memorize Quran:{'\n'}Existing Plan
        </Text>

        <View style={styles.cards}>
          {EXISTING_PLANS.map((plan, index) => (
            <View key={plan.id} style={styles.planCard}>
              <View style={[styles.planRow, index % 2 === 1 && styles.planRowReverse]}>
                <View style={styles.planArt}>
                  <Image source={plan.image} style={styles.planImage} resizeMode="cover" />
                </View>
                <View style={[styles.planPanel, { backgroundColor: plan.panelColor }]}>
                  <View style={styles.planDetailsList}>
                    {plan.details.map((line) => (
                      <Text key={line} style={styles.planDetailLine}>
                        {'\u2022'} {line}
                      </Text>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={[styles.planButton, { backgroundColor: plan.buttonColor }]}
                    activeOpacity={0.88}
                    onPress={async () => {
                      try {
                        await setActiveMemorizePlan({ kind: 'existing', id: plan.id as ExistingPlanId });
                        router.push('/track');
                      } catch (error) {
                        Alert.alert('Unable to start plan', error instanceof Error ? error.message : 'Please try again.');
                      }
                    }}
                  >
                    <Text style={[styles.planButtonText, { color: plan.buttonTextColor }]}>Start the plan</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.footerButton} activeOpacity={0.88}>
          <Text style={styles.footerButtonText}>Other Plans</Text>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F6F8',
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
    marginTop: 12,
    fontSize: 30,
    lineHeight: 38,
    color: '#0B3727',
    fontFamily: fonts.semiBold,
  },
  cards: {
    marginTop: 22,
    gap: 18,
  },
  planCard: {
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#C9DDD2',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 24,
    elevation: 6,
  },
  planRow: {
    flexDirection: 'row',
    height: 150,
  },
  planRowReverse: {
    flexDirection: 'row-reverse',
  },
  planArt: {
    width: '55%',
    backgroundColor: '#F3F4F6',
  },
  planImage: {
    width: '100%',
    height: '100%',
  },
  planPanel: {
    width: '45%',
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'space-between',
    gap: 10,
  },
  planDetailsList: {
    gap: 4,
  },
  planDetailLine: {
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.88)',
    fontFamily: fonts.medium,
  },
  planButton: {
    borderRadius: 16,
    paddingVertical: 9,
    alignItems: 'center',
  },
  planButtonText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
  },
  footerButton: {
    marginTop: 22,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
});
