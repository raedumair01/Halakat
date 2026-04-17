import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform, Alert } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts } from '../constants/fonts';
import { useAuth } from '../providers/AuthProvider';

type AuthMode = 'login' | 'register';

export default function AuthScreen() {
  const router = useRouter();
  const { isReady, isAuthenticated, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const isRegister = mode === 'register';
  const minPasswordLength = 8;

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, isReady, router]);

  const clearError = (field: 'fullName' | 'email' | 'password' | 'confirmPassword') => {
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const nextErrors = {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();

    if (isRegister && !trimmedName) {
      nextErrors.fullName = 'Full name is required.';
    }

    if (!trimmedEmail) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    } else if (isRegister && password.length < minPasswordLength) {
      nextErrors.password = `Password must be at least ${minPasswordLength} characters.`;
    }

    if (isRegister) {
      if (!confirmPassword) {
        nextErrors.confirmPassword = 'Please confirm your password.';
      } else if (confirmPassword !== password) {
        nextErrors.confirmPassword = 'Passwords do not match.';
      }
    }

    setErrors(nextErrors);
    return !nextErrors.fullName && !nextErrors.email && !nextErrors.password && !nextErrors.confirmPassword;
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrors({ fullName: '', email: '', password: '', confirmPassword: '' });
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      if (isRegister) {
        await signUp({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
        });
      } else {
        await signIn({
          email: email.trim().toLowerCase(),
          password,
        });
      }
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Authentication failed:', error);
      Alert.alert(isRegister ? 'Sign up failed' : 'Login failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={['#F4F8F3', '#FFFFFF', '#F9F2E8']} style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>HALAKAT COMMUNITY</Text>
          </View>
          <Text style={styles.brand}>Halakat</Text>
          <Text style={styles.subtitle}>Join your Quran circle, track your growth, and keep your profile in sync.</Text>

          <View style={styles.segmentControl}>
            <TouchableOpacity
              style={[styles.segmentButton, mode === 'login' && styles.segmentButtonActive]}
              onPress={() => switchMode('login')}
            >
              <Text style={[styles.segmentLabel, mode === 'login' && styles.segmentLabelActive]}>Sign in</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentButton, isRegister && styles.segmentButtonActive]}
              onPress={() => switchMode('register')}
            >
              <Text style={[styles.segmentLabel, isRegister && styles.segmentLabelActive]}>Register</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {isRegister && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Full name</Text>
                <TextInput
                  style={[styles.input, errors.fullName && styles.inputError]}
                  placeholder="Your full name"
                  placeholderTextColor="#9CA3AF"
                  value={fullName}
                  onChangeText={value => {
                    setFullName(value);
                    if (errors.fullName) {
                      clearError('fullName');
                    }
                  }}
                />
                {!!errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{isRegister ? 'Email' : 'Email address'}</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                keyboardType="email-address"
                placeholder={isRegister ? 'example@gmail.com' : 'Your email'}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                value={email}
                onChangeText={value => {
                  setEmail(value);
                  if (errors.email) {
                    clearError('email');
                  }
                }}
              />
              {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>{isRegister ? 'Create a password' : 'Password'}</Text>
                {!isRegister && (
                  <TouchableOpacity>
                    <Text style={styles.helperLink}>Forgot password?</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={[styles.inputWithIcon, errors.password && styles.inputError]}>
                <TextInput
                  style={styles.passwordInput}
                  secureTextEntry={securePassword}
                  placeholder={isRegister ? 'must be 8 characters' : 'Password'}
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={value => {
                    setPassword(value);
                    if (errors.password) {
                      clearError('password');
                    }
                  }}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setSecurePassword(prev => !prev)}
                  activeOpacity={0.8}
                >
                  {securePassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
                </TouchableOpacity>
              </View>
              {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {isRegister && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Confirm password</Text>
                <View style={[styles.inputWithIcon, errors.confirmPassword && styles.inputError]}>
                  <TextInput
                    style={styles.passwordInput}
                    secureTextEntry={secureConfirmPassword}
                    placeholder="repeat password"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={value => {
                      setConfirmPassword(value);
                      if (errors.confirmPassword) {
                        clearError('confirmPassword');
                      }
                    }}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setSecureConfirmPassword(prev => !prev)}
                    activeOpacity={0.8}
                  >
                    {secureConfirmPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
                  </TouchableOpacity>
                </View>
                {!!errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>
            )}
          </View>

          <TouchableOpacity style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]} onPress={handleContinue} disabled={submitting}>
            <Text style={styles.primaryButtonText}>
              {submitting ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
            </Text>
          </TouchableOpacity>

          <View style={styles.highlights}>
            <Text style={styles.highlightsTitle}>With your account you can:</Text>
            <Text style={styles.highlightItem}>Save your profile and streak goals</Text>
            <Text style={styles.highlightItem}>Keep your Halakat journey synced</Text>
            <Text style={styles.highlightItem}>Update your circle identity anytime</Text>
          </View>

          <Text style={styles.switchText}>
            {isRegister ? 'Already have an account? ' : `Don't have an account? `}
            <Text style={styles.switchLink} onPress={() => switchMode(isRegister ? 'login' : 'register')}>
              {isRegister ? 'Log in' : 'Register'}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 60, android: 80, default: 60 }),
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#E5F1EA',
    marginBottom: 18,
  },
  badgeText: {
    fontSize: 12,
    letterSpacing: 1.2,
    color: '#0F6A53',
    fontFamily: fonts.semiBold,
  },
  brand: {
    fontSize: 34,
    color: '#0F172A',
    textAlign: 'center',
    fontFamily: fonts.bold,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
    lineHeight: 24,
    fontFamily: fonts.regular,
  },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 4,
    marginBottom: 28,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  segmentLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: fonts.semiBold,
  },
  segmentLabelActive: {
    color: '#0F172A',
    fontFamily: fonts.semiBold,
  },
  form: {
    gap: 20,
  },
  fieldGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#111827',
    fontFamily: fonts.semiBold,
  },
  helperLink: {
    fontSize: 14,
    color: '#059669',
    fontFamily: fonts.semiBold,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    fontFamily: fonts.regular,
  },
  inputError: {
    borderColor: '#DC2626',
  },
  inputWithIcon: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    color: '#111827',
    fontFamily: fonts.regular,
  },
  eyeButton: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  primaryButton: {
    marginTop: 32,
    backgroundColor: '#0B3D2E',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fonts.semiBold,
  },
  highlights: {
    marginTop: 24,
    padding: 18,
    borderRadius: 24,
    backgroundColor: '#F5FAF7',
    gap: 8,
  },
  highlightsTitle: {
    fontSize: 14,
    color: '#0F3A2B',
    fontFamily: fonts.semiBold,
  },
  highlightItem: {
    fontSize: 14,
    color: '#5F6B66',
    fontFamily: fonts.regular,
  },
  switchText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 28,
    fontFamily: fonts.regular,
  },
  switchLink: {
    color: '#059669',
    fontFamily: fonts.bold,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontFamily: fonts.regular,
  },
});


