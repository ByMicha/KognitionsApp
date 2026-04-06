import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useResults } from '../context/ResultContext';

const COWAT_LETTERS = ['F', 'A', 'S'];

export default function COWATScreen({ t, theme, onBack }) {
  const { addResult } = useResults();
  
  const [phase, setPhase] = useState('intro'); // 'intro', 'test', 'summary'
  const [targetLetter, setTargetLetter] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [fullTranscript, setFullTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  
  // Neue States für die detaillierte Endauswertung
  const [evaluatedWords, setEvaluatedWords] = useState([]); 
  const [finalScore, setFinalScore] = useState(0);

  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");

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
          handleAutoFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const initiateSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      Alert.alert("Fehler", "Spracherkennung wird nicht unterstützt.");
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
        .join(' ');
      setFullTranscript(transcript);
      transcriptRef.current = transcript;
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleAutoFinish = async () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Robuste Auswertungslogik
    const cleanedText = transcriptRef.current.toLowerCase().replace(/[,.!?]/g, " ");
    const allWords = cleanedText.split(/\s+/).filter(w => w.length > 1);
    const uniqueWords = [...new Set(allWords)];
    
    const results = uniqueWords.map(word => ({
      text: word,
      isCorrect: word.startsWith(targetLetter.toLowerCase())
    }));

    const correctOnes = results.filter(r => r.isCorrect);
    const score = correctOnes.length;

    setEvaluatedWords(results);
    setFinalScore(score);

    const resultData = {
      letter: targetLetter,
      correctCount: score,
      words: results,
      fullProtocol: fullTranscript,
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={{ color: theme.primary, fontSize: 18, fontWeight: 'bold' }}>← Zurück</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>{t.cowat.title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.sheet, { backgroundColor: '#fff', borderColor: theme.border }]}>
          
          {phase === 'intro' && (
            <View style={styles.innerContent}>
              <MaterialCommunityIcons name="format-letter-case" size={80} color={theme.primary} />
              <Text style={styles.instructionText}>{t.cowat.instruction}</Text>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.primary }]} onPress={startTest}>
                <Text style={styles.btnText}>{t.cowat.startTest}</Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'test' && (
            <View style={styles.innerContent}>
              <View style={[styles.timerCircle, { borderColor: timeLeft < 10 ? '#ff4444' : theme.primary }]}>
                <Text style={[styles.timerText, { color: timeLeft < 10 ? '#ff4444' : theme.text }]}>{timeLeft}</Text>
                <Text style={styles.timerSubText}>Sekunden</Text>
              </View>
              <Text style={styles.targetLabel}>Wörter mit:</Text>
              <Text style={[styles.bigLetter, { color: theme.primary }]}>{targetLetter}</Text>
              <View style={styles.transcriptContainer}>
                <Text style={styles.transcriptLabel}>Live-Protokoll:</Text>
                <Text style={styles.transcriptText}>{fullTranscript || "System bereit..."}</Text>
              </View>
              <TouchableOpacity style={styles.finishEarlyBtn} onPress={handleAutoFinish}>
                <Text style={{color: '#ff4444', fontWeight: 'bold'}}>Test beenden</Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'summary' && (
            <View style={styles.innerContent}>
              <Text style={styles.summaryTitle}>Auswertung: {targetLetter}</Text>
              
              <View style={styles.scoreBanner}>
                <Text style={styles.scoreText}>{finalScore}</Text>
                <Text style={styles.scoreSub}>korrekte Wörter</Text>
              </View>

              <Text style={styles.listHeader}>Erkannte Wortliste:</Text>
              <View style={styles.wordListContainer}>
                {evaluatedWords.length > 0 ? (
                  evaluatedWords.map((word, index) => (
                    <View key={index} style={[styles.wordTag, { backgroundColor: word.isCorrect ? '#e6fffa' : '#fff5f5', borderColor: word.isCorrect ? '#38b2ac' : '#f56565' }]}>
                      <Text style={[styles.wordTagText, { color: word.isCorrect ? '#2c7a7b' : '#c53030' }]}>
                        {word.text} {word.isCorrect ? '✓' : '✗'}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ fontStyle: 'italic', color: '#999' }}>Keine Wörter erkannt.</Text>
                )}
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
  sheet: { 
    width: '100%', 
    maxWidth: 800, // Von 600 auf 800 erhöht
    flex: 0.95,    // Hinzugefügt, damit es den Platz vertikal ausfüllt wie beim HVLT
    borderRadius: 20, 
    borderWidth: 1, 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    padding: 30 
  },
  innerContent: { alignItems: 'center', flex: 1 },
  instructionText: { textAlign: 'center', fontSize: 17, marginVertical: 30, lineHeight: 24 },
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