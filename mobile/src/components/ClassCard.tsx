import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { FitnessClass } from '../types/index';
import { TYPE_COLORS } from '../config';

interface Props {
  item: FitnessClass;
  booked: boolean;
  pending: boolean;
  onBook: (classId: string) => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ClassCard({
  item,
  booked,
  pending,
  onBook,
}: Props): React.JSX.Element {
  const full = item.bookedMemberIds.length >= item.capacity;
  const disabled = full || booked || pending;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{item.name}</Text>
        <View
          style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[item.type] }]}
        >
          <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.meta}>
        {item.instructor} · {formatTime(item.startsAt)}
      </Text>
      <Text style={styles.capacity}>
        {item.bookedMemberIds.length}/{item.capacity} spots
      </Text>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => onBook(item.id)}
        style={[styles.button, disabled ? styles.buttonDisabled : styles.buttonActive]}
      >
        <Text style={styles.buttonText}>
          {booked ? 'Booked' : full ? 'Full' : pending ? 'Booking…' : 'Book'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { fontSize: 16, fontWeight: '700', color: '#0f172a', flex: 1 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  meta: { fontSize: 14, color: '#475569', marginTop: 6 },
  capacity: { fontSize: 13, color: '#64748b', marginTop: 2 },
  button: {
    marginTop: 12,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonActive: { backgroundColor: '#2563eb' },
  buttonDisabled: { backgroundColor: '#cbd5e1' },
  buttonText: { color: '#fff', fontWeight: '700' },
});
