import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, PanResponder, Alert, ActivityIndicator } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useResults } from '../context/ResultContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ExplanationModal from '../components/ExplanationModal';

// Alle 25 Punkte für Teil A (1 bis 25) - Exakt aus Ihrer Datei übernommen
const circlesDataA = [
  { id: 1, label: '1', x: 45, y: 60, topLabel: 'Anfang' },
  { id: 2, label: '2', x: 55, y: 30 },
  { id: 3, label: '3', x: 80, y: 50 },
  { id: 4, label: '4', x: 65, y: 40 },
  { id: 5, label: '5', x: 70, y: 80 },
  { id: 6, label: '6', x: 20, y: 85 },
  { id: 7, label: '7', x: 15, y: 45 },
  { id: 8, label: '8', x: 35, y: 35 },
  { id: 9, label: '9', x: 25, y: 75 },
  { id: 10, label: '10', x: 35, y: 70 },
  { id: 11, label: '11', x: 60, y: 90 },
  { id: 12, label: '12', x: 10, y: 90 },
  { id: 13, label: '13', x: 25, y: 55 },
  { id: 14, label: '14', x: 10, y: 65 },
  { id: 15, label: '15', x: 5, y: 15 },
  { id: 16, label: '16', x: 20, y: 25 },
  { id: 17, label: '17', x: 45, y: 10 },
  { id: 18, label: '18', x: 35, y: 20 },
  { id: 19, label: '19', x: 70, y: 15 },
  { id: 20, label: '20', x: 55, y: 15 },
  { id: 21, label: '21', x: 90, y: 10 },
  { id: 22, label: '22', x: 85, y: 35 },
  { id: 23, label: '23', x: 90, y: 90 },
  { id: 24, label: '24', x: 75, y: 55 },
  { id: 25, label: '25', x: 80, y: 85, topLabel: 'Ende' },
];

// Teil B: Wechsel zwischen 13 Zahlen und 12 Buchstaben (1-A-2-B...-13)
const circlesDataB = [
  { id: 1, label: '1', x: 50, y: 50, topLabel: 'Anfang' },
  { id: 2, label: 'A', x: 70, y: 20 },
  { id: 3, label: '2', x: 30, y: 20 },
  { id: 4, label: 'B', x: 15, y: 45 },
  { id: 5, label: '3', x: 30, y: 80 },
  { id: 6, label: 'C', x: 70, y: 80 },
  { id: 7, label: '4', x: 85, y: 45 },
  { id: 8, label: 'D', x: 80, y: 10 },
  { id: 9, label: '5', x: 20, y: 10 },
  { id: 10, label: 'E', x: 5, y: 55 },
  { id: 11, label: '6', x: 15, y: 90 },
  { id: 12, label: 'F', x: 85, y: 90 },
  { id: 13, label: '7', x: 95, y: 55 },
  { id: 14, label: 'G', x: 55, y: 10 },
  { id: 15, label: '8', x: 45, y: 90 },
  { id: 16, label: 'H', x: 5, y: 25 },
  { id: 17, label: '9', x: 95, y: 25 },
  { id: 18, label: 'I', x: 40, y: 35 },
  { id: 19, label: '10', x: 60, y: 35 },
  { id: 20, label: 'J', x: 60, y: 65 },
  { id: 21, label: '11', x: 40, y: 65 },
  { id: 22, label: 'K', x: 20, y: 35 },
  { id: 23, label: '12', x: 80, y: 35 },
  { id: 24, label: 'L', x: 80, y: 65 },
  { id: 25, label: '13', x: 20, y: 65, topLabel: 'Ende' },
];

