'use client';

import React, { useState } from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { Calendar, Trash2, RotateCcw, Save } from 'lucide-react';

const AVATARS = ['🌱', '🌍', '⚡', '🚴', '🌊', '☀️', '🦋', '🔥'];

export default function ProfilePage() {
  const {
    state,
    updateActiveUserMetadata,
    resetActiveUserData,
    deleteUserAccount,
    switchUser,
  } = useCarbon();

  const { activeUser } = state;

  const [name, setName] = useState(activeUser?.name || '');
  const [city, setCity] = useState(activeUser?.city || '');
  const [avatar, setAvatar] = useState(activeUser?.avatar || '🌱');
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  if (!activeUser) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted font-body">No active user selected.</p>
      </div>
    );
  }

  const getFormattedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return 'June 2026';
    }
  };

  const handleSave = () => {
    if (name.trim().length < 2) {
      alert('Name must be at least 2 characters.');
      return;
    }
    updateActiveUserMetadata(name.trim(), city.trim(), avatar);
    setIsEditing(false);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all your logs, points, and challenges? This cannot be undone.')) {
      resetActiveUserData();
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete the account "${activeUser.name}"? This will permanently remove all logs and settings.`)) {
      deleteUserAccount(activeUser.id);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-3xl font-extrabold text-white">
          Profile Settings
        </h1>
        <p className="font-body text-sm text-[#8899AA] mt-1">
          Manage your personal carbon tracking profile and local preferences
        </p>
      </div>

      {/* Main Glass Profile Card */}
      <div className="glass-panel border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8 relative overflow-hidden">
        
        {/* Profile Details Container */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          
          {/* Avatar Area */}
          <div className="relative">
            <button
              onClick={() => isEditing && setShowAvatarPicker(!showAvatarPicker)}
              disabled={!isEditing}
              className={`text-6xl w-24 h-24 flex items-center justify-center rounded-2xl bg-[#0D1117]/80 border transition-all ${
                isEditing 
                  ? 'border-[#00FF87] hover:bg-white/5 cursor-pointer shadow-[0_0_15px_rgba(0,255,135,0.2)]' 
                  : 'border-white/10'
              }`}
              title={isEditing ? 'Click to change avatar' : undefined}
            >
              {avatar}
            </button>

            {/* Emoji Avatar Picker Modal/Overlay inside card */}
            {isEditing && showAvatarPicker && (
              <div className="absolute top-28 left-0 z-20 grid grid-cols-4 gap-2 p-3 bg-[#0D1117] border border-white/10 rounded-xl shadow-2xl">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    onClick={() => {
                      setAvatar(av);
                      setShowAvatarPicker(false);
                    }}
                    className={`text-2xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors ${
                      avatar === av ? 'bg-[#00FF87]/10 border border-[#00FF87]' : ''
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Fields */}
          <div className="flex-1 w-full space-y-4">
            {isEditing ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="name-edit" className="block text-[10px] font-display font-bold text-[#8899AA] uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    id="name-edit"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm font-body text-frost focus:outline-none focus:border-[#00FF87]"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="city-edit" className="block text-[10px] font-display font-bold text-[#8899AA] uppercase tracking-wider">
                    City
                  </label>
                  <input
                    id="city-edit"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm font-body text-frost focus:outline-none focus:border-[#00FF87]"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center sm:text-left space-y-2">
                <h2 className="font-display text-2xl font-bold text-white tracking-tight">
                  {activeUser.name}
                </h2>
                {activeUser.city && (
                  <p className="font-body text-sm text-[#8899AA] flex items-center justify-center sm:justify-start gap-1">
                    <span>📍</span> {activeUser.city}
                  </p>
                )}
                <p className="font-body text-xs text-muted-dim flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-dim" />
                  <span>Member since {getFormattedDate(activeUser.createdAt)}</span>
                </p>
              </div>
            )}
          </div>

          {/* Edit / Save Action button */}
          <div className="shrink-0">
            {isEditing ? (
              <button
                onClick={handleSave}
                className="bg-[#00FF87] hover:bg-[#00C96B] text-[#080B12] px-4 py-2 rounded-xl font-display font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Save className="h-3.5 w-3.5" /> Save Changes
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-white/5 hover:bg-white/10 border border-white/15 text-frost px-4 py-2 rounded-xl font-display font-bold text-xs transition-all"
              >
                Edit Profile
              </button>
            )}
          </div>

        </div>

        {/* User Badges & Stats */}
        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
          <div className="bg-[#0D1117]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
            <span className="text-[10px] font-display font-semibold text-[#8899AA] uppercase tracking-wider">
              Eco Score
            </span>
            <span className="font-data text-2xl font-bold text-[#00FF87] mt-1">
              {activeUser.ecoScore} XP
            </span>
          </div>
          <div className="bg-[#0D1117]/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
            <span className="text-[10px] font-display font-semibold text-[#8899AA] uppercase tracking-wider">
              Carbon Rank
            </span>
            <span className="font-display text-lg font-bold text-white mt-1">
              {activeUser.level}
            </span>
          </div>
        </div>

      </div>

      {/* Account Settings / Maintenance section */}
      <div className="space-y-4">
        <h3 className="font-display text-xs font-bold text-[#8899AA] uppercase tracking-widest pl-2">
          Danger Zone & Management
        </h3>

        <div className="glass-panel border border-white/10 rounded-3xl p-6 space-y-4">
          
          {/* Switch User */}
          <div className="flex items-center justify-between py-3 border-b border-white/5">
            <div>
              <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <span className="text-[#00FF87] font-semibold text-lg">⇄</span> Switch Profile
              </h4>
              <p className="font-body text-xs text-muted-dim mt-0.5">
                Log in as another user on this device.
              </p>
            </div>
            <button
              onClick={switchUser}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-frost px-4 py-2 rounded-xl font-display font-bold text-xs transition-colors"
            >
              Switch User
            </button>
          </div>

          {/* Reset Progress */}
          <div className="flex items-center justify-between py-3 border-b border-white/5">
            <div>
              <h4 className="font-display font-bold text-sm text-amber-400 flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-amber-400" /> Reset Profile Progress
              </h4>
              <p className="font-body text-xs text-muted-dim mt-0.5">
                Wipes all activity logs, challenge progress, and eco score.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="bg-amber-400/5 hover:bg-amber-400/10 border border-amber-400/25 text-amber-400 px-4 py-2 rounded-xl font-display font-bold text-xs transition-colors"
            >
              Reset Data
            </button>
          </div>

          {/* Delete Account */}
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="font-display font-bold text-sm text-red-400 flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-red-400" /> Delete Profile Account
              </h4>
              <p className="font-body text-xs text-muted-dim mt-0.5">
                Permanently deletes this user profile and all isolated data from local storage.
              </p>
            </div>
            <button
              onClick={handleDelete}
              className="bg-red-400/5 hover:bg-red-400/10 border border-red-400/25 text-red-400 px-4 py-2 rounded-xl font-display font-bold text-xs transition-colors"
            >
              Delete Account
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
