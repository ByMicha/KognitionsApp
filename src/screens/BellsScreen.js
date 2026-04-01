import React, { useState, useMemo, useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useResults } from '../context/ResultContext';

// --- KONSTANTEN ---
const TOTAL_BELLS = 35;
const COLUMNS_COUNT = 7;
const BELLS_PER_COLUMN = 5; 
const TEST_DURATION = 300; // 5 Minuten

const generateBellsData = () => {
  const symbols = [];
  const distractors = ['home', 'tree', 'bird', 'apple', 'car'];
  
  // Wir erstellen ein Raster von 20 Zeilen und 18 Spalten (~360 Plätze)
  // Das verhindert das Überlappen, sieht aber trotzdem unordentlich aus.
  const rows = 20;
  const cols = 18;
  const grid = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid.push({ r, c });
    }
  }

  // Plätze zufällig mischen
  grid.sort(() => Math.random() - 0.5);

  // 1. Die 35 Glocken in den richtigen Spalten-Bereichen platzieren
  // Wir unterteilen die 18 Spalten in 7 Zonen (ca. 2.5 Spalten pro Zone)
  let bellCount = 0;
  const bellSlots = [];

  for (let zone = 0; zone < COLUMNS_COUNT; zone++) {
    let bellsInZone = 0;
    const startCol = Math.floor(zone * (cols / COLUMNS_COUNT));
    const endCol = Math.floor((zone + 1) * (cols / COLUMNS_COUNT));

    for (let i = 0; i < grid.length && bellsInZone < BELLS_PER_COLUMN; i++) {
      const slot = grid[i];
      if (!slot.occupied && slot.c >= startCol && slot.c < endCol) {
        slot.occupied = true;
        slot.isTarget = true;
        slot.zone = zone;
        bellsInZone++;
        bellSlots.push(slot);
      }
    }
  }

  // 2. Den Rest mit Distraktoren auffüllen
  grid.forEach(slot => {
    if (!slot.occupied) {
      slot.isTarget = false;
      slot.occupied = true;
    }

    // Koordinaten berechnen mit "Jitter" (zufälliger Versatz)
    // Damit es nicht nach einem perfekten Gitter aussieht
    const xBase = (slot.c * (100 / cols));
    const yBase = (slot.r * (100 / rows));
    
    // Zufälliger Versatz innerhalb der Zelle (max 70% der Zellgröße)
    const xJitter = (Math.random() - 0.5) * (100 / cols) * 0.9;
    const yJitter = (Math.random() - 0.5) * (100 / rows) * 0.9;

    symbols.push({
      id: `s-${slot.r}-${slot.c}`,
      iconName: slot.isTarget ? 'bell' : distractors[Math.floor(Math.random() * distractors.length)],
      isTarget: slot.isTarget,
      x: Math.max(3, Math.min(97, xBase + (100 / cols / 2) + xJitter)),
      y: Math.max(3, Math.min(97, yBase + (100 / rows / 2) + yJitter)),
      selected: false,
      column: slot.zone // Nur für Glocken definiert
    });
  });

  return symbols;
};