export default function TMTScreen({ t, theme, onBack }) {
  const { addResult } = useResults();

  const [phase, setPhase] = useState('A'); 
  const [modalKey, setModalKey] = useState('tmt');
  const [showExplanation, setShowExplanation] = useState(true);
  const [testStarted, setTestStarted] = useState(false);

  const [showLoading, setShowLoading] = useState(false); 
  
  const [boardLayout, setBoardLayout] = useState({ width: 0, height: 0 });
  const [nextNumber, setNextNumber] = useState(2);
  const [completedLines, setCompletedLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(null);
  
  const phaseRef = useRef('A');
  const startTimeRef = useRef(null);
  const nextNumberRef = useRef(2);
  const circlesRef = useRef([]);
  const dragStartRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const lastHitTimeRef = useRef(0);

  const activeData = phase === 'A' ? circlesDataA : circlesDataB;

  useEffect(() => { nextNumberRef.current = nextNumber; }, [nextNumber]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const circlesWithPixels = useMemo(() => {
    if (boardLayout.width === 0) return [];
    return activeData.map((c) => ({
      ...c,
      px: (c.x / 100) * boardLayout.width,
      py: (c.y / 100) * boardLayout.height,
    }));
  }, [boardLayout, phase]);

  useEffect(() => { circlesRef.current = circlesWithPixels; }, [circlesWithPixels]);

  const startPhaseB = () => {
    setPhase('B');
    phaseRef.current = 'B';
    setNextNumber(2);
    setCompletedLines([]);
    setCurrentLine(null);
    startTimeRef.current = null;
    nextNumberRef.current = 2;
    dragStartRef.current = null;
    lastHitTimeRef.current = 0;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        offsetRef.current = { x: 0, y: 0 };
        const currentTarget = nextNumberRef.current;
        if (currentTarget > 25) return;

        const startCircle = circlesRef.current.find(c => c.id === (currentTarget - 1));
        
        if (startCircle && startCircle.px !== undefined) {
           if (currentTarget === 2 && startTimeRef.current === null) {
             startTimeRef.current = Date.now();
           }
           dragStartRef.current = { x: startCircle.px, y: startCircle.py };
           setCurrentLine({
             startX: startCircle.px, startY: startCircle.py,
             endX: startCircle.px, endY: startCircle.py,
           });
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!dragStartRef.current || nextNumberRef.current > 25) return;

        const startX = dragStartRef.current.x;
        const startY = dragStartRef.current.y;
        const newEndX = startX + (gestureState.dx - offsetRef.current.x);
        const newEndY = startY + (gestureState.dy - offsetRef.current.y);
        setCurrentLine({ startX, startY, endX: newEndX, endY: newEndY });

        const targetCircle = circlesRef.current.find(c => c.id === nextNumberRef.current);

        if (targetCircle && targetCircle.px !== undefined) {
          const distance = Math.sqrt(
            Math.pow(newEndX - targetCircle.px, 2) + Math.pow(newEndY - targetCircle.py, 2)
          );

          // Wenn der Zielkreis berührt wird (Abstand < 30 Pixel)
          if (distance < 30) {
            const now = Date.now();
            if (now - lastHitTimeRef.current < 250) return; 

            const newLine = { startX: startX, startY: startY, endX: targetCircle.px, endY: targetCircle.py };
            setCompletedLines(prev => [...prev, newLine]);
            lastHitTimeRef.current = now;

            // PRÜFUNG: Ist das der letzte Kreis (25)?
            if (nextNumberRef.current === 25) {
                const totalSeconds = ((Date.now() - startTimeRef.current) / 1000).toFixed(2);
                
                // Blockiert weitere Linien
                nextNumberRef.current = 26; 
                setNextNumber(26);
                
                // Löst die Beendigung aus
                handleFinishPhase(totalSeconds);
                return;
            }

            // Normaler nächster Punkt
            nextNumberRef.current += 1;
            setNextNumber(prev => prev + 1);
            dragStartRef.current = { x: targetCircle.px, y: targetCircle.py };
            offsetRef.current = { x: gestureState.dx, y: gestureState.dy };
            setCurrentLine({
                startX: targetCircle.px, startY: targetCircle.py,
                endX: targetCircle.px, endY: targetCircle.py
            });
          }
        }
      },
      onPanResponderRelease: () => {
        setCurrentLine(null);
        dragStartRef.current = null;
      },
    })
  ).current;

  const handleFinishPhase = async (time) => {
    setCurrentLine(null);
    dragStartRef.current = null;

    const currentPhase = phaseRef.current;
    const testId = currentPhase === 'A' ? 'tmt_a' : 'tmt_b';
    await addResult(testId, { totalTimeSeconds: time }, time);

    if (currentPhase === 'A') {
      
      setShowLoading(true);
      setTimeout(() => {
        startPhaseB();
        setShowLoading(false);
      }, 1500);

    } else {
      setShowLoading(true);
      setTimeout(() => {
        onBack();
        setShowLoading(false);
      }, 1500);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: "transparent" }]}>
      <ExplanationModal 
        visible={showExplanation} 
        onClose={() => {
          setShowExplanation(false);
          setTestStarted(true);
        }} 
        testKey="tmt"
        theme={theme}
        isRunning={testStarted && modalKey !== 'tmt_b'}
      />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 18 }}>← Zurück</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>TMT - Teil {phase}</Text>
        <TouchableOpacity style={{position: 'absolute', right: 0}} onPress={() => setShowExplanation(true)}>
          <MaterialCommunityIcons name="help-circle-outline" size={28} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {
        showLoading ?

        <View style={styles.boardContainer}>
          <View style={[styles.board, { backgroundColor: theme.card, borderColor: theme.border, justifyContent: "center", alignItems: "center" }]} >
            <ActivityIndicator size="large" color={theme.text} />
          </View>
        </View>

        :

        <View style={styles.boardContainer}>
          <View 
              style={[styles.board, { backgroundColor: theme.card, borderColor: theme.border }]} 
              onLayout={(event) => {
                  const { width, height } = event.nativeEvent.layout;
                  setBoardLayout({ width, height });
              }}
              {...panResponder.panHandlers}
          >
              <Svg height="100%" width="100%" style={styles.svgLayer}>
                {completedLines.map((line, index) => (
                  <Line key={index} x1={line.startX} y1={line.startY} x2={line.endX} y2={line.endY} stroke={theme.text} strokeWidth="2" />
                ))}
                {currentLine && (
                  <Line x1={currentLine.startX} y1={currentLine.startY} x2={currentLine.endX} y2={currentLine.endY} stroke={theme.primary} strokeWidth="3" />
                )}
              </Svg>

              {activeData.map((circle) => (
                <View
                    key={circle.id}
                    style={[
                      styles.circle,
                      { left: `${circle.x}%`, top: `${circle.y}%`, borderColor: theme.text },
                      circle.id < nextNumber ? { backgroundColor: theme.greenish } : { backgroundColor: theme.card }
                    ]}
                >
                    {circle.topLabel && <Text style={[styles.labelAbove, { color: theme.text }]}>{circle.topLabel}</Text>}
                    <Text style={[styles.text, { color: theme.text }]}>{circle.label}</Text>
                </View>
              ))}
          </View>
        </View>

       }
      
      <View style={[styles.infoBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <Text style={[styles.infoText, { color: theme.text }]}>
            {nextNumber <= 25 ? `${t.tmt.search} ${activeData[nextNumber-1].label}` : t.tmt.done}
          </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 30 },
  title: { fontSize: 24, fontWeight: 'bold' },
  boardContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  board: { width: '100%', maxWidth: 800, aspectRatio: 0.75, borderWidth: 1, borderRadius: 15, position: 'relative', overflow: 'hidden' },
  svgLayer: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  circle: { position: 'absolute', width: 40, height: 40, borderRadius: 20, borderWidth: 2, justifyContent: 'center', alignItems: 'center', transform: [{ translateX: -20 }, { translateY: -20 }], zIndex: 2, pointerEvents: 'none' },
  text: { fontSize: 16, fontWeight: 'bold' },
  labelAbove: { position: 'absolute', top: -25, fontSize: 12, width: 80, textAlign: 'center' },
  infoBar: { padding: 25, borderTopWidth: 1, alignItems: 'center', borderTopRightRadius: 20, borderTopLeftRadius: 20 },
  infoText: { fontSize: 22, fontWeight: 'bold' }
});