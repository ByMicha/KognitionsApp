import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MocaTrails from './moca/MocaTrails';
import MocaClock from './moca/MocaClock';
import MocaNaming from './moca/MocaNaming';
import MocaMemory from './moca/MocaMemory';
import MocaDigits from './moca/MocaDigits';
import MocaVigilance from './moca/MocaVigilance';
import MocaCalculation from './moca/MocaCalculation';
import MocaLanguage from './moca/MocaLanguage';
import MocaWordFluency from './moca/MocaWordFluency';
import MocaRecall from './moca/MocaRecall';
import { saveTestResult } from '../utils/resultStorage';

export default function MoCAScreen({ t, theme, onBack }) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [isNextDisabled, setIsNextDisabled] = useState(true);

  // Das zentrale Speicherobjekt für deine Masterarbeit
  const [mocaData, setMocaData] = useState({
    metadata: {
      startTime: new Date().toISOString(),
      userId: "ID_PLACEHOLDER" 
    },
    scenarios: {}
  });

  const totalPhases = 10;
  const progress = ((currentPhase + 1) / totalPhases) * 100;

  // Diese Funktion nimmt die Daten der Szenarien entgegen und speichert sie zentral
  const updateScenarioData = (key, data) => {
    setMocaData(prev => ({
      ...prev,
      scenarios: {
        ...prev.scenarios,
        [key]: data
      }
    }));
    setIsNextDisabled(false); // Schaltet den "Nächster Test" Button frei
  };

  const handleNext = async () => {
    if (currentPhase < totalPhases - 1) {
      setCurrentPhase(prev => prev + 1);
      setIsNextDisabled(true);
    } else {
      // Speichern in der Datenbank
      await saveTestResult({
        testId: 'moca_test',
        score: "-",
        data: mocaData
      });

      onBack();
    }
  };

  const renderPhase = () => {
    switch (currentPhase) {
      case 0:
        return (
          <MocaTrails 
            theme={theme} 
            onComplete={(data) => updateScenarioData('01_trails', data)} 
          />
        );
      case 1:
        return (
          <MocaClock 
            theme={theme} 
            onComplete={(data) => updateScenarioData('02_clock', data)} 
          />
        );
      case 2:
        return (
          <MocaNaming 
            theme={theme} 
            onComplete={(data) => updateScenarioData('03_naming', data)} 
          />
        );
      case 3:
        return (
          <MocaMemory 
            theme={theme} 
            onComplete={(data) => updateScenarioData('04_memory_immediate', data)} 
          />
        );
      case 4:
        return (
          <MocaDigits 
            theme={theme} 
            onComplete={(data) => updateScenarioData('05_digits', data)} 
          />
        );
      case 5:
        return (
          <MocaVigilance 
            theme={theme} 
            onComplete={(data) => updateScenarioData('06_vigilance', data)} 
          />
        );
      case 6:
        return (
          <MocaCalculation 
            theme={theme} 
            onComplete={(data) => updateScenarioData('07_calculation', data)} 
          />
        );
      case 7:
        return (
          <MocaLanguage 
            theme={theme} 
            onComplete={(data) => updateScenarioData('08_language', data)} 
          />
        );
      case 8:
        return (
          <MocaWordFluency 
            theme={theme} 
            onComplete={(data) => updateScenarioData('09_word_fluency', data)} 
          />
        );
      case 9:
        return (
          <MocaRecall 
            theme={theme} 
            // Hier übergeben wir zusätzlich die Referenzdaten aus Aufgabe 4 für den Vergleich im JSON
            onComplete={(data) => updateScenarioData('10_delayed_recall', {
              ...data,
              reference_task_04: mocaData.scenarios['04_memory_immediate']?.found_words || []
            })} 
          />
        );
      default: return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: "transparent" }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={{ color: theme.primary, fontSize: 18, fontWeight: 'bold' }}>← Abbruch</Text>
        </TouchableOpacity>
        <View style={styles.progressWrapper}>
          <Text style={styles.progressText}>MoCA Fortschritt: {currentPhase + 1} / {totalPhases}</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: progress + '%', backgroundColor: theme.primary }]} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.sheet, { backgroundColor: '#fff', borderColor: theme.border }]}>
          <View style={styles.contentArea}>{renderPhase()}</View>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.nextBtn, { backgroundColor: isNextDisabled ? '#eee' : theme.primary }]} 
              onPress={handleNext}
              disabled={isNextDisabled}
            >
              <Text style={[styles.nextBtnText, { color: isNextDisabled ? '#aaa' : '#fff' }]}>
                {currentPhase === totalPhases - 1 ? "Test beenden" : "Nächster Test"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 0, borderBottomColor: '#eee' },
  backBtn: { marginRight: 20 },
  progressWrapper: { flex: 1 },
  progressText: { fontSize: 12, color: '#888', marginBottom: 4 },
  progressBarBg: { height: 8, backgroundColor: 'white', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  scrollContent: { padding: 20, alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  sheet: { width: '100%', maxWidth: 850, minHeight: 800, aspectRatio: 0.75, borderRadius: 15, borderWidth: 1, padding: 30, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, justifyContent: 'space-between' },
  contentArea: { flex: 1, width: '100%' },
  footer: { marginTop: 20, alignItems: 'center' },
  nextBtn: { paddingVertical: 15, paddingHorizontal: 60, borderRadius: 12 },
  nextBtnText: { fontWeight: 'bold', fontSize: 18 }
});