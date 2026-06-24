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

    //Testing Purpose 11.06.2026
    uploadTestResultsToHeidelberg(100);

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


const uploadTestResultsToHeidelberg = async (patientScore) => {
  // 1. Die IP-Adresse deines PCs (Port 8080 bleibt gleich)
  const serverIp = '192.168.176.1'; // <-- HIER DEINE GEFUNDENE IP EINTRAGEN
  const url = `http://${serverIp}:8080/fhir/Observation`;

  // 2. Das standardisierte HL7 FHIR (R4) Datenpaket schnüren
  const fhirPayload = {
    resourceType: "Observation",
    status: "final",
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "8251-1", // Offizieller LOINC-Code für kognitive Scores
          display: "Cognitive function total score"
        }
      ],
      text: "Digitale kognitive Testbatterie (Glioblastom)"
    },
    // Für die Anbindung ans EDC nutzt man oft Pseudonyme statt Klarnamen
    subject: {
      identifier: {
        system: "https://uniklinikum-heidelberg.de/patient-ids",
        value: "HD-Glio-9941" // Beispiel-Pseudonym für die Studie
      }
    },
    // Hier übergeben wir den dynamischen Wert aus deiner Testbatterie
    valueInteger: patientScore, 
    effectiveDateTime: new Date().toISOString()
  };

  // 3. Den HTTP POST-Request abfeuern
  try {
    console.log('Sende Daten an den lokalen Heidelberg-Testserver...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      },
      body: JSON.stringify(fhirPayload)
    });

    if (response.ok) {
      const jsonResponse = await response.json();
      console.log('🎉 Erfolg! Der Server hat die Daten akzeptiert.');
      console.log('Gespeicherte FHIR-Ressourcen ID:', jsonResponse.id);
      return true;
    } else {
      console.error('❌ Der Server hat das FHIR-Format abgelehnt. Status:', response.status);
      const errorText = await response.text();
      console.error('Server-Antwort:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Netzwerkfehler! Überprüfe, ob Smartphone und PC im selben WLAN sind.');
    console.error(error);
    return false;
  }
};