'use client';

import React, { useState } from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { calculateShoppingEmission } from '../../lib/calculations';
import { SHOPPING_FACTORS } from '../../lib/emissionFactors';

interface ShoppingTabProps {
  onSuccess: () => void;
}

export default function ShoppingTab({ onSuccess }: ShoppingTabProps) {
  const { logActivity } = useCarbon();

  const [category, setCategory] = useState('Clothing');
  const [spend, setSpend] = useState('');
  const [isSecondHand, setIsSecondHand] = useState(false);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const numSpend = Number(spend) || 0;
  const computedCo2 = calculateShoppingEmission(category, numSpend, isSecondHand);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numSpend <= 0) return;

    const descText = description.trim() || `${category} Purchase`;
    const label = isSecondHand ? `${descText} (Second-hand)` : descText;

    logActivity({
      category: 'shopping',
      date,
      description: `${label} - ₹${numSpend}`,
      co2: computedCo2,
      details: {
        shoppingCategory: category,
        spend: numSpend,
        isSecondHand,
      },
    });

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-zinc-300 mb-3">
        Manufacturing new clothing emits 0.012 kg CO₂/₹ spent.
        Choosing second-hand reduces this by 80%.
        (Source: Ellen MacArthur Foundation)
      </p>
      <div className="grid grid-cols-2 gap-3">
        {/* Shopping Category */}
        <div className="flex flex-col space-y-1">
          <label htmlFor="shopping-category" className="text-xs text-muted font-body">
            Item Category
          </label>
          <select
            id="shopping-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white/5 border border-border rounded-xl p-3 text-sm text-frost focus:border-green transition-all"
          >
            {Object.keys(SHOPPING_FACTORS).map((cat) => (
              <option key={cat} value={cat} className="bg-[#0D1117] text-frost">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Spend */}
        <div className="flex flex-col space-y-1">
          <label htmlFor="spend" className="text-xs text-muted font-body">
            Spend Amount (₹)
          </label>
          <input
            id="spend"
            type="number"
            placeholder="e.g. 1500"
            value={spend}
            onChange={(e) => setSpend(e.target.value)}
            min="1"
            max="500000"
            required
            className="w-full bg-white/5 border border-border rounded-xl p-3 text-sm text-frost focus:border-green transition-all"
          />
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col space-y-1">
        <label htmlFor="description" className="text-xs text-muted font-body">
          Description / Item Name
        </label>
        <input
          id="description"
          type="text"
          placeholder="e.g. Cotton T-shirt (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-white/5 border border-border rounded-xl p-3 text-sm text-frost focus:border-green transition-all"
        />
      </div>

      {/* Second Hand Toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border">
        <div className="flex flex-col space-y-0.5">
          <label htmlFor="second-hand-toggle" className="text-xs font-semibold text-frost">
            Second-hand / Refurbished
          </label>
          <span className="text-[10px] text-muted leading-tight">
            Emissions are reduced to 20% of retail items.
          </span>
        </div>
        <input
          id="second-hand-toggle"
          type="checkbox"
          checked={isSecondHand}
          onChange={(e) => setIsSecondHand(e.target.checked)}
          className="w-4 h-4 rounded text-green bg-white/5 border-border focus:ring-green cursor-pointer"
        />
      </div>

      {/* Date */}
      <div className="flex flex-col space-y-1">
        <label htmlFor="shopping-date" className="text-xs text-muted font-body">
          Purchase Date
        </label>
        <input
          id="shopping-date"
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
          disabled={numSpend <= 0}
          className={`px-5 py-2.5 rounded-xl font-display text-sm font-bold shadow-lg transition-all ${
            numSpend > 0
              ? 'bg-green hover:bg-green-dim text-void hover:shadow-green/20'
              : 'bg-white/5 text-muted cursor-not-allowed border border-border'
          }`}
        >
          Log Purchase
        </button>
      </div>
    </form>
  );
}
