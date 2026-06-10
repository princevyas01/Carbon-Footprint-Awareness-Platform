'use client';

import React, { useState } from 'react';
import { GRID_STATE_FACTORS } from '../../lib/emissionFactors';
import AILensCard from '../../components/dashboard/AILensCard';
import { Search, Info, ChevronDown, ChevronUp, Zap } from 'lucide-react';

export default function InsightsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAsc, setSortAsc] = useState<boolean | null>(null); // true = asc, false = desc, null = none

  const handleSort = () => {
    setSortAsc((prev) => (prev === null ? false : prev === false ? true : null));
  };

  // Prepare states list
  const stateEntries = Object.entries(GRID_STATE_FACTORS).filter(([name]) => name !== 'Default');
  
  // Filter search
  const filteredStates = stateEntries.filter(([name]) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort
  const sortedStates = [...filteredStates].sort((a, b) => {
    if (sortAsc === true) {
      return a[1] - b[1];
    } else if (sortAsc === false) {
      return b[1] - a[1];
    }
    return a[0].localeCompare(b[0]); // default alphabetical
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header Panel */}
      <div className="p-6 glass-panel rounded-3xl space-y-1">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-frost">
          Carbon Intelligence
        </h1>
        <p className="font-body text-xs text-muted">
          Compare state grid emission intensities and get personalized carbon coaching.
        </p>
      </div>

      {/* AI Coach Integration */}
      <section className="space-y-4" aria-label="AI Carbon Coach Insights">
        <h2 className="font-display text-lg font-bold text-frost flex items-center gap-1.5">
          <Zap className="h-5 w-5 text-green" /> AI Carbon Coach
        </h2>
        <AILensCard />
      </section>

      {/* State CEA Emission Reference Table */}
      <section className="space-y-4" aria-label="CEA State Grid Emission reference factors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h2 className="font-display text-lg font-bold text-frost flex items-center gap-1.5">
              🔌 CEA Grid Intensities
            </h2>
            <p className="font-body text-[11px] text-muted leading-tight">
              Indian Central Electricity Authority (CEA) grid CO₂ factors in kg/kWh.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search Indian State..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-frost focus:border-green transition-all"
              aria-label="Search Indian State emission factors"
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-white/5 text-[10px] font-display font-semibold text-muted uppercase tracking-wider">
                  <th scope="col" className="p-4">Indian State / Union Territory</th>
                  <th scope="col" className="p-4 text-right cursor-pointer select-none group" onClick={handleSort}>
                    <span className="flex items-center justify-end gap-1.5">
                      Emission Intensity (kg/kWh)
                      {sortAsc === true ? (
                        <ChevronUp className="h-3.5 w-3.5 text-green" />
                      ) : sortAsc === false ? (
                        <ChevronDown className="h-3.5 w-3.5 text-green" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 opacity-30 group-hover:opacity-100 transition-opacity" />
                      )}
                    </span>
                  </th>
                  <th scope="col" className="p-4 text-center">Efficiency Rating</th>
                </tr>
              </thead>
              <tbody>
                {sortedStates.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-xs text-muted font-body">
                      No states match your search.
                    </td>
                  </tr>
                ) : (
                  sortedStates.map(([name, factor]) => {
                    // Rating calculations
                    // CEA National Benchmark average is ~0.82
                    let rating = 'Average';
                    let ratingColor = 'text-amber bg-amber/5 border-amber/20';

                    if (factor < 0.55) {
                      rating = 'Highly Clean';
                      ratingColor = 'text-green bg-green/5 border-green/20';
                    } else if (factor < 0.75) {
                      rating = 'Moderate';
                      ratingColor = 'text-green-dim bg-green-dim/5 border-green-dim/20';
                    } else if (factor > 0.88) {
                      rating = 'Coal Heavy';
                      ratingColor = 'text-coral bg-coral/5 border-coral/20';
                    }

                    return (
                      <tr
                        key={name}
                        className="border-b border-border/50 hover:bg-white/5 transition-colors font-body text-xs text-frost"
                      >
                        <td className="p-4 font-semibold">{name}</td>
                        <td className="p-4 text-right font-data font-semibold text-frost">
                          {factor.toFixed(2)} kg/kWh
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block border px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase ${ratingColor}`}>
                            {rating}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* General Info Note */}
        <div className="flex gap-2 p-4 rounded-2xl bg-white/5 border border-border text-xs text-muted font-body">
          <Info className="h-4 w-4 text-green shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            States relying heavily on hydroelectric, solar, or nuclear generation (like Kerala or Karnataka) 
            have significantly lower carbon intensities than states using fossil-fuel grid coal combustion 
            (like Uttar Pradesh or West Bengal). Shifting energy usage or adopting solar panels is 
            especially impactful in fossil-heavy states!
          </p>
        </div>
      </section>
    </div>
  );
}
