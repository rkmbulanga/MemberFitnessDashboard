import { View, Text, StyleSheet } from 'react-native';

interface Props {
  label: string;
  value: string | number;
}

export function StatCard({ label, value }: Props): React.JSX.Element {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  label: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
});
