import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import translations from './src/constants/translations';
import { lightTheme, darkTheme } from './src/constants/theme';
import MainMenu from './src/screens/MainMenu';
import TMTScreen from './src/screens/TMTScreen';
import BellsScreen from './src/screens/BellsScreen';
import QLQC30Screen from './src/screens/QLQC30Screen';
import ZSTestScreen from './src/screens/ZSTestScreen.js';
import ResultsScreen from './src/screens/ResultsScreen';
import { ResultProvider } from './src/context/ResultContext';
import HVLTScreen from './src/screens/HVLTScreen.js';
import COWATScreen from './src/screens/COWATScreen.js';

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
            <Text style={[styles.errorText, { color: theme.text }]}>{t.deviceTooSmall}</Text>
          </View>
        ) : (
          <>
            {currentScreen === 'zsTest' && <ZSTestScreen t={t} theme={theme} onBack={() => setCurrentScreen('menu')} />}
            {currentScreen === 'tmt' && <TMTScreen t={t} theme={theme} onBack={() => setCurrentScreen('menu')} />}
            {currentScreen === 'bells' && <BellsScreen t={t} theme={theme} onBack={() => setCurrentScreen('menu')} />}
            {currentScreen === 'hvlt' && <HVLTScreen t={t} theme={theme} onBack={() => setCurrentScreen('menu')} />}
            {currentScreen === 'cowat' && <COWATScreen t={t} theme={theme} onBack={() => setCurrentScreen('menu')} />}
            {currentScreen === 'qlqC30' && <QLQC30Screen t={t} theme={theme} onBack={() => setCurrentScreen('menu')} />}
            {currentScreen === 'results' && <ResultsScreen t={t} theme={theme} onBack={() => setCurrentScreen('menu')} />}
            
            {currentScreen === 'menu' && (
              <MainMenu 
                t={t} theme={theme} language={language} setLanguage={setLanguage} 
                isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} 
                onStartTest={(testKey) => {
                  if (testKey === 'results') setCurrentScreen('results');
                  else setCurrentScreen(testKey);
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 18, textAlign: 'center' }
});