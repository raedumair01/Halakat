import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import { fonts } from '../../constants/fonts';
import { fetchFullQuran } from '../../services/quranApi';

type Ayah = {
  juz: number;
  page: number;
  hizbQuarter: number;
  numberInSurah: number;
};

type Surah = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  ayahs: Ayah[];
};

type QuranData = {
  surahs: Surah[];
};

type TabType = 'Surah' | 'Para' | 'Page' | 'Hijb';

type ListSummary = {
  id: number;
  title: string;
  subtitle: string;
  arabic?: string;
  action?: () => void;
};

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
      <G clipPath="url(#clip0_search_quran)">
        <Path
          d="M18.031 16.617L22.314 20.899L20.899 22.314L16.617 18.031C15.0237 19.3082 13.042 20.0029 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20.0029 13.042 19.3082 15.0237 18.031 16.617ZM16.025 15.875C17.2941 14.5699 18.0029 12.8204 18 11C18 7.132 14.867 4 11 4C7.132 4 4 7.132 4 11C4 14.867 7.132 18 11 18C12.8204 18.0029 14.5699 17.2941 15.875 16.025L16.025 15.875Z"
          fill={color}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_search_quran">
          <Rect width="24" height="24" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

function ReadQuranIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M18.3437 2.72559H13.4894C12.6779 2.72504 11.8905 3.00088 11.2568 3.50768C10.6231 4.01448 10.1809 4.72201 10.0031 5.51371C9.82487 4.72222 9.38258 4.01495 8.74897 3.50823C8.11537 3.0015 7.32818 2.72549 6.51687 2.72559H1.66624C1.22421 2.72575 0.80033 2.90142 0.487766 3.21399C0.175202 3.52655 -0.000467592 3.95043 -0.00063324 4.39246V12.9275C-0.000467592 13.3695 0.175202 13.7934 0.487766 14.1059C0.80033 14.4185 1.22421 14.5942 1.66624 14.5943H4.78062C8.32937 14.5943 9.38812 15.4412 9.89499 17.1987C9.91937 17.2962 10.0756 17.2962 10.1031 17.1987C10.6137 15.4418 11.6725 14.5943 15.2175 14.5943H18.3319C18.7739 14.5942 19.1978 14.4185 19.5103 14.1059C19.8229 13.7934 19.9986 13.3695 19.9987 12.9275V4.39621C19.9988 3.95567 19.8247 3.53297 19.5145 3.22018C19.2043 2.90738 18.783 2.72984 18.3425 2.72621L18.3437 2.72559Z"
        fill="#FFFFFF"
      />
      <Path
        d="M8.28438 11.0244H2.71499C2.64607 11.0244 2.59374 11.0798 2.59374 11.1457V11.9407C2.59374 12.0066 2.64607 12.062 2.71499 12.062H8.28438C8.35024 12.062 8.40563 12.0097 8.40563 11.9407V11.1457C8.40563 11.0798 8.35024 11.0244 8.28438 11.0244Z"
        fill="#FFFFFF"
      />
      <Path
        d="M8.28438 8.91016H2.71499C2.64607 8.91016 2.59374 8.96554 2.59374 9.03141V9.82641C2.59374 9.89227 2.64607 9.94766 2.71499 9.94766H8.28438C8.35024 9.94766 8.40563 9.89533 8.40563 9.82641V9.03141C8.40563 8.96554 8.35024 8.91016 8.28438 8.91016Z"
        fill="#FFFFFF"
      />
      <Path
        d="M8.28438 6.7959H2.71499C2.64607 6.7959 2.59374 6.85129 2.59374 6.91715V7.71215C2.59374 7.77802 2.64607 7.8334 2.71499 7.8334H8.28438C8.35024 7.8334 8.40563 7.78108 8.40563 7.71215V6.91715C8.40563 6.85129 8.35024 6.7959 8.28438 6.7959Z"
        fill="#FFFFFF"
      />
      <Path
        d="M17.2881 11.0215H11.7187C11.6498 11.0215 11.5975 11.0769 11.5975 11.1427V11.9377C11.5975 12.0036 11.6498 12.059 11.7187 12.059H17.2881C17.354 12.059 17.4094 12.0067 17.4094 11.9377V11.1427C17.4094 11.0769 17.354 11.0215 17.2881 11.0215Z"
        fill="#FFFFFF"
      />
      <Path
        d="M17.2881 8.90723H11.7187C11.6498 8.90723 11.5975 8.96262 11.5975 9.02848V9.82348C11.5975 9.88934 11.6498 9.94473 11.7187 9.94473H17.2881C17.354 9.94473 17.4094 9.8924 17.4094 9.82348V9.02848C17.4094 8.96262 17.354 8.90723 17.2881 8.90723Z"
        fill="#FFFFFF"
      />
      <Path
        d="M17.2881 6.7959H11.7187C11.6498 6.7959 11.5975 6.85129 11.5975 6.91715V7.71215C11.5975 7.77802 11.6498 7.8334 11.7187 7.8334H17.2881C17.354 7.8334 17.4094 7.78108 17.4094 7.71215V6.91715C17.4094 6.85129 17.354 6.7959 17.2881 6.7959Z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

