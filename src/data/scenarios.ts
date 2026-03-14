export interface ScenarioModule {
  id: string
  topic: string
  topicLabel: string
  topicIcon: string
  vocabId: string
  word: string
  wordAudio: string
  // Rohingya translation (romanized for TTS, arabic script for display)
  wordRoh: string
  wordArabic: string
  phrase: string
  phraseAudio: string
  phraseRoh: string
  phraseArabic: string
  pattern: string
  patternOptions: string[]
  sentence: string
  sentenceAudio: string
  scenarioLocation: string
  scenarioIcon: string
  dialoguePrompt: string
  dialogueExpected: string
  dialogueFeedback: string
}

export const SCENARIOS: ScenarioModule[] = [
  {
    id: 'doctor',
    topic: 'doctor',
    topicLabel: 'Doctor',
    topicIcon: '🏥',
    vocabId: 'doctor',
    word: 'doctor',
    wordAudio: 'doctor',
    wordRoh: 'daktor',
    wordArabic: 'دَکٹَر',
    phrase: 'need doctor',
    phraseAudio: 'need doctor',
    phraseRoh: 'daktor lage',
    phraseArabic: 'دَکٹَر لاگے',
    pattern: 'I need ___',
    patternOptions: ['doctor', 'water', 'help'],
    sentence: 'I need a doctor.',
    sentenceAudio: 'I need a doctor.',
    scenarioLocation: 'Clinic',
    scenarioIcon: '🏥',
    dialoguePrompt: 'How can I help you?',
    dialogueExpected: 'I need a doctor.',
    dialogueFeedback: 'This sentence is very useful at a clinic.',
  },
  {
    id: 'bus',
    topic: 'bus',
    topicLabel: 'Bus',
    topicIcon: '🚌',
    vocabId: 'bus',
    word: 'bus',
    wordAudio: 'bus',
    wordRoh: 'baás',
    wordArabic: 'باس',
    phrase: 'bus stop',
    phraseAudio: 'bus stop',
    phraseRoh: 'baás esthicén',
    phraseArabic: 'باس اِستِیسَن',
    pattern: 'Where is ___?',
    patternOptions: ['the bus stop', 'the school', 'the clinic'],
    sentence: 'Where is the bus stop?',
    sentenceAudio: 'Where is the bus stop?',
    scenarioLocation: 'Street',
    scenarioIcon: '🛣️',
    dialoguePrompt: 'Can I help you?',
    dialogueExpected: 'Where is the bus stop?',
    dialogueFeedback: 'Great! People will understand you.',
  },
  {
    id: 'school',
    topic: 'school',
    topicLabel: 'School',
    topicIcon: '🏫',
    vocabId: 'child',
    word: 'child',
    wordAudio: 'child',
    wordRoh: 'fua',
    wordArabic: 'فُوا',
    phrase: 'child sick',
    phraseAudio: 'child sick',
    phraseRoh: 'fua biaram',
    phraseArabic: 'فُوا بِیارام',
    pattern: 'My child is ___',
    patternOptions: ['sick', 'at school', 'ready'],
    sentence: 'My child is sick.',
    sentenceAudio: 'My child is sick.',
    scenarioLocation: 'School Office',
    scenarioIcon: '📋',
    dialoguePrompt: 'Hello! How can I help?',
    dialogueExpected: 'My child is sick.',
    dialogueFeedback: 'Well done! The teacher will understand.',
  },
  {
    id: 'grocery',
    topic: 'grocery',
    topicLabel: 'Grocery',
    topicIcon: '🛒',
    vocabId: 'food',
    word: 'food',
    wordAudio: 'food',
    wordRoh: 'hána',
    wordArabic: 'هانا',
    phrase: 'need food',
    phraseAudio: 'need food',
    phraseRoh: 'hána lage',
    phraseArabic: 'هانا لاگے',
    pattern: 'I need ___',
    patternOptions: ['food', 'water', 'a bag'],
    sentence: 'I need food.',
    sentenceAudio: 'I need food.',
    scenarioLocation: 'Store',
    scenarioIcon: '🏪',
    dialoguePrompt: 'What are you looking for?',
    dialogueExpected: 'I need food.',
    dialogueFeedback: 'Perfect! You can use this at any store.',
  },
  {
    id: 'work',
    topic: 'work',
    topicLabel: 'Work',
    topicIcon: '💼',
    vocabId: 'work',
    word: 'work',
    wordAudio: 'work',
    wordRoh: 'ham',
    wordArabic: 'هام',
    phrase: 'I work',
    phraseAudio: 'I work',
    phraseRoh: 'mui ham gori',
    phraseArabic: 'مُئی هام گَری',
    pattern: 'I work at ___',
    patternOptions: ['a store', 'a school', 'a clinic'],
    sentence: 'I work at a store.',
    sentenceAudio: 'I work at a store.',
    scenarioLocation: 'Interview',
    scenarioIcon: '🤝',
    dialoguePrompt: 'Tell me about yourself.',
    dialogueExpected: 'I work at a store.',
    dialogueFeedback: 'Excellent! This is great for interviews.',
  },
]
