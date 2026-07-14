import CryptoJS from 'crypto-js';

// 1. Hilfsfunktion: Baut aus den JSON-Daten das passende XML für OpenEDC
const buildODMString = (results, sessionData) => {
  const timestamp = new Date().toISOString();
  
  // Das Grundgerüst (Skelett) der XML-Datei exakt nach Robins Vorlage
  let xml = `<SubjectData SubjectKey="${sessionData.subjectKey}">
    <AuditRecord>
        <UserRef UserOID="${sessionData.username}"/>
        <LocationRef LocationOID="-"/>
        <DateTimeStamp>${timestamp}</DateTimeStamp>
    </AuditRecord>
    <StudyEventData StudyEventOID="SE.KA" StudyEventRepeatKey="${sessionData.studyEventRepeatKey}">
`;

  // 2. Wir iterieren durch die gespeicherten Testergebnisse
  results.forEach(result => {
    
    // --- BELLS TEST ---
    if (result.testId === 'bells_test') {
      xml += `
        <FormData FormOID="F.BELLS" TransactionType="Insert">
            <AuditRecord>
                <UserRef UserOID="${sessionData.username}"/>
                <LocationRef LocationOID="-"/>
                <DateTimeStamp>${timestamp}</DateTimeStamp>
            </AuditRecord>
            <Annotation SeqNum="1">
                <Flag>
                    <FlagValue CodeListOID="OpenEDC.DataStatus">3</FlagValue>
                </Flag>
            </Annotation>
            <ItemGroupData ItemGroupOID="IG.BELLS_metadata">
                <ItemData ItemOID="I.BELLS_id" Value="${result.id}"/>
                <ItemData ItemOID="I.BELLS_testID" Value="${result.testId}"/>
                <ItemData ItemOID="I.BELLS_timestamp" Value="${result.timestamp}"/>
            </ItemGroupData>
            <ItemGroupData ItemGroupOID="IG.BELLS_Ergebnisse">
                <ItemData ItemOID="I.BELLS_totalScore" Value="${result.data.totalScore}"/>
                <ItemData ItemOID="I.BELLS_timeSeconds" Value="${result.data.timeSeconds}"/>
                <ItemData ItemOID="I.BELLS_leftOmissions" Value="${result.data.leftOmissions}"/>
                <ItemData ItemOID="I.BELLS_rightOmissions" Value="${result.data.rightOmissions}"/>
                <ItemData ItemOID="I.BELLS_hasUSN" Value="${result.data.hasUSN}"/>
                <ItemData ItemOID="I.BELLS_columnstats_col_0" Value="${result.data.columnStats.col_0}"/>
                <ItemData ItemOID="I.BELLS_columnstats_col_1" Value="${result.data.columnStats.col_1}"/>
                <ItemData ItemOID="I.BELLS_columnstats_col_2" Value="${result.data.columnStats.col_2}"/>
                <ItemData ItemOID="I.BELLS_columnstats_col_3" Value="${result.data.columnStats.col_3}"/>
                <ItemData ItemOID="I.BELLS_columnstats_col_4" Value="${result.data.columnStats.col_4}"/>
                <ItemData ItemOID="I.BELLS_columnstats_col_5" Value="${result.data.columnStats.col_5}"/>
                <ItemData ItemOID="I.BELLS_columnstats_col_6" Value="${result.data.columnStats.col_6}"/>
            </ItemGroupData>
        </FormData>`;
    }
    
    // --- HIER KOMMEN SPÄTER DIE ANDEREN TESTS REIN (MoCA, COWAT etc.) ---
    // if (result.testId === 'cowat') { ... }

  });

  // 3. XML-Tags am Ende wieder sauber schließen
  xml += `
    </StudyEventData>
</SubjectData>`;

  return xml;
};

// 4. Hauptfunktion: Baut das XML und verschlüsselt es direkt
export const generateAndEncryptODM = (results, sessionData) => {
  try {
    if (!sessionData || !sessionData.surveySecretKey) {
      throw new Error("Fehlende Session-Daten oder Secret Key für die Verschlüsselung.");
    }

    // A: Rohes XML als String generieren
    const xmlString = buildODMString(results, sessionData);
    
    // B: XML mit dem surveySecretKey AES-verschlüsseln
    const encryptedXML = CryptoJS.AES.encrypt(xmlString, sessionData.surveySecretKey).toString();
    
    return encryptedXML;
    
  } catch (error) {
    console.error("Fehler beim XML-Bau oder bei der Verschlüsselung:", error);
    return null;
  }
};