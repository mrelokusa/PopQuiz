import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, Quiz, AuthUser, LoadingState } from '../types';
import { getCurrentUser, ensureUserProfile, signOut } from '../services/authService';
import { getQuizzes } from '../services/storageService';
import { supabase } from '../lib/supabaseClient';

// App state interface
interface AppStateData {
  user: AuthUser | null;
  view: AppState;
  activeQuiz: Quiz | null;
  quizzes: Quiz[];
  loading: LoadingState;
}

// Action types
type AppAction =
  | { type: 'SET_USER'; payload: AuthUser | null }
  | { type: 'SET_VIEW'; payload: AppState }
  | { type: 'SET_ACTIVE_QUIZ'; payload: Quiz | null }
  | { type: 'SET_QUIZZES'; payload: Quiz[] }
  | { type: 'SET_LOADING'; payload: LoadingState }
  | { type: 'ADD_QUIZ'; payload: Quiz }
  | { type: 'UPDATE_QUIZ'; payload: { id: string; updates: Partial<Quiz> } }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: AppStateData = {
  user: null,
  view: AppState.LANDING,
  activeQuiz: null,
  quizzes: [],
  loading: { isLoading: false }
};

// Reducer
const appReducer = (state: AppStateData, action: AppAction): AppStateData => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    case 'SET_ACTIVE_QUIZ':
      return { ...state, activeQuiz: action.payload };
    case 'SET_QUIZZES':
      return { ...state, quizzes: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'ADD_QUIZ':
      return { ...state, quizzes: [action.payload, ...state.quizzes] };
    case 'UPDATE_QUIZ':
      return {
        ...state,
        quizzes: state.quizzes.map(quiz =>
          quiz.id === action.payload.id
            ? { ...quiz, ...action.payload.updates }
            : quiz
        )
      };
    case 'RESET_STATE':
      return { ...initialState, user: state.user }; // Preserve user on reset
    default:
      return state;
  }
};

// Context type
interface AppContextType extends AppStateData {
  dispatch: React.Dispatch<AppAction>;
  // Convenience actions
  setUser: (user: AuthUser | null) => void;
  setView: (view: AppState) => void;
  setActiveQuiz: (quiz: Quiz | null) => void;
  setLoading: (loading: LoadingState) => void;
  fetchQuizzes: (scope: 'global' | 'local') => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Convenience actions
  const setUser = (user: AuthUser | null) => dispatch({ type: 'SET_USER', payload: user });
  const setView = (view: AppState) => dispatch({ type: 'SET_VIEW', payload: view });
  const setActiveQuiz = (quiz: Quiz | null) => dispatch({ type: 'SET_ACTIVE_QUIZ', payload: quiz });
  const setLoading = (loading: LoadingState) => dispatch({ type: 'SET_LOADING', payload: loading });

  // Fetch quizzes
  const fetchQuizzes = async (scope: 'global' | 'local') => {
    setLoading({ isLoading: true, message: 'Loading quizzes...' });
    try {
      const userId = scope === 'local' ? state.user?.id : undefined;
      const quizzes = await getQuizzes(scope, userId);
      dispatch({ type: 'SET_QUIZZES', payload: quizzes });
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    } finally {
      setLoading({ isLoading: false });
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut();
      dispatch({ type: 'RESET_STATE' });
      dispatch({ type: 'SET_VIEW', payload: AppState.LANDING });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Initialize auth and deep links
  useEffect(() => {
    const initializeApp = async () => {
      setLoading({ isLoading: true, message: 'Initializing...' });
      
      try {
        // Check auth
        const user = await getCurrentUser();
        if (user) {
          await ensureUserProfile(user);
          setUser(user);
        }

        // Check deep link
        const params = new URLSearchParams(window.location.search);
        const quizId = params.get('quiz');
        if (quizId) {
          // Load specific quiz
          const { getQuizById } = await import('../services/storageService');
          const quiz = await getQuizById(quizId);
          if (quiz) {
            setActiveQuiz(quiz);
            setView(AppState.PLAY);
          }
        }
      } catch (error) {
        console.error('App initialization failed:', error);
      } finally {
        setLoading({ isLoading: false });
      }
    };

    initializeApp();

    // Auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user || null;
      setUser(user);
      
      if (user) {
        await ensureUserProfile(user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch quizzes when view changes to landing or local
  useEffect(() => {
    if (state.view === AppState.LANDING) {
      fetchQuizzes('global');
    } else if (state.view === AppState.LOCAL && state.user) {
      fetchQuizzes('local');
    }
  }, [state.view, state.user?.id]);

  const contextValue: AppContextType = {
    ...state,
    dispatch,
    setUser,
    setView,
    setActiveQuiz,
    setLoading,
    fetchQuizzes,
    logout
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};