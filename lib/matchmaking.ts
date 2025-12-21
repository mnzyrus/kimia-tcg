import { supabase } from './supabaseClient';

export interface MatchSession {
    id: string;
    room_code: string;
    player1_id: string;
    player2_id: string | null;
    status: 'waiting' | 'playing' | 'finished';
}

export const MatchmakingService = {
    // 1. Create a custom room
    async createRoom(playerId: string, roomCode: string): Promise<{ data: MatchSession | null, error: any }> {
        // Check if code exists
        const { data: existing } = await supabase.from('matches').select('*').eq('room_code', roomCode).single();
        if (existing) {
            if (existing.status === 'finished') {
                // Reuse or delete? Better to just fail or cleanup.
                // For now, fail.
                return { data: null, error: "Kod bilik ini telah digunakan." };
            }
            if (existing.status === 'waiting' && existing.player1_id === playerId) {
                return { data: existing, error: null }; // Re-join own room
            }
            return { data: null, error: "Kod bilik sudah wujud." };
        }

        const { data, error } = await supabase
            .from('matches')
            .insert([{
                player1_id: playerId,
                room_code: roomCode,
                status: 'waiting'
            }])
            .select()
            .single();

        return { data, error };
    },

    // 2. Join a custom room
    async joinRoom(playerId: string, roomCode: string): Promise<{ data: MatchSession | null, error: any }> {
        const { data: match, error: fetchError } = await supabase
            .from('matches')
            .select('*')
            .eq('room_code', roomCode)
            .single();

        if (fetchError || !match) return { data: null, error: "Bilik tidak dijumpai." };
        if (match.status !== 'waiting') return { data: null, error: "Bilik penuh atau permainan sedang berjalan." };
        if (match.player1_id === playerId) return { data: match, error: null }; // Re-join

        // Update match to include P2
        const { data, error } = await supabase
            .from('matches')
            .update({ player2_id: playerId, status: 'playing' })
            .eq('id', match.id)
            .select()
            .single();

        return { data, error };
    },

    // 3. Find Random Match
    async findRandomMatch(playerId: string): Promise<{ data: MatchSession | null, role: 'player1' | 'player2', error: any }> {
        // Try to find an open room
        const { data: openMatches, error: searchError } = await supabase
            .from('matches')
            .select('*')
            .eq('status', 'waiting')
            .neq('player1_id', playerId) // Don't join self
            .limit(1);

        if (openMatches && openMatches.length > 0) {
            // Join this match
            const match = openMatches[0];
            const { data, error } = await supabase
                .from('matches')
                .update({ player2_id: playerId, status: 'playing' })
                .eq('id', match.id)
                .select()
                .single();

            return { data, role: 'player2', error };
        } else {
            // Create new random match
            const randomCode = `RAND-${Math.floor(Math.random() * 10000)}`;
            const { data, error } = await supabase
                .from('matches')
                .insert([{
                    player1_id: playerId,
                    room_code: randomCode,
                    status: 'waiting'
                }])
                .select()
                .single();

            return { data, role: 'player1', error };
        }
    },

    // 4. Cleanup/End
    async endMatch(matchId: string) {
        await supabase.from('matches').update({ status: 'finished' }).eq('id', matchId);
    }
};
