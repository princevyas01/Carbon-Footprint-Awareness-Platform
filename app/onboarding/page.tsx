'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCarbon } from '../../context/CarbonContext';
import { calculateAnnualBaseline } from '../../lib/calculations';
import { UserProfile } from '../../types';

const STEPS = [
  {
    key: 'transport',
    title: 'Primary mode of transport',
    description: 'How do you commute most of the time?',
    options: [
      { label: 'Petrol Car', icon: '🚗', desc: 'Gasoline powered vehicle' },
      { label: 'Diesel Car', icon: '🚗', desc: 'Diesel powered vehicle' },
      { label: 'Two-wheeler', icon: '🛵', desc: 'Scooter or Motorcycle' },
      { label: 'Public Transit', icon: '🚌', desc: 'Bus, Metro, or Train' },
      { label: 'Walk/Cycle', icon: '🚶', desc: 'Zero emissions commute' },
      { label: 'EV', icon: '⚡', desc: 'Electric Vehicle' },
    ],
  },
  {
    key: 'diet',
    title: 'Dietary habits',
    description: 'What best describes your food consumption?',
    options: [
      { label: 'Heavy meat (daily)', icon: '🥩', desc: 'Daily lamb, beef, or pork' },
      { label: 'Mixed (meat 3–4x/week)', icon: '🍗', desc: 'Moderate poultry and fish' },
      { label: 'Vegetarian', icon: '🥗', desc: 'No meat, includes dairy/paneer' },
      { label: 'Vegan', icon: '🌱', desc: 'Strictly plant-based diet' },
    ],
  },
  {
    key: 'energy',
    title: 'Home energy source',
    description: 'How does your household get electricity?',
    options: [
      { label: 'Grid only', icon: '🔌', desc: 'State electricity board' },
      { label: 'Solar + Grid', icon: '☀️', desc: 'Solar panels + backup grid' },
      { label: 'Fully renewable', icon: '🌬️', desc: 'Off-grid solar or green contracts' },
      { label: 'LPG/Kerosene heavy use', icon: '🪔', desc: 'Heavy fossil fuel heating/cooking' },
    ],
  },
  {
    key: 'flights',
    title: 'Air travel',
    description: 'How many flights did you take in the past 12 months?',
    options: [
      { label: 'None', icon: '✈️', desc: 'No flights' },
      { label: '1–2 flights', icon: '✈️', desc: 'Short domestic trips' },
      { label: '3–5 flights', icon: '✈️', desc: 'Frequent domestic or short haul' },
      { label: '6+ flights', icon: '✈️', desc: 'Heavy flyers or international long haul' },
    ],
  },
  {
    key: 'shopping',
    title: 'Shopping frequency',
    description: 'How often do you buy new goods (clothing, gadgets, packages)?',
    options: [
      { label: 'Minimal', icon: '📦', desc: 'Essential items only' },
      { label: 'Moderate', icon: '📦', desc: 'Occasional online packages' },
      { label: 'Frequent', icon: '📦', desc: 'Multiple orders per week' },
      { label: 'Very frequent (weekly online orders)', icon: '📦', desc: 'Heavy consumption / fast fashion' },
    ],
  },
];

export default function OnboardingPage() {
  const { setProfile } = useCarbon();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({
    transport: '',
    diet: '',
    energy: '',
    flights: '',
    shopping: '',
  });

  const stepInfo = STEPS[currentStep];
  const progressPercent = ((currentStep + 1) / STEPS.length) * 100;
  const currentSelection = answers[stepInfo.key];

  const handleSelectOption = (label: string) => {
    setAnswers((prev) => ({ ...prev, [stepInfo.key]: label }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Calculate baseline and save
      const baselineCo2 = calculateAnnualBaseline({
        transport: answers.transport,
        diet: answers.diet,
        energy: answers.energy,
        flights: answers.flights,
        shopping: answers.shopping,
      });

      const profile: UserProfile = {
        transport: answers.transport,
        diet: answers.diet,
        energy: answers.energy,
        flights: answers.flights,
        shopping: answers.shopping,
        baselineCo2,
        isOnboarded: true,
      };

      setProfile(profile);
      router.push('/');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col space-y-8 py-12 md:py-24">
      {/* Styles for premium options */}
      <style dangerouslySetInnerHTML={{__html: `
        .onboarding-option-card {
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          transition: all 200ms ease;
          position: relative;
        }
        .onboarding-option-card:hover {
          border: 1px solid rgba(0,255,135,0.4) !important;
          background: rgba(0,255,135,0.05) !important;
          transform: translateY(-2px);
        }
        .onboarding-option-card.selected {
          border: 1px solid #00FF87 !important;
          background: rgba(0,255,135,0.10) !important;
          box-shadow: 0 0 16px rgba(0,255,135,0.2) !important;
        }
        .step-counter {
          color: #00FF87;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
        }
      `}} />

      {/* Header Info */}
      <div className="text-center space-y-2">
        <h1 className="font-display text-4xl font-bold tracking-tight text-frost">
          Welcome to CarbonLens
        </h1>
        <p className="font-body text-sm text-muted">
          Let’s estimate your annual baseline footprint in 5 quick steps.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-data text-muted items-center">
          <span className="step-counter">STEP {currentStep + 1} OF 5</span>
          <span>{Math.round(progressPercent)}% COMPLETE</span>
        </div>
        <div 
          className="w-full rounded-full overflow-hidden" 
          style={{ height: '3px', backgroundColor: 'rgba(255,255,255,0.08)' }}
          role="progressbar" 
          aria-valuenow={progressPercent} 
          aria-valuemin={0} 
          aria-valuemax={100}
        >
          <div
            className="h-full"
            style={{ 
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #00FF87, #00C96B)',
              transition: 'width 400ms ease',
            }}
          />
        </div>
      </div>

      {/* Quiz Card */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="font-display text-xl md:text-2xl font-bold text-frost">
            {stepInfo.title}
          </h2>
          <p className="font-body text-xs text-muted">
            {stepInfo.description}
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label={stepInfo.title}>
          {stepInfo.options.map((opt) => {
            const isSelected = currentSelection === opt.label;
            return (
              <button
                key={opt.label}
                onClick={() => handleSelectOption(opt.label)}
                role="radio"
                aria-checked={isSelected}
                className={`p-4 rounded-xl text-left flex items-start space-x-3 onboarding-option-card ${
                  isSelected ? 'selected' : ''
                }`}
              >
                {isSelected && (
                  <span 
                    className="absolute top-2 right-2 text-xs font-bold" 
                    style={{ color: '#00FF87' }}
                  >
                    ✓
                  </span>
                )}
                <span className="text-2xl mt-0.5" role="img" aria-hidden="true">
                  {opt.icon}
                </span>
                <div className="flex flex-col space-y-0.5 pr-4">
                  <span className="font-body font-semibold text-xs">{opt.label}</span>
                  <span className="font-body text-[10px] text-muted leading-tight">{opt.desc}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`px-5 py-2.5 rounded-xl font-display text-sm font-semibold transition-colors ${
              currentStep === 0
                ? 'opacity-30 cursor-not-allowed text-muted'
                : 'text-frost hover:bg-white/5'
            }`}
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!currentSelection}
            className={`px-6 py-2.5 rounded-xl font-display text-sm font-bold shadow-lg transition-all duration-200 ${
              currentSelection
                ? 'bg-green hover:bg-green-dim text-void shadow-green/10 hover:shadow-green/20'
                : 'bg-border text-muted cursor-not-allowed'
            }`}
          >
            {currentStep === STEPS.length - 1 ? 'Calculate Footprint 🌍' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
