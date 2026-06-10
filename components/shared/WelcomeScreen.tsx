'use client';

import React, { useState } from 'react';
import { User } from '../../types';

interface WelcomeScreenProps {
  allUsers: User[];
  onCreateUser: (name: string, city: string, avatar: string) => void;
  onShowSelector?: () => void;
}

const AVATARS = ['🌱', '🌍', '⚡', '🚴', '🌊', '☀️', '🦋', '🔥'];

export default function WelcomeScreen({
  allUsers,
  onCreateUser,
  onShowSelector,
}: WelcomeScreenProps) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🌱');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    setError('');
    onCreateUser(name.trim(), city.trim(), selectedAvatar);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#080B12] text-[#E8F4F1] overflow-y-auto p-4">
      {/* Earth Aura Background Orb */}
      <div 
        className="absolute pointer-events-none"
        style={{
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,135,0.08) 0%, rgba(0,255,135,0.02) 50%, transparent 80%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0
        }}
      />

      <div className="relative z-10 w-full max-w-[420px] glass-panel border border-[#00FF87]/20 rounded-2xl p-6 sm:p-8 flex flex-col items-center space-y-6">
        
        {/* Brand/Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="text-4xl" role="img" aria-label="Globe">🌍</div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#00FF87]">
            CarbonLens
          </h1>
          <p className="font-body text-[10px] tracking-widest text-[#8899AA]">
            INDIA CARBON FOOTPRINT INTELLIGENCE
          </p>
        </div>

        {/* Headline */}
        <div className="text-center space-y-1">
          <h2 className="font-display text-lg font-bold text-frost">
            Welcome to CarbonLens
          </h2>
          <p className="font-body text-xs text-muted">
            Who&apos;s tracking their footprint today?
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg text-center font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="name-input" className="block font-display text-xs font-semibold text-[#8899AA]">
              Your Name <span className="text-[#00FF87]">*</span>
            </label>
            <input
              id="name-input"
              type="text"
              placeholder="e.g. Aarav"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0D1117]/80 border border-white/10 rounded-xl px-4 py-3 text-sm font-body text-frost placeholder-white/20 focus:outline-none focus:border-[#00FF87] focus:ring-1 focus:ring-[#00FF87] transition-all"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="city-input" className="block font-display text-xs font-semibold text-[#8899AA]">
              City (Optional)
            </label>
            <input
              id="city-input"
              type="text"
              placeholder="e.g. Mumbai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-[#0D1117]/80 border border-white/10 rounded-xl px-4 py-3 text-sm font-body text-frost placeholder-white/20 focus:outline-none focus:border-[#00FF87] focus:ring-1 focus:ring-[#00FF87] transition-all"
            />
          </div>

          {/* Avatar Picker */}
          <div className="space-y-2">
            <span className="block font-display text-xs font-semibold text-[#8899AA]">
              Select Avatar
            </span>
            <div className="flex items-center space-x-2 overflow-x-auto py-2 px-1 w-full justify-between no-scrollbar">
              {AVATARS.map((avatar) => {
                const isSelected = selectedAvatar === avatar;
                return (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`text-2xl w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                      isSelected
                        ? 'border-2 border-[#00FF87] bg-white/5 scale-110 shadow-[0_0_10px_rgba(0,255,135,0.4)]'
                        : 'border border-transparent hover:border-white/10'
                    }`}
                  >
                    {avatar}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#00FF87] text-[#080B12] font-display font-bold text-sm h-12 rounded-xl hover:bg-[#00C96B] transition-colors flex items-center justify-center shadow-[0_4px_20px_rgba(0,255,135,0.25)]"
          >
            Start Tracking →
          </button>
        </form>

        {/* Option B: Switch User (Returning) */}
        {allUsers.length > 0 && onShowSelector && (
          <button
            type="button"
            onClick={onShowSelector}
            className="text-xs font-body font-semibold text-[#00FF87] hover:underline transition-all mt-2"
          >
            Switch User (Returning)
          </button>
        )}

      </div>
    </div>
  );
}
