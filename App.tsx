import React, { Suspense, lazy } from 'react';
import { AppState } from './types';
import { ToastProvider } from './contexts/ToastContext';
import { AppProvider, useApp } from './contexts/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppHeader from './components/Layout/AppHeader';
import AppFooter from './components/Layout/AppFooter';
import StorageNotice from './components/Layout/StorageNotice';
import HeroSection from './components/Landing/HeroSection';
import QuizGallerySection from './components/Landing/QuizGallerySection';
import { QuizCardSkeleton } from './components/ui/Skeleton';

// Lazy load heavy components
const QuizBuilder = lazy(() => import('./components/Quiz/QuizBuilder'));
const QuizPlayer = lazy(() => import('./components/Quiz/QuizPlayer'));
const AuthScreen = lazy(() => import('./components/Auth/AuthScreen'));
const ResetPasswordScreen = lazy(() => import('./components/Auth/ResetPasswordScreen'));
const SocialHub = lazy(() => import('./components/Social/SocialHub'));
const TermsPage = lazy(() => import('./components/Legal/TermsPage'));
const PrivacyPage = lazy(() => import('./components/Legal/PrivacyPage'));

// Inner app component that uses the context
const AppContent: React.FC = () => {
  const { view, activeQuiz, editingQuiz, user, setEditingQuiz, setView } = useApp();

  const exitBuilder = () => {
    const wasEditing = !!editingQuiz;
    setEditingQuiz(null);
    setView(wasEditing ? AppState.LOCAL : AppState.LANDING);
  };

  const renderContent = () => {
    switch(view) {
      case AppState.AUTH:
        return (
          <Suspense fallback={<QuizCardSkeleton />}>
            <AuthScreen
              onAuthSuccess={() => setView(AppState.LANDING)}
              onCancel={() => setView(AppState.LANDING)}
            />
          </Suspense>
        );

      case AppState.CREATE:
        return (
          <Suspense fallback={<QuizCardSkeleton />}>
            <QuizBuilder onComplete={exitBuilder} existingQuiz={editingQuiz} />
          </Suspense>
        );
      
      case AppState.PLAY:
        return activeQuiz ? (
          <Suspense fallback={<QuizCardSkeleton />}>
            <QuizPlayer 
              quiz={activeQuiz} 
              onExit={() => {
                window.history.replaceState({}, '', window.location.pathname);
                setView(AppState.LANDING);
              }} 
            />
          </Suspense>
        ) : null;
      
      case AppState.LOCAL:
        return (
          <Suspense fallback={<QuizCardSkeleton />}>
            <SocialHub userId={user!.id} />
          </Suspense>
        );

      case AppState.RESET_PASSWORD:
        return (
          <Suspense fallback={<QuizCardSkeleton />}>
            <ResetPasswordScreen onComplete={() => setView(AppState.LANDING)} />
          </Suspense>
        );

      case AppState.TERMS:
        return (
          <Suspense fallback={<QuizCardSkeleton />}>
            <TermsPage />
          </Suspense>
        );

      case AppState.PRIVACY:
        return (
          <Suspense fallback={<QuizCardSkeleton />}>
            <PrivacyPage />
          </Suspense>
        );

      case AppState.LANDING:
      default:
        return (
          <main className="space-y-8 animate-in fade-in pb-20">
            <HeroSection />
            <QuizGallerySection />
          </main>
        );
    }
  };

  return (
    <div className="min-h-screen bg-neo-paper text-black font-sans selection:bg-neo-lemon selection:text-black">
      <AppHeader />
      
      <div className="max-w-3xl mx-auto p-6 min-h-screen">
        {renderContent()}
      </div>
      
      {view !== AppState.AUTH && <AppFooter />}
      <StorageNotice />
    </div>
  );
};

// Main App wrapper with providers
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;