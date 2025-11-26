const QURAN_API_BASE_URL = 'https://api.alquran.cloud/v1';
const QURANENC_API_BASE_URL = 'https://quranenc.com/api/v1';

async function fetchFromApi<T>(endpoint: string, errorMessage: string): Promise<T> {
  const response = await fetch(`${QURAN_API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(errorMessage);
  }

  const payload = await response.json();
  if (!payload?.data) {
    throw new Error('Invalid response from Quran API');
  }

  return payload.data as T;
}

async function fetchFromQuranEncApi<T>(endpoint: string, errorMessage: string): Promise<T> {
  const response = await fetch(`${QURANENC_API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data as T;
}

export function fetchFullQuran<T>(): Promise<T> {
  return fetchFromApi<T>('/quran/ar.alafasy', 'Failed to fetch Quran data');
}

export function fetchSurahArabic<T>(surahNumber: string | number): Promise<T> {
  return fetchFromApi<T>(`/surah/${surahNumber}/ar.alafasy`, 'Failed to fetch surah data');
}

// Get available translations from QuranEnc
export function fetchAvailableTranslations<T>(): Promise<T> {
  return fetchFromQuranEncApi<T>('/translations/list', 'Failed to fetch available translations');
}

// Fetch translation from QuranEnc API
export function fetchSurahTranslation<T>(
  surahNumber: string | number,
  translationKey = 'urdu_junagarhi' // Default to Urdu translation by Muhammad Junagarhi
): Promise<T> {
  return fetchFromQuranEncApi<T>(
    `/translation/sura/${translationKey}/${surahNumber}`,
    'Failed to fetch surah translation'
  );
}

// Common Urdu translation keys to try (will be updated once we find the correct one)
export const URDU_TRANSLATION_KEYS = {
  JUNAGARHI: 'urdu_junagarhi',
  HAFIZ_SALAHUDDIN: 'urdu_hafiz_salahuddin', // Placeholder - needs to be verified
  DEFAULT: 'urdu_junagarhi'
};

// Helper function to find translation key by searching for Hafiz Salahuddin Yusuf
export async function findHafizSalahuddinTranslationKey(): Promise<string> {
  try {
    const translationsResponse = await fetchAvailableTranslations<any>();
    
    // Debug: Log the actual response to understand the format
    console.log('Raw translations response:', translationsResponse);
    console.log('Type of response:', typeof translationsResponse);
    console.log('Is array:', Array.isArray(translationsResponse));
    
    // Handle different possible response formats
    let translations: any[] = [];
    if (Array.isArray(translationsResponse)) {
      translations = translationsResponse;
    } else if (translationsResponse && Array.isArray(translationsResponse.data)) {
      translations = translationsResponse.data;
    } else if (translationsResponse && typeof translationsResponse === 'object') {
      // If it's an object, try to find an array property
      const possibleArrays = Object.values(translationsResponse).filter(Array.isArray);
      if (possibleArrays.length > 0) {
        translations = possibleArrays[0] as any[];
      }
    }
    
    console.log('Processed translations:', translations);
    console.log('Number of translations:', translations.length);
    
    if (!Array.isArray(translations) || translations.length === 0) {
      console.warn('No translations found, using fallback');
      return URDU_TRANSLATION_KEYS.DEFAULT;
    }
    
    // Debug: Log all Urdu translations to find the right key
    const urduTranslations = translations.filter(t => 
      t && (t.language_iso_code === 'ur' || t.language === 'ur' || 
            (t.title && t.title.toLowerCase().includes('urdu')))
    );
    
    console.log('Available Urdu translations:', 
      urduTranslations.map(t => ({
        key: t.key,
        title: t.title,
        description: t.description,
        language: t.language_iso_code || t.language
      }))
    );
    
    // First, filter to only Urdu translations to avoid false matches
    const urduOnlyTranslations = urduTranslations;
    
    // Search for Hafiz Salahuddin Yusuf translation specifically in Urdu translations
    const searchPatterns = [
      'salahuddin',
      'hafiz salahuddin',
      'salah',
      'صلاح الدین',
      'حافظ صلاح الدین'
    ];
    
    const hafizTranslation = urduOnlyTranslations.find(t => 
      t && searchPatterns.some(pattern => 
        (t.title && t.title.toLowerCase().includes(pattern)) ||
        (t.description && t.description.toLowerCase().includes(pattern)) ||
        (t.key && t.key.toLowerCase().includes(pattern))
      )
    );
    
    if (hafizTranslation && hafizTranslation.key) {
      console.log('Found potential Hafiz Salahuddin translation:', hafizTranslation);
      return hafizTranslation.key;
    }
    
    // Since Hafiz Salahuddin Yusuf translation is not available in QuranEnc,
    // use the available Urdu translation by Muhammad Junagarhi
    console.log('Hafiz Salahuddin Yusuf translation not found in QuranEnc API');
    console.log('Using Muhammad Junagarhi Urdu translation as fallback');
    
    // Use the available Urdu translation
    const anyUrduTranslation = urduTranslations.find(t => t && t.key);
    if (anyUrduTranslation) {
      console.log('Using available Urdu translation:', anyUrduTranslation);
      return anyUrduTranslation.key;
    }
    
    return URDU_TRANSLATION_KEYS.DEFAULT;
  } catch (error) {
    console.error('Failed to find Hafiz Salahuddin translation key:', error);
    // Return a hardcoded fallback that's likely to work
    return 'urdu_junagarhi';
  }
}

// Simplified function that just uses a known working Urdu translation
export function getUrduTranslationKey(): string {
  // For now, use Muhammad Junagarhi's translation as it's commonly available
  // This can be updated once we identify the correct key for Hafiz Salahuddin Yusuf
  return 'urdu_junagarhi';
}

// Function to find Arabic text key from QuranEnc
export async function findArabicTextKey(): Promise<string> {
  try {
    const translationsResponse = await fetchAvailableTranslations<any>();
    
    // Handle different possible response formats
    let translations: any[] = [];
    if (Array.isArray(translationsResponse)) {
      translations = translationsResponse;
    } else if (translationsResponse && Array.isArray(translationsResponse.data)) {
      translations = translationsResponse.data;
    } else if (translationsResponse && typeof translationsResponse === 'object') {
      const possibleArrays = Object.values(translationsResponse).filter(Array.isArray);
      if (possibleArrays.length > 0) {
        translations = possibleArrays[0] as any[];
      }
    }
    
    // Look for Arabic text entries
    const arabicEntries = translations.filter(t => 
      t && (
        (t.language_iso_code === 'ar') ||
        (t.key && t.key.toLowerCase().includes('arabic')) ||
        (t.title && t.title.toLowerCase().includes('arabic')) ||
        (t.title && t.title.includes('القرآن')) ||
        (t.title && t.title.includes('عربي'))
      )
    );
    
    console.log('Available Arabic text entries:', arabicEntries);
    
    // Prefer original Arabic text
    const originalArabic = arabicEntries.find(t => 
      t.key && (
        t.key.includes('arabic') || 
        t.key.includes('quran') ||
        t.key === 'ar' ||
        t.title.includes('نص القرآن')
      )
    );
    
    if (originalArabic) {
      console.log('Using Arabic text key:', originalArabic.key);
      return originalArabic.key;
    }
    
    // Fallback to any Arabic entry
    if (arabicEntries.length > 0) {
      console.log('Using fallback Arabic text key:', arabicEntries[0].key);
      return arabicEntries[0].key;
    }
    
    // If no Arabic found in QuranEnc, return null to use original API
    console.log('No Arabic text found in QuranEnc, will use original API');
    return '';
  } catch (error) {
    console.error('Failed to find Arabic text key:', error);
    return '';
  }
}

// Fetch Arabic text from QuranEnc API
export function fetchSurahArabicFromQuranEnc<T>(
  surahNumber: string | number,
  arabicKey: string
): Promise<T> {
  return fetchFromQuranEncApi<T>(
    `/translation/sura/${arabicKey}/${surahNumber}`,
    'Failed to fetch Arabic text from QuranEnc'
  );
}

// Fetch single ayah translation from QuranEnc API
export function fetchAyahTranslation<T>(
  surahNumber: string | number,
  ayahNumber: string | number,
  translationKey = 'urdu_junagarhi'
): Promise<T> {
  return fetchFromQuranEncApi<T>(
    `/translation/aya/${translationKey}/${surahNumber}/${ayahNumber}`,
    'Failed to fetch ayah translation'
  );
}

