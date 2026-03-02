import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { fonts } from '../constants/fonts';
import { fetchJuz } from '../services/quranApi';

type Surah = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  ayahs: Array<{
    number: number;
    numberInSurah: number;
    juz: number;
  }>;
};

type ParaSurah = {
  surah: Surah;
  startAyah: number;
  endAyah: number;
};

type JuzResponse = {
  number: number;
  surahs?: Record<string, {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    ayahs?: Array<{
      numberInSurah: number | string;
      juz: number | string;
    }>;
  }>;
  ayahs?: Array<{
    number: number;
    numberInSurah: number | string;
    juz: number | string;
    surah: {
      number: number;
      name: string;
      englishName: string;
      englishNameTranslation: string;
      revelationType: string;
    };
  }>;
};

function buildParaSurahList(juzData: JuzResponse, paraNumber: number): ParaSurah[] {
  const bySurah = new Map<number, ParaSurah>();

  if (juzData.surahs && Object.keys(juzData.surahs).length > 0) {
    Object.values(juzData.surahs).forEach((surahBlock) => {
      const ayahList = Array.isArray(surahBlock?.ayahs) ? surahBlock.ayahs : [];
      const ayahNumbers = ayahList
        .filter((ayah) => Number(ayah.juz) === Number(paraNumber))
        .map((ayah) => Number(ayah.numberInSurah))
        .filter((num) => Number.isFinite(num) && num > 0);

      if (!ayahNumbers.length) return;

      bySurah.set(surahBlock.number, {
        surah: {
          number: surahBlock.number,
          name: surahBlock.name,
          englishName: surahBlock.englishName,
          englishNameTranslation: surahBlock.englishNameTranslation,
          revelationType: surahBlock.revelationType,
          ayahs: [],
        },
        startAyah: Math.min(...ayahNumbers),
        endAyah: Math.max(...ayahNumbers),
      });
    });
  }

  if (bySurah.size > 0) {
    return Array.from(bySurah.values()).sort((a, b) => a.surah.number - b.surah.number);
  }

  const flatAyahs = Array.isArray(juzData.ayahs) ? juzData.ayahs : [];
  flatAyahs.forEach((ayah) => {
    if (Number(ayah.juz) !== Number(paraNumber)) return;
    const numberInSurah = Number(ayah.numberInSurah);
    if (!Number.isFinite(numberInSurah) || numberInSurah < 1) return;

    const surahFromAyah: Surah = {
      ...ayah.surah,
      ayahs: [],
    };

    const existing = bySurah.get(ayah.surah.number);
    if (!existing) {
      bySurah.set(ayah.surah.number, {
        surah: surahFromAyah,
        startAyah: numberInSurah,
        endAyah: numberInSurah,
      });
      return;
    }

    existing.startAyah = Math.min(existing.startAyah, numberInSurah);
    existing.endAyah = Math.max(existing.endAyah, numberInSurah);
  });

  return Array.from(bySurah.values()).sort((a, b) => a.surah.number - b.surah.number);
}

export default function ParaDetailScreen() {
  const router = useRouter();
  const { paraNumber: paraParam } = useLocalSearchParams<{ paraNumber?: string }>();
  const paraNumberRaw = Array.isArray(paraParam) ? paraParam[0] : paraParam;
  const paraNumber = Number(paraNumberRaw ?? 1);

  const [juzData, setJuzData] = useState<JuzResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchJuz<JuzResponse>(paraNumber);
        setJuzData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load para data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [paraNumber]);

  const paraSurahs = useMemo(() => {
    if (!juzData || !Number.isFinite(paraNumber) || paraNumber < 1) return [];
    return buildParaSurahList(juzData, paraNumber);
  }, [juzData, paraNumber]);

  const openSurah = (surahNumber: number, startAyah: number) => {
    router.push({
      pathname: '/surah-detail',
      params: {
        surahNumber: String(surahNumber),
        startAyah: String(startAyah),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#0F3A2B" />
        </TouchableOpacity>

        <Text style={styles.title}>Para {Number.isFinite(paraNumber) ? paraNumber : 1}</Text>
        <Text style={styles.subtitle}>
          {paraSurahs.length} {paraSurahs.length === 1 ? 'Surah' : 'Surahs'}
        </Text>

        {loading ? (
          <View style={styles.centerBlock}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.message}>Loading para...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerBlock}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
            {paraSurahs.map((item) => (
              <TouchableOpacity
                key={item.surah.number}
                style={styles.row}
                onPress={() => openSurah(item.surah.number, item.startAyah)}
              >
                <View style={styles.rowLeft}>
                  <Text style={styles.rowNumber}>{item.surah.number}</Text>
                </View>
                <View style={styles.rowCenter}>
                  <Text style={styles.rowTitle}>{item.surah.englishName}</Text>
                  <Text style={styles.rowMeta}>
                    Ayah {item.startAyah}
                    {item.endAyah > item.startAyah ? ` - ${item.endAyah}` : ''} in Para {paraNumber}
                  </Text>
                </View>
                <Text style={styles.rowArabic}>{item.surah.name}</Text>
              </TouchableOpacity>
            ))}

            {!paraSurahs.length && (
              <View style={styles.centerBlock}>
                <Text style={styles.message}>No surahs found for this para.</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAF4EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    color: '#0F3A2B',
    fontFamily: fonts.bold,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
    fontSize: 14,
    color: '#6B7280',
    fontFamily: fonts.medium,
  },
  listContent: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  rowLeft: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF4EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rowNumber: {
    fontSize: 13,
    color: '#0F3A2B',
    fontFamily: fonts.semiBold,
  },
  rowCenter: {
    flex: 1,
    marginRight: 8,
  },
  rowTitle: {
    fontSize: 16,
    color: '#111827',
    fontFamily: fonts.bold,
  },
  rowMeta: {
    marginTop: 3,
    fontSize: 12,
    color: '#6B7280',
    fontFamily: fonts.medium,
  },
  rowArabic: {
    fontSize: 17,
    color: '#0F3A2B',
    fontFamily: fonts.arabicQuran,
  },
  centerBlock: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: 10,
    color: '#6B7280',
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: fonts.medium,
  },
});
