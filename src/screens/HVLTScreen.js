import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useResults } from '../context/ResultContext';

// Die offizielle Wortliste A (HVLT-R)
const WORD_LIST = [
  "Löwe", "Smaragd", "Pferd", "Rubin", "Salbei", "Wacholder", 
  "Bambus", "Hund", "Tiger", "Perle", "Saphir", "Efeu"
];

export default function HVLTScreen({ t, theme, onBack }) {
  const { addResult } = useResults();
  
  const [phase, setPhase] = useState('intro');
  const [currentTrial, setCurrentTrial] = useState(1);
  const [recognizedWords, setRecognizedWords] = useState([]); // Korrekte Treffer
  const [intrusions, setIntrusions] = useState([]); // Falsche Wörter
  const [currentTranscript, setCurrentTranscript] = useState(""); 
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);

  // Speicher für die detaillierten Ergebnisse aller 3 Durchgänge
  const [trialResults, setTrialResults] = useState([]);

  const recognitionRef = useRef(null);

  // --- SPRACHAUSGABE (TTS) ---
  const speakWords = (index) => {
    if (index < WORD_LIST.length) {
      setCurrentWordIndex(index);
      Speech.speak(WORD_LIST[index], {
        language: 'de-DE',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => {
          setTimeout(() => speakWords(index + 1), 1200); // Ergibt ca. 2s Intervall
        },
      });
    } else {
      setIsSpeaking(false);
      setCurrentWordIndex(-1);
      setTimeout(() => startRecallPhase(), 1000);
    }
  };

  const startListeningPhase = () => {
    setPhase('listening');
    setIsSpeaking(true);
    setTimeout(() => speakWords(0), 1000);
  };

  // --- SPRACHERKENNUNG (STT) ---
  const startRecallPhase = () => {
    setPhase('recall');
    initiateSpeechRecognition();
  };

  const initiateSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      Alert.alert("Fehler", "Spracherkennung wird von diesem Browser nicht unterstützt.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ')
        .toLowerCase();

      setCurrentTranscript(transcript);

      const spokenWords = transcript.split(' ');
      const lastWord = spokenWords[spokenWords.length - 1].trim();

      if (lastWord.length > 2) {
        // Treffer prüfen
        WORD_LIST.forEach(word => {
          const lowerWord = word.toLowerCase();
          if (lastWord === lowerWord && !recognizedWords.includes(word)) {
            setRecognizedWords(prev => [...prev, word]);
          }
        });

        // Intrusionen prüfen
        const isCorrect = WORD_LIST.some(w => w.toLowerCase() === lastWord);
        if (!isCorrect && !intrusions.includes(lastWord) && lastWord.length > 3) {
           setIntrusions(prev => [...prev, lastWord]);
        }
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setCurrentTranscript("");
  };

  /**
   * ÜBERARBEITETE SPEICHER-METHODE
   * Berechnet detaillierte Metriken pro Durchgang
   */
  const handleNextStep = async () => {
    stopRecognition();

    // 1. Text säubern und in Wörter zerlegen
    const cleanedText = currentTranscript.toLowerCase().replace(/[,.!?]/g, " ");
    const words = cleanedText.split(/\s+/).filter(w => w.length > 1);
    
    // 2. Duplikate entfernen – jedes Wort zählt nur einmal
    const uniqueSpokenWords = [...new Set(words)];

    // 3. Abgleich mit der Wortliste nach Abschluss der Aufnahme
    const found = [];
    const falseWords = [];

    uniqueSpokenWords.forEach(word => {
      if (WORD_LIST.some(w => w.toLowerCase() === word)) {
        found.push(word);
      } else if (word.length > 3) {
        falseWords.push(word);
      }
    });

    const hits = found.length;
    const recallRate = parseFloat(((hits / 12) * 100).toFixed(1));

    const currentTrialData = {
      trial: currentTrial,
      correctCount: hits,
      recallRate: recallRate, // Neuer Prozentwert
      intrusionsCount: intrusions.length,
      foundWords: [...recognizedWords],
      falseWords: [...intrusions]
    };
    
    const updatedResults = [...trialResults, currentTrialData];
    setTrialResults(updatedResults);

    if (currentTrial < 3) {
      // Vorbereitung für den nächsten Durchgang
      setCurrentTrial(prev => prev + 1);
      setRecognizedWords([]);
      setIntrusions([]);
      setCurrentTranscript("");
      setPhase('intro');
    } else {
      // Finale Speicherung nach dem 3. Durchgang
      const totalLearningHits = updatedResults.reduce((acc, curr) => acc + curr.correctCount, 0);
      
      // Das Objekt für addResult wird nun extrem detailliert
      await addResult('hvlt_learning', {
        trials: updatedResults, // Enthält alle 3 Durchgänge inkl. %-Raten
        totalHitsTrial1to3: totalLearningHits,
        averageRecallRate: parseFloat((totalLearningHits / 36 * 100).toFixed(1)),
        metadata: {
          list: "A",
          timestamp: new Date().toISOString()
        }
      }, totalLearningHits);

      onBack();
    }
  };

  useEffect(() => {
    return () => {
      Speech.stop();
      stopRecognition();
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { Speech.stop(); stopRecognition(); onBack(); }} style={styles.backBtn}>
          <Text style={{ color: theme.primary, fontSize: 18, fontWeight: 'bold' }}>← Abbrechen</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>{t.hvlt.title}</Text>
      </View>

      <View style={styles.content}>
        {/* Trial Status */}
        <View style={styles.trialIndicatorRow}>
          {[1, 2, 3].map(num => (
            <View key={num} style={[styles.trialDot, { backgroundColor: num <= currentTrial ? theme.primary : theme.card, borderColor: theme.primary }]}>
              <Text style={{ color: num <= currentTrial ? '#fff' : theme.text, fontWeight: 'bold' }}>{num}</Text>
            </View>
          ))}
          <Text style={[styles.trialLabel, { color: theme.text }]}>Lernphase: Durchgang {currentTrial} von 3</Text>
        </View>

        <View style={[styles.sheet, { backgroundColor: '#fff', borderColor: theme.border }]}>
          
          {phase === 'intro' && (
            <View style={styles.innerContent}>
              <MaterialCommunityIcons name="bullhorn-outline" size={80} color={theme.primary} />
              <Text style={styles.instructionText}>{t.hvlt.instruction}</Text>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.primary }]} onPress={startListeningPhase}>
                <Text style={styles.btnText}>Durchgang {currentTrial} starten</Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'listening' && (
            <View style={styles.innerContent}>
              <MaterialCommunityIcons name="volume-high" size={100} color={theme.primary} />
              <Text style={styles.statusText}>{currentWordIndex >= 0 ? `Wort ${currentWordIndex + 1} / 12` : "Bereit..."}</Text>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { backgroundColor: theme.primary, width: `${((currentWordIndex + 1) / 12) * 100}%` }]} />
              </View>
            </View>
          )}

          {phase === 'recall' && (
            <View style={styles.innerContent}>
              <View style={styles.micContainer}>
                <MaterialCommunityIcons name="microphone" size={70} color={isListening ? "#ff4444" : "#ccc"} />
              </View>
              
              <Text style={styles.statusText}>Bitte aufzählen...</Text>

              <View style={styles.wordGrid}>
                {WORD_LIST.map((word, idx) => {
                  const isFound = recognizedWords.includes(word);
                  return (
                    <View key={idx} style={[styles.wordBadge, { backgroundColor: isFound ? '#90EE90' : '#f8f8f8', borderColor: isFound ? '#2ecc71' : '#ddd' }]}>
                      <Text style={{ color: isFound ? '#000' : '#ccc', fontSize: 13, fontWeight: isFound ? 'bold' : 'normal' }}>
                        {isFound ? word : "?"}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.transcriptBox}>
                <Text style={styles.transcriptLabel}>Live-Erkennung:</Text>
                <Text style={styles.transcriptText} numberOfLines={1}>"{currentTranscript || "Warten auf Sprache..."}"</Text>
              </View>

              <TouchableOpacity 
                style={[styles.actionBtn, { backgroundColor: theme.primary, marginTop: 20 }]} 
                onPress={handleNextStep}
              >
                <Text style={styles.btnText}>
                  {currentTrial < 3 ? "Nächster Durchgang" : "Test abschließen"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  backBtn: { marginRight: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  content: { flex: 1, padding: 20, alignItems: 'center' },
  trialIndicatorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, width: '100%', maxWidth: 800 },
  trialDot: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  trialLabel: { fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  sheet: { width: '100%', maxWidth: 850, justifyContent: "center", flex: 0.95, borderRadius: 20, borderWidth: 1, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, padding: 20 },
  innerContent: { alignItems: 'center', width: '100%' },
  instructionText: { textAlign: 'center', fontSize: 17, marginVertical: 25, lineHeight: 24 },
  statusText: { fontSize: 22, fontWeight: 'bold', marginVertical: 15 },
  actionBtn: { paddingVertical: 14, paddingHorizontal: 50, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  wordGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 },
  wordBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, margin: 4, borderWidth: 1, minWidth: 70, alignItems: 'center' },
  monitorSection: { width: '100%', padding: 12, backgroundColor: '#fff5f5', borderRadius: 12, borderWidth: 1, borderColor: '#feb2b2', marginBottom: 15 },
  monitorTitle: { fontSize: 12, fontWeight: 'bold', color: '#c53030', marginBottom: 6 },
  intrusionRow: { flexDirection: 'row', flexWrap: 'wrap' },
  errorBadge: { backgroundColor: '#f56565', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, margin: 2 },
  errorText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  transcriptBox: { width: '100%', padding: 10, backgroundColor: '#f7fafc', borderRadius: 8, borderWidth: 1, borderColor: '#edf2f7' },
  transcriptLabel: { fontSize: 10, color: '#a0aec0', textTransform: 'uppercase', marginBottom: 2 },
  transcriptText: { fontSize: 13, fontStyle: 'italic', color: '#4a5568' },
  progressBarBackground: { width: '80%', height: 6, backgroundColor: '#eee', borderRadius: 3, marginTop: 15, overflow: 'hidden' },
  progressBarFill: { height: '100%' },
  micContainer: { marginBottom: 5 }
});