export function isValidProfileUrl(url) {
  const s = String(url || '').trim();
  if (!s) return false;
  const href = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    const u = new URL(href);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function skillList(user) {
  return Array.isArray(user?.skills) ? user.skills.filter(Boolean) : [];
}

export function isProfileSectionComplete(user) {
  const location = String(user?.location || '').trim();
  const bio = String(user?.bio || '').trim();
  return location.length >= 2 && bio.length >= 15;
}

export function isResumeSectionComplete(user) {
  return Boolean(user?.resumeUrl && user?.resumeFileName);
}

export function isSkillsSectionComplete(user) {
  return skillList(user).length >= 1;
}

export function isLinksSectionComplete(user) {
  return (
    isValidProfileUrl(user?.githubUrl) ||
    isValidProfileUrl(user?.linkedinUrl) ||
    isValidProfileUrl(user?.portfolioUrl)
  );
}

/**
 * @returns {{ percent: number, completedCount: number, sections: Array<{ id: string, label: string, complete: boolean, hint: string }> }}
 */
export function computeProfileCompletion(user) {
  const sections = [
    {
      id: 'profile',
      label: 'Profile',
      complete: isProfileSectionComplete(user),
      hint: 'Add your location and a short bio on Career Profile.',
    },
    {
      id: 'resume',
      label: 'Resume',
      complete: isResumeSectionComplete(user),
      hint: 'Upload your resume on the Resume tab.',
    },
    {
      id: 'skills',
      label: 'Skills',
      complete: isSkillsSectionComplete(user),
      hint: 'Add at least one skill tag.',
    },
    {
      id: 'links',
      label: 'Links',
      complete: isLinksSectionComplete(user),
      hint: 'Add GitHub, LinkedIn, or portfolio URL.',
    },
  ];
  const completedCount = sections.filter((s) => s.complete).length;
  const total = sections.length;
  const percent = total ? Math.round((completedCount / total) * 100) : 0;
  return { percent, completedCount, total, sections };
}