/** Fields safe to return to the client (no password, reset tokens, etc.) */
const PublicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  location: true,
  phone: true,
  bio: true,
  githubUrl: true,
  linkedinUrl: true,
  portfolioUrl: true,
  skills: true,
  preferredJobTypes: true,
  preferredWorkModes: true,
  salaryExpectationMin: true,
  salaryExpectationMax: true,
  isVerified: true,
  createdAt: true,
  resumeUrl: true,
  resumeFileName: true,
  resumeMimeType: true,
  resumeUploadedAt: true,
};

module.exports = { PublicUserSelect };