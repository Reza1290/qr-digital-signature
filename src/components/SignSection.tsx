import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Key, FileText, Type, UploadCloud } from 'lucide-react';

type SignMode = 'text' | 'file';

const SignSection: React.FC = () => {
  const [mode, setMode] = useState<SignMode>('text');
  const [textData, setTextData] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>('');
  
  const [privateKey, setPrivateKey] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    generatePrivateKey();
  }, []);

  const generatePrivateKey = () => {
    const randomKey = 'privkey_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
    setPrivateKey(randomKey);
  };
  
  const handleFileSelect = async (selectedFile: File | null) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setIsLoading(true);
    setError('');
    setFileHash('');

    try {
      const buffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      setFileHash(hash);
    } catch (err) {
      setError("Gagal menghitung hash file.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    let dataToSign: string;
    let payload: object;

    if (mode === 'text') {
      if (!textData.trim()) {
        setError('Data teks tidak boleh kosong.');
        return;
      }
      dataToSign = textData;
      payload = { type: 'text', data: textData };
    } else { 
      if (!file || !fileHash) {
        setError('Silakan pilih file dan tunggu hash selesai dibuat.');
        return;
      }
      dataToSign = fileHash;
      payload = { type: 'file', name: file.name, hash: fileHash };
    }

    if (!privateKey.trim()) {
      setError('Private Key tidak boleh kosong.');
      return;
    }

    setError('');
    setIsLoading(true);
    setQrCodeUrl('');

    try {
      const dataToHashForSig = dataToSign + privateKey;
      const sigHashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(dataToHashForSig));
      const signature = Array.from(new Uint8Array(sigHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      const qrData = JSON.stringify({ ...payload, signature });
      
      const url = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 1,
        color: { dark: '#e2e8f0', light: '#1e293b' }
      });
      setQrCodeUrl(url);
    } catch (err) {
      setError('Gagal membuat QR code. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex bg-slate-900/70 rounded-lg p-1 border border-slate-700">
        <button onClick={() => setMode('text')} className={`flex-1 p-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${mode === 'text' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Type size={16}/>Teks</button>
        <button onClick={() => setMode('file')} className={`flex-1 p-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${mode === 'file' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><FileText size={16}/>File</button>
      </div>

      {mode === 'text' ? (
        <textarea id="data" rows={4} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500" placeholder="Masukkan teks, JSON, atau data apapun..." value={textData} onChange={(e) => setTextData(e.target.value)}></textarea>
      ) : (
        <div className="text-center p-4 border-2 border-dashed border-slate-600 rounded-lg">
          <input type="file" accept=".pdf" ref={fileInputRef} onChange={(e) => handleFileSelect(e.target.files?.[0] || null)} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 mx-auto">
            <UploadCloud size={20} /> {file ? 'Ganti File' : 'Pilih PDF'}
          </button>
          {file && <p className="text-sm text-slate-300 mt-3">{file.name}</p>}
          {fileHash && <div className="mt-2 text-xs text-green-400 font-mono break-all bg-green-900/50 p-2 rounded">Hash: {fileHash.substring(0,40)}...</div>}
        </div>
      )}

      <div>
        <label htmlFor="privateKey" className="block text-sm font-medium text-slate-300 mb-2">Private Key (Rahasia)</label>
        <div className="flex gap-2">
          <input id="privateKey" type="text" className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-cyan-500" value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} />
          <button onClick={generatePrivateKey} title="Buat kunci baru" className="bg-slate-600 hover:bg-slate-500 text-slate-200 font-semibold px-4 rounded-lg flex items-center gap-2"><Key size={18} /> Baru</button>
        </div>
      </div>

      <div className="text-center pt-2">
        <button onClick={handleGenerate} disabled={isLoading} className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800/50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-600/20">
          {isLoading ? 'Memproses...' : 'Buat QR Code Bertanda Tangan'}
        </button>
      </div>

      {error && <div className="text-red-400 text-center bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}
      
      {qrCodeUrl && (
        <div className="bg-slate-900/50 p-6 rounded-lg text-center flex flex-col items-center gap-4 border border-slate-700 animate-fade-in">
          <h3 className="text-xl font-semibold text-cyan-300">QR Code Anda Siap</h3>
          <div className="p-2 bg-slate-200 rounded-lg inline-block shadow-md"><img src={qrCodeUrl} alt="Generated QR Code" className="w-56 h-56 sm:w-64 sm:h-64 rounded-md" /></div>
          <a href={qrCodeUrl} download="signed-qrcode.png" className="mt-2 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">Unduh QR Code</a>
        </div>
      )}
    </div>
  );
};

export default SignSection;
