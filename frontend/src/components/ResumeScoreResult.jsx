/**
 * Displays AI resume match results (score, keywords, summary).
 *
 * Shared by Resume.jsx and JobDetail.jsx so both upload and paste flows
 * render identical feedback from POST /api/resume/score or /score-file.
 * Optionally compares result keywords with profile skills for extra guidance.
 */

export default function ResumeScoreResult({ result, compact = false, profileSkills = [] }) {
  if (!result || result.error) return null

  const scoreClass = compact ? 'text-lg' : 'text-xl'
  const normalizedMatched = new Set((result.matchedKeywords || []).map((kw) => String(kw).toLowerCase()))
  const profileSkillGaps = (Array.isArray(profileSkills) ? profileSkills : [])
    .map((skill) => String(skill).trim())
    .filter(Boolean)
    .filter((skill) => !normalizedMatched.has(skill.toLowerCase()))

  return (
    <div className={compact ? 'mt-6 space-y-4' : 'mt-8 bg-bg-card border border-border rounded-card p-6 space-y-4'}>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-text-secondary">Match score</span>
          <span className={`text-blue-text font-bold ${scoreClass}`}>{result.score}%</span>
        </div>
        <div className={`${compact ? 'h-2' : 'h-3'} bg-bg-secondary rounded-full overflow-hidden`}>
          <div
            className="h-full bg-blue-primary rounded-full transition-all"
            style={{ width: `${Math.min(100, result.score)}%` }}
          />
        </div>
      </div>

      {result.matchedKeywords?.length > 0 && (
        <div>
          <p className="text-sm text-text-secondary mb-2">Matched keywords</p>
          <div className="flex flex-wrap gap-2">
            {result.matchedKeywords.map(kw => (
              <span
                key={kw}
                className={`px-2.5 py-1 rounded bg-offered text-green-300 ${compact ? 'text-xs' : 'text-sm'}`}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.missingKeywords?.length > 0 && (
        <div>
          <p className="text-sm text-text-secondary mb-2">Missing keywords</p>
          <div className="flex flex-wrap gap-2">
            {result.missingKeywords.map(kw => (
              <span
                key={kw}
                className={`px-2.5 py-1 rounded bg-rejected text-red-300 ${compact ? 'text-xs' : 'text-sm'}`}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.summary && (
        <p className={`text-text-secondary leading-relaxed ${compact ? 'text-sm' : ''}`}>
          {result.summary}
        </p>
      )}

      {profileSkillGaps.length > 0 && (
        <div>
          <p className="text-sm text-text-secondary mb-2">
            Profile skills not reflected in this match
          </p>
          <div className="flex flex-wrap gap-2">
            {profileSkillGaps.map((skill) => (
              <span
                key={skill}
                className={`px-2.5 py-1 rounded bg-bg-secondary border border-border text-text-secondary ${compact ? 'text-xs' : 'text-sm'}`}
              >
                {skill}
              </span>
            ))}
          </div>
          <p className="text-xs text-text-muted mt-2">
            Consider highlighting these skills in your resume if they are relevant to this role.
          </p>
        </div>
      )}
    </div>
  )
}
