import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Diamond, Club, Spade } from 'lucide-react';
import { Suit } from '../types';

interface SuitSelectorProps {
  onSelect: (suit: Suit) => void;
}

const suits: { type: Suit; label: string; color: string; icon: React.ReactNode }[] = [
  { type: 'hearts', label: 'Hearts', color: 'text-red-600', icon: <Heart className="w-8 h-8 fill-current" /> },
  { type: 'diamonds', label: 'Diamonds', color: 'text-red-600', icon: <Diamond className="w-8 h-8 fill-current" /> },
  { type: 'clubs', label: 'Clubs', color: 'text-zinc-900', icon: <Club className="w-8 h-8 fill-current" /> },
  { type: 'spades', label: 'Spades', color: 'text-zinc-900', icon: <Spade className="w-8 h-8 fill-current" /> },
];

export const SuitSelector: React.FC<SuitSelectorProps> = ({ onSelect }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-zinc-900 mb-6 text-center">Choose a New Suit</h2>
        <div className="grid grid-cols-2 gap-4">
          {suits.map((suit) => (
            <button
              key={suit.type}
              onClick={() => onSelect(suit.type)}
              className={`
                flex flex-col items-center justify-center p-6 rounded-xl border-2 border-zinc-100 
                hover:border-emerald-500 hover:bg-emerald-50 transition-all group
                ${suit.color}
              `}
            >
              <div className="mb-2 group-hover:scale-110 transition-transform">
                {suit.icon}
              </div>
              <span className="font-semibold text-zinc-700">{suit.label}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
