import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useResults } from '../context/ResultContext';

const PHASES = [
  'intro', 'memory_learn', 'naming', 'attention_digits', 
  'vigilance', 'calculation', 'language', 'abstraction', 'recall', 'summary'
];

const MEMORY_WORDS = ["Gesicht", "Samt", "Kirche", "Gänseblümchen", "Rot"];
const NAMING_TASKS = [
  { id: 'lion', label: 'Löwe', emoji: '🦁' },
  { id: 'rhino', label: 'Nashorn', emoji: '🦏' },
  { id: 'camel', label: 'Kamel', emoji: '🐪' }
];

// Keywords für die Abstraktion (Zug - Fahrrad)
const ABSTRACTION_KEYWORDS = ['verkehr', 'fahrzeug', 'transport', 'fahren', 'reisen', 'bewegen'];

export default function MoCAScreen({ t, theme, onBack }) {
  const { addResult } = useResults();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [fullTranscript, setFullTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [vigilanceLetter, setVigilanceLetter] = useState("");
  
  const recognitionRef = useRef(null);
  const currentPhase = PHASES[phaseIndex];
  const progress = (phaseIndex / (PHASES.length - 1)) * 100;

  // --- STT LOGIK ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (recognitionRef.current) recognitionRef.current.stop();

    const recognition = new SpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map(r => r[0].transcript).join(' ').toLowerCase();
      setFullTranscript(transcript);
    };
    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
  };

  const resetSpeechAndNextStep = () => {
    stopListening();
    setFullTranscript("");
    // Kurze Verzögerung für den Reset, dann Neustart der Erkennung
    setTimeout(() => {
        if (['naming', 'language', 'abstraction', 'recall', 'calculation', 'attention_digits'].includes(currentPhase)) {
            startListening();
        }
    }, 100);
  };

  const nextPhase = () => {
    stopListening();
    setFullTranscript("");
    setStep(0);
    setVigilanceLetter("");
    if (phaseIndex < PHASES.length - 1) setPhaseIndex(prev => prev + 1);
  };

  // --- SPEZIFISCHE FEEDBACK LOGIK ---
  const isNamingCorrect = currentPhase === 'naming' && fullTranscript.includes(NAMING_TASKS[step].label.toLowerCase());
  const isAbstractionCorrect = currentPhase === 'abstraction' && ABSTRACTION_KEYWORDS.some(k => fullTranscript.includes(k));

  const startVigilance = () => {
    const seq = "F B A".split(" ");
    let i = 0;
    const interval = setInterval(() => {
      if (i < seq.length) {
        setVigilanceLetter(seq[i]);
        Speech.speak(seq[i], { rate: 1.1 });
        i++;
      } else {
        clearInterval(interval);
        setVigilanceLetter("ENDE");
      }
    }, 1500);
  };

  useEffect(() => {
    Speech.stop();
    if (['naming', 'language', 'abstraction', 'recall', 'calculation', 'attention_digits'].includes(currentPhase)) {
      startListening();
    }
    return () => stopListening();
  }, [currentPhase]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={{ color: theme.primary, fontSize: 18, fontWeight: 'bold' }}>← Abbruch</Text></TouchableOpacity>
        <View style={styles.progressWrapper}>
          <Text style={styles.progressText}>MoCA Teil {phaseIndex} von 9</Text>
          <View style={styles.progressBarBg}><View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: theme.primary }]} /></View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.sheet, { backgroundColor: '#fff', borderColor: theme.border }]}>
          
          {/* 0. INTRO */}
          {currentPhase === 'intro' && (
            <View style={styles.centered}>
              <MaterialCommunityIcons name="brain" size={80} color={theme.primary} />
              <Text style={styles.instruction}>Willkommen zum eMoCA Light. Bitte nutzen Sie Kopfhörer oder schalten Sie den Ton laut.</Text>
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={nextPhase}><Text style={styles.btnText}>Test starten</Text></TouchableOpacity>
            </View>
          )}

          {/* 1. MEMORY LEARN (Auditiv) */}
          {currentPhase === 'memory_learn' && (
            <View style={styles.centered}>
              <MaterialCommunityIcons name="volume-high" size={100} color={theme.primary} />
              <Text style={styles.statusText}>Lernphase</Text>
              <Text style={styles.instruction}>Hören Sie die Wörter aufmerksam an:</Text>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#f0f0f0' }]} onPress={() => Speech.speak("Merken Sie sich: " + MEMORY_WORDS.join(", "))}>
                <MaterialCommunityIcons name="play" size={30} color={theme.primary} />
                <Text style={{marginLeft: 10, fontWeight: 'bold'}}>Wörter vorlesen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary, marginTop: 40 }]} onPress={nextPhase}><Text style={styles.btnText}>Weiter</Text></TouchableOpacity>
            </View>
          )}

          {/* 2. NAMING (Reset fixiert) */}
          {currentPhase === 'naming' && (
            <View style={styles.centered}>
              <View style={[styles.emojiCircle, { borderColor: isNamingCorrect ? '#2ecc71' : '#eee' }]}><Text style={styles.emojiDisplay}>{NAMING_TASKS[step].emoji}</Text></View>
              <Text style={[styles.feedbackText, { color: isNamingCorrect ? '#2ecc71' : '#666' }]}>{isNamingCorrect ? "Erkannt! ✓" : "Wie heißt dieses Tier?"}</Text>
              <View style={styles.transcriptBox}><Text style={styles.transcriptText}>"{fullTranscript || "..."}"</Text></View>
              <TouchableOpacity 
                style={[styles.primaryBtn, { backgroundColor: theme.primary }]} 
                onPress={() => { if(isNamingCorrect) setScore(s => s + 1); if(step < 2) { setStep(s => s + 1); resetSpeechAndNextStep(); } else { nextPhase(); } }}
              >
                <Text style={styles.btnText}>{step < 2 ? "Nächstes Tier" : "Weiter"}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 3. ATTENTION DIGITS (Auditiv) */}
          {currentPhase === 'attention_digits' && (
            <View style={styles.centered}>
              <MaterialCommunityIcons name="numeric" size={80} color={theme.primary} />
              <Text style={styles.instruction}>Hören Sie die Zahlenreihe und sprechen Sie sie nach:</Text>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#f0f0f0' }]} onPress={() => Speech.speak("2, 1, 8, 5, 4", { rate: 0.8 })}>
                <MaterialCommunityIcons name="play" size={30} color={theme.primary} />
                <Text style={{marginLeft: 10, fontWeight: 'bold'}}>Zahlen anhören</Text>
              </TouchableOpacity>
              <View style={styles.transcriptBox}><Text style={styles.transcriptText}>"{fullTranscript}"</Text></View>
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={nextPhase}><Text style={styles.btnText}>Weiter</Text></TouchableOpacity>
            </View>
          )}

          {/* 4. VIGILANZ */}
          {currentPhase === 'vigilance' && (
            <View style={styles.centered}>
              <Text style={styles.vigilanceChar}>{vigilanceLetter || "Ready?"}</Text>
              {!vigilanceLetter ? (
                <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={startVigilance}><Text style={styles.btnText}>Starten</Text></TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.tapArea} onPress={() => { if(vigilanceLetter === "A") setScore(s => s + 0.1) }}><MaterialCommunityIcons name="gesture-tap" size={80} color={theme.primary} /></TouchableOpacity>
              )}
              {vigilanceLetter === "ENDE" && <TouchableOpacity style={[styles.primaryBtn, {marginTop: 20, backgroundColor: theme.primary}]} onPress={nextPhase}><Text style={styles.btnText}>Weiter</Text></TouchableOpacity>}
            </View>
          )}

          {/* 5. CALCULATION */}
          {currentPhase === 'calculation' && (
            <View style={styles.centered}>
              <Text style={styles.bigLetter}>100 - 7</Text>
              <Text style={styles.instruction}>Rechnen Sie in 7er-Schritten rückwärts.</Text>
              <View style={styles.transcriptBox}><Text style={styles.transcriptText}>{fullTranscript}</Text></View>
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={nextPhase}><Text style={styles.btnText}>Fertig</Text></TouchableOpacity>
            </View>
          )}

          {/* 6. LANGUAGE (Auditiv) */}
          {currentPhase === 'language' && (
            <View style={styles.centered}>
              <MaterialCommunityIcons name="account-voice" size={80} color={theme.primary} />
              <Text style={styles.instruction}>Hören Sie den Satz und sprechen Sie ihn exakt nach:</Text>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#f0f0f0' }]} onPress={() => Speech.speak("Ich weiß nur, dass man heute Hans zur Hilfe rufen soll.")}>
                <MaterialCommunityIcons name="play" size={30} color={theme.primary} />
                <Text style={{marginLeft: 10, fontWeight: 'bold'}}>Satz anhören</Text>
              </TouchableOpacity>
              <View style={styles.transcriptBox}><Text style={styles.transcriptText}>"{fullTranscript}"</Text></View>
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={nextPhase}><Text style={styles.btnText}>Weiter</Text></TouchableOpacity>
            </View>
          )}

          {/* 7. ABSTRACTION (Feedback eingebaut) */}
          {currentPhase === 'abstraction' && (
            <View style={styles.centered}>
              <Text style={styles.bigLetter}>Zug — Fahrrad</Text>
              <Text style={[styles.feedbackText, { color: isAbstractionCorrect ? '#2ecc71' : '#666' }]}>
                {isAbstractionCorrect ? "Korrekt! ✓" : "Was haben diese gemeinsam?"}
              </Text>
              <View style={styles.transcriptBox}><Text style={styles.transcriptText}>"{fullTranscript}"</Text></View>
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={nextPhase}><Text style={styles.btnText}>Weiter</Text></TouchableOpacity>
            </View>
          )}

          {/* 8. RECALL (Feedback eingebaut) */}
          {currentPhase === 'recall' && (
            <View style={styles.centered}>
              <Text style={styles.instruction}>Nennen Sie die Wörter vom Anfang:</Text>
              <View style={styles.wordList}>
                {MEMORY_WORDS.map((w, i) => {
                  const found = fullTranscript.includes(w.toLowerCase());
                  return (
                    <View key={i} style={[styles.wordBadge, { backgroundColor: found ? '#90EE90' : '#f0f0f0' }]}>
                      <Text style={{color: found ? '#000' : '#ccc'}}>{found ? w : '???'}</Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.transcriptBox}><Text style={styles.transcriptText}>"{fullTranscript}"</Text></View>
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={nextPhase}><Text style={styles.btnText}>Test abschließen</Text></TouchableOpacity>
            </View>
          )}

          {/* 9. SUMMARY */}
          {currentPhase === 'summary' && (
            <View style={styles.centered}>
              <MaterialCommunityIcons name="check-decagram" size={100} color="#2ecc71" />
              <Text style={styles.statusText}>Test beendet</Text>
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={onBack}><Text style={styles.btnText}>Speichern</Text></TouchableOpacity>
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
  progressWrapper: { flex: 1 },
  progressText: { fontSize: 12, fontWeight: 'bold', color: '#888', marginBottom: 4 },
  progressBarBg: { height: 6, backgroundColor: '#eee', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%' },
  scrollContent: { padding: 20, alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  sheet: { width: '100%', maxWidth: 850, minHeight: 650, borderRadius: 25, borderWidth: 1, elevation: 5, padding: 40, justifyContent: 'center' },
  centered: { alignItems: 'center', width: '100%' },
  instruction: { textAlign: 'center', fontSize: 18, marginBottom: 25, color: '#444', lineHeight: 26 },
  statusText: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  wordDisplay: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', letterSpacing: 1 },
  bigLetter: { fontSize: 50, fontWeight: 'bold', color: '#34495e', marginBottom: 20 },
  emojiCircle: { width: 180, height: 180, borderRadius: 90, borderWidth: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emojiDisplay: { fontSize: 100 },
  feedbackText: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  transcriptBox: { width: '100%', minHeight: 80, backgroundColor: '#f7fafc', borderRadius: 15, padding: 15, marginVertical: 15, borderWidth: 1, borderColor: '#edf2f7', justifyContent: 'center' },
  transcriptText: { fontSize: 16, fontStyle: 'italic', textAlign: 'center', color: '#4a5568' },
  primaryBtn: { paddingVertical: 16, paddingHorizontal: 50, borderRadius: 15 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  vigilanceChar: { fontSize: 120, fontWeight: 'bold', marginBottom: 20 },
  tapArea: { width: '100%', height: 150, backgroundColor: '#f0f0f0', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  wordList: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 20 },
  wordBadge: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd' }
});