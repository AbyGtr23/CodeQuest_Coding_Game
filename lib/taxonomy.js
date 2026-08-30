/**
 * CodeQuest Role, Tech Stack, and Weapon Recommendation Taxonomy
 * Canonical taxonomy for onboarding and profile personalization.
 */

export const IT_ROLES = [
  'Software Developer',
  'Full-Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Mobile Developer',
  'Data Scientist',
  'Data Analyst',
  'Machine Learning Engineer',
  'AI Engineer',
  'DevOps Engineer',
  'Cloud Engineer',
  'Cybersecurity Engineer',
  'QA/Test Engineer',
  'Embedded/IoT Developer',
  'Database Engineer',
  'UI/UX Designer',
  'Product Manager',
  'Student/Aspiring Developer',
  'Other'
];

export const TECH_STACK_CATEGORIES = [
  {
    category: 'Programming Languages',
    items: ['Python', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'SQL', 'Bash', 'C++', 'Java']
  },
  {
    category: 'Frameworks & Libraries',
    items: ['React', 'Node.js', 'Django', 'Next.js', 'Express', 'FastAPI', 'Vue', 'Spring']
  },
  {
    category: 'Developer Tools & Platforms',
    items: ['Git', 'Docker', 'Linux CLI', 'Kubernetes', 'AWS', 'GCP', 'PostgreSQL', 'Redis']
  }
];

/**
 * Recommends CodeQuest weapon slugs based on selected IT role and tech stack.
 * Returns an array of recommended tool slugs with reasons.
 *
 * @param {string} role - Selected IT role
 * @param {string[]} techStack - Array of selected technology names
 * @returns {Array<{ slug: string, name: string, reason: string }>}
 */
export function getWeaponRecommendations(role, techStack = []) {
  const recommendations = [];
  const addedSlugs = new Set();

  function add(slug, name, reason) {
    if (!addedSlugs.has(slug)) {
      addedSlugs.add(slug);
      recommendations.push({ slug, name, reason });
    }
  }

  const stackLower = (techStack || []).map(t => t.toLowerCase());
  const roleLower = (role || '').toLowerCase();

  // Role-based matching
  if (roleLower.includes('full-stack') || roleLower.includes('frontend') || roleLower.includes('web')) {
    add('javascript', 'JavaScript', 'Core language for modern full-stack web applications');
    add('python', 'Python', 'Versatile backend and automation language');
    add('git', 'Git', 'Essential version control for collaborative development');
    add('sql', 'SQL', 'Required for querying and managing relational databases');
  } else if (roleLower.includes('data') || roleLower.includes('machine learning') || roleLower.includes('ai')) {
    add('python', 'Python', 'The #1 language for data science and AI algorithms');
    add('sql', 'SQL', 'Essential for data analysis and querying datasets');
    add('git', 'Git', 'Version control for model pipelines and codebases');
  } else if (roleLower.includes('devops') || roleLower.includes('cloud') || roleLower.includes('security')) {
    add('git', 'Git', 'Critical for GitOps, CI/CD pipelines, and infrastructure as code');
    add('python', 'Python', 'Standard for cloud automation and DevOps scripting');
    add('sql', 'SQL', 'Database administration and metric analysis');
  } else if (roleLower.includes('qa') || roleLower.includes('test')) {
    add('python', 'Python', 'Leading language for test automation and scripting');
    add('javascript', 'JavaScript', 'Essential for web test automation frameworks');
    add('git', 'Git', 'Version control for test repositories');
  } else if (roleLower.includes('database')) {
    add('sql', 'SQL', 'The primary query language for database architecture');
    add('python', 'Python', 'Database migration and data manipulation tooling');
    add('git', 'Git', 'Schema version control');
  } else {
    // Default foundational recommendations
    add('python', 'Python', 'Beginner-friendly, high-utility general-purpose language');
    add('javascript', 'JavaScript', 'The lingua franca of the web');
    add('git', 'Git', 'Fundamental tool for every software practitioner');
    add('sql', 'SQL', 'Universal database query language');
  }

  // Tech stack matching overrides
  if (stackLower.includes('python') || stackLower.includes('django') || stackLower.includes('fastapi')) {
    add('python', 'Python', 'Matches your current technology stack');
  }
  if (stackLower.includes('javascript') || stackLower.includes('react') || stackLower.includes('node.js') || stackLower.includes('next.js')) {
    add('javascript', 'JavaScript', 'Matches your frontend/backend stack');
  }
  if (stackLower.includes('sql') || stackLower.includes('postgresql')) {
    add('sql', 'SQL', 'Matches your database stack');
  }
  if (stackLower.includes('git')) {
    add('git', 'Git', 'Matches your developer tooling stack');
  }

  return recommendations;
}
