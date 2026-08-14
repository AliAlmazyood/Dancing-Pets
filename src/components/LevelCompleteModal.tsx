import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Level, Pet, UserProgress } from '../types';
import { PetCharacter } from './PetCharacter';
import { sound } from '../utils/audio';
import { Trophy, Star, ArrowRight, RotateCcw, Sparkles, Check, Heart } from 'lucide-react';

interface LevelCompleteModalProps {
  isOpen: boolean;
  level: Level;
  score: number;
  maxCombo: number;
  unlockedPet: Pet | null;
  userProgress: UserProgress;
  onNextLevel: () => void;
  onReplay: () => void;
  onSelectLeadPet: (petId: string) => void;
  onClose: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  isOpen,
  level,
  score,
  maxCombo,
  unlockedPet,
  userProgress,
  onNextLevel,
  onReplay,
  onSelectLeadPet,
  onClose,
}) => {
  const isVictory = score >= level.targetScore * 0.5;
  const star1 = level.targetScore * 0.5;
  const star2 = level.targetScore * 0.8;
  const star3 = level.targetScore;

  const starsEarned = score >= star3 ? 3 : score >= star2 ? 2 : score >= star1 ? 1 : 0;

  useEffect(() => {
    if (!isOpen) return;

    if (isVictory) {
      sound.playVictoryFanfare();

      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F43F5E', '#FBBF24', '#38BDF8', '#8B5CF6', '#10B981'],
      });

      if (unlockedPet) {
        setTimeout(() => {
          sound.playPetUnlockChime();
          confetti({
            particleCount: 100,
            spread: 100,
            origin: { y: 0.5 },
          });
        }, 800);
      }
    }
  }, [isOpen, isVictory, unlockedPet]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="level-complete-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A443F]/50 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88 }}
          className="relative w-full max-w-lg bg-white border-2 border-[#E6E0D4] rounded-[32px] p-6 sm:p-8 shadow-2xl overflow-hidden text-center flex flex-col items-center text-[#4A443F]"
        >
          {/* Header Title */}
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, delay: 0.1 }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#8B9D77]/15 border border-[#8B9D77]/30 text-[#5D544C] font-bold text-xs uppercase tracking-wider mb-3"
            >
              <Trophy className="w-4 h-4 text-[#8B9D77]" />
              {isVictory ? 'Stage Cleared!' : 'Keep Grooving!'}
            </motion.div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#5D544C] tracking-tight">
              {level.title}
            </h2>
            <p className="text-sm text-[#8E877F] font-semibold mt-1">
              {level.stageName}
            </p>
          </div>

          {/* Stars Display */}
          <div className="flex items-center justify-center gap-3 my-4">
            {[1, 2, 3].map((starIdx) => {
              const earned = starsEarned >= starIdx;
              return (
                <motion.div
                  key={starIdx}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: earned ? 1.15 : 0.9, rotate: 0 }}
                  transition={{ delay: 0.2 + starIdx * 0.15, type: 'spring' }}
                  className={`text-4xl sm:text-5xl ${earned ? 'text-[#D27D56] drop-shadow-sm' : 'text-[#D9D1C3] opacity-50'}`}
                >
                  ⭐
                </motion.div>
              );
            })}
          </div>

          {/* Score & Combo Stats */}
          <div className="w-full grid grid-cols-2 gap-3 bg-[#FAF9F6] border border-[#E6E0D4] rounded-2xl p-4 my-2">
            <div className="flex flex-col items-center">
              <span className="text-xs text-[#8E877F] uppercase font-bold">Final Score</span>
              <span className="text-2xl font-black text-[#5D544C]">
                {score.toLocaleString()}
              </span>
              <span className="text-[10px] text-[#8E877F] font-medium">Target: {level.targetScore}</span>
            </div>
            <div className="flex flex-col items-center border-l border-[#E6E0D4]">
              <span className="text-xs text-[#8E877F] uppercase font-bold">Max Combo</span>
              <span className="text-2xl font-black text-[#D27D56]">
                {maxCombo}x
              </span>
              <span className="text-[10px] text-[#8E877F] font-medium">Groove Streak</span>
            </div>
          </div>

          {/* NEW PET UNLOCKED SPOTLIGHT */}
          {unlockedPet && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="w-full my-3 p-4 rounded-3xl bg-[#FDFCF0] border-2 border-[#8B9D77] shadow-md relative overflow-hidden"
            >
              <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-[#8B9D77] text-white font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3" />
                New Pet Adopted!
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
                <div className="w-20 h-20 bg-white rounded-full border-2 border-[#E6E0D4] flex items-center justify-center p-1 shadow-xs">
                  <PetCharacter
                    pet={unlockedPet}
                    danceMove="victory"
                    accessory={unlockedPet.defaultAccessory}
                    size="md"
                    interactive={true}
                  />
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <h3 className="text-lg font-black text-[#5D544C]">{unlockedPet.name}</h3>
                    <span className="text-xs font-semibold text-[#8B9D77]">({unlockedPet.species})</span>
                  </div>
                  <p className="text-xs text-[#6D655E] mt-0.5 line-clamp-2">
                    {unlockedPet.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] font-bold text-[#D27D56] bg-white px-2.5 py-0.5 rounded-lg border border-[#E6E0D4]">
                      Move: {unlockedPet.signatureMove}
                    </span>
                  </div>
                </div>
              </div>

              {/* Set as Lead Button */}
              {userProgress.activePetId !== unlockedPet.id && (
                <button
                  id={`set-lead-pet-button-${unlockedPet.id}`}
                  onClick={() => onSelectLeadPet(unlockedPet.id)}
                  className="w-full mt-3 py-2.5 rounded-2xl bg-[#D27D56] hover:bg-[#C16C45] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Make {unlockedPet.name} Lead Dancer!
                </button>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="w-full flex items-center gap-3 mt-4">
            <button
              id="level-replay-button"
              onClick={onReplay}
              className="flex-1 py-3 rounded-2xl bg-[#F3EFE9] hover:bg-[#E6E0D4] text-[#5D544C] font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#D9D1C3]"
            >
              <RotateCcw className="w-4 h-4" />
              Replay
            </button>

            {isVictory ? (
              <button
                id="next-level-button"
                onClick={onNextLevel}
                className="flex-1 py-3 rounded-2xl bg-[#D27D56] hover:bg-[#C16C45] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Next Stage</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="level-close-button"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-[#D27D56] hover:bg-[#C16C45] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Try Again</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
