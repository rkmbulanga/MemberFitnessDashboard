import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, ApiError } from '../src/api/client';
import type { FitnessClass } from '../src/types/index';
import { CURRENT_MEMBER_ID, CURRENT_HOME_GYM_ID } from '../src/config';
import { ClassCard } from '../src/components/ClassCard';

interface Section {
  title: string;
  data: FitnessClass[];
}

function groupByDate(classes: FitnessClass[]): Section[] {
  const map = new Map<string, FitnessClass[]>();
  for (const c of classes) {
    const key = c.startsAt.slice(0, 10);
    const list = map.get(key) ?? [];
    list.push(c);
    map.set(key, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([title, data]) => ({ title, data }));
}

export default function ClassesScreen(): React.JSX.Element {
  const [classes, setClasses] = useState<FitnessClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [banner, setBanner] = useState<{
    kind: 'success' | 'error';
    text: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listClasses(CURRENT_HOME_GYM_ID);
      setClasses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onBook = useCallback(
    async (classId: string) => {
      setPendingId(classId);
      setBanner(null);
      try {
        const updated = await api.bookClass(classId, CURRENT_MEMBER_ID);
        setClasses((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c)),
        );
        setBanner({ kind: 'success', text: `Booked ${updated.name}` });
      } catch (err) {
        const text =
          err instanceof ApiError ? err.message : 'Booking failed';
        setBanner({ kind: 'error', text });
      } finally {
        setPendingId(null);
      }
    },
    [],
  );

  const sections = useMemo(() => groupByDate(classes), [classes]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retry} onPress={() => void load()}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {banner && (
        <View
          style={[
            styles.banner,
            banner.kind === 'success' ? styles.bannerOk : styles.bannerErr,
          ]}
        >
          <Text style={styles.bannerText}>{banner.text}</Text>
        </View>
      )}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>
            {new Date(section.title).toLocaleDateString([], {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        )}
        renderItem={({ item }) => (
          <ClassCard
            item={item}
            booked={item.bookedMemberIds.includes(CURRENT_MEMBER_ID)}
            pending={pendingId === item.id}
            onBook={onBook}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No classes found.</Text>}
      />
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
  list: { padding: 16 },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 12,
    marginBottom: 8,
  },
  banner: { padding: 12 },
  bannerOk: { backgroundColor: '#dcfce7' },
  bannerErr: { backgroundColor: '#fee2e2' },
  bannerText: { textAlign: 'center', fontWeight: '600', color: '#0f172a' },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 40 },
  errorText: { color: '#dc2626', textAlign: 'center', paddingHorizontal: 24 },
  retry: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '700' },
});
