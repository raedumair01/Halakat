import { useFonts } from 'expo-font';

export const fontConfig = {
  'Poppins-Thin': require('../assets/fonts/Poppins/Poppins-Thin.ttf'),
  'Poppins-ThinItalic': require('../assets/fonts/Poppins/Poppins-ThinItalic.ttf'),
  'Poppins-ExtraLight': require('../assets/fonts/Poppins/Poppins-ExtraLight.ttf'),
  'Poppins-ExtraLightItalic': require('../assets/fonts/Poppins/Poppins-ExtraLightItalic.ttf'),
  'Poppins-Light': require('../assets/fonts/Poppins/Poppins-Light.ttf'),
  'Poppins-LightItalic': require('../assets/fonts/Poppins/Poppins-LightItalic.ttf'),
  'Poppins-Regular': require('../assets/fonts/Poppins/Poppins-Regular.ttf'),
  'Poppins-Italic': require('../assets/fonts/Poppins/Poppins-Italic.ttf'),
  'Poppins-Medium': require('../assets/fonts/Poppins/Poppins-Medium.ttf'),
  'Poppins-MediumItalic': require('../assets/fonts/Poppins/Poppins-MediumItalic.ttf'),
  'Poppins-SemiBold': require('../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
  'Poppins-SemiBoldItalic': require('../assets/fonts/Poppins/Poppins-SemiBoldItalic.ttf'),
  'Poppins-Bold': require('../assets/fonts/Poppins/Poppins-Bold.ttf'),
  'Poppins-BoldItalic': require('../assets/fonts/Poppins/Poppins-BoldItalic.ttf'),
  'Poppins-ExtraBold': require('../assets/fonts/Poppins/Poppins-ExtraBold.ttf'),
  'Poppins-ExtraBoldItalic': require('../assets/fonts/Poppins/Poppins-ExtraBoldItalic.ttf'),
  'Poppins-Black': require('../assets/fonts/Poppins/Poppins-Black.ttf'),
  'Poppins-BlackItalic': require('../assets/fonts/Poppins/Poppins-BlackItalic.ttf'),
};

export const fonts = {
  thin: 'Poppins-Thin',
  thinItalic: 'Poppins-ThinItalic',
  extraLight: 'Poppins-ExtraLight',
  extraLightItalic: 'Poppins-ExtraLightItalic',
  light: 'Poppins-Light',
  lightItalic: 'Poppins-LightItalic',
  regular: 'Poppins-Regular',
  italic: 'Poppins-Italic',
  medium: 'Poppins-Medium',
  mediumItalic: 'Poppins-MediumItalic',
  semiBold: 'Poppins-SemiBold',
  semiBoldItalic: 'Poppins-SemiBoldItalic',
  bold: 'Poppins-Bold',
  boldItalic: 'Poppins-BoldItalic',
  extraBold: 'Poppins-ExtraBold',
  extraBoldItalic: 'Poppins-ExtraBoldItalic',
  black: 'Poppins-Black',
  blackItalic: 'Poppins-BlackItalic',
};

export function useLoadFonts() {
  return useFonts(fontConfig);
}

