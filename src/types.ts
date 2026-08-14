export type DanceMove = 'idle' | 'groove' | 'hop' | 'spin' | 'wiggle' | 'flip' | 'fever' | 'victory' | 'miss';

export type AccessoryId = 'none' | 'sunglasses' | 'party_hat' | 'headphones' | 'crown' | 'bow_tie' | 'flower' | 'disco_glasses';

export interface PetAccessory {
  id: AccessoryId;
  name: string;
  emoji: string;
  icon: string;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  title: string;
  description: string;
  avatarColor: string;
  secondaryColor: string;
  bellyColor: string;
  accentColor: string;
  signatureMove: string;
  unlockLevel: number; // 0 means unlocked by default
  soundType: 'meow' | 'bark' | 'squeak' | 'quack' | 'ribbit' | 'growl' | 'chirp' | 'sparkle';
  personality: string;
  favoriteBeat: string;
  defaultAccessory?: AccessoryId;
}

export interface BeatNote {
  id: string;
  time: number; // in seconds relative to song start
  lane: number; // 0, 1, 2, 3 or target angle
  type: 'tap' | 'hold' | 'star';
  duration?: number;
  hit?: boolean;
  missed?: boolean;
}

export interface Level {
  id: number;
  title: string;
  stageName: string;
  theme: string;
  bgGradient: string;
  floorColor: string;
  accentColor: string;
  bpm: number;
  duration: number; // in seconds (e.g. 30-45s)
  targetScore: number;
  unlocksPetId: string;
  difficulty: 'Easy' | 'Medium' | 'Groovy' | 'Master';
  description: string;
  musicStyle: 'funky_pop' | 'beach_calypso' | 'neon_disco' | 'sakura_chill' | 'bamboo_groove' | 'cosmic_synth' | 'carnival_bounce' | 'cyber_arcade';
}

export type HitRating = 'PERFECT' | 'GREAT' | 'GOOD' | 'MISS';

export interface HitFeedback {
  id: string;
  rating: HitRating;
  points: number;
  combo: number;
  x: number;
  y: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  combo: number;
  maxCombo: number;
  perfectHits: number;
  greatHits: number;
  goodHits: number;
  misses: number;
  feverGauge: number; // 0 to 100
  isFeverActive: boolean;
}

export interface UserProgress {
  unlockedPets: string[];
  equippedAccessories: Record<string, AccessoryId>;
  activePetId: string;
  backupPetIds: string[];
  levelScores: Record<number, { score: number; stars: number }>;
  totalDances: number;
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
}
