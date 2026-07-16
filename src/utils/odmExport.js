import CryptoJS from 'crypto-js';

// Hilfsfunktion: Sichert Strings ab, damit Sonderzeichen im XML keinen Fehler verursachen
const escapeXML = (str) => {
  if (str === undefined || str === null) return '';
  return String(str).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

// Hilfsfunktion: Wandelt Arrays/Objekte sicher in einen String um und escaped ihn
const val = (v) => {
  if (v === undefined || v === null) return '';
  if (typeof v === 'object') return escapeXML(JSON.stringify(v));
  return escapeXML(String(v));
};

// Hilfsfunktion: Zieht aus einem Array von Objekten einen bestimmten Schlüssel (z.B. für HVLT Trials oder MoCA Rechenschritte)
const mapArray = (arr, key) => {
  if (!Array.isArray(arr)) return '';
  return val(arr.map(item => item[key]));
};

// 1. Funktion, um das XML für alle Tests zu bauen
const buildODMString = (results, sessionData) => {
  const timestamp = new Date().toISOString();
  
  let xml = `<SubjectData SubjectKey="${val(sessionData.subjectKey)}">
    <AuditRecord>
        <UserRef UserOID="${val(sessionData.username)}"/>
        <LocationRef LocationOID="-"/>
        <DateTimeStamp>${timestamp}</DateTimeStamp>
    </AuditRecord>
    <StudyEventData StudyEventOID="SE.KA" StudyEventRepeatKey="${val(sessionData.studyEventRepeatKey)}">\n`;

  results.forEach(result => {
    const d = result.data || {};

    // --- 1. BELLS TEST ---
    if (result.testId === 'bells_test') {
      xml += `        <FormData FormOID="F.BELLS" TransactionType="Insert">
            <AuditRecord>
                <UserRef UserOID="${val(sessionData.username)}"/>
                <LocationRef LocationOID="-"/>
                <DateTimeStamp>${timestamp}</DateTimeStamp>
            </AuditRecord>
            <Annotation SeqNum="1"><Flag><FlagValue CodeListOID="OpenEDC.DataStatus">3</FlagValue></Flag></Annotation>
            <ItemGroupData ItemGroupOID="IG.BELLS_metadata">
                <ItemData ItemOID="I.BELLS_id" Value="${val(result.id)}"/>
                <ItemData ItemOID="I.BELLS_testID" Value="${val(result.testId)}"/>
                <ItemData ItemOID="I.BELLS_timestamp" Value="${val(result.timestamp)}"/>
            </ItemGroupData>
            <ItemGroupData ItemGroupOID="IG.BELLS_Ergebnisse">
                <ItemData ItemOID="I.BELLS_totalScore" Value="${val(d.totalScore)}"/>
                <ItemData ItemOID="I.BELLS_timeSeconds" Value="${val(d.timeSeconds)}"/>
                <ItemData ItemOID="I.BELLS_leftOmissions" Value="${val(d.leftOmissions)}"/>
                <ItemData ItemOID="I.BELLS_rightOmissions" Value="${val(d.rightOmissions)}"/>
                <ItemData ItemOID="I.BELLS_hasUSN" Value="${val(d.hasUSN)}"/>
                <ItemData ItemOID="I.BELLS_columnstats_col_0" Value="${val(d.columnStats?.col_0)}"/>
                <ItemData ItemOID="I.BELLS_columnstats_col_1" Value="${val(d.columnStats?.col_1)}"/>
                <ItemData ItemOID="I.BELLS_columnstats_col_2" Value="${val(d.columnStats?.col_2)}"/>
                <ItemData ItemOID="I.BELLS_columnstats_col_3" Value="${val(d.columnStats?.col_3)}"/>
                <ItemData ItemOID="I.BELLS_columnstats_col_4" Value="${val(d.columnStats?.col_4)}"/>
                <ItemData ItemOID="I.BELLS_columnstats_col_5" Value="${val(d.columnStats?.col_5)}"/>
                <ItemData ItemOID="I.BELLS_columnstats_col_6" Value="${val(d.columnStats?.col_6)}"/>
            </ItemGroupData>
        </FormData>\n`;
    }

    // --- 2. ZAHLENSYMBOL TEST (ZS) ---
    if (result.testId === 'zs_test') {
      xml += `        <FormData FormOID="F.ZS" TransactionType="Insert">
            <AuditRecord>
                <UserRef UserOID="${val(sessionData.username)}"/>
                <LocationRef LocationOID="-"/>
                <DateTimeStamp>${timestamp}</DateTimeStamp>
            </AuditRecord>
            <Annotation SeqNum="1"><Flag><FlagValue CodeListOID="OpenEDC.DataStatus">3</FlagValue></Flag></Annotation>
            <ItemGroupData ItemGroupOID="IG.ZS_metadata">
                <ItemData ItemOID="I.ZS_id" Value="${val(result.id)}"/>
                <ItemData ItemOID="I.ZS_testID" Value="${val(result.testId)}"/>
                <ItemData ItemOID="I.ZS_timestamp" Value="${val(result.timestamp)}"/>
            </ItemGroupData>
            <ItemGroupData ItemGroupOID="IG.ZS_Ergebnisse">
                <ItemData ItemOID="I.ZS_correctCount" Value="${val(d.correctCount ?? result.score)}"/>
                <ItemData ItemOID="I.ZS_totalAttempted" Value="${val(d.totalAttempted)}"/>
                <ItemData ItemOID="I.ZS_timeTaken" Value="${val(d.timeTaken)}"/>
                <ItemData ItemOID="I.ZS_answers" Value="${val(d.answers)}"/>
                <ItemData ItemOID="I.ZS_tasks" Value="${val(d.tasks)}"/>
            </ItemGroupData>
        </FormData>\n`;
    }

    // --- 3. TRAIL MAKING TEST (TMT A & B) ---
    if (result.testId === 'tmt_a' || result.testId === 'tmt_b') {
      xml += `        <FormData FormOID="F.TMT" TransactionType="Insert">
            <AuditRecord>
                <UserRef UserOID="${val(sessionData.username)}"/>
                <LocationRef LocationOID="-"/>
                <DateTimeStamp>${timestamp}</DateTimeStamp>
            </AuditRecord>
            <Annotation SeqNum="1"><Flag><FlagValue CodeListOID="OpenEDC.DataStatus">3</FlagValue></Flag></Annotation>
            <ItemGroupData ItemGroupOID="IG.TMT_metadata">
                <ItemData ItemOID="I.TMT_id" Value="${val(result.id)}"/>
                <ItemData ItemOID="I.TMT_testID" Value="${val(result.testId)}"/>
                <ItemData ItemOID="I.TMT_timestamp" Value="${val(result.timestamp)}"/>
            </ItemGroupData>
            <ItemGroupData ItemGroupOID="IG.TMT_Ergebnisse">
                <ItemData ItemOID="I.TMT_totalTimeSeconds" Value="${val(d.totalTimeSeconds ?? result.score)}"/>
            </ItemGroupData>
        </FormData>\n`;
    }

    // --- 4. COWAT TEST ---
    if (result.testId === 'cowat') {
      xml += `        <FormData FormOID="F.COWAT" TransactionType="Insert">
            <AuditRecord>
                <UserRef UserOID="${val(sessionData.username)}"/>
                <LocationRef LocationOID="-"/>
                <DateTimeStamp>${timestamp}</DateTimeStamp>
            </AuditRecord>
            <Annotation SeqNum="1"><Flag><FlagValue CodeListOID="OpenEDC.DataStatus">3</FlagValue></Flag></Annotation>
            <ItemGroupData ItemGroupOID="IG.COWAT_metadata">
                <ItemData ItemOID="I.COWAT_id" Value="${val(result.id)}"/>
                <ItemData ItemOID="I.COWAT_testID" Value="${val(result.testId)}"/>
                <ItemData ItemOID="I.COWAT_timestamp" Value="${val(result.timestamp)}"/>
            </ItemGroupData>
            <ItemGroupData ItemGroupOID="IG.COWAT_Ergebnisse">
                <ItemData ItemOID="I.COWAT_letter" Value="${val(d.letter)}"/>
                <ItemData ItemOID="I.COWAT_correctCount" Value="${val(d.correctCount ?? result.score)}"/>
                <ItemData ItemOID="I.COWAT_correctWords" Value="${val(d.correctWords)}"/>
                <ItemData ItemOID="I.COWAT_incorrectWordsFound" Value="${val(d.incorrectWordsFound)}"/>
                <ItemData ItemOID="I.COWAT_fullProtocol" Value="${val(d.fullProtocol)}"/>
            </ItemGroupData>
        </FormData>\n`;
    }

    // --- 5. HVLT LEARNING ---
    if (result.testId === 'hvlt_learning') {
      xml += `        <FormData FormOID="F.HVLT" TransactionType="Insert">
            <AuditRecord>
                <UserRef UserOID="${val(sessionData.username)}"/>
                <LocationRef LocationOID="-"/>
                <DateTimeStamp>${timestamp}</DateTimeStamp>
            </AuditRecord>
            <Annotation SeqNum="1"><Flag><FlagValue CodeListOID="OpenEDC.DataStatus">3</FlagValue></Flag></Annotation>
            <ItemGroupData ItemGroupOID="IG.HVLT_metadata">
                <ItemData ItemOID="I.HVLT_id" Value="${val(result.id)}"/>
                <ItemData ItemOID="I.HVLT_testID" Value="${val(result.testId)}"/>
                <ItemData ItemOID="I.HVLT_timestamp" Value="${val(result.timestamp)}"/>
            </ItemGroupData>
            <ItemGroupData ItemGroupOID="IG.HVLT_Ergebnisse">
                <ItemData ItemOID="I.HVLT_totalHitsTrial1to3" Value="${val(d.totalHitsTrial1to3)}"/>
                <ItemData ItemOID="I.HVLT_averageRecallRate" Value="${val(d.averageRecallRate)}"/>
                <ItemData ItemOID="I.HVLT_trials_trial" Value="${mapArray(d.trials, 'trial')}"/>
                <ItemData ItemOID="I.HVLT_trials_correctCount" Value="${mapArray(d.trials, 'correctCount')}"/>
                <ItemData ItemOID="I.HVLT_trials_recallRate" Value="${mapArray(d.trials, 'recallRate')}"/>
                <ItemData ItemOID="I.HVLT_trials_intrusionsCount" Value="${mapArray(d.trials, 'intrusionsCount')}"/>
                <ItemData ItemOID="I.HVLT_trials_foundWords" Value="${mapArray(d.trials, 'foundWords')}"/>
                <ItemData ItemOID="I.HVLT_trials_falseWords" Value="${mapArray(d.trials, 'falseWords')}"/>
                <ItemData ItemOID="I.HVLT_metadata_list" Value="${val(d.metadata?.list)}"/>
                <ItemData ItemOID="I.HVLT_metadata_timestamp" Value="${val(d.metadata?.timestamp)}"/>
            </ItemGroupData>
        </FormData>\n`;
    }

    // --- 6. MOCA TEST ---
    if (result.testId === 'moca_test') {
      const s = d.scenarios || {};
      
      xml += `        <FormData FormOID="F.MOCA" TransactionType="Insert">
            <AuditRecord>
                <UserRef UserOID="${val(sessionData.username)}"/>
                <LocationRef LocationOID="-"/>
                <DateTimeStamp>${timestamp}</DateTimeStamp>
            </AuditRecord>
            <Annotation SeqNum="1"><Flag><FlagValue CodeListOID="OpenEDC.DataStatus">3</FlagValue></Flag></Annotation>
            
            <ItemGroupData ItemGroupOID="IG.MOCA_metadata">
                <ItemData ItemOID="I.MOCA_id" Value="${val(result.id)}"/>
                <ItemData ItemOID="I.MOCA_testID" Value="${val(result.testId)}"/>
                <ItemData ItemOID="I.MOCA_timestamp" Value="${val(result.timestamp)}"/>
                <ItemData ItemOID="I.MOCA_startTime" Value="${val(d.metadata?.startTime)}"/>
            </ItemGroupData>
            
            <ItemGroupData ItemGroupOID="IG.MOCA_01_trails">
                <ItemData ItemOID="I.MOCA_01_trails_duration_active_sec" Value="${val(s['01_trails']?.duration_active_sec)}"/>
                <ItemData ItemOID="I.MOCA_01_trails_completed" Value="${val(s['01_trails']?.completed)}"/>
                <ItemData ItemOID="I.MOCA_01_trails_path_raw" Value="${val(s['01_trails']?.path_raw)}"/>
            </ItemGroupData>
            
            <ItemGroupData ItemGroupOID="IG.MOCA_02_clock">
                <ItemData ItemOID="I.MOCA_02_clock_target_time" Value="${val(s['02_clock']?.target_time)}"/>
                <ItemData ItemOID="I.MOCA_02_clock_final_angles_hour" Value="${val(s['02_clock']?.final_angles?.hour)}"/>
                <ItemData ItemOID="I.MOCA_02_clock_final_angles_minute" Value="${val(s['02_clock']?.final_angles?.minute)}"/>
                <ItemData ItemOID="I.MOCA_02_clock_total_clicks" Value="${val(s['02_clock']?.total_clicks)}"/>
                <ItemData ItemOID="I.MOCA_02_clock_optimal_clicks" Value="${val(s['02_clock']?.optimal_clicks)}"/>
                <ItemData ItemOID="I.MOCA_02_clock_unnecessary_clicks" Value="${val(s['02_clock']?.unnecessary_clicks)}"/>
                <ItemData ItemOID="I.MOCA_02_clock_timestamp_confirmed" Value="${val(s['02_clock']?.timestamp_confirmed)}"/>
            </ItemGroupData>
            
            <ItemGroupData ItemGroupOID="IG.MOCA_03_naming">
                <ItemData ItemOID="I.MOCA_03_naming_camel_success" Value="${val(s['03_naming']?.camel?.success)}"/>
                <ItemData ItemOID="I.MOCA_03_naming_rhino_success" Value="${val(s['03_naming']?.rhino?.success)}"/>
                <ItemData ItemOID="I.MOCA_03_naming_lion_success" Value="${val(s['03_naming']?.lion?.success)}"/>
                <ItemData ItemOID="I.MOCA_03_naming_camel_transcript" Value="${val(s['03_naming']?.camel?.transcript)}"/>
                <ItemData ItemOID="I.MOCA_03_naming_rhino_transcript" Value="${val(s['03_naming']?.rhino?.transcript)}"/>
                <ItemData ItemOID="I.MOCA_03_naming_lion_transcript" Value="${val(s['03_naming']?.lion?.transcript)}"/>
                <ItemData ItemOID="I.MOCA_03_naming_score" Value="${val(s['03_naming']?.score)}"/>
                <ItemData ItemOID="I.MOCA_03_naming_timestamp_finished" Value="${val(s['03_naming']?.timestamp_finished)}"/>
            </ItemGroupData>
            
            <ItemGroupData ItemGroupOID="IG.MOCA_04_memory_immediate">
                <ItemData ItemOID="I.MOCA_04_memory_immediate_duration_recall_sec" Value="${val(s['04_memory_immediate']?.duration_recall_sec)}"/>
                <ItemData ItemOID="I.MOCA_04_memory_immediate_correct_count" Value="${val(s['04_memory_immediate']?.correct_count)}"/>
                <ItemData ItemOID="I.MOCA_04_memory_immediate_found_words" Value="${val(s['04_memory_immediate']?.found_words)}"/>
                <ItemData ItemOID="I.MOCA_04_memory_immediate_full_transcript" Value="${val(s['04_memory_immediate']?.full_transcript)}"/>
                <ItemData ItemOID="I.MOCA_04_memory_immediate_timestamp_finished" Value="${val(s['04_memory_immediate']?.timestamp_finished)}"/>
            </ItemGroupData>
            
            <ItemGroupData ItemGroupOID="IG.MOCA_05_digits">
                <ItemData ItemOID="I.MOCA_05_digits_backward_seq_length" Value="${val(s['05_digits']?.backward?.seq_length)}"/>
                <ItemData ItemOID="I.MOCA_05_digits_forward_seq_length" Value="${val(s['05_digits']?.forward?.seq_length)}"/>
                <ItemData ItemOID="I.MOCA_05_digits_backward_hits" Value="${val(s['05_digits']?.backward?.hits)}"/>
                <ItemData ItemOID="I.MOCA_05_digits_forward_hits" Value="${val(s['05_digits']?.forward?.hits)}"/>
                <ItemData ItemOID="I.MOCA_05_digits_backward_transcript" Value="${val(s['05_digits']?.backward?.transcript)}"/>
                <ItemData ItemOID="I.MOCA_05_digits_forward_transcript" Value="${val(s['05_digits']?.forward?.transcript)}"/>
                <ItemData ItemOID="I.MOCA_05_digits_timestamp_finished" Value="${val(s['05_digits']?.timestamp_finished)}"/>
            </ItemGroupData>
            
            <ItemGroupData ItemGroupOID="IG.MOCA_06_vigiliance">
                <ItemData ItemOID="I.MOCA_06_vigiliance_hits" Value="${val(s['06_vigilance']?.hits)}"/>
                <ItemData ItemOID="I.MOCA_06_vigiliance_omissions" Value="${val(s['06_vigilance']?.omissions)}"/>
                <ItemData ItemOID="I.MOCA_06_vigiliance_false_alarms" Value="${val(s['06_vigilance']?.false_alarms)}"/>
                <ItemData ItemOID="I.MOCA_06_vigiliance_timestamp_finished" Value="${val(s['06_vigilance']?.timestamp_finished)}"/>
            </ItemGroupData>
            
            <ItemGroupData ItemGroupOID="IG.MOCA_07_calculation">
                <ItemData ItemOID="I.MOCA_07_calculation_steps_expected" Value="${mapArray(s['07_calculation']?.steps, 'expected')}"/>
                <ItemData ItemOID="I.MOCA_07_calculation_steps_chosen" Value="${mapArray(s['07_calculation']?.steps, 'chosen')}"/>
                <ItemData ItemOID="I.MOCA_07_calculation_steps_is_correct" Value="${mapArray(s['07_calculation']?.steps, 'is_correct')}"/>
                <ItemData ItemOID="I.MOCA_07_calculation_steps_reaction_time_ms" Value="${mapArray(s['07_calculation']?.steps, 'reaction_time_ms')}"/>
                <ItemData ItemOID="I.MOCA_07_calculation_final_sequence" Value="${val(s['07_calculation']?.final_sequence)}"/>
                <ItemData ItemOID="I.MOCA_07_calculation_timestamp_finished" Value="${val(s['07_calculation']?.timestamp_finished)}"/>
            </ItemGroupData>
            
            <ItemGroupData ItemGroupOID="IG.MOCA_08_language">
                <ItemData ItemOID="I.MOCA_08_language_target_sequence" Value="${val(s['08_language']?.target_sentence)}"/>
                <ItemData ItemOID="I.MOCA_08_language_is_correct" Value="${val(s['08_language']?.is_correct)}"/>
                <ItemData ItemOID="I.MOCA_08_language_full_transcript" Value="${val(s['08_language']?.full_transcript)}"/>
                <ItemData ItemOID="I.MOCA_08_language_timestamp_finished" Value="${val(s['08_language']?.timestamp_finished)}"/>
            </ItemGroupData>
            
            <ItemGroupData ItemGroupOID="IG.MOCA_09_word_fluency">
                <ItemData ItemOID="I.MOCA_09_word_fluency_valid_wiki_count" Value="${val(s['09_word_fluency']?.valid_wiki_count)}"/>
                <ItemData ItemOID="I.MOCA_09_word_fluency_raw_word_list" Value="${val(s['09_word_fluency']?.raw_word_list)}"/>
                <ItemData ItemOID="I.MOCA_09_word_fluency_timestamp_finished" Value="${val(s['09_word_fluency']?.timestamp_finished)}"/>
            </ItemGroupData>
            
            <ItemGroupData ItemGroupOID="IG.MOCA_10_delayed_recall">
                <ItemData ItemOID="I.MOCA_10_delayed_recall_correct_count" Value="${val(s['10_delayed_recall']?.correct_count)}"/>
                <ItemData ItemOID="I.MOCA_10_delayed_recall_remembered_words" Value="${val(s['10_delayed_recall']?.remembered_words)}"/>
                <ItemData ItemOID="I.MOCA_10_delayed_recall_forgotten_words" Value="${val(s['10_delayed_recall']?.forgotten_words)}"/>
                <ItemData ItemOID="I.MOCA_10_delayed_recall_reference_task_04" Value="${val(s['10_delayed_recall']?.reference_task_04)}"/>
                <ItemData ItemOID="I.MOCA_10_delayed_recall_timestamp_finished" Value="${val(s['10_delayed_recall']?.timestamp_finished)}"/>
            </ItemGroupData>
        </FormData>\n`;
    }
  });

  xml += `    </StudyEventData>
</SubjectData>`;

  return xml;
};

// 2. Hauptfunktion: Baut das XML und verschlüsselt es direkt
export const generateAndEncryptODM = (results, sessionData) => {
  try {
    if (!sessionData || !sessionData.surveySecretKey) {
      throw new Error("Fehlende Session-Daten oder Secret Key für die Verschlüsselung.");
    }

    const xmlString = buildODMString(results, sessionData);
    
    // XML mit dem surveySecretKey AES-verschlüsseln
    const encryptedXML = CryptoJS.AES.encrypt(xmlString, sessionData.surveySecretKey).toString();
    
    return encryptedXML;
    
  } catch (error) {
    console.error("Fehler beim XML-Bau oder bei der Verschlüsselung:", error);
    return null;
  }
};