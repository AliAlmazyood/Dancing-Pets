import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BeatNote, HitFeedback, HitRating } from '../types';
import { sound } from '../utils/audio';
import { ArrowLeft, ArrowDown, ArrowUp, ArrowRight, Sparkles, Zap } from 'lucide-react';

interface RhythmTrackProps {
  bpm: number;
  isPlaying: boolean;
  onHit: (rating: HitRating, points: number) => void;
  onMiss: () => void;
  isFeverActive: boolean;
  accentColor?: string;
  onPetDanceTrigger: () => void;
}

const LANES = [
  { id: 0, label: 'LEFT', key: 'ArrowLeft', altKey: 'd', icon: ArrowLeft, color: 'text-[#8B9D77]', bg: 'bg-[#8B9D77]/10', border: 'border-[#8B9D77]/40' },
  { id: 1, label: 'DOWN', key: 'ArrowDown', altKey: 'f', icon: ArrowDown, color: 'text-[#D27D56]', bg: 'bg-[#D27D56]/10', border: 'border-[#D27D56]/40' },
  { id: 2, label: 'UP', key: 'ArrowUp', altKey: 'j', icon: ArrowUp, color: 'text-[#7A6855]', bg: 'bg-[#D2B48C]/20', border: 'border-[#D2B48C]' },
  { id: 3, label: 'RIGHT', key: 'ArrowRight', altKey: 'k', icon: ArrowRight, color: 'text-[#5D544C]', bg: 'bg-[#5D544C]/10', border: 'border-[#5D544C]/30' },
];

