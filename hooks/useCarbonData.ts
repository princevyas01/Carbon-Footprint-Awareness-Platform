import { useMemo } from 'react';
import { useCarbon } from '../context/CarbonContext';
import { Category, ChartDataPoint, MonthlyStats, CategoryBreakdown } from '../types';

export function useCarbonData() {
  const { state } = useCarbon();
  const { logs, challenges } = state;

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 1. Filter current month logs
    const currentMonthLogs = logs.filter((log) => {
      const logDate = new Date(log.date);
      return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
    });

    // 2. Calculate current month total
    const monthlyTotal = Number(currentMonthLogs.reduce((sum, log) => sum + log.co2, 0).toFixed(1));

    // 3. Category Breakdown for current month
    const categoryBreakdown: CategoryBreakdown = {
      transport: 0,
      food: 0,
      energy: 0,
      shopping: 0,
      travel: 0,
    };

    currentMonthLogs.forEach((log) => {
      if (categoryBreakdown[log.category] !== undefined) {
        categoryBreakdown[log.category] += log.co2;
      }
    });

    // Clean decimals
    (Object.keys(categoryBreakdown) as Category[]).forEach((cat) => {
      categoryBreakdown[cat] = Number(categoryBreakdown[cat].toFixed(1));
    });

    // 4. Category Percentages
    const categoryPercentages = {
      transport: 0,
      food: 0,
      energy: 0,
      shopping: 0,
      travel: 0,
    };

    if (monthlyTotal > 0) {
      (Object.keys(categoryBreakdown) as Category[]).forEach((cat) => {
        categoryPercentages[cat] = Number(
          ((categoryBreakdown[cat] / monthlyTotal) * 100).toFixed(1)
        );
      });
    }

    // 5. Comparison: This Month vs Last Month vs India Average (158 kg)
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastMonthLogs = logs.filter((log) => {
      const logDate = new Date(log.date);
      return logDate.getMonth() === lastMonth && logDate.getFullYear() === lastMonthYear;
    });
    const lastMonthTotal = Number(lastMonthLogs.reduce((sum, log) => sum + log.co2, 0).toFixed(1));

    const comparisonData = [
      { name: 'Last Month', co2: lastMonthTotal, fill: '#8899AA' },
      { name: 'This Month', co2: monthlyTotal, fill: monthlyTotal > 158 ? '#FF6B6B' : '#00FF87' },
      { name: 'India Avg', co2: 158, fill: '#FFB347' },
    ];

    // 6. 8-Week Trend Data (emissions per week for last 8 weeks)
    const trendData: ChartDataPoint[] = [];
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    
    for (let i = 7; i >= 0; i--) {
      const weekStartMs = now.getTime() - (i + 1) * oneWeekMs;
      const weekEndMs = now.getTime() - i * oneWeekMs;

      const weekLogs = logs.filter((log) => {
        const logMs = new Date(log.date).getTime();
        return logMs >= weekStartMs && logMs < weekEndMs;
      });

      const weekTotal = Number(weekLogs.reduce((sum, log) => sum + log.co2, 0).toFixed(1));
      
      // Label like "Wk -7", ..., "Wk 0" (or dates)
      const label = i === 0 ? 'This Week' : `${i} wks ago`;
      trendData.push({ name: label, co2: weekTotal });
    }

    // 7. Lifetime Stats
    const totalCo2 = Number(logs.reduce((sum, log) => sum + log.co2, 0).toFixed(1));
    
    // Sum CO2 saved potential of completed challenges
    const savedCo2 = Number(
      challenges
        .filter((c) => c.status === 'Completed')
        .reduce((sum, c) => sum + c.co2SavedPotential, 0)
        .toFixed(1)
    );

    // Compute longest log streak (consecutive calendar days logged)
    const uniqueDatesSorted = Array.from(new Set(logs.map((l) => l.date))).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime() // newest first
    );

    let currentStreak = 0;
    let longestStreak = 0;
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (uniqueDatesSorted.length > 0) {
      currentStreak = 1;
      longestStreak = 1;
      for (let i = 0; i < uniqueDatesSorted.length - 1; i++) {
        const currDate = new Date(uniqueDatesSorted[i]);
        const nextDate = new Date(uniqueDatesSorted[i + 1]);
        const diffMs = currDate.getTime() - nextDate.getTime();
        const diffDays = Math.round(diffMs / oneDayMs);

        if (diffDays === 1) {
          currentStreak++;
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
          }
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      }
    }

    const treesNeeded = Number((totalCo2 / 1.75).toFixed(1));

    const lifetimeStats = {
      totalCo2,
      savedCo2,
      longestStreak,
      treesNeeded,
    };

    // 8. Monthly report cards (last 6 months)
    const monthlyReports: MonthlyStats[] = [];
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    for (let i = 0; i < 6; i++) {
      const targetDate = new Date();
      targetDate.setMonth(now.getMonth() - i);
      const targetMonth = targetDate.getMonth();
      const targetYear = targetDate.getFullYear();

      const mLogs = logs.filter((log) => {
        const lDate = new Date(log.date);
        return lDate.getMonth() === targetMonth && lDate.getFullYear() === targetYear;
      });

      if (mLogs.length === 0 && i > 0) continue; // Skip older empty months, keep current month

      const mTotal = Number(mLogs.reduce((sum, log) => sum + log.co2, 0).toFixed(1));

      // Calculate best (lowest) and worst (highest) categories
      const mBreakdown: Record<Category, number> = {
        transport: 0,
        food: 0,
        energy: 0,
        shopping: 0,
        travel: 0,
      };

      mLogs.forEach((log) => {
        if (mBreakdown[log.category] !== undefined) {
          mBreakdown[log.category] += log.co2;
        }
      });

      const breakdownEntries = Object.entries(mBreakdown) as [Category, number][];
      
      // Best category (lowest emissions but > 0 if possible, or just lowest overall)
      const sortedByEmissions = [...breakdownEntries].sort((a, b) => a[1] - b[1]);
      const bestCategory = sortedByEmissions[0][0];
      const worstCategory = [...breakdownEntries].sort((a, b) => b[1] - a[1])[0][0];

      // Challenges completed in this target month
      // For simplicity, we check challenges completed, but challenges don't have completedDate.
      // We can count all completed challenges in lifetime as a proxy or if targetMonth is current month.
      const completedChallengesCount = challenges.filter((c) => c.status === 'Completed').length;

      monthlyReports.push({
        month: `${monthNames[targetMonth]} ${targetYear}`,
        totalCo2: mTotal,
        bestCategory: mTotal > 0 ? bestCategory : 'N/A',
        worstCategory: mTotal > 0 ? worstCategory : 'N/A',
        challengesDone: i === 0 ? completedChallengesCount : 0, // Mock completed count for history
      });
    }

    return {
      monthlyTotal,
      lastMonthTotal,
      categoryBreakdown,
      categoryPercentages,
      trendData,
      chartData: trendData,
      comparisonData,
      lifetimeStats,
      monthlyReports,
    };
  }, [logs, challenges]);

  return stats;
}
