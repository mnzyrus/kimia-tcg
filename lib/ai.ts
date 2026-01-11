
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GameState, Card, Player } from "@/types";

import { sintesisCards, garamCards } from './gameData';
import { calculateReaction } from './gameLogic';

// --- Smart Rule-Based AI ---
export const OpponentAI = {
    calculateMove: (gameState: GameState): { action: 'synthesize' | 'attack' | 'trap' | 'draw' | 'end', card?: Card, index?: number, target?: any, moleCost?: number } => {
        const ai = gameState.player2;
        const opponent = gameState.player1;
        const opponentTrap = opponent.trapSlot || { id: 'def-0', name: 'Tiada', type: 'Neutral', formula: 'None', eCost: 0, mCost: 0, power: 0 } as any;

        // Candidate Moves with Scores
        const candidates: { action: any, score: number, meta?: any }[] = [];

        // 1. LETHAL CHECK (Score 1000+)
        // Can we kill the opponent NOW?
        ai.hand.forEach((card, index) => {
            if ((card.type === 'Sintesis' || card.type === 'Garam' || card.type === 'Element')) {
                if (card.power && card.power > 0) {
                    const result = calculateReaction(card, opponentTrap);
                    if (result.damageDealt >= opponent.hp) {
                        candidates.push({
                            action: { action: 'attack', card, index },
                            score: 1000 + result.damageDealt,
                            meta: 'Lethal'
                        });
                    }
                }
            }
        });

        // 2. SURVIVAL CHECK (Score 800+)
        // If HP < 300, prioritize Defense or Healing
        if (ai.hp < 300) {
            // Defense
            if (!ai.trapSlot) {
                ai.hand.forEach((card, index) => {
                    if (card.type === 'Sintesis' || card.type === 'Garam') {
                        candidates.push({
                            action: { action: 'trap', card, index },
                            score: 800 + (card.eCost || 0), // Higher cost might mean better defense? Or just do it.
                            meta: 'Survival Trap'
                        });
                    }
                });
            }
            // Heal? (Not strictly implemented in reaction logic yet as self-cast, but Salt might heal)
        }

        // 3. SYNTHESIS CHECK (Score 500-700)
        // Can we make something good?
        // Catalyst Logic
        const hasCatalyst = ai.synthesisZone.some(c => c.symbol === 'CAT') || ai.hand.some(c => c.symbol === 'CAT'); // AI generally puts CAT in zone if 'Complex' but for now simple check

        const allRecipes = [...sintesisCards, ...garamCards];
        allRecipes.forEach(recipe => {
            // Check ingredients in Zone + Hand (Virtual Pool)
            const pool = [...ai.synthesisZone, ...ai.hand];
            let requirements = recipe.requirements;
            if (!requirements && recipe.source) {
                const parts = recipe.source.split(' + ');
                requirements = parts.map(p => ({ element: p, count: 1 }));
            }

            if (requirements) {
                let possible = true;
                const usedIndices: number[] = []; // Track used to avoid double counting

                for (const req of requirements) {
                    for (let i = 0; i < (req.count || 1); i++) {
                        const idx = pool.findIndex((c, pIdx) => !usedIndices.includes(pIdx) && (c.symbol === req.element || c.formula === req.element));
                        if (idx !== -1) {
                            usedIndices.push(idx);
                        } else {
                            possible = false;
                            break;
                        }
                    }
                    if (!possible) break;
                }

                if (possible) {
                    // Cost Check
                    let eCost = recipe.eCost || 0;
                    if (hasCatalyst) eCost = Math.max(0, eCost - 2);
                    const mCost = recipe.mCost || 0;

                    if (ai.currentE >= eCost && ai.currentM >= mCost) {
                        // Score based on Tier/Power
                        let score = 500 + ((recipe.tier || 1) * 50);
                        if (recipe.power) score += recipe.power;

                        candidates.push({
                            action: { action: 'synthesize', card: recipe, moleCost: mCost }, // Handled specially by GameInterface or we need to automate the 'ingredients moving'
                            // NOTE: AI Synthesis is instantaneous in this loop? 
                            // The current GameInterface.processAITurn doesn't handle 'synthesize' action natively, it expects 'attack' etc.
                            // We need to UPDATE processAITurn to handle 'synthesize' OR 'move to zone' steps?
                            // For this "Smart AI" request, we should probably output 'synthesize' and let the helper function do the work, 
                            // OR we abstract it: "AI Synthesizes X" -> function automatically removes ingredients from hand/zone.
                            score: score,
                            meta: 'Synthesis'
                        });
                    }
                }
            }
        });

        // 4. ATTACK EFFICIENCY (Score 300-500)
        ai.hand.forEach((card, index) => {
            if ((card.type === 'Sintesis' || card.type === 'Garam' || card.type === 'Element')) {
                if (card.power || card.effect) {
                    const result = calculateReaction(card, opponentTrap);
                    let score = 300 + result.damageDealt;
                    // Bonus for status effects
                    if (result.effectType === 'reaction_bad') score += 50;
                    candidates.push({
                        action: { action: 'attack', card, index },
                        score: score,
                        meta: 'Attack'
                    });
                }
            }
        });

        // 5. TRAP / SETUP (Score 200)
        if (!ai.trapSlot) {
            ai.hand.forEach((card, index) => {
                if (card.type === 'Sintesis' || card.type === 'Garam') {
                    candidates.push({
                        action: { action: 'trap', card, index },
                        score: 200 + (card.eCost || 0),
                        meta: 'Trap'
                    });
                }
            });
        }

        // 6. DRAW (Score 100)
        if (ai.currentE >= 1 && ai.deck.length > 0 && ai.hand.length < 5) {
            candidates.push({
                action: { action: 'draw' },
                score: 100 + (5 - ai.hand.length) * 10,
                meta: 'Draw'
            });
        }

        // Sort and Decide
        candidates.sort((a, b) => b.score - a.score);

        // Sort and Decide
        candidates.sort((a, b) => b.score - a.score);

        if (candidates.length > 0) {
            const best = candidates[0];
            // Safety check: if best score is very low (e.g. < 0), maybe skip? 
            // But currently all scores are > 100.
            console.log(`AI Choice: ${best.meta} (${best.score})`, best.action);
            return best.action;
        }

        // --- FALLBACK LOGIC ---
        // If no moves found (e.g. no energy, no matches), try to DRAW
        if (ai.currentE >= 1 && ai.deck.length > 0 && ai.hand.length < 7) {
            console.log("AI Fallback: Draw");
            return { action: 'draw' };
        }

        // If cannot Draw, END TURN
        console.log("AI Fallback: End Turn");
        return { action: 'end' };
    }
};

