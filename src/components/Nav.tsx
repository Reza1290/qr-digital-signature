import React from 'react';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import type { Page } from '../App';

interface NavProps {
  page: Page;
  setPage: React.Dispatch<React.SetStateAction<Page>>;
}

const Nav: React.FC<NavProps> = ({ page, setPage }) => (
  // Wrapper untuk memberikan padding, menyamakan dengan 'main'
  <div className="px-4 sm:px-6 md:px-8 pt-6"> 
    <nav className="flex bg-slate-900/70 rounded-lg p-1 border border-slate-700">
      <button
        onClick={() => setPage('sign')}
        className={`flex-1 p-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
          page === 'sign' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'
        }`}
      >
        <ShieldCheck size={18} />
        Buat Tanda Tangan
      </button>
      <button
        onClick={() => setPage('verify')}
        className={`flex-1 p-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
          page === 'verify' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'
        }`}
      >
        <ShieldOff size={18} />
        Verifikasi Tanda Tangan
      </button>
    </nav>
  </div>
);

export default Nav;