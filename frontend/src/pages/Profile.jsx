/**
 * Profile and settings page.
 *
 * Tab layout:
 * 1) Career Profile (identity/contact/skills/avatar)
 * 2) Resume (AI matching against tracker jobs)
 * 3) Job Preferences (types, work modes, salary range)
 * 4) Account Security (change password + delete account)
 */

import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  updatePassword,
  updatePreferences,
  updateProfile,
  deleteAccount,
  uploadAvatar
} from '../api/auth.api'
import { useAuth } from '../context/AuthContext'
import PasswordInput from '../components/PasswordInput'
import SectionHeading from '../components/SectionHeading'
import { ProfileLayoutFrame, PROFILE_TAB_IDS } from '../components/profile/ProfileShell'
import ProfileAvatarField from '../components/profile/ProfileAvatarField'
import ProfileResumePanel from '../components/profile/ProfileResumePanel'
import ProfileCompletionIndicator from '../components/profile/ProfileCompletionIndicator'

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract']
const WORK_MODES = ['Remote', 'On-site', 'Hybrid']

function toStringArray(value) {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item)).filter(Boolean)
}

export default function Profile() {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const initialTab = PROFILE_TAB_IDS.includes(tabFromUrl) ? tabFromUrl : 'career'
  const [activeTab, setActiveTab] = useState(initialTab)
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
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
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
    const t = searchParams.get('tab')
    if (t && PROFILE_TAB_IDS.includes(t)) {
      setActiveTab(t)
    }
  }, [searchParams])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'career') {
      setSearchParams({}, { replace: true })
    } else {
      setSearchParams({ tab }, { replace: true })
    }
  }

  useEffect(() => {
    if (!user) return
    setCareer({
      avatar: user.avatar || '',
      name: user.name || '',
      email: user.email || '',
      location: user.location || '',
      phone: user.phone || '',
      bio: user.bio || '',
      githubUrl: user.githubUrl || '',
      linkedinUrl: user.linkedinUrl || '',
      portfolioUrl: user.portfolioUrl || '',
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
        githubUrl: career.githubUrl,
        linkedinUrl: career.linkedinUrl,
        portfolioUrl: career.portfolioUrl,
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
      if (security.password.length < 6) {
        throw new Error('Password must be at least 6 characters long.')
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

  const handleGoToSection = (sectionId) => {
    if (sectionId === 'resume') {
      handleTabChange('resume')
      return
    }
    handleTabChange('career')
    requestAnimationFrame(() => {
      const anchorId =
        sectionId === 'skills'
          ? 'profile-skills'
          : sectionId === 'links'
            ? 'profile-links'
            : 'profile-basics'
      document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <div>
      <section className="border-b border-border bg-bg-secondary/40">
        <div className="mx-auto max-w-4xl px-4 py-10 md:py-12">
          <SectionHeading
            headingTag="h1"
            className="mb-0"
            overline="Your account"
            title="Profile & settings"
            description="Career details, resume matching, job preferences, and account security."
          />
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-8">
      {user && activeTab === 'career' ? (
        <ProfileCompletionIndicator user={user} onGoToSection={handleGoToSection} />
      ) : null}
      <ProfileLayoutFrame activeTab={activeTab} setActiveTab={handleTabChange}>
      {message && <p className="mb-4 text-sm text-green-600 dark:text-green-400">{message}</p>}
      {error && <p className="mb-4 text-sm text-red-300">{error}</p>}

      {activeTab === 'career' && (
        <form
          id="profile-basics"
          onSubmit={handleCareerSave}
          className="bg-bg-card border border-border rounded-card p-6 space-y-4 scroll-mt-24"
        >
          <h2 className="text-lg font-semibold text-text-primary">Career Profile</h2>
          <p className="text-text-muted text-sm">
            These details personalize your account and improve matching quality.
          </p>

          <fieldset className="min-w-0">
            <legend className="mb-3 block text-sm font-medium text-text-secondary">Profile photo</legend>
            <ProfileAvatarField
              avatar={career.avatar}
              name={career.name}
              uploading={avatarUploading}
              disabled={loading}
              onUpload={handleAvatarUpload}
              onClear={() => setCareer((prev) => ({ ...prev, avatar: '' }))}
              onAvatarUrlChange={(url) => setCareer((prev) => ({ ...prev, avatar: url }))}
            />
          </fieldset>

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

          <div id="profile-skills" className="scroll-mt-24">
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
                className="btn-brand rounded-xl px-4 py-2 font-semibold text-white"
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

          <fieldset id="profile-links" className="scroll-mt-24 space-y-4 border-0 p-0 m-0 min-w-0">
            <legend className="text-sm font-medium text-text-secondary">Professional links</legend>
            <p className="text-xs text-text-muted -mt-2">
              Add at least one — counts toward profile completion.
            </p>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1">GitHub</label>
                <input
                  type="url"
                  value={career.githubUrl}
                  onChange={(e) =>
                    setCareer((prev) => ({ ...prev, githubUrl: e.target.value }))
                  }
                  placeholder="https://github.com/username"
                  className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={career.linkedinUrl}
                  onChange={(e) =>
                    setCareer((prev) => ({ ...prev, linkedinUrl: e.target.value }))
                  }
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Portfolio</label>
                <input
                  type="url"
                  value={career.portfolioUrl}
                  onChange={(e) =>
                    setCareer((prev) => ({ ...prev, portfolioUrl: e.target.value }))
                  }
                  placeholder="https://yoursite.com"
                  className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-text-primary"
                />
              </div>
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={loading}
            className="btn-brand rounded-xl px-6 py-2.5 font-semibold text-white disabled:opacity-50"
          >
            Save profile
          </button>
        </form>
      )}

      {activeTab === 'resume' && (
        <section className="rounded-card border border-border bg-bg-card p-6">
          <ProfileResumePanel />
        </section>
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
            className="btn-brand rounded-xl px-6 py-2.5 font-semibold text-white disabled:opacity-50"
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
              <PasswordInput
                value={security.passwordCurrent}
                onChange={(e) =>
                  setSecurity((prev) => ({
                    ...prev,
                    passwordCurrent: e.target.value,
                  }))
                }
                autoComplete="current-password"
                inputClassName="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 pr-10 text-text-primary focus:outline-none focus:ring-0 focus:border-border-hover"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">New password</label>
              <PasswordInput
                value={security.password}
                onChange={(e) =>
                  setSecurity((prev) => ({ ...prev, password: e.target.value }))
                }
                minLength={6}
                autoComplete="new-password"
                hint="At least 6 characters. Letters, numbers, symbols, and spaces are allowed."
                inputClassName="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 pr-10 text-text-primary focus:outline-none focus:ring-0 focus:border-border-hover"
              />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1">Confirm password</label>
              <PasswordInput
                value={security.passwordConfirm}
                onChange={(e) =>
                  setSecurity((prev) => ({
                    ...prev,
                    passwordConfirm: e.target.value,
                  }))
                }
                autoComplete="new-password"
                inputClassName="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 pr-10 text-text-primary focus:outline-none focus:ring-0 focus:border-border-hover"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-brand rounded-xl px-6 py-2.5 font-semibold text-white disabled:opacity-50"
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
      </ProfileLayoutFrame>
      </div>
    </div>
  )
}

