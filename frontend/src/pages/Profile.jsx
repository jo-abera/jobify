/**
 * Profile and settings page.
 *
 * Three-tab layout:
 * 1) Career Profile (identity/contact/skills/avatar)
 * 2) Job Preferences (types, work modes, salary range)
 * 3) Account Security (change password + delete account)
 */

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  updatePassword,
  updatePreferences,
  updateProfile,
  deleteAccount,
  uploadAvatar
} from '../api/auth.api'
import { useAuth } from '../context/AuthContext'

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract']
const WORK_MODES = ['Remote', 'On-site', 'Hybrid']

function toStringArray(value) {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item)).filter(Boolean)
}

export default function Profile() {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('career')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [career, setCareer] = useState({
    avatar: '',
    name: '',
    email: '',
    location: '',
    phone: '',
    bio: '',
    skills: [],
    skillInput: ''
  })
  const [avatarUploading, setAvatarUploading] = useState(false)

  const [preferences, setPreferences] = useState({
    preferredJobTypes: [],
    preferredWorkModes: [],
    salaryExpectationMin: '',
    salaryExpectationMax: ''
  })

  const [security, setSecurity] = useState({
    passwordCurrent: '',
    password: '',
    passwordConfirm: ''
  })

  useEffect(() => {
    if (!user) return
    setCareer({
      avatar: user.avatar || '',
      name: user.name || '',
      email: user.email || '',
      location: user.location || '',
      phone: user.phone || '',
      bio: user.bio || '',
      skills: toStringArray(user.skills),
      skillInput: ''
    })
    setPreferences({
      preferredJobTypes: toStringArray(user.preferredJobTypes),
      preferredWorkModes: toStringArray(user.preferredWorkModes),
      salaryExpectationMin: user.salaryExpectationMin ?? '',
      salaryExpectationMax: user.salaryExpectationMax ?? ''
    })
  }, [user])

  const sortedSkills = useMemo(() => {
    return [...career.skills].sort((a, b) => a.localeCompare(b))
  }, [career.skills])

  const toggleFromList = (list, value) => {
    return list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value]
  }

  const syncAuthUser = (updatedUser) => {
    const token = localStorage.getItem('token')
    login(updatedUser, token || undefined)
  }

  const handleCareerSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const res = await updateProfile({
        avatar: career.avatar,
        name: career.name,
        location: career.location,
        phone: career.phone,
        bio: career.bio,
        skills: career.skills
      })
      syncAuthUser(res.data.data.user)
      setMessage('Career profile saved.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Avatar upload flow.
   *
   * Uploads a small image file to the backend, which stores it as a data URL string
   * in the user record. This keeps the demo self-contained without a file host.
   */
  const handleAvatarUpload = async (file) => {
    if (!file) return
    setAvatarUploading(true)
    setError('')
    setMessage('')
    try {
      const res = await uploadAvatar(file)
      syncAuthUser(res.data.data.user)
      setCareer((prev) => ({ ...prev, avatar: res.data.data.user.avatar || '' }))
      setMessage('Avatar uploaded successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload avatar.')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handlePreferencesSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const min = preferences.salaryExpectationMin === '' ? null : Number(preferences.salaryExpectationMin)
      const max = preferences.salaryExpectationMax === '' ? null : Number(preferences.salaryExpectationMax)
      const res = await updatePreferences({
        preferredJobTypes: preferences.preferredJobTypes,
        preferredWorkModes: preferences.preferredWorkModes,
        salaryExpectationMin: min,
        salaryExpectationMax: max
      })
      syncAuthUser(res.data.data.user)
      setMessage('Job preferences saved.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save preferences.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    try {
      if (!security.passwordCurrent || !security.password || !security.passwordConfirm) {
        throw new Error('Please fill all password fields.')
      }
      if (security.password !== security.passwordConfirm) {
        throw new Error('New password and confirm password do not match.')
      }
      const res = await updatePassword({
        passwordCurrent: security.passwordCurrent,
        password: security.password
      })
      localStorage.setItem('token', res.data.token)
      syncAuthUser(res.data.data.user)
      setSecurity({ passwordCurrent: '', password: '', passwordConfirm: '' })
      setMessage('Password updated successfully.')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update password.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      'Delete your account permanently? This action cannot be undone.'
    )
    if (!confirmDelete) return
    setLoading(true)
    setError('')
    setMessage('')
    try {
      await deleteAccount()
      logout()
      navigate('/register')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account.')
    } finally {
      setLoading(false)
    }
  }

  const addSkill = () => {
    const skill = career.skillInput.trim()
    if (!skill) return
    if (career.skills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
      setCareer((prev) => ({ ...prev, skillInput: '' }))
      return
    }
    setCareer((prev) => ({ ...prev, skills: [...prev.skills, skill], skillInput: '' }))
  }

  const removeSkill = (skill) => {
    setCareer((prev) => ({ ...prev, skills: prev.skills.filter((item) => item !== skill) }))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Profile & Settings</h1>
      <p className="text-text-secondary mb-6">
        Manage your career profile, job preferences, and account security.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('career')}
          className={`px-4 py-2 rounded-lg text-sm ${activeTab === 'career' ? 'bg-blue-primary text-white' : 'bg-bg-card border border-border text-text-secondary'}`}
        >
          Career Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2 rounded-lg text-sm ${activeTab === 'preferences' ? 'bg-blue-primary text-white' : 'bg-bg-card border border-border text-text-secondary'}`}
        >
          Job Preferences
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-lg text-sm ${activeTab === 'security' ? 'bg-blue-primary text-white' : 'bg-bg-card border border-border text-text-secondary'}`}
        >
          Account Security
        </button>
      </div>

      {message && <p className="mb-4 text-green-400 text-sm">{message}</p>}
      {error && <p className="mb-4 text-red-300 text-sm">{error}</p>}

      {activeTab === 'career' && (
        <form onSubmit={handleCareerSave} className="bg-bg-card border border-border rounded-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Career Profile</h2>
          <p className="text-text-muted text-sm">
            These details personalize your account and improve matching quality.
          </p>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Profile picture</label>

            <div className="grid grid-cols-1 sm:grid-cols-[84px_1fr] gap-4 items-start">
              <div className="w-[84px] h-[84px] rounded-full bg-bg-secondary border border-border overflow-hidden flex items-center justify-center">
                {career.avatar ? (
                  <img src={career.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-text-muted text-xs">No photo</span>
                )}
              </div>

              <div className="space-y-3">
                <label
                  className={`block w-full rounded-lg border border-dashed px-4 py-3 bg-bg-secondary hover:bg-bg-hover transition-colors cursor-pointer ${
                    avatarUploading ? 'opacity-70 cursor-wait' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-text-primary font-medium text-sm">
                        {avatarUploading ? 'Uploading...' : 'Upload an image'}
                      </p>
                      <p className="text-text-muted text-xs mt-0.5">
                        PNG/JPG/WEBP • max 5 MB • updates immediately
                      </p>
                    </div>
                    <span className="px-3 py-1.5 bg-blue-primary text-white text-xs font-semibold rounded-md shrink-0">
                      Choose file
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={avatarUploading || loading}
                    onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                  />
                </label>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCareer((prev) => ({ ...prev, avatar: '' }))}
                    className="px-3 py-2 rounded-lg text-sm bg-bg-secondary border border-border text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
                  >
                    Clear photo
                  </button>
                  <p className="text-xs text-text-muted self-center">
                    Clearing only removes the URL value. Click “Save profile” to persist.
                  </p>
                </div>

                <details className="bg-bg-secondary border border-border rounded-lg px-4 py-3">
                  <summary className="cursor-pointer text-sm text-text-secondary select-none">
                    Use an image URL instead (optional)
                  </summary>
                  <div className="mt-3">
                    <input
                      value={career.avatar}
                      onChange={(e) => setCareer((prev) => ({ ...prev, avatar: e.target.value }))}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full bg-bg-card border border-border rounded-lg px-3 py-2 text-text-primary"
                    />
                    <p className="text-xs text-text-muted mt-2">
                      Tip: use a direct image link ending in .png, .jpg, or .webp.
                    </p>
                  </div>
                </details>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Full name</label>
              <input
                value={career.name}
                onChange={(e) => setCareer((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Email</label>
              <input
                value={career.email}
                disabled
                className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-muted cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Location</label>
              <input
                value={career.location}
                onChange={(e) => setCareer((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="City, Country"
                className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Phone number (optional)</label>
              <input
                value={career.phone}
                onChange={(e) => setCareer((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Bio / About me</label>
            <textarea
              rows={4}
              value={career.bio}
              onChange={(e) => setCareer((prev) => ({ ...prev, bio: e.target.value }))}
              className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary resize-y"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1">Skills</label>
            <div className="flex gap-2">
              <input
                value={career.skillInput}
                onChange={(e) => setCareer((prev) => ({ ...prev, skillInput: e.target.value }))}
                placeholder="React, Node.js, ..."
                className="flex-1 bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-blue-primary text-white rounded-lg"
              >
                Add
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {sortedSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="px-2.5 py-1 rounded bg-blue-primary/20 text-blue-text text-sm"
                >
                  {skill} ×
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-primary hover:bg-blue-hover text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50"
          >
            Save profile
          </button>
        </form>
      )}

      {activeTab === 'preferences' && (
        <form onSubmit={handlePreferencesSave} className="bg-bg-card border border-border rounded-card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-text-primary">Job Preferences</h2>

          <div>
            <p className="text-sm text-text-secondary mb-2">What type of jobs are you looking for?</p>
            <div className="grid md:grid-cols-2 gap-2">
              {JOB_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-2 text-text-primary">
                  <input
                    type="checkbox"
                    checked={preferences.preferredJobTypes.includes(type)}
                    onChange={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        preferredJobTypes: toggleFromList(prev.preferredJobTypes, type)
                      }))
                    }
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-text-secondary mb-2">Preferred locations:</p>
            <div className="grid md:grid-cols-3 gap-2">
              {WORK_MODES.map((mode) => (
                <label key={mode} className="flex items-center gap-2 text-text-primary">
                  <input
                    type="checkbox"
                    checked={preferences.preferredWorkModes.includes(mode)}
                    onChange={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        preferredWorkModes: toggleFromList(prev.preferredWorkModes, mode)
                      }))
                    }
                  />
                  {mode}
                </label>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1">Salary expectation min (USD)</label>
              <input
                type="number"
                min="0"
                value={preferences.salaryExpectationMin}
                onChange={(e) => setPreferences((prev) => ({ ...prev, salaryExpectationMin: e.target.value }))}
                className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Salary expectation max (USD)</label>
              <input
                type="number"
                min="0"
                value={preferences.salaryExpectationMax}
                onChange={(e) => setPreferences((prev) => ({ ...prev, salaryExpectationMax: e.target.value }))}
                className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-primary hover:bg-blue-hover text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50"
          >
            Save preferences
          </button>
        </form>
      )}

      {activeTab === 'security' && (
        <div className="space-y-5">
          <form onSubmit={handlePasswordUpdate} className="bg-bg-card border border-border rounded-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">Change Password</h2>

            <div>
              <label className="block text-sm text-text-secondary mb-1">Current password</label>
              <input
                type="password"
                value={security.passwordCurrent}
                onChange={(e) => setSecurity((prev) => ({ ...prev, passwordCurrent: e.target.value }))}
                className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">New password</label>
              <input
                type="password"
                value={security.password}
                onChange={(e) => setSecurity((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Confirm password</label>
              <input
                type="password"
                value={security.passwordConfirm}
                onChange={(e) => setSecurity((prev) => ({ ...prev, passwordConfirm: e.target.value }))}
                className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-primary hover:bg-blue-hover text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50"
            >
              Update password
            </button>
          </form>

          <div className="bg-bg-card border border-red-800 rounded-card p-6">
            <h3 className="text-red-300 font-semibold">Delete Account</h3>
            <p className="text-text-secondary text-sm mt-2 mb-4">
              This action cannot be undone. Your account and saved jobs will be permanently removed.
            </p>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={loading}
              className="bg-red-900 hover:bg-red-800 text-red-200 px-5 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              Delete my account
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

