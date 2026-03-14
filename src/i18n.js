// UI translations: English ↔ Rohingya (romanized)
export const T = {
  en: {
    // Tabs
    tabLearn:   'Learn',
    tabDraw:    'Draw',
    tabGallery: 'Gallery',
    tabQuiz:    'Quiz',

    // Category labels
    catAll:      'all',
    catFood:     'food',
    catAnimals:  'animals',
    catNature:   'nature',
    catFamily:   'family',
    catColors:   'colors',
    catActions:  'actions',
    catPlaces:   'places',
    catBody:     'body',
    catNumbers:  'numbers',
    catFeelings: 'feelings',

    // Learn tab
    tapToSee:   'Tap to see Rohingya',
    listen:     '🔊 Listen',
    drawIt:     '✏️ Draw it',
    wordOf:     (i, n) => `${i} of ${n}`,

    // Draw tab
    drawPrompt: 'Draw this word:',
    hint:       (n) => `💡 Hint ${n}`,
    clear:      '🗑️ Clear',
    prev:       '← Prev',
    next:       'Next →',
    checkBtn:   '✓ Check',
    checking:   'Checking your drawing…',
    passTitle:  (w) => `✅ That looks like ${w}!`,
    failTitle:  '❌ Not quite…',
    saveGallery:'💾 Save to Gallery',
    skip:       'Skip →',
    tryAgain:   'Try again ↩',
    nextWord:   'Next word →',

    // Quiz tab
    quizPrompt: 'What does this mean in English?',

    // Language toggle
    langToggle: 'রোহিঙ্গা 🌐',
  },

  roh: {
    // Tabs
    tabLearn:   'Féka',
    tabDraw:    'Aṅka',
    tabGallery: 'Chóbi',
    tabQuiz:    'Porikkha',

    // Category labels
    catAll:      'hóbu',
    catFood:     'kana',
    catAnimals:  'janwor',
    catNature:   'kudrat',
    catFamily:   'poribar',
    catColors:   'rong',
    catActions:  'kaam',
    catPlaces:   'jaiga',
    catBody:     'sorir',
    catNumbers:  'shonkha',
    catFeelings: 'mon',

    // Learn tab
    tapToSee:   'Rohingya dekhó',
    listen:     '🔊 Shuno',
    drawIt:     '✏️ Aṅka koro',
    wordOf:     (i, n) => `${i} / ${n}`,

    // Draw tab
    drawPrompt: 'Ei shobod aṅka koro:',
    hint:       (n) => `💡 Isara ${n}`,
    clear:      '🗑️ Saaf',
    prev:       '← Pisé',
    next:       'Aage →',
    checkBtn:   '✓ Dekho',
    checking:   'Aṅka dekhitehi…',
    passTitle:  (w) => `✅ Hóu, ei ${w}!`,
    failTitle:  '❌ Thik nai…',
    saveGallery:'💾 Chóbi rakh',
    skip:       'Bád do →',
    tryAgain:   'Abar cesh ↩',
    nextWord:   'Aage shobod →',

    // Quiz tab
    quizPrompt: 'Ei English-e ki?',

    // Language toggle
    langToggle: 'English 🌐',
  },
}

export const CAT_KEYS = {
  all:      'catAll',
  food:     'catFood',
  animals:  'catAnimals',
  nature:   'catNature',
  family:   'catFamily',
  colors:   'catColors',
  actions:  'catActions',
  places:   'catPlaces',
  body:     'catBody',
  numbers:  'catNumbers',
  feelings: 'catFeelings',
}
