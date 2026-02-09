import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { createProfile } from '../../services/authService';
import NeoCard from '../ui/NeoCard';
import NeoButton from '../ui/NeoButton';
import { Sparkles, ArrowRight, User, X } from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: () => void;
  onCancel?: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess, onCancel }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isSignUp) {
        // Sign Up Flow
        // We store username in metadata so we can retrieve it later if email confirmation is required
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username || 'New User'
            }
          }
        });

        if (authError) throw authError;

        // CRITICAL FIX: Only attempt to create profile if we have an active session.
        // If email confirmation is enabled, session will be null here.
        if (data.session && data.user) {
          const randomAvatar = ['👽', '👾', '🤖', '👻', '🦄', '🐯'][Math.floor(Math.random() * 6)];
          await createProfile(data.user.id, username || 'New User', randomAvatar);
          onAuthSuccess();
        } else if (data.user && !data.session) {
           setMessage("Account created! Please check your email to confirm before logging in.");
           setIsSignUp(false); // Switch to login view
        }
      } else {
        // Sign In Flow
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;
        // Profile check happens in App.tsx now to be safe
        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-in fade-in">
      <div className="max-w-md w-full space-y-8 relative">
        
        {onCancel && (
            <button 
                onClick={onCancel}
                className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-gray-400 hover:text-black font-bold uppercase text-xs flex items-center gap-1 transition-colors"
            >
                <X className="w-4 h-4" /> Back to Feed
            </button>
        )}

        <div className="text-center">
            <div className="w-20 h-20 bg-neo-periwinkle border-2 border-black rounded-full mx-auto flex items-center justify-center mb-4 shadow-neo-md animate-bounce">
                <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-serif font-black italic mb-2">
                {isSignUp ? 'Join the Club' : 'Welcome Back'}
            </h1>
            <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">
                {isSignUp ? 'Create your identity' : 'Login to your world'}
            </p>
        </div>

        <NeoCard className="p-8 shadow-neo-xl bg-white relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-neo-lemon rounded-full border-2 border-black z-0"></div>

            <form onSubmit={handleAuth} className="relative z-10 space-y-4">
                {isSignUp && (
                    <div>
                        <label className="font-black text-xs uppercase mb-1 block">Username</label>
                        <input 
                            type="text" 
                            required 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full border-2 border-black rounded-xl p-3 font-bold focus:outline-none focus:ring-4 ring-neo-lemon transition-all"
                            placeholder="e.g. QuizMaster99"
                        />
                    </div>
                )}
                
                <div>
                    <label className="font-black text-xs uppercase mb-1 block">Email</label>
                    <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border-2 border-black rounded-xl p-3 font-bold focus:outline-none focus:ring-4 ring-neo-lemon transition-all"
                        placeholder="you@example.com"
                    />
                </div>

                <div>
                    <label className="font-black text-xs uppercase mb-1 block">Password</label>
                    <input 
                        type="password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border-2 border-black rounded-xl p-3 font-bold focus:outline-none focus:ring-4 ring-neo-lemon transition-all"
                        placeholder="••••••••"
                    />
                </div>

                {error && (
                    <div className="bg-red-100 border-2 border-black p-2 rounded-lg text-xs font-bold text-red-600">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="bg-neo-mint border-2 border-black p-2 rounded-lg text-xs font-bold text-black">
                        {message}
                    </div>
                )}

                <NeoButton 
                    type="submit"
                    className="w-full mt-4" 
                    colorClass={isSignUp ? "bg-neo-mint" : "bg-neo-periwinkle text-white"}
                    icon={isSignUp ? Sparkles : ArrowRight}
                    label={loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Enter')}
                    disabled={loading}
                />
            </form>
        </NeoCard>

        <div className="text-center">
            <button 
                type="button"
                onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setMessage('');
                }}
                className="font-bold underline decoration-2 decoration-neo-coral hover:text-neo-periwinkle transition-colors"
            >
                {isSignUp ? "Already have an account? Log In" : "Need an account? Sign Up"}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;