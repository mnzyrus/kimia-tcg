'use client';

import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const error_description = searchParams.get('error_description');

    const [status, setStatus] = useState<'verifying' | 'error' | 'success'>('verifying');
    const [message, setMessage] = useState('Sedang mengesahkan emel anda...');

    useEffect(() => {
        // Handle Hash Fragment (Supabase implicit flow error handling)
        const hash = window.location.hash;
        const hashParams = new URLSearchParams(hash.substring(1));
        const hashError = hashParams.get('error');
        const hashErrorDesc = hashParams.get('error_description');

        if (error || hashError) {
            setStatus('error');
            const finalDesc = (error_description || hashErrorDesc || '').replace(/\+/g, ' ');
            setMessage(finalDesc || 'Ralat berlaku semasa pengesahan.');
            return;
        }

        if (code) {
            supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
                if (!error) {
                    setStatus('success');
                    setMessage('Emel disahkan! Mengalih ke permainan...');
                    setTimeout(() => router.push('/game'), 1500);
                } else {
                    setStatus('error');
                    setMessage(error.message);
                }
            });
        } else {
            // Implicit flow or existing session? Check session
            supabase.auth.getSession().then(({ data }) => {
                if (data.session) {
                    router.push('/game');
                } else {
                    setStatus('error');
                    setMessage('Tiada kod pengesahan dijumpai.');
                }
            });
        }
    }, [code, error, router, error_description]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4">
            <div className="w-full max-w-md p-8 bg-slate-900 rounded-2xl border border-white/10 text-center space-y-6">

                {status === 'verifying' && (
                    <>
                        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
                        <h2 className="text-2xl font-bold text-white">Mengesahkan...</h2>
                        <p className="text-slate-400">{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white">Berjaya!</h2>
                        <p className="text-slate-400">{message}</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Pengesahan Gagal</h2>
                        <p className="text-red-400">{message}</p>
                        <Link href="/auth" className="inline-block px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors mt-4">
                            Kembali ke Log Masuk
                        </Link>
                    </>
                )}

            </div>
        </div>
    );
}

export default function AuthCallback() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}>
            <CallbackContent />
        </Suspense>
    );
}
