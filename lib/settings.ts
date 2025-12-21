import { useState, useEffect } from 'react';

export interface GameSettings {
    // Audio
    masterVolume: number;
    bgmVolume: number;
    sfxVolume: number;
    muteOnBlur: boolean;

    // Visuals
    // "High" = full effects, "Low" = reduced particles/no tilt
    quality: 'low' | 'high';
    cardTilt: boolean;

    // Gameplay
    gameSpeed: 'normal' | 'fast';
    language: 'ms' | 'en';
    showTutorial: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = {
    masterVolume: 1.0,
    bgmVolume: 0.7,
    sfxVolume: 0.7,
    muteOnBlur: true,
    quality: 'high',
    cardTilt: true,
    gameSpeed: 'normal',
    language: 'ms',
    showTutorial: true,
};

// Simple hook-based store
export function useGameSettings() {
    const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('kimia_settings');
            if (saved) {
                try {
                    setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
                } catch (e) {
                    console.warn("Failed to load settings", e);
                }
            }
        }
    }, []);

    const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
        setSettings(prev => {
            const next = { ...prev, [key]: value };
            if (typeof window !== 'undefined') {
                localStorage.setItem('kimia_settings', JSON.stringify(next));
            }
            return next;
        });
    };

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
        if (typeof window !== 'undefined') {
            localStorage.setItem('kimia_settings', JSON.stringify(DEFAULT_SETTINGS));
        }
    };

    return { settings, updateSetting, resetSettings };
}
