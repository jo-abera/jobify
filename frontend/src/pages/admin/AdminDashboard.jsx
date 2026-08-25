/**
 * Admin dashboard — stats charts, job/user management, manual scraper.
 *
 * Fetches from /api/admin/* (admin JWT required). Chart.js visualizes trends
 * returned by getStats: jobsPerDay, usersPerDay, applicationsByStatus, topJobs.
 */

import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  getStats,
  adminGetAllJobs,
  adminGetAllUsers,
  adminDeleteJob,
  adminBanUser,
  adminUnbanUser,
  adminDeleteUser,
  adminPromoteUser,
  runScraper
} from '../../api/admin.api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
)

const baseOptions = {
  responsive: true,
  plugins: {
    legend: {
      labels: { color: '#a3a3a3', font: { size: 12 } }
    },
    tooltip: {
      backgroundColor: '#1e1e1e',
      titleColor: '#f5f5f5',
      bodyColor: '#a3a3a3',
      borderColor: '#2a2a2a',
      borderWidth: 1
    }
  },
  scales: {
    x: {
      ticks: { color: '#a3a3a3' },
      grid: { color: '#1e1e1e' }
    },
    y: {
      ticks: { color: '#a3a3a3' },
      grid: { color: '#1e1e1e' },
      beginAtZero: true
    }
  }
}

