import React, { createContext, useState, useContext, useEffect } from 'react';
import { saveTestResult, getAllResults } from '../utils/resultStorage';

const ResultContext = createContext(null);

export const ResultProvider = ({ children }) => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    const storedResults = await getAllResults();
    setResults(storedResults);
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
    <ResultContext.Provider value={{ results, addResult, loadResults }}>
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