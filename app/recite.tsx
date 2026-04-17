import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Switch, Image, Alert, ActivityIndicator, Modal, FlatList, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Path, Rect, G, Mask, Defs, ClipPath, Circle } from 'react-native-svg';
import { fonts } from '../constants/fonts';
import { fetchSurahArabic, fetchSurahList } from '../services/quranApi';
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DESIGN_WIDTH = 374;
const SCALE = SCREEN_WIDTH / DESIGN_WIDTH;

// Analysis result type for recording validation
type AnalysisResult = {
  isValid: boolean;
  reason: 'nothing' | 'wrong' | 'correct';
  transcript?: string;
  score?: number;
};

type SurahAyah = {
  numberInSurah: number;
  text: string;
};

type SurahData = {
  number: number;
  name: string;
  englishName: string;
  ayahs: SurahAyah[];
};

type SurahListItem = {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
};

type SurahListResponse = {
  surahs: SurahListItem[];
};

const extractSurahList = (payload: SurahListResponse | SurahListItem[]): SurahListItem[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.surahs)) {
    return payload.surahs;
  }

  return [];
};

const GROQ_TRANSCRIBE_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';
const GROQ_TRANSCRIBE_MODEL = 'whisper-large-v3-turbo';
const GROQ_VOICE_API_KEY =
  process.env.EXPO_PUBLIC_GROQ_VOICE_API_KEY ??
  process.env.EXPO_PUBLIC_GROQ_API_KEY ??
  '';
const MIN_VALID_DURATION = 1.0;
const NOTHING_THRESHOLD = 0.5;
const AYAH_MATCH_THRESHOLD = 0.62;
const DEFAULT_SURAH_NUMBER = 1;

