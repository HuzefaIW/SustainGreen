import React, { useState } from 'react';
import { Leaf, Lock, Mail, RefreshCw, ShieldCheck } from 'lucide-react';
import { AuthSession, login } from '../../config/auth';
import { BotanicalBackground, BotanicalJournalTexture } from '../common/BotanicalElements';

interface LoginPageProps {
  onAuthenticated: (session: AuthSession) => void;
}

const QUICK_ACCOUNTS = [
  ['Super Admin', 'super.admin@svvv.in', 'Super@123'],
  ['Main Block', 'main.block.admin@svvv.in', 'MainBlock@123'],
  ['Mechanical', 'mech.block.admin@svvv.in', 'MechBlock@123'],
  ['MBA', 'mba.block.admin@svvv.in', 'MbaBlock@123'],
  ['Canteen', 'canteen.admin@svvv.in', 'Canteen@123'],
] as const;

export const LoginPage: React.FC<LoginPageProps> = ({ onAuthenticated }) => {
  const [email, setEmail] = useState('super.admin@svvv.in');
  const [password, setPassword] = useState('Super@123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const session = await login(email.trim(), password);
      onAuthenticated(session);
    } catch (err: any) {
      setError(err.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FBF5] text-[#1F2937] relative overflow-hidden flex items-center justify-center px-4 py-8">
      <BotanicalBackground variant="landing" />
      <BotanicalJournalTexture />

      <form onSubmit={submit} className="relative z-10 w-full max-w-md bg-white border border-[#DCEBDD] rounded-3xl p-6 sm:p-7 shadow-elevated space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#166534] text-white flex items-center justify-center">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#14532D]">EcoPulse Access</h1>
            <p className="text-xs text-[#64748B]">Sign in with your SVVV role account.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <label className="text-xs font-semibold text-[#1F2937]">
            Email
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-[#DCEBDD] bg-[#F5FBF5] px-3">
              <Mail className="w-4 h-4 text-[#166534]" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
            </div>
          </label>

          <label className="text-xs font-semibold text-[#1F2937]">
            Password
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-[#DCEBDD] bg-[#F5FBF5] px-3">
              <Lock className="w-4 h-4 text-[#166534]" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
            </div>
          </label>
        </div>

        {error && (
          <div className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-3 text-xs text-[#92400E]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[48px] rounded-xl bg-[#166534] hover:bg-[#14532D] disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          <span>{loading ? 'Signing in...' : 'Sign In'}</span>
        </button>

        <div className="pt-3 border-t border-[#DCEBDD]">
          <p className="text-[11px] font-semibold text-[#64748B] mb-2">Development quick fill</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACCOUNTS.map(([label, accountEmail, accountPassword]) => (
              <button
                key={accountEmail}
                type="button"
                onClick={() => {
                  setEmail(accountEmail);
                  setPassword(accountPassword);
                  setError(null);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-[#DCEBDD] bg-[#F5FBF5] hover:bg-[#E8F5E9] text-[11px] font-semibold text-[#166534]"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

