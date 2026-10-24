'use client';

import React, { useState, useEffect } from 'react';
import { X, Flame, Timer, Droplets, Sparkles, Play, Pause, RotateCcw } from 'lucide-react';
import { Product } from '@/lib/types';

export default function BrewingGuideModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(240); // default 4 mins
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((sec) => sec - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(240);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-modal shadow-premium w-full max-w-lg overflow-hidden border border-brand-mint/40">
        {/* Header */}
        <div className="bg-brand-darkGreen text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-brand-gold" />
            <h3 className="font-heading font-bold text-base">Perfect Steep Ritual Guide</h3>
          </div>
          <button onClick={onClose} className="p-1 text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h4 className="font-heading font-bold text-lg text-brand-darkGreen">{product.name}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{product.subtitle}</p>
          </div>

          {/* Steeping Parameters Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-brand-beige p-3 rounded-card text-center border border-brand-mint/30">
              <Flame className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">Water Temp</span>
              <span className="font-bold text-xs text-brand-darkGreen">{product.brewingGuide.temp}</span>
            </div>
            <div className="bg-brand-beige p-3 rounded-card text-center border border-brand-mint/30">
              <Timer className="w-5 h-5 text-brand-green mx-auto mb-1" />
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">Steep Time</span>
              <span className="font-bold text-xs text-brand-darkGreen">{product.brewingGuide.steepTime}</span>
            </div>
            <div className="bg-brand-beige p-3 rounded-card text-center border border-brand-mint/30">
              <Droplets className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">Water Ratio</span>
              <span className="font-bold text-xs text-brand-darkGreen">{product.brewingGuide.waterAmount}</span>
            </div>
          </div>

          {/* Serving Suggestion */}
          <div className="bg-sky-50 p-3.5 rounded-button border border-sky-200 text-xs text-sky-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
            <p><strong>Master Herbalist Note:</strong> {product.brewingGuide.servingSuggestion}</p>
          </div>

          {/* Interactive Steeping Timer Widget */}
          <div className="bg-brand-darkGreen text-white p-5 rounded-card text-center space-y-3">
            <span className="text-xs uppercase tracking-widest text-brand-gold font-bold">Interactive Steep Timer</span>
            <div className="text-4xl font-mono font-bold tracking-wider text-white">
              {formatTime(secondsLeft)}
            </div>

            {secondsLeft === 0 && (
              <p className="text-xs text-brand-gold font-semibold animate-bounce">
                ✨ Steep complete! Strain and enjoy your fresh herbal infusion.
              </p>
            )}

            <div className="flex justify-center gap-3 pt-1">
              <button
                onClick={() => setIsActive(!isActive)}
                className="bg-brand-gold hover:bg-white text-brand-darkGreen font-bold text-xs px-5 py-2 rounded-button flex items-center gap-1.5 transition-colors"
              >
                {isActive ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start Timer</>}
              </button>
              <button
                onClick={resetTimer}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-3 py-2 rounded-button flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