// --- Gemini AI ---
export const GeminiService = {
    calculateMove: async (gameState: GameState, apiKey: string): Promise<{ action: 'synthesize' | 'attack' | 'trap' | 'draw' | 'end', card?: Card, index?: number, target?: any, moleCost?: number }> => {
        if (!apiKey) {
            console.warn("No Gemini API Key provided. Falling back to heuristic AI.");
            return OpponentAI.calculateMove(gameState);
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

            const prompt = createPrompt(gameState);

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up markdown code blocks if present
            const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();

            console.log("Gemini Raw Response:", cleanJson);

            const move = JSON.parse(cleanJson);

            // Validate move structure roughly
            if (!move.action) throw new Error("Invalid move format from AI");

            // Map AI's JSON back to actual Card references if needed
            // The AI returns card IDs or names, we need to find the actual card object in hand
            const aiPlayer = gameState.player2;

            if (move.cardId) {
                const cardIndex = aiPlayer.hand.findIndex(c => c.id === move.cardId || c.name === move.cardName);
                if (cardIndex !== -1) {
                    move.card = aiPlayer.hand[cardIndex];
                    move.index = cardIndex;
                } else {
                    // AI tried to use a card it doesn't have? Fallback.
                    console.warn("AI tried to use invalid card:", move.cardId || move.cardName);
                    return OpponentAI.calculateMove(gameState);
                }
            }

            return move;

        } catch (error) {
            console.error("Gemini AI Error:", error);
            return OpponentAI.calculateMove(gameState);
        }
    },

    // New Chat Capability for "Tanya Ahli Kimia"
    chat: async (query: string, gameState: GameState, apiKey: string): Promise<string> => {
        if (!apiKey) return "Sila masukkan API Key di Tetapan untuk menggunakan ciri ini.";

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

            const systemPrompt = `
            Anda adalah "Ahli Kimia Diraja", pembantu pintar untuk permainan Kimia TCG.
            
            Game Context:
            - Player pH: ${gameState.player1.ph} (Goal: 7.0 balanced, or survive)
            - Opponent pH: ${gameState.player2.ph}
            - Player Hand: ${gameState.player1.hand.map(c => c.name).join(', ')}
            
            Persona:
            - Helpful, educational, and slightly theatrical (royal alchemist vibe).
            - Explain chemistry concepts simply (e.g. Acid + Base -> Salt + Water).
            - Give strategic advice based on the player's hand.
            - Keep answers short (max 2-3 sentences) as space is limited.
            - Language: Bahasa Melayu (Official) or English (if asked).

            User Question: "${query}"
            `;

            const result = await model.generateContent(systemPrompt);
            const response = await result.response;
            return response.text();

        } catch (error) {
            console.error("Chat Error:", error);
            return "Maaf, radas makmal meletup (Error connecting to AI).";
        }
    }
};