function StarNumberIcon({ number }: { number: number }) {
  return (
    <View style={styles.starNumberContainer}>
      <Svg width={36} height={36} viewBox="0 0 36 36" fill="none">
        <Path
          d="M31.0781 12.6219V5.97656C31.0781 5.39409 30.6059 4.92188 30.0234 4.92188H23.3781L18.7442 0.307336C18.3326 -0.102445 17.6673 -0.102445 17.2557 0.307336L12.6219 4.92188H5.97656C5.39409 4.92188 4.92188 5.39409 4.92188 5.97656V12.6219L0.307336 17.2558C-0.102445 17.6674 -0.102445 18.3327 0.307336 18.7443L4.92188 23.3781V30.0234C4.92188 30.6059 5.39409 31.0781 5.97656 31.0781H12.6219L17.2557 35.6927C17.4615 35.8976 17.7308 36 18 36C18.2692 36 18.5385 35.8976 18.7442 35.6927L23.3781 31.0781H30.0234C30.6059 31.0781 31.0781 30.6059 31.0781 30.0234V23.3781L35.6927 18.7443C36.1024 18.3327 36.1024 17.6674 35.6927 17.2558L31.0781 12.6219Z"
          fill="#E7F1EB"
        />
        <Path
          d="M29.2761 22.1983C29.0793 22.396 28.9688 22.6635 28.9688 22.9425V28.9688H22.9425C22.6636 28.9688 22.396 29.0793 22.1984 29.2761L18 33.4569L13.8017 29.2761C13.604 29.0793 13.3365 28.9688 13.0575 28.9688H7.03125V22.9425C7.03125 22.6636 6.92072 22.396 6.72391 22.1984L2.54313 18L6.72391 13.8017C6.92072 13.604 7.03125 13.3365 7.03125 13.0575V7.03125H13.0575C13.3364 7.03125 13.604 6.92072 13.8016 6.72391L18 2.54313L22.1984 6.72391C22.3961 6.92072 22.6636 7.03125 22.9425 7.03125H28.9688V13.0575C28.9688 13.3364 29.0793 13.604 29.2761 13.8016L33.4569 18L29.2761 22.1983Z"
          fill="#588B76"
        />
      </Svg>
      <Text style={styles.starNumberText}>{number}</Text>
    </View>
  );
}

