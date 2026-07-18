import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Text } from '@repo/ui';
import { Megaphone, X, Check, Sparkles, Send } from 'lucide-react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

interface SuggestPollModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (question: string) => Promise<void>;
}

export function SuggestPollModal({ isVisible, onClose, onSubmit }: SuggestPollModalProps) {
  const [question, setQuestion] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isVisible) {
      setQuestion('');
      setSuccess(false);
      setIsSubmitting(false);
    }
  }, [isVisible]);

  const handleSubmit = async () => {
    if (question.trim().length < 5) return;
    setIsSubmitting(true);
    try {
      await onSubmit(question.trim());
      setSuccess(true);
    } catch (err) {
      // Handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonDisabled = question.trim().length < 5 || isSubmitting;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardContainer}
          >
            <View style={styles.sheetContainer}>
              {/* Header Handle Bar */}
              <View style={styles.handleBar} />

              {/* Close Button */}
              <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
                <X size={20} color="#8E8D94" strokeWidth={2} />
              </Pressable>

              {!success ? (
                <View>
                  {/* Mega Icon */}
                  <View style={styles.iconContainer}>
                    <Megaphone size={22} color="#3E5C38" strokeWidth={2.2} />
                  </View>

                  {/* Title & Description */}
                  <Text variant="h3" weight="bold" style={styles.title}>
                    Suggest a New Poll
                  </Text>
                  <Text variant="body" style={styles.description}>
                    Your voice shapes our community. Suggest a topic or question you would like the society to vote on.
                  </Text>

                  {/* Textarea Label */}
                  <View style={styles.inputLabelRow}>
                    <Text variant="caption" weight="bold" style={styles.inputLabel}>
                      POLL QUESTION / IDEA
                    </Text>
                    <Text variant="caption" style={styles.charCounter}>
                      {question.length} / 120
                    </Text>
                  </View>

                  {/* Styled Input Container */}
                  <View
                    style={[
                      styles.inputWrapper,
                      isFocused && styles.inputWrapperFocused,
                      question.trim().length >= 5 && styles.inputWrapperValid,
                    ]}
                  >
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g., Should we install solar panels on the roof of block B?"
                      placeholderTextColor="#A3A1A8"
                      multiline
                      maxLength={120}
                      value={question}
                      onChangeText={setQuestion}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      textAlignVertical="top"
                    />
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionsRow}>
                    <Pressable style={styles.cancelBtn} onPress={onClose}>
                      <Text variant="label" weight="bold" style={styles.cancelBtnText}>
                        Cancel
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.submitBtn,
                        isButtonDisabled && styles.submitBtnDisabled,
                      ]}
                      onPress={handleSubmit}
                      disabled={isButtonDisabled}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Send size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                          <Text variant="label" weight="bold" style={styles.submitBtnText}>
                            Submit Idea
                          </Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                </View>
              ) : (
                /* Success screen */
                <Animated.View entering={FadeIn.duration(400)} style={styles.successContainer}>
                  <Animated.View entering={ZoomIn.delay(100).duration(300)} style={styles.successBadge}>
                    <Check size={28} color="#FFFFFF" strokeWidth={3} />
                  </Animated.View>
                  <Text variant="h2" weight="bold" style={styles.successTitle}>
                    Idea Submitted!
                  </Text>
                  <Text variant="body" style={styles.successDesc}>
                    Thank you! Your suggestion has been successfully sent to the society administration office for review.
                  </Text>
                  
                  <Pressable style={styles.successCloseBtn} onPress={onClose}>
                    <Sparkles size={14} color="#3E5C38" style={{ marginRight: 6 }} />
                    <Text variant="label" weight="bold" style={styles.successCloseText}>
                      Done
                    </Text>
                  </Pressable>
                </Animated.View>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(28, 27, 31, 0.45)', // Premium dark grey overlay
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    position: 'relative',
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EAECE8',
    alignSelf: 'center',
    marginBottom: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FAF9F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECEFEA',
    zIndex: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EAF0E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'ManropeBold',
    fontWeight: '700',
    color: '#1C1B1F',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    fontFamily: 'Inter',
    color: '#6B6873',
    lineHeight: 18,
    marginBottom: 20,
  },
  inputLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: 'InterBold',
    fontWeight: '700',
    color: '#8E8D94',
    letterSpacing: 0.5,
  },
  charCounter: {
    fontSize: 11,
    fontFamily: 'Inter',
    color: '#8E8D94',
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderColor: '#ECEFEA',
    borderRadius: 14,
    backgroundColor: '#FAF9F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 110,
    marginBottom: 20,
  },
  inputWrapperFocused: {
    borderColor: '#3E5C38',
    backgroundColor: '#FFFFFF',
  },
  inputWrapperValid: {
    borderColor: '#E2EAE0',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'InterMedium',
    color: '#1C1B1F',
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECEFEA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontFamily: 'InterBold',
    fontWeight: '700',
    color: '#6B6873',
  },
  submitBtn: {
    flex: 2,
    flexDirection: 'row',
    height: 46,
    borderRadius: 12,
    backgroundColor: '#3E5C38',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#A3A1A8',
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 14,
    fontFamily: 'InterBold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  
  /* Success View Styles */
  successContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  successBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3E5C38',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#3E5C38',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  successTitle: {
    fontSize: 20,
    fontFamily: 'ManropeBold',
    fontWeight: '700',
    color: '#1C1B1F',
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 13.5,
    fontFamily: 'Inter',
    color: '#6B6873',
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  successCloseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#3E5C38',
    borderRadius: 12,
    paddingHorizontal: 28,
    height: 42,
    backgroundColor: '#FFFFFF',
  },
  successCloseText: {
    fontSize: 13.5,
    fontFamily: 'InterBold',
    fontWeight: '700',
    color: '#3E5C38',
  },
});
