import React, { Suspense, lazy } from 'react';
import { AppState } from './types';
import { ToastProvider } from './contexts/ToastContext';
import { AppProvider, useApp } from './contexts/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppHeader from './components/Layout/AppHeader';
import AppFooter from './components/Layout/AppFooter';
import HeroSection from './components/Landing/HeroSection';
import QuizGallerySection from './components/Landing/QuizGallerySection';
import { QuizCardSkeleton } from './components/ui/Skeleton';

// Lazy load heavy components
const QuizBuilder = lazy(() => import('./components/Quiz/QuizBuilder'));
const QuizPlayer = lazy(() => import('./components/Quiz/QuizPlayer'));
const AuthScreen = lazy(() => import('./components/Auth/AuthScreen'));
const SocialHub = lazy(() => import('./components/Social/SocialHub'));

// Inner app component that uses the context
const AppContent: React.FC = () => {
  const { view, activeQuiz, user, setActiveQuiz, setView } = useApp();

  const renderContent = () => {
    switch(view) {
      case AppState.AUTH:
        return (
          <Suspense fallback={<QuizCardSkeleton />}>
            <AuthScreen 
              onAuthSuccess={() => {
                window.location.reload(); 
              }} 
              onCancel={() => setView(AppState.LANDING)}
            />
          </Suspense>
        );
      
      case AppState.CREATE:
        return (
          <Suspense fallback={<QuizCardSkeleton />}>
            <QuizBuilder onComplete={() => setView(AppState.LOCAL)} />
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
            <SocialHub userId={user?.id} />
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