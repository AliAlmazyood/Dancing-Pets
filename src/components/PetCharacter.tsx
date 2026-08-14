import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AccessoryId, DanceMove, Pet } from '../types';
import { sound } from '../utils/audio';

interface PetCharacterProps {
  pet: Pet;
  danceMove?: DanceMove;
  accessory?: AccessoryId;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onPetClick?: () => void;
  beatStep?: number;
  showShadow?: boolean;
  className?: string;
}

export const PetCharacter: React.FC<PetCharacterProps> = ({
  pet,
  danceMove = 'idle',
  accessory = 'none',
  size = 'lg',
  interactive = true,
  onPetClick,
  beatStep = 0,
  showShadow = true,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [clickSparks, setClickSparks] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-52 h-52',
    xl: 'w-64 h-64 sm:w-72 sm:h-72',
  };

  const handlePointerDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    sound.playAnimalSound(pet.soundType);

    // Sparkle particle at click point
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const sparkId = Date.now() + Math.random();
    setClickSparks((prev) => [...prev.slice(-4), { id: sparkId, x, y }]);
    setTimeout(() => {
      setClickSparks((prev) => prev.filter((s) => s.id !== sparkId));
    }, 600);

    if (onPetClick) {
      onPetClick();
    }
  };

  // Determine motion variants based on danceMove
  const isBouncingOnBeat = beatStep % 2 === 0;

  return (
    <div
      id={`pet-container-${pet.id}`}
      className={`relative inline-flex flex-col items-center justify-center select-none ${interactive ? 'cursor-pointer' : ''} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePointerDown}
    >
      {/* Click Particles (Hearts / Musical Notes / Stars) */}
      {clickSparks.map((spark) => (
        <motion.div
          key={spark.id}
          initial={{ opacity: 1, scale: 0.5, y: 0 }}
          animate={{ opacity: 0, scale: 1.6, y: -45 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="absolute z-30 pointer-events-none text-xl font-bold"
          style={{ left: spark.x, top: spark.y }}
        >
          {['✨', '💖', '🎵', '⭐', '🎶'][Math.floor(Math.random() * 5)]}
        </motion.div>
      ))}

      {/* Main Animated Wrapper */}
      <motion.div
        animate={
          danceMove === 'spin'
            ? { rotate: [0, 360], scale: [1, 1.15, 1], y: [0, -25, 0] }
            : danceMove === 'hop'
            ? { y: [0, -32, 0], scaleX: [1.1, 0.92, 1.1], scaleY: [0.9, 1.15, 0.9], rotate: [-4, 4, -4] }
            : danceMove === 'wiggle'
            ? { rotate: [-12, 12, -12, 12, 0], x: [-6, 6, -6, 6, 0] }
            : danceMove === 'flip'
            ? { rotate: [0, -180, -360], y: [0, -50, 0], scale: [1, 1.2, 1] }
            : danceMove === 'fever'
            ? {
                y: [-12, 4, -12],
                rotate: [-8, 8, -8],
                scale: [1.05, 1.18, 1.05],
              }
            : danceMove === 'victory'
            ? { y: [0, -24, 0], scale: [1, 1.12, 1], rotate: [-6, 6, -6] }
            : danceMove === 'miss'
            ? { y: [0, 6, 0], rotate: [-8, 4, 0], scaleX: 1.08, scaleY: 0.92 }
            : danceMove === 'groove'
            ? {
                y: isBouncingOnBeat ? -12 : 2,
                rotate: isBouncingOnBeat ? -6 : 6,
                scaleX: isBouncingOnBeat ? 0.96 : 1.04,
                scaleY: isBouncingOnBeat ? 1.04 : 0.96,
              }
            : {
                // Idle breathing
                y: isHovered ? -8 : [0, -4, 0],
                scale: isHovered ? 1.06 : [1, 1.02, 1],
              }
        }
        transition={{
          repeat: danceMove === 'spin' || danceMove === 'flip' ? 0 : Infinity,
          duration: danceMove === 'fever' ? 0.35 : danceMove === 'groove' ? 0.5 : 1.4,
          ease: 'easeInOut',
        }}
        className={`relative ${sizeClasses[size]} flex items-center justify-center`}
      >
        {/* Fever Aura Halo */}
        {danceMove === 'fever' && (
          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.85, 0.4], rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="absolute inset-[-15%] rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-400 blur-md pointer-events-none -z-10"
          />
        )}

        {/* SVG Animal Character */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-md overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <radialGradient id={`bodyGrad-${pet.id}`} cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor={pet.avatarColor} />
              <stop offset="100%" stopColor={pet.secondaryColor} />
            </radialGradient>

            <linearGradient id={`goldGrad`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>

            <linearGradient id={`rainbowMane`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F472B6" />
              <stop offset="33%" stopColor="#FBBF24" />
              <stop offset="66%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
          </defs>

          {/* TAILS (Species Specific) */}
          {pet.id === 'cat_kiki' && (
            <motion.path
              animate={{ rotate: [-15, 20, -15] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              style={{ transformOrigin: '150px 145px' }}
              d="M 150 145 Q 185 130 180 95 Q 175 80 165 85 Q 158 90 162 105 Q 165 125 145 135 Z"
              fill={pet.secondaryColor}
            />
          )}
          {pet.id === 'dog_mochi' && (
            <motion.path
              animate={{ rotate: [-20, 25, -20] }}
              transition={{ repeat: Infinity, duration: 0.4 }}
              style={{ transformOrigin: '150px 135px' }}
              d="M 148 135 C 175 120 185 85 160 85 C 145 85 145 105 152 115 Z"
              fill={pet.secondaryColor}
            />
          )}
          {pet.id === 'bunny_barnaby' && (
            <circle cx="152" cy="142" r="14" fill="#FFFFFF" />
          )}
          {pet.id === 'fox_faye' && (
            <motion.path
              animate={{ rotate: [-10, 15, -10] }}
              transition={{ repeat: Infinity, duration: 0.9 }}
              style={{ transformOrigin: '145px 140px' }}
              d="M 145 140 C 185 140 215 100 195 70 C 180 50 160 80 150 110 Z"
              fill={pet.avatarColor}
            />
          )}
          {pet.id === 'unicorn_sparky' && (
            <motion.path
              animate={{ rotate: [-12, 12, -12] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              style={{ transformOrigin: '145px 140px' }}
              d="M 145 135 C 180 135 200 110 185 80 C 170 60 155 90 145 110 Z"
              fill="url(#rainbowMane)"
            />
          )}

          {/* MAIN BODY / TORSO */}
          <ellipse
            cx="100"
            cy="125"
            rx="56"
            ry="48"
            fill={`url(#bodyGrad-${pet.id})`}
          />

          {/* PENGUIN / FROG / UNICORN SPECIAL TORSO DETAILS */}
          {pet.id === 'penguin_pip' && (
            <>
              {/* White Belly */}
              <ellipse cx="100" cy="128" rx="40" ry="40" fill="#FFFFFF" />
            </>
          )}

          {/* GENERIC BELLY PATCH */}
          {pet.id !== 'penguin_pip' && (
            <ellipse
              cx="100"
              cy="132"
              rx="38"
              ry="32"
              fill={pet.bellyColor}
              opacity="0.95"
            />
          )}

          {/* PANDA BLACK CHEST SASH & ARMS */}
          {pet.id === 'panda_bao' && (
            <path
              d="M 50 115 Q 100 135 150 115 Q 155 140 145 150 Q 100 165 55 150 Z"
              fill="#0F172A"
              opacity="0.9"
            />
          )}

          {/* HEAD */}
          <circle
            cx="100"
            cy="78"
            r="44"
            fill={`url(#bodyGrad-${pet.id})`}
          />

          {/* EARS & HEAD FEATURES */}
          {/* CAT EARS */}
          {pet.id === 'cat_kiki' && (
            <g>
              <path d="M 64 60 L 52 24 L 84 46 Z" fill={pet.avatarColor} />
              <path d="M 66 54 L 58 32 L 80 46 Z" fill="#F43F5E" />
              <path d="M 136 60 L 148 24 L 116 46 Z" fill={pet.avatarColor} />
              <path d="M 134 54 L 142 32 L 120 46 Z" fill="#F43F5E" />
            </g>
          )}

          {/* BUNNY EARS */}
          {pet.id === 'bunny_barnaby' && (
            <g>
              <motion.g
                animate={{ rotate: [-6, 6, -6] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                style={{ transformOrigin: '75px 45px' }}
              >
                <ellipse cx="72" cy="22" rx="12" ry="32" fill={pet.avatarColor} />
                <ellipse cx="72" cy="22" rx="7" ry="24" fill="#FDF2F8" />
              </motion.g>
              <motion.g
                animate={{ rotate: [6, -6, 6] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                style={{ transformOrigin: '125px 45px' }}
              >
                <ellipse cx="128" cy="22" rx="12" ry="32" fill={pet.avatarColor} />
                <ellipse cx="128" cy="22" rx="7" ry="24" fill="#FDF2F8" />
              </motion.g>
            </g>
          )}

          {/* SHIBA DOG EARS */}
          {pet.id === 'dog_mochi' && (
            <g>
              <path d="M 66 55 L 56 22 L 86 42 Z" fill={pet.avatarColor} />
              <path d="M 68 50 L 62 30 L 82 42 Z" fill="#FEF3C7" />
              <path d="M 134 55 L 144 22 L 114 42 Z" fill={pet.avatarColor} />
              <path d="M 132 50 L 138 30 L 118 42 Z" fill="#FEF3C7" />
            </g>
          )}

          {/* PANDA EARS & EYE PATCHES */}
          {pet.id === 'panda_bao' && (
            <g>
              <circle cx="64" cy="45" r="16" fill="#0F172A" />
              <circle cx="136" cy="45" r="16" fill="#0F172A" />
              {/* Panda Eye Patches */}
              <ellipse cx="80" cy="76" rx="13" ry="11" fill="#0F172A" transform="rotate(-15 80 76)" />
              <ellipse cx="120" cy="76" rx="13" ry="11" fill="#0F172A" transform="rotate(15 120 76)" />
            </g>
          )}

          {/* FOX EARS */}
          {pet.id === 'fox_faye' && (
            <g>
              <path d="M 62 60 L 50 18 L 86 44 Z" fill={pet.avatarColor} />
              <path d="M 65 52 L 56 28 L 82 44 Z" fill="#FFFFFF" />
              <path d="M 138 60 L 150 18 L 114 44 Z" fill={pet.avatarColor} />
              <path d="M 135 52 L 144 28 L 118 44 Z" fill="#FFFFFF" />
            </g>
          )}

          {/* FROG BULBOUS EYES */}
          {pet.id === 'frog_frodo' && (
            <g>
              <circle cx="70" cy="44" r="18" fill={pet.avatarColor} />
              <circle cx="130" cy="44" r="18" fill={pet.avatarColor} />
              <circle cx="70" cy="44" r="12" fill="#FFFFFF" />
              <circle cx="130" cy="44" r="12" fill="#FFFFFF" />
              <circle cx="70" cy="44" r="6" fill="#0F172A" />
              <circle cx="130" cy="44" r="6" fill="#0F172A" />
              <circle cx="73" cy="41" r="2.5" fill="#FFFFFF" />
              <circle cx="133" cy="41" r="2.5" fill="#FFFFFF" />
            </g>
          )}

          {/* BEAR ROUND EARS */}
          {pet.id === 'bear_koda' && (
            <g>
              <circle cx="64" cy="46" r="15" fill={pet.avatarColor} />
              <circle cx="64" cy="46" r="9" fill={pet.secondaryColor} />
              <circle cx="136" cy="46" r="15" fill={pet.avatarColor} />
              <circle cx="136" cy="46" r="9" fill={pet.secondaryColor} />
            </g>
          )}

          {/* UNICORN HORN & MANE */}
          {pet.id === 'unicorn_sparky' && (
            <g>
              {/* Rainbow Mane */}
              <path
                d="M 62 48 Q 50 65 54 85 Q 46 80 50 60 Z"
                fill="url(#rainbowMane)"
              />
              <path
                d="M 138 48 Q 150 65 146 85 Q 154 80 150 60 Z"
                fill="url(#rainbowMane)"
              />
              {/* Glowing Golden Horn */}
              <polygon points="100,10 92,44 108,44" fill="url(#goldGrad)" />
              <line x1="94" y1="36" x2="106" y2="34" stroke="#CA8A04" strokeWidth="1.5" />
              <line x1="96" y1="24" x2="104" y2="22" stroke="#CA8A04" strokeWidth="1.5" />
            </g>
          )}

          {/* PENGUIN HEAD TUXEDO */}
          {pet.id === 'penguin_pip' && (
            <g>
              <circle cx="70" cy="48" r="8" fill={pet.secondaryColor} />
              <circle cx="130" cy="48" r="8" fill={pet.secondaryColor} />
            </g>
          )}

          {/* FACE ELEMENTS (Eyes, Cheeks, Mouth) */}
          {pet.id !== 'frog_frodo' && (
            <g>
              {/* EYES */}
              {danceMove === 'victory' ? (
                // Heart Eyes
                <g fill="#F43F5E">
                  <path d="M 76 72 A 4 4 0 0 0 80 66 A 4 4 0 0 0 84 72 L 80 77 Z" />
                  <path d="M 116 72 A 4 4 0 0 0 120 66 A 4 4 0 0 0 124 72 L 120 77 Z" />
                </g>
              ) : danceMove === 'miss' ? (
                // Squinty / Dizzy Eyes (><)
                <g stroke="#1E293B" strokeWidth="3" strokeLinecap="round">
                  <line x1="74" y1="72" x2="84" y2="78" />
                  <line x1="74" y1="78" x2="84" y2="72" />
                  <line x1="116" y1="72" x2="126" y2="78" />
                  <line x1="116" y1="78" x2="126" y2="72" />
                </g>
              ) : danceMove === 'fever' ? (
                // Star Eyes
                <g fill="#EAB308">
                  <polygon points="80,68 82,74 88,74 83,77 85,83 80,79 75,83 77,77 72,74 78,74" />
                  <polygon points="120,68 122,74 128,74 123,77 125,83 120,79 115,83 117,77 112,74 118,74" />
                </g>
              ) : (
                // Normal Cute Big Eyes
                <g>
                  <ellipse cx="80" cy="75" rx="7" ry="8" fill="#0F172A" />
                  <ellipse cx="120" cy="75" rx="7" ry="8" fill="#0F172A" />
                  {/* Eye Highlights */}
                  <circle cx="78" cy="72" r="2.8" fill="#FFFFFF" />
                  <circle cx="82" cy="77" r="1.4" fill="#FFFFFF" />
                  <circle cx="118" cy="72" r="2.8" fill="#FFFFFF" />
                  <circle cx="122" cy="77" r="1.4" fill="#FFFFFF" />
                </g>
              )}
            </g>
          )}

          {/* ROSY CHEEKS */}
          <ellipse cx="68" cy="85" rx="7" ry="4" fill="#F43F5E" opacity="0.45" />
          <ellipse cx="132" cy="85" rx="7" ry="4" fill="#F43F5E" opacity="0.45" />

          {/* SNOUT & NOSE & MOUTH */}
          {pet.id === 'penguin_pip' ? (
            // Penguin Beak
            <polygon points="90,82 110,82 100,94" fill="#F97316" />
          ) : pet.id === 'cat_kiki' ? (
            // Cat Snout + Whiskers
            <g>
              <polygon points="96,82 104,82 100,86" fill="#F43F5E" />
              <path d="M 100 86 Q 95 92 90 89 M 100 86 Q 105 92 110 89" stroke="#0F172A" strokeWidth="2" fill="none" />
              {/* Whiskers */}
              <line x1="56" y1="82" x2="70" y2="84" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="56" y1="89" x2="70" y2="88" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="144" y1="82" x2="130" y2="84" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="144" y1="89" x2="130" y2="88" stroke="#0F172A" strokeWidth="1.8" strokeLinecap="round" />
            </g>
          ) : pet.id === 'dog_mochi' ? (
            // Shiba Muzzle
            <g>
              <ellipse cx="100" cy="87" rx="16" ry="11" fill="#FEF3C7" />
              <ellipse cx="100" cy="83" rx="5" ry="3.5" fill="#0F172A" />
              <path d="M 100 86.5 Q 96 92 92 90 M 100 86.5 Q 104 92 108 90" stroke="#0F172A" strokeWidth="2" fill="none" />
              {/* Tongue if dancing */}
              {danceMove !== 'idle' && (
                <ellipse cx="100" cy="94" rx="4" ry="5" fill="#F43F5E" />
              )}
            </g>
          ) : pet.id === 'frog_frodo' ? (
            // Frog Wide Smile
            <g>
              <circle cx="96" cy="80" r="1.5" fill="#0F172A" />
              <circle cx="104" cy="80" r="1.5" fill="#0F172A" />
              <path d="M 82 86 Q 100 100 118 86" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            // Generic cute nose & mouth (Bunny, Panda, Bear, Fox, Unicorn)
            <g>
              <ellipse cx="100" cy="84" rx="4.5" ry="3.5" fill="#0F172A" />
              <path d="M 100 87.5 Q 96 92 92 90 M 100 87.5 Q 104 92 108 90" stroke="#0F172A" strokeWidth="2" fill="none" />
            </g>
          )}

          {/* DANCING ARMS / FLIPPERS / PAWS */}
          {pet.id === 'penguin_pip' ? (
            // Penguin Flippers
            <g>
              <motion.path
                animate={{ rotate: [-20, 30, -20] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                style={{ transformOrigin: '55px 120px' }}
                d="M 55 120 Q 25 130 30 150 Q 45 155 58 135 Z"
                fill={pet.secondaryColor}
              />
              <motion.path
                animate={{ rotate: [20, -30, 20] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                style={{ transformOrigin: '145px 120px' }}
                d="M 145 120 Q 175 130 170 150 Q 155 155 142 135 Z"
                fill={pet.secondaryColor}
              />
            </g>
          ) : (
            // General Paws / Arms
            <g>
              <motion.ellipse
                animate={
                  danceMove === 'victory' || danceMove === 'fever'
                    ? { y: [-15, -25, -15], rotate: [-25, -45, -25] }
                    : { rotate: [-15, 20, -15] }
                }
                transition={{ repeat: Infinity, duration: 0.5 }}
                style={{ transformOrigin: '60px 120px' }}
                cx="52"
                cy={danceMove === 'victory' || danceMove === 'fever' ? 100 : 125}
                rx="14"
                ry="12"
                fill={pet.avatarColor}
              />
              <motion.ellipse
                animate={
                  danceMove === 'victory' || danceMove === 'fever'
                    ? { y: [-15, -25, -15], rotate: [25, 45, 25] }
                    : { rotate: [15, -20, 15] }
                }
                transition={{ repeat: Infinity, duration: 0.5 }}
                style={{ transformOrigin: '140px 120px' }}
                cx="148"
                cy={danceMove === 'victory' || danceMove === 'fever' ? 100 : 125}
                rx="14"
                ry="12"
                fill={pet.avatarColor}
              />
            </g>
          )}

          {/* FEET / LEGS */}
          <ellipse cx="78" cy="168" rx="16" ry="11" fill={pet.id === 'penguin_pip' ? '#F97316' : pet.secondaryColor} />
          <ellipse cx="122" cy="168" rx="16" ry="11" fill={pet.id === 'penguin_pip' ? '#F97316' : pet.secondaryColor} />

          {/* ACCESSORY RENDERING */}
          {accessory === 'sunglasses' && (
            <g>
              {/* Cool Dark Sunglasses */}
              <rect x="62" y="66" width="34" height="20" rx="6" fill="#0F172A" />
              <rect x="104" y="66" width="34" height="20" rx="6" fill="#0F172A" />
              <line x1="96" y1="73" x2="104" y2="73" stroke="#0F172A" strokeWidth="4" />
              {/* Gloss shine */}
              <line x1="68" y1="70" x2="88" y2="70" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              <line x1="110" y1="70" x2="130" y2="70" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            </g>
          )}

          {accessory === 'disco_glasses' && (
            <g>
              {/* Star Neon Visor */}
              <polygon points="78,62 82,72 92,72 84,78 87,88 78,82 69,88 72,78 64,72 74,72" fill="#EAB308" />
              <polygon points="122,62 126,72 136,72 128,78 131,88 122,82 113,88 116,78 108,72 118,72" fill="#EAB308" />
              <line x1="88" y1="74" x2="112" y2="74" stroke="#F59E0B" strokeWidth="3" />
            </g>
          )}

          {accessory === 'party_hat' && (
            <g>
              <polygon points="100,18 80,52 120,52" fill="#EC4899" />
              {/* Stripes */}
              <line x1="86" y1="42" x2="114" y2="42" stroke="#FBBF24" strokeWidth="4" />
              <line x1="92" y1="30" x2="108" y2="30" stroke="#38BDF8" strokeWidth="3" />
              {/* Pom-pom */}
              <circle cx="100" cy="16" r="6" fill="#FBBF24" />
            </g>
          )}

          {accessory === 'headphones' && (
            <g>
              {/* Over-ear band */}
              <path d="M 52 74 A 50 50 0 0 1 148 74" fill="none" stroke="#6366F1" strokeWidth="7" strokeLinecap="round" />
              {/* Earcups with LEDs */}
              <rect x="44" y="64" width="16" height="26" rx="8" fill="#4F46E5" />
              <circle cx="52" cy="77" r="5" fill="#38BDF8" />
              <rect x="140" y="64" width="16" height="26" rx="8" fill="#4F46E5" />
              <circle cx="148" cy="77" r="5" fill="#38BDF8" />
            </g>
          )}

          {accessory === 'crown' && (
            <g>
              <polygon points="76,46 82,24 92,36 100,20 108,36 118,24 124,46" fill="url(#goldGrad)" stroke="#CA8A04" strokeWidth="1" />
              <circle cx="100" cy="22" r="3.5" fill="#EF4444" />
              <circle cx="82" cy="26" r="3" fill="#3B82F6" />
              <circle cx="118" cy="26" r="3" fill="#10B981" />
            </g>
          )}

          {accessory === 'bow_tie' && (
            <g>
              <polygon points="90,116 100,121 90,126" fill="#EF4444" />
              <polygon points="110,116 100,121 110,126" fill="#EF4444" />
              <circle cx="100" cy="121" r="3.5" fill="#DC2626" />
            </g>
          )}

          {accessory === 'flower' && (
            <g>
              <circle cx="132" cy="46" r="6" fill="#F472B6" />
              <circle cx="140" cy="40" r="6" fill="#F472B6" />
              <circle cx="144" cy="50" r="6" fill="#F472B6" />
              <circle cx="138" cy="58" r="6" fill="#F472B6" />
              <circle cx="128" cy="54" r="6" fill="#F472B6" />
              <circle cx="136" cy="49" r="4.5" fill="#FBBF24" />
            </g>
          )}
        </svg>
      </motion.div>

      {/* Stage Shadow */}
      {showShadow && (
        <motion.div
          animate={
            danceMove === 'hop' || danceMove === 'spin' || danceMove === 'flip'
              ? { scaleX: [0.6, 1.2, 0.6], opacity: [0.2, 0.5, 0.2] }
              : { scaleX: [0.9, 1.1, 0.9], opacity: [0.35, 0.5, 0.35] }
          }
          transition={{ repeat: Infinity, duration: 0.6 }}
          className="w-28 h-4 bg-black/40 rounded-full blur-xs -mt-2 pointer-events-none"
        />
      )}
    </div>
  );
};