function QuranIllustration() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 206 126" fill="none">
      <Path
        opacity={0.25}
        d="M103.035 126C152.14 126 191.947 116.731 191.947 105.297C191.947 93.8634 152.14 84.5945 103.035 84.5945C53.931 84.5945 14.1241 93.8634 14.1241 105.297C14.1241 116.731 53.931 126 103.035 126Z"
        fill="#042030"
      />
      <Path d="M172.667 5.38672L103.035 29.1985L33.3329 5.38672L0 53.8581L103.035 89.1164L206 53.8581L172.667 5.38672Z" fill="#18392B" />
      <Path
        opacity={0.45}
        d="M12.1467 51.8797L97.5975 84.5944L68.2194 55.4833C68.2194 55.4833 19.9856 43.8247 12.1467 51.8797Z"
        fill="#18392B"
      />
      <Path
        opacity={0.45}
        d="M193.924 51.8797L108.473 84.5944L137.851 55.4833C137.781 55.4833 186.014 43.8247 193.924 51.8797Z"
        fill="#18392B"
      />
      <Path d="M103.035 89.1165L0 53.8582V58.4509L103.035 93.7093L206 58.4509V53.8582L103.035 89.1165Z" fill="#588B76" />
      <Path d="M48.1632 110.314L60.0981 79.0125L98.5156 92.1548L48.1632 110.314Z" fill="#18392B" />
      <Path opacity={0.45} d="M51.4823 101.27L98.5156 92.1548L60.0981 79.0125L51.4823 101.27Z" fill="#18392B" />
      <Path d="M103.035 90.5298L48.1632 110.314L52.2592 114.624L103.035 96.5357L153.741 114.624L157.907 110.314L103.035 90.5298Z" fill="#588B76" />
      <Path d="M157.907 110.314L145.902 79.0125L107.484 92.1548L157.907 110.314Z" fill="#18392B" />
      <Path opacity={0.45} d="M154.518 101.27L107.484 92.1548L145.902 79.0125L154.518 101.27Z" fill="#18392B" />
      <Path
        d="M103.035 96.5357C105.102 96.5357 106.778 94.859 106.778 92.7908C106.778 90.7225 105.102 89.0459 103.035 89.0459C100.968 89.0459 99.2924 90.7225 99.2924 92.7908C99.2924 94.859 100.968 96.5357 103.035 96.5357Z"
        fill="white"
        fillOpacity={0.5}
      />
      <Path
        d="M169.701 5.38672L103.035 38.596L36.3696 5.38672C33.3329 9.41422 8.89819 50.1839 8.89819 50.1839C9.18067 50.1839 9.39253 50.2545 9.67501 50.2545C70.9736 56.4018 87.9932 75.6914 93.6428 80.3549C99.2924 85.0889 103.106 84.5943 103.106 84.5943C103.106 84.5943 106.919 85.0889 112.569 80.3549C118.219 75.6914 135.238 56.4018 196.537 50.2545C196.819 50.2545 197.031 50.1839 197.314 50.1839C197.172 50.1839 172.667 9.48488 169.701 5.38672Z"
        fill="#F5B304"
      />
      <Path
        d="M197.172 50.1841C196.89 50.1841 196.678 50.2547 196.396 50.2547C135.097 56.402 118.077 75.6916 112.428 80.3551C106.778 85.0891 102.965 84.5945 102.965 84.5945C102.965 84.5945 99.1512 85.0891 93.5016 80.3551C87.8519 75.6916 70.8324 56.402 9.53377 50.2547C9.25129 50.2547 9.03943 50.1841 8.75695 50.1841C8.26261 50.9613 8.75695 51.5266 8.75695 51.5266C70.6911 57.5325 87.1457 76.8928 92.7954 81.6269C98.445 86.2903 102.894 85.937 102.894 85.937C102.894 85.937 107.343 86.2903 112.993 81.6269C118.642 76.9635 135.097 57.6032 197.031 51.5266C197.172 51.5266 197.667 50.9613 197.172 50.1841Z"
        fill="#588B76"
      />
      <Path
        d="M167.159 1.50062C133.049 -6.69571 102.965 21.3555 102.965 21.3555C102.965 21.3555 72.8804 -6.69571 38.7707 1.50062C38.7707 1.50062 29.0957 16.3388 15.7484 41.5637C15.7484 41.5637 82.9085 49.1241 102.965 77.3166C123.021 49.1241 190.181 41.5637 190.181 41.5637C176.834 16.3388 167.159 1.50062 167.159 1.50062Z"
        fill="#F5EFFB"
      />
      <Path
        d="M190.181 41.5637C190.181 41.5637 123.021 49.1241 102.965 77.3167C82.9791 49.1241 15.819 41.5637 15.819 41.5637C15.819 41.5637 15.819 43.8248 12.0761 48.2762C12.0761 48.2762 73.0216 52.657 95.1964 77.9526C100.422 83.8879 102.965 83.1813 102.965 83.1813C102.965 83.1813 105.578 83.8879 110.733 77.9526C132.837 52.657 193.853 48.2762 193.853 48.2762C190.181 43.7541 190.181 41.5637 190.181 41.5637Z"
        fill="#DFCBF4"
      />
      <Path
        d="M163.345 4.46826C163.345 4.46826 137.851 -2.03228 102.965 25.0297C68.1488 -1.96162 42.5842 4.46826 42.5842 4.46826L25.3528 37.9602C77.7532 41.5637 102.965 68.0605 102.965 68.0605C102.965 68.0605 128.176 41.5637 180.577 37.9602L163.345 4.46826ZM103.035 64.8809C103.035 64.8809 79.4481 40.7158 29.4488 35.9817L43.926 5.88142C43.926 5.88142 68.9963 1.00602 103.035 26.5842C137.074 1.00602 162.145 5.88142 162.145 5.88142L176.622 35.9817C126.623 40.7158 103.035 64.8809 103.035 64.8809Z"
        fill="#D0DED8"
      />
      <Path opacity={0.2} d="M109.462 50.25C118.878 43.302 148.303 27.9265 168.077 30.0462" stroke="#D0DED8" strokeWidth={3} strokeLinecap="round" />
      <Path opacity={0.2} d="M109.462 30.7529C117.819 24.2062 139.546 11.3791 159.602 12.4443" stroke="#D0DED8" strokeWidth={3} strokeLinecap="round" />
      <Path opacity={0.2} d="M109.462 40.6451C118.525 33.5948 142.088 19.7809 163.84 20.9281" stroke="#D0DED8" strokeWidth={3} strokeLinecap="round" />
      <Path opacity={0.2} d="M97.4563 50.25C88.0402 43.302 58.615 27.9265 38.8413 30.0462" stroke="#D0DED8" strokeWidth={3} strokeLinecap="round" />
      <Path opacity={0.2} d="M97.4563 30.7529C89.0995 24.2062 67.372 11.3791 47.3157 12.4443" stroke="#D0DED8" strokeWidth={3} strokeLinecap="round" />
      <Path opacity={0.2} d="M97.4563 40.6451C88.3933 33.5948 64.8296 19.7809 43.0785 20.9281" stroke="#D0DED8" strokeWidth={3} strokeLinecap="round" />
      <Path
        d="M103.035 21.3556C103.035 21.3556 103.742 18.8825 105.083 19.5891C105.083 19.5891 104.236 59.6522 105.648 75.2676C106.001 79.1538 109.391 84.4532 110.733 86.4316H108.967L108.473 88.0567C108.473 88.0567 103.247 79.2245 103.035 75.7622C101.976 60.2175 102.541 25.1004 103.035 21.3556Z"
        fill="#54DAF5"
      />
    </Svg>
  );
}

