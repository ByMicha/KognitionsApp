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

export default function ExplanationModal({ visible, onClose, testKey, theme, t, isRunning = false }) {

  const content = t.explanation.content;

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

            <Text style={{...styles.subTitle, color: theme.text}}>{t.explanation.threeCentralSteps}:</Text>
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
              {isRunning ? t.explanation.backToTest : t.explanation.understoodStartTest}
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