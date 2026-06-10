'use client';

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface DonutChartProps {
  data: {
    transport: number;
    food: number;
    energy: number;
    shopping: number;
    travel: number;
  };
}

const COLORS = {
  transport: '#00FF87', // green
  food: '#FFB347',      // amber
  energy: '#00C96B',    // green-dim
  shopping: '#8899AA',  // muted
  travel: '#FF6B6B',    // coral
};

export default function DonutChart({ data }: DonutChartProps) {
  const chartData = [
    { name: 'Transport', value: data.transport, color: COLORS.transport },
    { name: 'Food', value: data.food, color: COLORS.food },
    { name: 'Energy', value: data.energy, color: COLORS.energy },
    { name: 'Shopping', value: data.shopping, color: COLORS.shopping },
    { name: 'Travel', value: data.travel, color: COLORS.travel },
  ].filter((d) => d.value > 0);

  const hasData = chartData.length > 0;

  return (
    <div
      className="glass-panel rounded-2xl p-5 flex flex-col h-[320px] relative hover:border-white/20 transition-all duration-300"
      aria-label="Donut Chart: Carbon footprint category breakdown for this month."
    >
      <h3 className="font-display text-sm font-semibold text-muted mb-4">
        Category Breakdown
      </h3>

      <div className="flex-1 min-h-0 relative flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
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
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-[11px] font-body text-muted hover:text-frost transition-colors px-1">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-xs text-muted font-body">
            No activities logged this month.
          </div>
        )}
      </div>

      {/* Screen Reader Table Alternative */}
      <div className="sr-only">
        <h4>Category Breakdown Table</h4>
        <table>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">CO₂ Emissions (kg)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Transport</td>
              <td>{data.transport} kg</td>
            </tr>
            <tr>
              <td>Food</td>
              <td>{data.food} kg</td>
            </tr>
            <tr>
              <td>Energy</td>
              <td>{data.energy} kg</td>
            </tr>
            <tr>
              <td>Shopping</td>
              <td>{data.shopping} kg</td>
            </tr>
            <tr>
              <td>Travel</td>
              <td>{data.travel} kg</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
