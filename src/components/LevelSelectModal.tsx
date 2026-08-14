import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Level, Pet, UserProgress } from '../types';
import { PETS_DATABASE } from '../data/pets';
import { X, Play, Lock, Star, Sparkles, Music } from 'lucide-react';
import { PetCharacter } from './PetCharacter';

interface LevelSelectModalProps {
  isOpen: boolean;
  levels: Level[];
  currentLevelId: number;
  userProgress: UserProgress;
  onSelectLevel: (level: Level) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  levels,
  currentLevelId,
  userProgress,
  onSelectLevel,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div id="level-select-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#4A443F]/50 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white border-2 border-[#E6E0D4] rounded-[32px] p-5 sm:p-7 shadow-2xl flex flex-col overflow-hidden text-[#4A443F]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E6E0D4]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#D2B48C] flex items-center justify-center text-white shadow-sm text-xl">
                <span>🎵</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#5D544C] flex items-center gap-2">
                  Select Dance Stage
                </h2>
                <p className="text-xs sm:text-sm text-[#8E877F] font-semibold">
                  Groove on each stage to unlock new animal dance companions!
                </p>
              </div>
            </div>
            <button
              id="level-select-close-button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[#F3EFE9] hover:bg-[#E6E0D4] text-[#5D544C] border border-[#D9D1C3] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Level Cards Grid */}
          <div className="flex-1 overflow-y-auto py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pr-1">
            {levels.map((lvl) => {
              const unlockPet = PETS_DATABASE.find((p) => p.id === lvl.unlocksPetId);
              const scoreRecord = userProgress.levelScores[lvl.id];
              const stars = scoreRecord ? scoreRecord.stars : 0;
              const isUnlocked = lvl.id === 1 || !!userProgress.levelScores[lvl.id - 1];
              const isCurrent = lvl.id === currentLevelId;

              return (
                <motion.div
                  key={lvl.id}
                  whileHover={isUnlocked ? { scale: 1.02, y: -2 } : {}}
                  className={`relative rounded-2xl p-4 flex flex-col justify-between border-2 transition-all ${
                    isCurrent
                      ? 'bg-white border-[#8B9D77] ring-2 ring-[#8B9D77]/30 shadow-md'
                      : isUnlocked
                      ? 'bg-[#FAF9F6] border-[#E6E0D4] hover:border-[#D9D1C3] hover:bg-white shadow-xs'
                      : 'bg-[#F3EFE9]/60 border-[#E6E0D4] opacity-60'
                  }`}
                >
                  {/* Top Bar: Level Number & Difficulty */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#F3EFE9] text-[10px] font-black text-[#5D544C] uppercase tracking-wider border border-[#E6E0D4]">
                      Stage {lvl.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        lvl.difficulty === 'Easy'
                          ? 'bg-[#8B9D77]/15 text-[#5D544C] border border-[#8B9D77]/30'
                          : lvl.difficulty === 'Medium'
                          ? 'bg-[#D2B48C]/20 text-[#5D544C] border border-[#D2B48C]'
                          : lvl.difficulty === 'Groovy'
                          ? 'bg-[#D27D56]/15 text-[#D27D56] border border-[#D27D56]/30'
                          : 'bg-[#5D544C]/15 text-[#5D544C] border border-[#5D544C]/30'
                      }`}
                    >
                      {lvl.difficulty}
                    </span>
                  </div>

                  {/* Level Title & Stage Info */}
                  <div className="mb-2">
                    <h3 className="text-sm font-black text-[#5D544C] truncate">{lvl.title}</h3>
                    <div className="text-[11px] text-[#8E877F] font-semibold flex items-center gap-1.5 mt-0.5">
                      <span>{lvl.stageName}</span>
                      <span>•</span>
                      <span className="text-[#8B9D77] font-bold">{lvl.bpm} BPM</span>
                    </div>
                  </div>

                  {/* Unlock Reward Preview */}
                  {unlockPet && (
                    <div className="my-2 p-2 rounded-2xl bg-white border border-[#E6E0D4] flex items-center gap-2">
                      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                        <PetCharacter pet={unlockPet} size="sm" interactive={false} showShadow={false} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] uppercase font-bold text-[#D27D56] flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Reward
                        </div>
                        <div className="text-xs font-black text-[#5D544C] truncate">
                          {unlockPet.name}
                        </div>
                        <div className="text-[10px] text-[#8E877F] font-medium truncate">
                          {userProgress.unlockedPets.includes(unlockPet.id) ? '✅ Adopted' : '🔒 Clear to adopt'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Star Rating & High Score */}
                  <div className="flex items-center justify-between my-2 pt-2 border-t border-[#E6E0D4]">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <span key={s} className={`text-sm ${stars >= s ? 'text-[#D27D56]' : 'text-[#D9D1C3]'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <div className="text-[11px] font-bold text-[#5D544C]">
                      {scoreRecord ? `${scoreRecord.score.toLocaleString()} pts` : 'No score'}
                    </div>
                  </div>

                  {/* Play / Lock Button */}
                  {isUnlocked ? (
                    <button
                      id={`play-stage-button-${lvl.id}`}
                      onClick={() => {
                        onSelectLevel(lvl);
                        onClose();
                      }}
                      className="w-full mt-2 py-2 rounded-xl bg-[#D27D56] hover:bg-[#C16C45] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Play Stage
                    </button>
                  ) : (
                    <div className="w-full mt-2 py-2 rounded-xl bg-[#F3EFE9] text-[#8E877F] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-[#E6E0D4]">
                      <Lock className="w-3.5 h-3.5" />
                      Locked
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
