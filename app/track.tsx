import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import Svg, { Circle, G, Path, Polyline, Rect } from 'react-native-svg';
import { fonts } from '../constants/fonts';
import { getActiveMemorizePlan, type MemorizePlan } from '../services/memorizePlanSession';
import { getPracticeProgress, type PracticeProgress } from '../services/practiceProgress';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DESIGN_WIDTH = 374;
const SCALE = SCREEN_WIDTH / DESIGN_WIDTH;

type ProgressItem = {
  title: string;
  percent: number;
  color: string;
  accent: string;
  Icon: React.ComponentType<{ color: string }>;
};

type PlanMetrics = {
  pagesPerDay: number;
  minutesPerDay: number;
  daysPerWeek: number;
  planLabel: string;
};

type CalendarDay = {
  key: string;
  day: number;
  label: string;
  iso: string;
  isToday: boolean;
  isPlanned: boolean;
  hasActivity: boolean;
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfWeek(date: Date) {
  const next = startOfDay(date);
  next.setDate(next.getDate() - next.getDay());
  return next;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getPlanMetrics(plan: MemorizePlan | null): PlanMetrics | null {
  if (!plan) return null;

  if (plan.kind === 'existing') {
    if (plan.id === 'focused') {
      return { pagesPerDay: 3, minutesPerDay: 45, daysPerWeek: 5, planLabel: 'Focused Track' };
    }

    if (plan.id === 'balanced') {
      return { pagesPerDay: 2, minutesPerDay: 30, daysPerWeek: 5, planLabel: 'Balanced Track' };
    }

    return { pagesPerDay: 1, minutesPerDay: 20, daysPerWeek: 5, planLabel: 'Steady Track' };
  }

  const parsedMinutes = Number(plan.minutesPerDay.split('-')[0]);
  return {
    pagesPerDay: Number(plan.pagesPerDay) || 0,
    minutesPerDay: Number.isFinite(parsedMinutes) ? parsedMinutes : 0,
    daysPerWeek: 7,
    planLabel: 'Custom Plan',
  };
}

function getPlanPercent(value: number, max: number) {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / max) * 100)));
}

function isPlannedStudyDay(date: Date, plan: MemorizePlan | null, metrics: PlanMetrics | null) {
  if (!plan || !metrics) return false;

  const currentDay = startOfDay(date);
  const planStart = startOfDay(new Date(plan.startedAt));

  if (currentDay < planStart) return false;
  if (metrics.daysPerWeek >= 7) return true;

  const dayOfWeek = currentDay.getDay();
  return dayOfWeek >= 1 && dayOfWeek <= metrics.daysPerWeek;
}

function pagesToVerses(pagesPerDay: number) {
  return Math.max(1, Math.round(pagesPerDay * 15));
}

function MenuIcon({ size = 24, color = '#8789A3' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M1 6H23V8.44444H1V6ZM1 14.5556H15.6667V17H1V14.5556Z" fill={color} />
    </Svg>
  );
}

function SearchIcon({ size = 24, color = '#8789A3' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18.031 16.617L22.314 20.899L20.899 22.314L16.617 18.031C15.0237 19.3082 13.042 20.0029 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20.0029 13.042 19.3082 15.0237 18.031 16.617ZM16.025 15.875C17.2941 14.5699 18.0029 12.8204 18 11C18 7.132 14.867 4 11 4C7.132 4 4 7.132 4 11C4 14.867 7.132 18 11 18C12.8204 18.0029 14.5699 17.2941 15.875 16.025L16.025 15.875Z"
        fill={color}
      />
    </Svg>
  );
}

