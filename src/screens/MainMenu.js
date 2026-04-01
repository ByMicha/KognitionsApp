import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

// Sicherer Import für den Verlauf
let LinearGradient;
try {
  LinearGradient = require('expo-linear-gradient').LinearGradient;
} catch (e) {
  LinearGradient = View;
}

export default function MainMenu({ t, theme, language, setLanguage, isDarkMode, setIsDarkMode }) {
  const [showSettings, setShowSettings] = useState(false);
  
  const testKeys = ['moca', 'cowat', 'hvlt', 'zsTest', 'tmt', 'bells', 'qlqC30'];

  const testDetails = {
    moca: { icon: '🧠', time: '10 min' },
    cowat: { icon: '🗣️', time: '5 min' },
    hvlt: { icon: '📖', time: '8 min' },
    zsTest: { icon: '🔢', time: '5 min' },
    tmt: { icon: '✏️', time: '10 min' },
    bells: { icon: '🔔', time: '3 min' },
    qlqC30: { icon: '📝', time: '15 min' },
  };

  const handleTestPress = (testKey) => {
    console.log('Einzeltest ausgewählt:', testKey);
  };

  const handleBatteryPress = () => {
    console.log('Ganze Testbatterie gestartet');
  };

  if (showSettings) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text, marginTop: 40 }]}>{t.settings}</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>{t.language}:</Text>
          <TouchableOpacity 
            style={[styles.smallButton, { backgroundColor: theme.primary }]}
            onPress={() => setLanguage(language === 'de' ? 'en' : 'de')}
          >
            <Text style={styles.buttonText}>{language === 'de' ? 'Deutsch' : 'English'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>{t.theme}:</Text>
          <TouchableOpacity 
            style={[styles.smallButton, { backgroundColor: theme.primary }]}
            onPress={() => setIsDarkMode(!isDarkMode)}
          >
            <Text style={styles.buttonText}>{isDarkMode ? t.dark : t.light}</Text>
          </TouchableOpacity>
        </View>

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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Header Section */}
        <LinearGradient
          colors={isDarkMode ? [theme.background, theme.card] : [theme.headerGradientStart, theme.headerGradientEnd]}
          style={styles.header}
        >
          <Text style={[styles.welcome, { color: theme.text }]}>Willkommen im Dashboard</Text>
          <Text style={[styles.date, { color: theme.text }]}>Uni-Klinikum Heidelberg</Text>
          
          {/* Titel ohne Rahmen und größer */}
          <View style={styles.appTitleContainer}>
            <Text style={[styles.appTitle, { color: theme.text }]}>{t.appTitle}</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.batteryButton, { backgroundColor: theme.accent }]}
            onPress={handleBatteryPress}
          >
            <Text style={styles.batteryButtonText}>{t.startBattery}</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Liste der Tests - Schmaleres Layout */}
        <View style={styles.testsListSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {language === 'de' ? 'Einzelne Tests' : 'Individual Tests'}
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
  container: {
    flex: 1,
  },
  scrollContainer: {
    minHeight: '100%',
    paddingBottom: 50,
  },
  header: {
    padding: 30,
    paddingTop: 50,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
  },
  welcome: {
    fontSize: 22,
    fontWeight: '500',
    marginBottom: 5,
    opacity: 0.9,
  },
  date: {
    fontSize: 14,
    marginBottom: 30,
    opacity: 0.6,
  },
  appTitleContainer: {
    marginBottom: 35,
    paddingHorizontal: 20,
  },
  appTitle: {
    fontSize: 34, // Größerer Titel
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  batteryButton: {
    width: '75%', // Schmalerer Hauptbutton passend zum Rest
    padding: 22,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  batteryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  testsListSection: {
    padding: 20,
    alignItems: 'center', // Zentriert die schmaleren Buttons
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    alignSelf: 'center',
    width: '75%',
  },
  testCard: {
    width: '75%', // Maximal 75% der Breite
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    // Subtiler Schatten für den Card-Look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  testInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  testIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  testIconText: {
    fontSize: 22,
  },
  testTextContainer: {
    flex: 1,
  },
  testTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  testTime: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
    opacity: 0.8,
  },
  settingsLink: {
    marginTop: 20,
    marginBottom: 40,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '75%',
    marginBottom: 20,
    alignSelf: 'center',
  },
  settingLabel: {
    fontSize: 18,
  },
  smallButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    padding: 15,
    alignSelf: 'center',
  },
});