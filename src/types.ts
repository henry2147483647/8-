export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

export type GameStatus = 'playing' | 'choosing_suit' | 'game_over';

export interface GameState {
  deck: Card[];
  discardPile: Card[];
  playerHand: Card[];
  aiHand: Card[];
  currentTurn: 'player' | 'ai';
  currentSuit: Suit | null; // For when an 8 is played
  status: GameStatus;
  winner: 'player' | 'ai' | null;
  lastAction: string;
}
