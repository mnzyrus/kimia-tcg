'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { soundManager } from '@/lib/audio';

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
    apiKey?: string; // Gemini API Key
    language: 'ms' | 'en';
    showTutorial: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
    masterVolume: 1.0,
    bgmVolume: 0.7,
    sfxVolume: 0.7,
    muteOnBlur: true,
    quality: 'high',
    cardTilt: true,
    gameSpeed: 'normal',
    apiKey: 'AIzaSyCxU7FeDjWQzIAlaMb4xpqr6LkNiHwKfQs',
    language: 'ms',
    showTutorial: true,
};

interface SettingsContextType {
    settings: GameSettings;
    updateSetting: <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => void;
    resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('kimia_settings');
        if (saved) {
            try {
                setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
            } catch (e) {
                console.warn("Failed to load settings", e);
            }
        }
    }, []);

    // Sync Audio Settings to Manager
    useEffect(() => {
        if (soundManager) {
            soundManager.setMasterVolume(settings.masterVolume);
            soundManager.setBGMVolume(settings.bgmVolume);
            soundManager.setSFXVolume(settings.sfxVolume);
        }
    }, [settings.masterVolume, settings.bgmVolume, settings.sfxVolume]);

    // Sync Settings to LocalStorage (Debounced to prevent lag on sliders)
    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem('kimia_settings', JSON.stringify(settings));
        }, 500); // Wait 500ms after last change

        return () => clearTimeout(timer);
    }, [settings]);

    const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
        localStorage.setItem('kimia_settings', JSON.stringify(DEFAULT_SETTINGS));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useGameSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useGameSettings must be used within a SettingsProvider');
    }
    return context;
}
