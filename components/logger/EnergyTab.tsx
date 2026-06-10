'use client';

import React, { useState } from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { calculateEnergyEmission } from '../../lib/calculations';
import { GRID_STATE_FACTORS } from '../../lib/emissionFactors';

interface EnergyTabProps {
  onSuccess: () => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export default function EnergyTab({ onSuccess }: EnergyTabProps) {
  const { logActivity } = useCarbon();

  const [electricityKwh, setElectricityKwh] = useState('');
  const [state, setState] = useState('Delhi');
  const [lpgCylinders, setLpgCylinders] = useState('');
  const [generatorHours, setGeneratorHours] = useState('');
  const [generatorFuel, setGeneratorFuel] = useState('Petrol');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const numElectricity = Number(electricityKwh) || 0;
  const numLpg = Number(lpgCylinders) || 0;
  const numGenHours = Number(generatorHours) || 0;

  const computedCo2 = calculateEnergyEmission(
    numElectricity,
    state,
    numLpg,
    numGenHours,
    generatorFuel
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numElectricity <= 0 && numLpg <= 0 && numGenHours <= 0) return;

    const descParts = [];
    if (numElectricity > 0) descParts.push(`${numElectricity} kWh electricity (${state})`);
    if (numLpg > 0) descParts.push(`${numLpg} LPG cylinder${numLpg > 1 ? 's' : ''}`);
    if (numGenHours > 0) descParts.push(`${numGenHours}h gen (${generatorFuel})`);

    logActivity({
      category: 'energy',
      date,
      description: descParts.join(', ') || 'Household Energy Use',
      co2: computedCo2,
      details: {
        electricityKwh: numElectricity,
        state,
        lpgCylinders: numLpg,
        generatorHours: numGenHours,
        generatorFuel,
      },
    });

    onSuccess();
  };

  const isInvalid = numElectricity <= 0 && numLpg <= 0 && numGenHours <= 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* State Selector */}
      <div className="flex flex-col space-y-1">
        <label htmlFor="state-select" className="text-xs text-muted font-body">
          Indian State (For Grid Factor)
        </label>
        <select
          id="state-select"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full bg-white/5 border border-border rounded-xl p-3 text-sm text-frost focus:border-green transition-all"
        >
          {INDIAN_STATES.map((st) => (
            <option key={st} value={st} className="bg-[#0D1117] text-frost">
              {st} ({GRID_STATE_FACTORS[st] || GRID_STATE_FACTORS['Default']} kg/kWh)
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Electricity */}
        <div className="flex flex-col space-y-1">
          <label htmlFor="electricity" className="text-xs text-muted font-body">
            Electricity (kWh)
          </label>
          <input
            id="electricity"
            type="number"
            placeholder="e.g. 150"
            value={electricityKwh}
            onChange={(e) => setElectricityKwh(e.target.value)}
            min="0"
            max="10000"
            className="w-full bg-white/5 border border-border rounded-xl p-3 text-sm text-frost focus:border-green transition-all"
          />
        </div>

        {/* LPG */}
        <div className="flex flex-col space-y-1">
          <label htmlFor="lpg" className="text-xs text-muted font-body">
            LPG Cylinders
          </label>
          <input
            id="lpg"
            type="number"
            placeholder="e.g. 1"
            value={lpgCylinders}
            onChange={(e) => setLpgCylinders(e.target.value)}
            min="0"
            max="100"
            className="w-full bg-white/5 border border-border rounded-xl p-3 text-sm text-frost focus:border-green transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-border/20 pt-3">
        {/* Generator Hours */}
        <div className="flex flex-col space-y-1">
          <label htmlFor="gen-hours" className="text-xs text-muted font-body">
            Generator Hours
          </label>
          <input
            id="gen-hours"
            type="number"
            placeholder="e.g. 2"
            value={generatorHours}
            onChange={(e) => setGeneratorHours(e.target.value)}
            min="0"
            max="240"
            className="w-full bg-white/5 border border-border rounded-xl p-3 text-sm text-frost focus:border-green transition-all"
          />
        </div>

        {/* Generator Fuel */}
        <div className="flex flex-col space-y-1">
          <label htmlFor="gen-fuel" className="text-xs text-muted font-body">
            Generator Fuel
          </label>
          <select
            id="gen-fuel"
            value={generatorFuel}
            onChange={(e) => setGeneratorFuel(e.target.value)}
            className="w-full bg-white/5 border border-border rounded-xl p-3 text-sm text-frost focus:border-green transition-all"
          >
            <option value="Petrol" className="bg-[#0D1117]">Petrol (2.31 kg/L)</option>
            <option value="Diesel" className="bg-[#0D1117]">Diesel (2.68 kg/L)</option>
          </select>
        </div>
      </div>

      {/* Date */}
      <div className="flex flex-col space-y-1">
        <label htmlFor="energy-date" className="text-xs text-muted font-body">
          Billing / Consumption Date
        </label>
        <input
          id="energy-date"
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
          disabled={isInvalid}
          className={`px-5 py-2.5 rounded-xl font-display text-sm font-bold shadow-lg transition-all ${
            !isInvalid
              ? 'bg-green hover:bg-green-dim text-void hover:shadow-green/20'
              : 'bg-white/5 text-muted cursor-not-allowed border border-border'
          }`}
        >
          Log Energy Use
        </button>
      </div>
    </form>
  );
}
