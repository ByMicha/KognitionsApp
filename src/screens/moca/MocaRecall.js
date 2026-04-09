import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const RECALL_WORDS = ["Gesicht", "Samt", "Kirche", "Tulpe", "Rot"];

export default function MocaRecall({ theme, onComplete }) {
  const [isStarted, setIsStarted] = useState(false);
  const [foundWords, setFoundWords] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const recognitionRef = useRef(null);

  // --- SPRACHeingabe LOGIK ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const current = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ').toLowerCase();
      
      setTranscript(current);

      // Prüfung auf Übereinstimmung
      RECALL_WORDS.forEach(word => {
        if (current.includes(word.toLowerCase()) && !foundWords.includes(word)) {
          setFoundWords(prev => [...prev, word]);
        }
      });
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const handleStart = () => {
    setIsStarted(true);
    startListening();
  };

  const handleFinish = () => {
    stopListening();
    setIsFinished(true);
    onComplete(foundWords);
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>10. Verzögerter Abruf</Text>
      </View>

      {!isStarted ? (
        <View style={styles.centerArea}>
          <MaterialCommunityIcons name="brain" size={80} color={theme.primary} />
          <Text style={styles.instruction}>
            Erinnern Sie sich an die 5 Wörter, die ich Ihnen vorhin vorgelesen habe? {"\n\n"}
            Bitte sagen Sie mir so viele wie möglich davon noch einmal auf.
          </Text>
          <TouchableOpacity 
            style={[styles.startBtn, { backgroundColor: theme.primary }]} 
            onPress={handleStart}
          >
            <Text style={styles.btnText}>Ich bin bereit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.centerArea}>
          {/* Die 5 Felder mit Fragezeichen (wie in Szenario 4) */}
          <View style={styles.wordGrid}>
            {RECALL_WORDS.map((word, index) => {
              const isFound = foundWords.includes(word);
              return (
                <View 
                  key={index} 
                  style={[
                    styles.wordBox, 
                    isFound && { borderColor: '#2ecc71', backgroundColor: '#f0fff4' }
                  ]}
                >
                  <Text style={[styles.wordText, !isFound && { color: '#ccc' }]}>
                    {isFound ? word : "?"}
                  </Text>
                  {isFound && (
                    <MaterialCommunityIcons name="check-circle" size={16} color="#2ecc71" style={styles.checkIcon} />
                  )}
                </View>
              );
            })}
          </View>

          {!isFinished ? (
            <>
              <View style={styles.transcriptBox}>
                <Text style={styles.transcriptText}>{transcript || "Ich höre zu..."}</Text>
              </View>

              <TouchableOpacity 
                style={[styles.finishBtn, { backgroundColor: theme.primary }]} 
                onPress={handleFinish}
              >
                <Text style={styles.finishBtnText}>Aufsagen beenden</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.successArea}>
              <MaterialCommunityIcons name="check-circle" size={60} color="#2ecc71" />
              <Text style={styles.successText}>Ergebnisse wurden gespeichert ✓</Text>
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
  centerArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  instruction: { fontSize: 16, textAlign: 'center', color: '#444', lineHeight: 24, marginBottom: 40 },
  startBtn: { paddingVertical: 15, paddingHorizontal: 50, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  wordGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, marginBottom: 40 },
  wordBox: { width: 120, height: 65, borderWidth: 2, borderColor: '#eee', borderRadius: 12, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  wordText: { fontSize: 18, fontWeight: 'bold' },
  checkIcon: { position: 'absolute', top: 5, right: 5 },
  transcriptBox: { width: '100%', padding: 20, backgroundColor: '#f9f9f9', borderRadius: 12, marginBottom: 30, borderWidth: 1, borderColor: '#eee' },
  transcriptText: { fontSize: 16, fontStyle: 'italic', color: '#888', textAlign: 'center' },
  finishBtn: { paddingVertical: 15, paddingHorizontal: 60, borderRadius: 12 },
  finishBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  successArea: { alignItems: 'center' },
  successText: { color: '#2ecc71', fontWeight: 'bold', fontSize: 18, marginTop: 15 }
});