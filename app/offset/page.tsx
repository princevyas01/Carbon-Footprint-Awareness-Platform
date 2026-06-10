'use client';

import React, { useState } from 'react';
import { useCarbonData } from '../../hooks/useCarbonData';
import { Leaf, Info, Calculator, ExternalLink, Award } from 'lucide-react';

const SCHEMES = [
  {
    name: 'Cauvery Calling',
    location: 'Cauvery Basin, Tamil Nadu & Karnataka',
    type: 'Agroforestry & Soil Restoration',
    certification: 'Verra VCS / Gold Standard',
    costPerTree: 42,
    description: 'Enables farmers to plant endemic shade-grown trees on private farmland, restoring organic matter to river basin soil and increasing carbon storage.',
  },
  {
    name: 'Sundarbans Mangrove Restoration',
    location: 'Sundarbans Coastal Belt, West Bengal',
    type: 'Mangrove Protection & Afforestation',
    certification: 'Plan Vivo / Verified CDM',
    costPerTree: 90,
    description: 'Replants saline-tolerant mangrove varieties in vulnerable coastal delta zones, which store up to 4x more carbon than tropical rainforests.',
  },
  {
    name: 'Himalayan Reforestation',
    location: 'Alpine Zones, Uttarakhand',
    type: 'Alpine Native Reforestation',
    certification: 'Gold Standard Certified',
    costPerTree: 120,
    description: 'Restores high-altitude broadleaf ecosystems affected by landslides and deforestation, bolstering local biodiversity and soil water retention.',
  },
];

export default function OffsetPage() {
  const { monthlyTotal } = useCarbonData();
  const [treeCount, setTreeCount] = useState(10);

  // Absorption metrics:
  // 1 tree absorbs ~20 kg CO₂ per year (which is 20 / 12 = 1.67 kg CO₂ per month)
  const annualAbsorption = treeCount * 20;
  const monthlyAbsorption = treeCount * (20 / 12);

  // Calculate trees needed to offset monthly footprint completely
  // trees needed = monthlyTotal / (20 / 12) = monthlyTotal * 0.6
  const treesNeededForNeutral = Math.ceil(monthlyTotal / (20 / 12));
  const offsetPercentage = monthlyTotal > 0 ? (monthlyAbsorption / monthlyTotal) * 100 : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Panel */}
      <div className="p-6 glass-panel rounded-3xl space-y-1">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-frost">
          Carbon Offsetting
        </h1>
        <p className="font-body text-xs text-muted">
          Plant native trees to neutralise your remaining emissions through verified Indian schemes.
        </p>
      </div>

      {/* Interactive Tree Calculator Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6" aria-label="Interactive Tree Calculator">
        {/* Slider Card */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-2">
            <h2 className="font-display text-base md:text-lg font-bold text-frost flex items-center gap-1.5">
              <Calculator className="h-5 w-5 text-green" /> Tree Plantation Simulator
            </h2>
            <p className="font-body text-xs text-muted leading-relaxed">
              Drag the slider to calculate how many trees you could plant and see their direct carbon reduction.
            </p>
          </div>

          {/* Slider input */}
          <div className="space-y-3 py-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-semibold text-frost">Tree Count</span>
              <span className="font-data text-2xl font-bold text-green">{treeCount} trees</span>
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              value={treeCount}
              onChange={(e) => setTreeCount(Number(e.target.value))}
              className="w-full h-2 bg-white/5 border border-border rounded-lg appearance-none cursor-pointer accent-green"
              aria-label="Adjust simulated tree count"
            />
            <div className="flex justify-between text-[10px] font-data text-muted">
              <span>0</span>
              <span>500</span>
              <span>1000</span>
            </div>
          </div>

          {/* Statistics summary */}
          <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
            <div>
              <span className="text-[10px] text-muted font-data uppercase block leading-none">
                Annual Absorption
              </span>
              <span className="font-data text-xl font-bold text-frost">
                ~{annualAbsorption.toFixed(0)} <span className="text-xs font-body text-muted">kg CO₂/yr</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted font-data uppercase block leading-none">
                Monthly Equivalent
              </span>
              <span className="font-data text-xl font-bold text-frost">
                ~{monthlyAbsorption.toFixed(1)} <span className="text-xs font-body text-muted">kg CO₂/mo</span>
              </span>
            </div>
          </div>
        </div>

        {/* Impact Neutral Card */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between border-green/20 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-green/5 blur-xl pointer-events-none" />

          <div className="space-y-2">
            <h3 className="font-display text-sm font-semibold text-muted">Your Carbon Neutral Goal</h3>
            <p className="font-body text-xs text-muted leading-relaxed">
              Based on your monthly footprint of <strong>{monthlyTotal.toFixed(1)} kg CO₂</strong>:
            </p>
          </div>

          <div className="py-4 space-y-2 text-center">
            <span className="text-[10px] text-muted uppercase font-data block">Trees Required</span>
            <span className="font-data text-4xl font-bold text-green block">
              {treesNeededForNeutral}
            </span>
            <span className="text-[10px] text-muted font-body leading-none block">
              planted trees would offset your lifestyle monthly.
            </span>
          </div>

          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex justify-between items-center text-xs font-body">
              <span className="text-muted">Simulated Offset:</span>
              <span className="font-semibold text-frost">{offsetPercentage.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-green transition-all duration-300"
                style={{ width: `${Math.min(offsetPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Certified Indian Offset Schemes */}
      <section className="space-y-4" aria-label="Certified Indian Offset Schemes list">
        <h2 className="font-display text-lg font-bold text-frost flex items-center gap-1.5">
          <Leaf className="h-5 w-5 text-green" /> Verified India Forestry Schemes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SCHEMES.map((s) => {
            const simulatedCost = treeCount * s.costPerTree;
            return (
              <div
                key={s.name}
                className="glass-panel hover:border-white/20 transition-all duration-300 p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <h3 className="font-display text-sm font-bold text-frost flex items-center justify-between">
                      {s.name}
                      <span className="text-[9px] bg-white/5 border border-border px-2 py-0.5 rounded-full font-semibold font-body text-muted flex items-center gap-1">
                        <Award className="h-3 w-3 text-green" /> Certified
                      </span>
                    </h3>
                    <p className="text-[10px] text-muted font-body">{s.location}</p>
                  </div>

                  <p className="font-body text-xs text-muted leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex justify-between text-[10px] font-data text-muted">
                    <span>Cert: {s.certification}</span>
                    <span>₹{s.costPerTree}/tree</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-muted block uppercase leading-none">Est Cost ({treeCount} trees)</span>
                      <span className="font-data font-bold text-green text-sm">₹{simulatedCost.toLocaleString('en-IN')}</span>
                    </div>

                    <a
                      href="#"
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-frost rounded-lg border border-border flex items-center gap-1 font-display text-[10px] font-semibold transition-all"
                      aria-label={`Visit official page for ${s.name}`}
                    >
                      Info <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* General Offset Info Note */}
      <div className="flex gap-2 p-4 rounded-2xl bg-white/5 border border-border text-xs text-muted font-body">
        <Info className="h-4 w-4 text-green shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Carbon offsetting should only be utilized as a secondary tool for emissions that are 
          historically difficult to avoid (like emergency flights). Our primary goal must always be to 
          <strong> reduce direct emissions at source</strong> through behavioral updates and smart clean grids!
        </p>
      </div>
    </div>
  );
}