function createPrompt(gameState: GameState): string {
    const p1 = gameState.player1;
    const p2 = gameState.player2; // AI

    return `
    You are playing a Chemistry Card Game called "Kimia TCG".
    
    Current Game State:
    Turn: ${gameState.turnNumber}
    Player 1 pH: ${gameState.player1.ph}
    Player 2 pH: ${gameState.player2.ph}
    
    Your Status (AI/Player 2):
    HP: ${p2.hp}/${p2.maxHP}
    Energy (E): ${p2.currentE}
    Mass (M): ${p2.currentM}
    Hand: ${JSON.stringify(p2.hand.map(c => ({ id: c.id, name: c.name, type: c.type, eCost: c.eCost, mCost: c.mCost, power: c.power || 0 })))}
    Synthesis Zone: ${JSON.stringify(p2.synthesisZone.map(c => c.name))}
    Defense Trap: ${p2.trapSlot ? p2.trapSlot.name : "None"}

    Opponent Status (Player 1):
    HP: ${p1.hp}/${p1.maxHP}
    Defense Trap: ${p1.trapSlot ? "Unknown" : "None"} 

    Game Rules:
    - 'Element' cards allow you to synthesize compounds.
    - 'Sintesis' cards (Acids/Bases) are your detailed attacks/heals.
    - Acid attacks HP. Base heals HP.
    - Acid + Base = Neutralization (Salt).
    - To Synthesize: You need specific elements (e.g. HCl needs H + Cl). 
    - To Attack: You typically play a Synthesis card or Salt.
    - Energy (E) is required to play cards. Mass (M) is required for synthesis.

    YOUR GOAL: Defeat the opponent by reducing their HP to 0.

    Available Actions:
    1. 'synthesize': If you have ingredients in hand/zone. (Not fully supported in this prompt version, assume ingredients logic is handled by game check, try to attack mainly).
    2. 'attack': Play a card from hand to damage opponent.
    3. 'trap': Set a card as defense.
    4. 'draw': If hand is empty or bad.
    5. 'end': End turn.

    OUTPUT FORMAT:
    Return strictly a JSON object with:
    {
      "action": "attack" | "trap" | "end" | "draw",
      "cardId": "id_of_card_to_use_from_hand",
      "reason": "short explanation"
    }
    
    Do not output markdown. Just the JSON.
    Prioritize attacking if you have energy and good cards.
    If you have low HP (<300), try to heal (Base cards).
  `;
}
