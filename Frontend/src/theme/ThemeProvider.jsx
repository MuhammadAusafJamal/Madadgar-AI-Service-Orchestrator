import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { lightColors, darkColors } from './colors';

export const SCHEME_OPTIONS = ['light', 'dark', 'system'];

const ThemeContext = createContext({
  scheme: 'light',          // resolved scheme actually in use: 'light' | 'dark'
  preference: 'system',     // user's choice: 'light' | 'dark' | 'system'
  dark: false,
  colors: lightColors,
  setScheme: () => {},
});

export function ThemeProvider({ children, initialPreference = 'system' }) {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [preference, setPreference] = useState(initialPreference);

  const scheme =
    preference === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : preference;

  const isDark = scheme === 'dark';

  const setScheme = useCallback((option) => {
    if (!SCHEME_OPTIONS.includes(option)) return;
    setPreference(option);
  }, []);

  const value = useMemo(
    () => ({
      scheme,
      preference,
      dark: isDark,
      colors: isDark ? darkColors : lightColors,
      setScheme,
    }),
    [scheme, preference, isDark, setScheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
