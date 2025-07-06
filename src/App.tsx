import React, { useState } from 'react';
import Header from './components/Header';
import Nav from './components/Nav';
import SignSection from './components/SignSection';
import VerifySection from './components/VerifySection';
import Footer from './components/Footer';

export type Page = 'sign' | 'verify';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('sign');

  return (
    <div className="bg-slate-900 bg-slate-800/50 text-slate-200 min-h-screen font-sans flex flex-col items-center justify-center p-2 sm:p-4 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-900/50">
      <div className="w-full max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl shadow-cyan-500/10 overflow-hidden">
        <Header />
        <Nav page={page} setPage={setPage} />
        <main className="p-4 sm:p-6 md:p-8">
          {page === 'sign' ? <SignSection /> : <VerifySection />}
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;