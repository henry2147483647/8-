/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Trophy, Info, AlertCircle, Heart, Diamond, Club, Spade } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Card as CardType, GameState, Suit, GameStatus } from './types';
import { createDeck, canPlayCard, getAiMove, getBestSuitForAi } from './utils/gameLogic';
import { Card } from './components/Card';
import { SuitSelector } from './components/SuitSelector';

const suitIcons: Record<Suit, React.ReactNode> = {
  hearts: <Heart className="w-4 h-4 fill-current" />,
  diamonds: <Diamond className="w-4 h-4 fill-current" />,
  clubs: <Club className="w-4 h-4 fill-current" />,
  spades: <Spade className="w-4 h-4 fill-current" />,
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    deck: [],
    discardPile: [],
    playerHand: [],
    aiHand: [],
    currentTurn: 'player',
    currentSuit: null,
    status: 'playing',
    winner: null,
    lastAction: 'Game started! Your turn.',
  });

  const [pendingEight, setPendingEight] = useState<CardType | null>(null);

  const initGame = useCallback(() => {
    const fullDeck = createDeck();
    const playerHand = fullDeck.splice(0, 8);
    const aiHand = fullDeck.splice(0, 8);
    
    // Find a starting discard that is not an 8
    let discardIndex = 0;
    while (fullDeck[discardIndex].rank === '8') {
      discardIndex++;
    }
    const discardPile = [fullDeck.splice(discardIndex, 1)[0]];

    setGameState({
      deck: fullDeck,
      discardPile,
      playerHand,
      aiHand,
      currentTurn: 'player',
      currentSuit: null,
      status: 'playing',
      winner: null,
      lastAction: 'Game started! Your turn.',
    });
    setPendingEight(null);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const checkWinner = (state: GameState) => {
    if (state.playerHand.length === 0) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      return 'player';
    }
    if (state.aiHand.length === 0) {
      return 'ai';
    }
    return null;
  };

  const handlePlayCard = (card: CardType) => {
    if (gameState.currentTurn !== 'player' || gameState.status !== 'playing') return;

    if (!canPlayCard(card, gameState.discardPile[gameState.discardPile.length - 1], gameState.currentSuit)) {
      setGameState(prev => ({ ...prev, lastAction: "You can't play that card!" }));
      return;
    }

    if (card.rank === '8') {
      setPendingEight(card);
      setGameState(prev => ({ ...prev, status: 'choosing_suit' }));
      return;
    }

    const newPlayerHand = gameState.playerHand.filter(c => c.id !== card.id);
    const newDiscardPile = [...gameState.discardPile, card];
    const winner = checkWinner({ ...gameState, playerHand: newPlayerHand });

    setGameState(prev => ({
      ...prev,
      playerHand: newPlayerHand,
      discardPile: newDiscardPile,
      currentTurn: 'ai',
      currentSuit: null,
      status: winner ? 'game_over' : 'playing',
      winner,
      lastAction: `You played ${card.rank} of ${card.suit}. AI's turn.`,
    }));
  };

  const handleSuitSelect = (suit: Suit) => {
    if (!pendingEight) return;

    const newPlayerHand = gameState.playerHand.filter(c => c.id !== pendingEight.id);
    const newDiscardPile = [...gameState.discardPile, pendingEight];
    const winner = checkWinner({ ...gameState, playerHand: newPlayerHand });

    setGameState(prev => ({
      ...prev,
      playerHand: newPlayerHand,
      discardPile: newDiscardPile,
      currentTurn: 'ai',
      currentSuit: suit,
      status: winner ? 'game_over' : 'playing',
      winner,
      lastAction: `You played an 8 and chose ${suit}. AI's turn.`,
    }));
    setPendingEight(null);
  };

  const handleDrawCard = () => {
    if (gameState.currentTurn !== 'player' || gameState.status !== 'playing') return;

    if (gameState.deck.length === 0) {
      setGameState(prev => ({
        ...prev,
        currentTurn: 'ai',
        lastAction: "Deck empty! Skipping your turn.",
      }));
      return;
    }

    const newDeck = [...gameState.deck];
    const drawnCard = newDeck.pop()!;
    const newPlayerHand = [...gameState.playerHand, drawnCard];

    setGameState(prev => ({
      ...prev,
      deck: newDeck,
      playerHand: newPlayerHand,
      lastAction: "You drew a card.",
    }));
  };

  // AI Turn Logic
  useEffect(() => {
    if (gameState.currentTurn === 'ai' && gameState.status === 'playing') {
      const timer = setTimeout(() => {
        const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];
        const aiMove = getAiMove(gameState.aiHand, topDiscard, gameState.currentSuit);

        if (aiMove) {
          const newAiHand = gameState.aiHand.filter(c => c.id !== aiMove.id);
          const newDiscardPile = [...gameState.discardPile, aiMove];
          let newSuit: Suit | null = null;
          let actionText = `AI played ${aiMove.rank} of ${aiMove.suit}.`;

          if (aiMove.rank === '8') {
            newSuit = getBestSuitForAi(newAiHand);
            actionText = `AI played an 8 and chose ${newSuit}.`;
          }

          const winner = checkWinner({ ...gameState, aiHand: newAiHand });

          setGameState(prev => ({
            ...prev,
            aiHand: newAiHand,
            discardPile: newDiscardPile,
            currentTurn: 'player',
            currentSuit: newSuit,
            status: winner ? 'game_over' : 'playing',
            winner,
            lastAction: actionText,
          }));
        } else {
          // AI needs to draw
          if (gameState.deck.length > 0) {
            const newDeck = [...gameState.deck];
            const drawnCard = newDeck.pop()!;
            const newAiHand = [...gameState.aiHand, drawnCard];
            setGameState(prev => ({
              ...prev,
              deck: newDeck,
              aiHand: newAiHand,
              lastAction: "AI drew a card.",
            }));
            // AI will try to play again after drawing? 
            // In Crazy Eights, usually if you draw you can play if it matches, 
            // but for simplicity let's just end the turn or let AI try once more.
            // Let's just end AI turn for now to keep it simple.
            setGameState(prev => ({ ...prev, currentTurn: 'player' }));
          } else {
            setGameState(prev => ({
              ...prev,
              currentTurn: 'player',
              lastAction: "AI couldn't play and deck is empty. Your turn!",
            }));
          }
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [gameState.currentTurn, gameState.status, gameState.aiHand, gameState.discardPile, gameState.currentSuit, gameState.deck]);

  const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];

  return (
    <div className="h-screen w-full flex flex-col font-sans select-none">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-2xl font-bold text-white">8</span>
          </div>
          <h1 className="text-xl font-display font-bold tracking-tight">大鱼</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
            <Info className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-zinc-300">Match suit or rank. 8 is wild!</span>
          </div>
          <button 
            onClick={initGame}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-300"
            title="Restart Game"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 relative flex flex-col items-center justify-between p-4 sm:p-8 overflow-hidden">
        
        {/* AI Area */}
        <div className="w-full flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium uppercase tracking-wider">
            <div className={`w-2 h-2 rounded-full ${gameState.currentTurn === 'ai' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
            AI Opponent ({gameState.aiHand.length} cards)
          </div>
          <div className="flex justify-center -space-x-12 sm:-space-x-16 h-28 sm:h-36">
            <AnimatePresence>
              {gameState.aiHand.map((card, index) => (
                <Card key={card.id} card={card} isFaceUp={false} className="rotate-180" />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Center Area (Deck & Discard) */}
        <div className="flex items-center gap-8 sm:gap-16">
          {/* Draw Pile */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative group" onClick={handleDrawCard}>
              <div className="absolute -inset-1 bg-emerald-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative">
                {gameState.deck.length > 0 ? (
                  <Card 
                    card={gameState.deck[0]} 
                    isFaceUp={false} 
                    className={`cursor-pointer ${gameState.currentTurn === 'player' ? 'hover:-translate-y-1 transition-transform' : 'opacity-50'}`} 
                  />
                ) : (
                  <div className="w-20 h-28 sm:w-24 sm:h-36 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center text-white/20">
                    Empty
                  </div>
                )}
                {gameState.deck.length > 1 && (
                  <div className="absolute -bottom-1 -right-1 w-full h-full bg-indigo-900 rounded-lg border-2 border-indigo-400 -z-10" />
                )}
              </div>
            </div>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Draw ({gameState.deck.length})</span>
          </div>

          {/* Discard Pile */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              {gameState.currentSuit && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
                  <div className="bg-white text-zinc-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-2">
                    Suit: <span className={gameState.currentSuit === 'hearts' || gameState.currentSuit === 'diamonds' ? 'text-red-600' : 'text-zinc-900'}>
                      {suitIcons[gameState.currentSuit]}
                    </span>
                  </div>
                </div>
              )}
              <AnimatePresence mode="popLayout">
                {topDiscard && (
                  <Card 
                    key={topDiscard.id} 
                    card={topDiscard} 
                    className="shadow-2xl shadow-black/40"
                  />
                )}
              </AnimatePresence>
            </div>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Discard</span>
          </div>
        </div>

        {/* Player Area */}
        <div className="w-full flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium uppercase tracking-wider">
            <div className={`w-2 h-2 rounded-full ${gameState.currentTurn === 'player' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
            Your Hand ({gameState.playerHand.length} cards)
          </div>
          <div className="flex justify-center flex-wrap gap-2 max-w-4xl px-4">
            <AnimatePresence>
              {gameState.playerHand.map((card) => (
                <Card 
                  key={card.id} 
                  card={card} 
                  isPlayable={gameState.currentTurn === 'player' && canPlayCard(card, topDiscard, gameState.currentSuit)}
                  onClick={() => handlePlayCard(card)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Log Overlay */}
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-8 sm:bottom-8 sm:max-w-xs pointer-events-none">
          <motion.div 
            key={gameState.lastAction}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-sm text-zinc-200 leading-relaxed">{gameState.lastAction}</p>
          </motion.div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {gameState.status === 'choosing_suit' && (
          <SuitSelector onSelect={handleSuitSelect} />
        )}

        {gameState.status === 'game_over' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-10 shadow-2xl max-w-sm w-full text-center"
            >
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${gameState.winner === 'player' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {gameState.winner === 'player' ? <Trophy className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
              </div>
              <h2 className="text-3xl font-display font-bold text-zinc-900 mb-2">
                {gameState.winner === 'player' ? 'Victory!' : 'Defeat!'}
              </h2>
              <p className="text-zinc-500 mb-8">
                {gameState.winner === 'player' ? 'You cleared your hand first. Great job!' : 'The AI beat you this time. Try again?'}
              </p>
              <button
                onClick={initGame}
                className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/20"
              >
                Play Again
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
