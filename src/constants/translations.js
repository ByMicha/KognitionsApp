const translations = {
  de: {
    appTitle: "Kognitionstests Uniklinik Heidelberg",
    startBattery: "Ganze Testbatterie starten",
    settings: "Einstellungen",
    deviceTooSmall: "Das Gerät ist zu klein. Bitte begib dich an ein größeres Gerät. Hier ist das ganze nicht zu öffnen.",
    backToMenu: "Zurück zum Menü",
    tests: {
      moca: "Montreal Cognitive Assessment (MoCA)",
      cowat: "Controlled Oral Word Association Test (COWAT)",
      hvlt: "Hopkins Verbal Learning Test (HVLT)",
      zsTest: "Zahlen-Symbol Test",
      tmt: "Trail Making Test (TMT)",
      bells: "Bells Test",
      qlqC30: "EORTC QLQ-C30"
    },
    tmt: {
      title: "Trail Making Test - Teil A",
      success: "Glückwunsch! Test beendet.",
      search: "Suche:",
      done: "Fertig!",
      restart: "Neustart",
      part: "Teil",
    },
    bells: {
      title: "Bells Test",
      instruction: "Bitte markieren Sie alle Glocken, die Sie auf dem Blatt finden.",
      done: "Test beenden"
    },
    zsTest: {
      title: "Zahlen-Symbol-Test",
      instruction: "Ordnen Sie den Zahlen so schnell wie möglich die passenden Symbole aus der Legende zu.",
      start: "Test starten",
      done: "Test beenden",
      timeUp: "Zeit abgelaufen",
      exampleTry: "Beispiel / Übung",
    },
    hvlt: {
      title: "Hopkins Verbal Learning Test (HVLT-R)",
      instruction: "Sie werden gleich 12 Wörter hören. Bitte hören Sie aufmerksam zu. Danach sollen Sie so viele Wörter wie möglich nennen.",
      startTrial: "Durchgang starten",
      listening: "Bitte zuhören...",
      speakNow: "Bitte nennen Sie jetzt die Wörter",
      nextTrial: "Nächster Durchgang",
      finishTrials: "Lernphase beenden",
      trials: "Durchgang",
      wordsFound: "Wörter erkannt",
      learningPhase: "Lernphase",
      round: "Durchgang",
      of: "von",
      start: "starten",
      ready: "Bereit...",
      pleaseList: "Bitte aufzählen...",
      waitForSpeech: "Warten auf Sprache...",
      endTest: "Test abschließen",
      word: "Wort",
    },
    cowat: {
      title: "Wortflüssigkeitstest (COWAT)",
      instruction: "Sie sehen gleich einen Buchstaben. Nennen Sie bitte so viele Wörter wie möglich, die mit diesem Buchstaben beginnen. Sie haben 60 Sekunden Zeit. Keine Eigennamen oder Zahlen bitte.",
      startTest: "Test starten",
      speakNow: "Nennen Sie Wörter mit:",
      timeUp: "Zeit abgelaufen",
      correctWords: "Korrekte Wörter",
      incorrectWords: "Fehler / Falsche Buchstaben",
      finish: "Ergebnis speichern",
      recordingRunning: "Aufzeichnung läuft...",
      systemReady: "System bereit...",
      endTestNow: "Test jetzt beenden",
      wordCheckWiktionary: "Wörter werden gegen Wiktionary geprüft...",
      result: "Ergebnis",
      letter: "Buchstabe",
      correctWordsFound: "gültige Wörter gefunden",
      deatiledListOfWords: "Detaillierte Wortliste",
      completeTest: "Test abschließen",

    },
    qlq: {
      title: "EORTC QLQ-C30",
      intro: "Bitte beantworten Sie die folgenden Fragen, indem Sie die Zahl wählen, die am besten auf Sie zutrifft. Es gibt keine richtigen oder falschen Antworten.",
      next: "Weiter",
      finish: "Abschließen",
      scales: {
        standard: ["Überhaupt nicht", "Wenig", "Ziemlich", "Sehr"],
        overall: ["Sehr schlecht", "2", "3", "4", "5", "6", "Ausgezeichnet"]
      },
      questions: {
        q1: "Bereitet es Ihnen Schwierigkeiten, sich körperlich anzustrengen (z. B. eine schwere Einkaufstasche oder einen Koffer zu tragen)?",
        q2: "Bereitet es Ihnen Schwierigkeiten, einen längeren Spaziergang zu machen?",
        q3: "Bereitet es Ihnen Schwierigkeiten, eine kurze Strecke außer Haus zu gehen?",
        q4: "Müssen Sie tagsüber im Bett liegen oder in einem Sessel sitzen?",
        q5: "Brauchen Sie Hilfe beim Essen, Anziehen, Waschen oder Benutzen der Toilette?",
        q6: "Waren Sie bei Ihrer Arbeit oder bei anderen tagtäglichen Beschäftigungen eingeschränkt?",
        q7: "Waren Sie bei Ihren Hobbys oder anderen Freizeitbeschäftigungen eingeschränkt?",
        q8: "Waren Sie kurzatmig?",
        q9: "Hatten Sie Schmerzen?",
        q10: "Mussten Sie sich ausruhen?",
        q11: "Hatten Sie Schlafstörungen?",
        q12: "Fühlten Sie sich schwach?",
        q13: "Hatten Sie Appetitmangel?",
        q14: "War Ihnen übel?",
        q15: "Haben Sie erbrochen?",
        q16: "Hatten Sie Verstopfung?",
        q17: "Hatten Sie Durchfall?",
        q18: "Waren Sie müde?",
        q19: "Fühlten Sie sich durch Schmerzen in Ihrem alltäglichen Leben beeinträchtigt?",
        q20: "Hatten Sie Schwierigkeiten, sich auf etwas zu konzentrieren, z. B. auf Zeitunglesen oder Fernsehen?",
        q21: "Fühlten Sie sich angespannt?",
        q22: "Haben Sie sich Sorgen gemacht?",
        q23: "Waren Sie reizbar?",
        q24: "Fühlten Sie sich niedergeschlagen?",
        q25: "Hatten Sie Schwierigkeiten, sich an Dinge zu erinnern?",
        q26: "Hat Ihr körperlicher Zustand oder Ihre medizinische Behandlung Ihr Familienleben beeinträchtigt?",
        q27: "Hat Ihr körperlicher Zustand oder Ihre medizinische Behandlung Ihr Zusammensein oder Ihre gemeinsamen Unternehmungen mit anderen Menschen beeinträchtigt?",
        q28: "Hat Ihr körperlicher Zustand oder Ihre medizinische Behandlung für Sie finanzielle Schwierigkeiten mit sich gebracht?",
        q29: "Wie würden Sie insgesamt Ihren Gesundheitszustand während der letzten Woche einschätzen?",
        q30: "Wie würden Sie insgesamt Ihre Lebensqualität während der letzten Woche einschätzen?"
      }
    },
    language: "Sprache",
    theme: "Design",
    light: "Hell",
    dark: "Dunkel",
    savedResults: "Gespeicherte Resultate",
    noEntriesYet: "Noch keine Ergebnisse vorhanden.",
    resultsAndDatabase: "Ergebnisse & Datenbank",
    welcomeDashboard: "Willkommen im Dashboard",

    results: {
      deleteAllRequest: "Möchten Sie wirklich ALLE Ergebnisse unwiderruflich löschen?",
      deleteAllData: "Alle Daten löschen",
      cancel: "Abbrechen",
      delete: "Löschen",
      deleteOneRequest: "Möchten Sie diesen Testeintrag wirklich löschen?",
      deleteEntry: "Eintrag löschen",
      noEntriesFound: "Keine Einträge gefunden.",
      result: "Ergebnis",
      answers: "Antworten",
      correctWords: "Korrekte Wörter",
      overallPerformance: "Lernleistung Gesamt",
      words: "Wörter",
      time: "Zeit",
      editedFields: "Bearbeitete Felder",
      correctAssignment: "Korrekte Zuordnungen",
      forgotten: "Vergessen",
      remebered: "Erinnert",
      success: "Erfolg",
      duration: "Dauer",
      bellsFound: "Glocken gefunden",
      misses: "Auslassungen",
      left: "Links",
      right: "Rechts",
      usnAlertMsg: "Hinweis auf USN (6+ Auslassungen auf einer Seite)",
      should: "Sollte",
      is: "Ist",
      correct: "Korrekt",
      wrong: "Falsch",
      fluency: "Wortfluss",
      repetition: "Nachsprechen",
      sequence: "Sequenz",
      step: "Schritt",
      hits: "Treffer",
      vigilance: "Vigilanz",
      miss: "Auslassung",
      falseAlarm: "Fehlalarm",
      letter: "Buchstabe",
      countBackwards: "Zahlen Rückwärts",
      countForward: "Zahlen Rückwärts",
      transcript: "Transkript",
      noEntry: "keine Eingabe",
      trails: "Trails",
      processingTime: "Bearbeitungszeit",
      path: "Pfad",
      timeClock: "Uhrzeit",
      clock: "Uhr",
      required: "gefordert",
      efficency: "Effizienz",
      clicks: "Klicks",
      corrections: "Korrekturen",
      angle: "Winkel",
      hour: "Stunde",
      minute: "Minute",
      visualConstructiveExecutive: "Visuokonstruktiv / Exekutiv",
      naming: "Benennen",
      remember: "Gedächtnis (Lernphase)",
      attention: "Aufmerksamkeit",
      calculation: "Rechnen (Serielle 7)",
      language: "Sprache",
      recall: "Verzögerter Abruf (Recall)",
      none: "Keine",
    },

    moca: {
      mocaProgress: "MoCA Fortschritt",
      endTest: "Test beenden",
      nextTest: "Nächster Test",
    },

    explanation: {
      threeCentralSteps: "Drei zentrale Schritte",
      backToTest: "Zurück zum Test",
      understoodStartTest: "Verstanden & Test starten",
      content: {
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
      }
    }
  },


  en: {
    appTitle: "Cognitive Tests Heidelberg Hospital",
    startBattery: "Start Full Test Battery",
    settings: "Settings",
    deviceTooSmall: "The device is too small. Please use a larger device. This application cannot be opened here.",
    backToMenu: "Back to Menu",
    tests: {
      moca: "Montreal Cognitive Assessment (MoCA)",
      cowat: "Controlled Oral Word Association Test (COWAT)",
      hvlt: "Hopkins Verbal Learning Test (HVLT)",
      zsTest: "Digit Symbol Test",
      tmt: "Trail Making Test (TMT)",
      bells: "Bells Test",
      qlqC30: "EORTC QLQ-C30"
    },
    tmt: {
      title: "Trail Making Test",
      success: "Congratulations! Test completed.",
      search: "Search:",
      done: "Done!",
      restart: "Restart",
      part: "Part",
    },
    bells: {
      title: "Bells Test",
      instruction: "Please mark all the bells you find on the sheet.",
      done: "Finish Test"
    },
    zsTest: {
      title: "Digit-Symbol Test",
      instruction: "Match the numbers with the corresponding symbols from the legend as quickly as possible.",
      start: "Start Test",
      done: "End Test",
      timeUp: "Time's up",
      exampleTry: "Example / Exercise",
    },
    hvlt: {
      title: "Hopkins Verbal Learning Test (HVLT-R)",
      instruction: "You are about to hear 12 words. Please listen carefully. Afterward, please say as many words as you can.",
      startTrial: "Start trial",
      listening: "Please listen...",
      speakNow: "Please say the words now",
      nextTrial: "Next trial",
      finishTrials: "End learning phase",
      trials: "Trial",
      wordsFound: "Words recognized",
      learningPhase: "Learning phase",
      round: "Trial",
      of: "of",
      start: "Start",
      ready: "Ready...",
      pleaseList: "Please list...",
      waitForSpeech: "Waiting for speech...",
      endTest: "Complete test",
      word: "Word",
    },
    cowat: {
      title: "Controlled Oral Word Association Test (COWAT)",
      instruction: "You will soon see a letter. Please say as many words as possible that begin with this letter. You have 60 seconds. Please do not use proper nouns or numbers.",
      startTest: "Start Test",
      speakNow: "Say words starting with:",
      timeUp: "Time's up",
      correctWords: "Correct Words",
      incorrectWords: "Errors / Incorrect Letters",
      finish: "Save Results",
      recordingRunning: "Recording in progress...",
      systemReady: "System ready...",
      endTestNow: "End test now",
      wordCheckWiktionary: "Checking words against Wiktionary...",
      result: "Result",
      letter: "Letter",
      correctWordsFound: "valid words found",
      deatiledListOfWords: "Detailed list of words",
      completeTest: "Complete test",
    },
    qlq: {
      title: "EORTC QLQ-C30",
      intro: "Please answer the following questions by choosing the number that best applies to you. There are no right or wrong answers.",
      next: "Next",
      finish: "Finish",
      scales: {
        standard: ["Not at all", "A little", "Quite a bit", "Very much"],
        overall: ["Very poor", "2", "3", "4", "5", "6", "Excellent"]
      },
      questions: {
        q1: "Do you have any trouble doing strenuous activities, like carrying a heavy shopping bag or a suitcase?",
        q2: "Do you have any trouble taking a long walk?",
        q3: "Do you have any trouble taking a short walk outside of the house?",
        q4: "Do you need to stay in bed or a chair during the day?",
        q5: "Do you need help with eating, dressing, washing yourself or using the toilet?",
        q6: "Were you limited in doing either your work or other daily activities?",
        q7: "Were you limited in pursuing your hobbies or other leisure time activities?",
        q8: "Were you short of breath?",
        q9: "Have you had pain?",
        q10: "Did you need to rest?",
        q11: "Have you had trouble sleeping?",
        q12: "Have you felt weak?",
        q13: "Have you lacked appetite?",
        q14: "Have you felt nauseated?",
        q15: "Have you vomited?",
        q16: "Have you been constipated?",
        q17: "Have you had diarrhoea?",
        q18: "Were you tired?",
        q19: "Did pain interfere with your daily activities?",
        q20: "Have you had difficulty in concentrating on things, like reading a newspaper or watching television?",
        q21: "Did you feel tense?",
        q22: "Did you worry?",
        q23: "Did you feel irritable?",
        q24: "Did you feel depressed?",
        q25: "Have you had difficulty remembering things?",
        q26: "Has your physical condition or medical treatment interfered with your family life?",
        q27: "Has your physical condition or medical treatment interfered with your social activities?",
        q28: "Has your physical condition or medical treatment caused you financial difficulties?",
        q29: "How would you rate your overall health during the past week?",
        q30: "How would you rate your overall quality of life during the past week?"
      }
    },
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    savedResults: "Saved Results",
    noEntriesYet: "No results available yet.",
    resultsAndDatabase: "Results & Database",
    welcomeDashboard: "Welcome to the Dashboard",

    results: {
      deleteAllRequest: "Are you sure you want to permanently delete ALL results?",
      deleteAllData: "Delete all data",
      cancel: "Cancel",
      delete: "Delete",
      deleteOneRequest: "Are you sure you want to delete this test entry?",
      deleteEntry: "Delete entry",
      noEntriesFound: "No entries found.",
      result: "Result",
      answers: "Answers",
      correctWords: "Correct words",
      overallPerformance: "Total learning performance",
      words: "Words",
      time: "Time",
      editedFields: "Fields processed",
      correctAssignment: "Correct assignments",
      forgotten: "Forgotten",
      remebered: "Remembered",
      success: "Success",
      duration: "Duration",
      bellsFound: "Bells found",
      misses: "Omissions",
      left: "Left",
      right: "Right",
      usnAlertMsg: "Indication of USN (6+ omissions on one side)",
      should: "Target",
      is: "Actual",
      correct: "Correct",
      wrong: "Wrong",
      fluency: "Word fluency",
      repetition: "Repetition",
      sequence: "Sequence",
      step: "Step",
      hits: "Hits",
      vigilance: "Vigilance",
      miss: "Omission",
      falseAlarm: "False alarm",
      letter: "Letter",
      countBackwards: "Digits backward",
      countForward: "Digits forward",
      transcript: "Transcript",
      noEntry: "no input",
      trails: "Trails",
      processingTime: "Processing time",
      path: "Path",
      timeClock: "Time",
      clock: "Clock",
      required: "required",
      efficency: "Efficiency",
      clicks: "Clicks",
      corrections: "Corrections",
      angle: "Angle",
      hour: "Hour",
      minute: "Minute",
      visualConstructiveExecutive: "Visuoconstructive / Executive",
      naming: "Naming",
      remember: "Memory (learning phase)",
      attention: "Attention",
      calculation: "Calculation (Serial 7s)",
      language: "Language",
      recall: "Delayed recall",
      none: "None",
    },

    moca: {
      mocaProgress: "MoCA Progress",
      endTest: "End Test",
      nextTest: "Next Test",
    },

    explanation: {
      threeCentralSteps: "Three central steps",
      backToTest: "Back to test",
      understoodStartTest: "Understood & Start test",
      content: {
        moca: {
          title: "MoCA - Mental Fitness Test",
          desc: "In this test, we will look at various areas of your mental performance together. It consists of a total of 10 short exercises, for which we will need about 15 to 20 minutes.",
          steps: [
            { 
              title: "Diverse tasks:", 
              text: "You will draw lines, set a clock, name animals, and try to memorize words one after the other." 
            },
            { 
              title: "Concentration & Language:", 
              text: "Small calculation tasks, repeating sentences, and exercises where you pay close attention to sounds or letters will follow." 
            },
            { 
              title: "Quite relaxed:", 
              text: "Don't put yourself under pressure. The goal is to get an overview. Simply follow the instructions on the screen step by step." 
            },
          ],
          icon: "brain"
        },
        hvlt: {
          title: "Hopkins Verbal Learning Test (HVLT)",
          desc: "This test helps us understand how well you take in new information and how reliably you can keep it in your memory.",
          steps: [
            { 
              title: "Memorize words:", 
              text: "I will read a list of words to you. Please listen carefully and try to remember as many as possible." 
            },
            { 
              title: "Recall words:", 
              text: "Then tell me all the words you can still remember. The order does not matter." 
            },
            { 
              title: "Multiple learning trials:", 
              text: "We repeat this process a total of three times so that you can learn the words as well as possible." 
            },
          ],
          icon: "format-list-bulleted"
        },
        cowat: {
          title: "Word Fluency (COWAT)",
          desc: "Here we test how fluently you can retrieve terms from your memory. This is a good exercise for your word-finding ability.",
          steps: [
            { 
              title: "Use initial letters:", 
              text: "Please tell me as many words as possible that start with a certain letter (e.g., 'F')." 
            },
            { 
              title: "Specific rules:", 
              text: "Please avoid names of people or places as well as naming almost identical words multiple times." 
            },
            { 
              title: "Speak quickly:", 
              text: "You have exactly 60 seconds per letter. Simply say everything out loud that comes to mind." 
            },
          ],
          icon: "comment-text-multiple-outline"
        },
        tmt: {
          title: "Trail Making Test (TMT)",
          desc: "This test measures your attention and how well you can jump back and forth between different types of information (like numbers and letters).",
          steps: [
            { 
              title: "Form sequences:", 
              text: "In the first part, you connect numbers from 1 to 25. In the second part, you alternate between numbers and letters (1-A-2-B...)." 
            },
            { 
              title: "Work fluently:", 
              text: "Try to connect the circles as quickly as possible without lifting your finger or pen." 
            },
            { 
              title: "Correct mistakes:", 
              text: "If you make a mistake, it's not a problem. Simply correct the path and continue quickly." 
            },
          ],
          icon: "vector-polyline"
        },
        zs_test: {
          title: "Digit-Symbol Test",
          desc: "This exercise is about your processing speed. You assign specific symbols to their corresponding numbers.",
          steps: [
            { 
              title: "Look at the top:", 
              text: "At the top of the screen, you will see a legend. It shows which symbol belongs to which number (e.g., a circle for the number 1)." 
            },
            { 
              title: "Fill in at the bottom:", 
              text: "Look at the symbol in the middle and click on the corresponding number at the bottom as quickly as possible." 
            },
            { 
              title: "Use the time:", 
              text: "You have 90 seconds. Try to fill in as many fields as possible correctly during this time." 
            },
          ],
          icon: "numeric-9-plus-box-multiple-outline"
        },
        qlq: {
          title: "Well-being Questionnaire",
          desc: "This questionnaire helps us understand how you have been feeling lately and how you are doing in your daily life.",
          steps: [
            { 
              title: "Reflect:", 
              text: "Please relate your answers to how you have been feeling over the past week (the last 7 days)." 
            },
            { 
              title: "Your assessment:", 
              text: "Choose the answer for each question that best applies to you. There are no 'right' or 'wrong' answers here." 
            },
            { 
              title: "Completeness:", 
              text: "Take the time to answer all the questions. Your honest assessment is very valuable to us." 
            },
          ],
          icon: "clipboard-text-outline"
        },
        bells: {
          title: "Bells Test",
          desc: "In this exercise, we check how well you can visually search your surroundings. This helps us see if anything in your field of vision is being missed.",
          steps: [
            { 
              title: "Find bells:", 
              text: "There are many different drawings on the screen. Please find all the bells and tap them briefly." 
            },
            { 
              title: "Look closely:", 
              text: "There are a total of 35 hidden bells. Try to search the entire image thoroughly from left to right." 
            },
            { 
              title: "Ignore other images:", 
              text: "Don't let the other drawings (like houses or birds) distract you. We are only looking for the bells." 
            },
          ],
          icon: "search-web"
        },
      }
    }

  }
};

export default translations;