export const RhythmTrack: React.FC<RhythmTrackProps> = ({
  bpm,
  isPlaying,
  onHit,
  onMiss,
  isFeverActive,
  accentColor = '#FB923C',
  onPetDanceTrigger,
}) => {
  const [notes, setNotes] = useState<BeatNote[]>([]);
  const [feedbacks, setFeedbacks] = useState<HitFeedback[]>([]);
  const [activeLanes, setActiveLanes] = useState<Record<number, boolean>>({});
  const animationFrameRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const noteIdCounter = useRef<number>(0);

  // Speed of falling notes (seconds to travel the track)
  const travelDuration = 1.8; // 1.8 seconds from spawn to hit line

  // Spawn notes synchronized with BPM
  useEffect(() => {
    if (!isPlaying) {
      setNotes([]);
      return;
    }

    startTimeRef.current = performance.now();
    nextNoteTimeRef.current = 0.5; // initial lead time

    const beatInterval = 60 / bpm; // in seconds

    const generateNotesLoop = () => {
      const now = (performance.now() - startTimeRef.current) / 1000;

      // Schedule notes ahead
      while (nextNoteTimeRef.current < now + 2.5) {
        const lane = Math.floor(Math.random() * 4);
        const isStar = Math.random() < 0.25;

        setNotes((prev) => [
          ...prev,
          {
            id: `note-${noteIdCounter.current++}`,
            time: nextNoteTimeRef.current,
            lane,
            type: isStar ? 'star' : 'tap',
          },
        ]);

        // Advance to next beat (or half beat on groovy high BPM)
        const stepMultiplier = Math.random() < 0.35 && bpm < 135 ? 0.5 : 1;
        nextNoteTimeRef.current += beatInterval * stepMultiplier;
      }

      animationFrameRef.current = requestAnimationFrame(generateNotesLoop);
    };

    animationFrameRef.current = requestAnimationFrame(generateNotesLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, bpm]);

  // Check for missed notes
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const currentTime = (performance.now() - startTimeRef.current) / 1000;
      setNotes((prevNotes) => {
        let missedCount = 0;
        const remaining = prevNotes.filter((note) => {
          if (!note.hit && currentTime - note.time > 0.25) {
            // Note passed the hit line
            missedCount++;
            return false;
          }
          return !note.hit;
        });

        if (missedCount > 0) {
          sound.playHitSound('MISS');
          onMiss();
          // Add MISS feedback
          const feedbackId = `fb-${Date.now()}-${Math.random()}`;
          setFeedbacks((prev) => [
            ...prev.slice(-3),
            {
              id: feedbackId,
              rating: 'MISS',
              points: 0,
              combo: 0,
              x: 50,
              y: 80,
            },
          ]);
          setTimeout(() => {
            setFeedbacks((prev) => prev.filter((f) => f.id !== feedbackId));
          }, 800);
        }

        return remaining;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [isPlaying, onMiss]);

  // Handle player tap on a lane
  const handleLaneTrigger = useCallback(
    (laneIndex: number) => {
      if (!isPlaying) return;

      // Visual flash on lane
      setActiveLanes((prev) => ({ ...prev, [laneIndex]: true }));
      setTimeout(() => {
        setActiveLanes((prev) => ({ ...prev, [laneIndex]: false }));
      }, 140);

      onPetDanceTrigger();

      const currentTime = (performance.now() - startTimeRef.current) / 1000;
      // Find candidate note closest to hit line in this lane
      let bestNote: BeatNote | null = null;
      let minDiff = Infinity;

      notes.forEach((note) => {
        if (note.lane === laneIndex && !note.hit) {
          const diff = Math.abs(currentTime - note.time);
          if (diff < minDiff && diff <= 0.28) {
            minDiff = diff;
            bestNote = note;
          }
        }
      });

      if (bestNote) {
        const diff = minDiff;
        let rating: HitRating = 'GOOD';
        let basePoints = 100;

        if (diff <= 0.08) {
          rating = 'PERFECT';
          basePoints = 300;
        } else if (diff <= 0.16) {
          rating = 'GREAT';
          basePoints = 200;
        }

        const points = isFeverActive ? basePoints * 2 : basePoints;

        sound.playHitSound(rating);
        onHit(rating, points);

        // Mark note as hit
        setNotes((prev) =>
          prev.map((n) => (n.id === (bestNote as BeatNote).id ? { ...n, hit: true } : n))
        );

        // Feedback banner
        const feedbackId = `fb-${Date.now()}-${Math.random()}`;
        setFeedbacks((prev) => [
          ...prev.slice(-3),
          {
            id: feedbackId,
            rating,
            points,
            combo: 0,
            x: 12 + laneIndex * 25,
            y: 75,
          },
        ]);
        setTimeout(() => {
          setFeedbacks((prev) => prev.filter((f) => f.id !== feedbackId));
        }, 750);
      }
    },
    [isPlaying, isFeverActive, notes, onHit, onPetDanceTrigger]
  );

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      LANES.forEach((lane) => {
        if (e.key === lane.key || e.key.toLowerCase() === lane.altKey) {
          handleLaneTrigger(lane.id);
        }
      });
      // Center Spacebar triggers closest lane note
      if (e.code === 'Space') {
        const currentTime = (performance.now() - startTimeRef.current) / 1000;
        let closestLane = 1;
        let minTime = Infinity;
        notes.forEach((n) => {
          if (!n.hit) {
            const diff = Math.abs(currentTime - n.time);
            if (diff < minTime) {
              minTime = diff;
              closestLane = n.lane;
            }
          }
        });
        handleLaneTrigger(closestLane);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleLaneTrigger, notes]);

  const currentTime = isPlaying ? (performance.now() - startTimeRef.current) / 1000 : 0;

  return (
    <div id="rhythm-track-container" className="relative w-full max-w-lg mx-auto h-64 sm:h-72 flex flex-col justify-end overflow-hidden rounded-3xl bg-[#FAF9F6] border-2 border-[#E6E0D4] shadow-sm">
      {/* Fever Glow overlay */}
      {isFeverActive && (
        <motion.div
          animate={{ opacity: [0.2, 0.45, 0.2] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
          className="absolute inset-0 bg-gradient-to-t from-[#D27D56]/15 via-[#8B9D77]/10 to-transparent pointer-events-none z-10"
        />
      )}

      {/* Floating Timing Feedbacks */}
      <AnimatePresence>
        {feedbacks.map((fb) => (
          <motion.div
            key={fb.id}
            initial={{ opacity: 1, scale: 0.6, y: 0 }}
            animate={{ opacity: 0, scale: 1.2, y: -45 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute z-40 pointer-events-none font-black text-center"
            style={{ left: `${fb.x}%`, top: `${fb.y}%`, transform: 'translateX(-50%)' }}
          >
            <span
              className={`text-sm sm:text-base font-black tracking-wider px-3.5 py-1.5 rounded-full shadow-md ${
                fb.rating === 'PERFECT'
                  ? 'bg-[#8B9D77] text-white ring-2 ring-white'
                  : fb.rating === 'GREAT'
                  ? 'bg-[#D2B48C] text-[#5D544C] ring-2 ring-white'
                  : fb.rating === 'GOOD'
                  ? 'bg-[#F3EFE9] text-[#5D544C] border border-[#D9D1C3]'
                  : 'bg-[#D27D56] text-white'
              }`}
            >
              {fb.rating === 'PERFECT' ? '🌟 PERFECT!' : fb.rating === 'GREAT' ? '✨ GREAT!' : fb.rating === 'GOOD' ? '👍 GOOD' : '❌ MISS'}
            </span>
            {fb.points > 0 && (
              <div className="text-xs font-bold text-[#D27D56] drop-shadow-xs mt-1">
                +{fb.points} {isFeverActive ? '🔥 2X' : ''}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Falling Notes Canvas / Area */}
      <div className="absolute inset-0 flex">
        {LANES.map((lane) => (
          <div
            key={lane.id}
            className={`flex-1 relative border-r border-[#E6E0D4] last:border-r-0 transition-colors duration-100 ${
              activeLanes[lane.id] ? lane.bg : ''
            }`}
          >
            {/* Lane Guideline */}
            <div className="absolute top-0 bottom-14 left-1/2 -translate-x-1/2 w-0.5 bg-[#E6E0D4]" />

            {/* Notes in this lane */}
            {notes
              .filter((n) => n.lane === lane.id && !n.hit)
              .map((note) => {
                // Calculate vertical position (0% top to ~80% target line)
                const timeDiff = note.time - currentTime;
                // When timeDiff == travelDuration -> 0% (top)
                // When timeDiff == 0 -> ~75% (target line)
                const progress = 1 - timeDiff / travelDuration;
                const topPercent = progress * 75;

                if (topPercent < -15 || topPercent > 110) return null;

                const Icon = lane.icon;

                return (
                  <div
                    key={note.id}
                    className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none transition-all duration-75"
                    style={{ top: `${topPercent}%` }}
                  >
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md border-2 ${
                        note.type === 'star'
                          ? 'bg-[#D27D56] border-white text-white animate-pulse'
                          : `${lane.bg} ${lane.border} ${lane.color} bg-white shadow-xs`
                      }`}
                    >
                      {note.type === 'star' ? (
                        <Sparkles className="w-4 h-4 animate-spin" />
                      ) : (
                        <Icon className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        ))}
      </div>

      {/* Hit Line / Target Zone */}
      <div className="relative z-30 w-full px-3 pb-3 pt-2.5 bg-white border-t-2 border-[#E6E0D4] flex justify-between items-center gap-2 sm:gap-3">
        {LANES.map((lane) => {
          const Icon = lane.icon;
          const isActive = activeLanes[lane.id];

          return (
            <motion.button
              key={lane.id}
              id={`rhythm-button-lane-${lane.id}`}
              whileTap={{ scale: 0.94 }}
              animate={isActive ? { scale: 1.05 } : { scale: 1 }}
              onClick={() => handleLaneTrigger(lane.id)}
              className={`flex-1 h-13 sm:h-15 rounded-2xl flex flex-col items-center justify-center border-2 transition-all select-none shadow-xs cursor-pointer ${
                isActive
                  ? `bg-[#8B9D77] border-[#7A8C66] text-white shadow-sm`
                  : `bg-[#FAF9F6] ${lane.border} ${lane.color} hover:bg-[#F3EFE9] active:bg-[#E6E0D4]`
              }`}
            >
              <Icon className="w-5 h-5 sm:w-5 sm:h-5" />
              <div className="text-[10px] font-black uppercase tracking-wider opacity-80 mt-0.5">
                {lane.altKey.toUpperCase()}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
