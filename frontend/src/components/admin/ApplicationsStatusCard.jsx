import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { getChartTooltipTheme } from '../../utils/chartTheme';

const statusColors = {
  saved: '#8b8f9a',
  applied: '#076682',
  interviewing: '#d97706',
  offered: '#16a34a',
  rejected: '#dc2626',
};

const STATUS_ORDER = ['saved', 'applied', 'interviewing', 'offered', 'rejected'];

function titleCase(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function ApplicationsStatusCard({ applicationsByStatus }) {
  const { theme } = useTheme();

  const doughnutOptions = useMemo(() => {
    const tooltipTheme = getChartTooltipTheme(theme);
    return {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: {
          ...tooltipTheme,
          borderWidth: 1,
          padding: 10,
          titleFont: { size: 13, weight: '600' },
          bodyFont: { size: 12 },
          callbacks: {
            label(ctx) {
              const value = ctx.parsed ?? 0;
              const datasetTotal = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = datasetTotal ? Math.round((value / datasetTotal) * 100) : 0;
              return `${value} (${pct}%)`;
            },
          },
        },
      },
    };
  }, [theme]);

  if (!applicationsByStatus?.length) return null;

  const rows = [...applicationsByStatus].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
  );
  const total = rows.reduce((sum, row) => sum + row._count.status, 0);

  const doughnutData = {
    labels: rows.map((s) => titleCase(s.status)),
    datasets: [
      {
        data: rows.map((s) => s._count.status),
        backgroundColor: rows.map((s) => statusColors[s.status] || '#8b8f9a'),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  return (
    <div className="rounded-xl border border-border bg-bg-card p-5">
      <h3 className="mb-4 text-sm font-medium text-text-secondary">Applications by status</h3>

      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="relative mx-auto w-full max-w-[11rem] shrink-0 md:mx-0">
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold text-text-primary">{total}</span>
            <span className="text-xs text-text-muted">applications</span>
          </div>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>

        <ul className="min-w-0 flex-1 space-y-3">
          {rows.map((row) => {
            const count = row._count.status;
            const pct = total ? Math.round((count / total) * 100) : 0;
            const color = statusColors[row.status] || '#8b8f9a';

            return (
              <li key={row.status}>
                <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 font-medium text-text-primary">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                      aria-hidden
                    />
                    {titleCase(row.status)}
                  </span>
                  <span className="tabular-nums text-text-secondary">
                    {count}
                    <span className="text-text-muted"> · {pct}%</span>
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg-secondary">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}