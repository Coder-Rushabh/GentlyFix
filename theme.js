import { useColorScheme } from 'react-native';

// Brand: black wordmark + cyan accent (see assets/1.png).
const light = {
  bg: '#F4F9FA', surface: '#FFFFFF', text: '#0B1B21', textMuted: '#5B6B72', border: '#E1EBEE',
  primary: '#0891A6', onPrimary: '#FFFFFF', tint: '#E0F6F9', danger: '#C62828', star: '#F5A623',
};
const dark = {
  bg: '#0A1316', surface: '#121F24', text: '#E8F3F6', textMuted: '#93A7AE', border: '#1E3138',
  primary: '#3CD0E0', onPrimary: '#04242A', tint: '#183037', danger: '#EF5350', star: '#F5B342',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const radius = { sm: 8, md: 14, lg: 20, pill: 999 };

export function useTheme() {
  const isDark = useColorScheme() === 'dark';
  return { colors: isDark ? dark : light, isDark };
}
