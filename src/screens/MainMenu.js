import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useResults } from '../context/ResultContext';

let LinearGradient;
try {
  LinearGradient = require('expo-linear-gradient').LinearGradient;
} catch (e) {
  LinearGradient = View;
}

export default function MainMenu({ t, theme, language, setLanguage, isDarkMode, setIsDarkMode, onStartTest }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showResultsList, setShowResultsList] = useState(false);
  const { results } = useResults();

  const testKeys = ['moca', 'cowat', 'hvlt', 'zsTest', 'tmt', 'bells', 'qlqC30'];

  const testDetails = {
    moca: { icon: '🧠', time: '20 min' },
    cowat: { icon: '🗣️', time: '3 min' },
    hvlt: { icon: '📖', time: '5 min' },
    zsTest: { icon: '🔢', time: '5 min' },
    tmt: { icon: '✏️', time: '10 min' },
    bells: { icon: '🔔', time: '5 min' },
    qlqC30: { icon: '📝', time: '15 min' },
  };

  const handleTestPress = (testKey) => {
    if (onStartTest) {
      onStartTest(testKey);
    }
  };

  if (showResultsList) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, alignItems: "center" }]}>
        <Text style={[styles.titleLabel, { color: theme.text, marginTop: 40 }]}>{t.savedResults}</Text>
        <ScrollView style={{ width: '75%', marginBottom: 20 }}>
          {results.length === 0 ? (
            <Text style={{ color: theme.text, textAlign: 'center' }}>{t.noEntriesYet}</Text>
          ) : (
            results.map((res, index) => (
              <View key={index} style={[styles.testCard, { backgroundColor: theme.card, borderColor: theme.border, width: '100%' }]}>
                <Text style={{ color: theme.text, fontWeight: 'bold' }}>Test: {res.testId}</Text>
                <Text style={{ color: theme.text }}> Datum: {new Date(res.timestamp).toLocaleString()}</Text>
                <Text style={{ color: theme.primary }}> Ergebnis: {res.score}</Text>
              </View>
            ))
          )}
        </ScrollView>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setShowResultsList(false)}
        >
          <Text style={{ color: theme.primary, fontSize: 18, fontWeight: '600' }}>{t.backToMenu}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showSettings) {
    return (
      <View style={[styles.container, { backgroundColor: "transparent" }]}>
        <Text style={[styles.titleLabel, { color: theme.text, marginTop: 40 }]}>{t.settings}</Text>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>{t.language}:</Text>
          <TouchableOpacity 
            style={[styles.smallButton, { backgroundColor: theme.primary }]}
            onPress={() => setLanguage(language === 'de' ? 'en' : 'de')}
          >
            <Text style={{...styles.buttonText, color: theme.darkContrast}}>{language === 'de' ? 'Deutsch' : 'English'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>{t.theme}:</Text>
          <TouchableOpacity 
            style={[styles.smallButton, { backgroundColor: theme.primary }]}
            onPress={() => setIsDarkMode(!isDarkMode)}
          >
            <Text style={{...styles.buttonText, color: theme.darkContrast}}>{isDarkMode ? t.dark : t.light}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.smallButton, { backgroundColor: "transparent", borderColor: theme.primary, borderWidth: 3, alignSelf: 'center', marginTop: 20, width: '75%', maxWidth: 400 }]}
          onPress={() => onStartTest('results')} // Ruft jetzt den neuen Screen über App.js auf
        >
          <Text style={{ color: theme.primary, fontSize: 18, fontWeight: '600' }}>{t.resultsAndDatabase}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.backButton, { marginTop: 40 }]}
          onPress={() => setShowSettings(false)}
        >
          <Text style={{ color: theme.primary, fontSize: 18, fontWeight: '600' }}>
            {t.backToMenu}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (

      <View style={styles.container}>
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <LinearGradient
          colors={[theme.headerGradientStart, theme.headerGradientEnd]}
          style={styles.header}
        >
          <Text style={[styles.welcome, { color: theme.background }]}>{t.welcomeDashboard}</Text>
          <View style={styles.appTitleContainer}>
            <Text style={[styles.appTitle, { color: theme.accent }]}>{t.appTitle}</Text>
          </View>
        </LinearGradient>

        <View style={styles.testsListSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {language === 'de' ? 'Testbatterie' : 'Test battery'}
          </Text>
          {testKeys.map((key) => (
            <TouchableOpacity 
              key={key}
              style={[styles.testCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => handleTestPress(key)}
            >
              <View style={styles.testInfo}>
                <View style={[styles.testIconContainer, { backgroundColor: isDarkMode ? '#2A3C5F' : '#F0F3FA' }]}>
                  <Text style={styles.testIconText}>{testDetails[key]?.icon || '📋'}</Text>
                </View>
                <View style={styles.testTextContainer}>
                  <Text style={[styles.testTitle, { color: theme.text }]}>
                    {t.tests[key]}
                  </Text>
                  <Text style={[styles.testTime, { color: theme.primary }]}>
                    {testDetails[key]?.time || '-- min'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.settingsLink}
          onPress={() => setShowSettings(true)}
        >
          <Text style={{ color: theme.primary, fontSize: 16 }}>{t.settings}</Text>
        </TouchableOpacity>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { minHeight: '100%', paddingBottom: 50 },
  header: {
    padding: 30,
    paddingTop: 50,
    paddingBottom: 40,
    minHeight: 250,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 13 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  welcome: { fontSize: 24, fontWeight: '500', marginBottom: 10, opacity: 0.9 },
  date: { fontSize: 14, marginBottom: 30, opacity: 0.6 },
  appTitleContainer: { marginBottom: 35, paddingHorizontal: 20 },
  appTitle: { fontSize: 50, fontWeight: '900', textAlign: 'center', letterSpacing: -0.5 },
  batteryButton: { width: '75%', padding: 22, borderRadius: 18, alignItems: 'center' },
  batteryButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  testsListSection: { padding: 20, alignItems: 'center', paddingTop: 50 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 20, alignSelf: 'center', width: '75%' },
  testCard: { width: '75%', padding: 16, borderRadius: 20, marginBottom: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12 },
  testInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  testIconContainer: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  testIconText: { fontSize: 22 },
  testTextContainer: { flex: 1 },
  testTitle: { fontSize: 15, fontWeight: '700' },
  testTime: { fontSize: 12, fontWeight: '600', marginTop: 3, opacity: 0.8 },
  settingsLink: { marginTop: 20, marginBottom: 40, alignSelf: 'center' },
  titleLabel: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '75%', marginBottom: 20, alignSelf: 'center' },
  settingLabel: { fontSize: 18 },
  smallButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, minWidth: 120, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  backButton: { padding: 15, alignSelf: 'center' }
});