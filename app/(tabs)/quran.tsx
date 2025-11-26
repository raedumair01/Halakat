import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Rect, G, Defs, ClipPath, Circle } from 'react-native-svg';
import { fonts } from '../fonts';
import { fetchFullQuran } from '../services/quranApi';

type Surah = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  ayahs: Array<{
    number: number;
    text: string;
    numberInSurah: number;
    juz: number;
    page: number;
    hizbQuarter: number;
  }>;
};

type QuranData = {
  surahs: Surah[];
};

type TabType = 'Surah' | 'Para' | 'Page' | 'Hijb';

type ParaData = {
  number: number;
  surahs: Array<{ surah: Surah; startAyah: number; endAyah: number }>;
};

type PageData = {
  number: number;
  surahs: Array<{ surah: Surah; ayahs: number[] }>;
};

type HizbData = {
  number: number;
  surahs: Array<{ surah: Surah; ayahs: number[] }>;
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
        d="M18.3437 2.72559H13.4894C12.6779 2.72504 11.8905 3.00088 11.2568 3.50768C10.6231 4.01448 10.1809 4.72201 10.0031 5.51371C9.82487 4.72222 9.38258 4.01495 8.74897 3.50823C8.11537 3.0015 7.32818 2.72549 6.51687 2.72559H1.66624C1.22421 2.72575 0.80033 2.90142 0.487766 3.21399C0.175202 3.52655 -0.000467592 3.95043 -0.00063324 4.39246V12.9275C-0.000467592 13.3695 0.175202 13.7934 0.487766 14.1059C0.80033 14.4185 1.22421 14.5942 1.66624 14.5943H4.78062C8.32937 14.5943 9.38812 15.4412 9.89499 17.1987C9.91937 17.2962 10.0756 17.2962 10.1031 17.1987C10.6137 15.4418 11.6725 14.5943 15.2175 14.5943H18.3319C18.7739 14.5942 19.1978 14.4185 19.5103 14.1059C19.8229 13.7934 19.9986 13.3695 19.9987 12.9275V4.39621C19.9988 3.95567 19.8247 3.53297 19.5145 3.22018C19.2043 2.90738 18.783 2.72984 18.3425 2.72621L18.3437 2.72559ZM8.40249 11.9406C8.40266 11.9566 8.39964 11.9724 8.3936 11.9872C8.38757 12.002 8.37864 12.0154 8.36735 12.0267C8.35606 12.038 8.34263 12.0469 8.32784 12.0529C8.31305 12.059 8.29721 12.062 8.28124 12.0618H2.71499C2.69905 12.0619 2.68324 12.0588 2.66849 12.0528C2.65375 12.0467 2.64035 12.0378 2.62907 12.0265C2.61779 12.0152 2.60887 12.0018 2.6028 11.9871C2.59674 11.9723 2.59366 11.9565 2.59374 11.9406V11.1456C2.59374 11.08 2.64562 11.0243 2.71499 11.0243H8.28437C8.34999 11.0243 8.40562 11.0762 8.40562 11.1456V11.9406H8.40249ZM8.40249 9.82621C8.40257 9.84216 8.3995 9.85796 8.39343 9.87271C8.38737 9.88746 8.37844 9.90086 8.36716 9.91213C8.35589 9.92341 8.34249 9.93234 8.32774 9.9384C8.31299 9.94446 8.29719 9.94754 8.28124 9.94746H2.71499C2.69905 9.94754 2.68324 9.94446 2.66849 9.9384C2.65375 9.93234 2.64035 9.92341 2.62907 9.91213C2.61779 9.90086 2.60887 9.88746 2.6028 9.87271C2.59674 9.85796 2.59366 9.84216 2.59374 9.82621V9.03121C2.59374 8.96496 2.64562 8.90996 2.71499 8.90996H8.28437C8.34999 8.90996 8.40562 8.96184 8.40562 9.03121V9.82621H8.40249ZM8.40249 7.71184C8.40257 7.72778 8.3995 7.74359 8.39343 7.75833C8.38737 7.77308 8.37844 7.78648 8.36716 7.79776C8.35589 7.80903 8.34249 7.81796 8.32774 7.82403C8.31299 7.83009 8.29719 7.83317 8.28124 7.83309H2.71499C2.69905 7.83317 2.68324 7.83009 2.66849 7.82403C2.65375 7.81796 2.64035 7.80903 2.62907 7.79776C2.61779 7.78648 2.60887 7.77308 2.6028 7.75833C2.59674 7.74359 2.59366 7.72778 2.59374 7.71184V6.91684C2.59374 6.85121 2.64562 6.79559 2.71499 6.79559H8.28437C8.34999 6.79559 8.40562 6.84746 8.40562 6.91684V7.71184H8.40249ZM17.4062 11.9375C17.4063 11.9534 17.4032 11.9692 17.3972 11.984C17.3911 11.9987 17.3822 12.0121 17.3709 12.0234C17.3596 12.0347 17.3462 12.0436 17.3315 12.0497C17.3167 12.0557 17.3009 12.0588 17.285 12.0587H11.7187C11.7028 12.0588 11.687 12.0557 11.6722 12.0497C11.6575 12.0436 11.6441 12.0347 11.6328 12.0234C11.6215 12.0121 11.6126 11.9987 11.6066 11.984C11.6005 11.9692 11.5974 11.9534 11.5975 11.9375V11.1425C11.5975 11.0768 11.6494 11.0212 11.7187 11.0212H17.2881C17.3544 11.0212 17.4094 11.0731 17.4094 11.1425V11.9375H17.4062ZM17.4062 9.82309C17.4064 9.83906 17.4034 9.8549 17.3974 9.86968C17.3913 9.88447 17.3824 9.8979 17.3711 9.9092C17.3598 9.92049 17.3464 9.92941 17.3316 9.93545C17.3168 9.94148 17.301 9.9445 17.285 9.94434H11.7187C11.7028 9.94442 11.687 9.94134 11.6722 9.93528C11.6575 9.92921 11.6441 9.92028 11.6328 9.90901C11.6215 9.89773 11.6126 9.88433 11.6066 9.86958C11.6005 9.85484 11.5974 9.83903 11.5975 9.82309V9.02809C11.5975 8.96246 11.6494 8.90684 11.7187 8.90684H17.2881C17.3544 8.90684 17.4094 8.95871 17.4094 9.02809V9.82309H17.4062ZM17.4062 7.70809C17.4063 7.72403 17.4032 7.73984 17.3972 7.75458C17.3911 7.76933 17.3822 7.78273 17.3709 7.79401C17.3596 7.80528 17.3462 7.81421 17.3315 7.82028C17.3167 7.82634 17.3009 7.82942 17.285 7.82934H11.7187C11.7028 7.82942 11.687 7.82634 11.6722 7.82028C11.6575 7.81421 11.6441 7.80528 11.6328 7.79401C11.6215 7.78273 11.6126 7.76933 11.6066 7.75458C11.6005 7.73984 11.5974 7.72403 11.5975 7.70809V6.91621C11.5975 6.85059 11.6494 6.79496 11.7187 6.79496H17.2881C17.3544 6.79496 17.4094 6.84684 17.4094 6.91621V7.70809H17.4062Z"
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
          d="M31.0781 12.6219V5.97656C31.0781 5.39409 30.6059 4.92188 30.0234 4.92188H23.3781L18.7442 0.307336C18.3326 -0.102445 17.6673 -0.102445 17.2557 0.307336L12.6219 4.92188H5.97656C5.39409 4.92188 4.92188 5.39409 4.92188 5.97656V12.6219L0.307336 17.2558C-0.102445 17.6674 -0.102445 18.3327 0.307336 18.7443L4.92188 23.3781V30.0234C4.92188 30.6059 5.39409 31.0781 5.97656 31.0781H12.6219L17.2557 35.6927C17.4615 35.8976 17.7308 36 18 36C18.2692 36 18.5385 35.8976 18.7442 35.6927L23.3781 31.0781H30.0234C30.6059 31.0781 31.0781 30.6059 31.0781 30.0234V23.3781L35.6927 18.7443C36.1024 18.3327 36.1024 17.6674 35.6927 17.2558L31.0781 12.6219ZM29.2761 22.1983C29.0793 22.396 28.9688 22.6635 28.9688 22.9425V28.9688H22.9425C22.6636 28.9688 22.396 29.0793 22.1984 29.2761L18 33.4569L13.8017 29.2761C13.604 29.0793 13.3365 28.9688 13.0575 28.9688H7.03125V22.9425C7.03125 22.6636 6.92072 22.396 6.72391 22.1984L2.54313 18L6.72391 13.8017C6.92072 13.604 7.03125 13.3365 7.03125 13.0575V7.03125H13.0575C13.3364 7.03125 13.604 6.92072 13.8016 6.72391L18 2.54313L22.1984 6.72391C22.3961 6.92072 22.6636 7.03125 22.9425 7.03125H28.9688V13.0575C28.9688 13.3364 29.0793 13.604 29.2761 13.8016L33.4569 18L29.2761 22.1983Z"
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('Surah');
  const [quranData, setQuranData] = useState<QuranData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuranData();
  }, []);

  const fetchQuranData = async () => {
    try {
      setLoading(true);
      const data = await fetchFullQuran<QuranData>();
      setQuranData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Quran data');
      console.error('Error fetching Quran data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Organize data by Para (Juz)
  const organizeByPara = (): ParaData[] => {
    if (!quranData) return [];
    
    const paras: { [key: number]: ParaData } = {};
    
    quranData.surahs.forEach(surah => {
      surah.ayahs.forEach(ayah => {
        const juz = ayah.juz;
        if (!paras[juz]) {
          paras[juz] = { number: juz, surahs: [] };
        }
        
        const existingSurah = paras[juz].surahs.find(s => s.surah.number === surah.number);
        if (!existingSurah) {
          paras[juz].surahs.push({
            surah,
            startAyah: ayah.numberInSurah,
            endAyah: ayah.numberInSurah,
          });
        } else {
          existingSurah.endAyah = Math.max(existingSurah.endAyah, ayah.numberInSurah);
        }
      });
    });
    
    return Object.values(paras).sort((a, b) => a.number - b.number);
  };

  // Organize data by Page
  const organizeByPage = (): PageData[] => {
    if (!quranData) return [];
    
    const pages: { [key: number]: PageData } = {};
    
    quranData.surahs.forEach(surah => {
      surah.ayahs.forEach(ayah => {
        const page = ayah.page;
        if (!pages[page]) {
          pages[page] = { number: page, surahs: [] };
        }
        
        const existingSurah = pages[page].surahs.find(s => s.surah.number === surah.number);
        if (!existingSurah) {
          pages[page].surahs.push({
            surah,
            ayahs: [ayah.numberInSurah],
          });
        } else {
          if (!existingSurah.ayahs.includes(ayah.numberInSurah)) {
            existingSurah.ayahs.push(ayah.numberInSurah);
          }
        }
      });
    });
    
    return Object.values(pages).sort((a, b) => a.number - b.number);
  };

  // Organize data by Hizb
  const organizeByHizb = (): HizbData[] => {
    if (!quranData) return [];
    
    const hizbs: { [key: number]: HizbData } = {};
    
    quranData.surahs.forEach(surah => {
      surah.ayahs.forEach(ayah => {
        const hizb = ayah.hizbQuarter;
        if (!hizbs[hizb]) {
          hizbs[hizb] = { number: hizb, surahs: [] };
        }
        
        const existingSurah = hizbs[hizb].surahs.find(s => s.surah.number === surah.number);
        if (!existingSurah) {
          hizbs[hizb].surahs.push({
            surah,
            ayahs: [ayah.numberInSurah],
          });
        } else {
          if (!existingSurah.ayahs.includes(ayah.numberInSurah)) {
            existingSurah.ayahs.push(ayah.numberInSurah);
          }
        }
      });
    });
    
    return Object.values(hizbs).sort((a, b) => a.number - b.number);
  };

  const filteredSurahs = quranData?.surahs.filter(surah => 
    surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.name.includes(searchQuery) ||
    surah.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSurahPress = (surah: Surah) => {
    router.push({
      pathname: '/surah-detail',
      params: { surahNumber: surah.number.toString() },
    });
  };

  const renderSurahList = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Loading Quran...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchQuranData}>
            <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
      );
    }

    return (
      <>
        <Text style={styles.sectionTitle}>All Surahs ({filteredSurahs.length})</Text>
        {filteredSurahs.map((surah) => (
          <TouchableOpacity 
            key={surah.number} 
            style={styles.surahItem}
            onPress={() => handleSurahPress(surah)}
          >
            <StarNumberIcon number={surah.number} />
            
            <View style={styles.surahInfo}>
              <Text style={styles.surahName}>{surah.englishName}</Text>
              <Text style={styles.surahDetails}>
                {surah.revelationType.toUpperCase()} • {surah.ayahs.length} VERSES
              </Text>
            </View>
            <Text style={styles.surahArabic}>{surah.name}</Text>
          </TouchableOpacity>
        ))}
      </>
    );
  };

  const renderParaList = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Loading Quran...</Text>
        </View>
      );
    }

    if (error || !quranData) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'No data available'}</Text>
        </View>
      );
    }

    const paras = organizeByPara();

    return (
      <>
        <Text style={styles.sectionTitle}>All Paras ({paras.length})</Text>
        {paras.map((para) => (
          <TouchableOpacity key={para.number} style={styles.surahItem}>
            <StarNumberIcon number={para.number} />
            
            <View style={styles.surahInfo}>
              <Text style={styles.surahName}>Para {para.number}</Text>
                <Text style={styles.surahDetails}>
                {para.surahs.length} {para.surahs.length === 1 ? 'Surah' : 'Surahs'}
                </Text>
              </View>
          </TouchableOpacity>
        ))}
      </>
    );
  };

  const renderPageList = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Loading Quran...</Text>
        </View>
      );
    }

    if (error || !quranData) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'No data available'}</Text>
        </View>
      );
    }

    const pages = organizeByPage();

    return (
      <>
        <Text style={styles.sectionTitle}>All Pages ({pages.length})</Text>
        {pages.map((page) => (
          <TouchableOpacity key={page.number} style={styles.surahItem}>
            <StarNumberIcon number={page.number} />
            
            <View style={styles.surahInfo}>
              <Text style={styles.surahName}>Page {page.number}</Text>
              <Text style={styles.surahDetails}>
                {page.surahs.length} {page.surahs.length === 1 ? 'Surah' : 'Surahs'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </>
    );
  };

  const renderHizbList = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
          <Text style={styles.loadingText}>Loading Quran...</Text>
        </View>
      );
    }

    if (error || !quranData) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'No data available'}</Text>
        </View>
      );
    }

    const hizbs = organizeByHizb();

    return (
      <>
        <Text style={styles.sectionTitle}>All Hizbs ({hizbs.length})</Text>
        {hizbs.map((hizb) => (
          <TouchableOpacity key={hizb.number} style={styles.surahItem}>
            <StarNumberIcon number={hizb.number} />
            
            <View style={styles.surahInfo}>
              <Text style={styles.surahName}>Hizb {hizb.number}</Text>
              <Text style={styles.surahDetails}>
                {hizb.surahs.length} {hizb.surahs.length === 1 ? 'Surah' : 'Surahs'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconButton}>
              <MenuIcon size={20} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.brand}>Halakat</Text>
            <TouchableOpacity style={styles.iconButton}>
              <SearchIcon size={20} color="#8B8FA9" />
            </TouchableOpacity>
          </View>

          {/* Back Button and Greeting */}
          <TouchableOpacity style={styles.backButton}>
            <ArrowLeft size={20} color="#0F3A2B" />
          </TouchableOpacity>
          <Text style={styles.greeting}>Asslamualaikum</Text>

          {/* Last Read Banner - Similar to recite.tsx */}
          <TouchableOpacity style={styles.lastReadCard}>
            <LinearGradient
              colors={['#6F9A84', '#BDCCC1']}
              style={styles.lastReadGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.lastReadTextContainer}>
                <View style={styles.lastReadLabelContainer}>
                  <ReadQuranIcon />
                  <Text style={styles.lastReadLabel}>Last Read</Text>
                </View>
                <Text style={styles.lastReadSurah}>
                  {quranData?.surahs[0] ? quranData.surahs[0].englishName : 'Al-Fatihah'}
                </Text>
                <Text style={styles.lastReadVerse}>Ayah No: 1</Text>
              </View>
              <View style={styles.lastReadIllustration}>
                <QuranIllustration />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {(['Surah', 'Para', 'Page', 'Hijb'] as TabType[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content List */}
          <View style={styles.surahList}>
            {activeTab === 'Surah' && renderSurahList()}
            {activeTab === 'Para' && renderParaList()}
            {activeTab === 'Page' && renderPageList()}
            {activeTab === 'Hijb' && renderHizbList()}
          </View>
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
    padding: 0,
  },
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F4F7',
  },
  brand: {
    fontSize: 25,
    color: '#0F3A2B',
    fontFamily: fonts.bold,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAF4EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  greeting: {
    fontSize: 18,
    color: '#B7B1CE',
    marginBottom: 20,
    fontFamily: fonts.medium,
  },
  lastReadCard: {
    width: '100%',
    height: 140,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#4B6F5F',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 18,
    elevation: 8,
  },
  lastReadGradient: {
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: 22,
    overflow: 'hidden',
  },
  lastReadTextContainer: {
    position: 'absolute',
    width: 155,
    height: 93,
    left: 20,
    top: 20,
    paddingRight: 12,
  },
  lastReadLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    top: 10,
  },
  lastReadLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 20,
    fontFamily: fonts.medium,
  },
  lastReadSurah: {
    position: 'absolute',
    left: 5,
    top: 42,
    width: 130,
    fontSize: 20,
    color: '#FFFFFF',
    lineHeight: 28,
    fontFamily: fonts.semiBold,
  },
  lastReadVerse: {
    position: 'absolute',
    left: 5,
    top: 76,
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.85,
    lineHeight: 21,
    fontFamily: fonts.regular,
  },
  lastReadIllustration: {
    position: 'absolute',
    right: -10,
    top: 10,
    width: 190,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#0F3A2B',
  },
  tabText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontFamily: fonts.medium,
  },
  tabTextActive: {
    color: '#0F3A2B',
    fontFamily: fonts.semiBold,
  },
  surahList: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 16,
    fontFamily: fonts.semiBold,
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
  starNumberContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
  },
  starNumberText: {
    position: 'absolute',
    fontSize: 14,
    color: '#588B76',
    textAlign: 'center',
    lineHeight: 36,
    width: 36,
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
  },
  surahArabic: {
    fontSize: 18,
    color: '#0F3A2B',
    fontFamily: fonts.regular,
  },
  surahDetails: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: fonts.regular,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: fonts.regular,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.medium,
  },
});