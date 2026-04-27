import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, Quiz, AuthUser, LoadingState } from '../types';
import { getCurrentUser, ensureUserProfile, signOut } from '../services/authService';
import { getQuizzes, getQuizById, PAGE_SIZE } from '../services/storageService';
import { supabase } from '../lib/supabaseClient';

// App state interface
interface AppStateData {
  user: AuthUser | null;
  view: AppState;
  activeQuiz: Quiz | null;
  editingQuiz: Quiz | null;
  quizzes: Quiz[];
  hasMoreQuizzes: boolean;
  loading: LoadingState;
  loadingMore: boolean;
  quizError: string | null;
}

// Action types
type AppAction =
  | { type: 'SET_USER'; payload: AuthUser | null }
  | { type: 'SET_VIEW'; payload: AppState }
  | { type: 'SET_ACTIVE_QUIZ'; payload: Quiz | null }
  | { type: 'SET_EDITING_QUIZ'; payload: Quiz | null }
  | { type: 'SET_QUIZZES'; payload: { items: Quiz[]; hasMore: boolean } }
  | { type: 'APPEND_QUIZZES'; payload: { items: Quiz[]; hasMore: boolean } }
  | { type: 'SET_LOADING'; payload: LoadingState }
  | { type: 'SET_LOADING_MORE'; payload: boolean }
  | { type: 'SET_QUIZ_ERROR'; payload: string | null }
  | { type: 'ADD_QUIZ'; payload: Quiz }
  | { type: 'UPDATE_QUIZ'; payload: { id: string; updates: Partial<Quiz> } }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: AppStateData = {
  user: null,
  view: AppState.LANDING,
  activeQuiz: null,
  editingQuiz: null,
  quizzes: [],
  hasMoreQuizzes: false,
  loading: { isLoading: false },
  loadingMore: false,
  quizError: null
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
    case 'SET_EDITING_QUIZ':
      return { ...state, editingQuiz: action.payload };
    case 'SET_QUIZZES':
      return { ...state, quizzes: action.payload.items, hasMoreQuizzes: action.payload.hasMore };
    case 'APPEND_QUIZZES':
      return {
        ...state,
        quizzes: [...state.quizzes, ...action.payload.items],
        hasMoreQuizzes: action.payload.hasMore,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_LOADING_MORE':
      return { ...state, loadingMore: action.payload };
    case 'SET_QUIZ_ERROR':
      return { ...state, quizError: action.payload };
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
  setEditingQuiz: (quiz: Quiz | null) => void;
  setLoading: (loading: LoadingState) => void;
  fetchQuizzes: (scope: 'global' | 'local') => Promise<void>;
  loadMoreQuizzes: (scope: 'global' | 'local') => Promise<void>;
  logout: () => Promise<void>;
  quizError: string | null;
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
  const setEditingQuiz = (quiz: Quiz | null) => dispatch({ type: 'SET_EDITING_QUIZ', payload: quiz });
  const setLoading = (loading: LoadingState) => dispatch({ type: 'SET_LOADING', payload: loading });

  // Fetch first page of quizzes
  const fetchQuizzes = async (scope: 'global' | 'local') => {
    setLoading({ isLoading: true, message: 'Loading quizzes...' });
    dispatch({ type: 'SET_QUIZ_ERROR', payload: null });
    try {
      const userId = scope === 'local' ? state.user?.id : undefined;
      const quizzes = await getQuizzes(scope, userId, { offset: 0, limit: PAGE_SIZE });
      dispatch({
        type: 'SET_QUIZZES',
        payload: { items: quizzes, hasMore: quizzes.length === PAGE_SIZE },
      });
    } catch (error: any) {
      console.error('Failed to fetch quizzes:', error);
      dispatch({ type: 'SET_QUIZ_ERROR', payload: error?.message || 'Failed to load quizzes' });
      dispatch({ type: 'SET_QUIZZES', payload: { items: [], hasMore: false } });
    } finally {
      setLoading({ isLoading: false });
    }
  };

  // Append the next page
  const loadMoreQuizzes = async (scope: 'global' | 'local') => {
    if (state.loadingMore || !state.hasMoreQuizzes) return;
    dispatch({ type: 'SET_LOADING_MORE', payload: true });
    try {
      const userId = scope === 'local' ? state.user?.id : undefined;
      const next = await getQuizzes(scope, userId, {
        offset: state.quizzes.length,
        limit: PAGE_SIZE,
      });
      dispatch({
        type: 'APPEND_QUIZZES',
        payload: { items: next, hasMore: next.length === PAGE_SIZE },
      });
    } catch (error: any) {
      console.error('Failed to load more quizzes:', error);
    } finally {
      dispatch({ type: 'SET_LOADING_MORE', payload: false });
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
    let cancelled = false;

    const initializeApp = async () => {
      setLoading({ isLoading: true, message: 'Initializing...' });

      // Auth and quiz loading run independently — one failing won't block the other
      const authPromise = getCurrentUser()
        .then(async (user) => {
          if (cancelled || !user) return;
          await ensureUserProfile(user);
          if (!cancelled) setUser(user);
        })
        .catch((e) => console.warn('Auth init skipped:', e?.message));

      const deepLinkPromise = (async () => {
        const params = new URLSearchParams(window.location.search);
        const quizId = params.get('quiz');
        if (!quizId) return;
        try {
          const quiz = await getQuizById(quizId);
          if (!cancelled && quiz) {
            setActiveQuiz(quiz);
            setView(AppState.PLAY);
          }
        } catch (e) {
          console.warn('Deep link load failed:', e);
        }
      })();

      await Promise.allSettled([authPromise, deepLinkPromise]);
      if (!cancelled) setLoading({ isLoading: false });
    };

    initializeApp();

    // Auth listener — also catches PASSWORD_RECOVERY when the user clicks
    // the email link Supabase sends from resetPasswordForEmail.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return;
      const user = session?.user || null;
      setUser(user);
      if (user) {
        try {
          await ensureUserProfile(user);
        } catch (e: any) {
          // The listener must keep working — but log loudly so account
          // creation issues are visible in the console rather than silent.
          console.error('Auth listener: profile ensure failed', e?.message || e);
        }
      }
      if (event === 'PASSWORD_RECOVERY') {
        setView(AppState.RESET_PASSWORD);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // Fetch quizzes when view changes to landing or local. fetchQuizzes is
  // intentionally omitted: it's recreated on every render (closes over
  // `state`), so adding it would re-run this effect every time anything in
  // state changed, including the very fetch we just dispatched.
  useEffect(() => {
    if (state.view === AppState.LANDING) {
      fetchQuizzes('global');
    } else if (state.view === AppState.LOCAL && state.user) {
      fetchQuizzes('local');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.view, state.user?.id]);

  const contextValue: AppContextType = {
    ...state,
    dispatch,
    setUser,
    setView,
    setActiveQuiz,
    setEditingQuiz,
    setLoading,
    fetchQuizzes,
    loadMoreQuizzes,
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