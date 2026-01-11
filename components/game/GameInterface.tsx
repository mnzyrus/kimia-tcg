"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from '../ErrorBoundary';
import { Loader2 } from 'lucide-react';

// Dynamic imports to split bundles
const GameDesktop = dynamic(() => import('./GameDesktop'), {
    loading: () => <div className="h-screen w-screen bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>
});
const GameMobile = dynamic(() => import('./GameMobile'), {
    loading: () => <div className="h-screen w-screen bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>
});

export default function GameInterface() {
    const [isMobile, setIsMobile] = useState<boolean | null>(null);

    useEffect(() => {
        // Simple User Agent Check + Screen Width Check
        const checkMobile = () => {
            const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
            const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
            const isMobileDevice = mobileRegex.test(userAgent) || window.innerWidth < 1024;

            setIsMobile(isMobileDevice);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (isMobile === null) return <div className="h-screen w-screen bg-black" />;

    return (
        <ErrorBoundary>
            {isMobile ? <GameMobile /> : <GameDesktop />}
        </ErrorBoundary>
    );
}
