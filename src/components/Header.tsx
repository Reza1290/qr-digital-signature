import React from 'react';
import { QrCode } from 'lucide-react';

const Header: React.FC = () => (
  <header className="p-6 text-center border-b border-slate-700 bg-black/20">
    <div className="flex items-center justify-center gap-3 text-cyan-400">
        <div className="p-2 bg-cyan-500/10 rounded-full">
            <QrCode size={32} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Tanda Tangan Digital QR
        </h1>
    </div>
    <p className="text-slate-400 mt-2 text-sm sm:text-base">Buat dan verifikasi tanda tangan untuk teks dan dokumen PDF.</p>
  </header>
);

export default Header;
