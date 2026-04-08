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
  const [correctCount, setCorrectCount] = useState(0); // Trackt, wie viele Zahlen in Folge korrekt waren
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  // --- AUDIO LOGIK ---
  const playDigits = (sequence, instruction) => {
    setIsSpeaking(true);
    // Laut Anweisung: 1 Zahl pro Sekunde vorlesen
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
      const current = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ');
      setTranscript(current);

      // Extrahiere alle Ziffern aus dem aktuellen Transkript
      const spokenDigits = current.match(/\d/g) || [];
      
      // Prüfe die Sequenz von vorne
      let matches = 0;
      for (let i = 0; i < spokenDigits.length; i++) {
        if (matches < targetSeq.length && spokenDigits[i] === targetSeq[matches]) {
          matches++;
        } else if (matches < targetSeq.length && spokenDigits[i] !== targetSeq[matches]) {
          // Sobald eine falsche Zahl in der Kette auftaucht, bricht die Wertung für diese Kette ab
          // (Optional: Man könnte hier auch strenger sein, aber für die Erkennung 
          // zählen wir die längste korrekte Kette von Beginn an)
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

  // --- NAVIGATION ---
  const handleNextStep = () => {
    if (step === 'f_listen') {
      setStep('f_recall');
    } else if (step === 'f_recall') {
      stopListening();
      setStep('b_listen');
    } else if (step === 'b_listen') {
      setStep('b_recall');
    } else if (step === 'b_recall') {
      stopListening();
      onComplete(true);
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
        <Text style={styles.title}>5. Aufmerksamkeit (Zahlenreihen)</Text>
        <Text style={styles.desc}>
          {step === 'f_listen' && "Hören Sie die Zahlenreihe: 2 - 1 - 8 - 5 - 4"}
          {step === 'f_recall' && "Wiederholen Sie die Zahlen in der GLEICHEN Reihenfolge."}
          {step === 'b_listen' && "Hören Sie die Zahlenreihe: 2 - 4 - 7"}
          {step === 'b_recall' && "Wiederholen Sie die Zahlen nun RÜCKWÄRTS (7 - 4 - 2)."}
        </Text>
      </View>

      <View style={styles.centerArea}>
        {(step === 'f_listen' || step === 'b_listen') && (
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: isSpeaking ? '#f5f5f5' : theme.primary }]}
            onPress={() => playDigits(step === 'f_listen' ? FORWARD_SEQ : ["2", "4", "7"], step === 'f_listen' ? "Zahlen vorwärts" : "Zahlen für rückwärts")}
            disabled={isSpeaking}
          >
            <MaterialCommunityIcons name="volume-high" size={50} color={isSpeaking ? theme.primary : "#fff"} />
            <Text style={[styles.btnText, { color: isSpeaking ? theme.primary : "#fff" }]}>
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
          <Text style={styles.nextBtnText}>
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