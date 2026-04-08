import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const NAMING_ANIMALS = [
  { label: 'löwe', emoji: '🦁' },
  { label: 'nashorn', uuid: 'rhino', labelAlt: 'rhinozeros', emoji: '🦏' },
  { label: 'kamel', emoji: '🐪' }
];

export default function MocaNaming({ theme, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const recognitionRef = useRef(null);

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
        .join(' ').toLowerCase();
      setTranscript(current);

      const target = NAMING_ANIMALS[currentIndex];
      if (current.includes(target.label) || (target.labelAlt && current.includes(target.labelAlt))) {
        setIsCorrect(true);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  useEffect(() => {
    startListening();
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [currentIndex]);

  const handleNextAnimal = () => {
    if (currentIndex < 2) {
      setCurrentIndex(prev => prev + 1);
      setTranscript('');
      setIsCorrect(false);
    } else {
      // Alle 3 Tiere durchlaufen
      onComplete(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>3. Benennen</Text>
        <Text style={styles.desc}>Bitte benennen Sie das abgebildete Tier laut.</Text>
      </View>

      <View style={styles.namingArea}>
        <View style={[styles.emojiCircle, { borderColor: isCorrect ? '#2ecc71' : '#eee' }]}>
          <Text style={styles.emoji}>{NAMING_ANIMALS[currentIndex].emoji}</Text>
        </View>

        <View style={styles.transcriptBox}>
          <Text style={[styles.transcriptText, isCorrect && { color: '#2ecc71', fontWeight: 'bold' }]}>
            {isCorrect ? 'Erkannt!' : (transcript || 'Ich höre zu...')}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.nextAnimalBtn, { backgroundColor: theme.primary }]} 
          onPress={handleNextAnimal}
        >
          <Text style={styles.nextAnimalBtnText}>
            {currentIndex < 2 ? 'Nächstes Tier' : 'Benennen abschließen'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  textContainer: { marginBottom: 30 },
  title: { fontSize: 18, fontWeight: 'bold' },
  desc: { fontSize: 14, color: '#666', marginTop: 5 },
  namingArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emojiCircle: { width: 220, height: 220, borderRadius: 110, borderWidth: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fcfcfc', marginBottom: 20 },
  emoji: { fontSize: 120 },
  transcriptBox: { height: 60, justifyContent: 'center', marginBottom: 30 },
  transcriptText: { fontSize: 18, color: '#888', fontStyle: 'italic', textAlign: 'center' },
  nextAnimalBtn: { paddingVertical: 12, paddingHorizontal: 40, borderRadius: 10 },
  nextAnimalBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});