export default function QuranTab() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('Surah');
  const [quranData, setQuranData] = useState<QuranData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuran = async () => {
      try {
        setLoading(true);
        const data = await fetchFullQuran<QuranData>();
        setQuranData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Quran');
      } finally {
        setLoading(false);
      }
    };

    loadQuran();
  }, []);

  const surahSummaries = useMemo<ListSummary[]>(() => {
    if (!quranData) return [];

    return quranData.surahs.map((surah) => ({
      id: surah.number,
      title: surah.englishName,
      subtitle: `${surah.revelationType} • ${surah.ayahs.length} verses`,
      arabic: surah.name,
      action: () =>
        router.push({
          pathname: '/surah-detail',
          params: { surahNumber: surah.number.toString() },
        }),
    }));
  }, [quranData, router]);

  const paraSummaries = useMemo<ListSummary[]>(() => {
    if (!quranData) return [];

    const paraMap = new Map<number, { surahs: Set<number>; ayahCount: number }>();

    quranData.surahs.forEach((surah) => {
      surah.ayahs.forEach((ayah) => {
        const juzNumber = Number(ayah.juz);
        const current = paraMap.get(juzNumber) ?? { surahs: new Set<number>(), ayahCount: 0 };
        current.surahs.add(surah.number);
        current.ayahCount += 1;
        paraMap.set(juzNumber, current);
      });
    });

    return Array.from(paraMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([id, value]) => ({
        id,
        title: `Para ${id}`,
        subtitle: `${value.surahs.size} surahs • ${value.ayahCount} ayahs`,
        action: () =>
          router.push({
            pathname: '/para-detail' as never,
            params: { paraNumber: id.toString() } as never,
          }),
      }));
  }, [quranData, router]);

  const pageSummaries = useMemo<ListSummary[]>(() => {
    if (!quranData) return [];

    const pageMap = new Map<number, { surahs: Set<number>; ayahCount: number }>();

    quranData.surahs.forEach((surah) => {
      surah.ayahs.forEach((ayah) => {
        const current = pageMap.get(ayah.page) ?? { surahs: new Set<number>(), ayahCount: 0 };
        current.surahs.add(surah.number);
        current.ayahCount += 1;
        pageMap.set(ayah.page, current);
      });
    });

    return Array.from(pageMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([id, value]) => ({
        id,
        title: `Page ${id}`,
        subtitle: `${value.surahs.size} surahs • ${value.ayahCount} ayahs`,
      }));
  }, [quranData]);

  const hijbSummaries = useMemo<ListSummary[]>(() => {
    if (!quranData) return [];

    const hizbMap = new Map<number, { surahs: Set<number>; ayahCount: number }>();

    quranData.surahs.forEach((surah) => {
      surah.ayahs.forEach((ayah) => {
        const hizb = Math.ceil(Number(ayah.hizbQuarter) / 4);
        const current = hizbMap.get(hizb) ?? { surahs: new Set<number>(), ayahCount: 0 };
        current.surahs.add(surah.number);
        current.ayahCount += 1;
        hizbMap.set(hizb, current);
      });
    });

    return Array.from(hizbMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([id, value]) => ({
        id,
        title: `Hijb ${id}`,
        subtitle: `${value.surahs.size} surahs • ${value.ayahCount} ayahs`,
      }));
  }, [quranData]);

  const currentItems = useMemo(() => {
    if (activeTab === 'Surah') return surahSummaries;
    if (activeTab === 'Para') return paraSummaries;
    if (activeTab === 'Page') return pageSummaries;
    return hijbSummaries;
  }, [activeTab, hijbSummaries, pageSummaries, paraSummaries, surahSummaries]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.85}>
              <MenuIcon size={20} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.brand}>Halakat</Text>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.85}>
              <SearchIcon size={20} color="#8B8FA9" />
            </TouchableOpacity>
          </View>

          <Text style={styles.greeting}>Asslamualaikum</Text>

          <TouchableOpacity style={styles.lastReadCard} activeOpacity={0.9}>
            <LinearGradient
              colors={['#5B8A75', '#B8CBC0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.lastReadGradient}
            >
              <View style={styles.lastReadText}>
                <View style={styles.lastReadLabelRow}>
                  <ReadQuranIcon />
                  <Text style={styles.lastReadLabel}>Last Read</Text>
                </View>
                <Text style={styles.lastReadSurah}>Al-Fatihah</Text>
                <Text style={styles.lastReadVerse}>Ayah No: 1</Text>
              </View>

              <View style={styles.lastReadIllustration}>
                <QuranIllustration />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.tabsContainer}>
            {(['Surah', 'Para', 'Page', 'Hijb'] as TabType[]).map((tab) => {
              const isActive = tab === activeTab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={styles.tabItem}
                  activeOpacity={0.85}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
                  {isActive ? <View style={styles.tabUnderline} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>

          {loading ? (
            <View style={styles.statusCard}>
              <ActivityIndicator size="large" color="#0F6A53" />
              <Text style={styles.statusText}>Loading Quran...</Text>
            </View>
          ) : error ? (
            <View style={styles.statusCard}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {currentItems.map((item, index) => (
                <TouchableOpacity
                  key={`${activeTab}-${item.id}`}
                  style={[styles.listItem, index === currentItems.length - 1 && styles.lastListItem]}
                  activeOpacity={item.action ? 0.82 : 1}
                  onPress={item.action}
                >
                  <View style={styles.listItemLeft}>
                    <StarNumberIcon number={item.id} />
                    <View style={styles.listItemCopy}>
                      <Text style={styles.listItemTitle}>{item.title}</Text>
                      <Text style={styles.listItemSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                  {item.arabic ? <Text style={styles.listItemArabic}>{item.arabic}</Text> : null}
                </TouchableOpacity>
              ))}
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
    paddingBottom: 30,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 14,
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
  greeting: {
    marginTop: 22,
    marginBottom: 16,
    fontSize: 21,
    color: '#B7B1CE',
    fontFamily: fonts.medium,
  },
  lastReadCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#497465',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
    elevation: 8,
  },
  lastReadGradient: {
    height: 132,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  lastReadText: {
    width: 140,
    zIndex: 1,
  },
  lastReadLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  lastReadLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  lastReadSurah: {
    color: '#FFFFFF',
    fontSize: 19,
    fontFamily: fonts.semiBold,
  },
  lastReadVerse: {
    marginTop: 5,
    color: 'rgba(255,255,255,0.88)',
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  lastReadIllustration: {
    flex: 1,
    marginRight: -26,
    marginTop: -8,
    justifyContent: 'center',
  },
  tabsContainer: {
    marginTop: 28,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E9EDF0',
  },
  tabItem: {
    width: '24%',
    alignItems: 'center',
    paddingBottom: 10,
  },
  tabText: {
    fontSize: 16,
    color: '#9AA3AD',
    fontFamily: fonts.medium,
  },
  tabTextActive: {
    color: '#0F3A2B',
    fontFamily: fonts.semiBold,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -11,
    width: 52,
    height: 3,
    borderRadius: 999,
    backgroundColor: '#0F3A2B',
  },
  statusCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
  },
  statusText: {
    marginTop: 14,
    fontSize: 15,
    color: '#667085',
    fontFamily: fonts.regular,
  },
  errorText: {
    fontSize: 15,
    color: '#B42318',
    textAlign: 'center',
    fontFamily: fonts.medium,
  },
  listContainer: {
    paddingTop: 14,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F4',
  },
  lastListItem: {
    borderBottomWidth: 0,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  starNumberContainer: {
    width: 36,
    height: 36,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starNumberText: {
    position: 'absolute',
    color: '#41705E',
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  listItemCopy: {
    flex: 1,
  },
  listItemTitle: {
    color: '#111827',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  listItemSubtitle: {
    marginTop: 2,
    color: '#7A8594',
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  listItemArabic: {
    marginLeft: 12,
    color: '#0F3A2B',
    fontSize: 24,
    fontFamily: fonts.arabicQuran,
  },
});
