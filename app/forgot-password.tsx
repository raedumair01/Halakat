import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { fonts } from '../constants/fonts';
import { requestPasswordReset, resetPassword } from '../services/authApi';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);
  const [requestSent, setRequestSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [devResetToken, setDevResetToken] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    resetToken: '',
    password: '',
    confirmPassword: '',
  });

  const normalizedEmail = email.trim().toLowerCase();

  const clearError = (field: keyof typeof errors) => {
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateEmail = () => {
    if (!normalizedEmail) {
      setErrors(prev => ({ ...prev, email: 'Email is required.' }));
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address.' }));
      return false;
    }

    return true;
  };

  const handleRequestReset = async () => {
    if (!validateEmail()) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await requestPasswordReset({ email: normalizedEmail });
      setRequestSent(true);
      setDevResetToken(response.resetToken ?? '');
      if (response.resetToken) {
        setResetToken(response.resetToken);
      }
      Alert.alert('Reset code generated', response.message);
    } catch (error) {
      Alert.alert('Reset failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const validateReset = () => {
    const nextErrors = {
      email: '',
      resetToken: '',
      password: '',
      confirmPassword: '',
    };

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = 'A valid email is required.';
    }

    if (!resetToken.trim()) {
      nextErrors.resetToken = 'Reset code is required.';
    }

    if (!password) {
      nextErrors.password = 'New password is required.';
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.';
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(nextErrors);
    return !nextErrors.email && !nextErrors.resetToken && !nextErrors.password && !nextErrors.confirmPassword;
  };

  const handleResetPassword = async () => {
    if (!validateReset()) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await resetPassword({
        email: normalizedEmail,
        resetToken: resetToken.trim(),
        password,
      });
      Alert.alert('Password reset', response.message, [
        {
          text: 'Sign in',
          onPress: () => router.replace('/auth'),
        },
      ]);
    } catch (error) {
      Alert.alert('Reset failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={['#F4F8F3', '#FFFFFF', '#F9F2E8']} style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
          <ArrowLeft size={20} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>ACCOUNT RECOVERY</Text>
          </View>
          <Text style={styles.title}>Forgot password</Text>
          <Text style={styles.subtitle}>Enter your email to generate a reset code, then choose a new password.</Text>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                keyboardType="email-address"
                placeholder="Your email"
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

            <TouchableOpacity
              style={[styles.secondaryButton, submitting && styles.buttonDisabled]}
              onPress={handleRequestReset}
              disabled={submitting}
            >
              <Text style={styles.secondaryButtonText}>{requestSent ? 'Send another code' : 'Send reset code'}</Text>
            </TouchableOpacity>

            {requestSent && (
              <>
                {!!devResetToken && (
                  <View style={styles.devBox}>
                    <Text style={styles.devLabel}>Development reset code</Text>
                    <Text style={styles.devCode}>{devResetToken}</Text>
                  </View>
                )}

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Reset code</Text>
                  <TextInput
                    style={[styles.input, errors.resetToken && styles.inputError]}
                    keyboardType="number-pad"
                    placeholder="6-digit code"
                    placeholderTextColor="#9CA3AF"
                    value={resetToken}
                    onChangeText={value => {
                      setResetToken(value);
                      if (errors.resetToken) {
                        clearError('resetToken');
                      }
                    }}
                  />
                  {!!errors.resetToken && <Text style={styles.errorText}>{errors.resetToken}</Text>}
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>New password</Text>
                  <View style={[styles.inputWithIcon, errors.password && styles.inputError]}>
                    <TextInput
                      style={styles.passwordInput}
                      secureTextEntry={securePassword}
                      placeholder="must be 8 characters"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={value => {
                        setPassword(value);
                        if (errors.password) {
                          clearError('password');
                        }
                      }}
                    />
                    <TouchableOpacity style={styles.eyeButton} onPress={() => setSecurePassword(prev => !prev)} activeOpacity={0.8}>
                      {securePassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
                    </TouchableOpacity>
                  </View>
                  {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

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
                    <TouchableOpacity style={styles.eyeButton} onPress={() => setSecureConfirmPassword(prev => !prev)} activeOpacity={0.8}>
                      {secureConfirmPassword ? <EyeOff size={20} color="#6B7280" /> : <Eye size={20} color="#6B7280" />}
                    </TouchableOpacity>
                  </View>
                  {!!errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, submitting && styles.buttonDisabled]}
                  onPress={handleResetPassword}
                  disabled={submitting}
                >
                  <Text style={styles.primaryButtonText}>{submitting ? 'Please wait...' : 'Reset password'}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <Text style={styles.switchText}>
            Remembered it?{' '}
            <Text style={styles.switchLink} onPress={() => router.replace('/auth')}>
              Sign in
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
    paddingTop: Platform.select({ ios: 60, android: 64, default: 60 }),
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 36,
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
  title: {
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
    lineHeight: 24,
    fontFamily: fonts.regular,
  },
  form: {
    gap: 20,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    color: '#111827',
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
  secondaryButton: {
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#E5F1EA',
  },
  secondaryButtonText: {
    color: '#0F6A53',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  primaryButton: {
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
  buttonDisabled: {
    opacity: 0.7,
  },
  devBox: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 4,
  },
  devLabel: {
    color: '#9A3412',
    fontSize: 13,
    fontFamily: fonts.semiBold,
  },
  devCode: {
    color: '#7C2D12',
    fontSize: 22,
    fontFamily: fonts.bold,
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
