export const COLORS = {
  // Brand / primary (sage green)
  primary: '#3E5C38',
  primaryDark: '#1B3B2B',
  primaryAccent: '#2D6A4F',
  primarySurface: '#F0F3EF',
  primarySurfaceStrong: '#EBF4EA',
  primarySurfaceSubtle: '#F1F7F0',
  primaryBorder: '#E6EFE4',
  primaryBorderStrong: '#E4EFE0',
  primaryBorderFaint: '#E2EBE0',
  primaryProgressTrack: '#EAF0E8',

  // Option badges & illustrations
  accentTerracotta: '#E07A5F',
  accentBlue: '#3B82F6',
  accentGold: '#D9A74A',

  // Neutrals
  ink: '#1C1B1F',
  inkMuted: '#556353',
  textMid: '#6B6873',
  textMuted: '#8E8D94',
  textFaint: '#A3A1A8',
  border: '#ECEFEA',
  borderSubtle: '#E2E6E1',
  surface: '#FFFFFF',
  surfaceCream: '#FAF9F5',
  trackNeutral: '#C2CFC0',

  // Illustrations
  wood: '#D7A15C',
  woodDark: '#5C3F21',
  bark: '#8C6239',
  leaf: '#7A9B76',
} as const;

export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
} as const;

export const FONT = {
  regular: 'Inter',
  medium: 'InterMedium',
  bold: 'InterBold',
  headingBold: 'ManropeBold',
} as const;

export const BASELINES: Record<string, { totalVotes: number; tallies: Record<string, number> }> = {
  'play area': {
    totalVotes: 256,
    tallies: {
      'Yes, I support this': 200,
      'No, not needed right now': 38,
      "I'm not sure": 18,
    },
  },
  'parking charges': {
    totalVotes: 134,
    tallies: {
      Yes: 83,
      No: 51,
    },
  },
  'ro plants': {
    totalVotes: 98,
    tallies: {
      Yes: 54,
      No: 44,
    },
  },
};
