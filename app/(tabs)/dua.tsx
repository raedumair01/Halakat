import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts } from '../../constants/fonts';

type DuaCategory = 'Morning' | 'Evening' | 'Protection' | 'Forgiveness';

type DuaItem = {
  id: string;
  title: string;
  arabic: string;
  translation: string;
  reference: string;
  category: DuaCategory;
};

const DUA_CATEGORIES: DuaCategory[] = ['Morning', 'Evening', 'Protection', 'Forgiveness'];

const DUAS: DuaItem[] = [
  {
    id: 'morning-bismillah',
    title: 'Morning Protection',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    translation: 'In the Name of Allah, with whose Name nothing on earth or in heaven can cause harm, and He is the All-Hearing, All-Knowing. (Recite 3 times)',
    reference: 'Sunan Abi Dawud 5088; Jami` at-Tirmidhi 3388',
    category: 'Morning',
  },
  {
    id: 'morning-raditu',
    title: 'Contentment With Allah',
    arabic: 'رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
    translation: 'I am pleased with Allah as my Lord, Islam as my religion, and Muhammad (peace be upon him) as my Prophet.',
    reference: 'Sunan Abi Dawud 5072; Jami` at-Tirmidhi 3389',
    category: 'Morning',
  },
  {
    id: 'evening-amsayna',
    title: 'Evening Remembrance',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هٰذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هٰذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
    translation: 'We have reached the evening and all dominion belongs to Allah. All praise is for Allah. None has the right to be worshipped but Allah alone with no partner. His is the dominion and His is the praise, and He is over all things capable. My Lord, I ask You for the good in this night and the good after it, and I seek refuge in You from the evil in this night and the evil after it. My Lord, I seek refuge in You from laziness and the evils of old age. My Lord, I seek refuge in You from punishment in the Fire and punishment in the grave.',
    reference: 'Sahih Muslim 2723',
    category: 'Evening',
  },
  {
    id: 'evening-bika-amsayna',
    title: 'By You We Reach Evening',
    arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
    translation: 'O Allah, by You we reach the evening and by You we reach the morning, by You we live and by You we die, and to You is the final return.',
    reference: 'Sunan Abi Dawud 5068',
    category: 'Evening',
  },
  {
    id: 'protection-kalimat',
    title: 'Protection From Harm',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللّٰهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    translation: 'I seek refuge in the perfect words of Allah from the evil of what He created.',
    reference: 'Sahih Muslim 2708',
    category: 'Protection',
  },
  {
    id: 'protection-anxiety',
    title: 'For Worry & Debt',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ',
    translation: 'O Allah, I seek refuge in You from anxiety and sorrow, and I seek refuge in You from weakness and laziness, and I seek refuge in You from cowardice and miserliness, and I seek refuge in You from the burden of debt and being overpowered by men.',
    reference: 'Sahih al-Bukhari 6369',
    category: 'Protection',
  },
  {
    id: 'sayyidul-istighfar',
    title: 'Sayyidul Istighfar',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    translation: 'O Allah, You are my Lord. None has the right to be worshipped except You. You created me and I am Your servant, and I abide by Your covenant and promise as best as I can. I seek refuge in You from the evil of what I have done. I acknowledge before You Your favor upon me, and I acknowledge my sin, so forgive me, for none forgives sins except You.',
    reference: 'Sahih al-Bukhari 6306',
    category: 'Forgiveness',
  },
  {
    id: 'forgiveness-astaghfirullah',
    title: 'Frequent Istighfar',
    arabic: 'أَسْتَغْفِرُ اللّٰهَ وَأَتُوبُ إِلَيْهِ',
    translation: 'I seek Allah’s forgiveness and repent to Him.',
    reference: 'Sahih Muslim 2702',
    category: 'Forgiveness',
  },
];

export default function DuaTab() {
  const [activeCategory, setActiveCategory] = useState<DuaCategory>('Morning');

  const filteredDuas = useMemo(
    () => DUAS.filter((dua) => dua.category === activeCategory),
    [activeCategory]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Asslamualaikum</Text>
          <Text style={styles.title}>Dua & Supplication</Text>
          <Text style={styles.subtitle}>Read, reflect, and keep your daily adhkar consistent.</Text>
        </View>

        <LinearGradient colors={['#6F9A84', '#BDCCC1']} style={styles.heroCard}>
          <Text style={styles.heroLabel}>Daily Reminder</Text>
          <Text style={styles.heroTitle}>Make Dua With Presence</Text>
          <Text style={styles.heroBody}>
            Begin with praise, send salawat upon the Prophet (PBUH), then ask Allah with humility and certainty.
          </Text>
          <TouchableOpacity style={styles.heroButton}>
            <Text style={styles.heroButtonText}>Read Morning Adhkar</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.categoriesRow}>
          {DUA_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                activeCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  activeCategory === category && styles.categoryChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.listSection}>
          {filteredDuas.map((dua) => (
            <View key={dua.id} style={styles.duaCard}>
              <View style={styles.duaCardHeader}>
                <Text style={styles.duaTitle}>{dua.title}</Text>
                <Text style={styles.duaCategory}>{dua.category}</Text>
              </View>

              <Text style={styles.duaArabic}>{dua.arabic}</Text>
              <Text style={styles.duaTranslation}>{dua.translation}</Text>
              <Text style={styles.duaSource}>Reference: {dua.reference}</Text>
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
    paddingBottom: 28,
  },
  header: {
    marginBottom: 16,
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
    marginBottom: 14,
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
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  categoryChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  categoryChipActive: {
    backgroundColor: '#0F6A4C',
    borderColor: '#0F6A4C',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#0F6A4C',
    fontFamily: fonts.medium,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  listSection: {
    gap: 10,
  },
  duaCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    padding: 14,
  },
  duaCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
    height: 50,
  },
  duaTitle: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontFamily: fonts.semiBold,
  },
  duaCategory: {
    fontSize: 12,
    color: '#0F6A4C',
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontFamily: fonts.medium,
  },
  duaArabic: {
    fontSize: 14,
    color: '#0B3727',
    textAlign: 'right',
    lineHeight: 27,
    marginBottom: 0,
    fontFamily: fonts.arabicQuran,
  },
  duaTranslation: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 8,
    fontFamily: fonts.regular,
  },
  duaSource: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: fonts.medium,
  },
});

