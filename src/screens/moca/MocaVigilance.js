import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TEST_SEQUENCE = ["F", "A", "B", "A", "K"];

export default function MocaVigilance({ theme, onComplete }) {
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [activeLetter, setActiveLetter] = useState(null);

  const hitIndicesRef = useRef(new Set());
  const falseAlarmsRef = useRef(0);
  const currentIdxRef = useRef(-1);
  const activeLetterRef = useRef(null);

  const startTask = async () => {
    setIsStarted(true);
    
    for (let i = 0; i < TEST_SEQUENCE.length; i++) {
      const letter = TEST_SEQUENCE[i];
      const index = i;

      // Wir warten darauf, dass der Buchstabe tatsächlich gesprochen wird
      await new Promise((resolve) => {
        Speech.speak(letter, {
          language: 'de-DE',
          rate: 0.8,
          onStart: () => {
            // Das Treffer-Fenster öffnet sich erst hier (beim Ton-Start)
            currentIdxRef.current = index;
            activeLetterRef.current = letter;
            setActiveLetter(letter);

            // Fenster für 1,2 Sekunden offen halten NACHDEM der Ton startete
            setTimeout(() => {
              activeLetterRef.current = null;
              setActiveLetter(null);
              resolve();
            }, 1200);
          },
          onError: () => resolve() // Fallback bei Fehlern
        });
      });
    }

    const totalTargets = TEST_SEQUENCE.filter(l => l === "A").length;
    const finalHits = hitIndicesRef.current.size;

    setIsFinished(true);

    onComplete({
      hits: finalHits,
      omissions: totalTargets - finalHits,
      false_alarms: falseAlarmsRef.current,
      timestamp_finished: new Date().toISOString()
    });
  };

  const handleTap = () => {
    // Taps werden nun präzise gegen den aktuell hörbaren Buchstaben geprüft
    if (activeLetterRef.current === "A") {
      hitIndicesRef.current.add(currentIdxRef.current);
    } else if (activeLetterRef.current !== null) {
      falseAlarmsRef.current += 1;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>6. Aufmerksamkeit (Vigilanz)</Text>
      </View>

      {!isStarted ? (
        <View style={styles.explanationArea}>
          <Text style={styles.desc}>
            Tippen Sie auf den Button, wenn Sie den Buchstaben <Text style={{fontWeight: 'bold'}}>A</Text> hören.
          </Text>
          <TouchableOpacity 
            style={[styles.startBtn, { backgroundColor: theme.primary }]} 
            onPress={startTask}
          >
            <Text style={styles.startBtnText}>Aufgabe starten</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.taskArea}>
          {!isFinished ? (
            <View style={styles.interactiveZone}>
              <MaterialCommunityIcons name="volume-high" size={40} color={theme.primary} style={styles.speakerIcon} />
              <Text style={styles.statusInfo}>Hören Sie gut zu...</Text>
              
              <TouchableOpacity 
                style={[styles.tapButton, { backgroundColor: theme.primary }]} 
                onPress={handleTap}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="gesture-tap" size={80} color="#fff" />
                <Text style={styles.tapButtonText}>BEI "A" TIPPEN</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.finishArea}>
              <MaterialCommunityIcons name="check-circle" size={80} color="#2ecc71" />
              <Text style={styles.finishText}>Abgeschlossen ✓</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  textContainer: { marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold' },
  explanationArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  desc: { fontSize: 16, textAlign: 'center', color: '#444', lineHeight: 24, marginBottom: 40 },
  startBtn: { paddingVertical: 15, paddingHorizontal: 50, borderRadius: 12 },
  startBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  taskArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  interactiveZone: { alignItems: 'center' },
  speakerIcon: { marginBottom: 10 },
  statusInfo: { fontSize: 16, color: '#888', fontStyle: 'italic', marginBottom: 40 },
  tapButton: { width: 240, height: 240, borderRadius: 120, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  tapButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 15 },
  finishArea: { alignItems: 'center' },
  finishText: { fontSize: 20, fontWeight: 'bold', color: '#444', marginTop: 20 }
});