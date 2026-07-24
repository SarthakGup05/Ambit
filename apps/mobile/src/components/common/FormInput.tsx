import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export interface FormInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClear?: () => void;
  containerStyle?: any;
  inputContainerStyle?: any;
  activeBorderColor?: string;
}

export function FormInput({
  label,
  error,
  leftIcon,
  rightIcon,
  onClear,
  value,
  containerStyle,
  inputContainerStyle,
  activeBorderColor = '#7A9B76',
  onFocus,
  onBlur,
  ...props
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [focusAnim] = useState(new Animated.Value(0));

  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    if (onFocus) {
      onFocus(e);
    }
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    if (onBlur) {
      onBlur(e);
    }
  };

  // Interpolate border color and shadow/glow properties
  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? '#EF4444' : 'rgba(0, 0, 0, 0.08)',
      error ? '#EF4444' : activeBorderColor,
    ],
  });

  const backgroundColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.65)', 'rgba(255, 255, 255, 0.95)'],
  });

  const shadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.02, 0.08],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, error ? styles.labelError : null]}>
          {label}
        </Text>
      )}

      <Animated.View
        style={[
          styles.inputContainer,
          {
            borderColor,
            backgroundColor,
            shadowOpacity,
            shadowRadius: isFocused ? 8 : 4,
            elevation: isFocused ? 2 : 0,
          },
          inputContainerStyle,
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, props.multiline ? styles.multilineInput : null]}
          placeholderTextColor="#A3A1A8"
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {value && onClear && (
          <Pressable
            onPress={() => {
              triggerHaptic();
              onClear();
            }}
            style={styles.clearButton}
            hitSlop={8}
          >
            <X size={16} color="#A3A1A8" />
          </Pressable>
        )}

        {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
      </Animated.View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontFamily: 'InterBold',
    color: '#8E8D94',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  labelError: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    shadowColor: '#71717A',
    shadowOffset: { width: 0, height: 4 },
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontFamily: 'InterMedium',
    color: '#11111E',
    paddingVertical: 0,
  },
  multilineInput: {
    height: 'auto',
    paddingTop: 14,
    paddingBottom: 14,
    textAlignVertical: 'top',
  },
  leftIconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontFamily: 'InterMedium',
    marginTop: 6,
    marginLeft: 4,
  },
});
