'use client';

import React from 'react';
import { useChallenge } from '../../hooks/useChallenge';
import { Trophy, CheckCircle, Flame, Calendar, Trash2 } from 'lucide-react';

// Helper to generate dates for active challenge days
const getChallengeDates = (startDateStr: string, durationDays: number): string[] => {
  const dates = [];
  const start = new Date(startDateStr);
  for (let i = 0; i < durationDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

// Helper to format date for display (e.g., "12 Jun")
const formatDateDisplay = (dateStr: string): string => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export default function ChallengesPage() {
  const {
    activeChallenges,
    availableChallenges,
    completedChallenges,
    startChallenge,
    checkChallengeDay,
    abandonChallenge,
    completeChallenge,
  } = useChallenge();

  const handleCheckboxChange = (
    challengeId: string,
    dateStr: string,
    alreadyChecked: boolean,
    totalDays: number,
    currentCheckedDays: string[]
  ) => {
    const isChecked = !alreadyChecked;
    checkChallengeDay(challengeId, dateStr, isChecked);

    // Calculate if this toggle will complete the challenge
    const currentCheckedCount = currentCheckedDays.length;
    const nextCount = isChecked ? currentCheckedCount + 1 : currentCheckedCount - 1;

    if (nextCount === totalDays) {
      // Small timeout to let the checkbox rendering update before starting celebration
      setTimeout(() => {
        completeChallenge(challengeId);
      }, 300);
    }
  };

  const difficultyColors: Record<string, string> = {
    Easy: 'bg-green/10 border-green/30 text-green',
    Medium: 'bg-amber/10 border-amber/30 text-amber',
    Hard: 'bg-coral/10 border-coral/30 text-coral',
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="p-6 glass-panel rounded-3xl space-y-1">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-frost">
          Eco Challenges
        </h1>
        <p className="font-body text-xs text-muted">
          Pledge to low-carbon habits, log daily progress, and earn XP milestones.
        </p>
      </div>

      {/* Active Challenges Progress Section */}
      {activeChallenges.length > 0 && (
        <section className="space-y-4" aria-label="Active Challenges Progress">
          <h2 className="font-display text-lg font-bold text-frost flex items-center gap-1.5">
            <Flame className="h-5 w-5 text-orange-500 animate-pulse" /> Active Pledges
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeChallenges.map((c) => {
              const dates = c.startDate ? getChallengeDates(c.startDate, c.durationDays) : [];
              const checkedDays = c.checkedDays || [];
              const progressPct = (checkedDays.length / c.durationDays) * 100;

              return (
                <div
                  key={c.id}
                  className="glass-panel border-green/20 rounded-2xl p-5 flex flex-col justify-between space-y-5"
                >
                  {/* Top info */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl" role="img" aria-hidden="true">
                          {c.emoji}
                        </span>
                        <div>
                          <h3 className="font-display text-sm font-bold text-frost">{c.name}</h3>
                          <span className={`inline-block border px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase ${difficultyColors[c.difficulty]}`}>
                            {c.difficulty}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => abandonChallenge(c.id)}
                        className="p-1.5 text-muted hover:text-coral hover:bg-coral/10 rounded-lg transition-colors border border-transparent"
                        title="Abandon challenge"
                        aria-label={`Abandon challenge: ${c.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="font-body text-xs text-muted leading-relaxed">
                      {c.description} — potential saving of{' '}
                      <strong className="text-green">{c.co2SavedPotential} kg CO₂</strong>.
                    </p>
                  </div>

                  {/* Daily Checkbox Verification List */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-muted font-data font-semibold uppercase block">
                      Daily Check-ins ({checkedDays.length}/{c.durationDays})
                    </span>
                    
                    <div className="flex flex-wrap gap-2">
                      {dates.map((dateStr, idx) => {
                        const isChecked = checkedDays.includes(dateStr);
                        const isToday = dateStr === new Date().toISOString().split('T')[0];

                        return (
                          <button
                            key={dateStr}
                            onClick={() =>
                              handleCheckboxChange(
                                c.id,
                                dateStr,
                                isChecked,
                                c.durationDays,
                                checkedDays
                              )
                            }
                            className={`px-3 py-2 rounded-xl border flex flex-col items-center justify-center min-w-[56px] transition-all font-body ${
                              isChecked
                                ? 'bg-green/10 border-green text-green shadow-[0_0_8px_rgba(0,255,135,0.1)]'
                                : isToday
                                ? 'bg-white/5 border-muted hover:border-green text-frost font-bold'
                                : 'bg-white/5 border-border hover:border-muted text-muted'
                            }`}
                            aria-label={`Day ${idx + 1}: ${formatDateDisplay(dateStr)}. Click to toggle verification.`}
                          >
                            <span className="text-[9px] font-data block uppercase">Day {idx + 1}</span>
                            <span className="text-[10px] font-semibold leading-none mt-1">
                              {formatDateDisplay(dateStr)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Available Challenges Section */}
      <section className="space-y-4" aria-label="Available Challenges catalog">
        <h2 className="font-display text-lg font-bold text-frost flex items-center gap-1.5">
          <Calendar className="h-5 w-5 text-green" /> Available Challenges
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availableChallenges.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted col-span-full">
              No available challenges right now. Pledges are active.
            </div>
          ) : (
            availableChallenges.map((c) => (
              <div
                key={c.id}
                className="glass-panel hover:border-white/20 transition-all duration-300 p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl" role="img" aria-hidden="true">
                        {c.emoji}
                      </span>
                      <h3 className="font-display text-sm font-bold text-frost">{c.name}</h3>
                    </div>
                    <span className={`border px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase ${difficultyColors[c.difficulty]}`}>
                      {c.difficulty}
                    </span>
                  </div>

                  <p className="font-body text-xs text-muted leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <div className="text-left font-data text-[10px] text-muted space-y-0.5">
                    <span className="block">Duration: {c.duration}</span>
                    <span className="block text-green font-semibold">
                      Potential: {c.co2SavedPotential} kg CO₂
                    </span>
                  </div>

                  <button
                    onClick={() => startChallenge(c.id)}
                    className="px-4 py-2 bg-green/10 hover:bg-green text-green hover:text-void rounded-xl border border-green/20 hover:border-transparent font-display text-xs font-bold transition-all duration-200"
                  >
                    Start Pledge
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Completed Milestones Section */}
      {completedChallenges.length > 0 && (
        <section className="space-y-4" aria-label="Completed Challenges History">
          <h2 className="font-display text-lg font-bold text-frost flex items-center gap-1.5">
            <Trophy className="h-5 w-5 text-amber" /> Completed Milestones
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {completedChallenges.map((c) => (
              <div
                key={c.id}
                className="glass-panel border-amber/20 p-5 flex items-center space-x-4 opacity-75"
              >
                <div className="p-3 rounded-full bg-amber/10 border border-amber/20 text-amber">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div className="space-y-0.5 flex-1 min-w-0">
                  <h3 className="font-display text-sm font-bold text-frost truncate">
                    {c.name}
                  </h3>
                  <p className="font-body text-xs text-muted">
                    Saved {c.co2SavedPotential} kg CO₂ equivalent
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
