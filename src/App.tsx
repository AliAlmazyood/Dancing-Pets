/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DanceMove, HitRating, Level, Pet, UserProgress } from './types';
import { PETS_DATABASE } from './data/pets';
import { LEVELS_DATABASE } from './data/levels';
import { sound } from './utils/audio';
import { DanceStage } from './components/DanceStage';
import { RhythmTrack } from './components/RhythmTrack';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { PetWardrobe } from './components/PetWardrobe';
import { FreeDanceParty } from './components/FreeDanceParty';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Music,
  Users,
  Trophy,
  Disc,
  HelpCircle,
  Flame,
} from 'lucide-react';

const STORAGE_KEY = 'dancing_pets_save_v1';

const DEFAULT_PROGRESS: UserProgress = {
  unlockedPets: ['cat_kiki'],
  equippedAccessories: { cat_kiki: 'headphones' },
  activePetId: 'cat_kiki',
  backupPetIds: [],
  levelScores: {},
  totalDances: 0,
  soundEnabled: true,
  musicVolume: 0.7,
  sfxVolume: 0.8,
};

export default function App() {
  // User Persistent State
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PROGRESS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PROGRESS;
  });

  // Save progress changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
    } catch {
      // ignore
    }
  }, [userProgress]);

  // Game Engine State
  const [currentLevel, setCurrentLevel] = useState<Level>(LEVELS_DATABASE[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [feverGauge, setFeverGauge] = useState<number>(0);
  const [isFeverActive, setIsFeverActive] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(LEVELS_DATABASE[0].duration);
  const [danceMove, setDanceMove] = useState<DanceMove>('idle');
  const [beatStep, setBeatStep] = useState<number>(0);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);

  // Modals
  const [isLevelCompleteOpen, setIsLevelCompleteOpen] = useState<boolean>(false);
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState<boolean>(false);
  const [isPetWardrobeOpen, setIsPetWardrobeOpen] = useState<boolean>(false);
  const [isPartyModeActive, setIsPartyModeActive] = useState<boolean>(false);
  const [newlyUnlockedPet, setNewlyUnlockedPet] = useState<Pet | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  const feverTimeoutRef = useRef<number | null>(null);
  const gameTimerRef = useRef<number | null>(null);
  const danceResetTimeoutRef = useRef<number | null>(null);

  // Lead & Backup Pets
  const leadPet =
    PETS_DATABASE.find((p) => p.id === userProgress.activePetId) || PETS_DATABASE[0];

  const backupPets = PETS_DATABASE.filter((p) =>
    userProgress.backupPetIds.includes(p.id) && p.id !== leadPet.id
  );

  // Reset Game Round
  const startLevel = useCallback(
    (levelToStart: Level = currentLevel) => {
      setCurrentLevel(levelToStart);
      setScore(0);
      setCombo(0);
      setMaxCombo(0);
      setFeverGauge(0);
      setIsFeverActive(false);
      setTimeLeft(levelToStart.duration);
      setDanceMove('groove');
      setIsPlaying(true);
      setIsPaused(false);
      setIsLevelCompleteOpen(false);
      setNewlyUnlockedPet(null);

      // Start Synthesizer Music
      sound.startMusic(levelToStart.bpm, levelToStart.musicStyle, (step) => {
        setBeatStep(step);
      });
    },
    [currentLevel]
  );

  const stopGame = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setDanceMove('idle');
    sound.stopMusic();

    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    if (feverTimeoutRef.current) {
      clearTimeout(feverTimeoutRef.current);
      feverTimeoutRef.current = null;
    }
  }, []);

  // Timer Countdown loop
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    gameTimerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Level Finished!
          clearInterval(gameTimerRef.current!);
          handleLevelComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
    };
  }, [isPlaying, isPaused]);

  // Handle Level Finish / Reward unlocking
  const handleLevelComplete = () => {
    stopGame();

    setScore((finalScore) => {
      const star1 = currentLevel.targetScore * 0.5;
      const star2 = currentLevel.targetScore * 0.8;
      const star3 = currentLevel.targetScore;
      const starsEarned = finalScore >= star3 ? 3 : finalScore >= star2 ? 2 : finalScore >= star1 ? 1 : 0;

      // Check if pet reward unlocked
      let unlockedPetObj: Pet | null = null;
      if (starsEarned >= 1 && currentLevel.unlocksPetId) {
        if (!userProgress.unlockedPets.includes(currentLevel.unlocksPetId)) {
          unlockedPetObj =
            PETS_DATABASE.find((p) => p.id === currentLevel.unlocksPetId) || null;
          setNewlyUnlockedPet(unlockedPetObj);
        }
      }

      // Update User Progress
      setUserProgress((prev) => {
        const prevRecord = prev.levelScores[currentLevel.id] || { score: 0, stars: 0 };
        const newScore = Math.max(prevRecord.score, finalScore);
        const newStars = Math.max(prevRecord.stars, starsEarned);

        const newUnlocked = [...prev.unlockedPets];
        if (unlockedPetObj && !newUnlocked.includes(unlockedPetObj.id)) {
          newUnlocked.push(unlockedPetObj.id);
        }

        return {
          ...prev,
          unlockedPets: newUnlocked,
          levelScores: {
            ...prev.levelScores,
            [currentLevel.id]: { score: newScore, stars: newStars },
          },
          totalDances: prev.totalDances + 1,
        };
      });

      setIsLevelCompleteOpen(true);
      return finalScore;
    });
  };

  // Trigger dance move with auto-revert to groove
  const triggerPetMove = useCallback((move: DanceMove, durationMs = 600) => {
    setDanceMove(move);
    if (danceResetTimeoutRef.current) {
      clearTimeout(danceResetTimeoutRef.current);
    }
    danceResetTimeoutRef.current = window.setTimeout(() => {
      setDanceMove('groove');
    }, durationMs);
  }, []);

  // Handle Player Hit on Rhythm Note
  const handleHit = useCallback(
    (rating: HitRating, points: number) => {
      setScore((prev) => prev + points);
      setCombo((prev) => {
        const nextCombo = prev + 1;
        setMaxCombo((max) => Math.max(max, nextCombo));
        return nextCombo;
      });

      // Build Fever Gauge
      if (!isFeverActive) {
        setFeverGauge((prev) => {
          const inc = rating === 'PERFECT' ? 14 : rating === 'GREAT' ? 8 : 4;
          const nextVal = Math.min(100, prev + inc);
          if (nextVal >= 100) {
            // Auto trigger fever or ready
          }
          return nextVal;
        });
      }

      // Pet Dance Animation
      if (rating === 'PERFECT') {
        triggerPetMove(Math.random() < 0.5 ? 'spin' : 'hop', 700);
      } else if (rating === 'GREAT') {
        triggerPetMove('wiggle', 500);
      }
    },
    [isFeverActive, triggerPetMove]
  );

  // Handle Miss
  const handleMiss = useCallback(() => {
    setCombo(0);
    triggerPetMove('miss', 600);
  }, [triggerPetMove]);

  // Activate Fever Mode
  const triggerFever = useCallback(() => {
    if (isFeverActive) return;
    setIsFeverActive(true);
    setFeverGauge(100);
    setDanceMove('fever');
    sound.playFeverFanfare();

    if (feverTimeoutRef.current) {
      clearTimeout(feverTimeoutRef.current);
    }

    feverTimeoutRef.current = window.setTimeout(() => {
      setIsFeverActive(false);
      setFeverGauge(0);
      setDanceMove('groove');
    }, 6000); // 6 seconds of fever mode
  }, [isFeverActive]);

  // Direct Pet Click Bonus (Tap the dancing pet directly!)
  const handleDirectPetClick = () => {
    if (!isPlaying) {
      sound.playAnimalSound(leadPet.soundType);
      triggerPetMove('hop', 600);
      return;
    }

    // Direct tap bonus points
    const bonus = isFeverActive ? 400 : 200;
    setScore((prev) => prev + bonus);
    sound.playAnimalSound(leadPet.soundType);
    triggerPetMove('spin', 700);

    if (!isFeverActive) {
      setFeverGauge((prev) => Math.min(100, prev + 10));
    }
  };

  // Toggle Sound Mute
  const handleToggleMute = () => {
    const nextMute = !isSoundMuted;
    setIsSoundMuted(nextMute);
    sound.setMuted(nextMute);
    setUserProgress((prev) => ({ ...prev, soundEnabled: !nextMute }));
  };

  // Next Level Handler
  const handleNextLevel = () => {
    const nextIdx = currentLevel.id; // next level index is id (since ids are 1-based)
    if (nextIdx < LEVELS_DATABASE.length) {
      const nextLvl = LEVELS_DATABASE[nextIdx];
      startLevel(nextLvl);
    } else {
      // Completed all levels! Loop or play Stage 1
      startLevel(LEVELS_DATABASE[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#4A443F] font-sans selection:bg-[#8B9D77] selection:text-white flex flex-col items-center justify-between p-3 sm:p-5 relative overflow-x-hidden">
      {/* APP HEADER */}
      <header className="w-full max-w-5xl flex items-center justify-between py-3 px-4 sm:px-6 mb-3 bg-white/80 backdrop-blur-md rounded-2xl border border-[#E6E0D4] shadow-sm">
        {/* Brand / Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#D2B48C] flex items-center justify-center shadow-sm text-white">
            <span className="text-xl">🐾</span>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-[#5D544C] flex items-center gap-2">
              <span>PET BOUNCE</span>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#8B9D77] bg-[#8B9D77]/15 border border-[#8B9D77]/30 px-2.5 py-0.5 rounded-full">
                Groove
              </span>
            </h1>
            <p className="text-[11px] font-semibold text-[#8E877F] hidden sm:block">
              Dance to the rhythm, bounce with animals & unlock new pets!
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Pet Troupe Button */}
          <button
            id="open-wardrobe-button"
            onClick={() => {
              if (isPlaying) stopGame();
              setIsPetWardrobeOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#F3EFE9] hover:bg-[#E6E0D4] border border-[#D9D1C3] text-xs font-bold text-[#5D544C] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Users className="w-4 h-4 text-[#8B9D77]" />
            <span className="hidden sm:inline">My Pets</span>
            <span className="bg-[#8B9D77]/20 text-[#5D544C] px-1.5 py-0.2 rounded-md text-[10px] font-black">
              {userProgress.unlockedPets.length}/{PETS_DATABASE.length}
            </span>
          </button>

          {/* All-Star Party Mode Button */}
          <button
            id="toggle-party-mode-button"
            onClick={() => {
              if (isPlaying) stopGame();
              setIsPartyModeActive(!isPartyModeActive);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border shadow-xs ${
              isPartyModeActive
                ? 'bg-[#8B9D77] text-white border-[#7A8C66] shadow-sm'
                : 'bg-[#F3EFE9] hover:bg-[#E6E0D4] text-[#5D544C] border-[#D9D1C3]'
            }`}
          >
            <Disc className="w-4 h-4 text-[#D27D56]" />
            <span className="hidden sm:inline">Pet Party DJ</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            id="sound-toggle-button"
            onClick={handleToggleMute}
            className="w-9 h-9 rounded-xl bg-[#F3EFE9] hover:bg-[#E6E0D4] border border-[#D9D1C3] text-[#5D544C] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            title={isSoundMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4 text-[#D27D56]" /> : <Volume2 className="w-4 h-4 text-[#8B9D77]" />}
          </button>

          {/* Help Button */}
          <button
            id="help-button"
            onClick={() => setShowHowToPlay(!showHowToPlay)}
            className="w-9 h-9 rounded-xl bg-[#F3EFE9] hover:bg-[#E6E0D4] border border-[#D9D1C3] text-[#5D544C] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
          >
            <HelpCircle className="w-4 h-4 text-[#7A6855]" />
          </button>
        </div>
      </header>

      {/* HOW TO PLAY ACCORDION / TOOLTIP */}
      <AnimatePresence>
        {showHowToPlay && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-5xl mb-3 bg-white border-2 border-[#E6E0D4] rounded-3xl p-5 text-xs text-[#4A443F] flex flex-col gap-2 overflow-hidden shadow-sm"
          >
            <div className="flex items-center justify-between font-bold text-[#5D544C] text-sm">
              <span className="flex items-center gap-1.5 font-black">
                <Sparkles className="w-4 h-4 text-[#D27D56]" /> How to Play
              </span>
              <button
                onClick={() => setShowHowToPlay(false)}
                className="text-[#8E877F] hover:text-[#5D544C] cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-[#E6E0D4]">
                <div className="font-bold text-[#8B9D77] mb-1 text-sm">1. Tap with Rhythm</div>
                <p className="text-[#6D655E] leading-relaxed">Click the 4 arrow buttons (or press Left/Down/Up/Right or D/F/J/K keys) when notes reach the target line!</p>
              </div>
              <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-[#E6E0D4]">
                <div className="font-bold text-[#D27D56] mb-1 text-sm">2. Pet Tap & Fever</div>
                <p className="text-[#6D655E] leading-relaxed">Click the dancing pet directly for bonus points! Fill the Fever Bar to trigger a 2X score explosion.</p>
              </div>
              <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-[#E6E0D4]">
                <div className="font-bold text-[#5D544C] mb-1 text-sm">3. Adopt New Pets</div>
                <p className="text-[#6D655E] leading-relaxed">Score stars to clear each stage and unlock adorable dancing animals (Bunny, Penguin, Shiba, and more!).</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN VIEW CONTENT */}
      <main className="w-full max-w-5xl flex-1 flex flex-col items-center justify-center">
        {isPartyModeActive ? (
          /* FREE PLAY PARTY / DJ MODE */
          <FreeDanceParty
            userProgress={userProgress}
            onBackToStages={() => setIsPartyModeActive(false)}
          />
        ) : (
          /* STANDARD RHYTHM STAGE MODE */
          <div className="w-full flex flex-col gap-3.5">
            {/* Top Stage Controls Bar */}
            <div className="w-full flex items-center justify-between gap-3 bg-white/90 border border-[#E6E0D4] rounded-2xl px-4 py-2.5 shadow-sm">
              {/* Current Stage Picker */}
              <button
                id="select-stage-button"
                onClick={() => {
                  if (isPlaying) stopGame();
                  setIsLevelSelectOpen(true);
                }}
                className="flex items-center gap-2.5 hover:opacity-85 transition-opacity cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-[#8B9D77]/20 border border-[#8B9D77]/40 flex items-center justify-center text-[#5D544C] font-black text-xs">
                  {currentLevel.id}
                </div>
                <div>
                  <div className="text-xs font-black text-[#5D544C] flex items-center gap-1">
                    <span>{currentLevel.title}</span>
                    <span className="text-[10px] text-[#8B9D77]">▼</span>
                  </div>
                  <div className="text-[10px] text-[#8E877F] font-semibold">
                    {currentLevel.stageName} • {currentLevel.difficulty}
                  </div>
                </div>
              </button>

              {/* Start / Pause / Replay Controls */}
              <div className="flex items-center gap-2">
                {!isPlaying ? (
                  <button
                    id="start-stage-button"
                    onClick={() => startLevel(currentLevel)}
                    className="px-5 py-2.5 rounded-2xl bg-[#D27D56] hover:bg-[#C16C45] text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Dancing!</span>
                  </button>
                ) : (
                  <>
                    <button
                      id="pause-stage-button"
                      onClick={() => {
                        if (isPaused) {
                          setIsPaused(false);
                          sound.startMusic(currentLevel.bpm, currentLevel.musicStyle, (s) => setBeatStep(s));
                        } else {
                          setIsPaused(true);
                          sound.stopMusic();
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#F3EFE9] hover:bg-[#E6E0D4] text-[#5D544C] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border border-[#D9D1C3]"
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5 fill-current text-[#8B9D77]" /> : <Pause className="w-3.5 h-3.5 fill-current text-[#D27D56]" />}
                      <span>{isPaused ? 'Resume' : 'Pause'}</span>
                    </button>

                    <button
                      id="restart-stage-button"
                      onClick={() => startLevel(currentLevel)}
                      className="w-8 h-8 rounded-xl bg-[#F3EFE9] hover:bg-[#E6E0D4] text-[#5D544C] flex items-center justify-center transition-colors cursor-pointer border border-[#D9D1C3]"
                      title="Restart Stage"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* DANCE STAGE (Visual Performance Canvas) */}
            <DanceStage
              level={currentLevel}
              leadPet={leadPet}
              backupPets={backupPets}
              userProgress={userProgress}
              score={score}
              combo={combo}
              feverGauge={feverGauge}
              isFeverActive={isFeverActive}
              timeLeft={timeLeft}
              danceMove={danceMove}
              beatStep={beatStep}
              onDirectPetClick={handleDirectPetClick}
              onFeverTrigger={triggerFever}
            />

            {/* RHYTHM TRACK (Interactive Beat Lanes) */}
            <div className="w-full">
              <RhythmTrack
                bpm={currentLevel.bpm}
                isPlaying={isPlaying && !isPaused}
                onHit={handleHit}
                onMiss={handleMiss}
                isFeverActive={isFeverActive}
                accentColor={currentLevel.accentColor}
                onPetDanceTrigger={() => triggerPetMove('groove', 400)}
              />
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-5xl py-3 mt-3 text-center text-xs text-[#8E877F] border-t border-[#E6E0D4] flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#8B9D77]"></span>
            Lead: <strong className="text-[#5D544C]">{leadPet.name} ({leadPet.species})</strong>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#D2B48C]"></span>
            Unlocked: <strong className="text-[#D27D56] font-bold">{userProgress.unlockedPets.length}/9</strong>
          </span>
        </div>
        <div className="text-[#8E877F] text-[11px] font-medium">
          Tap rhythm buttons or press keys <span className="font-mono bg-[#E6E0D4] px-1.5 py-0.5 rounded text-[#5D544C] font-bold">D</span> <span className="font-mono bg-[#E6E0D4] px-1.5 py-0.5 rounded text-[#5D544C] font-bold">F</span> <span className="font-mono bg-[#E6E0D4] px-1.5 py-0.5 rounded text-[#5D544C] font-bold">J</span> <span className="font-mono bg-[#E6E0D4] px-1.5 py-0.5 rounded text-[#5D544C] font-bold">K</span>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Level Complete Victory Modal */}
      <LevelCompleteModal
        isOpen={isLevelCompleteOpen}
        level={currentLevel}
        score={score}
        maxCombo={maxCombo}
        unlockedPet={newlyUnlockedPet}
        userProgress={userProgress}
        onNextLevel={handleNextLevel}
        onReplay={() => startLevel(currentLevel)}
        onSelectLeadPet={(petId) => {
          setUserProgress((prev) => ({ ...prev, activePetId: petId }));
          sound.playHitSound('PERFECT');
        }}
        onClose={() => setIsLevelCompleteOpen(false)}
      />

      {/* 2. Level Select Modal */}
      <LevelSelectModal
        isOpen={isLevelSelectOpen}
        levels={LEVELS_DATABASE}
        currentLevelId={currentLevel.id}
        userProgress={userProgress}
        onSelectLevel={(lvl) => startLevel(lvl)}
        onClose={() => setIsLevelSelectOpen(false)}
      />

      {/* 3. Pet Troupe & Wardrobe Modal */}
      <PetWardrobe
        isOpen={isPetWardrobeOpen}
        userProgress={userProgress}
        onSetLeadPet={(petId) => {
          setUserProgress((prev) => ({
            ...prev,
            activePetId: petId,
            backupPetIds: prev.backupPetIds.filter((id) => id !== petId),
          }));
          sound.playHitSound('PERFECT');
        }}
        onToggleBackupPet={(petId) => {
          setUserProgress((prev) => {
            const exists = prev.backupPetIds.includes(petId);
            const nextBackups = exists
              ? prev.backupPetIds.filter((id) => id !== petId)
              : [...prev.backupPetIds.slice(-1), petId]; // Max 2 backups
            return { ...prev, backupPetIds: nextBackups };
          });
          sound.playHitSound('GREAT');
        }}
        onEquipAccessory={(petId, accessoryId) => {
          setUserProgress((prev) => ({
            ...prev,
            equippedAccessories: {
              ...prev.equippedAccessories,
              [petId]: accessoryId,
            },
          }));
        }}
        onClose={() => setIsPetWardrobeOpen(false)}
      />
    </div>
  );
}
