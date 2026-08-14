import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DanceMove, Pet, UserProgress } from '../types';
import { PETS_DATABASE } from '../data/pets';
import { PetCharacter } from './PetCharacter';
import { sound } from '../utils/audio';
import { Disc, Music, Sliders, Volume2, Sparkles, Zap, ArrowLeft, Play, Pause } from 'lucide-react';

interface FreeDancePartyProps {
  userProgress: UserProgress;
  onBackToStages: () => void;
}

export const FreeDanceParty: React.FC<FreeDancePartyProps> = ({
  userProgress,
  onBackToStages,
}) => {
  const [bpm, setBpm] = useState<number>(120);
  const [musicStyle, setMusicStyle] = useState<string>('funky_pop');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [beatStep, setBeatStep] = useState<number>(0);
  const [groupMove, setGroupMove] = useState<DanceMove>('groove');
  const [soloPetId, setSoloPetId] = useState<string | null>(null);

  const unlockedPets = PETS_DATABASE.filter((p) => userProgress.unlockedPets.includes(p.id));

  // Music loop
  useEffect(() => {
    if (isPlaying) {
      sound.startMusic(bpm, musicStyle, (step) => {
        setBeatStep(step);
      });
    } else {
      sound.stopMusic();
    }

    return () => {
      sound.stopMusic();
    };
  }, [isPlaying, bpm, musicStyle]);

  const triggerGroupMove = (move: DanceMove) => {
    setGroupMove(move);
    if (move === 'spin') {
      sound.playHitSound('PERFECT');
    } else if (move === 'fever') {
      sound.playFeverFanfare();
    } else if (move === 'hop') {
      sound.playHitSound('GREAT');
    }

    if (move === 'spin' || move === 'flip') {
      setTimeout(() => {
        setGroupMove('groove');
      }, 1000);
    }
  };

  const handlePetSolo = (pet: Pet) => {
    setSoloPetId(pet.id);
    sound.playAnimalSound(pet.soundType);
    setTimeout(() => {
      setSoloPetId(null);
    }, 1200);
  };

  return (
    <div id="free-dance-party" className="w-full max-w-5xl mx-auto flex flex-col gap-4 text-[#4A443F]">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          id="party-back-button"
          onClick={onBackToStages}
          className="px-4 py-2 rounded-2xl bg-[#FAF9F6] hover:bg-[#F3EFE9] text-[#5D544C] font-bold text-xs flex items-center gap-2 border border-[#D9D1C3] transition-colors cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Stage Campaign</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-[#8B9D77]/15 border border-[#8B9D77]/30 text-[#5D544C] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#8B9D77]" />
            Pet Party Club
          </div>
          <button
            id="party-play-pause"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs ${
              isPlaying ? 'bg-[#D27D56] text-white hover:bg-[#C16C45]' : 'bg-[#F3EFE9] text-[#5D544C] border border-[#D9D1C3] hover:bg-[#E6E0D4]'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isPlaying ? 'Pause DJ' : 'Play DJ'}
          </button>
        </div>
      </div>

      {/* Main Party Stage Area */}
      <div className="relative rounded-[32px] bg-[#FAF9F6] border-2 border-[#E6E0D4] p-6 min-h-[380px] shadow-lg overflow-hidden flex flex-col justify-between">
        {/* Animated Club Lights */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-[conic-gradient(from_0deg,_#D2B48C,_#8B9D77,_#D27D56,_#E6E0D4,_#D2B48C)] opacity-30 blur-3xl"
          />
        </div>

        {/* Disco Ball Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-[#E6E0D4] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#8B9D77]/20 flex items-center justify-center text-[#8B9D77]">
              <Disc className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#5D544C]">All-Star Dance Troupe</h2>
              <p className="text-[11px] text-[#8E877F] font-semibold">
                Tap any animal dancer to trigger signature solo moves!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#5D544C] bg-white px-3 py-1 rounded-full border border-[#E6E0D4] shadow-xs">
              {bpm} BPM
            </span>
          </div>
        </div>

        {/* Dancing Pets Flock / Stage Grid */}
        <div className="relative z-10 my-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {unlockedPets.map((pet) => {
            const isSolo = soloPetId === pet.id;
            const currentMove = isSolo ? 'spin' : groupMove;

            return (
              <motion.div
                key={pet.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handlePetSolo(pet)}
                className="flex flex-col items-center cursor-pointer"
              >
                <div className="text-[10px] font-bold text-[#5D544C] bg-white px-2.5 py-0.5 rounded-full mb-1 border border-[#E6E0D4] shadow-xs">
                  {pet.name}
                </div>
                <PetCharacter
                  pet={pet}
                  danceMove={currentMove}
                  accessory={userProgress.equippedAccessories[pet.id] || pet.defaultAccessory}
                  size="md"
                  interactive={false}
                  beatStep={beatStep}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Illuminated Dance Floor Tiles */}
        <div className="relative z-10 w-full grid grid-cols-8 sm:grid-cols-12 gap-1.5 py-2">
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                backgroundColor: (beatStep + i) % 4 === 0 ? '#8B9D77' : '#E6E0D4',
                opacity: (beatStep + i) % 4 === 0 ? 0.9 : 0.4,
              }}
              transition={{ duration: 0.15 }}
              className="h-3 rounded-md border border-[#D9D1C3]"
            />
          ))}
        </div>
      </div>

      {/* DJ CONTROLS & SOUNDBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* DJ Beats & Group Moves */}
        <div className="md:col-span-7 bg-white border-2 border-[#E6E0D4] rounded-3xl p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#5D544C] flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#8B9D77]" />
              Group Dance Choreography
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Groove Bounce', move: 'groove' as DanceMove, icon: '🎵' },
              { label: 'High Hop', move: 'hop' as DanceMove, icon: '🐰' },
              { label: 'Disco Spin', move: 'spin' as DanceMove, icon: '💫' },
              { label: 'Fever Rave', move: 'fever' as DanceMove, icon: '🔥' },
            ].map((btn) => (
              <button
                key={btn.move}
                id={`group-move-${btn.move}`}
                onClick={() => triggerGroupMove(btn.move)}
                className={`py-3 px-2 rounded-2xl border-2 text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  groupMove === btn.move
                    ? 'bg-[#8B9D77] text-white border-[#8B9D77] shadow-sm scale-105'
                    : 'bg-[#FAF9F6] border-[#E6E0D4] text-[#5D544C] hover:bg-white'
                }`}
              >
                <span className="text-xl">{btn.icon}</span>
                <span>{btn.label}</span>
              </button>
            ))}
          </div>

          {/* Music Tempo / BPM Slider */}
          <div className="mt-2 pt-3 border-t border-[#E6E0D4] flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-bold text-[#5D544C]">
              <span>DJ Tempo (BPM)</span>
              <span className="text-[#8B9D77]">{bpm} BPM</span>
            </div>
            <input
              id="bpm-slider"
              type="range"
              min="90"
              max="160"
              step="5"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-full h-2 bg-[#E6E0D4] rounded-lg appearance-none cursor-pointer accent-[#8B9D77]"
            />
          </div>

          {/* Genre Selection */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[#5D544C]">Music Genre Track</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'funky_pop', name: 'Funky Pop' },
                { id: 'neon_disco', name: 'Neon Disco' },
                { id: 'beach_calypso', name: 'Beach Calypso' },
                { id: 'sakura_chill', name: 'Sakura Chill' },
                { id: 'bamboo_groove', name: 'Bamboo Groove' },
                { id: 'cosmic_synth', name: 'Cosmic Synth' },
                { id: 'cyber_arcade', name: 'Cyber Arcade' },
              ].map((style) => (
                <button
                  key={style.id}
                  id={`style-btn-${style.id}`}
                  onClick={() => setMusicStyle(style.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                    musicStyle === style.id
                      ? 'bg-[#D27D56] text-white border-[#D27D56] shadow-xs'
                      : 'bg-[#FAF9F6] text-[#6D655E] border-[#E6E0D4] hover:bg-white'
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* DJ SFX Beat Pads */}
        <div className="md:col-span-5 bg-white border-2 border-[#E6E0D4] rounded-3xl p-5 shadow-sm flex flex-col gap-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#5D544C] flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-[#D27D56]" />
            DJ Live Beat Pads
          </h3>

          <div className="grid grid-cols-2 gap-2.5 flex-1">
            <button
              id="dj-pad-kick"
              onClick={() => sound.playKick()}
              className="py-4 rounded-2xl bg-[#D27D56]/15 hover:bg-[#D27D56]/25 active:scale-95 border border-[#D27D56]/40 text-[#D27D56] font-bold text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
            >
              <span className="text-xl">🥁</span>
              <span>Kick Drum</span>
            </button>
            <button
              id="dj-pad-snare"
              onClick={() => sound.playSnare()}
              className="py-4 rounded-2xl bg-[#D2B48C]/30 hover:bg-[#D2B48C]/45 active:scale-95 border border-[#D2B48C] text-[#5D544C] font-bold text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
            >
              <span className="text-xl">👏</span>
              <span>Snare Clap</span>
            </button>
            <button
              id="dj-pad-hihat"
              onClick={() => sound.playHiHat(undefined, true)}
              className="py-4 rounded-2xl bg-[#8B9D77]/15 hover:bg-[#8B9D77]/25 active:scale-95 border border-[#8B9D77]/40 text-[#5D544C] font-bold text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
            >
              <span className="text-xl">🔔</span>
              <span>Open Hat</span>
            </button>
            <button
              id="dj-pad-fever"
              onClick={() => sound.playFeverFanfare()}
              className="py-4 rounded-2xl bg-[#8B9D77]/30 hover:bg-[#8B9D77]/45 active:scale-95 border border-[#8B9D77] text-[#5D544C] font-bold text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
            >
              <span className="text-xl">✨</span>
              <span>Starlight Chime</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
