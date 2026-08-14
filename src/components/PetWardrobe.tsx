import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AccessoryId, Pet, UserProgress } from '../types';
import { ACCESSORIES, PETS_DATABASE } from '../data/pets';
import { PetCharacter } from './PetCharacter';
import { sound } from '../utils/audio';
import { X, Sparkles, Volume2, Check, Lock, Users, Shirt, Heart, Crown, Music } from 'lucide-react';

interface PetWardrobeProps {
  isOpen: boolean;
  userProgress: UserProgress;
  onSetLeadPet: (petId: string) => void;
  onToggleBackupPet: (petId: string) => void;
  onEquipAccessory: (petId: string, accessoryId: AccessoryId) => void;
  onClose: () => void;
}

export const PetWardrobe: React.FC<PetWardrobeProps> = ({
  isOpen,
  userProgress,
  onSetLeadPet,
  onToggleBackupPet,
  onEquipAccessory,
  onClose,
}) => {
  const [selectedPetId, setSelectedPetId] = useState<string>(userProgress.activePetId);
  const [activeTab, setActiveTab] = useState<'roster' | 'dressup'>('roster');

  if (!isOpen) return null;

  const selectedPet = PETS_DATABASE.find((p) => p.id === selectedPetId) || PETS_DATABASE[0];
  const isSelectedUnlocked = userProgress.unlockedPets.includes(selectedPet.id);
  const isLead = userProgress.activePetId === selectedPet.id;
  const isBackup = userProgress.backupPetIds.includes(selectedPet.id);
  const currentAccessory = userProgress.equippedAccessories[selectedPet.id] || selectedPet.defaultAccessory || 'none';

  return (
    <AnimatePresence>
      <div id="pet-wardrobe-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#4A443F]/50 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          className="relative w-full max-w-4xl max-h-[92vh] bg-white border-2 border-[#E6E0D4] rounded-[32px] p-5 sm:p-7 shadow-2xl flex flex-col overflow-hidden text-[#4A443F]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E6E0D4]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#D2B48C] flex items-center justify-center text-white shadow-sm text-xl">
                <span>🐾</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#5D544C]">Pet Dance Troupe</h2>
                <p className="text-xs text-[#8E877F] font-semibold">
                  {userProgress.unlockedPets.length} of {PETS_DATABASE.length} Animal Dancers Adopted
                </p>
              </div>
            </div>

            <button
              id="pet-wardrobe-close-button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[#F3EFE9] hover:bg-[#E6E0D4] text-[#5D544C] border border-[#D9D1C3] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Content Layout */}
          <div className="flex-1 overflow-y-auto py-4 grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Left Column: Pet Showcase & Inspection */}
            <div className="md:col-span-5 flex flex-col items-center bg-[#FAF9F6] border-2 border-[#E6E0D4] rounded-3xl p-5 text-center relative overflow-hidden">
              {/* Pet Stage Platform */}
              <div className="w-36 h-36 sm:w-40 sm:h-40 bg-[#FDFCF0] rounded-full border-4 border-[#8B9D77] flex items-center justify-center shadow-md relative my-2 p-2">
                <PetCharacter
                  pet={selectedPet}
                  danceMove={isSelectedUnlocked ? 'hop' : 'idle'}
                  accessory={currentAccessory}
                  size="lg"
                  interactive={true}
                  className="mx-auto"
                />
              </div>

              {/* Pet Name & Species */}
              <div className="mt-2">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#8B9D77]/15 border border-[#8B9D77]/30 text-xs font-bold text-[#5D544C]">
                  <span>{selectedPet.species}</span>
                </div>
                <h3 className="text-2xl font-black text-[#5D544C] mt-1">{selectedPet.name}</h3>
                <p className="text-xs text-[#8E877F] font-semibold italic">"{selectedPet.title}"</p>
              </div>

              {/* Bio & Signature Move */}
              <p className="text-xs text-[#6D655E] mt-2 px-2 leading-relaxed">
                {selectedPet.description}
              </p>

              <div className="w-full grid grid-cols-2 gap-2 mt-3 text-left text-xs bg-white p-3 rounded-2xl border border-[#E6E0D4]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8E877F] block">Signature Move</span>
                  <span className="font-bold text-[#D27D56] text-xs truncate block">{selectedPet.signatureMove}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8E877F] block">Favorite Beat</span>
                  <span className="font-bold text-[#8B9D77] text-xs truncate block">{selectedPet.favoriteBeat}</span>
                </div>
              </div>

              {/* Sound Test Button */}
              <button
                id={`sound-test-${selectedPet.id}`}
                onClick={() => sound.playAnimalSound(selectedPet.soundType)}
                className="mt-3 px-4 py-1.5 rounded-full bg-white hover:bg-[#F3EFE9] text-[#5D544C] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-[#D9D1C3] shadow-xs"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#8B9D77]" />
                <span>Hear Voice ({selectedPet.soundType})</span>
              </button>

              {/* Action Buttons for Selected Pet */}
              {isSelectedUnlocked ? (
                <div className="w-full flex flex-col gap-2 mt-4 pt-3 border-t border-[#E6E0D4]">
                  {isLead ? (
                    <div className="w-full py-2.5 rounded-2xl bg-[#8B9D77]/20 border border-[#8B9D77] text-[#5D544C] font-bold text-xs flex items-center justify-center gap-1.5">
                      <Crown className="w-4 h-4 text-[#8B9D77]" />
                      Current Lead Dancer
                    </div>
                  ) : (
                    <button
                      id={`set-lead-btn-${selectedPet.id}`}
                      onClick={() => onSetLeadPet(selectedPet.id)}
                      className="w-full py-2.5 rounded-2xl bg-[#D27D56] hover:bg-[#C16C45] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Crown className="w-4 h-4" />
                      Set as Lead Dancer
                    </button>
                  )}

                  {!isLead && (
                    <button
                      id={`toggle-backup-btn-${selectedPet.id}`}
                      onClick={() => onToggleBackupPet(selectedPet.id)}
                      className={`w-full py-2 rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border ${
                        isBackup
                          ? 'bg-[#8B9D77]/20 border-[#8B9D77] text-[#5D544C] hover:bg-[#8B9D77]/30'
                          : 'bg-white border-[#D9D1C3] text-[#5D544C] hover:bg-[#F3EFE9]'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      {isBackup ? 'Remove from Backup Dancers' : 'Add to Stage Backup'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-full mt-4 p-3 rounded-2xl bg-white border border-[#E6E0D4] text-center">
                  <div className="text-xs font-bold text-[#D27D56] flex items-center justify-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    Locked Animal Pet
                  </div>
                  <p className="text-[11px] text-[#8E877F] mt-1">
                    Complete Stage {selectedPet.unlockLevel} to adopt {selectedPet.name}!
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Pet Grid & Wardrobe Accessories */}
            <div className="md:col-span-7 flex flex-col gap-4">
              {/* Tabs */}
              <div className="flex items-center gap-2 p-1 bg-[#F3EFE9] rounded-2xl border border-[#E6E0D4]">
                <button
                  id="tab-roster"
                  onClick={() => setActiveTab('roster')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'roster' ? 'bg-white text-[#5D544C] shadow-xs border border-[#E6E0D4]' : 'text-[#8E877F] hover:text-[#5D544C]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Pet Troupe ({userProgress.unlockedPets.length}/{PETS_DATABASE.length})
                </button>
                <button
                  id="tab-dressup"
                  onClick={() => setActiveTab('dressup')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'dressup' ? 'bg-white text-[#5D544C] shadow-xs border border-[#E6E0D4]' : 'text-[#8E877F] hover:text-[#5D544C]'
                  }`}
                >
                  <Shirt className="w-3.5 h-3.5" />
                  Dress-Up & Accessories
                </button>
              </div>

              {/* TAB 1: PET ROSTER GRID */}
              {activeTab === 'roster' && (
                <div className="grid grid-cols-3 gap-2.5">
                  {PETS_DATABASE.map((pet) => {
                    const isUnlocked = userProgress.unlockedPets.includes(pet.id);
                    const isSelected = selectedPetId === pet.id;
                    const isCurrentLead = userProgress.activePetId === pet.id;
                    const isCurrentBackup = userProgress.backupPetIds.includes(pet.id);

                    return (
                      <motion.div
                        key={pet.id}
                        id={`roster-card-${pet.id}`}
                        whileHover={isUnlocked ? { scale: 1.03 } : {}}
                        onClick={() => setSelectedPetId(pet.id)}
                        className={`relative rounded-2xl p-2.5 flex flex-col items-center justify-between border-2 cursor-pointer transition-all select-none ${
                          isSelected
                            ? 'bg-white border-[#8B9D77] ring-2 ring-[#8B9D77]/30 shadow-md'
                            : isUnlocked
                            ? 'bg-[#FAF9F6] border-[#E6E0D4] hover:border-[#D9D1C3] hover:bg-white'
                            : 'bg-[#F3EFE9]/60 border-[#E6E0D4] opacity-60'
                        }`}
                      >
                        {/* Status Badges */}
                        <div className="absolute top-1.5 left-1.5 right-1.5 flex justify-between items-center pointer-events-none">
                          {isCurrentLead && (
                            <span className="px-1.5 py-0.5 rounded-full bg-[#8B9D77] text-white text-[9px] font-black tracking-wider flex items-center gap-0.5 shadow-xs">
                              <Crown className="w-2.5 h-2.5" /> LEAD
                            </span>
                          )}
                          {isCurrentBackup && (
                            <span className="px-1.5 py-0.5 rounded-full bg-[#D2B48C] text-[#4A443F] text-[9px] font-black tracking-wider flex items-center gap-0.5 shadow-xs">
                              STAGE
                            </span>
                          )}
                          {!isUnlocked && (
                            <span className="ml-auto px-1.5 py-0.5 rounded-full bg-[#E6E0D4] text-[#8E877F] text-[9px] font-bold">
                              Lvl {pet.unlockLevel}
                            </span>
                          )}
                        </div>

                        {/* Pet Avatar Thumbnail */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center my-2">
                          <PetCharacter
                            pet={pet}
                            danceMove={isUnlocked ? 'idle' : 'miss'}
                            accessory={userProgress.equippedAccessories[pet.id] || pet.defaultAccessory}
                            size="sm"
                            interactive={false}
                            showShadow={false}
                          />
                        </div>

                        {/* Pet Name */}
                        <div className="text-center w-full">
                          <div className="text-xs font-black text-[#5D544C] truncate">{pet.name}</div>
                          <div className="text-[10px] text-[#8E877F] font-semibold truncate">
                            {isUnlocked ? pet.species : `Stage ${pet.unlockLevel}`}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: ACCESSORIES & WARDROBE */}
              {activeTab === 'dressup' && (
                <div className="flex flex-col gap-3">
                  <div className="text-xs font-semibold text-[#5D544C]">
                    Equip fashion accessories for <span className="text-[#D27D56] font-bold">{selectedPet.name}</span>:
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {ACCESSORIES.map((acc) => {
                      const isEquipped = currentAccessory === acc.id;

                      return (
                        <motion.button
                          key={acc.id}
                          id={`accessory-btn-${acc.id}`}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (isSelectedUnlocked) {
                              onEquipAccessory(selectedPet.id, acc.id);
                              sound.playHitSound('PERFECT');
                            }
                          }}
                          className={`p-3 rounded-2xl flex flex-col items-center justify-center border-2 text-center transition-all cursor-pointer ${
                            isEquipped
                              ? 'bg-[#8B9D77]/15 border-[#8B9D77] ring-2 ring-[#8B9D77]/30 text-[#5D544C] shadow-sm'
                              : 'bg-[#FAF9F6] border-[#E6E0D4] text-[#5D544C] hover:bg-white'
                          } ${!isSelectedUnlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span className="text-3xl mb-1.5">{acc.emoji}</span>
                          <span className="text-xs font-bold truncate w-full">{acc.name}</span>
                          {isEquipped && (
                            <span className="text-[10px] font-black text-[#8B9D77] flex items-center gap-0.5 mt-1">
                              <Check className="w-3 h-3" /> Equipped
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
