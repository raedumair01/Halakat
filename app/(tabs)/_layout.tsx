import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import Svg, { Path, G, ClipPath, Defs, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../providers/AuthProvider';

// Home Icon - Teal/Greenish-blue (#588B76)
function HomeIcon({ size = 24, color = '#588B76' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Book Icon (Quran) - Teal/Greenish-blue (#588B76)
function BookIcon({ size = 24, color = '#588B76' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="2 2 28.0749 28" fill="none">
      <Path
        d="M24.4934 4.21758L21.5161 5.40539L20.9341 4.07812L19.6132 4.22086C18.2878 4.36354 17.1335 4.84118 16.0298 5.71044C14.9258 4.83905 13.7797 4.36184 12.4724 4.2208L11.151 4.07812L10.5695 5.40539L7.59156 4.21758L2.00537 17.2173L5.34102 18.486V27.9215L16.0291 22.5918L26.7172 27.9215V18.4947L30.0802 17.2177L24.4934 4.21758ZM6.98537 25.2681V19.1119L13.988 21.7762L6.98537 25.2681ZM15.207 20.4844L4.19121 16.2933L8.47081 6.33415L9.90998 6.90864L6.23398 15.2935L15.207 18.7352L15.207 20.4844ZM15.207 16.9778L9.01444 14.6027C10.0723 14.0635 11.3286 13.9936 12.4752 14.4589L15.207 15.6516L15.207 16.9778ZM15.207 13.8614L13.1066 12.9446C11.8054 12.4133 10.4018 12.3767 9.128 12.7856L12.1742 5.83835C12.3434 5.88134 13.6483 5.83988 15.207 7.159V13.8614ZM16.8512 7.16004C18.3807 5.87215 19.8246 5.86039 19.9114 5.83841L22.945 12.7587C21.7447 12.3772 20.4396 12.4286 19.1752 12.9446L16.8512 13.8937V7.16004ZM16.8512 15.6659L19.7978 14.4626C20.912 14.0073 22.0747 14.0669 23.0838 14.5961L16.8512 16.9795V15.6659ZM25.0728 25.2681L18.0719 21.7768L25.0728 19.1188V25.2681ZM16.8512 20.4855V18.7356L25.8516 15.2941L22.175 6.90864L23.6144 6.3342L27.894 16.2929L16.8512 20.4855Z"
        fill={color}
      />
    </Svg>
  );
}

// Lightbulb Icon (Tips/Insights) - Purple-grey (#8789A3)
function LightbulbIcon({ size = 24, color = '#8789A3' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="73.1952 0 32.0856 32" fill="none">
      <Path
        d="M86.9517 22.0473H91.5246C91.6735 20.6163 92.365 19.4353 93.4874 18.146C93.6148 18.0007 94.4259 17.1138 94.5217 16.9876C95.3184 15.9371 95.8178 14.6705 95.9623 13.3336C96.1069 11.9967 95.8907 10.6439 95.3387 9.43095C94.7867 8.21804 93.9213 7.19434 92.8423 6.47775C91.7632 5.76117 90.5143 5.38083 89.2394 5.38054C87.9645 5.38026 86.7154 5.76003 85.636 6.47613C84.5567 7.19223 83.6909 8.21554 83.1384 9.4282C82.5859 10.6409 82.3692 11.9936 82.5132 13.3305C82.6572 14.6675 83.156 15.9343 83.9523 16.9852C84.0493 17.1126 84.8626 18.0007 84.9878 18.1448C86.1113 19.4353 86.8028 20.6163 86.9517 22.0473ZM91.4942 24.4284H86.9821V25.6189H91.4942V24.4284ZM82.1926 18.4757C81.1303 17.0748 80.4645 15.3857 80.2719 13.6028C80.0794 11.82 80.368 10.0161 81.1044 8.39876C81.8408 6.78146 82.9951 5.41663 84.4344 4.46148C85.8736 3.50632 87.5392 2.99971 89.2394 3C90.9395 3.00029 92.605 3.50746 94.0439 4.4631C95.4829 5.41874 96.6368 6.78396 97.3727 8.40151C98.1087 10.0191 98.3967 11.8231 98.2036 13.6059C98.0105 15.3886 97.3442 17.0776 96.2814 18.4781C95.5821 19.3972 93.7502 20.8568 93.7502 22.6426V25.6189C93.7502 26.2504 93.5125 26.8561 93.0894 27.3026C92.6663 27.7491 92.0925 28 91.4942 28H86.9821C86.3838 28 85.81 27.7491 85.3869 27.3026C84.9638 26.8561 84.7261 26.2504 84.7261 25.6189V22.6426C84.7261 20.8568 82.8931 19.3972 82.1926 18.4757ZM90.3662 12.5278H93.1862L88.1101 19.671V14.9089H85.2901L90.3662 7.76094V12.529V12.5278Z"
        fill={color}
      />
    </Svg>
  );
}

// Prayer Icon (Person in prayer position) - Purple-grey (#8789A3)
function PrayerIcon({ size = 24, color = '#8789A3' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="222.594 3 26.0695 26" fill="none">
      <Path
        d="M248.663 3H247.899C246.653 3 245.544 3.59922 244.846 4.52344H244.844C243.596 4.52344 242.486 5.12367 241.789 6.04941V6.04688C239.683 6.04688 237.971 7.75556 237.971 9.85547V13.5192L235.628 15.8229L233.286 13.5192V9.85547C233.286 7.75556 231.573 6.04688 229.467 6.04688V6.04941C228.77 5.12367 227.66 4.52344 226.412 4.52344H226.41C225.713 3.59922 224.604 3 223.357 3H222.594V14.9651L228.005 21.3828H227.176V29H244.081V21.3828H243.252L248.663 14.9651V3ZM231.759 9.85547V12.164C231.293 11.8835 230.772 11.706 230.231 11.6435V8.33203C230.231 8.11062 230.211 7.89328 230.175 7.68203C231.093 7.98012 231.759 8.84137 231.759 9.85547ZM227.176 6.17738C228.065 6.49182 228.704 7.3388 228.704 8.33203V11.7709C228.34 11.8771 227.994 12.037 227.678 12.2452L227.176 11.745V6.17738ZM234.865 27.4766H228.704V22.9062H234.865V27.4766ZM234.865 21.3828H230.001L224.121 14.4101V4.654C225.01 4.96828 225.649 5.81531 225.649 6.80859V12.3763L230.455 17.1695L231.535 16.0925L228.796 13.3604C229.1 13.2145 229.436 13.138 229.784 13.138C230.396 13.138 230.971 13.3756 231.404 13.8073L234.865 17.2112V21.3828ZM242.553 8.33203C242.553 7.3388 243.192 6.49182 244.081 6.17738V11.745L243.579 12.2452C243.262 12.037 242.917 11.8771 242.553 11.7709V8.33203ZM239.498 9.85547C239.498 8.84142 240.164 7.98012 241.082 7.68203C241.045 7.89672 241.026 8.11416 241.026 8.33203V11.6435C240.485 11.706 239.964 11.8835 239.498 12.164V9.85547ZM242.553 27.4766H236.392V22.9062H242.553V27.4766ZM247.136 14.4101L241.256 21.3828H236.392V17.2112L239.853 13.8073C240.286 13.3756 240.861 13.138 241.473 13.138C241.821 13.138 242.157 13.2145 242.461 13.3604L239.722 16.0924L240.802 17.1695L245.608 12.3763V6.80859C245.608 5.81536 246.247 4.96838 247.136 4.65395V14.4101Z"
        fill={color}
      />
      <Path
        d="M239.498 24.4297H241.026V25.9531H239.498V24.4297Z"
        fill={color}
      />
      <Path
        d="M230.231 24.4297H231.759V25.9531H230.231V24.4297Z"
        fill={color}
      />
    </Svg>
  );
}

// Supplication Icon (Two hands in supplication) - Purple-grey (#8789A3)
function SupplicationIcon({ size = 24, color = '#8789A3' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="148.396 2 28.0749 28" fill="none">
      <Path
        d="M169.836 24.8063V23.8247C169.836 22.2612 168.965 20.8556 167.563 20.1562L164.901 18.8289V13.8714C164.901 12.5645 164.292 11.3677 163.272 10.6017C163.326 10.3129 163.503 10.07 163.733 9.99356C165.416 9.43509 166.546 7.87097 166.546 6.10128C166.546 3.56624 164.275 1.64578 161.748 2.0555C159.795 2.37203 158.321 4.18722 158.321 6.27688V9.04954C156.271 11.2129 155.031 14.144 155.031 17.3041V21.9374C155.031 23.1653 155.374 24.3404 156.015 25.3542C154.478 25.9489 153.386 27.4397 153.386 29.1798V30.0002H169.013C170.374 30.0002 171.481 28.896 171.481 27.5392C171.482 26.9776 171.329 26.4265 171.039 25.9451C170.749 25.4636 170.333 25.0699 169.836 24.8063ZM166.986 21.7105C167.734 22.1529 168.191 22.9476 168.191 23.8247V24.2136L166.328 23.594L166.986 21.7105ZM159.966 6.27688C159.966 4.98298 160.846 3.86402 162.013 3.67474C163.591 3.41842 164.901 4.62986 164.901 6.10128C164.902 6.61807 164.739 7.12192 164.436 7.54123C164.133 7.96054 163.705 8.27399 163.214 8.43704C162.564 8.6524 162.06 9.15399 161.802 9.79121L159.966 8.87563V6.27688ZM156.676 17.3041C156.676 14.7274 157.611 12.2936 159.322 10.3889L161.892 11.6703C162.733 12.0896 163.256 12.9336 163.256 13.8714V19.8428L165.505 20.9645L164.767 23.0756L161.611 22.026V14.3047H159.966V23.2085L162.457 24.0369C161.36 25.2515 159.624 25.7405 158.004 25.2024L157.952 25.1849C157.128 24.2983 156.676 23.1531 156.676 21.9373V17.3041ZM169.013 28.3595H155.172C155.498 27.4413 156.356 26.7725 157.375 26.7221C157.448 26.7405 158.219 27.0607 159.344 27.0607C161.22 27.0607 163.011 26.1573 164.117 24.5883L168.838 26.1577C169.129 26.2542 169.382 26.4396 169.561 26.6875C169.74 26.9355 169.836 27.2335 169.836 27.5392C169.836 27.9915 169.467 28.3595 169.014 28.3595H169.013Z"
        fill={color}
      />
    </Svg>
  );
}

// Chat Icon (Speech bubble with question mark) - Teal/Greenish-blue (#588B76)
function ChatIcon({ size = 24, color = '#588B76' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 20L5.01 16.5C3.28 15.39 2.25 13.77 2.25 12C2.25 8.54822 5.60754 5.75 9.75 5.75C13.8925 5.75 17.25 8.54822 17.25 12C17.25 15.4518 13.8925 18.25 9.75 18.25C8.82989 18.25 7.95134 18.1156 7.14062 17.8698L5 20Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.75 9.5C10.8546 9.5 11.75 10.2319 11.75 11.125C11.75 11.7377 11.3717 12.1941 10.7806 12.4183C10.2109 12.6351 9.75 13.0729 9.75 13.625V13.75"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.75 15.75H9.755"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
export default function TabLayout() {
  const router = useRouter();
  const { isReady, isAuthenticated } = useAuth();
  const [checkingSession, setCheckingSession] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!isReady) return;

    if (!isAuthenticated) {
      router.replace('/auth');
      return;
    }

    setCheckingSession(false);
  }, [isAuthenticated, isReady, router]);

  if (checkingSession) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#0F3A2B" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#588B76', // Teal for active (first tab) / #8789A3 for others
        tabBarInactiveTintColor: '#8789A3', // Purple-grey for inactive
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 6 + insets.bottom,
          height: 64 + insets.bottom,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
          lineHeight: 12
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, size }) => (
            <HomeIcon size={size} color={focused ? '#588B76' : '#8789A3'} />
          ),
        }}
      />
      <Tabs.Screen
        name="quran"
        options={{
          title: 'Quran',
          tabBarIcon: ({ focused, size }) => (
            <BookIcon size={size} color={focused ? '#588B76' : '#8789A3'} />
          ),
        }}
      />
      <Tabs.Screen
        name="tips"
        options={{
          title: 'Tips',
          tabBarIcon: ({ focused, size }) => (
            <LightbulbIcon size={size} color={focused ? '#059669' : '#8789A3'} />
          ),
        }}
      />
      <Tabs.Screen
        name="prayer"
        options={{
          title: 'Prayer',
          tabBarIcon: ({ focused, size }) => (
            <PrayerIcon size={size} color={focused ? '#059669' : '#8789A3'} />
          ),
        }}
      />
      <Tabs.Screen
        name="dua"
        options={{
          title: 'Dua',
          tabBarIcon: ({ focused, size }) => (
            <SupplicationIcon size={size} color={focused ? '#059669' : '#8789A3'} />
          ),
        }}
      />
      <Tabs.Screen
        name="ask"
        options={{
          title: 'Ask',
          tabBarIcon: ({ focused, size }) => (
            <ChatIcon size={size} color={focused ? '#588B76' : '#8789A3'} />
          ),
        }}
      />
    </Tabs>
  );
}
