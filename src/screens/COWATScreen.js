import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useResults } from '../context/ResultContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ExplanationModal from '../components/ExplanationModal';

const COWAT_LETTERS = ['F', 'A', 'S'];

export default function COWATScreen({ t, theme, onBack }) {
  const { addResult } = useResults();

  const [showExplanation, setShowExplanation] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  
  const [phase, setPhase] = useState('test'); // 'test', 'evaluating', 'summary'
  const [targetLetter, setTargetLetter] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [fullTranscript, setFullTranscript] = useState("");
  
  // States für die detaillierte Auswertung
  const [evaluatedWords, setEvaluatedWords] = useState([]); 
  const [finalScore, setFinalScore] = useState(0);

  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");

  // --- WIKTIONARY API PRÜFUNG ---
  const isRealGermanWord = async (word) => {
    try {
      const formattedWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      const response = await fetch(
        `https://de.wiktionary.org/w/api.php?action=query&format=json&origin=*&titles=${encodeURIComponent(formattedWord)}&redirects=1`
      );
      const data = await response.json();
      return !data.query.pages["-1"];
    } catch (error) {
      console.error("Wiki-Fehler:", error);
      return false; 
    }
  };

  const startTest = () => {
    const randomLetter = COWAT_LETTERS[Math.floor(Math.random() * COWAT_LETTERS.length)];
    setTargetLetter(randomLetter);
    setPhase('test');
    setFullTranscript("");
    setEvaluatedWords([]);
    initiateSpeechRecognition();
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinishAction();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const initiateSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map(result => result[0].transcript).join(' ');
      setFullTranscript(transcript);
      transcriptRef.current = transcript;
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  // --- NEUE AUSWERTUNGSLOGIK ---
  const handleFinishAction = async () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    
    setPhase('evaluating');

    const rawWords = transcriptRef.current.toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 1);

    const uniqueWords = [...new Set(rawWords)];
    const evaluationDetails = [];

    for (const word of uniqueWords) {
      const startsWithLetter = word.startsWith(targetLetter.toLowerCase());
      let isValidWord = false;

      if (startsWithLetter) {
        isValidWord = await isRealGermanWord(word);
      }

      evaluationDetails.push({
        text: word,
        isCorrect: startsWithLetter && isValidWord
      });
    }

    const score = evaluationDetails.filter(v => v.isCorrect).length;
    setEvaluatedWords(evaluationDetails);
    setFinalScore(score);

    // Daten für die Datenbank (kompatibel mit ResultsScreen)
    const resultData = {
      letter: targetLetter,
      correctCount: score,
      correctWords: evaluationDetails.filter(w => w.isCorrect).map(w => w.text),
      incorrectWordsFound: evaluationDetails.filter(w => !w.isCorrect).map(w => w.text),
      fullProtocol: transcriptRef.current,
      timestamp: new Date().toISOString()
    };

    await addResult('cowat', resultData, score);
    setPhase('summary');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: "transparent" }]}>
      <ExplanationModal 
        visible={showExplanation} 
        onClose={() => {
          setShowExplanation(false);
          setTestStarted(true);
          startTest();
        }} 
        testKey="cowat"
        theme={theme}
        isRunning={testStarted}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={{ color: theme.primary, fontSize: 18, fontWeight: 'bold' }}>← Zurück</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Wortflüssigkeit</Text>
        <TouchableOpacity style={{position: 'absolute', right: 20}} onPress={() => setShowExplanation(true)}>
          <MaterialCommunityIcons name="help-circle-outline" size={28} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.sheet, { backgroundColor: '#fff', borderColor: theme.border }]}>

          {phase === 'test' && (
            <View style={styles.innerContent}>
              <View style={[styles.timerCircle, { borderColor: timeLeft < 10 ? '#ff4444' : theme.primary }]}>
                <Text style={[styles.timerText, { color: timeLeft < 10 ? '#ff4444' : theme.text }]}>{timeLeft}</Text>
                <Text style={styles.timerSubText}>Sekunden</Text>
              </View>
              <Text style={styles.targetLabel}>Sagen Sie Wörter mit:</Text>
              <Text style={[styles.bigLetter, { color: theme.primary }]}>{targetLetter}</Text>
              <View style={styles.transcriptContainer}>
                <Text style={styles.transcriptLabel}>Aufzeichnung läuft...</Text>
                <Text style={styles.transcriptText}>{fullTranscript || "System bereit..."}</Text>
              </View>
              <TouchableOpacity style={styles.finishEarlyBtn} onPress={handleFinishAction}>
                <Text style={{color: '#ff4444', fontWeight: 'bold'}}>Test jetzt beenden</Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'evaluating' && (
            <View style={styles.innerContent}>
              <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 100 }} />
              <Text style={styles.evalText}>Wörter werden gegen Wiktionary geprüft...</Text>
            </View>
          )}

          {phase === 'summary' && (
            <View style={styles.innerContent}>
              <Text style={styles.summaryTitle}>Ergebnis: Buchstabe {targetLetter}</Text>
              <View style={styles.scoreBanner}>
                <Text style={styles.scoreText}>{finalScore}</Text>
                <Text style={styles.scoreSub}>gültige Wörter gefunden</Text>
              </View>

              <Text style={styles.listHeader}>Detaillierte Wortliste:</Text>
              <View style={styles.wordListContainer}>
                {evaluatedWords.map((word, index) => (
                  <View key={index} style={[styles.wordTag, { backgroundColor: word.isCorrect ? '#e6fffa' : '#fff5f5', borderColor: word.isCorrect ? '#38b2ac' : '#f56565' }]}>
                    <Text style={[styles.wordTagText, { color: word.isCorrect ? '#2c7a7b' : '#c53030' }]}>
                      {word.text} {word.isCorrect ? '✓' : '✗'}
                    </Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.primary, marginTop: 40 }]} onPress={onBack}>
                <Text style={styles.btnText}>Test abschließen</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  backBtn: { marginRight: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  scrollContent: { flexGrow: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  sheet: { width: '100%', maxWidth: 800, flex: 0.95, borderRadius: 20, borderWidth: 1, elevation: 4, padding: 30 },
  innerContent: { alignItems: 'center', flex: 1 },
  actionBtn: { paddingVertical: 14, paddingHorizontal: 50, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  timerCircle: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  timerText: { fontSize: 28, fontWeight: 'bold' },
  timerSubText: { fontSize: 9, opacity: 0.5 },
  targetLabel: { fontSize: 18 },
  bigLetter: { fontSize: 110, fontWeight: 'bold', lineHeight: 120 },
  transcriptContainer: { width: '100%', flex: 1, backgroundColor: '#f8f9fa', borderRadius: 10, padding: 15, marginVertical: 20 },
  transcriptLabel: { fontSize: 10, fontWeight: 'bold', color: '#aaa', marginBottom: 5 },
  transcriptText: { fontSize: 15, fontStyle: 'italic', color: '#444' },
  evalText: { marginTop: 20, fontSize: 16, color: '#666' },
  summaryTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  scoreBanner: { alignItems: 'center', marginBottom: 25 },
  scoreText: { fontSize: 64, fontWeight: 'bold', color: '#38b2ac' },
  scoreSub: { fontSize: 14, opacity: 0.6 },
  listHeader: { alignSelf: 'flex-start', fontWeight: 'bold', marginBottom: 10, fontSize: 14, color: '#666' },
  wordListContainer: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', gap: 8 },
  wordTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  wordTagText: { fontSize: 14, fontWeight: 'bold' },
  finishEarlyBtn: { padding: 10 }
});