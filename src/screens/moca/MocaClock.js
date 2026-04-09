import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function MocaClock({ theme, onComplete }) {
  const [hourAngle, setHourAngle] = useState(270); 
  const [minuteAngle, setMinuteAngle] = useState(270);
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  // NEU: Zähler für die Klicks (Masterarbeit-Daten)
  const [totalClicks, setTotalClicks] = useState(0);
  const OPTIMAL_CLICKS = 3;

  const clockSize = 360; 
  const center = clockSize / 2;

  const moveHour = (direction) => {
    setTotalClicks(prev => prev + 1); // Klick registrieren
    setHourAngle(prev => (direction === 'next' ? (prev + 30) % 360 : (prev - 30 + 360) % 360));
  };

  const moveMinute = (direction) => {
    setTotalClicks(prev => prev + 1); // Klick registrieren
    setMinuteAngle(prev => (direction === 'next' ? (prev + 30) % 360 : (prev - 30 + 360) % 360));
  };

  const handleConfirm = () => {
    setIsConfirmed(true);
    
    // Berechnung der unnötigen Klicks
    const unnecessaryClicks = Math.max(0, totalClicks - OPTIMAL_CLICKS);

    // ERWEITERT: Detaillierte Datenübergabe an MoCAScreen
    onComplete({
      target_time: "11:10",
      final_angles: { hour: hourAngle, minute: minuteAngle },
      total_clicks: totalClicks,
      optimal_clicks: OPTIMAL_CLICKS,
      unnecessary_clicks: unnecessaryClicks,
      timestamp_confirmed: new Date().toISOString()
    });
  };

  const renderNumbers = () => {
    const numbers = [];
    for (let i = 1; i <= 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const r = center - 40;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      numbers.push(
        <SvgText key={i} x={x} y={y + 8} fontSize="20" fontWeight="bold" fill="#444" textAnchor="middle">
          {i}
        </SvgText>
      );
    }
    return numbers;
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={{...styles.title, color: theme.primary}}>2. Visuospatial / Exekutiv (Uhr)</Text>
        <Text style={{...styles.desc, color: theme.text}}>
          Stellen Sie die Uhrzeit auf: <Text style={{fontWeight: 'bold'}}>11:10 Uhr</Text>
        </Text>
      </View>

      <View style={[styles.clockFrame, isConfirmed && { opacity: 0.7 }]}>
        <View style={styles.clockShadow}>
          <Svg height={clockSize} width={clockSize}>
            <Circle cx={center} cy={center} r={center - 2} stroke="#ddd" strokeWidth="4" fill="#fcfcfc" />
            <Circle cx={center} cy={center} r={center - 8} stroke="#333" strokeWidth="2" fill="#fff" />
            
            {renderNumbers()}
            
            <G rotation={hourAngle} origin={`${center}, ${center}`}>
              <Line x1={center} y1={center} x2={center + 65} y2={center} stroke={theme.redish} strokeWidth="10" strokeLinecap="round" />
            </G>

            <G rotation={minuteAngle} origin={`${center}, ${center}`}>
              <Line x1={center} y1={center} x2={center + 120} y2={center} stroke="#333" strokeWidth="5" strokeLinecap="round" />
            </G>

            <Circle cx={center} cy={center} r={7} fill="#333" />
          </Svg>
        </View>
      </View>

      {!isConfirmed && (
        <View style={styles.controlsContainer}>
          <View style={styles.controlRow}>
            <Text style={{...styles.controlLabel, color: theme.text}}>Stunden</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity style={{...styles.arrowBtn, backgroundColor: theme.primary}} onPress={() => moveHour('prev')}>
                <MaterialCommunityIcons name="minus" size={24} color={theme.darkContrast} />
              </TouchableOpacity>
              <TouchableOpacity style={{...styles.arrowBtn, backgroundColor: theme.primary}} onPress={() => moveHour('next')}>
                <MaterialCommunityIcons name="plus" size={24} color={theme.darkContrast} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.controlRow}>
            <Text style={{...styles.controlLabel, color: theme.text}}>Minuten</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity style={{...styles.arrowBtn, backgroundColor: theme.primary}} onPress={() => moveMinute('prev')}>
                <MaterialCommunityIcons name="minus" size={24} color={theme.darkContrast} />
              </TouchableOpacity>
              <TouchableOpacity style={{...styles.arrowBtn, backgroundColor: theme.primary}} onPress={() => moveMinute('next')}>
                <MaterialCommunityIcons name="plus" size={24} color={theme.darkContrast} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: theme.primary }]} onPress={handleConfirm}>
            <Text style={{...styles.confirmBtnText, color: theme.darkContrast}}>Uhrzeit einloggen</Text>
          </TouchableOpacity>
        </View>
      )}

      {isConfirmed && (
        <View style={styles.successBox}>
          <MaterialCommunityIcons name="check-circle" size={24} color="#2ecc71" />
          <Text style={styles.successText}>Uhrzeit wurde bestätigt.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', width: '100%' },
  textContainer: { width: '100%', marginBottom: 15 },
  title: { fontSize: 18, fontWeight: 'bold' },
  desc: { fontSize: 14, color: '#666', marginTop: 5 },
  clockFrame: {
    padding: 10,
    borderRadius: 200,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
      android: { elevation: 8 },
      web: { boxShadow: '0px 4px 15px rgba(0,0,0,0.1)' }
    })
  },
  clockShadow: { borderRadius: 200, overflow: 'hidden' },
  controlsContainer: { width: '100%', maxWidth: 350, marginTop: 10 },
  controlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  controlLabel: { fontSize: 16, fontWeight: '600', color: '#555' },
  buttonGroup: { flexDirection: 'row', gap: 10 },
  arrowBtn: { padding: 8, backgroundColor: '#f5f5f5', borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  confirmBtn: { marginTop: 20, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  successBox: { marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 10 },
  successText: { color: '#2ecc71', fontWeight: 'bold', fontSize: 16 }
});