export interface ThemeColors {
  background: string;
  surface: string;
  surfaceLight: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentOrange: string;
  accentPurple: string;
  accentCyan: string;
  accentYellow: string;
  tabBar: string;
  tabActive: string;
  tabInactive: string;
}

export const darkTheme: ThemeColors = {
  background: '#0A0A0F',
  surface: '#16161E',
  surfaceLight: '#1E1E2A',
  card: '#1A1A25',
  cardBorder: '#2A2A38',
  text: '#FFFFFF',
  textSecondary: '#8A8A9A',
  textMuted: '#5A5A6A',
  accent: '#FF3B7F',
  accentOrange: '#FF8C42',
  accentPurple: '#7B61FF',
  accentCyan: '#00E5C3',
  accentYellow: '#FFD600',
  tabBar: '#111118',
  tabActive: '#FF3B7F',
  tabInactive: '#5A5A6A',
};

export const lightTheme: ThemeColors = {
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceLight: '#E8E8ED',
  card: '#FFFFFF',
  cardBorder: '#D1D1D6',
  text: '#1C1C1E',
  textSecondary: '#636366',
  textMuted: '#AEAEB2',
  accent: '#FF3B7F',
  accentOrange: '#FF8C42',
  accentPurple: '#7B61FF',
  accentCyan: '#00B89C',
  accentYellow: '#F5A623',
  tabBar: '#FFFFFF',
  tabActive: '#FF3B7F',
  tabInactive: '#AEAEB2',
};

const Colors = {
  ...darkTheme,
  light: {
    text: '#FFFFFF',
    background: '#0A0A0F',
    tint: '#FF3B7F',
    tabIconDefault: '#5A5A6A',
    tabIconSelected: '#FF3B7F',
  },
};

export default Colors;
