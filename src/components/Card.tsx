import React from 'react';
import { motion } from 'motion/react';
import { Heart, Diamond, Club, Spade } from 'lucide-react';
import { Card as CardType, Suit } from '../types';

interface CardProps {
  card: CardType;
  isFaceUp?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
  className?: string;
}

const suitIcons: Record<Suit, React.ReactNode> = {
  hearts: <Heart className="w-full h-full fill-current" />,
  diamonds: <Diamond className="w-full h-full fill-current" />,
  clubs: <Club className="w-full h-full fill-current" />,
  spades: <Spade className="w-full h-full fill-current" />,
};

const suitColors: Record<Suit, string> = {
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-zinc-900',
  spades: 'text-zinc-900',
};

export const Card: React.FC<CardProps> = ({ 
  card, 
  isFaceUp = true, 
  onClick, 
  isPlayable = false,
  className = ""
}) => {
  if (!isFaceUp) {
    return (
      <motion.div
        layoutId={card.id}
        className={`w-20 h-28 sm:w-24 sm:h-36 bg-indigo-800 rounded-lg border-2 border-indigo-400 shadow-lg flex items-center justify-center overflow-hidden relative ${className}`}
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="w-12 h-16 border border-indigo-400/30 rounded flex items-center justify-center">
          <div className="w-8 h-10 border border-indigo-400/20 rounded-full"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layoutId={card.id}
      whileHover={isPlayable ? { y: -10, scale: 1.05 } : {}}
      onClick={isPlayable ? onClick : undefined}
      className={`
        w-20 h-28 sm:w-24 sm:h-36 bg-white rounded-lg border-2 shadow-md flex flex-col p-2 relative cursor-pointer select-none
        ${isPlayable ? 'border-emerald-400 ring-2 ring-emerald-200 ring-opacity-50' : 'border-zinc-200'}
        ${suitColors[card.suit]}
        ${className}
      `}
    >
      <div className="flex justify-between items-start">
        <span className="text-lg sm:text-xl font-bold leading-none">{card.rank}</span>
        <div className="w-4 h-4 sm:w-5 sm:h-5">
          {suitIcons[card.suit]}
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center opacity-10">
        <div className="w-12 h-12 sm:w-16 sm:h-16">
          {suitIcons[card.suit]}
        </div>
      </div>

      <div className="flex justify-between items-end rotate-180">
        <span className="text-lg sm:text-xl font-bold leading-none">{card.rank}</span>
        <div className="w-4 h-4 sm:w-5 sm:h-5">
          {suitIcons[card.suit]}
        </div>
      </div>
    </motion.div>
  );
};
