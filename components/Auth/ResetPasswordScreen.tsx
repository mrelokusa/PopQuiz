import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import NeoCard from '../ui/NeoCard';
import NeoButton from '../ui/NeoButton';
import { ArrowRight, KeyRound } from 'lucide-react';

interface ResetPasswordScreenProps {
  onComplete: () => void;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ onComplete }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    // Strip the ?reset=1 marker so a refresh doesn't drop the user back here.
    window.history.replaceState({}, '', window.location.pathname);
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-in fade-in">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-neo-mint border-2 border-black rounded-full mx-auto flex items-center justify-center mb-4 shadow-neo-md">
            <KeyRound className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl font-serif font-black italic mb-2">Set a New Password</h1>
          <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">
            Pick something you'll remember this time
          </p>
        </div>

        <NeoCard className="p-8 shadow-neo-xl bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-black text-xs uppercase mb-1 block">New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-black rounded-xl p-3 font-bold focus:outline-none focus:ring-4 ring-neo-lemon transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="font-black text-xs uppercase mb-1 block">Confirm Password</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full border-2 border-black rounded-xl p-3 font-bold focus:outline-none focus:ring-4 ring-neo-lemon transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-100 border-2 border-black p-2 rounded-lg text-xs font-bold text-red-600">
                {error}
              </div>
            )}

            <NeoButton
              type="submit"
              className="w-full mt-4"
              colorClass="bg-neo-periwinkle text-white"
              icon={ArrowRight}
              label={loading ? 'Saving...' : 'Save New Password'}
              disabled={loading}
            />
          </form>
        </NeoCard>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
