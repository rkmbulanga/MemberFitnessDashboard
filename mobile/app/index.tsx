import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, ApiError } from '../src/api/client';
import type { Member, MemberStats, Booking } from '../src/types/index';
import {
  CURRENT_MEMBER_ID,
  CURRENT_HOME_GYM_ID,
  GYM_NAMES,
} from '../src/config';
import { TierBadge } from '../src/components/TierBadge';
import { StatCard } from '../src/components/StatCard';
import { StreakIndicator } from '../src/components/StreakIndicator';

export default function DashboardScreen(): React.JSX.Element {
  const [member, setMember] = useState<Member | null>(null);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, s, b] = await Promise.all([
        api.getMember(CURRENT_MEMBER_ID),
        api.getStats(CURRENT_MEMBER_ID),
        api.getBookings(CURRENT_MEMBER_ID),
      ]);
      setMember(m);
      setStats(s);
      setBookings(b);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load dashboard',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onCheckIn = useCallback(async () => {
    setCheckingIn(true);
    try {
      await api.checkIn(CURRENT_MEMBER_ID, CURRENT_HOME_GYM_ID);
      Alert.alert('Checked in', 'Your visit has been recorded.');
      await load();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Check-in failed';
      Alert.alert('Could not check in', message);
    } finally {
      setCheckingIn(false);
    }
  }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  if (error || !member || !stats) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error ?? 'No data available'}</Text>
        <Pressable style={styles.retry} onPress={() => void load()}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.greetingRow}>
          <Text style={styles.greeting}>Hi, {member.name.split(' ')[0]}</Text>
          <TierBadge tier={member.tier} />
        </View>

        <StreakIndicator streak={stats.currentStreak} />

        <View style={styles.statsRow}>
          <StatCard label="Visits" value={stats.totalVisits} />
          <StatCard label="Classes" value={stats.classesAttended} />
          <StatCard
            label="Favorite gym"
            value={
              stats.favoriteGymId
                ? (GYM_NAMES[stats.favoriteGymId] ?? '—')
                : '—'
            }
          />
        </View>

        <Text style={styles.sectionTitle}>Upcoming bookings</Text>
        {bookings.length === 0 ? (
          <Text style={styles.empty}>No upcoming bookings.</Text>
        ) : (
          bookings.slice(0, 3).map((b) => (
            <View key={b.classId} style={styles.bookingRow}>
              <Text style={styles.bookingClass}>{b.classId}</Text>
              <Text style={styles.bookingTime}>
                {new Date(b.bookedAt).toLocaleString([], {
                  weekday: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          ))
        )}

        <Pressable
          style={[styles.checkIn, checkingIn && styles.checkInDisabled]}
          disabled={checkingIn}
          onPress={() => void onCheckIn()}
          accessibilityRole="button"
        >
          <Text style={styles.checkInText}>
            {checkingIn ? 'Checking in…' : 'Check In'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    gap: 12,
  },
  content: { padding: 16, gap: 20 },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { fontSize: 26, fontWeight: '800', color: '#0f172a' },
  statsRow: { flexDirection: 'row', marginHorizontal: -4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  empty: { color: '#64748b' },
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
  },
  bookingClass: { fontWeight: '600', color: '#0f172a' },
  bookingTime: { color: '#64748b' },
  checkIn: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  checkInDisabled: { backgroundColor: '#86efac' },
  checkInText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  errorText: { color: '#dc2626', textAlign: 'center', paddingHorizontal: 24 },
  retry: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '700' },
});
