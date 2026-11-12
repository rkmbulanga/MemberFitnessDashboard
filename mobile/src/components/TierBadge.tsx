import { View, Text, StyleSheet } from 'react-native';
import type { MembershipTier } from '../types/index';
import { TIER_COLORS } from '../config';

interface Props {
  tier: MembershipTier;
}

export function TierBadge({ tier }: Props): React.JSX.Element {
  return (
    <View
      style={[styles.badge, { backgroundColor: TIER_COLORS[tier] ?? '#64748b' }]}
      accessibilityLabel={`${tier} membership`}
    >
      <Text style={styles.text}>{tier.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
