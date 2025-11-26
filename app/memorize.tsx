import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { fonts } from './fonts';
import Svg, {
  Path,
  Rect,
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  ClipPath,
  G,
  Mask,
} from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DESIGN_WIDTH = 374;
const SCALE = SCREEN_WIDTH / DESIGN_WIDTH;

function MenuIcon({ size = 24, color = "#8789A3" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M1 6H23V8.44444H1V6ZM1 14.5556H15.6667V17H1V14.5556Z" fill={color} />
    </Svg>
  );
}

function SearchIcon({ size = 24, color = "#8789A3" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G clipPath="url(#clip0_search)">
        <Path
          d="M18.031 16.617L22.314 20.899L20.899 22.314L16.617 18.031C15.0237 19.3082 13.042 20.0029 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20.0029 13.042 19.3082 15.0237 18.031 16.617ZM16.025 15.875C17.2941 14.5699 18.0029 12.8204 18 11C18 7.132 14.867 4 11 4C7.132 4 4 7.132 4 11C4 14.867 7.132 18 11 18C12.8204 18.0029 14.5699 17.2941 15.875 16.025L16.025 15.875Z"
          fill={color}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_search">
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

// Old SVG removed - now using quran.png image
 

function ChecklistIllustration() {
  return (
    <Image
      source={require('../assets/images/check1.png')}
      style={{ width: 131 * SCALE, height: 158 * SCALE }}
      resizeMode="contain"
    />
  );
}

function ClipboardIllustration() {
  return (
    <Image
      source={require('../assets/images/check2.png')}
      style={{ width: 185 * SCALE, height: 170 * SCALE }}
      resizeMode="contain"
    />
  );
}

function ExistingPlanCurve() {
  return (
    <Svg width={224 * SCALE} height={224 * SCALE} viewBox="0 0 224 224" fill="none">
      <Mask
        id="existingCurveMask"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={224}
        height={224}
        maskType="alpha"
      >
        <Rect width={224} height={224} rx={112} fill="#E2F6F8" />
      </Mask>
      <G mask="url(#existingCurveMask)">
        <Path
          d="M161.296 168.711C207.835 115.271 242.523 102.47 268.463 107.128C295.895 112.054 304.047 144.947 300.824 172.631C295.507 218.307 257.541 253.201 211.58 254.654L-45.8919 262.796C-60.8377 263.268 -73.7541 252.44 -75.897 237.641C-79.5083 212.703 -50.8356 193.199 -26.9157 201.125C35.0974 221.672 113.253 223.878 161.296 168.711Z"
          fill="#2BFF00"
          fillOpacity={0.1}
        />
      </G>
    </Svg>
  );
}

function NewPlanCurve() {
  return (
     <Svg width={300} height={300} viewBox="0 0 224 224" fill="none">
      <Mask
        id="existingCurveMask"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={300}
        height={300}
        maskType="alpha"
      >
        <Rect width={224} height={224} rx={112} fill="#E2F6F8" />
      </Mask>
      <G mask="url(#existingCurveMask)">
        <Path
          d="M161.296 168.711C207.835 115.271 242.523 102.47 268.463 107.128C295.895 112.054 304.047 144.947 300.824 172.631C295.507 218.307 257.541 253.201 211.58 254.654L-45.8919 262.796C-60.8377 263.268 -73.7541 252.44 -75.897 237.641C-79.5083 212.703 -50.8356 193.199 -26.9157 201.125C35.0974 221.672 113.253 223.878 161.296 168.711Z"
          fill="#061528"
          fillOpacity={0.1}
        />
      </G>
    </Svg>
  );
}

export default function MemorizeScreen() {
  const router = useRouter();

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
              <Text style={styles.sectionTitle}>Memorize Quran</Text>
            </View>
          </View>

          {/* Read Quran Card */}
          <TouchableOpacity style={styles.readQuranCard} onPress={() => router.push('/recite')}>
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
                  <Text style={styles.readQuranLabel}>Read Quran</Text>
                </View>
                <Text style={styles.readQuranSurah}>Al-Fatihah</Text>
                <Text style={styles.readQuranAyah}>Ayah No: 1</Text>
              </View>
              <View style={styles.readQuranIllustration}>
                <QuranIllustration />
              </View>
            </LinearGradient>
          </TouchableOpacity>
          {/* Plans Section */}
          <View style={styles.plansContainer}>
            {/* Existing Plan */}
            <View style={styles.existingPlanContainer}>
              <View style={styles.existingPlanBase} />
          <View style={styles.existingPlanVector}>
            {/* <ExistingPlanCurve /> */}
          </View>
              <View style={styles.existingPlanCircle}>
                <Text style={styles.existingPlanTitle}>{'Existing\nPlan'}</Text>
                <View style={styles.existingPlanIcon}>
                  <ChecklistIllustration />
                </View>
              </View>
            </View>

            {/* New Plan */}
            <View style={styles.newPlanContainer}>
              <View style={styles.newPlanBase} />
          <View style={styles.newPlanVector}>
            {/* <NewPlanCurve /> */}
          </View>
              <View style={styles.newPlanCircle}>
                <Text style={styles.newPlanTitle}>{'New\nPlan'}</Text>
                <View style={styles.newPlanIcon}>
                  <ClipboardIllustration />
                </View>
              </View>
            </View>
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
    borderRadius: 40,
    paddingHorizontal: 24 * SCALE,
    paddingTop: 45 * SCALE,
    paddingBottom: 40 * SCALE,
    minHeight: 812 * SCALE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 326 * SCALE,
    height: 30 * SCALE,
    marginBottom: 0,
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
    marginBottom: 16 * SCALE,
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
    // backgroundColor: 'rgba(104, 140, 118, 0.35)',
    // borderRadius: 22 * SCALE,
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
    width: 137 * SCALE,
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
    fontSize: 18 * SCALE,
    color: '#FFFFFF',
    lineHeight: 20 * SCALE,
    fontFamily: fonts.medium,
  },
  readQuranSurah: {
    position: 'absolute',
    left: 5,
    top: 40 * SCALE, // 60px - 19px (container top)
    width: 112 * SCALE,
    height: 27 * SCALE,
    fontSize: 18 * SCALE,
    color: '#FFFFFF',
    lineHeight: 27 * SCALE,
    fontFamily: fonts.semiBold,
  },
  readQuranAyah: {
    position: 'absolute',
    left: 5,
    top: 72 * SCALE, // 91px - 19px (container top)
    width: 89 * SCALE,
    height: 21 * SCALE,
    fontSize: 14 * SCALE,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 21 * SCALE,
    fontFamily: fonts.regular,
  },
  readQuranIllustration: {
    position: 'absolute',
    right: -10* SCALE,
    top: 10 * SCALE,
    width: 190 * SCALE,
    height: 130 * SCALE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plansContainer: {
    marginTop: 32 * SCALE,
    flexDirection: 'column',
    gap: 40 * SCALE,
    width: '100%',
    paddingBottom: 40 * SCALE,
  },
  existingPlanContainer: {
    width: 280 * SCALE,
    height: 280 * SCALE,
    alignSelf: 'flex-start',
    position: 'relative',
    marginBottom: -20 * SCALE,
  },
  existingPlanBase: {
    position: 'absolute',
    width: 220 * SCALE,
    height: 220 * SCALE,
    borderRadius: 110 * SCALE,
    backgroundColor: '#EDF7E6',
    left: 30 * SCALE,
    top: 30 * SCALE,
    opacity: 0.7,
  },
  existingPlanCircle: {
    width: 260 * SCALE,
    height: 250 * SCALE,
    borderRadius: 130 * SCALE,
    backgroundColor: '#F5FAF4',
    position: 'relative',
    overflow: 'visible',
    padding: 32 * SCALE,
    shadowColor: '#D1E6CE',
    shadowOpacity: 0.55,
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 24,
    elevation: 12,
  },
  existingPlanVector: {
    position: 'absolute',
    width: 224 * SCALE,
    height: 224 * SCALE,
    top: 18 * SCALE,
    left: 18 * SCALE,
    zIndex: 1,
    pointerEvents: 'none',
  },
  existingPlanTitle: {
    position: 'absolute',
    left: 36 * SCALE,
    top: 90 * SCALE,
    fontSize: 22 * SCALE,
    color: '#083B2E',
    lineHeight: 26 * SCALE,
    textAlign: 'left',
    zIndex: 3,
    fontFamily: fonts.bold,
  },
  existingPlanIcon: {
    position: 'absolute',
    right: -30 * SCALE,
    top: 52 * SCALE,
    width: 170 * SCALE,
    height: 210 * SCALE,
    zIndex: 3,
  },
  newPlanContainer: {
    width: 280 * SCALE,
    height: 280 * SCALE,
    alignSelf: 'flex-end',
    position: 'relative',
    marginTop: -40 * SCALE,
  },
  newPlanBase: {
    position: 'absolute',
    width: 220 * SCALE,
    height: 220 * SCALE,
    borderRadius: 110 * SCALE,
    backgroundColor: '#E6ECE7',
    right: 30 * SCALE,
    top: 34 * SCALE,
    opacity: 0.7,
  },
  newPlanCircle: {
    width: 260 * SCALE,
    height: 250 * SCALE,
    borderRadius: 130 * SCALE,
    backgroundColor: '#DEE5E1',
    position: 'relative',
    overflow: 'visible',
    padding: 30 * SCALE,
    shadowColor: '#D0D5D2',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 24,
    elevation: 12,
   
  },
  newPlanVector: {
    position: 'absolute',
    width: 289 * SCALE,
    height: 317 * SCALE,
    bottom: -24 * SCALE,
    right: -60 * SCALE,
    zIndex: 3,
    pointerEvents: 'none',
    left: -10 * SCALE,
   
  },
  newPlanTitle: {
    position: 'absolute',
    left: 36 * SCALE,
    top: 90 * SCALE,
    fontSize: 22 * SCALE,
    color: '#083B2E',
    lineHeight: 26 * SCALE,
    textAlign: 'left',
    zIndex: 3,
    fontFamily: fonts.bold,
  },
  newPlanIcon: {
    position: 'absolute',
    right: -24 * SCALE,
    top: 48 * SCALE,
    width: 195 * SCALE,
    height: 200 * SCALE,
    zIndex:1,
  },
});
