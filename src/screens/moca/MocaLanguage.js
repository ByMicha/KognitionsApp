import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as Speech from 'expo-speech';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TARGET_SENTENCE = "Der Dieb des grauen Autos wurde von der Polizei angehalten.";

export default function MocaLanguage({ theme, onComplete }) {
  const [phase, setPhase] = useState('intro'); // 'intro', 'listening', 'recording', 'result'
  const [transcript, setTranscript] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  // --- AUDIO AUSGABE ---
  const playSentence = () => {
    setIsSpeaking(true);
    Speech.speak(TARGET_SENTENCE, {
      language: 'de-DE',
      rate: 0.9,
      onDone: () => {
        setIsSpeaking(false);
        setPhase('recording');
        startListening();
      },
      onError: () => setIsSpeaking(false)
    });
  };

  // --- SPRACHEINGABE ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (recognitionRef.current) recognitionRef.current.stop();

    const recognition = new SpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const current = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setTranscript(current);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const handleValidation = () => {
    stopListening();
    
    // Einfacher Vergleich (Satzzeichen entfernen und Kleinschreibung)
    const cleanTarget = TARGET_SENTENCE.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").toLowerCase().trim();
    const cleanInput = transcript.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").toLowerCase().trim();
    
    const correct = cleanTarget === cleanInput;
    setIsCorrect(correct);
    setPhase('result');

    // ERWEITERT: Datenübergabe für die Masterarbeit
    onComplete({
      target_sentence: TARGET_SENTENCE,
      is_correct: correct,
      full_transcript: transcript,
      timestamp_finished: new Date().toISOString()
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={{...styles.title, color: theme.primary}}>8. Sprache (Nachsprechen)</Text>
      </View>

      {phase === 'intro' && (
        <View style={styles.centerArea}>
          <MaterialCommunityIcons name="account-voice" size={80} color={theme.primary} />
          <Text style={{...styles.desc, color: theme.text}}>
            Ich werde Ihnen nun einen Satz vorlesen. {"\n\n"}
            Hören Sie aufmerksam zu und wiederholen Sie den Satz danach <Text style={{fontWeight: 'bold'}}>exakt</Text> so, wie ich ihn gesagt habe.
          </Text>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: theme.primary }]} 
            onPress={() => {
                setPhase('listening');
                playSentence();
            }}
          >
            <Text style={{...styles.btnText, color: theme.darkContrast}}>Satz jetzt hören</Text>
          </TouchableOpacity>
        </View>
      )}

      {(phase === 'listening' || phase === 'recording') && (
        <View style={styles.centerArea}>
          <MaterialCommunityIcons 
            name={phase === 'listening' ? "volume-high" : "microphone"} 
            size={80} 
            color={phase === 'listening' ? theme.primary : theme.redish} 
          />
          <Text style={{...styles.statusText, color: theme.text}}>
            {phase === 'listening' ? "Bitte zuhören..." : "Sagen Sie den Satz jetzt nach:"}
          </Text>

          {phase === 'recording' && (
            <View style={{...styles.transcriptContainer, backgroundColor: theme.talkBox}}>
              <Text style={{...styles.transcriptLabel, color: "#4a4a4a"}}>Ihre Antwort:</Text>
              <Text style={{...styles.transcriptContent, color: theme.darkContrast}}>
                {transcript || "Ich höre zu..."}
              </Text>
            </View>
          )}

          {phase === 'recording' && (
            <TouchableOpacity 
              style={[styles.validateBtn, { backgroundColor: theme.primary }]} 
              onPress={handleValidation}
            >
              <Text style={{...styles.btnText, color: theme.darkContrast}}>Lösung abgeben</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {phase === 'result' && (
        <View style={styles.centerArea}>
          <MaterialCommunityIcons 
            name={isCorrect ? "check-circle" : "alert-circle"} 
            size={80} 
            color={isCorrect ? theme.greenish : theme.redish} 
          />
          <View style={[styles.resultBox, {backgroundColor: theme.talkBox, borderColor: isCorrect ? theme.greenish : theme.redish }]}>
            <Text style={{...styles.resultLabel, color: theme.grayish}}>Vorgegeben:</Text>
            <Text style={{...styles.resultTarget, color: theme.darkContrast}}>{TARGET_SENTENCE}</Text>
            
            <View style={styles.divider} />
            
            <Text style={{...styles.resultLabel, color: theme.grayish}}>Ihre Eingabe:</Text>
            <Text style={[styles.resultInput, { color: isCorrect ? theme.greenish : theme.redish }]}>
              {transcript}
            </Text>
          </View>
          <Text style={{...styles.finalHint, color: theme.grayish}}>Das Ergebnis wurde gespeichert.</Text>
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
  desc: { fontSize: 16, textAlign: 'center', color: '#444', lineHeight: 24, marginBottom: 40 },
  statusText: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 20, color: '#666' },
  actionBtn: { paddingVertical: 15, paddingHorizontal: 50, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  transcriptContainer: { width: '100%', backgroundColor: '#f9f9f9', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#eee', marginBottom: 30 },
  transcriptLabel: { fontSize: 12, color: '#aaa', fontWeight: 'bold', marginBottom: 5 },
  transcriptContent: { fontSize: 18, fontStyle: 'italic', textAlign: 'center', color: '#333' },
  validateBtn: { paddingVertical: 12, paddingHorizontal: 40, borderRadius: 10 },
  resultBox: { width: '100%', padding: 20, borderWidth: 2, borderRadius: 15, backgroundColor: '#fff', marginTop: 20 },
  resultLabel: { fontSize: 11, fontWeight: 'bold', color: '#aaa', textTransform: 'uppercase' },
  resultTarget: { fontSize: 16, color: '#333', marginBottom: 10, marginTop: 5 },
  resultInput: { fontSize: 16, fontWeight: 'bold', marginTop: 5 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  finalHint: { marginTop: 20, color: '#888', fontSize: 14, textAlign: 'center' },
  cancelLink: { marginTop: 30, padding: 10 },
  cancelText: { color: '#ff4444', textDecorationLine: 'underline', fontSize: 14 }
});