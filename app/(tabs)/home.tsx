import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image as RNImage } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { fonts } from '../../constants/fonts';
import Svg, {
  Path,
  Rect,
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  ClipPath,
  G,
} from 'react-native-svg';
type FeatureCardProps = {
  title: string;
  colors: [string, string];
  Illustration: React.ComponentType;
};

// Card order matches image layout:
// Top-Left: Memorize, Top-Right: Recite
// Bottom-Left: Retain, Bottom-Right: Track
const features: FeatureCardProps[] = [
  { title: 'Memorize', colors: ['#E8F7E9', '#F8FFF6'], Illustration: MemorizeIcon },
  { title: 'Recite', colors: ['#FFEAE4', '#FFF6F3'], Illustration: ReciteIcon },
  { title: 'Retain', colors: ['#FFF3E3', '#FFF9F0'], Illustration: OldReciteIcon },
  { title: 'Track', colors: ['#EEF4FF', '#F8FBFF'], Illustration: TrackIcon },
];

// Controls how the curved gradient sits inside the hero card.
// CSS-like positioning: viewBox is 373x189
// Values are relative to bottom-center positioning
const HERO_CURVE_TRANSFORM = {
  horizontalOffset: -20,  // Adjust left/right from center (negative = left, positive = right)
  bottomOffset: -20,      // Distance from bottom (higher = more from bottom)
  scale: 1.0,
};


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
      <G clipPath="url(#clip0_1_5258)">
        <Path
          d="M18.031 16.617L22.314 20.899L20.899 22.314L16.617 18.031C15.0237 19.3082 13.042 20.0029 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20.0029 13.042 19.3082 15.0237 18.031 16.617ZM16.025 15.875C17.2941 14.5699 18.0029 12.8204 18 11C18 7.132 14.867 4 11 4C7.132 4 4 7.132 4 11C4 14.867 7.132 18 11 18C12.8204 18.0029 14.5699 17.2941 15.875 16.025L16.025 15.875Z"
          fill={color}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_1_5258">
          <Rect width="24" height="24" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default function HomeTab() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
        <View style={styles.header}>
            <TouchableOpacity style={styles.iconButton}>
              <MenuIcon size={20} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.brand}>Halakat</Text>
            <TouchableOpacity style={styles.iconButton}>
              <SearchIcon size={20} color="#8B8FA9" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backButton}>
            <ArrowLeft size={20} color="#0F3A2B" />
          </TouchableOpacity>

          <View style={styles.heroCard}>
            <HeroBackground />
            <View style={styles.heroContent}>
              <View style={styles.heroText}>
                <Text style={styles.heroArabic}>إنضم لحلقة</Text>
                <TouchableOpacity style={styles.heroCta}>
                  <Text style={styles.heroCtaText}>Join a Circle</Text>
                  <View style={styles.heroCtaIcon}>
                    <HeroArrowIcon />
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.heroIllustration}>
                <HeroIllustration />
              </View>
            </View>
          </View>

          <View style={styles.featuresGrid}>
            {features.map(feature => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureCard({ title, colors, Illustration }: FeatureCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (title === 'Memorize') {
      router.push('/memorize');
    }
  };

  const cardContent = (
    <LinearGradient
      colors={colors}
      style={styles.featureCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={styles.featureTitle}>{title}</Text>
      <View style={styles.featureIcon}>
        <Illustration />
      </View>
    </LinearGradient>
  );

  if (title === 'Memorize') {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={1} style={styles.cardContentWrapper}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return <View style={styles.cardContentWrapper}>{cardContent}</View>;
}

function HeroIllustration() {
  return (
    <RNImage
      source={require('../../assets/images/circle.png')}
      style={styles.heroIllustrationImage}
      resizeMode="cover"
    />
  );
}

function HeroBackground() {
  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Svg width="100%" height="100%" viewBox="0 0 373 189" style={StyleSheet.absoluteFillObject}>
        <Defs>
          <ClipPath id="heroClip">
            <Rect width="373" height="189" rx="32" />
          </ClipPath>
          <SvgLinearGradient id="heroBaseGradient" x1="0" y1="0" x2="373" y2="189">
            <Stop offset="0" stopColor="#0F6A53" />
            <Stop offset="1" stopColor="#87D1A4" />
          </SvgLinearGradient>
        </Defs>
        <G clipPath="url(#heroClip)">
          <Rect width="373" height="189" fill="url(#heroBaseGradient)" />
          <Path
            d="M4.75827 0C4.75827 0 4.42318 4.82796 0 5.24179C4.42318 5.72458 4.75827 10.4836 4.75827 10.4836C4.75827 10.4836 5.09336 5.65561 9.51654 5.24179C5.09336 4.82796 4.75827 0 4.75827 0Z"
            fill="#FFD08A"
            transform="translate(80 58)"
          />
          <Path
            d="M4.75827 0C4.75827 0 4.42318 4.82796 0 5.24179C4.42318 5.72458 4.75827 10.4836 4.75827 10.4836C4.75827 10.4836 5.09336 5.65561 9.51654 5.24179C5.09336 4.82796 4.75827 0 4.75827 0Z"
            fill="#FFD08A"
            transform="translate(300 40) scale(0.8)"
          />
          <Path
            d="M4.75827 0C4.75827 0 4.42318 4.82796 0 5.24179C4.42318 5.72458 4.75827 10.4836 4.75827 10.4836C4.75827 10.4836 5.09336 5.65561 9.51654 5.24179C5.09336 4.82796 4.75827 0 4.75827 0Z"
            fill="#FFD08A"
            transform="translate(260 95) scale(0.9)"
          />
          <Path
            d="M190 35L193 41L199 42L194 46L195 52L190 49L185 52L186 46L181 42L187 41L190 35Z"
            fill="#FFE8A6"
            fillOpacity={0.9}
          />
          <Path
            d="M320 25L322 29L327 30L323 33L324 37L320 35L316 37L317 33L313 30L318 29L320 25Z"
            fill="#FFE8A6"
            fillOpacity={0.7}
          />
        </G>
      </Svg>
      <View
        style={{
          position: 'absolute',
          bottom: HERO_CURVE_TRANSFORM.bottomOffset,
          left: '50%',
          marginLeft: HERO_CURVE_TRANSFORM.horizontalOffset - 175,
          opacity: 0.85,
          transform: [{ scale: HERO_CURVE_TRANSFORM.scale }],
        }}
      >
        <RNImage
          source={require('../../assets/images/curved.png')}
          style={{ width: 450, height: 300, bottom: -38,left:-50 }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

function HeroArrowIcon() {
  return (
    <Svg width={26} height={19} viewBox="0 0 26 19" fill="none">
      <Circle cx={7.5} cy={9.5} r={7.5} fill="#006754" fillOpacity={0.11} />
      <Path
        d="M8.58334 9.5H23.625"
        stroke="#004B40"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.0833 3.95837L23.625 9.50004L18.0833 15.0417"
        stroke="#004B40"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function MemorizeIcon() {
  return (
    <Svg width={95} height={53} viewBox="0 0 95 53" fill="none">
      <Path d="M78.8871 2.46338L47.0742 13.3525L15.2289 2.46338L0 24.6295L47.0742 40.7532L94.1161 24.6295L78.8871 2.46338Z" fill="#006754" />
      <Path d="M5.5495 23.7247L44.5897 38.6852L31.1676 25.3727C31.1676 25.3727 9.13088 20.0412 5.5495 23.7247Z" fill="#004B40" opacity={0.45} />
      <Path d="M88.5988 23.7247L49.5585 38.6852L62.9806 25.3727C62.9484 25.3727 84.9851 20.0412 88.5988 23.7247Z" fill="#004B40" opacity={0.45} />
      <Path d="M47.0742 40.7532L0 24.6295V26.7298L47.0742 42.8535L94.116 26.7298V24.6295L47.0742 40.7532Z" fill="#A85000" />
      <Path d="M22.0045 50.4468L27.4572 36.1326L45.0092 42.1426L22.0045 50.4468Z" fill="#773A08" />
      <Path d="M23.5209 46.3109L45.0092 42.1426L27.4572 36.1326L23.5209 46.3109Z" fill="#773A08" opacity={0.45} />
      <Path d="M47.0742 41.3995L22.0045 50.4469L23.8759 52.418L47.0742 44.1461L70.2402 52.418L72.1438 50.4469L47.0742 41.3995Z" fill="#BDF8D4" />
      <Path d="M72.1438 50.4468L66.6588 36.1326L49.1068 42.1426L72.1438 50.4468Z" fill="#773A08" />
      <Path d="M70.5951 46.3109L49.1068 42.1426L66.6588 36.1326L70.5951 46.3109Z" fill="#773A08" opacity={0.45} />
      <Path d="M47.0741 44.1459C48.0185 44.1459 48.7841 43.3792 48.7841 42.4334C48.7841 41.4876 48.0185 40.7208 47.0741 40.7208C46.1297 40.7208 45.3641 41.4876 45.3641 42.4334C45.3641 43.3792 46.1297 44.1459 47.0741 44.1459Z" fill="white" fillOpacity={0.5} />
      <Path d="M77.532 2.46338L47.0742 17.65L16.6163 2.46338C15.2289 4.30517 4.06537 22.9492 4.06537 22.9492C4.19443 22.9492 4.29122 22.9815 4.42028 22.9815C32.426 25.7927 40.2018 34.6139 42.783 36.7465C45.3642 38.9114 47.1064 38.6852 47.1064 38.6852C47.1064 38.6852 48.8487 38.9114 51.4299 36.7465C54.0111 34.6139 61.7869 25.7927 89.7926 22.9815C89.9217 22.9815 90.0185 22.9492 90.1475 22.9492C90.083 22.9492 78.8871 4.33748 77.532 2.46338Z" fill="#F5B304" />
      <Path d="M90.083 22.9492C89.9539 22.9492 89.8571 22.9815 89.7281 22.9815C61.7223 25.7927 53.9465 34.6139 51.3654 36.7465C48.7842 38.9114 47.0419 38.6852 47.0419 38.6852C47.0419 38.6852 45.2996 38.9114 42.7184 36.7465C40.1373 34.6139 32.3615 25.7927 4.35574 22.9815C4.22668 22.9815 4.12989 22.9492 4.00083 22.9492C3.77498 23.3047 4.00083 23.5631 4.00083 23.5631C32.2969 26.3097 39.8146 35.1632 42.3958 37.3281C44.977 39.4607 47.0096 39.2991 47.0096 39.2991C47.0096 39.2991 49.0423 39.4607 51.6235 37.3281C54.2047 35.1955 61.7223 26.342 90.0185 23.5631C90.083 23.5631 90.3088 23.3047 90.083 22.9492Z" fill="#87D1A4" />
      <Path d="M76.3705 0.686236C60.7867 -3.06196 47.0419 9.76592 47.0419 9.76592C47.0419 9.76592 33.2972 -3.06196 17.7134 0.686236C17.7134 0.686236 13.2931 7.47176 7.19507 19.0072C7.19507 19.0072 37.8788 22.4646 47.0419 35.3571C56.2051 22.4646 86.8888 19.0072 86.8888 19.0072C80.7908 7.47176 76.3705 0.686236 76.3705 0.686236Z" fill="#FBF9EF" />
      <Path d="M86.8888 19.0072C86.8888 19.0072 56.2051 22.4646 47.0419 35.3571C37.911 22.4646 7.2273 19.0072 7.2273 19.0072C7.2273 19.0072 7.2273 20.0412 5.51727 22.0768C5.51727 22.0768 33.3617 24.0802 43.4928 35.6479C45.8804 38.3621 47.0419 38.039 47.0419 38.039C47.0419 38.039 48.2357 38.3621 50.591 35.6479C60.6899 24.0802 88.5666 22.0768 88.5666 22.0768C86.8888 20.0089 86.8888 19.0072 86.8888 19.0072Z" fill="#BDF8D4" />
      <Path d="M74.6282 2.0434C74.6282 2.0434 62.9806 -0.929309 47.0419 11.4462C31.1354 -0.896997 19.4556 2.0434 19.4556 2.0434L11.583 17.3593C35.5234 19.0072 47.0419 31.1243 47.0419 31.1243C47.0419 31.1243 58.5604 19.0072 82.5007 17.3593L74.6282 2.0434ZM47.0741 29.6702C47.0741 29.6702 36.2977 18.6195 13.4544 16.4546L20.0686 2.68964C20.0686 2.68964 31.5226 0.460113 47.0741 12.1571C62.6257 0.460113 74.0797 2.68964 74.0797 2.68964L80.6939 16.4546C57.8505 18.6195 47.0741 29.6702 47.0741 29.6702Z" fill="#006754" />
      <Path d="M50.0103 22.9795C54.3122 19.8021 67.7558 12.7708 76.7899 13.7402" stroke="#BDF8D4" strokeWidth={3} strokeLinecap="round" opacity={0.2} />
      <Path d="M50.0103 14.0634C53.8282 11.0695 63.755 5.20366 72.9182 5.69079" stroke="#BDF8D4" strokeWidth={3} strokeLinecap="round" opacity={0.2} />
      <Path d="M50.0103 18.587C54.1509 15.3629 64.9165 9.04582 74.8541 9.57043" stroke="#BDF8D4" strokeWidth={3} strokeLinecap="round" opacity={0.2} />
      <Path d="M44.5252 22.9795C40.2233 19.8021 26.7796 12.7708 17.7455 13.7402" stroke="#BDF8D4" strokeWidth={3} strokeLinecap="round" opacity={0.2} />
      <Path d="M44.5253 14.0634C40.7073 11.0695 30.7805 5.20366 21.6174 5.69079" stroke="#BDF8D4" strokeWidth={3} strokeLinecap="round" opacity={0.2} />
      <Path d="M44.5252 18.587C40.3846 15.3629 29.6189 9.04582 19.6814 9.57043" stroke="#BDF8D4" strokeWidth={3} strokeLinecap="round" opacity={0.2} />
      <Path d="M47.0742 9.76589C47.0742 9.76589 47.3968 8.63496 48.0098 8.95809C48.0098 8.95809 47.6227 27.279 48.2679 34.42C48.4293 36.1972 49.978 38.6206 50.591 39.5253H49.7844L49.5585 40.2685C49.5585 40.2685 47.171 36.2295 47.0742 34.6462C46.5902 27.5375 46.8483 11.4784 47.0742 9.76589Z" fill="#BC8F7B" />
    </Svg>
  );
}

function OldReciteIcon() {
  return (
    <Svg width={68} height={94} viewBox="0 0 68 94" fill="none">
      <Rect y={10.4615} width={68} height={83.1692} rx={7} fill="#0B4F47" fillOpacity={0.11} />
      <Rect x={0.523} y={8.36926} width={66.9538} height={83.1692} rx={7} fill="#0B4F47" />
      <Rect x={0.523} y={5.23071} width={66.9538} height={83.1692} rx={7} fill="#406F6A" />
      <Rect x={4.18457} y={10.4615} width={59.1077} height={71.6615} fill="#FBF9EF" />
      <Path d="M14.6462 9C14.6462 4.02944 18.6756 0 23.6462 0H43.8308C48.8013 0 52.8308 4.02944 52.8308 9V12.5538H14.6462V9Z" fill="#006754" />
      <Rect x={14.6462} y={6.80005} width={38.1846} height={5.75385} fill="#1B9E86" />
      <Rect x={12.5538} y={23.5385} width={42.8923} height={1.04615} rx={0.523077} fill="#D9D9D9" />
      <Rect x={21.9692} y={37.6615} width={33.4769} height={1.04615} rx={0.523077} fill="#D9D9D9" />
      <Rect x={21.9692} y={47.0769} width={33.4769} height={1.04615} rx={0.523077} fill="#D9D9D9" />
      <Rect x={21.9692} y={56.4923} width={33.4769} height={1.04615} rx={0.523077} fill="#D9D9D9" />
      <Rect x={21.9692} y={65.9077} width={33.4769} height={1.04615} rx={0.523077} fill="#D9D9D9" />
      <Rect x={12.5538} y={25.6307} width={42.8923} height={1.04615} rx={0.523077} fill="#D9D9D9" />
      <Rect x={12.5538} y={27.723} width={15.1692} height={1.04615} rx={0.523077} fill="#D9D9D9" />
      <Rect x={12.5538} y={36.0923} width={3.66154} height={3.66154} rx={1} fill="#D9D9D9" />
      <Rect x={12.5538} y={45.5077} width={3.66154} height={3.66154} rx={1} fill="#D9D9D9" />
      <Rect x={12.5538} y={54.9231} width={3.66154} height={3.66154} rx={1} fill="#D9D9D9" />
      <Rect x={12.5538} y={64.3385} width={3.66154} height={3.66154} rx={1} fill="#D9D9D9" />
      <Path d="M10.3408 4.50281L8.62966 5.99837L7.85187 5.31857" stroke="#406F6A" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10.3408 13.4762L8.62966 14.9718L7.85187 14.292" stroke="#406F6A" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10.3408 22.4496L8.62966 23.9451L7.85187 23.2653" stroke="#406F6A" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10.3408 31.4229L8.62966 32.9184L7.85187 32.2386" stroke="#406F6A" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function RetainIcon() {
  return (
    <Svg width={70} height={70} viewBox="0 0 70 70" fill="none">
      <Rect x={8} y={10} width={54} height={48} rx={10} fill="#FFF8E6" stroke="#D69B39" strokeWidth={2} />
      <Rect x={20} y={5} width={30} height={12} rx={6} fill="#FBE3BA" stroke="#D69B39" strokeWidth={2} />
      <Rect x={26} y={2} width={18} height={10} rx={5} fill="#FFF8E6" stroke="#D69B39" strokeWidth={2} />
      <Path d="M20 30H48" stroke="#D69B39" strokeWidth={3} strokeLinecap="round" />
      <Path d="M20 40H48" stroke="#D69B39" strokeWidth={3} strokeLinecap="round" />
      <Path d="M20 50H40" stroke="#D69B39" strokeWidth={3} strokeLinecap="round" />
      <Path d="M18 30L14.5 33.2L12 31" stroke="#2F8B57" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18 40L14.5 43.2L12 41" stroke="#2F8B57" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18 50L14.5 53.2L12 51" stroke="#2F8B57" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ReciteIcon() {
  return (
    <RNImage
      source={require('../../assets/images/recite.png')}
      style={{ width: 53, height: 82 }}
      resizeMode="contain"
    />
  );
}


function TrackIcon() {
  return (
    <RNImage source={require('../../assets/images/track.png')} style={{ width: 70, height: 70, borderRadius: 40 }} resizeMode="cover" />

  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 10,
  
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
    backgroundColor: '#F2F4F7',
  },
  brand: {
    fontSize: 25,
    color: '#0F3A2B',
    left:-40,
    fontFamily: fonts.bold,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAF4EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
    overflow: 'hidden',
    backgroundColor: '#006754',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroText: {
    flex: 1,
    gap: 12,
    zIndex: 1,
  },
  heroArabic: {
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 4,
    left:30,
    fontFamily: fonts.arabicQuran,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 5,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
    shadowColor: '#164A37',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  heroCtaText: {
    color: '#0F3A2B',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  heroCtaIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DCEEDF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroIllustration: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  heroIllustrationImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    marginRight: -25,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 28,
  },
  featureCard: {
    width: '100%',
    borderRadius: 24,
    padding: 16,
    height: 150,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    color: '#204437',
    fontFamily: fonts.bold,
  },
  featureIcon: {
    alignItems: 'flex-end',
  },
  cardContentWrapper: {
    width: '48%',
    marginBottom: 16,
  },
});