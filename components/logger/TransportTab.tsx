'use client';

import React, { useState } from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { calculateTransportEmission } from '../../lib/calculations';
import { TRANSPORT_FACTORS } from '../../lib/emissionFactors';

interface TransportTabProps {
  onSuccess: () => void;
}

export default function TransportTab({ onSuccess }: TransportTabProps) {
  const { logActivity } = useCarbon();

  const [vehicleType, setVehicleType] = useState('Petrol car');
  const [distance, setDistance] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const numDistance = Number(distance) || 0;
  const computedCo2 = calculateTransportEmission(vehicleType, numDistance);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numDistance <= 0) return;

    logActivity({
      category: 'transport',
      date,
      description: `${vehicleType} - ${numDistance} km commute`,
      co2: computedCo2,
      details: { vehicleType, distance: numDistance },
    });
    
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-zinc-300 mb-3">
        Transport accounts for ~30% of {"India's"} urban carbon
        emissions. Switching from a petrol car to metro saves
        up to 94% CO₂ per km. (Source: IEA, IPCC AR6)
      </p>
      {/* Vehicle Type */}
      <div className="flex flex-col space-y-1">
        <label htmlFor="vehicle-type" className="text-xs text-muted font-body">
          Vehicle Commute Mode
        </label>
        <select
          id="vehicle-type"
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          className="w-full bg-white/5 border border-border rounded-xl p-3 text-sm text-frost focus:border-green transition-all"
        >
          {Object.keys(TRANSPORT_FACTORS).map((type) => (
            <option key={type} value={type} className="bg-[#0D1117] text-frost">
              {type} ({TRANSPORT_FACTORS[type]} kg/km)
            </option>
          ))}
        </select>
      </div>

      {/* Distance */}
      <div className="flex flex-col space-y-1">
        <label htmlFor="distance" className="text-xs text-muted font-body">
          Distance Travelled (km)
        </label>
        <input
          id="distance"
          type="number"
          placeholder="e.g. 15"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          min="1"
          max="2000"
          required
          className="w-full bg-white/5 border border-border rounded-xl p-3 text-sm text-frost focus:border-green transition-all"
        />
        <span className="text-[10px] text-muted font-body">
          Values are automatically clamped up to 2000 km.
        </span>
      </div>

      {/* Date */}
      <div className="flex flex-col space-y-1">
        <label htmlFor="log-date" className="text-xs text-muted font-body">
          Commute Date
        </label>
        <input
          id="log-date"
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
          disabled={numDistance <= 0}
          className={`px-5 py-2.5 rounded-xl font-display text-sm font-bold shadow-lg transition-all ${
            numDistance > 0
              ? 'bg-green hover:bg-green-dim text-void hover:shadow-green/20'
              : 'bg-white/5 text-muted cursor-not-allowed border border-border'
          }`}
        >
          Log Commute
        </button>
      </div>
    </form>
  );
}
