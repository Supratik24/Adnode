"use client";
import { useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import AdnodeLogo from '@/components/AdnodeLogo';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-600 dark:text-slate-400">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20">
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <AdnodeLogo href="/" size="md" />
          <div className="flex gap-3">
            {user ? (
              <Link
                href={user.role === 'advertiser' ? '/dashboard' : '/host'}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/signin" className="px-5 py-2.5 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
            <span className="adnode-gradient-text">Decentralized</span>
            <br />
            Ad-to-Earn
          </h1>
          <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-4">
            Get paid crypto for viewing ads. Earn passive income hosting ads.
          </p>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-10">
            Powered by Polygon · Instant Swaps via SideShift · AI-Verified Ads
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
              >
                Start Earning Now
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 transition-all"
              >
                Learn More
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="group bg-white dark:bg-slate-800/80 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">For Advertisers</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Launch transparent Web3 ad campaigns. Track every impression on-chain. Get 5 free ads when you sign up.</p>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">✓ 5 Free Ads</span>
          </div>

          <div className="group bg-white dark:bg-slate-800/80 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-cyan-200 dark:hover:border-cyan-800 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">For Hosts</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Monetize your website or dApp. Mint NFT ad slots. Earn passive income automatically paid to your wallet.</p>
            <span className="text-cyan-600 dark:text-cyan-400 font-semibold">✓ Instant Payouts</span>
          </div>

          <div className="group bg-white dark:bg-slate-800/80 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">For Viewers</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Earn crypto rewards for viewing ads. Auto-swap to any token via SideShift. Your attention has value.</p>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Watch to Earn</span>
          </div>
        </div>

        <div id="how-it-works" className="bg-white dark:bg-slate-800/80 rounded-3xl p-12 shadow-xl border border-slate-200 dark:border-slate-700 mb-24">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 adnode-gradient-text">
            How Adnode Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center mx-auto mb-4 text-lg font-bold text-indigo-600 dark:text-indigo-400">1</div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Sign Up & Connect</h3>
              <p className="text-slate-600 dark:text-slate-400">Create an account and connect your Polygon wallet. Choose your role: Advertiser or Host.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/50 rounded-xl flex items-center justify-center mx-auto mb-4 text-lg font-bold text-cyan-600 dark:text-cyan-400">2</div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Launch or Host Ads</h3>
              <p className="text-slate-600 dark:text-slate-400">Advertisers create campaigns. Hosts mint NFT ad slots and embed them on their sites.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center mx-auto mb-4 text-lg font-bold text-emerald-600 dark:text-emerald-400">3</div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Earn & Track</h3>
              <p className="text-slate-600 dark:text-slate-400">View real-time analytics. Get paid in crypto automatically via smart contracts.</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-3xl p-12 text-white text-center mb-24 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Built on Trusted Web3 Infrastructure</h2>
          <p className="text-lg text-indigo-100 mb-8">Deployed on Polygon · Powered by SideShift · Analytics by The Graph</p>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 w-36 h-28 flex flex-col items-center justify-center border border-white/20">
              <img src="/images/polygon-logo.png" alt="Polygon" className="h-12 w-12 object-contain mb-2" />
              <p className="text-sm font-semibold">Polygon</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 w-36 h-28 flex flex-col items-center justify-center border border-white/20">
              <img src="/images/sideshift-logo.png" alt="SideShift" className="h-12 w-12 object-contain mb-2" />
              <p className="text-sm font-semibold">SideShift</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 w-36 h-28 flex flex-col items-center justify-center border border-white/20">
              <img src="/images/thegraph-logo.svg" alt="The Graph" className="h-12 w-12 object-contain mb-2" />
              <p className="text-sm font-semibold">The Graph</p>
            </div>
          </div>
        </div>

        {!user && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Ready to Get Started?</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">Join the decentralized advertising revolution today.</p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-10 py-4 text-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
            >
              Create Free Account
            </Link>
          </div>
        )}
      </section>

      <footer className="bg-slate-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400">© {new Date().getFullYear()} Adnode. Decentralized advertising powered by Polygon.</p>
        </div>
      </footer>
    </div>
  );
}
