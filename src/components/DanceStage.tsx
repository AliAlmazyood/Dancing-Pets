import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DanceMove, Level, Pet, UserProgress } from '../types';
import { PetCharacter } from './PetCharacter';
import { Sparkles, Flame, Trophy, Volume2, VolumeX, Music, Disc, Zap } from 'lucide-react';
import { sound } from '../utils/audio';

interface DanceStageProps {
  level: Level;
  leadPet: Pet;
  backupPets: Pet[];
  userProgress: UserProgress;
  score: number;
  combo: number;
  feverGauge: number;
  isFeverActive: boolean;
  timeLeft: number;
  danceMove: DanceMove;
  beatStep: number;
  onDirectPetClick: () => void;
  onFeverTrigger: () => void;
}

export const DanceStage: React.FC<DanceStageProps> = ({
  level,
  leadPet,
  backupPets,
  userProgress,
  score,
  combo,
  feverGauge,
  isFeverActive,
  timeLeft,
  danceMove,
  beatStep,
  onDirectPetClick,
  onFeverTrigger,
}) => {
  const [pulseFloor, setPulseFloor] = useState(false);

  // Calculate Star Progress
  const star1 = level.targetScore * 0.5;
  const star2 = level.targetScore * 0.8;
  const star3 = level.targetScore;

  const currentStars = score >= star3 ? 3 : score >= star2 ? 2 : score >= star1 ? 1 : 0;
  const scoreProgressPercent = Math.min(100, (score / star3) * 100);

  return (
    <div
      id="dance-stage"
      className={`relative w-full rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-sm border-2 border-[#E6E0D4] bg-white flex flex-col justify-between items-center select-none min-h-[380px] sm:min-h-[460px] p-4 sm:p-6 transition-all duration-700`}
    >
      {/* Background Natural Texture & Dot Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(#4A443F 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Subtle Natural Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Warm Golden Sunbeam 1 */}
        <motion.div
          animate={{
            rotate: [-20, 20, -20],
            opacity: isFeverActive ? [0.6, 0.9, 0.6] : [0.2, 0.35, 0.2],
          }}
          transition={{ repeat: Infinity, duration: 4.2, ease: 'easeInOut' }}
          style={{ transformOrigin: 'top center' }}
          className="absolute top-0 left-1/4 w-44 sm:w-64 h-[460px] bg-gradient-to-b from-[#D2B48C]/30 via-[#8B9D77]/15 to-transparent blur-2xl"
        />
        {/* Sage Ambient Ray 2 */}
        <motion.div
          animate={{
            rotate: [20, -20, 20],
            opacity: isFeverActive ? [0.6, 0.9, 0.6] : [0.2, 0.35, 0.2],
          }}
          transition={{ repeat: Infinity, duration: 3.8, ease: 'easeInOut' }}
          style={{ transformOrigin: 'top center' }}
          className="absolute top-0 right-1/4 w-44 sm:w-64 h-[460px] bg-gradient-to-b from-[#8B9D77]/25 via-[#D27D56]/15 to-transparent blur-2xl"
        />

        {/* Floating Natural Particles in Fever */}
        {isFeverActive && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: `${Math.random() * 90 + 5}%`,
                  y: '100%',
                  opacity: 0,
                  scale: 0.5,
                }}
                animate={{
                  y: '-10%',
                  opacity: [0, 0.9, 0],
                  scale: [0.5, 1.3, 0.8],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2 + Math.random() * 1.5,
                  delay: Math.random() * 2,
                  ease: 'easeOut',
                }}
                className="absolute text-base font-bold pointer-events-none"
              >
                {['🐾', '🌿', '✨', '🥜', '⭐'][i % 5]}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* TOP HUD: Level Title, Score, Stars, Fever Meter */}
      <div className="relative z-20 w-full flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Level Info */}
          <div className="flex items-center gap-2">
            <div className="px-3.5 py-1.5 rounded-full bg-[#F3EFE9] border border-[#E6E0D4] text-xs font-bold text-[#5D544C] flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#8B9D77] animate-ping" />
              <span>{level.stageName}</span>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-[#8B9D77]/15 border border-[#8B9D77]/25 text-xs font-black text-[#5D544C]">
              {level.bpm} BPM
            </div>
          </div>

          {/* Time Remaining */}
          <div className="px-3.5 py-1.5 rounded-full bg-[#F3EFE9] border border-[#E6E0D4] text-xs font-bold text-[#5D544C] flex items-center gap-1.5 shadow-xs">
            <span className="text-[#8E877F]">Time:</span>
            <span className={timeLeft <= 5 ? 'text-[#D27D56] font-black animate-pulse text-sm' : 'text-[#5D544C] font-mono font-bold'}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Score & Stars Bar */}
        <div className="w-full bg-[#FAF9F6] border-2 border-[#E6E0D4] rounded-2xl p-2.5 sm:p-3.5 flex flex-col gap-2 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xs uppercase font-bold text-[#8E877F] tracking-wider">Boogie Score</span>
              <div className="flex items-center gap-1.5 bg-[#F3EFE9] px-3 py-1 rounded-xl border border-[#E6E0D4]">
                <span className="text-base">🥜</span>
                <span className="font-mono font-bold text-lg sm:text-xl text-[#5D544C]">
                  {score.toLocaleString()}
                </span>
              </div>
              {combo >= 3 && (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ repeat: Infinity, duration: 0.4 }}
                  className="px-2.5 py-1 rounded-full bg-[#D27D56] text-white font-black text-xs tracking-wider shadow-sm flex items-center gap-1"
                >
                  <Flame className="w-3 h-3 fill-current" />
                  <span>{combo} COMBO!</span>
                </motion.div>
              )}
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((starIndex) => {
                const isEarned = currentStars >= starIndex;
                return (
                  <motion.div
                    key={starIndex}
                    animate={isEarned ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                    className={`text-lg sm:text-xl ${isEarned ? 'text-[#D27D56] drop-shadow-xs' : 'text-[#D9D1C3] opacity-50'}`}
                  >
                    ⭐
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-[#FAF9F6] border border-[#E6E0D4] rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-[#8B9D77] rounded-full"
              style={{ width: `${scoreProgressPercent}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </div>

        {/* Fever Energy Gauge */}
        <div className="w-full flex items-center gap-2">
          <div className="flex-1 h-3.5 bg-[#F3EFE9] rounded-full overflow-hidden border border-[#D9D1C3] relative p-0.5 shadow-inner">
            <motion.div
              className={`h-full rounded-full transition-all duration-150 ${
                isFeverActive
                  ? 'bg-[#D27D56] animate-pulse'
                  : 'bg-[#8B9D77]'
              }`}
              style={{ width: `${isFeverActive ? 100 : feverGauge}%` }}
            />
          </div>
          {feverGauge >= 100 && !isFeverActive && (
            <motion.button
              id="fever-trigger-button"
              initial={{ scale: 0.9 }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              onClick={onFeverTrigger}
              className="px-3.5 py-1 rounded-full bg-[#D27D56] hover:bg-[#C16C45] text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1 cursor-pointer"
            >
              <Zap className="w-3 h-3 fill-current" />
              FEVER!
            </motion.button>
          )}
          {isFeverActive && (
            <div className="px-3 py-1 rounded-full bg-[#D27D56] text-white font-black text-xs tracking-wider shadow-sm animate-bounce flex items-center gap-1">
              <span>🔥</span>
              <span>x2 FEVER</span>
            </div>
          )}
        </div>
      </div>

      {/* CENTER DANCE STAGE AREA */}
      <div className="relative z-20 w-full flex items-end justify-center py-4 my-auto">
        {/* Left Backup Dancer */}
        {backupPets[0] && (
          <div className="hidden sm:flex flex-col items-center -mr-4 mb-2 opacity-85 scale-90">
            <div className="text-[10px] font-bold text-[#5D544C] bg-[#F3EFE9] border border-[#E6E0D4] px-2.5 py-0.5 rounded-full mb-1">
              {backupPets[0].name}
            </div>
            <PetCharacter
              pet={backupPets[0]}
              danceMove={isFeverActive ? 'fever' : danceMove === 'miss' ? 'idle' : 'groove'}
              accessory={userProgress.equippedAccessories[backupPets[0].id] || backupPets[0].defaultAccessory}
              size="md"
              interactive={true}
              beatStep={beatStep}
            />
          </div>
        )}

        {/* Lead Dancing Pet (Main Star with Stage Pedestal) */}
        <div className="flex flex-col items-center relative z-20">
          {/* Main Pet Stage Circle Frame */}
          <div className="w-56 h-56 sm:w-64 sm:h-64 bg-[#FDFCF0] rounded-full border-4 border-[#8B9D77] flex flex-col items-center justify-center shadow-lg relative p-2">
            {/* Multiplier / Active status badge */}
            <div className="absolute -top-3 -right-3 w-11 h-11 bg-[#D27D56] rounded-full flex items-center justify-center text-white font-black text-sm shadow-md ring-4 ring-white">
              {isFeverActive ? 'x2' : 'x1'}
            </div>

            {/* Pet Character */}
            <PetCharacter
              pet={leadPet}
              danceMove={isFeverActive ? 'fever' : danceMove}
              accessory={userProgress.equippedAccessories[leadPet.id] || leadPet.defaultAccessory}
              size="lg"
              interactive={true}
              onPetClick={onDirectPetClick}
              beatStep={beatStep}
              className="cursor-pointer active:scale-95 transition-transform"
            />
          </div>

          {/* Pet Name & Groove Cue */}
          <div className="mt-3 text-center">
            <h2 className="text-xl sm:text-2xl font-black text-[#5D544C] tracking-tight">{leadPet.name.toUpperCase()}</h2>
            <p className="text-[#8B9D77] font-bold text-xs italic cursor-pointer hover:underline" onClick={onDirectPetClick}>
              Click to Keep Dancing!
            </p>
          </div>
        </div>

        {/* Right Backup Dancer */}
        {backupPets[1] && (
          <div className="hidden sm:flex flex-col items-center -ml-4 mb-2 opacity-85 scale-90">
            <div className="text-[10px] font-bold text-[#5D544C] bg-[#F3EFE9] border border-[#E6E0D4] px-2.5 py-0.5 rounded-full mb-1">
              {backupPets[1].name}
            </div>
            <PetCharacter
              pet={backupPets[1]}
              danceMove={isFeverActive ? 'fever' : danceMove === 'miss' ? 'idle' : 'groove'}
              accessory={userProgress.equippedAccessories[backupPets[1].id] || backupPets[1].defaultAccessory}
              size="md"
              interactive={true}
              beatStep={beatStep}
            />
          </div>
        )}
      </div>

      {/* NATURAL RHYTHM STEP DOTS (Bottom Organic Step Indicators) */}
      <div className="relative z-10 flex items-center justify-center gap-3 py-2 mt-auto">
        {[...Array(6)].map((_, i) => {
          const isStepActive = (beatStep + i) % 3 === 0;
          return (
            <motion.div
              key={i}
              animate={
                isStepActive
                  ? {
                      backgroundColor: isFeverActive ? '#D27D56' : '#8B9D77',
                      scale: [1, 1.3, 1],
                      opacity: 1,
                    }
                  : {
                      backgroundColor: '#8B9D77',
                      scale: 1,
                      opacity: 0.3,
                    }
              }
              transition={{ duration: 0.2 }}
              className="w-3 h-3 rounded-full"
            />
          );
        })}
      </div>
    </div>
  );
};
