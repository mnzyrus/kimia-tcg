import GameInterface from '@/components/game/GameInterface';
import { SettingsProvider } from '@/lib/SettingsContext';

export const metadata = {
    title: 'Kimia TCG - Play',
    description: 'Tactical Chemistry Game',
};

export default function GamePage() {
    return (
        <SettingsProvider>
            <GameInterface />
        </SettingsProvider>
    );
}
