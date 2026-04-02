import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useResults } from '../context/ResultContext';
import { clearAllResults } from '../utils/resultStorage';

export default function ResultsScreen({ t, theme, onBack }) {
  const { results, loadResults } = useResults();

  const handleClear = async () => {
    const performClear = async () => {
      await clearAllResults();
      await loadResults();
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Möchten Sie wirklich alle Ergebnisse unwiderruflich löschen?')) {
        await performClear();
      }
    } else {
      Alert.alert(
        "Daten löschen",
        "Möchten Sie wirklich alle Ergebnisse unwiderruflich löschen?",
        [
          { text: "Abbrechen", style: "cancel" },
          { text: "Löschen", style: "destructive", onPress: performClear }
        ]
      );
    }
  };

  const formatTMTScore = (score) => {
    const numScore = parseFloat(score);
    if (numScore > 1000000) {
      return "Fehler: Zeitstempel statt Dauer";
    }
    return numScore.toFixed(2) + " Sekunden";
  };

  const renderDetail = (res) => {
    switch (res.testId) {
      case 'tmt_a':
        return (
          <View style={styles.detailBox}>
            <Text style={[styles.detailText, { color: theme.text }]}>
              Dauer: {formatTMTScore(res.score)}
            </Text>
          </View>
        );
      case 'bells_test':
        return (
          <View style={styles.detailBox}>
            <Text style={[styles.detailText, { color: theme.text }]}>
              Glocken gefunden: {res.score} / 35
            </Text>
            <Text style={[styles.detailText, { color: theme.text }]}>
              Auslassungen: Links {res.data.leftOmissions} | Rechts {res.data.rightOmissions}
            </Text>
            <Text style={[styles.detailText, { color: theme.text }]}>
              Zeit: {res.data.timeSeconds}s
            </Text>
            {res.data.hasUSN && (
              <Text style={styles.warningText}>
                Hinweis auf USN (6+ Auslassungen auf einer Seite)
              </Text>
            )}
          </View>
        );
      case 'zs_test':
        return (
          <View style={styles.detailBox}>
            <Text style={[styles.detailText, { color: theme.text }]}>
              Korrekte Zuordnungen: {res.score}
            </Text>
            <Text style={[styles.detailText, { color: theme.text }]}>
              Bearbeitete Felder: {res.data.totalAttempted}
            </Text>
            <Text style={[styles.detailText, { color: theme.text }]}>
              Zeit: {res.data.timeTaken}s
            </Text>
          </View>
        );
      case 'qlq_c30':
        const r = res.data.responses || {};
        return (
          <View style={styles.detailBox}>
            <Text style={[styles.detailSubHeader, { color: theme.text }]}>
              Antworten (Q1 - Q30):
            </Text>
            <View style={styles.qlqGrid}>
              {Object.keys(r)
                .sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))
                .map((key) => (
                  <View key={key} style={styles.qlqItem}>
                    <Text style={[styles.qlqItemText, { color: theme.text }]}>
                      {key.toUpperCase()}: {r[key]}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        );
      default:
        return <Text style={{ color: theme.text }}>Ergebnis: {res.score}</Text>;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={{ color: theme.primary, fontSize: 18, fontWeight: 'bold' }}>← Zurück</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Ergebnis-Datenbank</Text>
        <TouchableOpacity onPress={handleClear}>
          <Text style={{ color: '#ff4444', fontWeight: 'bold' }}>Löschen</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {results.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ color: theme.text, opacity: 0.5 }}>Keine Einträge gefunden.</Text>
          </View>
        ) : (
          results.slice().reverse().map((res, index) => (
            <View key={res.id || index} style={[styles.resultCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.testName, { color: theme.primary }]}>
                  {res.testId.toUpperCase().replace('_', ' ')}
                </Text>
                <Text style={[styles.timestamp, { color: theme.text }]}>
                  {new Date(res.timestamp).toLocaleString('de-DE')}
                </Text>
              </View>
              
              <View style={styles.divider} />
              
              {renderDetail(res)}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    padding: 20, 
    paddingTop: 50, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
  backBtn: { marginRight: 20 },
  title: { fontSize: 22, fontWeight: 'bold' },
  scrollContent: { padding: 20, alignItems: 'center' },
  emptyState: { marginTop: 100 },
  resultCard: { 
    width: '100%', 
    maxWidth: 800, 
    padding: 20, 
    borderRadius: 15, 
    borderWidth: 1, 
    marginBottom: 15, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4 
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  testName: { fontSize: 18, fontWeight: 'bold' },
  timestamp: { fontSize: 14, opacity: 0.7 },
  divider: { height: 1, backgroundColor: '#eee', marginBottom: 10 },
  detailBox: { gap: 8 },
  detailText: { fontSize: 16 },
  detailSubHeader: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  warningText: { color: '#ff4444', fontWeight: 'bold', marginTop: 5 },
  qlqGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'flex-start' 
  },
  qlqItem: { 
    width: '20%', 
    marginBottom: 8, 
    paddingRight: 5 
  },
  qlqItemText: { fontSize: 12, fontWeight: '600' }
});