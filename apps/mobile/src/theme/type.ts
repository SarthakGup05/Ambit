import { TextStyle } from 'react-native';

/**
 * Ambit mobile type scale — Manrope for titles, Inter for body.
 * Sizes / line-heights follow modern iOS + Material mobile rhythm.
 * Pair with @repo/ui Text via `variant` + `weight` (fontFamily is resolved there).
 */
export const type = {
  /** Centered nav / screen title */
  navTitle: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.3,
    color: '#11111E',
  } satisfies TextStyle,

  /** Large greeting (e.g. Hi, Name) */
  greeting: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.55,
    color: '#11111E',
  } satisfies TextStyle,

  /** Soft support under greeting */
  greetingSub: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.1,
    color: '#6B7280',
  } satisfies TextStyle,

  /** Section headers */
  section: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.3,
    color: '#11111E',
  } satisfies TextStyle,

  /** Hero / promo headline */
  heroTitle: {
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.4,
    color: '#1B4332',
  } satisfies TextStyle,

  heroBody: {
    fontSize: 13,
    lineHeight: 19,
    letterSpacing: -0.05,
    color: '#3D5A40',
  } satisfies TextStyle,

  /** List / row primary */
  rowTitle: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.15,
    color: '#11111E',
  } satisfies TextStyle,

  /** List / row secondary */
  rowSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.05,
    color: '#6B7280',
  } satisfies TextStyle,

  /** Meta timestamps, flats */
  meta: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
    color: '#8E8D94',
  } satisfies TextStyle,

  /** Small uppercase / muted labels */
  label: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.15,
    color: '#8E8D94',
  } satisfies TextStyle,

  /** Inline text link */
  link: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.05,
    color: '#2E7D32',
  } satisfies TextStyle,

  /** Status chip text */
  status: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  } satisfies TextStyle,

  /** Large dashboard stat */
  stat: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.7,
    color: '#FFFFFF',
  } satisfies TextStyle,

  /** Compact overview stat */
  statSm: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.45,
    color: '#11111E',
  } satisfies TextStyle,

  /** Stat caption under number */
  statLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
    color: 'rgba(255,255,255,0.72)',
  } satisfies TextStyle,

  statLabelDark: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
    color: '#8E8D94',
  } satisfies TextStyle,

  /** Grid action label */
  gridLabel: {
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.1,
    color: '#11111E',
    textAlign: 'center',
  } satisfies TextStyle,

  /** Tab bar */
  tab: {
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.15,
  } satisfies TextStyle,

  /** Notification / count badge */
  badge: {
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0,
    color: '#FFFFFF',
  } satisfies TextStyle,

  /** Capsule / role pill */
  micro: {
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.9,
  } satisfies TextStyle,

  /** Empty / placeholder title */
  emptyTitle: {
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.35,
    color: '#11111E',
  } satisfies TextStyle,

  emptyBody: {
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: -0.05,
    color: '#5E5D6A',
    textAlign: 'center',
  } satisfies TextStyle,
} as const;
