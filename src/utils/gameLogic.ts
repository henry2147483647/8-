import { Card, Suit, Rank } from '../types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${rank}-${suit}`,
        suit,
        rank,
      });
    }
  }
  return shuffle(deck);
}

export function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function canPlayCard(card: Card, topDiscard: Card, currentSuit: Suit | null): boolean {
  // 8 is always playable
  if (card.rank === '8') return true;

  const targetSuit = currentSuit || topDiscard.suit;
  
  // Match suit or rank
  return card.suit === targetSuit || card.rank === topDiscard.rank;
}

export function getAiMove(hand: Card[], topDiscard: Card, currentSuit: Suit | null): Card | null {
  // Simple AI: Play the first valid card
  // Priority: 
  // 1. Non-8 cards that match suit or rank
  // 2. 8 cards
  
  const targetSuit = currentSuit || topDiscard.suit;
  
  const matchingCards = hand.filter(c => c.rank !== '8' && (c.suit === targetSuit || c.rank === topDiscard.rank));
  if (matchingCards.length > 0) return matchingCards[0];
  
  const eights = hand.filter(c => c.rank === '8');
  if (eights.length > 0) return eights[0];
  
  return null;
}

export function getBestSuitForAi(hand: Card[]): Suit {
  const counts: Record<Suit, number> = {
    hearts: 0,
    diamonds: 0,
    clubs: 0,
    spades: 0,
  };
  
  hand.forEach(c => {
    counts[c.suit]++;
  });
  
  return (Object.keys(counts) as Suit[]).reduce((a, b) => counts[a] > counts[b] ? a : b);
}
