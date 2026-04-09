import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { height, width } = Dimensions.get('window');
const ASPECT_RATIO_800_600 = 600 / 800; // 0.75

// Diese Assets müssen Sie in Ihren /assets Ordner legen
const explanationImages = {
  moca: require('../assets/moca_explanation.png'),
  hvlt: require('../assets/hvlt_explanation.png'),
  cowat: require('../assets/cowat_explanation.png'),
  tmt: require('../assets/tmt_explanation.png'),
  zs_test: require('../assets/zs_test_explanation.png'),
  qlq: require('../assets/qlq_explanation.png'),
  bells: require('../assets/bells_explanation.png'), // Neu
};

export default function ExplanationModal({ visible, onClose, testKey, theme, isRunning = false }) {

  const content = {
  moca: {
    title: "MoCA - Test der geistigen Fitness",
    desc: "In diesem Test schauen wir uns gemeinsam verschiedene Bereiche Ihrer geistigen Leistungsfähigkeit an. Er besteht aus insgesamt 10 kurzen Übungen, für die wir etwa 15 bis 20 Minuten Zeit benötigen.",
    steps: [
      { 
        title: "Vielfältige Aufgaben:", 
        text: "Sie werden nacheinander Linien ziehen, eine Uhr einstellen, Tiere benennen und versuchen, sich Wörter einzuprägen." 
      },
      { 
        title: "Konzentration & Sprache:", 
        text: "Es folgen kleine Rechenaufgaben, das Nachsprechen von Sätzen und Übungen, bei denen Sie aufmerksam auf Töne oder Buchstaben achten." 
      },
      { 
        title: "Ganz entspannt:", 
        text: "Machen Sie sich keinen Druck. Es geht darum, einen Überblick zu bekommen. Folgen Sie einfach Schritt für Schritt den Anweisungen auf dem Bildschirm." 
      },
    ],
    icon: "brain"
  },
  hvlt: {
    title: "Hopkins Gedächtnistest (HVLT)",
    desc: "Dieser Test hilft uns zu verstehen, wie gut Sie neue Informationen aufnehmen und wie sicher Sie diese im Gedächtnis behalten können.",
    steps: [
      { 
        title: "Wörter einprägen:", 
        text: "Ich lese Ihnen eine Liste mit Wörtern vor. Bitte hören Sie konzentriert zu und versuchen Sie, sich so viele wie möglich zu merken." 
      },
      { 
        title: "Wörter wiedergeben:", 
        text: "Sagen Sie mir danach alle Wörter auf, an die Sie sich noch erinnern können. Die Reihenfolge spielt dabei keine Rolle." 
      },
      { 
        title: "Mehrfaches Lernen:", 
        text: "Wir wiederholen diesen Vorgang insgesamt dreimal, damit Sie die Wörter so gut wie möglich lernen können." 
      },
    ],
    icon: "format-list-bulleted"
  },
  cowat: {
    title: "Wortflüssigkeit (COWAT)",
    desc: "Hier prüfen wir, wie flüssig Sie Begriffe aus Ihrem Gedächtnis abrufen können. Das ist eine gute Übung für Ihre Wortfindung.",
    steps: [
      { 
        title: "Anfangsbuchstaben nutzen:", 
        text: "Nennen Sie mir bitte so viele deutsche Wörter wie möglich, die mit einem bestimmten Buchstaben (z. B. 'F') beginnen." 
      },
      { 
        title: "Bestimmte Regeln:", 
        text: "Bitte vermeiden Sie Namen von Personen oder Orten sowie das mehrfache Nennen fast gleicher Wörter." 
      },
      { 
        title: "Zügig sprechen:", 
        text: "Sie haben pro Buchstabe genau 60 Sekunden Zeit. Sagen Sie einfach alles laut auf, was Ihnen in den Sinn kommt." 
      },
    ],
    icon: "comment-text-multiple-outline"
  },
  tmt: {
    title: "Pfadfinder-Test (TMT)",
    desc: "Dieser Test misst Ihre Aufmerksamkeit und wie gut Sie zwischen verschiedenen Informationen (wie Zahlen und Buchstaben) hin- und herspringen können.",
    steps: [
      { 
        title: "Reihenfolgen bilden:", 
        text: "Im ersten Teil verbinden Sie Zahlen von 1 bis 25. Im zweiten Teil wechseln Sie zwischen Zahlen und Buchstaben ab (1-A-2-B...)." 
      },
      { 
        title: "Flüssig arbeiten:", 
        text: "Versuchen Sie, die Kreise so schnell wie möglich zu verbinden, ohne den Finger oder Stift abzusetzen." 
      },
      { 
        title: "Fehler korrigieren:", 
        text: "Sollten Sie sich einmal vertun, ist das nicht schlimm. Korrigieren Sie den Pfad einfach und machen Sie zügig weiter." 
      },
    ],
    icon: "vector-polyline"
  },
  zs_test: {
    title: "Zahl-Symbol-Test",
    desc: "In dieser Übung geht es um Ihre Arbeitsgeschwindigkeit. Sie ordnen bestimmten Zeichen die passenden Zahlen zu.",
    steps: [
      { 
        title: "Oben nachschauen:", 
        text: "Am oberen Bildschirmrand sehen Sie eine Legende. Dort steht, welches Symbol zu welcher Zahl gehört (z. B. ein Kreis für die 1)." 
      },
      { 
        title: "Unten ausfüllen:", 
        text: "Schauen Sie sich das Symbol in der Mitte an und klicken Sie unten so schnell wie möglich auf die dazugehörige Zahl." 
      },
      { 
        title: "Zeit nutzen:", 
        text: "Sie haben 90 Sekunden Zeit. Versuchen Sie, so viele Felder wie möglich in dieser Zeit korrekt auszufüllen." 
      },
    ],
    icon: "numeric-9-plus-box-multiple-outline"
  },
  qlq: {
    title: "Fragebogen zum Wohlbefinden",
    desc: "Dieser Fragebogen hilft uns dabei zu verstehen, wie Sie sich in der letzten Zeit gefühlt haben und wie es Ihnen im Alltag geht.",
    steps: [
      { 
        title: "Rückblick halten:", 
        text: "Bitte beziehen Sie Ihre Antworten auf Ihr Befinden in der vergangenen Woche (die letzten 7 Tage)." 
      },
      { 
        title: "Ihre Einschätzung:", 
        text: "Wählen Sie bei jeder Frage die Antwort aus, die am besten auf Sie zutrifft. Es gibt hier kein 'Richtig' oder 'Falsch'." 
      },
      { 
        title: "Vollständigkeit:", 
        text: "Nehmen Sie sich die Zeit, alle Fragen zu beantworten. Ihre ehrliche Einschätzung ist für uns sehr wertvoll." 
      },
    ],
    icon: "clipboard-text-outline"
  },
  bells: {
    title: "Glocken-Suchtest",
    desc: "In dieser Übung prüfen wir, wie gut Sie Ihre Umgebung visuell absuchen können. Das hilft uns zu sehen, ob Ihnen im Blickfeld etwas entgeht.",
    steps: [
      { 
        title: "Glocken finden:", 
        text: "Auf dem Bildschirm sind viele verschiedene Zeichnungen. Suchen Sie bitte alle Glocken und tippen Sie diese kurz an." 
      },
      { 
        title: "Genau hinschauen:", 
        text: "Es sind insgesamt 35 Glocken versteckt. Versuchen Sie, das gesamte Bild von links nach rechts gründlich abzusuchen." 
      },
      { 
        title: "Andere Bilder ignorieren:", 
        text: "Lassen Sie sich nicht von den anderen Zeichnungen (wie Häusern oder Vögeln) ablenken. Wir suchen nur die Glocken." 
      },
    ],
    icon: "search-web"
  },
};

  const current = content[testKey] || content.moca;
  const imageSource = explanationImages[testKey] || explanationImages.moca;

  // Berechnen der Bildgröße im Modal (80% Breite, 3:4 Seitenverhältnis für 600x800)
  const imageWidth = width * 0.8;
  const imageHeight = imageWidth * ASPECT_RATIO_800_600;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card, shadowColor: '#000' }]}>
          <View style={[styles.indicator, { backgroundColor: theme.border }]} />
          
          <ScrollView contentContainerStyle={styles.scrollArea}>
            <View style={styles.header}>
              <MaterialCommunityIcons name={current.icon} size={36} color={theme.primary} />
              <Text style={{...styles.title, color: theme.primary}}>{current.title}</Text>
            </View>

            <Text style={{...styles.description, color: theme.text}}>{current.desc}</Text>

            <View style={styles.divider} />

            <Text style={{...styles.subTitle, color: theme.text}}>Drei zentrale Schritte:</Text>
            {current.steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <Text style={[styles.stepNum, { color: theme.primary }]}>{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{...styles.stepTitle, color: theme.text}}>{step.title}</Text>
                  <Text style={{...styles.stepText, color: theme.text}}>{step.text}</Text>
                </View>
              </View>
            ))}

            {/* Grafisches Beispiel im Seitenverhältnis 800x600 px */}
            <View style={styles.imageContainer}>
              <Image 
                source={imageSource}
                style={[styles.explanationImage, { width: imageWidth/2, height: imageHeight/2, borderColor: theme.border }]}
                resizeMode="contain" 
              />
            </View>
          </ScrollView>

          <TouchableOpacity 
            style={[styles.startBtn, { backgroundColor: theme.primary }]} 
            onPress={onClose}
          >
            <Text style={{...styles.startBtnText, color: theme.darkContrast}}>
              {isRunning ? "Zurück zum Test" : "Verstanden & Test starten"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { height: height * 0.85, width: '100%', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, elevation: 10, shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.25, shadowRadius: 10 },
  indicator: { width: 40, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  scrollArea: { paddingBottom: 30 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 20, paddingRight: 40 },
  title: { fontSize: 20, fontWeight: 'bold', flex: 1, lineHeight: 28 },
  description: { fontSize: 16, color: '#444', lineHeight: 24, paddingHorizontal: 10, marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20, marginHorizontal: 10 },
  subTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, paddingHorizontal: 10 },
  stepRow: { flexDirection: 'row', gap: 12, marginBottom: 15, paddingHorizontal: 10, paddingRight: 30 },
  stepNum: { fontSize: 18, fontWeight: 'bold', width: 25, textAlign: 'center' },
  stepTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 3 },
  stepText: { fontSize: 15, color: '#666', lineHeight: 21 },
  imageContainer: { width: '100%', marginTop: 40, marginBottom: 10, alignItems: 'center', paddingHorizontal: 10 },
  explanationImage: { borderRadius: 15, borderWidth: 1, backgroundColor: '#fafafa' },
  imageLabel: { fontSize: 11, fontStyle: 'italic', marginTop: 5 },
  startBtn: { marginTop: 10, paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  startBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});