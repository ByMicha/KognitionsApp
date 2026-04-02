import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useResults } from '../context/ResultContext';

// Exakte Zahlenreihen aus dem PDF
const PRACTICE_TASKS = [6, 8, 3, 9, 5, 4, 1, 7, 2];

const TEST_TASKS = [
  1, 4, 8, 2, 7, 6, 9, 3, 5,
  8, 3, 1, 9, 2, 5, 6, 4, 3, 7, 2, 9, 8, 1, 4, 7, 6, 5,
  9, 1, 2, 4, 7, 2, 5, 6, 9, 5, 8, 6, 4, 3, 1, 7, 8, 3, 
  3, 9, 7, 5, 1, 4, 2, 8, 7, 2, 8, 5, 6, 4,             
  3, 2, 8, 1, 7, 9, 2, 5, 3, 4, 8, 6, 5, 9,          
  8, 1, 9, 5, 1, 4, 2, 6, 9, 8, 7, 3, 5, 6, 4, 7, 2, 3, 
  3, 6, 8, 9, 1, 8, 4, 7, 5, 2, 9, 6, 7, 1, 5, 2, 3, 4, 
  5, 7, 3, 6, 8, 3, 2, 7, 5, 8, 4, 2, 9, 1          
];

// Gesamtanzahl der Felder berechnen
const taskNumbers = [...PRACTICE_TASKS, ...TEST_TASKS];
const TOTAL_FIELDS = taskNumbers.length;

const TEST_DURATION = 300; // Standardmäßig 5 Minuten

// Festlegung der Symbole für die Zahlen 1-9
const legendData = [
  { num: 1, icon: 'minus' },
  { num: 2, icon: 'equal' },
  { num: 3, icon: 'chevron-up' },
  { num: 4, icon: 'chevron-down' },
  { num: 5, icon: 'square-outline' },
  { num: 6, icon: 'circle-outline' },
  { num: 7, icon: 'triangle-outline' },
  { num: 8, icon: 'slash-forward' },
  { num: 9, icon: 'percent' },
];

