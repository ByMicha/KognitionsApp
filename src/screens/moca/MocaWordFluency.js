import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function MocaWordFluency({ theme, onComplete }) {
  const [phase, setPhase] = useState('intro'); // 'intro', 'countdown', 'active', 'evaluating', 'finished'
  const [countdown, setCountdown] = useState(3);
  const [timer, setTimer] = useState(60);
  const [transcript, setTranscript] = useState('');
  const [results, setResults] = useState(null);
  const [targetLetter] = useState('F'); 

  const recognitionRef = useRef(null);

  const isRealGermanWord = async (word) => {
    try {
      // 1. Wort für die Suche vorbereiten: Erster Buchstabe groß
      const formattedWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      
      // 2. API-Abfrage mit 'redirects=1'
      const response = await fetch(
        `https://de.wiktionary.org/w/api.php?action=query&format=json&origin=*&titles=${encodeURIComponent(formattedWord)}&redirects=1`
      );
      const data = await response.json();
      const pages = data.query.pages;
      
      return !pages["-1"];
    } catch (error) {
      console.error("Wiki-Fehler:", error);
      return false; 
    }
  };

  const evaluateWords = async (fullText) => {
    setPhase('evaluating');
    
    const rawWords = fullText.toLowerCase()
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
        word: word,
        valid: startsWithLetter && isValidWord
      });
    }

    const finalResults = {
      totalInput: uniqueWords.length,
      validCount: evaluationDetails.filter(v => v.valid).length,
      details: evaluationDetails
    };

    setResults(finalResults);
    setPhase('finished');

    // ERWEITERT: Strukturierte Datenübergabe für die Masterarbeit
    onComplete({
      target_letter: targetLetter,
      total_word_count: finalResults.totalInput,
      valid_wiki_count: finalResults.validCount,
      raw_word_list: uniqueWords,
      details: evaluationDetails,
      timestamp_finished: new Date().toISOString()
    });
  };

  useEffect(() => {
    if (phase === 'countdown') {
      if (countdown > 0) {
        const timerId = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timerId);
      } else {
        setPhase('active');
        startRecognition();
      }
    }
  }, [phase, countdown]);

  useEffect(() => {
    let intervalId;
    if (phase === 'active' && timer > 0) {
      intervalId = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
    } else if (timer === 0 && phase === 'active') {
      stopTest();
    }
    return () => clearInterval(intervalId);
  }, [phase, timer]);

  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'de-DE';
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event) => {
      const current = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ');
      setTranscript(current);
    };

    recognitionRef.current.start();
  };

  const stopTest = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    evaluateWords(transcript);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={{...styles.title, color: theme.primary}}>9. Wortflüssigkeit</Text>
        {phase === 'active' && (
          <View style={[styles.timerBadge, { backgroundColor: timer < 10 ? theme.redish : '#eee' }]}>
            <Text style={[styles.timerText, { color: timer < 10 ? '#fff' : '#333' }]}>{timer}s</Text>
          </View>
        )}
      </View>

      {phase === 'intro' && (
        <View style={styles.content}>
          <MaterialCommunityIcons name="format-letter-case" size={80} color={theme.primary} />
          <Text style={{...styles.instruction, color: theme.text}}>
            Nennen Sie in einer Minute so viele Wörter wie möglich mit dem gleich erscheinenden Buchstaben.
          </Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={() => setPhase('countdown')}>
            <Text style={{...styles.btnText, color: theme.darkContrast}}>Starten</Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === 'countdown' && (
        <View style={styles.center}>
          <Text style={[styles.bigText, { color: theme.primary }]}>{countdown > 0 ? countdown : "LOS!"}</Text>
        </View>
      )}

      {phase === 'active' && (
        <View style={styles.content}>
          <Text style={{...styles.letterLabel, color: theme.text}}>Wörter mit:</Text>
          <Text style={{...styles.bigLetter, color: theme.primary}}>{targetLetter}</Text>
          <View style={styles.micAnim}>
            <MaterialCommunityIcons name="microphone" size={50} color={theme.redish} />
            <Text style={{...styles.listeningText, color: theme.redish}}>Aufnahme läuft...</Text>
          </View>
          <TouchableOpacity style={styles.stopLink} onPress={stopTest}>
            <Text style={{...styles.stopLinkText, color: theme.text}}>Ich weiß nicht mehr weiter</Text>
          </TouchableOpacity>
        </View>
      )}

      {phase === 'evaluating' && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{...styles.evalText, color: theme.text}}>Prüfe Wörter gegen Wiktionary...</Text>
        </View>
      )}

      {phase === 'finished' && (
        <View style={styles.content}>
          <MaterialCommunityIcons name="check-circle" size={60} color="#2ecc71" />
          <Text style={{...styles.finishTitle, color: theme.text}}>Auswertung</Text>
          
          <View style={styles.resultSummary}>
            <Text style={{...styles.resultMainText, color: theme.text}}>Gültige Wörter: {results?.validCount}</Text>
          </View>

          <Text style={{...styles.listHeader, color: theme.text}}>Erkannte Wörter im Detail:</Text>
          <ScrollView style={{...styles.wordListContainer, backgroundColor: theme.talkBox}} contentContainerStyle={styles.wordListContent}>
            {results?.details.map((item, index) => (
              <View key={index} style={{...styles.wordRow}}>
                <MaterialCommunityIcons 
                  name={item.valid ? "check-bold" : "close-thick"} 
                  size={20} 
                  color={item.valid ? theme.greenish : theme.redish} 
                />
                <Text style={[styles.wordListItem, { color: item.valid ? theme.greenish : theme.redish }]}>
                  {item.word}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { fontSize: 18, fontWeight: 'bold' },
  timerBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  timerText: { fontSize: 14, fontWeight: 'bold' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  instruction: { fontSize: 16, textAlign: 'center', marginBottom: 30, color: '#444', paddingHorizontal: 20 },
  btn: { paddingVertical: 15, paddingHorizontal: 60, borderRadius: 12 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bigText: { fontSize: 80, fontWeight: 'bold' },
  bigLetter: { fontSize: 100, fontWeight: 'bold', marginBottom: 10 },
  letterLabel: { fontSize: 16, color: '#888' },
  micAnim: { alignItems: 'center', marginBottom: 20 },
  listeningText: { color: '#ff4444', fontWeight: 'bold', marginTop: 5 },
  stopLink: { padding: 10 },
  stopLinkText: { color: '#888', textDecorationLine: 'underline' },
  evalText: { marginTop: 15, fontSize: 14, color: '#666' },
  finishTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  resultSummary: { marginVertical: 10 },
  resultMainText: { fontSize: 22 },
  listHeader: { fontSize: 14, fontWeight: 'bold', color: '#666', marginTop: 15, marginBottom: 10, alignSelf: 'flex-start' },
  wordListContainer: { width: '100%', maxHeight: 250, backgroundColor: '#fcfcfc', borderRadius: 10, borderWidth: 1, borderColor: '#eee' },
  wordListContent: { padding: 15 },
  wordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  wordListItem: { fontSize: 18, marginLeft: 10, textTransform: 'capitalize' }
});