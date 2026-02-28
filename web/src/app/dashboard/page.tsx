"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import AdnodeLogo from '@/components/AdnodeLogo';

interface Campaign {
  _id: string;
  title: string;
  impressions: number;
  clicks: number;
  spent: number;
  status: string;
  isFreeAd: boolean;
}

export default function AdvertiserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalImpressions, setTotalImpressions] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push('/signin');
          return;
        }
        if (data.user.role !== 'advertiser') {
          router.push('/host');
          return;
        }
        setUser(data.user);
        loadCampaigns();
      })
      .catch(() => router.push('/signin'));
  }, []);

  const loadCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      
      if (res.ok) {
        setCampaigns(data.campaigns || []);
        setTotalSpent(data.stats?.totalSpent || 0);
        setTotalImpressions(data.stats?.totalImpressions || 0);
        setTotalClicks(data.stats?.totalClicks || 0);
      }
    } catch (err) {
      console.error("Failed to load campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading || !user) {
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <AdnodeLogo href="/" size="md" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 dark:text-slate-400">{user.email}</span>
            <ConnectButton />
            <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700 font-medium">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Advertiser Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your campaigns and track performance</p>
        </div>

        {user.freeAdsRemaining > 0 && (
          <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 rounded-2xl p-6 text-white mb-8 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">🎉 Welcome bonus</h3>
                <p className="text-indigo-100">You have {user.freeAdsRemaining} free ad credits. Create your first campaign at zero cost.</p>
              </div>
              <Link href="/advertiser" className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
                Create free ad
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium">Active Campaigns</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{campaigns.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Impressions</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalImpressions.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Clicks</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalClicks.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Spent</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">${totalSpent.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-8 border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your campaigns</h2>
            <Link href="/advertiser" className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all">
              + Create campaign
            </Link>
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No campaigns yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Create your first campaign and start reaching your audience on Web3.</p>
              <Link href="/advertiser" className="inline-block bg-gradient-to-r from-indigo-600 to-cyan-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
                Create your first campaign
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign._id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-md transition-shadow bg-slate-50/50 dark:bg-slate-700/30">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{campaign.title}</h3>
                      {campaign.isFreeAd && (
                        <span className="inline-block bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-2 py-1 rounded-lg">Free ad</span>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${campaign.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300'}`}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Impressions</p>
                      <p className="text-xl font-semibold text-slate-900 dark:text-white">{campaign.impressions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Clicks</p>
                      <p className="text-xl font-semibold text-slate-900 dark:text-white">{campaign.clicks.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Spent</p>
                      <p className="text-xl font-semibold text-slate-900 dark:text-white">${campaign.spent.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-950/30 dark:to-cyan-950/30 rounded-2xl p-8 text-center border border-indigo-100 dark:border-indigo-900/50">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Powered by Web3</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Transactions verified on Polygon with instant crypto payouts via SideShift.</p>
          <div className="flex justify-center gap-8 flex-wrap">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Polygon</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">SideShift</span>
          </div>
        </div>
      </div>
    </div>
  );
}
