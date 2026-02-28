import AdnodeLogo from './AdnodeLogo';

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <AdnodeLogo href="/" size="lg" showText={true} />
            <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-md">
              Decentralized Ad-to-Earn Economy for Web3. Built on Polygon with instant SideShift crypto rewards.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Platform</h3>
            <ul className="mt-4 space-y-3">
              <li><a href="/advertiser" className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">For Advertisers</a></li>
              <li><a href="/host" className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">For Hosts</a></li>
              <li><a href="/dashboard" className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">Dashboard</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Built With</h3>
            <ul className="mt-4 space-y-3">
              <li><a href="https://polygon.technology" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">Polygon</a></li>
              <li><a href="https://sideshift.ai" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">SideShift</a></li>
              <li><a href="https://thegraph.com" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors">The Graph</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-8">
          <p className="text-center text-slate-500 dark:text-slate-400 text-sm">
            © {new Date().getFullYear()} Adnode. Built on Polygon.
          </p>
        </div>
      </div>
    </footer>
  );
}