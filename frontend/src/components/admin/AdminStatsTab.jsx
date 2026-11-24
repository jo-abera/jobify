import { useMemo } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { getChartGridColor, getChartTickColor, getChartTooltipTheme } from '../../utils/chartTheme';
import ApplicationsStatusCard from './ApplicationsStatusCard';

function StatCard({ label, value, color }) {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-5">
      <div className="mb-1 text-3xl font-semibold" style={{ color: color || 'var(--color-text-primary)' }}>
        {value ?? '—'}
      </div>
      <div className="text-sm text-text-secondary">{label}</div>
    </div>
  );
}

function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`rounded-xl border border-border bg-bg-card p-5 ${className}`}>
      <h3 className="mb-4 text-sm font-medium text-text-secondary">{title}</h3>
      {children}
    </div>
  );
}

export default function AdminStatsTab({ stats, loading }) {
  const { theme } = useTheme();

  const { baseOptions, horizontalOptions } = useMemo(() => {
    const tooltip = { ...getChartTooltipTheme(theme), borderWidth: 1 };
    const tick = getChartTickColor(theme);
    const grid = getChartGridColor(theme);
    const base = {
      responsive: true,
      plugins: {
        legend: { labels: { color: tick, font: { size: 12 } } },
        tooltip,
      },
      scales: {
        x: { ticks: { color: tick }, grid: { color: grid } },
        y: { ticks: { color: tick }, grid: { color: grid }, beginAtZero: true },
      },
    };
    const horizontal = {
      ...base,
      indexAxis: 'y',
      scales: {
        x: { ticks: { color: tick }, grid: { color: grid }, beginAtZero: true },
        y: { ticks: { color: tick }, grid: { color: grid } },
      },
    };
    return { baseOptions: base, horizontalOptions: horizontal };
  }, [theme]);

  if (loading) {
    return <p className="text-text-secondary">Loading stats...</p>;
  }
  if (!stats) return null;

  const jobsBarData = {
    labels: stats.jobsPerDay?.map((d) => d.date) ?? [],
    datasets: [
      {
        label: 'Jobs Added',
        data: stats.jobsPerDay?.map((d) => d.count) ?? [],
        backgroundColor: '#076682',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const usersLineData = {
    labels: stats.usersPerDay?.map((d) => d.date) ?? [],
    datasets: [
      {
        label: 'New Users',
        data: stats.usersPerDay?.map((d) => d.count) ?? [],
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22,163,74,0.12)',
        borderWidth: 2,
        pointBackgroundColor: '#16a34a',
        pointRadius: 4,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const topJobsData = stats.topJobs?.length
    ? {
        labels: stats.topJobs.map((j) => (j.label.length > 30 ? `${j.label.substring(0, 30)}...` : j.label)),
        datasets: [
          {
            label: 'Times Saved',
            data: stats.topJobs.map((j) => j.count),
            backgroundColor: '#076682',
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      }
    : null;

  return (
    <>
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Jobs" value={stats.totalJobs} color="#076682" />
        <StatCard label="Total Users" value={stats.totalUsers} color="#16a34a" />
        <StatCard label="Applications" value={stats.totalApplications} color="#5eb8c9" />
        <StatCard label="Banned Users" value={stats.bannedUsers} color="#dc2626" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ChartCard title="Jobs Added Per Day (Last 7 Days)">
          <Bar data={jobsBarData} options={baseOptions} />
        </ChartCard>

        <ChartCard title="New Users Per Day (Last 7 Days)">
          <Line data={usersLineData} options={baseOptions} />
        </ChartCard>

        <ApplicationsStatusCard applicationsByStatus={stats.applicationsByStatus} />

        {topJobsData && (
          <ChartCard title="Top 5 Most Saved Jobs">
            <Bar data={topJobsData} options={horizontalOptions} />
          </ChartCard>
        )}
      </div>
    </>
  );
}