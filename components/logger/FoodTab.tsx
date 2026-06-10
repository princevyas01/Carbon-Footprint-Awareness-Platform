'use client';

import React, { useState } from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { calculateFoodEmission } from '../../lib/calculations';
import { FOOD_FACTORS } from '../../lib/emissionFactors';

interface FoodTabProps {
  onSuccess: () => void;
}

export default function FoodTab({ onSuccess }: FoodTabProps) {
  const { state, logActivity, showToast } = useCarbon();

  const [mealSlot, setMealSlot] = useState('Lunch');
  const [mealType, setMealType] = useState('Rice meal');
  const [servings, setServings] = useState(1);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const computedCo2 = calculateFoodEmission(mealType, servings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logActivity({
      category: 'food',
      date,
      description: `${mealSlot}: ${mealType} (${servings} serving${servings > 1 ? 's' : ''})`,
      co2: computedCo2,
      details: { mealSlot, mealType, servings },
    });
    onSuccess();
  };

  const handleCopyYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Try to find a food log from yesterday
    const yesterdayFoodLog = state.logs.find(
      (log) => log.category === 'food' && log.date === yesterdayStr
    );

    if (yesterdayFoodLog) {
      if (yesterdayFoodLog.details.mealSlot) setMealSlot(yesterdayFoodLog.details.mealSlot);
      if (yesterdayFoodLog.details.mealType) setMealType(yesterdayFoodLog.details.mealType);
      if (yesterdayFoodLog.details.servings) setServings(yesterdayFoodLog.details.servings);
      showToast('Copied yesterday’s food log! 🍽️', 'info');
    } else {
      // Fallback: search for any last food log
      const anyLastFoodLog = state.logs.find((log) => log.category === 'food');
      if (anyLastFoodLog) {
        if (anyLastFoodLog.details.mealSlot) setMealSlot(anyLastFoodLog.details.mealSlot);
        if (anyLastFoodLog.details.mealType) setMealType(anyLastFoodLog.details.mealType);
        if (anyLastFoodLog.details.servings) setServings(anyLastFoodLog.details.servings);
        showToast('No log found for yesterday. Copied your most recent food log instead! 🍽️', 'info');
      } else {
        showToast('No previous food logs found to copy.', 'warning');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-zinc-300 mb-3">
        Food production causes ~26% of global emissions.
        A beef meal produces 44× more CO₂ than a vegan thali.
        (Source: Poore & Nemecek, Science 2018)
      </p>
      {/* Quick-log button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleCopyYesterday}
          className="text-[11px] font-display font-semibold text-green bg-green/5 border border-green/20 px-3 py-1.5 rounded-xl hover:bg-green/10 transition-colors"
        >
          🔄 Same as yesterday
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Meal Slot */}
        <div className="flex flex-col space-y-1">
          <label htmlFor="meal-slot" className="text-xs text-muted font-body">
            Meal Slot
          </label>
          <select
            id="meal-slot"
            value={mealSlot}
            onChange={(e) => setMealSlot(e.target.value)}
            className="w-full bg-white/5 border border-border rounded-xl p-3 text-sm text-frost focus:border-green transition-all"
          >
            {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((slot) => (
              <option key={slot} value={slot} className="bg-[#0D1117] text-frost">
                {slot}
              </option>
            ))}
          </select>
        </div>

        {/* Servings */}
        <div className="flex flex-col space-y-1">
          <label htmlFor="servings" className="text-xs text-muted font-body">
            Servings
          </label>
          <select
            id="servings"
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            className="w-full bg-white/5 border border-border rounded-xl p-3 text-sm text-frost focus:border-green transition-all"
          >
            {[1, 2, 3, 4].map((num) => (
              <option key={num} value={num} className="bg-[#0D1117] text-frost">
                {num}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Meal Type */}
      <div className="flex flex-col space-y-1">
        <label htmlFor="meal-type" className="text-xs text-muted font-body">
          Meal Type
        </label>
        <select
          id="meal-type"
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
          className="w-full bg-white/5 border border-border rounded-xl p-3 text-sm text-frost focus:border-green transition-all"
        >
          {Object.keys(FOOD_FACTORS).map((type) => (
            <option key={type} value={type} className="bg-[#0D1117] text-frost">
              {type} ({FOOD_FACTORS[type]} kg/serving)
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div className="flex flex-col space-y-1">
        <label htmlFor="food-date" className="text-xs text-muted font-body">
          Meal Date
        </label>
        <input
          id="food-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          max={new Date().toISOString().split('T')[0]}
          className="w-full bg-white/5 border border-border rounded-xl p-3 text-sm text-frost focus:border-green transition-all"
        />
      </div>

      {/* Calculator Display & Submit */}
      <div className="pt-4 border-t border-border flex items-center justify-between">
        <div className="text-left">
          <p className="text-[10px] text-muted uppercase font-data font-semibold">
            Estimated Carbon
          </p>
          <p className="text-xl font-bold font-data text-green">{computedCo2} kg CO₂</p>
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-green hover:bg-green-dim text-void font-display font-bold text-sm rounded-xl shadow-lg shadow-green/10 hover:shadow-green/20 transition-all"
        >
          Log Meal
        </button>
      </div>
    </form>
  );
}
