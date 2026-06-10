'use client';

import React, { useState } from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { calculateTravelEmission } from '../../lib/calculations';
import { INDIAN_CITIES, getCityDistance } from '../../lib/cityDistances';
import { FLIGHT_CLASS_MULTIPLIERS } from '../../lib/emissionFactors';

interface TravelTabProps {
  onSuccess: () => void;
}

export default function TravelTab({ onSuccess }: TravelTabProps) {
  const { logActivity } = useCarbon();

  const [fromCity, setFromCity] = useState('Mumbai');
  const [toCity, setToCity] = useState('Delhi');
  const [travelClass, setTravelClass] = useState('Economy');
  const [isReturn, setIsReturn] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const distance = getCityDistance(fromCity, toCity);
  const displayDistance = isReturn ? distance * 2 : distance;
  const computedCo2 = calculateTravelEmission(fromCity, toCity, travelClass, isReturn);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromCity === toCity) return;

    logActivity({
      category: 'travel',
      date,
      description: `Flight: ${fromCity} ↔ ${toCity} (${travelClass}, ${isReturn ? 'Return' : 'One-way'})`,
      co2: computedCo2,
      details: {
        fromCity,
        toCity,
        travelClass,
        isReturn,
      },
    });

    onSuccess();
  };

  const isInvalid = fromCity === toCity;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Route Selectors */}
      <div className="grid grid-cols-2 gap-3">
        {/* From City */}
        <div className="flex flex-col space-y-1">
          <label htmlFor="from-city" className="text-xs text-muted font-body">
            Departure City
          </label>
          <select
            id="from-city"
            value={fromCity}
            onChange={(e) => setFromCity(e.target.value)}
            className="w-full bg-white/5 border border-border rounded-xl p-3 text-sm text-frost focus:border-green transition-all"
          >
            {INDIAN_CITIES.map((city) => (
              <option key={city} value={city} className="bg-[#0D1117] text-frost">
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* To City */}
        <div className="flex flex-col space-y-1">
          <label htmlFor="to-city" className="text-xs text-muted font-body">
            Destination City
          </label>
          <select
            id="to-city"
            value={toCity}
            onChange={(e) => setToCity(e.target.value)}
            className="w-full bg-white/5 border border-border rounded-xl p-3 text-sm text-frost focus:border-green transition-all"
          >
            {INDIAN_CITIES.map((city) => (
              <option key={city} value={city} className="bg-[#0D1117] text-frost">
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isInvalid && (
        <p className="text-[10px] text-coral font-body leading-none" role="alert">
          Departure and Destination cities cannot be the same.
        </p>
      )}

      {/* Flight Class */}
      <div className="flex flex-col space-y-1">
        <label htmlFor="flight-class" className="text-xs text-muted font-body">
          Cabin Class
        </label>
        <select
          id="flight-class"
          value={travelClass}
          onChange={(e) => setTravelClass(e.target.value)}
          className="w-full bg-white/5 border border-border rounded-xl p-3 text-sm text-frost focus:border-green transition-all"
        >
          {Object.keys(FLIGHT_CLASS_MULTIPLIERS).map((cls) => (
            <option key={cls} value={cls} className="bg-[#0D1117] text-frost">
              {cls} Class ({FLIGHT_CLASS_MULTIPLIERS[cls]}x emissions)
            </option>
          ))}
        </select>
      </div>

      {/* Return trip toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border">
        <div className="flex flex-col space-y-0.5">
          <label htmlFor="return-trip-checkbox" className="text-xs font-semibold text-frost">
            Return Trip
          </label>
          <span className="text-[10px] text-muted leading-tight">
            Doubles the flight route distance and emissions.
          </span>
        </div>
        <input
          id="return-trip-checkbox"
          type="checkbox"
          checked={isReturn}
          onChange={(e) => setIsReturn(e.target.checked)}
          className="w-4 h-4 rounded text-green bg-white/5 border-border focus:ring-green cursor-pointer"
        />
      </div>

      {/* Date */}
      <div className="flex flex-col space-y-1">
        <label htmlFor="flight-date" className="text-xs text-muted font-body">
          Flight Date
        </label>
        <input
          id="flight-date"
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
            Flight Distance & Carbon
          </p>
          <p className="text-xs text-muted font-data leading-none mb-1">
            Route: {displayDistance} km
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
          Log Flight
        </button>
      </div>
    </form>
  );
}
