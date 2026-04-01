import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import translations from './src/constants/translations';
import { lightTheme, darkTheme } from './src/constants/theme';
import MainMenu from './src/screens/MainMenu';
import TMTScreen from './src/screens/TMTScreen';
import BellsScreen from './src/screens/BellsScreen';
import { ResultProvider } from './src/context/ResultContext';

export default function App() {
  const { width } = useWindowDimensions();
  const [language, setLanguage] = useState('de');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('menu');

  if (!translations) return null;
  const t = translations[language];
  const theme = isDarkMode ? darkTheme : lightTheme;

  const isLargeEnough = width >= 1024 || width === 0;

  return (
    <ResultProvider>
      <View style={{ flex: 1 }}>
        {!isLargeEnough ? (
          <View style={[styles.centered, { backgroundColor: theme.background }]}> 
            <Text style={[styles.errorText, { color: theme.text }]}>
              {t.deviceTooSmall}
            </Text>
          </View>
        ) : (
          <>
            {currentScreen === 'tmt' ? (
              <TMTScreen 
                t={t} 
                theme={theme} 
                onBack={() => setCurrentScreen('menu')} 
              />
            ) : currentScreen === 'bells' ? (
              <BellsScreen 
                t={t} 
                theme={theme} 
                onBack={() => setCurrentScreen('menu')} 
              />
            ) : (
              <MainMenu 
                t={t} 
                theme={theme} 
                language={language} 
                setLanguage={setLanguage} 
                isDarkMode={isDarkMode} 
                setIsDarkMode={setIsDarkMode} 
                onStartTest={(testKey) => {
                  if (testKey === 'tmt') {
                    setCurrentScreen('tmt');
                  } else if (testKey === 'bells') {
                    setCurrentScreen('bells');
                  }
                }}
              />
            )}
          </>
        )}
      </View>
    </ResultProvider>
  );
}

const styles = StyleSheet.create({
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  errorText: { 
    fontSize: 18, 
    textAlign: 'center' 
  }
});