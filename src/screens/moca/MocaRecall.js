import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const RECALL_WORDS = ["Gesicht", "Samt", "Kirche", "Tulpe", "Rot"];

export default function MocaRecall({ theme, t, onComplete }) {
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

      // FUNKTIONALE AKTUALISIERUNG: Verhindert die Mehrfachzählung identischer Wörter
      setFoundWords(prev => {
        const next = [...prev];
        RECALL_WORDS.forEach(word => {
          const lowerWord = word.toLowerCase();
          // Wir prüfen im aktuellsten lokalen Array (next), ob das Wort schon existiert
          if (current.includes(lowerWord) && !next.includes(word)) {
            next.push(word);
          }
        });
        return next;
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

    // NEU: Ermittlung der vergessenen Wörter für die Masterarbeit
    const forgottenWords = RECALL_WORDS.filter(word => !foundWords.includes(word));

    // ERWEITERT: Strukturiertes Datenobjekt für MoCAScreen
    onComplete({
      correct_count: foundWords.length,
      remembered_words: foundWords,
      forgotten_words: forgottenWords,
      timestamp_finished: new Date().toISOString()
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={{...styles.title, color: theme.primary}}>10. {t.moca.tests.recall}</Text>
      </View>

      {!isStarted ? (
        <View style={styles.centerArea}>
          <MaterialCommunityIcons name="brain" size={80} color={theme.primary} />
          <Text style={{...styles.instruction, color: theme.text}}>
            {t.moca.doYouRememberFiveWords} {"\n\n"}
            {t.moca.pleaseSayAsMany}
          </Text>
          <TouchableOpacity 
            style={[styles.startBtn, { backgroundColor: theme.primary }]} 
            onPress={handleStart}
          >
            <Text style={{...styles.btnText, color: theme.darkContrast}}>{t.moca.iAmReady}</Text>
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
                    isFound && { borderColor: theme.greenish, backgroundColor: '#f0fff4' }
                  ]}
                >
                  <Text style={[styles.wordText, !isFound && { color: '#ccc' }]}>
                    {isFound ? word : "?"}
                  </Text>
                  {isFound && (
                    <MaterialCommunityIcons name="check-circle" size={16} color={theme.greenish} style={styles.checkIcon} />
                  )}
                </View>
              );
            })}
          </View>

          {!isFinished ? (
            <>
              <View style={{...styles.transcriptBox, backgroundColor: theme.talkBox}}>
                <Text style={{...styles.transcriptText, color: theme.darkContrast}}>{transcript || t.moca.listening}</Text>
              </View>

              <TouchableOpacity 
                style={[styles.finishBtn, { backgroundColor: theme.primary }]} 
                onPress={handleFinish}
              >
                <Text style={{...styles.finishBtnText, color: theme.darkContrast}}>{t.moca.stopReciting}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.successArea}>
              <MaterialCommunityIcons name="check-circle" size={60} color={theme.greenish} />
              <Text style={{...styles.successText, color: theme.greenish}}>{t.moca.resultHasBeenSaved} ✓</Text>
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
  wordBox: { width: 120, height: 65, borderWidth: 2, borderColor: '#c4c4c4', borderRadius: 12, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  wordText: { fontSize: 18, fontWeight: 'bold' },
  checkIcon: { position: 'absolute', top: 5, right: 5 },
  transcriptBox: { width: '100%', padding: 20, backgroundColor: '#f9f9f9', borderRadius: 12, marginBottom: 30, borderWidth: 1, borderColor: '#eee' },
  transcriptText: { fontSize: 16, fontStyle: 'italic', color: '#888', textAlign: 'center' },
  finishBtn: { paddingVertical: 15, paddingHorizontal: 60, borderRadius: 12 },
  finishBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  successArea: { alignItems: 'center' },
  successText: { color: '#2ecc71', fontWeight: 'bold', fontSize: 18, marginTop: 15 }
});