export interface VocabItem {
  id: string
  label: string
  icon: string
  audioText: string
  referenceEmoji: string
  topic: string
}

export const VOCABULARY: VocabItem[] = [
  { id: 'doctor',  label: 'doctor',  icon: '🩺', audioText: 'doctor',  referenceEmoji: '👨‍⚕️', topic: 'doctor' },
  { id: 'bus',     label: 'bus',     icon: '🚌', audioText: 'bus',     referenceEmoji: '🚌', topic: 'bus' },
  { id: 'school',  label: 'school',  icon: '🏫', audioText: 'school',  referenceEmoji: '🏫', topic: 'school' },
  { id: 'water',   label: 'water',   icon: '💧', audioText: 'water',   referenceEmoji: '💧', topic: 'doctor' },
  { id: 'food',    label: 'food',    icon: '🍽️', audioText: 'food',    referenceEmoji: '🍽️', topic: 'grocery' },
  { id: 'child',   label: 'child',   icon: '👦', audioText: 'child',   referenceEmoji: '👦', topic: 'school' },
  { id: 'book',    label: 'book',    icon: '📚', audioText: 'book',    referenceEmoji: '📚', topic: 'school' },
  { id: 'phone',   label: 'phone',   icon: '📱', audioText: 'phone',   referenceEmoji: '📱', topic: 'work' },
  { id: 'bag',     label: 'bag',     icon: '👜', audioText: 'bag',     referenceEmoji: '👜', topic: 'grocery' },
  { id: 'work',    label: 'work',    icon: '💼', audioText: 'work',    referenceEmoji: '💼', topic: 'work' },
  { id: 'teacher', label: 'teacher', icon: '👩‍🏫', audioText: 'teacher', referenceEmoji: '👩‍🏫', topic: 'school' },
  { id: 'help',    label: 'help',    icon: '🤝', audioText: 'help',    referenceEmoji: '🤝',  topic: 'doctor' },
  { id: 'money',   label: 'money',   icon: '💰', audioText: 'money',   referenceEmoji: '💰',  topic: 'money'  },
  { id: 'house',   label: 'house',   icon: '🏠', audioText: 'house',   referenceEmoji: '🏠',  topic: 'house'  },
  { id: 'police',  label: 'police',  icon: '👮', audioText: 'police',  referenceEmoji: '👮',  topic: 'police' },
  { id: 'name',    label: 'name',    icon: '🪪', audioText: 'name',    referenceEmoji: '🪪',  topic: 'name'   },
  { id: 'sick',    label: 'sick',    icon: '🤒', audioText: 'sick',    referenceEmoji: '🤒',  topic: 'sick'   },
]
