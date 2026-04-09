import React, { useState, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, View, PanResponder, Platform } from 'react-native';
import Svg, { Line } from 'react-native-svg';

// 1:1 Datenstruktur aus TMTScreen, aber mit MoCA-Positionen
const mocaCirclesData = [
  { id: 1, label: '1', x: 60, y: 70, topLabel: 'Anfang' },
  { id: 2, label: 'A', x: 40, y: 60 },
  { id: 3, label: '2', x: 20, y: 52 },
  { id: 4, label: 'B', x: 43, y: 40 },
  { id: 5, label: '3', x: 66, y: 42 },
  { id: 6, label: 'C', x: 60, y: 55 },
  { id: 7, label: '4', x: 80, y: 56 },
  { id: 8, label: 'D', x: 81, y: 77 },
  { id: 9, label: '5', x: 40, y: 85 },
  { id: 10, label: 'E', x: 22, y: 68, topLabel: 'Ende' },
];

export default function MocaTrails({ theme, onComplete }) {
  const [boardLayout, setBoardLayout] = useState({ width: 0, height: 0 });
  const [nextNumber, setNextNumber] = useState(2);
  const [completedLines, setCompletedLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(null);
  
  const nextNumberRef = useRef(2);
  const circlesRef = useRef([]);
  const dragStartRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const lastHitTimeRef = useRef(0);

  // NEU: Ref für die Zeitmessung für die Masterarbeit
  const startTimeRef = useRef(null);

  // Exakte Synchronisation wie in TMTScreen
  useEffect(() => { nextNumberRef.current = nextNumber; }, [nextNumber]);

  const circlesWithPixels = useMemo(() => {
    if (boardLayout.width === 0) return [];
    return mocaCirclesData.map((c) => ({
      ...c,
      px: (c.x / 100) * boardLayout.width,
      py: (c.y / 100) * boardLayout.height,
    }));
  }, [boardLayout]);

  useEffect(() => { circlesRef.current = circlesWithPixels; }, [circlesWithPixels]);

  // 1:1 PanResponder Logik aus deinem TMTScreen
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        offsetRef.current = { x: 0, y: 0 };
        const currentTarget = nextNumberRef.current;
        if (currentTarget > 10) return; 

        const startCircle = circlesRef.current.find(c => c.id === (currentTarget - 1));
        
        if (startCircle && startCircle.px !== undefined) {
           dragStartRef.current = { x: startCircle.px, y: startCircle.py };
           setCurrentLine({
             startX: startCircle.px, startY: startCircle.py,
             endX: startCircle.px, endY: startCircle.py,
           });
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!dragStartRef.current || nextNumberRef.current > 10) return;

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

            // NEU: Zeitmessung beim ersten erfolgreichen Hit (Verbindung von 1 zu A) starten
            if (!startTimeRef.current) {
                startTimeRef.current = now;
            }

            const newLine = { startX: startX, startY: startY, endX: targetCircle.px, endY: targetCircle.py };
            
            setCompletedLines(prev => [...prev, newLine]);
            lastHitTimeRef.current = now;

            if (targetNum === 10) { 
                const endTime = Date.now();
                const duration = (endTime - startTimeRef.current) / 1000;

                nextNumberRef.current = 11; 
                setNextNumber(11);
                setCurrentLine(null);
                dragStartRef.current = null;

                // ERWEITERT: Datenobjekt für Masterarbeit
                onComplete({
                    duration_active_sec: duration.toFixed(2),
                    completed: true,
                    path_raw: mocaCirclesData.map(c => c.label)
                });
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
    <View style={styles.full}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>1. Visuospatial / Exekutiv</Text>
        <Text style={styles.desc}>Verbinden Sie die Kreise: 1 - A - 2 - B - 3 - C - 4 - D - 5 - E</Text>
      </View>

      <View 
        style={[
          styles.board, 
          { backgroundColor: theme.card, borderColor: theme.border }
        ]} 
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

        {mocaCirclesData.map((circle) => (
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
            <Text style={[styles.circleText, { color: theme.text }]}>{circle.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  full: { flex: 1, width: '100%' },
  textContainer: { marginBottom: 15 },
  title: { fontSize: 18, fontWeight: 'bold' },
  desc: { fontSize: 13, color: '#888' },
  board: { 
    width: '100%', 
    flex: 1, 
    minHeight: 500, 
    borderWidth: 1, 
    borderRadius: 15, 
    position: 'relative', 
    overflow: 'hidden',
    ...Platform.select({
      web: { userSelect: 'none', cursor: 'crosshair' }
    })
  },
  svgLayer: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  circle: { 
    position: 'absolute', width: 40, height: 40, borderRadius: 20, borderWidth: 2, 
    justifyContent: 'center', alignItems: 'center', 
    transform: [{ translateX: -20 }, { translateY: -20 }], 
    zIndex: 2, pointerEvents: 'none' 
  },
  circleText: { fontSize: 16, fontWeight: 'bold' },
  labelAbove: { position: 'absolute', top: -25, fontSize: 10, width: 80, textAlign: 'center', fontWeight: 'bold' }
});