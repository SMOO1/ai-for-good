import { vocabulary, VocabularyItem } from "@/data/vocabulary";

export const getMockGuesses = (count: number = 3): VocabularyItem[] => {
  // Randomly shuffle and take 'count' items
  const shuffled = [...vocabulary].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