function BackArrowIcon({ size = 26 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <Circle cx={13} cy={13} r={13} fill="#006754" fillOpacity={0.11} />
      <Path d="M21.4167 12.5L6.375 12.5" stroke="#004B40" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
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

function BrainIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.5 3C7.57 3 6 4.57 6 6.5c0 .55.12 1.06.34 1.52A3.5 3.5 0 0 0 4 11.5c0 1.4.82 2.61 2 3.17V16.5C6 18.43 7.57 20 9.5 20H10v-6.5a1 1 0 0 1 2 0V20h.5c1.93 0 3.5-1.57 3.5-3.5v-1.83a3.49 3.49 0 0 0 2-3.17 3.5 3.5 0 0 0-2.34-3.48c.22-.46.34-.97.34-1.52C18 4.57 16.43 3 14.5 3c-1.1 0-2.09.51-2.75 1.31C11.09 3.51 10.6 3 9.5 3Z"
        fill={color}
        fillOpacity={0.9}
      />
    </Svg>
  );
}

function UsersIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 11a3 3 0 1 0-2.999-3A3 3 0 0 0 16 11Zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm8 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C23 14.17 18.33 13 16 13ZM8 13c-.29 0-.62.02-.97.05C5.19 13.33 2 14.45 2 16.5V19h5.2v-2.5c0-1.13.6-2.05 1.56-2.72A9.3 9.3 0 0 0 8 13Z"
        fill={color}
        fillOpacity={0.9}
      />
    </Svg>
  );
}

function CycleIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5a7 7 0 0 1 6.93 6H21l-3.1 3.1-.07-.14A9 9 0 1 0 12 21v-2a7 7 0 1 1 0-14Z"
        fill={color}
        fillOpacity={0.9}
      />
    </Svg>
  );
}

function ProgressRing({ percent, color, size = 30 }: { percent: number; color: string; size?: number }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E7EB" strokeWidth={strokeWidth} fill="none" />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={dashOffset}
        rotation={-90}
        originX={size / 2}
        originY={size / 2}
      />
    </Svg>
  );
}

function TrendChart() {
  return (
    <Svg width="100%" height={165 * SCALE} viewBox="0 0 340 165" preserveAspectRatio="none">
      <Rect x="0" y="0" width="340" height="165" rx="18" fill="#FFFFFF" />
      <Polyline points="0,135 35,120 70,108 105,104 140,112 175,80 210,60 245,72 280,95 340,85" fill="none" stroke="#66D6C3" strokeWidth="3.5" />
      <Polyline points="0,125 35,128 70,120 105,95 140,90 175,100 210,88 245,80 280,78 340,76" fill="none" stroke="#7A7CE0" strokeWidth="3.5" />
      <Polyline points="0,145 35,135 70,130 105,118 140,125 175,116 210,120 245,98 280,70 340,40" fill="none" stroke="#FF8A3D" strokeWidth="3.5" />
      <G>
        <Circle cx="210" cy="60" r="6" fill="#66D6C3" stroke="#FFFFFF" strokeWidth="3" />
        <Circle cx="245" cy="80" r="6" fill="#7A7CE0" stroke="#FFFFFF" strokeWidth="3" />
        <Circle cx="70" cy="130" r="6" fill="#FF8A3D" stroke="#FFFFFF" strokeWidth="3" />
      </G>
    </Svg>
  );
}

