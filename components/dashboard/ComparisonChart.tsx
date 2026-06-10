'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface ComparisonChartProps {
  data: {
    name: string;
    co2: number;
    fill: string;
  }[];
}

export default function ComparisonChart({ data }: ComparisonChartProps) {
  return (
    <div
      className="glass-panel rounded-2xl p-5 flex flex-col h-[280px] relative hover:border-white/20 transition-all duration-300"
      aria-label="Bar Chart: Footprint Comparison (Last Month vs This Month vs India Average)."
    >
      <h3 className="font-display text-sm font-semibold text-muted mb-4">
        Monthly Comparison vs India Avg
      </h3>

      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              itemStyle={{ color: 'var(--frost)' }}
              formatter={(value) => [`${Number(value).toFixed(1)} kg CO₂`, 'Emissions']}
            />
            <Bar dataKey="co2" radius={[8, 8, 0, 0]} barSize={40}>
              {data.map((entry, index) => {
                let fill = '#FFB347'; // Default India Avg
                if (entry.name === 'This Month') fill = '#00FF87';
                if (entry.name === 'Last Month') fill = '#4A9EFF';
                return <Cell key={`cell-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center items-center gap-4 mt-3 text-[11px] font-body text-muted">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#4A9EFF' }} />
          <span>Last Month</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#00FF87' }} />
          <span>This Month</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FFB347' }} />
          <span>India Average</span>
        </div>
      </div>

      {/* Screen Reader Table Alternative */}
      <div className="sr-only">
        <h4>Monthly Comparison Table</h4>
        <table>
          <thead>
            <tr>
              <th scope="col">Period</th>
              <th scope="col">CO₂ Emissions (kg)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.co2} kg</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
