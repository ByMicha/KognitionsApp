import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, PanResponder, Alert, Platform } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useResults } from '../context/ResultContext';

const circlesData = [
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

export default function TMTScreen({ t, theme, onBack }) {
  const { addResult } = useResults(); // Speicher-Funktion laden
  
  const [boardLayout, setBoardLayout] = useState({ width: 0, height: 0 });
  const [nextNumber, setNextNumber] = useState(2);
  const [completedLines, setCompletedLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(null);
  
  // Zeitmessung Ref statt State (verhindert Stale Closures im PanResponder)
  const startTimeRef = useRef(null);
  const [finalTime, setFinalTime] = useState(null);

  const nextNumberRef = useRef(2);
  const circlesRef = useRef([]);
  const dragStartRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const lastHitTimeRef = useRef(0);

  useEffect(() => { nextNumberRef.current = nextNumber; }, [nextNumber]);

  const circlesWithPixels = useMemo(() => {
    if (boardLayout.width === 0) return [];
    return circlesData.map((c) => ({
      ...c,
      px: (c.x / 100) * boardLayout.width,
      py: (c.y / 100) * boardLayout.height,
    }));
  }, [boardLayout]);

  useEffect(() => { circlesRef.current = circlesWithPixels; }, [circlesWithPixels]);

  const resetGame = () => {
    setNextNumber(2);
    setCompletedLines([]);
    setCurrentLine(null);
    startTimeRef.current = null; // Ref zurücksetzen
    setFinalTime(null);
    nextNumberRef.current = 2;
    dragStartRef.current = null;
    offsetRef.current = { x: 0, y: 0 };
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
           // Startzeit setzen beim allerersten Berühren von Kreis 1
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

        const targetNum = nextNumberRef.current;
        const targetCircle = circlesRef.current.find(c => c.id === targetNum);

        if (targetCircle && targetCircle.px !== undefined) {
          const distance = Math.sqrt(
            Math.pow(newEndX - targetCircle.px, 2) + Math.pow(newEndY - targetCircle.py, 2)
          );

          if (distance < 30) {
            const now = Date.now();
            if (now - lastHitTimeRef.current < 250) return; 

            const newLine = { startX: startX, startY: startY, endX: targetCircle.px, endY: targetCircle.py };
            
            // Wir berechnen den Pfad lokal, damit addResult den aktuellsten Stand hat
            let updatedLines;
            setCompletedLines(prev => {
              updatedLines = [...prev, newLine];
              return updatedLines;
            });
            
            lastHitTimeRef.current = now;

            if (targetNum === 25) {
                const endTime = Date.now();
                // Berechnung über den Ref verhindert "1970er-Zeitstempel"
                const totalSeconds = ((endTime - startTimeRef.current) / 1000).toFixed(2);
                
                nextNumberRef.current = 26; 
                setNextNumber(26);
                setFinalTime(totalSeconds);
                setCurrentLine(null);
                dragStartRef.current = null;
                
                // Ergebnis im ResultContext speichern
                addResult('tmt_a', { 
                  totalTimeSeconds: totalSeconds,
                  path: updatedLines || completedLines // Nutzt lokalen Stand falls verfügbar
                }, totalSeconds);

                setTimeout(() => {
                    if (Platform.OS === 'web') {
                        window.alert(`${t.tmt.success}\nZeit: ${totalSeconds}s`);
                    } else {
                        Alert.alert(t.tmt.done, `${t.tmt.success}\nZeit: ${totalSeconds}s`);
                    }
                }, 100);
                return;
            }

            nextNumberRef.current = targetNum + 1;
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 18 }}>← {t.backToMenu}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>{t.tmt.title}</Text>
      </View>

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
                <Line
                key={index}
                x1={line.startX} y1={line.startY}
                x2={line.endX} y2={line.endY}
                stroke={theme.text} 
                strokeWidth="2"
                />
            ))}
            {currentLine && (
                <Line
                x1={currentLine.startX} y1={currentLine.startY}
                x2={currentLine.endX} y2={currentLine.endY}
                stroke={theme.primary} 
                strokeWidth="3"
                />
            )}
            </Svg>

            {circlesData.map((circle) => (
            <View
                key={circle.id}
                style={[
                styles.circle,
                { left: `${circle.x}%`, top: `${circle.y}%`, borderColor: theme.text },
                circle.id < nextNumber ? { backgroundColor: '#90EE90' } : { backgroundColor: theme.card }
                ]}
            >
                {circle.topLabel && (
                    <Text style={[styles.labelAbove, { color: theme.text }]}>{circle.topLabel}</Text>
                )}
                <Text style={[styles.text, { color: theme.text }]}>{circle.label}</Text>
            </View>
            ))}
        </View>
      </View>
      
      <View style={[styles.infoBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <View>
            <Text style={[styles.infoText, { color: theme.text }]}>
              {nextNumber <= 25 ? `${t.tmt.search} ${nextNumber}` : t.tmt.done}
            </Text>
            {finalTime && (
              <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Zeit: {finalTime}s</Text>
            )}
          </View>
          <TouchableOpacity onPress={resetGame} style={[styles.resetButton, { backgroundColor: theme.primary }]}>
              <Text style={styles.resetButtonText}>{t.tmt.restart}</Text>
          </TouchableOpacity>
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
  infoBar: { padding: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1 },
  infoText: { fontSize: 22, fontWeight: 'bold' },
  resetButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  resetButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});