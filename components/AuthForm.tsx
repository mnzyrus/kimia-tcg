'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AuthForm() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const getURL = () => {
        let url =
            process.env.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
            process.env.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
            'http://localhost:3000'
        // Make sure to include `https://` when not localhost.
        url = url.includes('http') ? url : `https://${url}`
        // Make sure to including trailing `/`.
        url = url.charAt(url.length - 1) === '/' ? url : `${url}/`
        return url
    }

    const router = useRouter()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${getURL()}auth/callback`,
                        data: {
                            full_name: email.split('@')[0],
                        },
                    },
                })
                if (error) throw error
                alert('Sila semak emel anda untuk pautan log masuk!')
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                router.refresh()
                router.push('/')
            }
        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">
                    {isSignUp ? 'Cipta Akaun' : 'Selamat Kembali'}
                </h2>
                <p className="text-slate-300">
                    {isSignUp ? 'Sertai ahli kimia' : 'Masuk ke makmal'}
                </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Emel</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none text-white placeholder-slate-500 transition-all"
                        placeholder="alchemist@kimia.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Kata Laluan</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none text-white placeholder-slate-500 transition-all"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg shadow-lg transform transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Memproses...' : (isSignUp ? 'Daftar' : 'Log Masuk')}
                </button>
            </form>

            <div className="text-center">
                <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                    {isSignUp ? 'Sudah mempunyai akaun? Log Masuk' : "Tiada akaun? Daftar Sekarang"}
                </button>
            </div>
        </div>
    )
}
