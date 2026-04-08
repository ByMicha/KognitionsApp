import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MEMORY_WORDS = ["Gesicht", "Samt", "Kirche", "Tulpe", "Rot"];

export default function MocaMemory({ theme, onComplete }) {
  const [subPhase, setSubPhase] = useState('listen'); // 'listen' oder 'recall'
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [foundWords, setFoundWords] = useState([]);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  // --- AUDIO LOGIK ---
  const playWords = () => {
    setIsSpeaking(true);
    const textToSpeak = "Merken Sie sich die folgenden fünf Wörter: Gesicht, Samt, Kirche, Tulpe, Rot.";
    
    Speech.speak(textToSpeak, {
      language: 'de-DE',
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

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

      // Prüfen, welche Wörter im Transkript vorkommen
      MEMORY_WORDS.forEach(word => {
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

  useEffect(() => {
    if (subPhase === 'recall') {
      startListening();
    }
    return () => stopListening();
  }, [subPhase]);

  const handleFinishRecall = () => {
    stopListening();
    onComplete(foundWords);
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>4. Gedächtnis (Sofortiger Abruf)</Text>
        <Text style={styles.desc}>
          {subPhase === 'listen' 
            ? "Klicken Sie auf den Button, um die Wörter zu hören und prägen Sie sich diese ein." 
            : "Sagen Sie nun alle Wörter laut auf, an die Sie sich noch erinnern können."}
        </Text>
      </View>

      {subPhase === 'listen' ? (
        <View style={styles.centerArea}>
          <TouchableOpacity 
            style={[styles.audioBtn, { backgroundColor: isSpeaking ? '#eee' : theme.primary }]} 
            onPress={playWords}
            disabled={isSpeaking}
          >
            <MaterialCommunityIcons 
              name={isSpeaking ? "volume-high" : "play-circle"} 
              size={60} 
              color={isSpeaking ? theme.primary : "#fff"} 
            />
            <Text style={[styles.audioBtnText, { color: isSpeaking ? theme.primary : "#fff" }]}>
              {isSpeaking ? "Wörter werden vorgelesen..." : "Wörter jetzt anhören"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.nextSubBtn, { opacity: isSpeaking ? 0.5 : 1 }]} 
            onPress={() => setSubPhase('recall')}
            disabled={isSpeaking}
          >
            <Text style={[styles.nextSubBtnText, { color: theme.primary }]}>Weiter zum Aufsagen →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.centerArea}>
          <View style={styles.wordGrid}>
            {MEMORY_WORDS.map((word, index) => {
              const isFound = foundWords.includes(word);
              return (
                <View key={index} style={[styles.wordBox, isFound && { borderColor: '#2ecc71', backgroundColor: '#f0fff4' }]}>
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

          <View style={styles.transcriptBox}>
            <Text style={styles.transcriptLabel}>Erkennung läuft:</Text>
            <Text style={styles.transcriptText}>{transcript || "Sprechen Sie jetzt..."}</Text>
          </View>

          <TouchableOpacity 
            style={[styles.finishBtn, { backgroundColor: theme.primary }]} 
            onPress={handleFinishRecall}
          >
            <Text style={styles.finishBtnText}>Aufsagen beenden</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  textContainer: { marginBottom: 30 },
  title: { fontSize: 18, fontWeight: 'bold' },
  desc: { fontSize: 14, color: '#666', marginTop: 5 },
  centerArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  audioBtn: { padding: 30, borderRadius: 20, alignItems: 'center', width: '80%', elevation: 3 },
  audioBtnText: { marginTop: 15, fontSize: 18, fontWeight: 'bold' },
  nextSubBtn: { marginTop: 40, padding: 10 },
  nextSubBtnText: { fontSize: 16, fontWeight: 'bold' },
  wordGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, marginBottom: 40 },
  wordBox: { width: 120, height: 60, borderWidth: 2, borderColor: '#eee', borderRadius: 12, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  wordText: { fontSize: 18, fontWeight: 'bold' },
  checkIcon: { position: 'absolute', top: 5, right: 5 },
  transcriptBox: { width: '100%', padding: 20, backgroundColor: '#f9f9f9', borderRadius: 12, marginBottom: 30, borderWidth: 1, borderColor: '#eee' },
  transcriptLabel: { fontSize: 12, color: '#aaa', marginBottom: 5, fontWeight: 'bold' },
  transcriptText: { fontSize: 16, fontStyle: 'italic', color: '#444', textAlign: 'center' },
  finishBtn: { paddingVertical: 15, paddingHorizontal: 50, borderRadius: 12 },
  finishBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});