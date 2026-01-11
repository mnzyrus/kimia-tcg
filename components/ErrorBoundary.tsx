'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 z-[99999] bg-red-900/90 text-white p-8 overflow-auto flex flex-col items-center justify-center font-mono">
                    <h1 className="text-3xl font-bold mb-4">Game Crashed!</h1>
                    <div className="bg-black/50 p-4 rounded-xl border border-red-500 max-w-2xl w-full">
                        <p className="text-red-300 font-bold mb-2">Error Message:</p>
                        <p className="mb-4 text-lg">{this.state.error?.message}</p>
                        <p className="text-red-300 font-bold mb-2">Stack Trace (Partial):</p>
                        <pre className="text-xs opacity-70 whitespace-pre-wrap">{this.state.error?.stack?.slice(0, 1000)}</pre>
                    </div>
                    <button
                        onClick={() => { localStorage.clear(); window.location.reload(); }}
                        className="mt-8 bg-white text-red-900 px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform"
                    >
                        Reset App (Clear Data)
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