const statusColors = {
  saved: '#374151',
  applied: '#1d4ed8',
  interviewing: '#d97706',
  offered: '#16a34a',
  rejected: '#dc2626'
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-5">
      <div className="text-3xl font-semibold mb-1" style={{ color: color || '#f5f5f5' }}>
        {value ?? '—'}
      </div>
      <div className="text-sm text-text-secondary">{label}</div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-5">
      <h3 className="text-sm font-medium text-text-secondary mb-4">{title}</h3>
      {children}
    </div>
  )
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [jobs, setJobs] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [scraperMsg, setScraperMsg] = useState('')

  useEffect(() => {
    if (tab === 'stats') fetchStats()
    if (tab === 'jobs') fetchJobs()
    if (tab === 'users') fetchUsers()
  }, [tab])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await getStats()
      setStats(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const res = await adminGetAllJobs()
      setJobs(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await adminGetAllUsers()
      setUsers(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Delete this job?')) return
    try {
      await adminDeleteJob(id)
      setJobs(jobs.filter(j => j.id !== id))
    } catch {
      alert('Failed to delete job')
    }
  }

  const handleBanUser = async (id, isBanned) => {
    try {
      if (isBanned) await adminUnbanUser(id)
      else await adminBanUser(id)
      fetchUsers()
    } catch {
      alert('Failed to update user')
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return
    try {
      await adminDeleteUser(id)
      setUsers(users.filter(u => u.id !== id))
    } catch {
      alert('Failed to delete user')
    }
  }

  const handlePromote = async (id) => {
    if (!window.confirm('Promote this user to admin?')) return
    try {
      await adminPromoteUser(id)
      fetchUsers()
    } catch {
      alert('Failed to promote user')
    }
  }

  const handleRunScraper = async () => {
    try {
      const res = await runScraper()
      setScraperMsg(res.data.message)
    } catch {
      setScraperMsg('Failed to start scraper')
    }
  }

  const jobsBarData = stats ? {
    labels: stats.jobsPerDay?.map(d => d.date) ?? [],
    datasets: [{
      label: 'Jobs Added',
      data: stats.jobsPerDay?.map(d => d.count) ?? [],
      backgroundColor: '#2563eb',
      borderRadius: 6,
      borderSkipped: false
    }]
  } : null

  const usersLineData = stats ? {
    labels: stats.usersPerDay?.map(d => d.date) ?? [],
    datasets: [{
      label: 'New Users',
      data: stats.usersPerDay?.map(d => d.count) ?? [],
      borderColor: '#16a34a',
      backgroundColor: 'rgba(22,163,74,0.1)',
      borderWidth: 2,
      pointBackgroundColor: '#16a34a',
      pointRadius: 4,
      tension: 0.4,
      fill: true
    }]
  } : null

  const doughnutData = stats?.applicationsByStatus?.length ? {
    labels: stats.applicationsByStatus.map(s =>
      s.status.charAt(0).toUpperCase() + s.status.slice(1)
    ),
    datasets: [{
      data: stats.applicationsByStatus.map(s => s._count.status),
      backgroundColor: stats.applicationsByStatus.map(
        s => statusColors[s.status] || '#374151'
      ),
      borderColor: '#0f0f0f',
      borderWidth: 3
    }]
  } : null

  const topJobsData = stats?.topJobs?.length ? {
    labels: stats.topJobs.map(j =>
      j.label.length > 30 ? `${j.label.substring(0, 30)}...` : j.label
    ),
    datasets: [{
      label: 'Times Saved',
      data: stats.topJobs.map(j => j.count),
      backgroundColor: '#7c3aed',
      borderRadius: 6,
      borderSkipped: false
    }]
  } : null

  const horizontalOptions = {
    ...baseOptions,
    indexAxis: 'y',
    scales: {
      x: {
        ticks: { color: '#a3a3a3' },
        grid: { color: '#1e1e1e' },
        beginAtZero: true
      },
      y: {
        ticks: { color: '#a3a3a3' },
        grid: { color: '#1e1e1e' }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#a3a3a3', font: { size: 12 }, padding: 16 }
      },
      tooltip: {
        backgroundColor: '#1e1e1e',
        titleColor: '#f5f5f5',
        bodyColor: '#a3a3a3',
        borderColor: '#2a2a2a',
        borderWidth: 1
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Admin Dashboard</h1>

      <div className="flex flex-wrap gap-3 mb-8">
        {['stats', 'jobs', 'users', 'scraper'].map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors
              ${tab === t
                ? 'bg-blue-primary text-white'
                : 'bg-bg-card border border-border text-text-secondary hover:text-text-primary'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'stats' && (
        <div>
          {loading && <p className="text-text-secondary mb-4">Loading stats...</p>}

          {stats && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Jobs" value={stats.totalJobs} color="#60a5fa" />
                <StatCard label="Total Users" value={stats.totalUsers} color="#34d399" />
                <StatCard label="Applications" value={stats.totalApplications} color="#a78bfa" />
                <StatCard label="Banned Users" value={stats.bannedUsers} color="#f87171" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobsBarData && (
                  <ChartCard title="Jobs Added Per Day (Last 7 Days)">
                    <Bar data={jobsBarData} options={baseOptions} />
                  </ChartCard>
                )}

                {usersLineData && (
                  <ChartCard title="New Users Per Day (Last 7 Days)">
                    <Line data={usersLineData} options={baseOptions} />
                  </ChartCard>
                )}

                {doughnutData && (
                  <ChartCard title="Applications By Status">
                    <div className="flex justify-center">
                      <div style={{ width: '280px' }}>
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                      </div>
                    </div>
                  </ChartCard>
                )}

                {topJobsData && (
                  <ChartCard title="Top 5 Most Saved Jobs">
                    <Bar data={topJobsData} options={horizontalOptions} />
                  </ChartCard>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'jobs' && (
        <div>
          {loading ? (
            <p className="text-text-secondary">Loading jobs...</p>
          ) : (
            <div className="space-y-3">
              {jobs.length === 0 && (
                <p className="text-text-secondary">No jobs in the database.</p>
              )}
              {jobs.map(job => (
                <div
                  key={job.id}
                  className="bg-bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="font-medium text-text-primary">{job.title}</div>
                    <div className="text-sm text-text-secondary">
                      {job.company} · {job.location}
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      Source: {job.source} · Saved by: {job._count?.savedBy ?? 0} users
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteJob(job.id)}
                    className="px-3 py-1 bg-rejected text-red-300 rounded-lg text-sm hover:opacity-90 shrink-0"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div>
          {loading ? (
            <p className="text-text-secondary">Loading users...</p>
          ) : (
            <div className="space-y-3">
              {users.map(user => (
                <div
                  key={user.id}
                  className="bg-bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-text-primary">{user.name}</span>
                      {user.role === 'admin' && (
                        <span className="text-xs bg-blue-primary/20 text-blue-text px-2 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                      {user.isBanned && (
                        <span className="text-xs bg-rejected text-red-300 px-2 py-0.5 rounded-full">
                          Banned
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-text-secondary">{user.email}</div>
                    <div className="text-xs text-text-muted mt-1">
                      {user._count?.savedJobs ?? 0} applications ·
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user.role !== 'admin' && (
                      <button
                        type="button"
                        onClick={() => handlePromote(user.id)}
                        className="px-3 py-1 bg-blue-primary/20 text-blue-text rounded-lg text-sm hover:bg-blue-primary/30"
                      >
                        Promote
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleBanUser(user.id, user.isBanned)}
                      className={`px-3 py-1 rounded-lg text-sm
                        ${user.isBanned
                          ? 'bg-offered text-green-300 hover:opacity-90'
                          : 'bg-interviewing/30 text-amber-200 hover:opacity-90'
                        }`}
                    >
                      {user.isBanned ? 'Unban' : 'Ban'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(user.id)}
                      className="px-3 py-1 bg-rejected text-red-300 rounded-lg text-sm hover:opacity-90"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'scraper' && (
        <div className="bg-bg-card border border-border rounded-xl p-6 max-w-md">
          <h2 className="text-lg font-medium text-text-primary mb-2">Job Scraper</h2>
          <p className="text-sm text-text-secondary mb-6">
            Manually trigger the job scraper to fetch new listings from configured sources
            in backend/src/scraper/index.js.
          </p>
          <button
            type="button"
            onClick={handleRunScraper}
            className="px-6 py-2 bg-blue-primary text-white rounded-lg hover:bg-blue-hover font-medium transition-colors"
          >
            Run Scraper Now
          </button>
          {scraperMsg && (
            <p className="mt-4 text-sm text-green-400">{scraperMsg}</p>
          )}
        </div>
      )}
    </div>
  )
}
