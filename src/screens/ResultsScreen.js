import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import für das Icon
import { useResults } from '../context/ResultContext';
import { clearAllResults, deleteResult } from '../utils/resultStorage'; // deleteResult hinzugefügt

export default function ResultsScreen({ t, theme, onBack }) {
  const { results, loadResults } = useResults();

  const handleClearAll = async () => {
    const performClear = async () => {
      await clearAllResults();
      await loadResults();
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Möchten Sie wirklich ALLE Ergebnisse unwiderruflich löschen?')) {
        await performClear();
      }
    } else {
      Alert.alert(
        "Alle Daten löschen",
        "Möchten Sie wirklich alle Ergebnisse unwiderruflich löschen?",
        [
          { text: "Abbrechen", style: "cancel" },
          { text: "Löschen", style: "destructive", onPress: performClear }
        ]
      );
    }
  };

  const handleDeleteOne = async (id) => {
    const performDelete = async () => {
      await deleteResult(id);
      await loadResults(); // Liste neu laden
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Diesen Eintrag wirklich löschen?')) {
        await performDelete();
      }
    } else {
      Alert.alert(
        "Eintrag löschen",
        "Möchten Sie diesen Testeintrag wirklich löschen?",
        [
          { text: "Abbrechen", style: "cancel" },
          { text: "Löschen", style: "destructive", onPress: performDelete }
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
      case 'hvlt_learning':
        return (
          <View style={styles.detailBox}>
            <Text style={[styles.detailText, { color: theme.text, fontWeight: 'bold' }]}>
              Lernleistung Gesamt: {res.score} Wörter
            </Text>
            <View style={styles.statsContainer}>
              {res.data.trials?.map((trial, i) => (
                <View key={i} style={styles.statsRow}>
                  <Text style={[styles.statsLabel, { color: theme.text }]}>Trial {trial.trial}:</Text>
                  <Text style={[styles.statsValue, { color: theme.text }]}>{trial.correctCount} / 12</Text>
                  <Text style={[styles.statsPercent, { color: theme.primary }]}>{trial.recallRate}%</Text>
                </View>
              ))}
            </View>
          </View>
        );
      case 'cowat':
        return (
          <View style={styles.detailBox}>
            <Text style={[styles.detailText, { color: theme.text }]}>
              Buchstabe: <Text style={{fontWeight: 'bold', fontSize: 18}}>{res.data.letter}</Text>
            </Text>
            <Text style={[styles.detailText, { color: theme.text }]}>
              Korrekte Wörter: {res.score}
            </Text>
            <View style={styles.wordCloud}>
              {res.data.correctWords?.map((word, i) => (
                <View key={`c-${i}`} style={[styles.wordTag, { backgroundColor: '#e6fffa', borderColor: '#38b2ac' }]}>
                  <Text style={{ color: '#2c7a7b', fontSize: 12, fontWeight: 'bold' }}>{word}</Text>
                </View>
              ))}
              {res.data.incorrectWordsFound?.map((word, i) => (
                <View key={`i-${i}`} style={[styles.wordTag, { backgroundColor: '#fff5f5', borderColor: '#f56565' }]}>
                  <Text style={{ color: '#c53030', fontSize: 12 }}>{word}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      case 'qlq_c30':
        const r = res.data.responses || {};
        return (
          <View style={styles.detailBox}>
            <Text style={[styles.detailSubHeader, { color: theme.text }]}>Antworten (Q1-Q30):</Text>
            <View style={styles.qlqGrid}>
              {Object.keys(r).sort((a,b) => parseInt(a.slice(1)) - parseInt(b.slice(1))).map((key) => (
                <View key={key} style={styles.qlqItem}>
                  <Text style={[styles.qlqItemText, { color: theme.text }]}>{key.toUpperCase()}: {r[key]}</Text>
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
        <TouchableOpacity onPress={handleClearAll}>
          <Text style={{ color: '#ff4444', fontWeight: 'bold' }}>Alle löschen</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {results.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ color: theme.text, opacity: 0.5 }}>Keine Einträge gefunden.</Text>
          </View>
        ) : (
          results.slice().reverse().map((res) => (
            <View key={res.id} style={[styles.resultCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.testName, { color: theme.primary }]}>
                    {res.testId.toUpperCase().replace('_', ' ')}
                  </Text>
                  <Text style={[styles.timestamp, { color: theme.text }]}>
                    {new Date(res.timestamp).toLocaleString('de-DE')}
                  </Text>
                </View>
                
                {/* Lösch-Button für Einzel-Eintrag */}
                <TouchableOpacity 
                  onPress={() => handleDeleteOne(res.id)}
                  style={styles.deleteIconButton}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={24} color={theme.primary} />
                </TouchableOpacity>
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
  header: { padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#eee' },
  backBtn: { marginRight: 20 },
  title: { fontSize: 22, fontWeight: 'bold' },
  scrollContent: { padding: 20, alignItems: 'center' },
  emptyState: { marginTop: 100 },
  resultCard: { width: '100%', maxWidth: 800, padding: 20, borderRadius: 15, borderWidth: 1, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  testName: { fontSize: 18, fontWeight: 'bold' },
  timestamp: { fontSize: 14, opacity: 0.7 },
  deleteIconButton: { padding: 5, marginLeft: 10 },
  divider: { height: 1, backgroundColor: '#eee', marginBottom: 10 },
  detailBox: { gap: 8 },
  detailText: { fontSize: 16 },
  detailSubHeader: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  warningText: { color: '#ff4444', fontWeight: 'bold', marginTop: 5 },
  statsContainer: { marginTop: 5, backgroundColor: '#f8f9fa', padding: 10, borderRadius: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#eee' },
  statsLabel: { flex: 1, fontSize: 14 },
  statsValue: { flex: 1, textAlign: 'center', fontSize: 14 },
  statsPercent: { flex: 1, textAlign: 'right', fontSize: 14, fontWeight: 'bold' },
  wordCloud: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 6 },
  wordTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  qlqGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  qlqItem: { width: '20%', marginBottom: 8, paddingRight: 5 },
  qlqItemText: { fontSize: 12, fontWeight: '600' }
});