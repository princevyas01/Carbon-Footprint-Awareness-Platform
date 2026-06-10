'use client';

import React from 'react';
import { User } from '../../types';

interface UserSelectorScreenProps {
  users: User[];
  onSelectUser: (id: string) => void;
  onAddNewUser: () => void;
}

export default function UserSelectorScreen({
  users,
  onSelectUser,
  onAddNewUser,
}: UserSelectorScreenProps) {
  const getRelativeTimeString = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      date.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 0) return 'Active today';
      if (diffDays === 1) return 'Active yesterday';
      return `Active ${diffDays} days ago`;
    } catch {
      return 'Active recently';
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#080B12] text-[#E8F4F1] overflow-y-auto p-6">
      {/* Orbital Aura Background Orb */}
      <div 
        className="absolute pointer-events-none"
        style={{
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,135,0.06) 0%, rgba(0,255,135,0.01) 60%, transparent 80%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0
        }}
      />

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center space-y-8">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="text-4xl" role="img" aria-label="Globe">🌍</div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">
            Who&apos;s tracking today?
          </h1>
          <p className="font-body text-sm text-[#8899AA]">
            Select your profile to load your personalized carbon dashboard
          </p>
        </div>

        {/* User Card Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-3xl">
          {users.map((user) => {
            return (
              <button
                key={user.id}
                onClick={() => onSelectUser(user.id)}
                className="group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-[#0D1117]/60 border border-white/10 hover:border-[#00FF87]/40 hover:-translate-y-1 transition-all duration-300 glass-panel cursor-pointer text-center w-full"
              >
                {/* Large Avatar */}
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                  {user.avatar}
                </div>

                {/* Name */}
                <div className="font-display font-bold text-base text-frost mb-1 group-hover:text-[#00FF87] transition-colors">
                  {user.name}
                </div>

                {/* City */}
                {user.city && (
                  <div className="font-body text-xs text-[#8899AA] mb-2">
                    📍 {user.city}
                  </div>
                )}

                {/* Last Active */}
                <div className="font-body text-[10px] text-muted-dim mb-4">
                  {getRelativeTimeString(user.lastActive)}
                </div>

                {/* Eco Score & Level Badge */}
                <div className="flex flex-col items-center gap-1.5 w-full">
                  <span className="text-[10px] font-data bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-frost">
                    {user.ecoScore} XP
                  </span>
                  <span className="text-[9px] font-display font-semibold text-[#00FF87] bg-[#00FF87]/5 border border-[#00FF87]/20 px-2 py-0.5 rounded-full">
                    {user.level}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Add New User Card */}
          <button
            onClick={onAddNewUser}
            className="flex flex-col items-center justify-center p-6 rounded-2xl bg-transparent border border-dashed border-white/20 hover:border-[#00FF87] hover:-translate-y-1 transition-all duration-300 cursor-pointer min-h-[220px] w-full text-center"
          >
            <div className="text-4xl text-[#8899AA] group-hover:text-[#00FF87] mb-3">
              +
            </div>
            <div className="font-display font-bold text-sm text-[#8899AA] hover:text-[#00FF87] transition-colors">
              Add New User
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
