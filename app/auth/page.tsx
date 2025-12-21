import AuthForm from '@/components/AuthForm'

export default function AuthPage() {
    return (
        <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-cyan-600/30 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 w-full flex items-center justify-center p-4">
                <AuthForm />
            </div>
        </main>
    )
}
