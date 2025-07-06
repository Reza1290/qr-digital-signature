import React, { useState, useRef } from 'react';
import jsQR from 'jsqr';
import { Upload, FileCheck, CheckCircle, XCircle } from 'lucide-react';

interface ScannedPayload {
    type: 'text' | 'file';
    data?: string;
    name?: string;
    hash?: string;
    signature: string;
}

const VerifySection: React.FC = () => {
    const [scannedPayload, setScannedPayload] = useState<ScannedPayload | null>(null);
    const [verificationFile, setVerificationFile] = useState<File | null>(null);
    const [isVerified, setIsVerified] = useState<boolean | null>(null);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const qrInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const resetState = () => {
        setScannedPayload(null);
        setVerificationFile(null);
        setIsVerified(null);
        setError('');
        setIsLoading(false);
        if (qrInputRef.current) qrInputRef.current.value = '';
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleQrUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        resetState();
        setIsLoading(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                if (code) {
                    try {
                        const parsed = JSON.parse(code.data) as ScannedPayload;
                        if (!parsed.type || !parsed.signature) throw new Error("Format QR tidak valid.");
                        setScannedPayload(parsed);
                    } catch {
                        setError("Gagal mem-parsing data QR code. Pastikan QR code valid.");
                    }
                } else {
                    setError("Tidak dapat membaca QR code dari gambar.");
                }
                setIsLoading(false);
            };
            if (e.target?.result) img.src = e.target.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleVerification = async (publicKey: string) => {
        if (!scannedPayload) {
            setError("Data QR belum diunggah.");
            return;
        }
        if (!publicKey.trim()) {
            setError("Private key (kunci publik) tidak boleh kosong.");
            return;
        }

        setIsLoading(true);
        setError('');
        setIsVerified(null);

        try {
            let dataToVerify: string;
            if (scannedPayload.type === 'text') {
                dataToVerify = scannedPayload.data!;
            } else {
                if (!verificationFile) {
                    setError("Silakan unggah file PDF asli untuk verifikasi.");
                    setIsLoading(false);
                    return;
                }
                if (verificationFile.name !== scannedPayload.name) {
                    setError(`Nama file tidak cocok. Diharapkan: ${scannedPayload.name}`);
                    setIsLoading(false);
                    return;
                }
                const buffer = await verificationFile.arrayBuffer();
                const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
                const currentHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

                if (currentHash !== scannedPayload.hash) {
                    setError("Verifikasi Gagal: Konten file telah diubah (hash tidak cocok).");
                    setIsVerified(false);
                    setIsLoading(false);
                    return;
                }
                dataToVerify = scannedPayload.hash!;
            }

            const dataToHashForSig = dataToVerify + publicKey;
            const sigHashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(dataToHashForSig));
            const calculatedSignature = Array.from(new Uint8Array(sigHashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

            if (calculatedSignature === scannedPayload.signature) {
                setIsVerified(true);
            } else {
                setError("Verifikasi Gagal: Tanda tangan tidak valid (kunci mungkin salah).");
                setIsVerified(false);
            }
        } catch (err) {
            setError("Terjadi kesalahan saat verifikasi.");
            setIsVerified(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <canvas ref={canvasRef} className="hidden"></canvas>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <h3 className="font-semibold text-lg text-slate-300 mb-3">Langkah 1: Unggah QR Code</h3>
                <input type="file" accept="image/*" ref={qrInputRef} onChange={handleQrUpload} className="hidden" />
                <button onClick={() => qrInputRef.current?.click()} disabled={isLoading} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <Upload size={20} /> {scannedPayload ? 'Ganti QR Code' : 'Pilih Gambar QR Code'}
                </button>
            </div>

            {isLoading && <p className="text-center text-sky-400">Memproses...</p>}

            {scannedPayload && (
                <div className="space-y-6 animate-fade-in">
                    {scannedPayload.type === 'file' && (
                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                            <h3 className="font-semibold text-lg text-slate-300 mb-3">Langkah 2: Unggah File Asli</h3>
                            <p className="text-xs text-slate-400 mb-2">Unggah file `{scannedPayload.name}` untuk memverifikasi kontennya.</p>
                            <input type="file" accept=".pdf" ref={fileInputRef} onChange={(e) => setVerificationFile(e.target.files?.[0] || null)} className="hidden" />
                            <button onClick={() => fileInputRef.current?.click()} className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                                <FileCheck size={20} /> {verificationFile ? verificationFile.name : 'Pilih File PDF'}
                            </button>
                        </div>
                    )}

                    <VerificationForm payload={scannedPayload} onVerify={handleVerification} />
                </div>
            )}

            {error && <div className="text-red-400 text-center bg-red-900/50 p-3 rounded-lg text-sm">{error}</div>}

            {isVerified === true && (
                <div className="flex items-center gap-4 p-4 mt-4 bg-green-900/50 border border-green-500 rounded-lg animate-fade-in">
                    <CheckCircle className="text-green-400 w-12 h-12 flex-shrink-0" />
                    <div>
                        <h4 className="text-xl font-bold text-green-300">Verifikasi Berhasil</h4>
                        <p className="text-green-400">Tanda tangan valid dan konten tidak diubah.</p>
                    </div>
                </div>
            )}
            {isVerified === false && !error && (
                <div className="flex items-center gap-4 p-4 mt-4 bg-red-900/50 border border-red-500 rounded-lg animate-fade-in">
                    <XCircle className="text-red-400 w-12 h-12 flex-shrink-0" />
                    <div>
                        <h4 className="text-xl font-bold text-red-300">Verifikasi Gagal</h4>
                        <p className="text-red-400">Tanda tangan atau konten file tidak valid.</p>
                    </div>
                </div>
            )}

            {(isVerified !== null || error) && <button onClick={resetState} className="w-full mt-4 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg">Verifikasi Lagi</button>}
        </div>
    );
};

interface VerificationFormProps {
    payload: ScannedPayload;
    onVerify: (publicKey: string) => void;
}

const VerificationForm: React.FC<VerificationFormProps> = ({ payload, onVerify }) => {
    const [publicKey, setPublicKey] = useState('');

    return (
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <h3 className="font-semibold text-lg text-slate-300 mb-3">Langkah 3: Verifikasi Tanda Tangan</h3>
            <div className="text-xs space-y-2 mb-4 p-3 bg-slate-800 rounded-md">
                <p><span className="font-semibold text-slate-400">Tipe:</span> {payload.type}</p>
                {payload.data && <p><span className="font-semibold text-slate-400">Data:</span> {payload.data}</p>}
                {payload.name && <p><span className="font-semibold text-slate-400">Nama File:</span> {payload.name}</p>}
                {payload.hash && <p className="font-mono break-all"><span className="font-semibold text-slate-400">Hash:</span> {payload.hash}</p>}
            </div>
            <div className="space-y-2">
                <label htmlFor="publicKey" className="block text-sm font-medium text-slate-300">Masukkan Private Key (untuk verifikasi)</label>
                <input
                    id="publicKey" type="text"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-purple-500"
                    placeholder="Kunci private asli yang digunakan"
                    value={publicKey}
                    onChange={(e) => setPublicKey(e.target.value)}
                />
                <button onClick={() => onVerify(publicKey)} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                    Verifikasi Sekarang
                </button>
            </div>
        </div>
    );
};

export default VerifySection;