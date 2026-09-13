export interface ProfileMatchCriteria {
  skills?: string[];
  headline?: string;
  summary?: string;
  location?: string;
}

export interface JobMatchCriteria {
  title: string;
  skills: string[];
  description?: string | null;
  location?: string | null;
  locationType?: string | null;
}

/**
 * Calculates a match score from 0 to 100 between a job and a user profile.
 */
export function calculateMatchScore(
  job: JobMatchCriteria,
  profile?: ProfileMatchCriteria | null
): number {
  if (!profile) return 70; // baseline if no profile exists yet

  let score = 30; // base score for all discovered jobs

  const profileSkills = (profile.skills || []).map(s => s.toLowerCase());
  const jobSkills = (job.skills || []).map(s => s.toLowerCase());
  const jobTitle = (job.title || '').toLowerCase();
  const headline = (profile.headline || '').toLowerCase();

  // 1. Skill overlap (up to 40 points)
  if (profileSkills.length > 0 && jobSkills.length > 0) {
    const matches = jobSkills.filter(js => profileSkills.some(ps => ps.includes(js) || js.includes(ps)));
    const skillRatio = matches.length / Math.max(1, jobSkills.length);
    score += Math.round(skillRatio * 40);
  } else if (profileSkills.length > 0) {
    // Check if profile skills appear anywhere in title/description
    const desc = (job.description || '').toLowerCase();
    const matches = profileSkills.filter(ps => jobTitle.includes(ps) || desc.includes(ps));
    const bonus = Math.min(35, matches.length * 8);
    score += bonus;
  }

  // 2. Title / Headline relevance (up to 20 points)
  if (headline) {
    const headlineWords = headline.split(/\s+/).filter(w => w.length > 3);
    const matchCount = headlineWords.filter(w => jobTitle.includes(w)).length;
    if (matchCount > 0) {
      score += Math.min(20, matchCount * 10);
    }
  }

  // 3. Remote bonus if applicable (up to 10 points)
  if (job.locationType === 'remote') {
    score += 5;
  }

  return Math.min(99, Math.max(25, score));
}
