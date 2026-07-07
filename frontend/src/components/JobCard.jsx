/**
 * Job listing card for grid views (Home, Jobs).
 *
 * Links to JobDetail; optional Save button calls POST /api/tracker when logged in.
 * Parent passes savedJobIds to show already-saved state across the list.
 */

import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { saveJob } from '../api/tracker.api'

export default function JobCard({ job, savedJobIds = [], onSaved }) {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(savedJobIds.includes(job.id))
  const initial = job.company?.charAt(0)?.toUpperCase() || '?'

  const handleSave = async (e) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      await saveJob(job.id)
      setSaved(true)
      onSaved?.(job.id)
    } catch (err) {
      // 400 = already saved on server; treat as success for UI consistency.
      if (err.response?.status === 400) setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-bg-card border border-border rounded-card p-5 hover:bg-bg-hover hover:border-border-hover transition-colors"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-blue-light flex items-center justify-center text-blue-text font-bold text-lg shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-primary truncate">{job.title}</h3>
          <p className="text-text-secondary text-sm mt-0.5">{job.company}</p>
          <p className="text-text-muted text-sm mt-1">{job.location}</p>
          {job.salary && (
            <p className="text-blue-text text-sm mt-1">{job.salary}</p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs px-2 py-0.5 rounded bg-bg-hover text-text-secondary">
              {job.type}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
        {user && (
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              saved
                ? 'bg-bg-hover text-text-muted cursor-default'
                : 'bg-bg-hover border border-border text-text-secondary hover:border-border-hover'
            }`}
          >
            {saved ? 'Saved' : saving ? 'Saving...' : 'Save'}
          </button>
        )}
        <Link
          to={`/jobs/${job.id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 py-2 rounded-lg text-sm font-medium bg-blue-primary hover:bg-blue-hover text-white text-center transition-colors"
        >
          View job
        </Link>
      </div>
    </Link>
  )
}
