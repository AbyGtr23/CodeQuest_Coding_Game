'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/providers/AuthProvider';
import { IT_ROLES, TECH_STACK_CATEGORIES, getWeaponRecommendations } from '@/lib/taxonomy';
import styles from './onboarding.module.css';

export default function OnboardingPage() {
  const { user, profile, loading, refreshProfile } = useContext(AuthContext);
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedTechStack, setSelectedTechStack] = useState([]);
  const [availableTools, setAvailableTools] = useState([]);
  const [selectedWeapons, setSelectedWeapons] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if already onboarded
  useEffect(() => {
    if (!loading && profile?.onboarding_completed) {
      router.push('/dashboard');
    }
  }, [loading, profile, router]);

  // Load available weapons/tools
  useEffect(() => {
    async function loadTools() {
      try {
        const res = await fetch('/api/tools');
        if (res.ok) {
          const data = await res.json();
          setAvailableTools(data.tools || []);
        }
      } catch (err) {
        console.error('Failed to load tools:', err);
      }
    }
    loadTools();
  }, []);

  const toggleTech = (item) => {
    setSelectedTechStack(prev =>
      prev.includes(item) ? prev.filter(t => t !== item) : [...prev, item]
    );
  };

  const toggleWeapon = (slug) => {
    setSelectedWeapons(prev => {
      if (prev.includes(slug)) {
        return prev.filter(s => s !== slug);
      }
      if (prev.length >= 2) {
        setError('Maximum of 2 active weapons can be selected.');
        return prev;
      }
      setError(null);
      return [...prev, slug];
    });
  };

  const handleComplete = async () => {
    if (!selectedRole) {
      setError('Please select an IT role.');
      return;
    }
    if (selectedWeapons.length === 0) {
      setError('Please choose at least 1 weapon (max 2).');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          it_role: selectedRole,
          tech_stack: selectedTechStack,
          weapon_slugs: selectedWeapons
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete onboarding');
      }

      await refreshProfile();
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.terminal}>
          <div className={styles.body}>
            <p style={{ color: 'var(--color-primary, #00ff66)' }}>&gt; LOADING RECRUIT PROFILE...</p>
          </div>
        </div>
      </div>
    );
  }

  const recommendations = getWeaponRecommendations(selectedRole, selectedTechStack);

  return (
    <div className={styles.container}>
      <div className={styles.terminal}>
        <div className={styles.header}>
          <span>onboarding.exe</span>
          <span className={styles.stepIndicator}>STEP {step} OF 4</span>
        </div>

        <div className={styles.body}>
          {error && <div className={styles.error}>{error}</div>}

          {/* STEP 1: Profile & Identity */}
          {step === 1 && (
            <div>
              <h2 className={styles.title}>&gt; RECRUIT_IDENTITY_VERIFIED</h2>
              <p className={styles.subtitle}>
                Your account credentials have been synchronized with the CodeQuest terminal.
              </p>

              <div className={styles.profileCard}>
                {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                  <img
                    src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                    alt="Avatar"
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>👾</div>
                )}
                <div className={styles.profileDetails}>
                  <h3>{profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Recruit'}</h3>
                  <p>{user?.email}</p>
                  <p style={{ color: '#00ff66', marginTop: '0.25rem' }}>Status: CADET RANK INITIALIZED</p>
                </div>
              </div>

              <div className={styles.buttonRow}>
                <div />
                <button className={styles.btnPrimary} onClick={() => setStep(2)}>
                  CONTINUE TO ROLE SELECTION &gt;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: IT Role */}
          {step === 2 && (
            <div>
              <h2 className={styles.title}>&gt; SELECT_PRIMARY_ROLE</h2>
              <p className={styles.subtitle}>
                What best describes your current specialization or target engineering track?
              </p>

              <div className={styles.gridRoles}>
                {IT_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    className={`${styles.roleOption} ${selectedRole === role ? styles.roleOptionSelected : ''}`}
                    onClick={() => {
                      setSelectedRole(role);
                      setError(null);
                    }}
                  >
                    {selectedRole === role ? '▶ ' : ''}{role}
                  </button>
                ))}
              </div>

              <div className={styles.buttonRow}>
                <button className={styles.btnSecondary} onClick={() => setStep(1)}>
                  &lt; BACK
                </button>
                <button
                  className={styles.btnPrimary}
                  disabled={!selectedRole}
                  onClick={() => setStep(3)}
                >
                  CONTINUE TO TECH STACK &gt;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Tech Stack */}
          {step === 3 && (
            <div>
              <h2 className={styles.title}>&gt; CONFIGURE_TECH_STACK</h2>
              <p className={styles.subtitle}>
                Select the technologies you currently work with or are actively pursuing.
              </p>

              {TECH_STACK_CATEGORIES.map((cat) => (
                <div key={cat.category} className={styles.categoryGroup}>
                  <div className={styles.categoryTitle}>{cat.category}</div>
                  <div className={styles.chipGroup}>
                    {cat.items.map((tech) => {
                      const isSelected = selectedTechStack.includes(tech);
                      return (
                        <button
                          key={tech}
                          type="button"
                          className={`${styles.chip} ${isSelected ? styles.chipSelected : ''}`}
                          onClick={() => toggleTech(tech)}
                        >
                          {isSelected ? '✓ ' : '+ '}{tech}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className={styles.buttonRow}>
                <button className={styles.btnSecondary} onClick={() => setStep(2)}>
                  &lt; BACK
                </button>
                <button className={styles.btnPrimary} onClick={() => setStep(4)}>
                  VIEW RECOMMENDATIONS &gt;
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Choose Weapons (Max 2) */}
          {step === 4 && (
            <div>
              <h2 className={styles.title}>&gt; CHOOSE_YOUR_WEAPONS</h2>
              <p className={styles.subtitle}>
                Select up to 2 primary mastery weapons to begin your CodeQuest journey.
              </p>

              {recommendations.length > 0 && (
                <div className={styles.recommendationsBox}>
                  <div className={styles.recTitle}>🎯 RECOMMENDED FOR {selectedRole?.toUpperCase()}</div>
                  {recommendations.map((rec) => (
                    <div key={rec.slug} className={styles.recItem}>
                      <span style={{ color: '#fff', fontWeight: 'bold' }}>{rec.name}</span>
                      <span className={styles.recReason}>{rec.reason}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.limitWarning}>
                ⚡ Active Weapons: {selectedWeapons.length} / 2 selected
              </div>

              <div className={styles.weaponsGrid}>
                {availableTools.map((tool) => {
                  const isSelected = selectedWeapons.includes(tool.slug);
                  return (
                    <div
                      key={tool.id || tool.slug}
                      className={`${styles.weaponCard} ${isSelected ? styles.weaponCardSelected : ''}`}
                      onClick={() => toggleWeapon(tool.slug)}
                    >
                      <div className={styles.weaponCardHeader}>
                        <span className={styles.weaponEmoji}>{tool.icon_emoji}</span>
                        <span className={styles.weaponName}>{tool.name}</span>
                      </div>
                      <p className={styles.weaponDesc}>{tool.description}</p>
                      <div className={styles.weaponMeta}>
                        <span>{tool.category?.toUpperCase()}</span>
                        <span>{'★'.repeat(tool.difficulty_rating || 1)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.buttonRow}>
                <button className={styles.btnSecondary} onClick={() => setStep(3)}>
                  &lt; BACK
                </button>
                <button
                  className={styles.btnPrimary}
                  disabled={selectedWeapons.length === 0 || submitting}
                  onClick={handleComplete}
                >
                  {submitting ? 'COMMITTING TO ARSENAL...' : '[ COMPLETE ONBOARDING & ENTER QUEST ]'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