const normalizeArabicText = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/\u0640/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u0660-\u0669\u06F0-\u06F9\d]/g, '')
    .replace(/[^\u0621-\u063A\u0641-\u064A\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const levenshteinDistance = (a: string, b: string) => {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) dp[i][0] = i;
  for (let j = 0; j < cols; j += 1) dp[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[a.length][b.length];
};

const tokenOverlapScore = (expected: string, actual: string) => {
  const expectedTokens = expected.split(' ').filter(Boolean);
  const actualTokens = actual.split(' ').filter(Boolean);
  if (!expectedTokens.length || !actualTokens.length) return 0;

  const actualSet = new Set(actualTokens);
  const matchedCount = expectedTokens.filter(token => actualSet.has(token)).length;
  return matchedCount / expectedTokens.length;
};

const calculateAyahMatchScore = (expected: string, actual: string) => {
  if (!expected || !actual) return 0;

  const maxLen = Math.max(expected.length, actual.length);
  if (!maxLen) return 0;

  const editSimilarity = 1 - levenshteinDistance(expected, actual) / maxLen;
  const overlap = tokenOverlapScore(expected, actual);
  return Math.max(0, Math.min(1, 0.65 * editSimilarity + 0.35 * overlap));
};

const transcribeWithGroq = async (uri: string): Promise<string> => {
  if (!GROQ_VOICE_API_KEY) {
    throw new Error('Recitation AI is not configured yet. Add EXPO_PUBLIC_GROQ_VOICE_API_KEY to your .env file.');
  }

  const fileName = uri.split('/').pop() || 'recitation.m4a';
  const extension = fileName.split('.').pop()?.toLowerCase() || 'm4a';
  const mimeType = extension === 'wav' ? 'audio/wav' : 'audio/m4a';

  const body = new FormData();
  body.append('model', GROQ_TRANSCRIBE_MODEL);
  body.append('language', 'ar');
  body.append('response_format', 'json');
  body.append('file', {
    uri,
    name: fileName,
    type: mimeType,
  } as any);

  const response = await fetch(GROQ_TRANSCRIBE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_VOICE_API_KEY}`,
    },
    body,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Transcription failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json() as { text?: string };
  return (data.text || '').trim();
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
      <G clipPath="url(#clip0_search_recite)">
        <Path
          d="M18.031 16.617L22.314 20.899L20.899 22.314L16.617 18.031C15.0237 19.3082 13.042 20.0029 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20.0029 13.042 19.3082 15.0237 18.031 16.617ZM16.025 15.875C17.2941 14.5699 18.0029 12.8204 18 11C18 7.132 14.867 4 11 4C7.132 4 4 7.132 4 11C4 14.867 7.132 18 11 18C12.8204 18.0029 14.5699 17.2941 15.875 16.025L16.025 15.875Z"
          fill={color}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_search_recite">
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

function BackArrowIcon() {
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

function QuranIllustration() {
  return (
    <Svg width="80%" height="80%" viewBox="0 0 206 126" fill="none">
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

function ReciteMicCurve() {
  return (
    <Svg width={224 * SCALE} height={224 * SCALE} viewBox="0 0 224 224" fill="none">
      <Mask
        id="reciteCurveMask"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={224}
        height={224}
        maskType="alpha"
      >
        <Rect width={224} height={224} rx={112} fill="#FEF6F4" />
      </Mask>
      <G mask="url(#reciteCurveMask)">
        <Path
          d="M161.296 168.711C207.835 115.271 242.523 102.47 268.463 107.128C295.895 112.055 304.047 144.947 300.824 172.631C295.507 218.307 257.541 253.201 211.58 254.654L-45.8919 262.796C-60.8377 263.269 -73.7541 252.44 -75.897 237.641C-79.5083 212.703 -50.8356 193.199 -26.9157 201.125C35.0974 221.672 113.253 223.878 161.296 168.711Z"
          fill="#588B76"
          fillOpacity={0.25}
        />
      </G>
    </Svg>
  );
}

function MicrophoneIllustration() {
  return (
    <Image
      source={require('../assets/images/mic.png')}
      style={{
        width: 180 * SCALE,
        height: 240 * SCALE,
        resizeMode: 'contain',
      }}
      resizeMode="contain"
    />
  );
}

export default function ReciteScreen() {
  const router = useRouter();
  const aiConfigured = !!GROQ_VOICE_API_KEY;
  const [showVerses, setShowVerses] = useState(true);
  const [recordEnabled, setRecordEnabled] = useState(false);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Tap record to begin reciting.');
  const [isMicPermissionDenied, setIsMicPermissionDenied] = useState(false);
  const [completedVerses, setCompletedVerses] = useState<Set<number>>(new Set());
  const [surahData, setSurahData] = useState<SurahData | null>(null);
  const [surahList, setSurahList] = useState<SurahListItem[]>([]);
  const [isSurahLoading, setIsSurahLoading] = useState(true);
  const [surahError, setSurahError] = useState<string | null>(null);
  const [selectedSurahNumber, setSelectedSurahNumber] = useState(DEFAULT_SURAH_NUMBER);
  const [isSurahPickerVisible, setIsSurahPickerVisible] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 500);
  const surahAyahs = surahData?.ayahs ?? [];
  const ayahCount = surahAyahs.length;
  const currentAyahText = surahAyahs[currentAyahIndex]?.text ?? '';
  const isSurahFinished = ayahCount > 0 && completedVerses.size === ayahCount;
  const goToNextAyah = () => {
    if (ayahCount === 0) return;
    setCurrentAyahIndex((prev) => (prev + 1) % ayahCount);
  };

  useEffect(() => {
    return () => {
      recorder.stop().catch(() => {});
    };
  }, [recorder]);

  const loadSurahByNumber = async (surahNumber: number) => {
    try {
      setIsSurahLoading(true);
      const data = await fetchSurahArabic<SurahData>(surahNumber);
      setSurahData(data);
      setCurrentAyahIndex(0);
      setCompletedVerses(new Set());
      setSurahError(null);
      setStatusMessage(`Loaded ${data.englishName}. Tap record to begin reciting.`);
    } catch (error) {
      console.error('[ReciteScreen] Failed to load surah:', error);
      setSurahError('Unable to load verses. Please try another surah.');
      setStatusMessage('Unable to load surah data.');
    } finally {
      setIsSurahLoading(false);
    }
  };

  useEffect(() => {
    const bootstrapSurahs = async () => {
      try {
        const listPayload = await fetchSurahList<SurahListResponse | SurahListItem[]>();
        const parsedList = extractSurahList(listPayload);
        setSurahList(parsedList);
      } catch (error) {
        console.warn('[ReciteScreen] Failed to load surah list:', error);
      }

      await loadSurahByNumber(DEFAULT_SURAH_NUMBER);
    };

    bootstrapSurahs();
  }, []);

  const handleSurahSelect = async (surahNumber: number) => {
    setSelectedSurahNumber(surahNumber);
    setIsSurahPickerVisible(false);
    await loadSurahByNumber(surahNumber);
  };

  const recheckMicrophonePermission = async () => {
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (permission.status === 'granted') {
        setIsMicPermissionDenied(false);
        setStatusMessage('Microphone permission granted. You can start recording now.');
        return;
      }

      setIsMicPermissionDenied(true);
      Alert.alert(
        'Microphone access needed',
        'Please allow microphone access in Settings to continue recording recitation.',
        [
          { text: 'Not now', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings().catch(() => {});
            },
          },
        ]
      );
    } catch (error) {
      console.warn('[ReciteScreen] Failed to re-check microphone permission:', error);
      setStatusMessage('Could not check microphone permission. Please try again.');
    }
  };

  useEffect(() => {
    if (currentAyahIndex >= ayahCount && ayahCount > 0) {
      setCurrentAyahIndex(0);
    }
  }, [currentAyahIndex, ayahCount]);

  // Analyze the recorded audio to verify if the verse was recited correctly.
  const analyzeRecording = async (uri: string, ayahIndex: number, durationSeconds: number): Promise<AnalysisResult> => {
    try {
      console.log('[ReciteScreen] Analyzing recording for Ayah', ayahIndex + 1);
      console.log('[ReciteScreen] Recording URI:', uri);
      console.log('[ReciteScreen] Recording duration:', durationSeconds.toFixed(2), 'seconds');

      if (durationSeconds < NOTHING_THRESHOLD) {
        console.log('[ReciteScreen] Recording too short - nothing recited');
        return { isValid: false, reason: 'nothing' };
      }

      if (durationSeconds < MIN_VALID_DURATION) {
        console.log('[ReciteScreen] Recording too short to be meaningful recitation');
        return { isValid: false, reason: 'nothing' };
      }

      const expectedAyahText = surahAyahs[ayahIndex]?.text;
      if (!expectedAyahText) {
        console.warn('[ReciteScreen] No expected ayah found for index', ayahIndex);
        return { isValid: false, reason: 'wrong' };
      }

      const transcript = await transcribeWithGroq(uri);
      const normalizedTranscript = normalizeArabicText(transcript);
      const normalizedExpectedAyah = normalizeArabicText(expectedAyahText);
      const score = calculateAyahMatchScore(normalizedExpectedAyah, normalizedTranscript);

      console.log('[ReciteScreen] Transcript:', transcript);
      console.log('[ReciteScreen] Normalized transcript:', normalizedTranscript);
      console.log('[ReciteScreen] Ayah match score:', score.toFixed(3));

      if (!normalizedTranscript || normalizedTranscript.length < 2) {
        return { isValid: false, reason: 'nothing', transcript, score };
      }

      if (score >= AYAH_MATCH_THRESHOLD) {
        return { isValid: true, reason: 'correct', transcript, score };
      }

      return { isValid: false, reason: 'wrong', transcript, score };
    } catch (error) {
      console.warn('[ReciteScreen] Error analyzing recording:', error);
      if (error instanceof Error && error.message.includes('EXPO_PUBLIC_GROQ_VOICE_API_KEY')) {
        setStatusMessage('Recitation AI is not configured. Add EXPO_PUBLIC_GROQ_VOICE_API_KEY in .env and restart Expo.');
      }
      return { isValid: false, reason: 'wrong' };
    }
  };

  const handleRecordToggle = async (value: boolean) => {
    if (value) {
      if (!aiConfigured) {
        setStatusMessage('Recitation AI is not configured. Add EXPO_PUBLIC_GROQ_VOICE_API_KEY in .env and restart Expo.');
        Alert.alert(
          'AI not configured',
          'Add EXPO_PUBLIC_GROQ_VOICE_API_KEY to your .env file and restart Expo to enable recitation analysis.'
        );
        return;
      }
      if (ayahCount === 0 || !!surahError || isSurahLoading) {
        setStatusMessage('Verses are not ready yet. Please wait.');
        return;
      }
      console.log('[ReciteScreen] Record toggle ON – starting recorder');
       setStatusMessage(`Recording Ayah ${currentAyahIndex + 1}...`);
      const success = await startRecording();
      setRecordEnabled(success);
      if (!success) {
        setStatusMessage('Unable to start recording. Check permissions.');
      }
    } else {
      console.log('[ReciteScreen] Record toggle OFF – stopping recorder');
      await stopRecording();
      setRecordEnabled(false);
    }
  };

  const startRecording = async () => {
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (permission.status !== 'granted') {
        setIsMicPermissionDenied(true);
        Alert.alert(
          'Permission required',
          'Microphone access is needed to start reciting.',
          [
            { text: 'Not now', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => {
                Linking.openSettings().catch(() => {});
              },
            },
          ]
        );
        return false;
      }
      setIsMicPermissionDenied(false);
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      console.log('[ReciteScreen] Recorder prepared, starting record()');
      recorder.record();
      return true;
    } catch (error) {
      console.warn('Failed to start recording', error);
      Alert.alert('Recording error', 'Unable to start recording. Please try again.');
      return false;
    }
  };

  const stopRecording = async () => {
    try {
      // Get duration before stopping (durationMillis is in milliseconds)
      const durationMillis = recorderState.durationMillis || 0;
      const durationSeconds = durationMillis / 1000;
      console.log('[ReciteScreen] Stopping recording. Duration:', durationSeconds.toFixed(2), 'seconds (', durationMillis, 'ms)');
      
      // Check if recording was actually started and has meaningful duration
      if (durationMillis === 0 || durationSeconds < 0.1) {
        console.log('[ReciteScreen] No recording detected - duration is 0 or too short');
        setStatusMessage('Nothing recited. Please record your recitation.');
        setRecordEnabled(false);
        return;
      }
      
      await recorder.stop();
      const uri = recorder.uri;
      console.log('[ReciteScreen] Recorder stopped. File saved at:', uri);
      
      if (!uri) {
        console.warn('[ReciteScreen] No recording URI available');
        setStatusMessage('Recording failed - no audio file saved. Please try again.');
        return;
      }
      
      // Analyze the recording to verify if the verse was recited correctly
      setStatusMessage('Analyzing your recitation...');
      const analysisResult = await analyzeRecording(uri, currentAyahIndex, durationSeconds);
      
      if (analysisResult.isValid && analysisResult.reason === 'correct') {
        // Mark this verse as completed and check if all are done
        setCompletedVerses(prev => {
          const newSet = new Set(prev);
          newSet.add(currentAyahIndex);
          const allVersesCompleted = newSet.size === ayahCount;
          
          console.log('[ReciteScreen] Completed verses:', Array.from(newSet).sort((a, b) => a - b));
          
          if (allVersesCompleted) {
            console.log('[ReciteScreen] 🎉 All verses completed! Surah finished!');
            setStatusMessage('🎉 Surah finished! All verses recited successfully.');
          } else {
            // Move to next ayah
            const nextIndex = ayahCount > 0 ? (currentAyahIndex + 1) % ayahCount : 0;
            const progress = `${newSet.size}/${ayahCount}`;
            console.log('[ReciteScreen] Recording accepted! Advancing to next ayah. Progress:', progress);
            setStatusMessage(`✓ Ayah ${currentAyahIndex + 1} completed! (${progress}) Moving to Ayah ${nextIndex + 1}.`);
            // Use setTimeout to ensure state update completes before navigation
            setTimeout(() => {
              goToNextAyah();
            }, 100);
          }
          
          return newSet;
        });
      } else {
        // Handle different failure reasons
        if (analysisResult.reason === 'nothing') {
          console.log('[ReciteScreen] Nothing recited - recording too short or silent');
          setStatusMessage(`Nothing recited. Please recite Ayah ${currentAyahIndex + 1} clearly.`);
        } else if (analysisResult.reason === 'wrong') {
          console.log('[ReciteScreen] Wrongly recited - recording does not match expected verse');
          const matchInfo = typeof analysisResult.score === 'number'
            ? ` (match ${(analysisResult.score * 100).toFixed(0)}%)`
            : '';
          setStatusMessage(`Wrongly recited${matchInfo}. Please recite Ayah ${currentAyahIndex + 1} correctly.`);
        } else {
          console.log('[ReciteScreen] Recording analysis failed - verse not accepted.');
          setStatusMessage(`Recitation not recognized. Please try reciting Ayah ${currentAyahIndex + 1} again.`);
        }
      }
    } catch (error) {
      console.warn('Failed to stop recording', error);
      setStatusMessage('Recording failed to stop. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.menuButton}>
              <MenuIcon size={20} color="#8789A3" />
            </TouchableOpacity>
            <Text style={styles.brand}>Halakat</Text>
            <TouchableOpacity style={styles.searchButton}>
              <SearchIcon size={20} color="#BAB5CD" />
            </TouchableOpacity>
          </View>

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <View style={styles.backButtonCircle}>
              <BackArrowIcon />
            </View>
          </TouchableOpacity>

          {/* Greeting and Section Title */}
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Asslamualaikum</Text>
            <View style={styles.sectionHeadingRow}>
              <View style={styles.sectionBullet} />
              <Text style={styles.sectionTitle}>Recite Quran</Text>
            </View>
          </View>

          {/* Select Ayah Card */}
          <TouchableOpacity style={styles.readQuranCard}>
            <LinearGradient
              colors={['#6F9A84', '#BDCCC1']}
              style={styles.readQuranGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.readQuranAccentBlock} />
              <View style={styles.readQuranHighlight} />
              <View style={styles.readQuranTextContainer}>
                <View style={styles.readQuranLabelContainer}>
                  <ReadQuranIcon />
                  <Text style={styles.readQuranLabel}>Select Ayah</Text>
                </View>
                <Text style={styles.readQuranSurah}>{surahData?.englishName || 'Loading...'}</Text>
                <Text style={styles.readQuranAyah}>{`Ayah No: ${ayahCount ? currentAyahIndex + 1 : 0} / ${ayahCount}`}</Text>
              </View>
              <View style={styles.readQuranIllustration}>
                <QuranIllustration />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.surahPickerButton}
            onPress={() => setIsSurahPickerVisible(true)}
            disabled={isSurahLoading || recordEnabled}
          >
            <Text style={styles.surahPickerButtonLabel}>Choose Surah</Text>
            <Text style={styles.surahPickerButtonValue}>
              {surahData ? `${surahData.englishName} (${surahData.name})` : 'Loading...'} ▼
            </Text>
          </TouchableOpacity>

          {/* Toggle Row */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleItem}>
              <Text style={styles.toggleLabel}>Show verses</Text>
              <Switch
                value={showVerses}
                onValueChange={setShowVerses}
                trackColor={{ false: '#D6D9DC', true: '#9FC4B0' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={styles.toggleItem}>
              <Text style={styles.toggleLabel}>Record</Text>
              <Switch
                value={recordEnabled}
                onValueChange={handleRecordToggle}
                trackColor={{ false: '#D6D9DC', true: '#F28C8C' }}
                thumbColor="#FFFFFF"
                disabled={isSurahFinished || isSurahLoading || !!surahError || !aiConfigured}
              />
            </View>
          </View>
          <View style={[styles.aiStatusBanner, aiConfigured ? styles.aiStatusBannerReady : styles.aiStatusBannerMissing]}>
            <Text style={[styles.aiStatusText, aiConfigured ? styles.aiStatusTextReady : styles.aiStatusTextMissing]}>
              {aiConfigured
                ? `Recitation AI ready: ${GROQ_TRANSCRIBE_MODEL}`
                : 'Recitation AI not configured. Add EXPO_PUBLIC_GROQ_VOICE_API_KEY in .env and restart Expo.'}
            </Text>
          </View>
          {isSurahLoading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#0F6A4C" />
              <Text style={styles.loadingRowText}>Loading verses from API...</Text>
            </View>
          )}
          {!!surahError && <Text style={styles.errorMessage}>{surahError}</Text>}
          <Text style={styles.statusMessage}>{statusMessage}</Text>
          {isMicPermissionDenied && (
            <TouchableOpacity style={styles.permissionButton} onPress={recheckMicrophonePermission}>
              <Text style={styles.permissionButtonText}>Re-check Microphone Permission</Text>
            </TouchableOpacity>
          )}

          {/* Arabic Verse */}
          {showVerses && (
            <View style={styles.ayahContainer}>
              <Text style={styles.ayahTitle}>
                {surahData?.name || '...'} <Text style={styles.ayahCaret}>∨</Text>
              </Text>
              <Text style={styles.ayahText}>{currentAyahText || 'No ayah loaded.'}</Text>
              {/* Progress indicator */}
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  Progress: {completedVerses.size} / {ayahCount} verses completed
                </Text>
              </View>
            </View>
          )}

          {/* Completion Message */}
          {isSurahFinished && (
            <View style={styles.completionContainer}>
              <Text style={styles.completionTitle}>🎉 Surah Finished!</Text>
              <Text style={styles.completionMessage}>
                Congratulations! You have successfully recited all {ayahCount} verses of {surahData?.name || 'this surah'}.
              </Text>
            </View>
          )}

          {/* Microphone Section */}
          <View style={styles.micWrapper}>
            {!isSurahFinished ? (
              <>
                <Text style={styles.micPrompt}>Click to start reciting</Text>
                <View style={styles.micCircle}>
                  <View style={styles.micCurve}>
                    <ReciteMicCurve />
                  </View>
                  <MicrophoneIllustration />
                  <View style={[styles.micStatusDot, recordEnabled && styles.micStatusDotActive]} />
                </View>
                <TouchableOpacity style={styles.nextAyahButton} onPress={goToNextAyah}>
                  <Text style={styles.nextAyahButtonText}>Next Ayah</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.finishedState}>
                <Text style={styles.finishedText}>All verses completed!</Text>
                <TouchableOpacity 
                  style={styles.restartButton} 
                  onPress={() => {
                    setCompletedVerses(new Set());
                    setCurrentAyahIndex(0);
                    setStatusMessage('Tap record to begin reciting.');
                  }}
                >
                  <Text style={styles.restartButtonText}>Start Over</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isSurahPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSurahPickerVisible(false)}
      >
        <View style={styles.surahPickerBackdrop}>
          <TouchableOpacity style={styles.surahPickerBackdropTouchable} onPress={() => setIsSurahPickerVisible(false)} />
          <View style={styles.surahPickerSheet}>
            <Text style={styles.surahPickerTitle}>Select Surah to Recite</Text>
            <FlatList
              data={surahList}
              keyExtractor={(item) => item.number.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.surahPickerItem,
                    item.number === selectedSurahNumber && styles.surahPickerItemActive,
                  ]}
                  onPress={() => handleSurahSelect(item.number)}
                >
                  <View>
                    <Text style={styles.surahPickerItemName}>
                      {item.number}. {item.englishName}
                    </Text>
                    <Text style={styles.surahPickerItemMeta}>{item.numberOfAyahs} ayahs</Text>
                  </View>
                  <Text style={styles.surahPickerItemArabic}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.surahPickerEmpty}>
                  <Text style={styles.surahPickerEmptyText}>No surahs found.</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
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
    borderRadius: 40,
    paddingHorizontal: 24 * SCALE,
    paddingTop: 45 * SCALE,
    paddingBottom: 60 * SCALE,
    minHeight: 812 * SCALE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 326 * SCALE,
    height: 30 * SCALE,
  },
  menuButton: {
    width: 24 * SCALE,
    height: 24 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 20 * SCALE,
    color: '#0C3B2A',
    textAlign: 'center',
    fontFamily: fonts.bold,
  },
  searchButton: {
    width: 24 * SCALE,
    height: 24 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 25 * SCALE,
    top: 90 * SCALE,
    width: 26 * SCALE,
    height: 26 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonCircle: {
    width: 26 * SCALE,
    height: 26 * SCALE,
    borderRadius: 13 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingContainer: {
    width: 265 * SCALE,
    marginTop: 75 * SCALE,
    marginBottom: 6 * SCALE,
  },
  greeting: {
    fontSize: 18 * SCALE,
    color: '#B7B1CE',
    marginBottom: 6 * SCALE,
    lineHeight: 27 * SCALE,
    fontFamily: fonts.medium,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10 * SCALE,
  },
  sectionBullet: {
    width: 12 * SCALE,
    height: 12 * SCALE,
    borderRadius: 6 * SCALE,
    backgroundColor: '#0F6A4C',
  },
  sectionTitle: {
    fontSize: 24 * SCALE,
    color: '#0B3727',
    lineHeight: 36 * SCALE,
    fontFamily: fonts.semiBold,
  },
  readQuranCard: {
    width: 340 * SCALE,
    height: 140 * SCALE,
    borderRadius: 22 * SCALE,
    overflow: 'hidden',
    marginTop: 16 * SCALE,
    marginBottom: 24 * SCALE,
    shadowColor: '#4B6F5F',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 18,
    elevation: 8,
    left: -5 * SCALE,
  },
  readQuranGradient: {
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: 22 * SCALE,
    overflow: 'hidden',
  },
  readQuranAccentBlock: {
    position: 'absolute',
    right: 12 * SCALE,
    top: 16 * SCALE,
    width: 140 * SCALE,
    height: 95 * SCALE,
  },
  readQuranHighlight: {
    position: 'absolute',
    right: -40 * SCALE,
    top: -10 * SCALE,
    width: 160 * SCALE,
    height: 160 * SCALE,
    borderRadius: 80 * SCALE,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  readQuranTextContainer: {
    position: 'absolute',
    width: 155 * SCALE,
    height: 93 * SCALE,
    left: 20 * SCALE,
    top: 20 * SCALE,
    paddingRight: 12 * SCALE,
  },
  readQuranLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8 * SCALE,
    marginBottom: 20 * SCALE,
    top: 10 * SCALE,
  },
  readQuranLabel: {
    fontSize: 16 * SCALE,
    color: '#FFFFFF',
    lineHeight: 20 * SCALE,
    fontFamily: fonts.medium,
  },
  readQuranSurah: {
    position: 'absolute',
    left: 5,
    top: 42 * SCALE,
    width: 130 * SCALE,
    fontSize: 20 * SCALE,
    color: '#FFFFFF',
    lineHeight: 28 * SCALE,
    fontFamily: fonts.semiBold,
  },
  readQuranAyah: {
    position: 'absolute',
    left: 5,
    top: 76 * SCALE,
    fontSize: 14 * SCALE,
    color: '#FFFFFF',
    opacity: 0.85,
    lineHeight: 21 * SCALE,
    fontFamily: fonts.regular,
  },
  readQuranIllustration: {
    position: 'absolute',
    right: -10 * SCALE,
    top: 10 * SCALE,
    width: 190 * SCALE,
    height: 130 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surahPickerButton: {
    marginBottom: 16 * SCALE,
    borderRadius: 14 * SCALE,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F8FAF9',
    paddingVertical: 10 * SCALE,
    paddingHorizontal: 14 * SCALE,
  },
  surahPickerButtonLabel: {
    fontSize: 12 * SCALE,
    color: '#6B7280',
    fontFamily: fonts.medium,
    marginBottom: 2 * SCALE,
  },
  surahPickerButtonValue: {
    fontSize: 14 * SCALE,
    color: '#0B3727',
    fontFamily: fonts.semiBold,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 28 * SCALE,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 150 * SCALE,
  },
  toggleLabel: {
    fontSize: 16 * SCALE,
    color: '#9DA0B5',
    fontFamily: fonts.medium,
  },
  aiStatusBanner: {
    borderRadius: 14 * SCALE,
    paddingVertical: 10 * SCALE,
    paddingHorizontal: 12 * SCALE,
    marginBottom: 14 * SCALE,
  },
  aiStatusBannerReady: {
    backgroundColor: '#E8F7EE',
  },
  aiStatusBannerMissing: {
    backgroundColor: '#FEF3F2',
  },
  aiStatusText: {
    fontSize: 12 * SCALE,
    fontFamily: fonts.semiBold,
  },
  aiStatusTextReady: {
    color: '#0F6A4C',
  },
  aiStatusTextMissing: {
    color: '#B42318',
  },
  ayahContainer: {
    alignItems: 'center',
    marginBottom: 28 * SCALE,
  },
  ayahTitle: {
    fontSize: 28 * SCALE,
    color: '#0B4132',
    marginBottom: 12 * SCALE,
    fontFamily: fonts.semiBold,
  },
  ayahCaret: {
    fontSize: 18 * SCALE,
    color: '#9DA0B5',
    marginLeft: 6 * SCALE,
  },
  ayahText: {
    fontSize: 22 * SCALE,
    lineHeight: 34 * SCALE,
    color: '#0B0E17',
    fontFamily: fonts.arabicQuran,
  },
  micWrapper: {
    alignItems: 'center',
    marginTop: 8 * SCALE,
  },
  micPrompt: {
    fontSize: 16 * SCALE,
    color: '#8AA394',
    marginBottom: 16 * SCALE,
  },
  micCircle: {
    width: 224 * SCALE,
    height: 224 * SCALE,
    borderRadius: 112 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#E6EFE6',
  },
  micCurve: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  micStatusDot: {
    position: 'absolute',
    bottom: 24 * SCALE,
    width: 18 * SCALE,
    height: 18 * SCALE,
    borderRadius: 9 * SCALE,
    backgroundColor: '#B5C7BB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  micStatusDotActive: {
    backgroundColor: '#F06464',
    shadowColor: '#F06464',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  nextAyahButton: {
    marginTop: 16 * SCALE,
    paddingVertical: 10 * SCALE,
    paddingHorizontal: 24 * SCALE,
    borderRadius: 20 * SCALE,
    backgroundColor: '#0F6A4C',
  },
  nextAyahButtonText: {
    color: '#FFFFFF',
    fontSize: 16 * SCALE,
    fontWeight: '600',
  },
  statusMessage: {
    fontSize: 14 * SCALE,
    color: '#6F7D75',
    marginBottom: 16 * SCALE,
  },
  permissionButton: {
    alignSelf: 'flex-start',
    marginBottom: 12 * SCALE,
    paddingVertical: 8 * SCALE,
    paddingHorizontal: 12 * SCALE,
    borderRadius: 12 * SCALE,
    backgroundColor: '#0F6A4C',
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 13 * SCALE,
    fontFamily: fonts.semiBold,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8 * SCALE,
    marginBottom: 8 * SCALE,
  },
  loadingRowText: {
    fontSize: 13 * SCALE,
    color: '#6F7D75',
    fontFamily: fonts.medium,
  },
  errorMessage: {
    fontSize: 13 * SCALE,
    color: '#DC2626',
    marginBottom: 8 * SCALE,
    fontFamily: fonts.medium,
  },
  progressContainer: {
    marginTop: 16 * SCALE,
    paddingVertical: 8 * SCALE,
    paddingHorizontal: 12 * SCALE,
    backgroundColor: '#E6EFE6',
    borderRadius: 8 * SCALE,
    alignSelf: 'flex-start',
  },
  progressText: {
    fontSize: 12 * SCALE,
    color: '#0F6A4C',
    fontWeight: '500',
  },
  completionContainer: {
    marginTop: 24 * SCALE,
    marginBottom: 16 * SCALE,
    padding: 20 * SCALE,
    backgroundColor: '#E6F5E6',
    borderRadius: 16 * SCALE,
    borderWidth: 2,
    borderColor: '#0F6A4C',
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: 24 * SCALE,
    fontWeight: '700',
    color: '#0F6A4C',
    marginBottom: 8 * SCALE,
  },
  completionMessage: {
    fontSize: 16 * SCALE,
    color: '#2D5A3D',
    textAlign: 'center',
    lineHeight: 24 * SCALE,
  },
  finishedState: {
    alignItems: 'center',
    paddingVertical: 20 * SCALE,
  },
  finishedText: {
    fontSize: 18 * SCALE,
    fontWeight: '600',
    color: '#0F6A4C',
    marginBottom: 16 * SCALE,
  },
  restartButton: {
    paddingVertical: 12 * SCALE,
    paddingHorizontal: 32 * SCALE,
    borderRadius: 24 * SCALE,
    backgroundColor: '#0F6A4C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restartButtonText: {
    color: '#FFFFFF',
    fontSize: 16 * SCALE,
    fontWeight: '600',
  },
  surahPickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
  },
  surahPickerBackdropTouchable: {
    flex: 1,
  },
  surahPickerSheet: {
    maxHeight: '70%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24 * SCALE,
    borderTopRightRadius: 24 * SCALE,
    paddingHorizontal: 16 * SCALE,
    paddingTop: 14 * SCALE,
    paddingBottom: 20 * SCALE,
  },
  surahPickerTitle: {
    fontSize: 17 * SCALE,
    color: '#0B3727',
    fontFamily: fonts.semiBold,
    marginBottom: 12 * SCALE,
  },
  surahPickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12 * SCALE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12 * SCALE,
    paddingVertical: 10 * SCALE,
    marginBottom: 8 * SCALE,
    backgroundColor: '#FFFFFF',
  },
  surahPickerItemActive: {
    borderColor: '#0F6A4C',
    backgroundColor: '#ECFDF5',
  },
  surahPickerItemName: {
    fontSize: 14 * SCALE,
    color: '#111827',
    fontFamily: fonts.semiBold,
  },
  surahPickerItemMeta: {
    marginTop: 2 * SCALE,
    fontSize: 12 * SCALE,
    color: '#6B7280',
    fontFamily: fonts.regular,
  },
  surahPickerItemArabic: {
    fontSize: 15 * SCALE,
    color: '#0B3727',
    fontFamily: fonts.arabicQuran,
  },
  surahPickerEmpty: {
    paddingVertical: 24 * SCALE,
    alignItems: 'center',
  },
  surahPickerEmptyText: {
    fontSize: 14 * SCALE,
    color: '#6B7280',
    fontFamily: fonts.medium,
  },
});

