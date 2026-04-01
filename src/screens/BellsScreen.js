import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- LOGIK FÜR DIE GENERIERUNG (300 SYMBOLE) ---
const generateBellsData = () => {
  const symbols = [];
  
  // Wir nutzen MaterialCommunityIcons für einen einheitlichen Look
  // Ziel: 'bell' | Distraktoren: 'home', 'tree', 'bird', 'apple', 'car'
  const iconPool = [
    { name: 'bell', isTarget: true },
    { name: 'home', isTarget: false },
    { name: 'tree', isTarget: false },
    { name: 'bird', isTarget: false },
    { name: 'apple', isTarget: false },
    { name: 'car', isTarget: false },
  ];
  
  // 15 Spalten x 20 Zeilen = 300 Symbole
  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 20; j++) {
      // Unregelmäßige Verteilung: Wir nutzen ein festes Raster + Zufallsoffset
      const xPos = i * 6.4 + 2 + (Math.random() * 2.2);
      const yPos = j * 4.6 + 2 + (Math.random() * 1.8);
      
      const randomIcon = iconPool[Math.floor(Math.random() * iconPool.length)];
      
      symbols.push({
        id: `bell-test-${i}-${j}`,
        iconName: randomIcon.name,
        x: xPos,
        y: yPos,
        selected: false
      });
    }
  }
  return symbols;
};

export default function BellsScreen({ t, theme, onBack }) {
  // useMemo verhindert, dass sich die Glocken bei jedem Klick neu anordnen
  const [symbols, setSymbols] = useState(useMemo(() => generateBellsData(), []));

  const toggleSymbol = (id) => {
    setSymbols(prev => prev.map(s => 
      s.id === id ? { ...s, selected: !s.selected } : s
    ));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Bereich */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 18 }}>← {t.backToMenu}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>{t.bells.title}</Text>
      </View>

      {/* Das Test-Blatt (Papier-Simulation) */}
      <View style={styles.boardContainer}>
        <View style={styles.board}>
          {symbols.map((symbol) => (
            <TouchableOpacity
              key={symbol.id}
              activeOpacity={0.5}
              onPress={() => toggleSymbol(symbol.id)}
              style={[
                styles.symbolWrapper,
                { left: `${symbol.x}%`, top: `${symbol.y}%` }
              ]}
            >
              <MaterialCommunityIcons 
                name={symbol.iconName} 
                size={26} // Größere Icons
                color="#000" // Garantiert Schwarz
              />
              
              {/* Der rote Auswahlkreis */}
              {symbol.selected && (
                <View style={styles.redCircle} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Footer mit Abschluss-Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.doneButton, { backgroundColor: theme.primary }]}
          onPress={onBack}
        >
          <Text style={styles.doneButtonText}>{t.bells.done}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  board: {
    width: '100%',
    maxWidth: 900, // Etwas breiter für mehr Platz
    aspectRatio: 0.75, // DIN A4
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    position: 'relative',
    // Schatten für den "Papier auf Tisch" Effekt
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  symbolWrapper: {
    position: 'absolute',
    width: 36, // Größeres Klick-Feld
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    // Zentrierung des Icons auf dem Punkt
    transform: [{ translateX: -18 }, { translateY: -18 }],
  },
  redCircle: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3, // Etwas dickerer Kreis für bessere Sichtbarkeit
    borderColor: 'red',
    backgroundColor: 'transparent',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  doneButton: {
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 15,
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  }
});