export default function TrackScreen() {
  const router = useRouter();
  const today = useMemo(() => startOfDay(new Date()), []);
  const [selectedDateIso, setSelectedDateIso] = useState(formatIsoDate(today));
  const [activePlan, setActivePlan] = useState<MemorizePlan | null>(null);
  const [practiceProgress, setPracticeProgress] = useState<PracticeProgress | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;

      (async () => {
        const [plan, progress] = await Promise.all([getActiveMemorizePlan(), getPracticeProgress()]);
        if (!mounted) return;
        setActivePlan(plan);
        setPracticeProgress(progress);
      })();

      return () => {
        mounted = false;
      };
    }, [])
  );

  const planMetrics = useMemo(() => getPlanMetrics(activePlan), [activePlan]);
  const todayIso = formatIsoDate(today);
  const todayStats = practiceProgress?.daily[todayIso];
  const effectiveMemorizedVerses = (todayStats?.memorizedVerses ?? 0) > 0
    ? (todayStats?.memorizedVerses ?? 0)
    : (todayStats?.recitedVerses ?? 0);
  const targetVerses = planMetrics ? pagesToVerses(planMetrics.pagesPerDay) : 0;
  const weeklyTargetDays = planMetrics?.daysPerWeek ?? 0;

  const weeklyCompletedDays = useMemo(() => {
    if (!practiceProgress) return 0;

    return Object.values(practiceProgress.daily).filter(day => {
      if (day.date < formatIsoDate(startOfWeek(today)) || day.date > formatIsoDate(addDays(startOfWeek(today), 6))) {
        return false;
      }

      return day.recitedVerses > 0 || day.memorizedVerses > 0;
    }).length;
  }, [practiceProgress, today]);

  const progressItems = useMemo<ProgressItem[]>(
    () => [
      {
        title: 'Memorization',
        percent: getPlanPercent(effectiveMemorizedVerses, targetVerses || 1),
        color: '#60DEC0',
        accent: 'rgba(43, 210, 171, 0.75)',
        Icon: BrainIcon,
      },
      {
        title: 'Reciting',
        percent: getPlanPercent(todayStats?.recitedVerses ?? 0, targetVerses || 1),
        color: '#8C8CD8',
        accent: 'rgba(118, 118, 209, 0.84)',
        Icon: UsersIcon,
      },
      {
        title: 'Retaining',
        percent: getPlanPercent(weeklyCompletedDays, weeklyTargetDays || 1),
        color: '#FC8648',
        accent: 'rgba(251, 102, 23, 0.79)',
        Icon: CycleIcon,
      },
    ],
    [effectiveMemorizedVerses, targetVerses, todayStats?.recitedVerses, weeklyCompletedDays, weeklyTargetDays]
  );

  const days = useMemo<CalendarDay[]>(() => {
    const weekStart = startOfWeek(today);

    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      const iso = formatIsoDate(date);

      return {
        key: iso,
        day: date.getDate(),
        label: DAY_LABELS[date.getDay()],
        iso,
        isToday: iso === formatIsoDate(today),
        isPlanned: isPlannedStudyDay(date, activePlan, planMetrics),
        hasActivity: Boolean(practiceProgress?.daily[iso]?.recitedVerses || practiceProgress?.daily[iso]?.memorizedVerses),
      };
    });
  }, [activePlan, planMetrics, practiceProgress, today]);

  useEffect(() => {
    if (!days.some(day => day.iso === selectedDateIso)) {
      setSelectedDateIso(days[0]?.iso ?? formatIsoDate(today));
    }
  }, [days, selectedDateIso, today]);

  const selectedDay = days.find(day => day.iso === selectedDateIso) ?? days[0];
  const selectedStats = selectedDay ? practiceProgress?.daily[selectedDay.iso] : undefined;
  const selectedDayPlanText = selectedDay?.isPlanned
    ? `${planMetrics?.pagesPerDay ?? 0} page${planMetrics?.pagesPerDay === 1 ? '' : 's'} planned`
    : 'Recovery / catch-up day';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.8}>
              <MenuIcon size={24 * SCALE} />
            </TouchableOpacity>
            <Text style={styles.brand}>Halakat</Text>
            <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.8}>
              <SearchIcon size={24 * SCALE} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.9}>
            <BackArrowIcon size={26 * SCALE} />
          </TouchableOpacity>

          <View style={styles.titleBlock}>
            <Text style={styles.greeting}>Asslamualaikum</Text>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionBullet} />
              <Text style={styles.sectionTitle}>Track your progress</Text>
            </View>
          </View>

          <View style={styles.progressList}>
            {progressItems.map(item => (
              <View key={item.title} style={styles.progressRow}>
                <View style={[styles.progressIconBox, { backgroundColor: item.accent }]}>
                  <item.Icon color="#FFFFFF" />
                </View>
                <View style={styles.progressCopy}>
                  <Text style={styles.progressTitle}>{item.title}</Text>
                  <Text style={styles.progressSubtitle}>{item.percent}% completed</Text>
                </View>
                <ProgressRing percent={item.percent} color={item.color} size={30 * SCALE} />
              </View>
            ))}
          </View>

          <View style={styles.chartSection}>
            <View style={styles.chartSectionBg} />

            <View style={styles.calendarRow}>
              {days.map(d => {
                const isSelected = d.iso === selectedDateIso;
                return (
                  <TouchableOpacity
                    key={d.key}
                    style={[
                      styles.dayItem,
                      d.isPlanned && styles.dayItemPlanned,
                      isSelected && styles.dayItemSelected,
                    ]}
                    onPress={() => setSelectedDateIso(d.iso)}
                    activeOpacity={0.9}
                  >
                    <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>{d.day}</Text>
                    <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>{d.label}</Text>
                    {isSelected ? <View style={styles.dayDot} /> : d.hasActivity ? <View style={styles.dayDotMuted} /> : null}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.calendarMetaCard}>
              <Text style={styles.calendarMetaTitle}>{selectedDay?.isToday ? 'Today' : `${selectedDay?.label} plan`}</Text>
              <Text style={styles.calendarMetaBody}>
                {activePlan
                  ? `${selectedDayPlanText}. Recited ${selectedStats?.recitedVerses ?? 0} verses and memorized ${selectedStats?.memorizedVerses ?? 0} verses.`
                  : 'Start a memorize plan to populate your weekly calendar and targets.'}
              </Text>
            </View>

            <View style={styles.chartCard}>
              <TrendChart />
            </View>
          </View>

          <View style={[styles.sectionTitleRow, styles.setTargetTitleRow]}>
            <View style={styles.sectionBullet} />
            <Text style={styles.sectionTitle}>Set new target</Text>
          </View>

          {activePlan ? (
            <View style={styles.activePlanCard}>
              <Text style={styles.activePlanTitle}>Active memorize plan</Text>
              <Text style={styles.activePlanBody}>
                {activePlan.kind === 'existing'
                  ? `${planMetrics?.planLabel ?? 'Plan'} • ${planMetrics?.pagesPerDay ?? 0} pages/day • ${planMetrics?.daysPerWeek ?? 0} days/week`
                  : `Custom plan • Level ${activePlan.level} • ${activePlan.pagesPerDay} pages/day • ${activePlan.minutesPerDay} min/day • ${activePlan.order}`}
              </Text>
            </View>
          ) : (
            <View style={styles.activePlanCard}>
              <Text style={styles.activePlanTitle}>Active memorize plan</Text>
              <Text style={styles.activePlanBody}>No plan started yet. Go to Memorize to start one.</Text>
            </View>
          )}
        </View>
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
    paddingBottom: 24,
  },
  container: {
    minHeight: 812 * SCALE,
    paddingHorizontal: 24 * SCALE,
    paddingTop: 45 * SCALE,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 30 * SCALE,
    width: 326 * SCALE,
  },
  headerIconButton: {
    width: 30 * SCALE,
    height: 30 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 20 * SCALE,
    lineHeight: 30 * SCALE,
    color: '#18392B',
    fontFamily: fonts.bold,
  },
  backButton: {
    position: 'absolute',
    left: 25 * SCALE,
    top: 90 * SCALE,
  },
  titleBlock: {
    marginTop: 75 * SCALE,
    width: 324 * SCALE,
  },
  greeting: {
    fontSize: 18 * SCALE,
    lineHeight: 27 * SCALE,
    color: '#8789A3',
    fontFamily: fonts.medium,
    opacity: 0.8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10 * SCALE,
    marginTop: 4 * SCALE,
  },
  sectionBullet: {
    width: 12 * SCALE,
    height: 12 * SCALE,
    borderRadius: 6 * SCALE,
    backgroundColor: '#0F6A4C',
  },
  sectionTitle: {
    fontSize: 24 * SCALE,
    lineHeight: 36 * SCALE,
    color: '#18392B',
    fontFamily: fonts.semiBold,
  },
  progressList: {
    marginTop: 12 * SCALE,
    gap: 18 * SCALE,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 2 * SCALE,
  },
  progressIconBox: {
    width: 50 * SCALE,
    height: 50 * SCALE,
    borderRadius: 5 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 24 * SCALE,
  },
  progressCopy: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 18.7451 * SCALE,
    lineHeight: 25 * SCALE,
    color: '#343434',
    fontFamily: fonts.medium,
  },
  progressSubtitle: {
    marginTop: 1 * SCALE,
    fontSize: 12.159 * SCALE,
    lineHeight: 16 * SCALE,
    color: '#AAAAAA',
    fontFamily: fonts.regular,
  },
  chartSection: {
    marginTop: 22 * SCALE,
    paddingTop: 16 * SCALE,
    paddingBottom: 18 * SCALE,
    position: 'relative',
    left: -24 * SCALE,
    width: 374 * SCALE,
  },
  chartSectionBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 260 * SCALE,
    backgroundColor: 'rgba(227, 238, 236, 0.26)',
  },
  calendarRow: {
    marginTop: 0,
    paddingHorizontal: 11 * SCALE,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    width: 41 * SCALE,
    height: 66 * SCALE,
    borderRadius: 12 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayItemPlanned: {
    backgroundColor: 'rgba(15, 106, 76, 0.08)',
  },
  dayItemSelected: {
    backgroundColor: '#004B40',
  },
  dayNumber: {
    fontSize: 18.7451 * SCALE,
    lineHeight: 25 * SCALE,
    color: '#000000',
    fontFamily: fonts.regular,
  },
  dayNumberSelected: {
    color: '#FFFFFF',
  },
  dayLabel: {
    marginTop: 2 * SCALE,
    fontSize: 14 * SCALE,
    lineHeight: 25 * SCALE,
    color: 'rgba(107, 107, 107, 0.79)',
    fontFamily: fonts.regular,
  },
  dayLabelSelected: {
    color: 'rgba(255, 255, 255, 0.79)',
  },
  dayDot: {
    marginTop: 6 * SCALE,
    width: 5 * SCALE,
    height: 5 * SCALE,
    borderRadius: 3 * SCALE,
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },
  dayDotMuted: {
    marginTop: 6 * SCALE,
    width: 5 * SCALE,
    height: 5 * SCALE,
    borderRadius: 3 * SCALE,
    backgroundColor: '#0F6A4C',
    opacity: 0.7,
  },
  calendarMetaCard: {
    marginTop: 14 * SCALE,
    marginHorizontal: 12 * SCALE,
    borderRadius: 16 * SCALE,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14 * SCALE,
    paddingVertical: 12 * SCALE,
  },
  calendarMetaTitle: {
    fontSize: 14 * SCALE,
    color: '#0F172A',
    fontFamily: fonts.semiBold,
  },
  calendarMetaBody: {
    marginTop: 4 * SCALE,
    fontSize: 12.5 * SCALE,
    lineHeight: 18 * SCALE,
    color: '#667085',
    fontFamily: fonts.regular,
  },
  chartCard: {
    marginTop: 14 * SCALE,
    marginHorizontal: 12 * SCALE,
    borderRadius: 0,
    overflow: 'hidden',
  },
  setTargetTitleRow: {
    marginTop: 24 * SCALE,
  },
  activePlanCard: {
    marginTop: 14 * SCALE,
    borderRadius: 18,
    backgroundColor: '#F8FAFB',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    padding: 14 * SCALE,
  },
  activePlanTitle: {
    fontSize: 14 * SCALE,
    color: '#0F172A',
    fontFamily: fonts.semiBold,
  },
  activePlanBody: {
    marginTop: 6 * SCALE,
    fontSize: 13 * SCALE,
    lineHeight: 18 * SCALE,
    color: '#475467',
    fontFamily: fonts.regular,
  },
});

