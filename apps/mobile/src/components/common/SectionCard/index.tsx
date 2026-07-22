import React from 'react';
import { View, Pressable, ViewStyle } from 'react-native';
import { Text } from '@repo/ui';
import { ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { uiStyles } from '@/theme/styles';

export interface AppSectionCardProps {
  label?: string;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
  cardStyle?: ViewStyle;
}

export function AppSectionCard({
  label,
  rightAction,
  children,
  style,
  cardStyle,
}: AppSectionCardProps) {
  return (
    <View style={[uiStyles.sectionContainer, style]}>
      {label && (
        <View style={uiStyles.sectionHeader}>
          <Text style={uiStyles.sectionLabel}>{label}</Text>
          {rightAction}
        </View>
      )}
      <View style={[uiStyles.sectionCard, cardStyle]}>{children}</View>
    </View>
  );
}

export interface AppListItemProps {
  Icon?: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  iconNode?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: number | string;
  valueText?: string;
  rightElement?: React.ReactNode;
  hideChevron?: boolean;
  onPress?: () => void;
  isLast?: boolean;
  iconColor?: string;
  iconBg?: string;
}

export function AppListItem({
  Icon,
  iconNode,
  title,
  subtitle,
  badge,
  valueText,
  rightElement,
  hideChevron = false,
  onPress,
  isLast = false,
  iconColor = '#4A5568',
  iconBg = 'rgba(74, 85, 104, 0.07)',
}: AppListItemProps) {
  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }
  };

  const handlePress = () => {
    if (onPress) {
      triggerHaptic();
      onPress();
    }
  };

  const content = (
    <View style={uiStyles.settingRow}>
      {(Icon || iconNode) && (
        <View style={[uiStyles.settingIconWrapper, { backgroundColor: iconBg }]}>
          {iconNode ? (
            iconNode
          ) : Icon ? (
            <Icon size={18} color={iconColor} strokeWidth={2.2} />
          ) : null}
        </View>
      )}
      <View style={uiStyles.settingTextContainer}>
        <View style={uiStyles.titleRow}>
          {typeof title === 'string' ? (
            <Text variant="body" weight="semibold" style={uiStyles.itemTitle}>
              {title}
            </Text>
          ) : (
            title
          )}
          {badge != null && (
            <View style={uiStyles.badge}>
              <Text variant="caption" weight="bold" style={uiStyles.badgeText}>
                {badge}
              </Text>
            </View>
          )}
        </View>
        {subtitle &&
          (typeof subtitle === 'string' ? (
            <Text variant="caption" style={uiStyles.itemSubtitle}>
              {subtitle}
            </Text>
          ) : (
            subtitle
          ))}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 0, gap: 4 }}>
        {valueText && <Text style={uiStyles.valueText}>{valueText}</Text>}
        {rightElement}
        {onPress && !rightElement && !hideChevron && (
          <ChevronRight size={16} color="#A3A1A8" strokeWidth={2.5} />
        )}
      </View>
    </View>
  );

  return (
    <View>
      {onPress ? (
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [pressed && uiStyles.settingRowPressed]}
        >
          {content}
        </Pressable>
      ) : (
        content
      )}
      {!isLast && <View style={uiStyles.divider} />}
    </View>
  );
}
