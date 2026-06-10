'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { ChartDataPoint } from '../../types';

interface TrendChartProps {
  data: ChartDataPoint[];
}

export default function TrendChart({ data }: TrendChartProps) {
  const hasData = data.some((d) => d.co2 > 0);

  return (
    <div
      className="glass-panel rounded-2xl p-5 flex flex-col h-[320px] relative hover:border-white/20 transition-all duration-300"
      aria-label="Area Chart: 8-week carbon footprint emission trend."
    >
      <h3 className="font-display text-sm font-semibold text-muted mb-4">
        8-Week Trend
      </h3>

      <div className="flex-1 min-h-0 relative">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="trendGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF87" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00FF87" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="var(--muted)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="var(--muted)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dx={-5}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--space)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  color: 'var(--frost)',
                  fontFamily: 'var(--font-inter)',
                  fontSize: '11px',
                }}
                itemStyle={{ color: 'var(--frost)' }}
              />
              <Area
                type="monotone"
                dataKey="co2"
                stroke="#00FF87"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#trendGlow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-muted font-body">
            Not enough data to display trend.
          </div>
        )}
      </div>

      {/* Screen Reader Table Alternative */}
      <div className="sr-only">
        <h4>8-Week Trend Table</h4>
        <table>
          <thead>
            <tr>
              <th scope="col">Week</th>
              <th scope="col">CO₂ Emissions (kg)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point, index) => (
              <tr key={index}>
                <td>{point.name}</td>
                <td>{point.co2} kg</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
