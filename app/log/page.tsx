'use client';

import React, { useState } from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { Trash2, Plus, Calendar, FileText, Activity } from 'lucide-react';
import dynamic from 'next/dynamic';

const LogModal = dynamic(() => import('../../components/logger/LogModal'), { ssr: false });

const CATEGORY_COLORS: Record<string, string> = {
  transport: 'bg-green/10 border-green/30 text-green',
  food: 'bg-amber/10 border-amber/30 text-amber',
  energy: 'bg-green-dim/10 border-green-dim/30 text-green-dim',
  shopping: 'bg-white/5 border-border text-frost',
  travel: 'bg-coral/10 border-coral/30 text-coral',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  transport: '🚗',
  food: '🍽️',
  energy: '⚡',
  shopping: '📦',
  travel: '✈️',
};

export default function LogPage() {
  const { state, deleteActivity } = useCarbon();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Sort logs by date descending
  const sortedLogs = [...state.logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalEmissions = state.logs.reduce((sum, log) => sum + log.co2, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-panel rounded-3xl">
        <div className="space-y-1">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-frost">
            Activity History
          </h1>
          <p className="font-body text-xs text-muted">
            View, track, and manage your logged daily emissions.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Total display */}
          <div className="text-right">
            <span className="text-[10px] uppercase font-data text-muted block leading-none">
              Total Logged
            </span>
            <span className="font-data text-2xl font-bold text-green">
              {totalEmissions.toFixed(1)} <span className="text-xs font-body text-muted">kg</span>
            </span>
          </div>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="p-3 bg-green hover:bg-green-dim text-void rounded-xl font-display text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all"
            aria-label="Log new activity"
          >
            <Plus className="h-4 w-4" /> Log Activity
          </button>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {sortedLogs.length === 0 ? (
          <div className="p-16 text-center space-y-4 max-w-sm mx-auto">
            <div className="mx-auto w-12 h-12 bg-white/5 border border-border flex items-center justify-center rounded-full">
              <Activity className="h-5 w-5 text-muted" />
            </div>
            <div className="space-y-1">
              <h2 className="font-display text-sm font-bold text-frost">No activities logged yet</h2>
              <p className="font-body text-xs text-muted leading-relaxed">
                Start logging your transport, food, energy, shopping, or flight details to see your footprint.
              </p>
            </div>
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="px-4 py-2 border border-green/30 text-green hover:bg-green/5 rounded-xl font-display text-xs font-semibold transition-all"
            >
              Log First Entry 🌍
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-white/5 text-[11px] font-display font-semibold text-muted uppercase tracking-wider">
                    <th scope="col" className="p-4">Date</th>
                    <th scope="col" className="p-4">Category</th>
                    <th scope="col" className="p-4">Description</th>
                    <th scope="col" className="p-4 text-right">CO₂ Emissions</th>
                    <th scope="col" className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-border/50 hover:bg-white/5 transition-colors font-body text-xs text-frost"
                    >
                      <td className="p-4 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-muted">
                          <Calendar className="h-3.5 w-3.5" />
                          {log.date}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold uppercase ${CATEGORY_COLORS[log.category]}`}>
                          {CATEGORY_EMOJIS[log.category]} {log.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-muted" />
                          {log.description}
                        </span>
                      </td>
                      <td className="p-4 text-right font-data font-semibold text-frost">
                        {log.co2.toFixed(2)} kg
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => deleteActivity(log.id)}
                          className="p-1.5 rounded-lg text-muted hover:text-coral hover:bg-coral/10 border border-transparent hover:border-coral/20 transition-all"
                          title="Delete entry"
                          aria-label={`Delete entry: ${log.description}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards View */}
            <div className="md:hidden divide-y divide-border/50">
              {sortedLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 space-y-3 font-body text-xs hover:bg-white/5 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-muted">
                      <Calendar className="h-3.5 w-3.5" />
                      {log.date}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold uppercase ${CATEGORY_COLORS[log.category]}`}>
                      {CATEGORY_EMOJIS[log.category]} {log.category}
                    </span>
                  </div>

                  <p className="text-frost font-medium pl-1">{log.description}</p>

                  <div className="flex justify-between items-center pt-1">
                    <div>
                      <span className="text-[10px] text-muted block leading-none">Emissions</span>
                      <span className="font-data font-bold text-frost text-sm">
                        {log.co2.toFixed(2)} kg CO₂
                      </span>
                    </div>

                    <button
                      onClick={() => deleteActivity(log.id)}
                      className="p-2 border border-border hover:border-coral/20 text-muted hover:text-coral rounded-xl transition-all"
                      aria-label={`Delete entry: ${log.description}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {isLogModalOpen && <LogModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} />}
    </div>
  );
}
