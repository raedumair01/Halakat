import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { Eye, EyeOff, Facebook, Chrome, Apple } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { fonts } from './fonts';

type AuthMode = 'login' | 'register';

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);

  const isRegister = mode === 'register';

  const handleContinue = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.brand}>Halakat</Text>
          <Text style={styles.subtitle}>Log in or register to save your progress</Text>

          <View style={styles.segmentControl}>
            <TouchableOpacity
              style={[styles.segmentButton, mode === 'login' && styles.segmentButtonActive]}
              onPress={() => setMode('login')}
            >
              <Text style={[styles.segmentLabel, mode === 'login' && styles.segmentLabelActive]}>Sign in</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentButton, isRegister && styles.segmentButtonActive]}
              onPress={() => setMode('register')}
            >
              <Text style={[styles.segmentLabel, isRegister && styles.segmentLabelActive]}>Register</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>{isRegister ? 'Email' : 'Email address'}</Text>
              <TextInput
                style={styles.input}
                keyboardType="email-address"
                placeholder={isRegister ? 'example@gmail.com' : 'Your email'}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
              />
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
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.passwordInput}
                  secureTextEntry={securePassword}
                  placeholder={isRegister ? 'must be 8 characters' : 'Password'}
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setSecurePassword(prev => !prev)}
                  activeOpacity={0.8}
                >
                  {securePassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
                </TouchableOpacity>
              </View>
            </View>

            {isRegister && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Confirm password</Text>
                <View style={styles.inputWithIcon}>
                  <TextInput
                    style={styles.passwordInput}
                    secureTextEntry={secureConfirmPassword}
                    placeholder="repeat password"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setSecureConfirmPassword(prev => !prev)}
                    activeOpacity={0.8}
                  >
                    {secureConfirmPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
            <Text style={styles.primaryButtonText}>{isRegister ? 'Register' : 'Sign in'}</Text>
          </TouchableOpacity>

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>
              {isRegister ? 'Or Register with' : 'Other sign in options'}
            </Text>
            <View style={styles.separatorLine} />
          </View>

          <View style={styles.socialRow}>
            <SocialButton icon={<Facebook size={20} color="#1F2937" />} />
            <SocialButton icon={<Chrome size={20} color="#1F2937" />} />
            <SocialButton icon={<Apple size={20} color="#1F2937" />} />
          </View>

          <Text style={styles.switchText}>
            {isRegister ? 'Already have an account? ' : `Don't have an account? `}
            <Text style={styles.switchLink} onPress={() => setMode(isRegister ? 'login' : 'register')}>
              {isRegister ? 'Log in' : 'Register'}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function SocialButton({ icon }: { icon: React.ReactNode }) {
  return (
    <TouchableOpacity style={styles.socialButton}>
      {icon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 60, android: 80, default: 60 }),
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  brand: {
    fontSize: 32,
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
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fonts.semiBold,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  separatorText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: fonts.semiBold,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
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
});


