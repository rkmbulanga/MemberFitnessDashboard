import { View, Text, StyleSheet } from 'react-native';

interface Props {
  streak: number;
}

export function StreakIndicator({ streak }: Props): React.JSX.Element {
  const active = streak > 0;
  return (
    <View style={[styles.container, active ? styles.active : styles.inactive]}>
      <Text style={styles.flame}>{active ? '🔥' : '💤'}</Text>
      <View>
        <Text style={styles.count}>{streak}</Text>
        <Text style={styles.label}>
          {streak === 1 ? 'day streak' : 'day streak'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  active: { backgroundColor: '#fff7ed' },
  inactive: { backgroundColor: '#f1f5f9' },
  flame: { fontSize: 40 },
  count: { fontSize: 32, fontWeight: '800', color: '#0f172a' },
  label: { fontSize: 14, color: '#64748b' },
});
