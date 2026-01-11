import { supabase } from './supabaseClient';
import { LogEntry } from '@/types';

export interface UserProfile {
    id: string; // UUID
    name: string;
    wins: number;
    losses: number;
    highscore: number;
    created_at?: string;
}

export interface MatchSession {
    id: number; // int8 from DB
    room_code: string;
    player1_id: string;
    player2_id: string | null;
    status: 'waiting' | 'playing' | 'finished';
    created_at?: string;
    game_state?: any; // JSONB
}

// --- AUTHENTICATION ---

export const ensureAuthenticated = async (): Promise<string | null> => {
    // Check existing session
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
        return session.user.id;
    }

    // Sign in anonymously
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
        console.error('Error signing in anonymously:', error);
        return null;
    }

    return data.user?.id || null;
};

// --- PROFILES ---

export const getProfile = async (id: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        // Fallback: If profile doesn't exist for this ID, return null
        // Logic handled by caller
        return null;
    }
    return data;
};

export const createProfile = async (name: string): Promise<UserProfile | null> => {
    const userId = await ensureAuthenticated();
    if (!userId) {
        console.error('Cannot create profile: Authentication failed');
        return null;
    }

    // Use Upsert to handle existing profiles for this auth user
    // The 'id' column in profiles must match auth.users.id
    const { data, error } = await supabase
        .from('profiles')
        .upsert([{
            id: userId, // Explicitly linking to Auth ID
            name,
            wins: 0,
            losses: 0,
            highscore: 0
        }], { onConflict: 'id' })
        .select()
        .single();

    if (error) {
        console.error('Error creating/updating profile:', error);
        return null;
    }
    return data;
};

// --- MATCHMAKING ---

export const createMatch = async (roomCode: string): Promise<MatchSession | null> => {
    const userId = await ensureAuthenticated();
    if (!userId) return null;

    const { data, error } = await supabase
        .from('matches')
        .insert([{
            room_code: roomCode,
            player1_id: userId,
            status: 'waiting'
        }])
        .select()
        .single();

    if (error) {
        console.error('Error creating match:', error);
        return null;
    }
    return data;
};

export const joinMatch = async (roomCode: string): Promise<MatchSession | null> => {
    const userId = await ensureAuthenticated();
    if (!userId) return null;

    // 1. Find the match
    const { data: existing, error: fetchError } = await supabase
        .from('matches')
        .select('*')
        .eq('room_code', roomCode)
        .eq('status', 'waiting')
        .single();

    if (fetchError || !existing) {
        console.error('Match not found or not waiting:', fetchError);
        return null;
    }

    // Prevent joining own match
    if (existing.player1_id === userId) {
        console.warn("Attempted to join own match.");
        // Potentially return existing match to resume it?
        return existing;
    }

    // 2. Update with Player 2
    const { data, error } = await supabase
        .from('matches')
        .update({ player2_id: userId, status: 'playing' })
        .eq('id', existing.id)
        .select()
        .single();

    if (error) {
        console.error('Error joining match:', error);
        return null;
    }
    return data;
};

export const subscribeToMatch = (matchId: number, onUpdate: (payload: any) => void) => {
    return supabase
        .channel(`match:${matchId}`)
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` },
            (payload) => onUpdate(payload)
        )
        .subscribe();
};

export const updateMatchState = async (matchId: number, gameState: any) => {
    const { error } = await supabase
        .from('matches')
        .update({ game_state: gameState })
        .eq('id', matchId);

    if (error) {
        console.error('Error updating match state:', error);
    }
};

export const getMatchState = async (matchId: number) => {
    const { data, error } = await supabase
        .from('matches')
        .select('game_state, player1_id, player2_id')
        .eq('id', matchId)
        .single();

    if (error) {
        console.error('Error fetching match state:', error);
        return null;
    }
    return data;
};
