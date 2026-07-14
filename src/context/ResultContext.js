import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native'; // HINZUGEFÜGT für die Web-Abfrage
import { saveTestResult, getAllResults } from '../utils/resultStorage';

const ResultContext = createContext(null);

export const ResultProvider = ({ children }) => {
  const [results, setResults] = useState([]);
  
  // HINZUGEFÜGT: Hier speichern wir die 5 geheimen Parameter aus der URL
  const [sessionData, setSessionData] = useState(null); 

  useEffect(() => {
    loadResults();
    extractUrlData(); // HINZUGEFÜGT: Wird direkt beim App-Start einmal ausgeführt
  }, []);

  const loadResults = async () => {
    const storedResults = await getAllResults();
    setResults(storedResults);
  };

  // HINZUGEFÜGT: Die Auslese-Logik für den Base64 Token
  const extractUrlData = () => {
    if (Platform.OS === 'web') {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get('token');
      
      if (token) {
        try {
          const decodedString = atob(token);
          const parsedData = JSON.parse(decodedString);
          
          // Speichert die Daten (SubjectKey, Password, etc.) global ab
          setSessionData(parsedData); 
          console.log("Session-Daten erfolgreich in der App gespeichert:", parsedData);
        } catch (error) {
          console.error("Fehler beim Verarbeiten des URL-Tokens:", error);
        }
      }
    }
  };

  const addResult = async (testId, data, score) => {
    const newResult = { testId, data, score };
    const success = await saveTestResult(newResult);
    if (success) {
      await loadResults();
    }
    return success;
  };

  return (
    // HINZUGEFÜGT: sessionData unten in die 'value' gepackt, damit die ganze App Zugriff hat
    <ResultContext.Provider value={{ results, addResult, loadResults, sessionData }}>
      {children}
    </ResultContext.Provider>
  );
};

export const useResults = () => {
  const context = useContext(ResultContext);
  if (context === undefined || context === null) {
    throw new Error('useResults muss innerhalb eines ResultProviders verwendet werden');
  }
  return context;
};