import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Exakte Sequenzen laut Testbogen
const FORWARD_SEQ = ["2", "1", "8", "5", "4"];
const BACKWARD_SEQ = ["7", "4", "2"]; // Erwartete Antwort für die Rückwärts-Aufgabe

export default function MocaDigits({ theme, onComplete }) {
  // Phasen: 'f_listen', 'f_recall', 'b_listen', 'b_recall'
  const [step, setStep] = useState('f_listen');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [correctCount, setCorrectCount] = useState(0); 
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  // NEU: Zwischenspeicher für die Ergebnisse der beiden Teilaufgaben
  const [sessionResults, setSessionResults] = useState({ forward: null });

  // --- AUDIO LOGIK ---
  const playDigits = (sequence, instruction) => {
    setIsSpeaking(true);
    const text = `${instruction}: ${sequence.join(", ")}`;
    
    Speech.speak(text, {
      language: 'de-DE',
      rate: 0.75, 
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  // --- STT LOGIK MIT SEQUENZ-PRÜFUNG ---
  const startListening = (targetSeq) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const currentRaw = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ').toLowerCase();
      
      setTranscript(currentRaw);

      // --- NEU: Normalisierung von Text-Zahlen zu Ziffern ---
      const numberMap = {
        'null': '0', 'eins': '1', 'zwei': '2', 'drei': '3', 'vier': '4',
        'fünf': '5', 'sechs': '6', 'sieben': '7', 'acht': '8', 'neun': '9'
      };
      
      let processedText = currentRaw;
      Object.keys(numberMap).forEach(key => {
        processedText = processedText.replace(new RegExp(key, 'g'), numberMap[key]);
      });

      // Extrahiere nun die Ziffern (egal ob sie als "2" oder "zwei" gesprochen wurden)
      const spokenDigits = processedText.match(/\d/g) || [];
      
      let matches = 0;
      for (let i = 0; i < spokenDigits.length; i++) {
        if (matches < targetSeq.length && spokenDigits[i] === targetSeq[matches]) {
          matches++;
        }
      }
      setCorrectCount(matches);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setTranscript('');
    setCorrectCount(0);
  };

  useEffect(() => {
    if (step === 'f_recall') startListening(FORWARD_SEQ);
    if (step === 'b_recall') startListening(BACKWARD_SEQ);
    return () => stopListening();
  }, [step]);

  // --- NAVIGATION & SPEICHERUNG ---
  const handleNextStep = () => {
    if (step === 'f_listen') {
      setStep('f_recall');
    } else if (step === 'f_recall') {
      // Ergebnisse des Vorwärts-Teils für die Masterarbeit sichern
      setSessionResults({
        forward: {
          seq_length: FORWARD_SEQ.length,
          hits: correctCount,
          transcript: transcript
        }
      });
      stopListening();
      setStep('b_listen');
    } else if (step === 'b_listen') {
      setStep('b_recall');
    } else if (step === 'b_recall') {
      // Rückwärts-Ergebnisse erfassen und Gesamtergebnis an MoCAScreen senden
      const backwardData = {
        seq_length: BACKWARD_SEQ.length,
        hits: correctCount,
        transcript: transcript
      };

      onComplete({
        forward: sessionResults.forward,
        backward: backwardData,
        timestamp_finished: new Date().toISOString()
      });

      stopListening();
    }
  };

  const renderDigitsDisplay = (target) => (
    <View style={styles.digitGrid}>
      {target.map((num, i) => {
        const isRevealed = i < correctCount;
        return (
          <View key={i} style={[styles.digitBox, isRevealed && styles.digitBoxActive]}>
            <Text style={[styles.digitText, !isRevealed && { color: '#eee' }]}>
              {isRevealed ? num : "?"}
            </Text>
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={{...styles.title, color: theme.primary}}>5. Aufmerksamkeit (Zahlenreihen)</Text>
        <Text style={{...styles.desc, color: theme.text}}>
          {step === 'f_listen' && "Hören Sie die Zahlenreihe."}
          {step === 'f_recall' && "Wiederholen Sie die Zahlen in der GLEICHEN Reihenfolge."}
          {step === 'b_listen' && "Hören Sie die Zahlenreihe."}
          {step === 'b_recall' && "Wiederholen Sie die Zahlen nun RÜCKWÄRTS."}
        </Text>
      </View>

      <View style={styles.centerArea}>
        {(step === 'f_listen' || step === 'b_listen') && (
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: isSpeaking ? '#f5f5f5' : theme.primary }]}
            onPress={() => playDigits(step === 'f_listen' ? FORWARD_SEQ : ["2", "4", "7"], step === 'f_listen' ? "Zahlen vorwärts" : "Zahlen für rückwärts")}
            disabled={isSpeaking}
          >
            <MaterialCommunityIcons name="volume-high" size={50} color={isSpeaking ? theme.primary : theme.darkContrast} />
            <Text style={[styles.btnText, { color: isSpeaking ? theme.primary : theme.darkContrast }]}>
              {isSpeaking ? "Zahlen werden vorgelesen..." : "Zahlen jetzt anhören"}
            </Text>
          </TouchableOpacity>
        )}

        {step === 'f_recall' && renderDigitsDisplay(FORWARD_SEQ)}
        {step === 'b_recall' && renderDigitsDisplay(BACKWARD_SEQ)}

        <View style={styles.feedbackContainer}>
           <Text style={styles.transcriptText}>
             {transcript ? `Erkannt: ${transcript}` : "Ich höre zu..."}
           </Text>
        </View>

        <TouchableOpacity 
          style={[styles.nextBtn, { opacity: isSpeaking ? 0.5 : 1, backgroundColor: theme.primary }]} 
          onPress={handleNextStep}
          disabled={isSpeaking}
        >
          <Text style={{...styles.nextBtnText, color: theme.darkContrast}}>
            {step === 'b_recall' ? "Aufgabe beenden" : "Nächster Schritt"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  textContainer: { marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold' },
  desc: { fontSize: 14, color: '#666', marginTop: 5 },
  centerArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  actionBtn: { padding: 30, borderRadius: 20, alignItems: 'center', width: '80%' },
  btnText: { marginTop: 10, fontSize: 16, fontWeight: 'bold' },
  digitGrid: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  digitBox: { width: 55, height: 70, borderWidth: 2, borderColor: '#eee', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  digitBoxActive: { borderColor: '#2ecc71', backgroundColor: '#f0fff4' },
  digitText: { fontSize: 28, fontWeight: 'bold' },
  feedbackContainer: { height: 40, marginBottom: 20 },
  transcriptText: { fontStyle: 'italic', color: '#aaa', fontSize: 14 },
  nextBtn: { marginTop: 20, paddingVertical: 15, paddingHorizontal: 60, borderRadius: 12 },
  nextBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});