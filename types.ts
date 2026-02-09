export interface Outcome {
  id: string;
  title: string;
  description: string;
  image: string; // Emoji or short text
  colorClass: string;
}

export interface Answer {
  id: string;
  text: string;
  outcomeId: string; // Maps to an outcome
}

export interface Question {
  id: string;
  text: string;
  answers: Answer[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  outcomes: Outcome[];
  author: string; // Display name
  user_id?: string; // Supabase Auth ID
  createdAt: number;
  plays: number;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar_text: string;
  created_at?: number;
}

export interface QuizResult {
  id: string;
  quiz_id: string;
  user_id?: string;
  outcome_id: string;
  created_at: number;
  // Joins
  quiz_title?: string;
  outcome_title?: string;
  outcome_image?: string;
  taker_username?: string;
  taker_avatar?: string;
}

export enum AppState {
  AUTH = 'auth',
  LANDING = 'landing', // Global Feed
  LOCAL = 'local',     // My Hub (Created Quizzes + Friend Results)
  CREATE = 'create',
  PLAY = 'play',
  RESULT = 'result'
}

// User interface from Supabase Auth
export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Form validation
export interface ValidationError {
  field: string;
  message: string;
}

export type ValidationErrors = ValidationError[];
