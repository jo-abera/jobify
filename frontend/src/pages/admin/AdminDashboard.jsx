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
import AdminStatsTab from '../../components/admin/AdminStatsTab'
import AdminJobsTab from '../../components/admin/AdminJobsTab'
import AdminUsersTab from '../../components/admin/AdminUsersTab'
import AdminScraperTab from '../../components/admin/AdminScraperTab'
import { AdminLayoutFrame, AdminStudioHeader } from '../../components/admin/AdminShell'

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

export default function AdminDashboard() {
  const [tab, setTab] = useState('stats')
  const [stats, setStats] = useState(null)
  const [jobs, setJobs] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

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
    const res = await runScraper()
    return res.data.message
  }

  const tabPanel = (
    <>
      {tab === 'stats' && (
        <AdminStatsTab stats={stats} loading={loading} />
      )}

      {tab === 'jobs' && (
        <AdminJobsTab jobs={jobs} loading={loading} onDelete={handleDeleteJob} />
      )}

      {tab === 'users' && (
        <AdminUsersTab
          users={users}
          loading={loading}
          onBan={handleBanUser}
          onPromote={handlePromote}
          onDelete={handleDeleteUser}
        />
      )}

      {tab === 'scraper' && <AdminScraperTab onRun={handleRunScraper} />}
    </>
  )

  return (
    <div>
      <AdminStudioHeader />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <AdminLayoutFrame tab={tab} setTab={setTab}>
          {tabPanel}
        </AdminLayoutFrame>
      </div>
    </div>
  )
}