export default function BellsScreen({ t, theme, onBack }) {
  const { addResult } = useResults();
  
  const [testStarted, setTestStarted] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [symbols, setSymbols] = useState(useMemo(() => generateBellsData(), []));
  const [clickSequence, setClickSequence] = useState([]);
  
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const timerRef = useRef(null);

  useEffect(() => {
    if (testStarted && !testFinished && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(p => p - 1), 1000);
    } else if (timeLeft === 0 && !testFinished) {
      handleFinish();
    }
    return () => clearInterval(timerRef.current);
  }, [testStarted, testFinished, timeLeft]);

  const toggleSymbol = (id) => {
    if (testFinished) return;
    setSymbols(prev => prev.map(s => {
      if (s.id === id) {
        if (!s.selected) {
          setClickSequence(ps => [...ps, { id: s.id, time: TEST_DURATION - timeLeft }]);
        }
        return { ...s, selected: !s.selected };
      }
      return s;
    }));
  };

  const handleFinish = async () => {
    clearInterval(timerRef.current);
    setTestFinished(true);

    const correctBells = symbols.filter(s => s.isTarget && s.selected).length;
    const timeTaken = TEST_DURATION - timeLeft;
    const leftOmissions = symbols.filter(s => s.isTarget && !s.selected && s.x < 50).length;
    const rightOmissions = symbols.filter(s => s.isTarget && !s.selected && s.x >= 50).length;

    const columnStats = {};
    for (let i = 0; i < COLUMNS_COUNT; i++) {
      columnStats[`col_${i}`] = symbols.filter(s => s.column === i && s.selected).length;
    }

    const finalData = {
      totalScore: correctBells,
      timeSeconds: timeTaken,
      leftOmissions,
      rightOmissions,
      columnStats,
      hasUSN: leftOmissions >= 6 || rightOmissions >= 6
    };

    await addResult('bells_test', finalData, correctBells);

    if (Platform.OS === 'web') {
      window.alert(`Test beendet.\nScore: ${correctBells}/35\nZeit: ${timeTaken}s`);
    } else {
      Alert.alert("Ergebnis", `Score: ${correctBells}/35\nZeit: ${timeTaken}s`);
    }
  };

  if (!testStarted) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <MaterialCommunityIcons name={'bell'} size={34} color={"black"} />
        <Text style={[styles.title, { color: theme.text, marginBottom: 20 }]}>{t.bells.title}</Text>
        <Text style={{ color: theme.text, textAlign: 'center', marginBottom: 40, paddingHorizontal: 30 }}>
            Suchen und markieren Sie alle Glocken. Sie haben 5 Minuten Zeit.
        </Text>
        <TouchableOpacity style={[styles.doneButton, { backgroundColor: theme.primary }]} onPress={() => setTestStarted(true)}>
          <Text style={styles.doneButtonText}>Test Starten</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 18 }}>←</Text></TouchableOpacity>
        <Text style={[styles.title, { color: theme.text, flex: 1 }]}>{t.bells.title}</Text>
        <View style={[styles.timerContainer, { backgroundColor: timeLeft < 30 ? '#ff4444' : theme.card }]}>
          <Text style={{ color: timeLeft < 30 ? 'white' : theme.text, fontWeight: 'bold' }}>{Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}</Text>
        </View>
      </View>

      <View style={styles.boardContainer}>
        <View style={styles.board}>
          {symbols.map((symbol) => {
            let iconColor = "#000";
            let markerColor = "red";
            if (testFinished) {
              if (symbol.isTarget && symbol.selected) { markerColor = "#2ecc71"; iconColor = "#2ecc71"; }
              else if (!symbol.isTarget && symbol.selected) { markerColor = theme.accent; iconColor = theme.accent; }
              else if (symbol.isTarget && !symbol.selected) { markerColor = theme.primary; iconColor = theme.primary; }
            }

            return (
              <TouchableOpacity
                key={symbol.id}
                onPress={() => toggleSymbol(symbol.id)}
                style={[styles.symbolWrapper, { left: `${symbol.x}%`, top: `${symbol.y}%` }]}
              >
                <MaterialCommunityIcons name={symbol.iconName} size={22} color={iconColor} />
                {(symbol.selected || (testFinished && symbol.isTarget)) && (
                  <View style={[styles.redCircle, { borderColor: markerColor, borderWidth: testFinished && symbol.isTarget && !symbol.selected ? 1 : 3 }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.doneButton, { backgroundColor: theme.primary }]}
          onPress={testFinished ? onBack : handleFinish}
        >
          <Text style={styles.doneButtonText}>{testFinished ? "Speichern & Menü" : t.bells.done}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  timerContainer: { padding: 10, borderRadius: 8 },
  boardContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10 },
  board: {
    width: '100%', maxWidth: 800, aspectRatio: 0.75,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc',
    position: 'relative', elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12,
  },
  symbolWrapper: {
    position: 'absolute', width: 30, height: 30,
    justifyContent: 'center', alignItems: 'center',
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  redCircle: {
    position: 'absolute', width: 30, height: 30,
    borderRadius: 15, backgroundColor: 'transparent',
  },
  footer: { padding: 20, alignItems: 'center' },
  doneButton: { paddingVertical: 14, paddingHorizontal: 60, borderRadius: 15 },
  doneButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});