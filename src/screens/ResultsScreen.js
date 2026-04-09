import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useResults } from '../context/ResultContext';
import { clearAllResults, deleteResult } from '../utils/resultStorage';

export default function ResultsScreen({ t, theme, onBack }) {
  const { results, loadResults } = useResults();

  useEffect(() => {
    loadResults();
  }, []);

  const handleClearAll = async () => {
    const performClear = async () => {
      await clearAllResults();
      await loadResults();
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Möchten Sie wirklich ALLE Ergebnisse unwiderruflich löschen?')) await performClear();
    } else {
      Alert.alert("Alle Daten löschen", "Möchten Sie wirklich alle Ergebnisse unwiderruflich löschen?", [
        { text: "Abbrechen", style: "cancel" },
        { text: "Löschen", style: "destructive", onPress: performClear }
      ]);
    }
  };

  const handleDeleteOne = async (id) => {
    const performDelete = async () => {
      await deleteResult(id);
      await loadResults();
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Diesen Eintrag wirklich löschen?')) await performDelete();
    } else {
      Alert.alert("Eintrag löschen", "Möchten Sie diesen Testeintrag wirklich löschen?", [
        { text: "Abbrechen", style: "cancel" },
        { text: "Löschen", style: "destructive", onPress: performDelete }
      ]);
    }
  };

  const formatTMTScore = (score) => {
    const numScore = parseFloat(score);
    if (numScore > 1000000) return "Fehler: Zeitstempel statt Dauer";
    return numScore.toFixed(2) + " Sekunden";
  };

  // --- HILFSFUNKTIONEN FÜR MOCA DETAILS ---
  const renderMocaSection = (title, icon, content) => (
    <View style={styles.mocaSection}>
      <View style={styles.mocaSectionHeader}>
        <MaterialCommunityIcons name={icon} size={18} color={theme.primary} />
        <Text style={[styles.mocaSectionTitle, { color: theme.primary }]}>{title}</Text>
      </View>
      <View style={styles.mocaSectionContent}>{content}</View>
    </View>
  );

  const renderDetail = (res) => {
    const data = res.data || {};
    const s = data.scenarios || {};

    switch (res.testId) {
      case 'moca_test':
        return (
          <View style={styles.mocaContainer}>

            {/* 1. Visuokonstruktiv */}
            {renderMocaSection("Visuokonstruktiv / Exekutiv", "pencil-ruler", (
              <View>
                <Text style={styles.detailText}>Trails: {s['01_trails']?.duration_active_sec}s Bearbeitungszeit</Text>
                <Text style={styles.mocaTranscript}>Pfad: {s['01_trails']?.path_raw?.join(' - ')}</Text>
                <View style={styles.dividerSmall} />
                <Text style={styles.detailText}>Uhrzeit: {s['02_clock']?.target_time} Uhr gefordert</Text>
                <Text style={styles.detailText}>Effizienz: {s['02_clock']?.total_clicks} Klicks ({s['02_clock']?.unnecessary_clicks} Korrekturen)</Text>
                <Text style={styles.mocaItemSub}>Winkel: Stunde {s['02_clock']?.final_angles?.hour}°, Minute {s['02_clock']?.final_angles?.minute}°</Text>
              </View>
            ))}

            {/* 2. Benennen */}
            {renderMocaSection("Benennen", "elephant", (
              <View>
                <Text style={styles.detailText}>Ergebnis: {s['03_naming']?.score}</Text>
                <View style={styles.namingGrid}>
                  {['lion', 'rhino', 'camel'].map(animal => (
                    <View key={animal} style={styles.namingRow}>
                      <MaterialCommunityIcons 
                        name={s['03_naming']?.[animal]?.success ? "check" : "close"} 
                        size={14} 
                        color={s['03_naming']?.[animal]?.success ? "#2ecc71" : "#ff4444"} 
                      />
                      <Text style={styles.mocaTranscript}>{animal}: "{s['03_naming']?.[animal]?.transcript || "keine Eingabe"}"</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            {/* 3. Gedächtnis (Sofort) */}
            {renderMocaSection("Gedächtnis (Lernphase)", "brain", (
              <View>
                <Text style={styles.detailText}>Erfolg: {s['04_memory_immediate']?.correct_count} / 5 Wörter</Text>
                <Text style={styles.detailText}>Dauer: {s['04_memory_immediate']?.duration_recall_sec}s</Text>
                <Text style={styles.mocaTranscript}>Transkript: "{s['04_memory_immediate']?.full_transcript}"</Text>
              </View>
            ))}

            {/* 4. Aufmerksamkeit */}
            {renderMocaSection("Aufmerksamkeit", "alert-circle-outline", (
              <View>
                <Text style={styles.detailText}>Zahlen Vorwärts: {s['05_digits']?.forward?.hits} / {s['05_digits']?.forward?.seq_length} korr.</Text>
                <Text style={styles.mocaTranscript}>"{s['05_digits']?.forward?.transcript}"</Text>
                <Text style={styles.detailText}>Zahlen Rückwärts: {s['05_digits']?.backward?.hits} / {s['05_digits']?.backward?.seq_length} korr.</Text>
                <Text style={styles.mocaTranscript}>"{s['05_digits']?.backward?.transcript}"</Text>
                <View style={styles.dividerSmall} />
                <Text style={styles.detailText}>Vigilanz (Buchstabe A):</Text>
                <Text style={styles.detailText}>Treffer: {s['06_vigilance']?.hits} | Auslassung: {s['06_vigilance']?.omissions} | Fehlalarm: {s['06_vigilance']?.false_alarms}</Text>
              </View>
            ))}

            {/* 5. Rechnen */}
            {renderMocaSection("Rechnen (Serielle 7)", "calculator", (
              <View>
                <Text style={styles.detailText}>Sequenz: {s['07_calculation']?.final_sequence?.join(' - ')}</Text>
                <View style={styles.calcTable}>
                   {s['07_calculation']?.steps?.map((step, i) => (
                     <View key={i} style={styles.calcRow}>
                       <Text style={styles.calcCell}>Schritt {i+1}:</Text>
                       <Text style={[styles.calcCell, { color: step.is_correct ? '#2ecc71' : '#ff4444' }]}>
                         {step.chosen} (Soll: {step.expected})
                       </Text>
                       <Text style={styles.calcCellTime}>{step.reaction_time_ms}ms</Text>
                     </View>
                   ))}
                </View>
              </View>
            ))}

            {/* 6. Sprache */}
            {renderMocaSection("Sprache", "microphone", (
              <View>
                <Text style={styles.detailText}>Nachsprechen: {s['08_language']?.is_correct ? "Korrekt" : "Falsch"}</Text>
                <Text style={styles.mocaItemSub}>Soll: {s['08_language']?.target_sentence}</Text>
                <Text style={styles.mocaTranscript}>Ist: "{s['08_language']?.full_transcript}"</Text>
                <View style={styles.dividerSmall} />
                <Text style={styles.detailText}>Wortfluss (F): {s['09_word_fluency']?.valid_wiki_count} Wörter</Text>
                <Text style={styles.mocaTranscript}>{s['09_word_fluency']?.raw_word_list?.join(', ')}</Text>
              </View>
            ))}

            {/* 7. Gedächtnis (Delayed Recall) */}
            {renderMocaSection("Verzögerter Abruf (Recall)", "history", (
              <View>
                <Text style={[styles.detailText, { fontWeight: 'bold' }]}>Erfolg: {s['10_delayed_recall']?.correct_count} / 5 Wörter</Text>
                <Text style={styles.detailText}>Erinnert: {s['10_delayed_recall']?.remembered_words?.join(', ') || "Keine"}</Text>
                <Text style={[styles.detailText, { color: '#ff4444' }]}>Vergessen: {s['10_delayed_recall']?.forgotten_words?.join(', ') || "Keine"}</Text>
              </View>
            ))}
          </View>
        );

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
    <View style={[styles.container, { backgroundColor: "transparent" }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={{ color: theme.primary, fontSize: 18, fontWeight: 'bold' }}>← Zurück</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Ergebnis-Datenbank</Text>
        <TouchableOpacity onPress={handleClearAll}><Text style={{ color: '#ff4444', fontWeight: 'bold' }}>Alle löschen</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {results.length === 0 ? (
          <View style={styles.emptyState}><Text style={{ color: theme.text, opacity: 0.5 }}>Keine Einträge gefunden.</Text></View>
        ) : (
          results.slice().reverse().map((res) => (
            <View key={res.id} style={[styles.resultCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.testName, { color: theme.primary }]}>{res.testId.toUpperCase().replace('_', ' ')}</Text>
                  <Text style={[styles.timestamp, { color: theme.text }]}>{new Date(res.timestamp).toLocaleString('de-DE')}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteOne(res.id)} style={styles.deleteIconButton}>
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
  detailText: { fontSize: 15, color: '#333' },
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
  qlqItemText: { fontSize: 12, fontWeight: '600' },

  // MOCA SPECIFIC STYLES
  mocaContainer: { paddingVertical: 5 },
  mocaScoreMain: { fontSize: 17, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  metaInfo: { marginBottom: 15, alignItems: 'center' },
  metaText: { fontSize: 11, color: '#aaa' },
  mocaSection: { marginBottom: 12, backgroundColor: '#fcfcfc', padding: 10, borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#eee' },
  mocaSectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  mocaSectionTitle: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  mocaSectionContent: { paddingLeft: 26 },
  mocaTranscript: { fontSize: 13, color: '#888', fontStyle: 'italic', marginTop: 2, marginBottom: 5 },
  mocaItemSub: { fontSize: 12, color: '#999', marginTop: 2 },
  dividerSmall: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 6 },
  namingGrid: { marginTop: 5, gap: 3 },
  namingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  calcTable: { marginTop: 8, gap: 4 },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  calcCell: { fontSize: 13, flex: 2 },
  calcCellTime: { fontSize: 11, color: '#aaa', flex: 1, textAlign: 'right' }
});