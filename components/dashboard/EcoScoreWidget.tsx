'use client';

import React from 'react';
import { useEcoScore } from '../../hooks/useEcoScore';
import { ShieldCheck } from 'lucide-react';

export default function EcoScoreWidget() {
  const { score, levelDetails } = useEcoScore();
  const {
    level,
    icon,
    progressPercent,
    pointsInCurrentLevel,
    pointsRequiredForNextLevel,
    maxScore,
  } = levelDetails;

  // SVG configurations for the progress circle
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div
      className="glass-panel rounded-2xl p-5 hover:border-white/20 transition-all duration-300 flex flex-col justify-between space-y-4"
      aria-label={`Eco Score: ${score}/1000. Level: ${level}.`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-muted">
          Eco Score
        </h3>
        <span className="text-xs bg-white/5 border border-border px-2 py-0.5 rounded-full font-body text-frost flex items-center gap-1">
          <ShieldCheck className="h-3 w-3 text-green" /> Level Verified
        </span>
      </div>

      <div className="flex items-center space-x-4">
        {/* Animated Circular Progress Ring */}
        <div className="relative h-18 w-18 flex items-center justify-center shrink-0">
          <svg className="w-16 h-16 transform -rotate-90" aria-hidden="true">
            {/* Background Ring */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              className="stroke-white/5"
              strokeWidth="5"
              fill="transparent"
            />
            {/* Foreground Ring */}
            <circle
              cx="32"
              cy="32"
              r={radius}
              className="stroke-green transition-all duration-1000 ease-out"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-lg font-data font-bold text-frost">
            {score}
          </div>
        </div>

        {/* Level Details */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center space-x-1.5">
            <span className="text-xl" role="img" aria-label={`Level Icon for ${level}`}>
              {icon}
            </span>
            <span className="font-display font-bold text-sm text-frost truncate">
              {level}
            </span>
          </div>
          <p className="font-body text-[10px] text-muted">
            {score >= 1000
              ? 'Maximum level achieved!'
              : `${pointsRequiredForNextLevel - pointsInCurrentLevel} XP to next milestone`}
          </p>
        </div>
      </div>

      {/* Progress XP Bar */}
      <div className="space-y-1 pt-1">
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden" aria-hidden="true">
          <div
            className="h-full bg-green transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] font-data text-muted">
          <span>{levelDetails.minScore} XP</span>
          <span>{maxScore} XP</span>
        </div>
      </div>
    </div>
  );
}
