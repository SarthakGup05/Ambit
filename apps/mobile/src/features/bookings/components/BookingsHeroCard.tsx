import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { Text } from '@repo/ui';
import { Sparkles, Calendar, ArrowRight, ShieldCheck } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Amenity } from '../api';

interface BookingsHeroCardProps {
  featuredAmenity?: Amenity | null;
  onPressFeatured: (amenity?: Amenity) => void;
}

export const BookingsHeroCard: React.FC<BookingsHeroCardProps> = ({
  featuredAmenity,
  onPressFeatured,
}) => {
  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onPressFeatured(featuredAmenity || undefined);
  };

  const heroTitle = featuredAmenity ? featuredAmenity.name : 'Rooftop Sunset Lounge';
  const heroDescription = featuredAmenity
    ? featuredAmenity.description
    : 'Host private gatherings with panoramic city views & ambient lighting.';
  const imageUri =
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1000&q=80';

  return (
    <Animated.View entering={FadeInUp.duration(600).delay(150)} style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={handlePress}
      >
        <View style={styles.innerContainer}>
          <Image source={{ uri: imageUri }} style={styles.heroImage} resizeMode="cover" />
          
          {/* Dark Overlay for contrast */}
          <View style={styles.overlay}>
            {/* Top Pill & Icon */}
            <View style={styles.topRow}>
              <View style={styles.badge}>
                <Sparkles size={13} color="#F59E0B" />
                <Text style={styles.badgeText}>FEATURED SPOTLIGHT</Text>
              </View>
              <View style={styles.perkPill}>
                <ShieldCheck size={13} color="#10B981" />
                <Text style={styles.perkText}>Resident Priority</Text>
              </View>
            </View>

            {/* Bottom Content */}
            <View style={styles.bottomContent}>
              <View style={styles.textContainer}>
                <Text style={styles.title}>{heroTitle}</Text>
                <Text style={styles.description} numberOfLines={2}>
                  {heroDescription}
                </Text>
              </View>

              <View style={styles.actionRow}>
                <View style={styles.ctaButton}>
                  <Text style={styles.ctaText}>Reserve Featured Space</Text>
                  <ArrowRight size={16} color="#FFF" />
                </View>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 24,
    marginBottom: 32,
    marginTop: 12,
  },
  card: {
    height: 240,
    borderRadius: 24,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  innerContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.42)', // Dark gradient simulation
    padding: 20,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeText: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  perkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  perkText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomContent: {
    gap: 12,
  },
  textContainer: {
    gap: 4,
  },
  title: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  ctaText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