export default function ZSTestScreen({ t, theme, onBack }) {
  const { addResult } = useResults();
  const [testStarted, setTestStarted] = useState(false);
  const [isPracticePhase, setIsPracticePhase] = useState(true); // Neu: Steuerung der Übungsphase
  const [testFinished, setTestFinished] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState(Array(TOTAL_FIELDS).fill(null));
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const timerRef = useRef(null);

  useEffect(() => {
    // Timer startet nur, wenn der Test läuft und die Übungsphase beendet ist
    if (testStarted && !isPracticePhase && !testFinished && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !testFinished && testStarted) {
      handleFinish();
    }
    return () => clearInterval(timerRef.current);
  }, [testStarted, isPracticePhase, testFinished, timeLeft]);

  const handleSymbolPress = (iconName) => {
    if (testFinished || !testStarted) return;

    const newAnswers = [...userAnswers];
    newAnswers[activeIndex] = iconName;
    setUserAnswers(newAnswers);

    // Prüfen, ob das gerade ausgefüllte Feld das letzte Übungsfeld war
    if (isPracticePhase && activeIndex === PRACTICE_TASKS.length - 1) {
      const startMainTest = () => {
        setIsPracticePhase(false);
        setActiveIndex(activeIndex + 1);
      };

      if (Platform.OS === 'web') {
        window.alert("Übung beendet. Der Test startet jetzt!");
        startMainTest();
      } else {
        Alert.alert(
          "Übung beendet",
          "Der Test startet jetzt!",
          [{ text: "OK", onPress: startMainTest }]
        );
      }
      return;
    }

    if (activeIndex < TOTAL_FIELDS - 1) {
      setActiveIndex(activeIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    clearInterval(timerRef.current);
    setTestFinished(true);

    let correctCount = 0;
    userAnswers.forEach((ans, index) => {
      if (ans) {
        const correctIcon = legendData.find(l => l.num === taskNumbers[index]).icon;
        if (ans === correctIcon) correctCount++;
      }
    });

    const resultData = {
      correctCount,
      totalAttempted: userAnswers.filter(a => a !== null).length,
      timeTaken: TEST_DURATION - timeLeft,
      answers: userAnswers,
      tasks: taskNumbers
    };

    await addResult('zs_test', resultData, correctCount);

    const msg = Platform.OS === 'web' 
      ? `Test beendet. Score: ${correctCount}` 
      : `Score: ${correctCount}`;
    
    setTimeout(() => {
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert(t.zsTest.title, msg);
    }, 100);
  };

  if (!testStarted) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>{t.zsTest.title}</Text>
        <Text style={[styles.instruction, { color: theme.text }]}>{t.zsTest.instruction}</Text>
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: theme.primary }]} 
          onPress={() => setTestStarted(true)}
        >
          <Text style={styles.buttonText}>{t.zsTest.start}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={{ color: theme.primary, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text, flex: 1 }]}>{t.zsTest.title}</Text>
        <View style={[styles.timer, { backgroundColor: (timeLeft < 15 && !isPracticePhase) ? '#ff4444' : theme.card }]}>
          <Text style={{ color: (timeLeft < 15 && !isPracticePhase) ? '#fff' : theme.text, fontWeight: 'bold' }}>
            {isPracticePhase ? TEST_DURATION : timeLeft}s
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sheet}>
          {/* Legende */}
          <View style={styles.legendContainer}>
            {legendData.map((item) => (
              <View key={item.num} style={styles.legendItem}>
                <Text style={styles.legendNum}>{item.num}</Text>
                <View style={styles.legendIconBox}>
                  <MaterialCommunityIcons name={item.icon} size={24} color="#000" />
                </View>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Arbeitsbereich */}
          <Text style={styles.sectionLabel}>Beispiel / Übung</Text>
          <View style={styles.grid}>
            {taskNumbers.map((num, index) => {
              const isPractice = index < PRACTICE_TASKS.length;
              return (
                <View 
                  key={index} 
                  style={[
                    styles.taskBox, 
                    isPractice && styles.practiceBox,
                    activeIndex === index && !testFinished && styles.activeTaskBox
                  ]}
                >
                  <Text style={styles.taskNum}>{num}</Text>
                  <View style={styles.answerBox}>
                    {userAnswers[index] && (
                      <MaterialCommunityIcons name={userAnswers[index]} size={20} color="#000" />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Eingabe-Buttons */}
      <View style={[styles.keypad, { backgroundColor: theme.card }]}>
        <View style={styles.keypadRow}>
          {legendData.map((item) => (
            <TouchableOpacity 
              key={item.num} 
              style={[styles.keyButton, { borderColor: theme.primary }]}
              onPress={() => handleSymbolPress(item.icon)}
              disabled={testFinished}
            >
              <MaterialCommunityIcons name={item.icon} size={28} color={theme.text} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 20 },
  title: { fontSize: 24 },
  instruction: { textAlign: 'center', marginBottom: 40, fontSize: 16 },
  timer: { padding: 10, borderRadius: 8, minWidth: 60, alignItems: 'center' },
  scrollContent: { padding: 15, alignItems: 'center' },
  sheet: { 
    width: '100%', 
    maxWidth: 800, 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 5, 
    borderWidth: 1, 
    borderColor: '#ccc' 
  },
  legendContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  legendItem: { alignItems: 'center', width: '10%' },
  legendNum: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  legendIconBox: { borderWidth: 1, padding: 5, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  divider: { height: 2, backgroundColor: '#000', marginBottom: 20 },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, color: '#666' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  taskBox: { width: 45, height: 65, borderWidth: 1, margin: 2, alignItems: 'center' },
  practiceBox: { backgroundColor: '#f0f0f0' },
  activeTaskBox: { backgroundColor: '#e3f2fd', borderColor: '#2196f3', borderWidth: 2 },
  taskNum: { fontSize: 16, borderBottomWidth: 1, width: '100%', textAlign: 'center', paddingVertical: 2 },
  answerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  keypad: { padding: 20, borderTopWidth: 1, borderTopColor: '#eee', alignItems: "center" },
  keypadRow: { flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap', width: "70%", minWidth: 1000 },
  keyButton: { width: 55, height: 55, borderWidth: 1, borderRadius: 10, justifyContent: 'center', alignItems: 'center', margin: 5 },
  primaryButton: { paddingVertical: 15, paddingHorizontal: 40, borderRadius: 12 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});