"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import AdnodeLogo from '@/components/AdnodeLogo';

export default function SignUpPage() {
  const router = useRouter();
  const { address } = useAccount();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'advertiser' | 'host'>('advertiser');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, walletAddress: address || null }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Sign up failed');
        setLoading(false);
        return;
      }

      if (role === 'advertiser') router.push('/dashboard');
      else router.push('/host');
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex mb-6">
            <AdnodeLogo href="/" size="lg" />
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create your account</h1>
          <p className="text-slate-600 dark:text-slate-400">Join the decentralized advertising revolution</p>
        </div>

        <div className="bg-white dark:bg-slate-800/90 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">I want to</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('advertiser')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  role === 'advertiser'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                <span className="font-semibold block">Advertise</span>
                <span className="text-xs text-slate-600 dark:text-slate-400 block mt-1">Run ad campaigns</span>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-2 block">Get 5 free ads</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('host')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  role === 'host'
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300'
                    : 'border-slate-200 dark:border-slate-600 hover:border-cyan-300 dark:hover:border-cyan-700'
                }`}
              >
                <span className="font-semibold block">Developer (Host)</span>
                <span className="text-xs text-slate-600 dark:text-slate-400 block mt-1">Earn from your site</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Connect wallet (optional)</label>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">Connect when you create campaigns or perform on-chain actions.</p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3.5 rounded-xl font-semibold hover:from-indigo-700 hover:to-indigo-800 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link href="/signin" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
