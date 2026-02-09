import { Quiz } from './types';

export const COLORS = {
  black: 'bg-neo-black',
  paper: 'bg-neo-paper',
  lemon: 'bg-neo-lemon',
  coral: 'bg-neo-coral',
  mint: 'bg-neo-mint',
  periwinkle: 'bg-neo-periwinkle',
  blue: 'bg-neo-blue',
};

export const MOCK_QUIZ: Quiz = {
  id: 'demo-quiz',
  title: "What Type of Sandwich Are You?",
  description: "Are you a classic Club or a spicy Panini? Find out now!",
  author: "PopBot",
  createdAt: Date.now(),
  plays: 1240,
  outcomes: [
    { id: 'o1', title: 'The Spicy Italian', description: 'You are bold, flavorful, and a little bit chaotic.', image: '🌶️', colorClass: 'bg-neo-coral' },
    { id: 'o2', title: 'The Classic Club', description: 'Reliable, layered, and everyone likes you.', image: '🥪', colorClass: 'bg-neo-lemon' },
    { id: 'o3', title: 'The Grilled Cheese', description: 'Warm, comforting, and best when under pressure.', image: '🧀', colorClass: 'bg-neo-mint' },
    { id: 'o4', title: 'The PB&J', description: 'Sweet, simple, and young at heart.', image: '🥜', colorClass: 'bg-neo-periwinkle' }
  ],
  questions: [
    {
      id: 'q1',
      text: "It's Friday night. What's the move?",
      answers: [
        { id: 'a1', text: "Salsa dancing until 2am", outcomeId: 'o1' },
        { id: 'a2', text: "Dinner party with close friends", outcomeId: 'o2' },
        { id: 'a3', text: "Netflix and actual chill", outcomeId: 'o3' },
        { id: 'a4', text: "Video games and snacks", outcomeId: 'o4' }
      ]
    },
    {
      id: 'q2',
      text: "Pick a vacation destination",
      answers: [
        { id: 'a1', text: "Mexico City", outcomeId: 'o1' },
        { id: 'a2', text: "London", outcomeId: 'o2' },
        { id: 'a3', text: "A cabin in the woods", outcomeId: 'o3' },
        { id: 'a4', text: "Disney World", outcomeId: 'o4' }
      ]
    },
    {
      id: 'q3',
      text: "What's your toxic trait?",
      answers: [
        { id: 'a1', text: "I speak before I think", outcomeId: 'o1' },
        { id: 'a2', text: "I'm a perfectionist", outcomeId: 'o2' },
        { id: 'a3', text: "I cancel plans last minute", outcomeId: 'o3' },
        { id: 'a4', text: "I only eat chicken nuggets", outcomeId: 'o4' }
      ]
    }
  ]
};

export const DEFAULT_OUTCOMES = [
  { id: 'o1', title: 'Result A', description: 'Description for result A', image: 'A', colorClass: 'bg-neo-coral' },
  { id: 'o2', title: 'Result B', description: 'Description for result B', image: 'B', colorClass: 'bg-neo-mint' },
  { id: 'o3', title: 'Result C', description: 'Description for result C', image: 'C', colorClass: 'bg-neo-lemon' },
  { id: 'o4', title: 'Result D', description: 'Description for result D', image: 'D', colorClass: 'bg-neo-periwinkle' },
];
