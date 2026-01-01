import Link from "next/link";
import { ArrowRight, Atom } from "lucide-react";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-950 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-black pointer-events-none" />

            <div className="z-10 text-center space-y-8 max-w-2xl">
                <div className="flex justify-center mb-4">
                    <div className="p-4 bg-blue-600/20 rounded-full ring-1 ring-blue-500/50 shadow-[0_0_50px_rgba(37,99,235,0.3)]">
                        <Atom className="w-16 h-16 text-blue-400 animate-spin-slow" style={{ animationDuration: '10s' }} />
                    </div>
                </div>

                <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500 tracking-tight">
                    KIMIA TCG
                </h1>

                <p className="text-xl text-slate-400 leading-relaxed">
                    Mainkan permainan kad perdagangan kimia yang epik!
                    Sintesis sebatian, urus tenaga dan jisim, dan lawan rakan anda dalam masa nyata.
                </p>

                <div className="flex gap-4 justify-center pt-4">
                    <Link href="/game"
                        className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] flex items-center"
                    >
                        Mula Permainan
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            <div className="absolute bottom-8 text-slate-600 text-sm">
                Versi 2.0 (Supabase Realtime)
            </div>
        </main>
    );
}
