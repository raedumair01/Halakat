import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, LogOut, Save } from 'lucide-react-native';
import { fonts } from '../constants/fonts';
import { useAuth } from '../providers/AuthProvider';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, saveProfile, signOut, updateLocalProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [location, setLocation] = useState(user?.location ?? '');
  const [streakGoal, setStreakGoal] = useState(String(user?.streakGoal ?? 30));
  const [saving, setSaving] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);

  useEffect(() => {
    // Keep form in sync with context updates (e.g. after a successful save),
    // but never clobber the user's in-progress edits.
    if (hasEdited) return;
    setFullName(user?.fullName ?? '');
    setBio(user?.bio ?? '');
    setLocation(user?.location ?? '');
    setStreakGoal(String(user?.streakGoal ?? 30));
  }, [hasEdited, user?.bio, user?.fullName, user?.location, user?.streakGoal]);

  const stats = useMemo(
    () => [
      { label: 'Circles', value: String(user?.circlesJoined ?? 0) },
      { label: 'Verses', value: String(user?.memorizedVerses ?? 0) },
      { label: 'Goal', value: `${user?.streakGoal ?? 30}d` },
    ],
    [user]
  );

  const handleSave = async () => {
    try {
      setSaving(true);
      const nextFullName = fullName.trim();
      const nextBio = bio.trim();
      const nextLocation = location.trim();
      const nextStreak = Number(streakGoal) || 30;
      await saveProfile({
        fullName: nextFullName,
        bio: nextBio,
        location: nextLocation,
        streakGoal: nextStreak,
      });
      setHasEdited(false);
      setFullName(nextFullName);
      setBio(nextBio);
      setLocation(nextLocation);
      setStreakGoal(String(nextStreak));
      Alert.alert('Profile updated', 'Your Halakat profile has been saved.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Update failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#0F6A53', '#1D8E70', '#F6FBF8']} style={styles.background}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.topRow}>
              <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                <ArrowLeft size={20} color="#103B31" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleSignOut}>
                <LogOut size={18} color="#103B31" />
              </TouchableOpacity>
            </View>

            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>PROFILE</Text>
              <Text style={styles.heroTitle}>{user?.fullName || 'Halakat Member'}</Text>
              <Text style={styles.heroSubtitle}>{user?.email}</Text>

              <View style={styles.statsRow}>
                {stats.map(stat => (
                  <View key={stat.label} style={styles.statCard}>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>Personal details</Text>

              <Field
                label="Full name"
                value={fullName}
                onChangeText={(value) => {
                  setHasEdited(true);
                  setFullName(value);
                  updateLocalProfile({ fullName: value });
                }}
                placeholder="Your full name"
              />
              <Field
                label="Location"
                value={location}
                onChangeText={(value) => {
                  setHasEdited(true);
                  setLocation(value);
                  updateLocalProfile({ location: value });
                }}
                placeholder="City or community"
              />
              <Field
                label="Bio"
                value={bio}
                onChangeText={(value) => {
                  setHasEdited(true);
                  setBio(value);
                  updateLocalProfile({ bio: value });
                }}
                placeholder="Tell your circle what you're focusing on"
                multiline
              />
              <Field
                label="Streak goal (days)"
                value={streakGoal}
                onChangeText={(value) => {
                  setHasEdited(true);
                  setStreakGoal(value);
                  updateLocalProfile({ streakGoal: Number(value) || 0 });
                }}
                placeholder="30"
                keyboardType="number-pad"
              />

              <TouchableOpacity style={[styles.saveButton, saving && styles.buttonDisabled]} onPress={handleSave} disabled={saving}>
                <Save size={18} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save profile'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

function Field({
  label,
  multiline,
  ...props
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'number-pad';
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor="#98A2B3"
        style={[styles.input, multiline && styles.inputMultiline]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F6A53',
  },
  background: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    borderRadius: 30,
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  heroLabel: {
    color: '#D7F7E7',
    letterSpacing: 1.6,
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    marginTop: 10,
    fontFamily: fonts.bold,
  },
  heroSubtitle: {
    color: '#E6FFF4',
    marginTop: 6,
    fontSize: 15,
    fontFamily: fonts.regular,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  statCard: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 16,
    backgroundColor: '#F6FBF8',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    color: '#123C31',
    fontFamily: fonts.bold,
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#667085',
    fontFamily: fonts.medium,
  },
  formCard: {
    marginTop: 20,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    padding: 22,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#0F172A',
    marginBottom: 18,
    fontFamily: fonts.bold,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    marginBottom: 8,
    color: '#344054',
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  input: {
    borderRadius: 18,
    backgroundColor: '#F8FAFB',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#101828',
    fontFamily: fonts.regular,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 10,
    borderRadius: 18,
    backgroundColor: '#0F6A53',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
