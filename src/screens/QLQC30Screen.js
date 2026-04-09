import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useResults } from '../context/ResultContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ExplanationModal from '../components/ExplanationModal';

export default function QLQC30Screen({ t, theme, onBack }) {
  const { addResult } = useResults();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});

  const [showExplanation, setShowExplanation] = useState(true);
  const [testStarted, setTestStarted] = useState(false);

  // Definition der Fragengruppen basierend auf deinem Wunsch
  const groups = [
    { id: 1, range: [1, 5], type: 'standard' },
    { id: 2, range: [6, 16], type: 'standard' },
    { id: 3, range: [17, 28], type: 'standard' },
    { id: 4, range: [29, 30], type: 'overall' }
  ];

  const currentGroup = groups.find(g => g.id === step);

  const handleSelect = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const isStepComplete = () => {
    const [start, end] = currentGroup.range;
    for (let i = start; i <= end; i++) {
      if (answers[`q${i}`] === undefined) return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Wenn alle Schritte durchlaufen sind, speichern wir
      const finalResultData = {
        responses: answers, // Enthält alle Antworten q1 bis q30
        metadata: {
          testName: "EORTC QLQ-C30",
          version: "3.0",
          language: "de",
          questionCount: 30
        }
      };

      // Speichern im ResultContext (unserer zentralen Ablage)
      // Wir übergeben als 'score' die Anzahl der beantworteten Fragen (30)
      const success = await addResult('qlq_c30', finalResultData, 30);
      
      if (success) {
        onBack(); // Zurück zum Hauptmenü
      }
    }
  };

  const renderStandardQuestion = (qNumber) => {
    const qKey = `q${qNumber}`;
    const questionText = t.qlq.questions[qKey];
    
    return (
      <View key={qKey} style={[styles.questionRow, { borderColor: theme.border }]}>
        <View style={styles.textColumn}>
          <Text style={[styles.questionText, { color: theme.text }]}>
            {qNumber}. {questionText}
          </Text>
        </View>
        <View style={styles.standardOptionsColumn}>
          {[1, 2, 3, 4].map((val) => {
            const isSelected = answers[qKey] === val;
            return (
              <TouchableOpacity
                key={val}
                style={[
                  styles.numButton,
                  { borderColor: theme.primary },
                  isSelected && { backgroundColor: theme.primary },
                ]}
                onPress={() => handleSelect(qKey, val)}
              >
                <Text style={[styles.numButtonLabel, { color: isSelected ? '#fff' : theme.text }]}>
                  {val}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderOverallQuestion = (qNumber) => {
    const qKey = `q${qNumber}`;
    const questionText = t.qlq.questions[qKey];
    const optionsOverall = t.qlq.scales.overall;

    return (
      <View key={qKey} style={[styles.overallQuestionBox, { borderColor: theme.border }]}>
        <Text style={[styles.overallQuestionText, { color: theme.text }]}>
          {qNumber}. {questionText}
        </Text>
        <View style={styles.overallScaleRow}>
          {optionsOverall.map((option, index) => {
            const val = index + 1;
            const isSelected = answers[qKey] === val;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.scaleButton,
                  { borderColor: theme.primary },
                  isSelected && { backgroundColor: theme.primary }
                ]}
                onPress={() => handleSelect(qKey, val)}
              >
                <Text style={[styles.scaleLabel, { color: isSelected ? '#fff' : theme.text }]}>
                  {val}
                </Text>
                {(index === 0 || index === 6) && (
                  <Text style={[styles.extremeLabel, { color: theme.text }]}>{option}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const questionElements = [];
  const [start, end] = currentGroup.range;
  for (let i = start; i <= end; i++) {
    if (currentGroup.type === 'standard') questionElements.push(renderStandardQuestion(i));
    else questionElements.push(renderOverallQuestion(i));
  }

  // Überschriften für Standardfragen (wie im Papier-Fragebogen)
  const renderStandardHeader = () => (
    <View style={styles.standardHeaderRow}>
      <View style={styles.textColumn}></View>
      <View style={styles.standardOptionsColumn}>
        {t.qlq.scales.standard.map((label, idx) => (
          <Text key={idx} style={[styles.headerLabel, { color: theme.text }]}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: "transparent" }]}>

      <ExplanationModal 
        visible={showExplanation} 
        onClose={() => {
          setShowExplanation(false);
          setTestStarted(true);
        }} 
        testKey="qlq"
        theme={theme}
        isRunning={testStarted}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={{ color: theme.primary, fontWeight: 'bold' }}>← Zurück</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>{t.qlq.title}</Text>

        <TouchableOpacity style={{position: 'absolute', right: 0}} onPress={() => setShowExplanation(true)}>
          <MaterialCommunityIcons name="help-circle-outline" size={28} color={theme.primary} />
        </TouchableOpacity>

      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentConstrained}>
          <Text style={[styles.introText, { color: theme.text }]}>{t.qlq.intro}</Text>
          
          {currentGroup.type === 'standard' && renderStandardHeader()}
          
          {questionElements}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerConstrained}>
          <TouchableOpacity
            disabled={!isStepComplete()}
            style={[
              styles.nextButton,
              { backgroundColor: isStepComplete() ? theme.primary : '#ccc' }
            ]}
            onPress={handleNext}
          >
            <Text style={styles.nextText}>
              {step === 4 ? t.qlq.finish : t.qlq.next}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: {
    marginRight: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingVertical: 20,
  },
  // WICHTIG: Begrenzt die Breite des Inhalts
  contentConstrained: {
    alignSelf: 'center',
    width: '90%',
    maxWidth: 900, // Maximale Breite zentriert
    paddingHorizontal: 20,
  },
  introText: {
    marginBottom: 30,
    fontStyle: 'italic',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  // Layout für Side-by-Side Standardfragen (1-28)
  standardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  headerLabel: {
    flex: 1,
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '700',
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  textColumn: {
    flex: 1.5, // Mehr Platz für den Fragetext
    paddingRight: 20,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 22,
  },
  standardOptionsColumn: {
    flex: 1, // Platz für die Buttons
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  numButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 18, // Rund wie im Original
    alignItems: 'center',
    justifyContent: 'center',
  },
  numButtonLabel: {
    fontWeight: '700',
    fontSize: 16,
  },
  // Layout für Overall Fragen (29-30)
  overallQuestionBox: {
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 15,
  },
  overallQuestionText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  overallScaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 25, // Platz für extremeLabel
    marginTop: 10,
  },
  scaleButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scaleLabel: {
    fontWeight: '700',
    fontSize: 16,
  },
  extremeLabel: {
    fontSize: 11,
    position: 'absolute',
    bottom: -25, // Versetzt nach unten
    width: 80,
    textAlign: 'center',
  },
  // Footer mit Breitenbeschränkung
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerConstrained: {
    alignSelf: 'center',
    width: '90%',
    maxWidth: 900,
  },
  nextButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  }
});