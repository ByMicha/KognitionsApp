import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'KOGNITION_TEST_RESULTS';

/**
 * Speichert ein einzelnes Testergebnis im lokalen Speicher.
 * @param {Object} newResult - Das Ergebnisobjekt (z.B. { testId: 'tmt', score: 45, data: {...} })
 */
export const saveTestResult = async (newResult) => {
  try {
    // 1. Bestehende Daten laden
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    const results = existingData ? JSON.parse(existingData) : [];
    
    // 2. Neues Ergebnis mit Metadaten (Zeitstempel, ID) anreichern
    const resultWithTimestamp = {
      ...newResult,
      timestamp: new Date().toISOString(),
      id: Date.now().toString(), // Einfache ID basierend auf Zeit
    };

    // 3. In das Array pushen und speichern
    results.push(resultWithTimestamp);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    
    console.log('Ergebnis erfolgreich gespeichert:', resultWithTimestamp.testId);
    return true;
  } catch (error) {
    console.error('Fehler beim Speichern der Ergebnisse:', error);
    return false;
  }
};

/**
 * Lädt alle gespeicherten Testergebnisse.
 * @returns {Promise<Array>} Ein Array mit allen Ergebnis-Objekten.
 */
export const getAllResults = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Fehler beim Laden der Ergebnisse:', error);
    return [];
  }
};

/**
 * Löscht alle gespeicherten Ergebnisse (z.B. für einen Reset der App).
 */
export const clearAllResults = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('Alle Ergebnisse wurden gelöscht.');
    return true;
  } catch (error) {
    console.error('Fehler beim Löschen der Ergebnisse:', error);
    return false;
  }
};