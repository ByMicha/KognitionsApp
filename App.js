import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import translations from './src/constants/translations';
import { lightTheme, darkTheme } from './src/constants/theme';
import MainMenu from './src/screens/MainMenu';

export default function App() {
  const { width } = useWindowDimensions();
  const [language, setLanguage] = useState('de');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sicherheit: Falls translations nicht geladen wurde
  if (!translations) {
    return (
      <View style={styles.centered}>
        <Text>Fehler: Sprachdatei konnte nicht geladen werden.</Text>
      </View>
    );
  }

  const t = translations[language];
  const theme = isDarkMode ? darkTheme : lightTheme;

  // Prüfung auf 10 Zoll (ca. 1024px Breite)
  const isLargeEnough = width >= 1024 || width === 0;

  if (!isLargeEnough) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}> 
        <Text style={[styles.errorText, { color: theme.text }]}>
          {t.deviceTooSmall}
          {"\n\n"}
          (Erkannte Breite: {width}px)
        </Text>
      </View>
    );
  }

  return (
    <MainMenu 
      t={t} 
      theme={theme} 
      language={language} 
      setLanguage={setLanguage} 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  }
});