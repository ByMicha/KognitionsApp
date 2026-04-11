import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TARGET_SEQUENCE = [63, 56, 49, 42, 35];

export default function MocaCalculation({ theme, t, onComplete }) {
  const [isStarted, setIsStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState([]); // Speichert { value, isCorrect, reaction_time_ms, expected }
  const [options, setOptions] = useState([]);

  // NEU: Ref für die Zeitmessung pro Rechenschritt
  const lastStepTimeRef = useRef(null);

  // Generiert 4 Antwortmöglichkeiten (1 korrekte, 3 falsche)
  const generateOptions = (correctValue) => {
    let choices = [correctValue];
    while (choices.length < 4) {
      const offset = [1, -1, 10, -10, 2, -2][Math.floor(Math.random() * 6)];
      const distractor = correctValue + offset;
      if (!choices.includes(distractor) && distractor > 0) {
        choices.push(distractor);
      }
    }
    return choices.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    if (isStarted && currentIndex < TARGET_SEQUENCE.length) {
      setOptions(generateOptions(TARGET_SEQUENCE[currentIndex]));
      // Zeitmessung für den aktuellen Schritt starten
      lastStepTimeRef.current = Date.now();
    }
  }, [isStarted, currentIndex]);

  const handleSelection = (selected) => {
    const now = Date.now();
    const reactionTime = lastStepTimeRef.current ? now - lastStepTimeRef.current : 0;
    
    const expected = TARGET_SEQUENCE[currentIndex];
    const isCorrect = selected === expected;

    const stepResult = { 
      value: selected, // Für UI (res.value)
      chosen: selected, // Für JSON
      expected: expected,
      isCorrect: isCorrect, // Für UI (res.isCorrect)
      is_correct: isCorrect, // Für JSON
      reaction_time_ms: reactionTime 
    };

    const newResults = [...results, stepResult];
    setResults(newResults);

    if (currentIndex < TARGET_SEQUENCE.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Aufgabe beendet -> Strukturiertes Datenobjekt senden
      onComplete({
        steps: newResults.map(r => ({
          expected: r.expected,
          chosen: r.chosen,
          is_correct: r.is_correct,
          reaction_time_ms: r.reaction_time_ms
        })),
        final_sequence: newResults.map(r => r.chosen),
        timestamp_finished: new Date().toISOString()
      });
    }
  };

  if (!isStarted) {
    return (
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={{...styles.title, color: theme.primary}}>7. {t.moca.tests.attentionCalculation}</Text>
        </View>
        <View style={styles.explanationArea}>
          <MaterialCommunityIcons name="calculator-variant" size={80} color={theme.primary} />
          <Text style={{...styles.desc, color: theme.text}}>
            {t.moca.thisIsACalculationExercise}{"\n\n"}
            {t.moca.startWithNumber} <Text style={{fontWeight: 'bold'}}>70</Text> {t.moca.andSubtractContinuely} <Text style={{fontWeight: 'bold'}}>7</Text> {t.moca.calcExtendCommand}.{"\n\n"}
            {t.moca.chooseCorrectForEachStep}
          </Text>
          <TouchableOpacity 
            style={[styles.startBtn, { backgroundColor: theme.primary }]} 
            onPress={() => setIsStarted(true)}
          >
            <Text style={{...styles.startBtnText, color: theme.darkContrast}}>{t.moca.understoodStart}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={{...styles.title, color: theme.primary}}>7. {t.moca.tests.attentionCalculation}</Text>
        <Text style={{...styles.desc, color: theme.text}}>Rechnen Sie: {currentIndex === 0 ? "70" : TARGET_SEQUENCE[currentIndex - 1]} minus 7</Text>
      </View>

      <View style={styles.centerArea}>
        {/* Die 5 Blöcke oben */}
        <View style={styles.calcGrid}>
          {[0, 1, 2, 3, 4].map((i) => {
            const res = results[i];
            const isCurrent = currentIndex === i;
            return (
              <View 
                key={i} 
                style={[
                  styles.calcBox, 
                  isCurrent && { borderColor: theme.primary, borderWidth: 3 },
                  res && { 
                    backgroundColor: res.isCorrect ? '#f0fff4' : '#fff5f5', 
                    borderColor: res.isCorrect ? '#2ecc71' : '#ff4444' 
                  }
                ]}
              >
                <Text style={[styles.calcText, !res && { color: theme.primary }]}>
                  {res ? res.value : "?"}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Das Quiz-Feld */}
        {results.length < 5 && (
        <View style={styles.quizArea}>
          <View style={styles.optionsRow}>
            {options.map((opt, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={[styles.optionBtn, {backgroundColor: theme.accent ,borderColor: theme.primary }]} 
                onPress={() => handleSelection(opt)}
              >
                <Text style={[styles.optionText, { color: theme.primary }]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        )}         

        {results.length === 5 && (
          <View style={styles.successArea}>
            <MaterialCommunityIcons name="check-circle" size={30} color="#2ecc71" />
            <Text style={styles.successText}>{t.moca.taskDoneClickBelow}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  textContainer: { marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold' },
  desc: { fontSize: 16, color: '#444', marginTop: 10, textAlign: 'center', lineHeight: 24 },
  explanationArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  startBtn: { paddingVertical: 15, paddingHorizontal: 50, borderRadius: 12, marginTop: 20 },
  startBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  centerArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  calcGrid: { flexDirection: 'row', gap: 10, marginBottom: 50 },
  calcBox: { width: 65, height: 85, borderWidth: 2, borderColor: '#c4c4c4', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  calcText: { fontSize: 26, fontWeight: 'bold' },
  quizArea: { width: '100%', maxWidth: 400 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15 },
  optionBtn: { width: 150, paddingVertical: 20, borderWidth: 2, borderRadius: 15, alignItems: 'center', backgroundColor: '#fff' },
  optionText: { fontSize: 24, fontWeight: 'bold' },
  successArea: { marginTop: 40, flexDirection: 'row', alignItems: 'center', gap: 10 },
  successText: { color: '#2ecc71', fontWeight: 'bold', fontSize: 16 }
});