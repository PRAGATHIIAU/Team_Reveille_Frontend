<script>
  import { onMount } from 'svelte';
  import { signInWithGoogle } from './auth.js';
  import { authUser } from './stores/authStore.js';
  import { currentView } from './stores/viewStore.js';
  import ProfilePanel from './ProfilePanel.svelte';

  let showProfilePanel = $state(false);

  onMount(async () => {
    const { getAuthUser, getSession } = await import('./auth.js');
    const { checkIsFirstTimeSignIn, fetchUserProfile } = await import('./api.js');
    const isOAuthCallback = typeof window !== 'undefined' && window.location.search.includes('code=');
    
    // After OAuth redirect, allow time for the auth module to exchange the code
    if (isOAuthCallback) {
      await new Promise((r) => setTimeout(r, 600));
    }
    
    try {
      const user = await getAuthUser();
      authUser.set(user ?? null);

      if (user) {
        // Log ID token for signed-in user (for Postman / backend API testing; backend uses Bearer idToken)
        let session = await getSession();
        let idToken = session?.tokens?.idToken?.toString();
        if (!idToken && isOAuthCallback) {
          await new Promise((r) => setTimeout(r, 400));
          session = await getSession();
          idToken = session?.tokens?.idToken?.toString();
        }
        if (idToken) {
          console.log('[auth] ID token (for API e.g. Postman):', idToken);
        } else {
          console.warn('[auth] Signed in but no id token in session:', session ? 'session exists, check tokens shape' : 'no session');
        }
      }

      if (user && isOAuthCallback) {
        // After successful sign-in: check first-time via backend (placeholder)
        const isFirstTime = await checkIsFirstTimeSignIn(user);
        if (isFirstTime) {
          currentView.set('profile-form');
        } else {
          currentView.set('landing');
          await fetchUserProfile(user); // Populate profile from backend (placeholder)
        }
      }
    } catch {
      authUser.set(null);
      currentView.set('landing');
    }
  });

  async function handleSignIn() {
    await signInWithGoogle();
  }

  function openProfile() {
    showProfilePanel = true;
  }
</script>

<header class="header">
  <div class="header-inner">
    <a href="/" class="logo">
      <span class="logo-acronym">CMIS</span>
      <span class="logo-full">Council for the Management of Information Systems</span>
    </a>
    {#if $authUser}
      <button type="button" class="btn-profile-icon" on:click={openProfile} aria-label="View profile">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    {:else}
      <button type="button" class="btn-signin" on:click={handleSignIn}>
        Sign In
      </button>
    {/if}
  </div>
</header>

<ProfilePanel bind:open={showProfilePanel} />

<main class="main">
  <section class="hero">
    <h1 class="hero-title">Engagement Platform</h1>
    <p class="hero-subtitle">
      One place for student profiles, recruitment events, mentorship, and case competitions.
    </p>
    <p class="hero-byline">Powered by the Council for the Management of Information Systems</p>
  </section>

  <section class="features">
    <h2 class="features-heading">What we offer</h2>
    <div class="features-grid">
      <article class="feature-card">
        <div class="feature-icon" aria-hidden="true">👤</div>
        <h3 class="feature-title">Student Profiles</h3>
        <p class="feature-desc">Build and maintain your profile. Showcase your background, skills, and goals to recruiters and mentors.</p>
      </article>
      <article class="feature-card">
        <div class="feature-icon" aria-hidden="true">📅</div>
        <h3 class="feature-title">Recruitment Events</h3>
        <p class="feature-desc">Discover and register for company info sessions, career fairs, and networking events.</p>
      </article>
      <article class="feature-card">
        <div class="feature-icon" aria-hidden="true">🤝</div>
        <h3 class="feature-title">Mentorship</h3>
        <p class="feature-desc">Connect with industry mentors and peers for guidance, feedback, and career advice.</p>
      </article>
      <article class="feature-card">
        <div class="feature-icon" aria-hidden="true">🏆</div>
        <h3 class="feature-title">Case Competitions</h3>
        <p class="feature-desc">Compete in case competitions, form teams, and track deadlines and results.</p>
      </article>
    </div>
  </section>

  <section class="cta">
    <p class="cta-text">Ready to get started?</p>
    {#if $authUser}
      <button type="button" class="btn-cta" on:click={openProfile}>
        View Profile
      </button>
    {:else}
      <button type="button" class="btn-cta" on:click={handleSignIn}>
        Sign In
      </button>
    {/if}
  </section>
</main>

<footer class="footer">
  <p>© Council for the Management of Information Systems (CMIS). All rights reserved.</p>
</footer>

<style>
  :global(.landing-page) {
    --cmis-maroon: #500000;
    --cmis-maroon-dark: #3d0000;
    --cmis-maroon-light: #6b0f0f;
    --cmis-gold: #c68c53;
    --cmis-bg: #faf8f6;
    --cmis-card-bg: #ffffff;
    --cmis-text: #1a1a1a;
    --cmis-text-muted: #5c5c5c;
    --cmis-border: #e8e4e0;
    --header-height: 4rem;
  }

  .header {
    position: sticky;
    top: 0;
    z-index: 100;
    height: var(--header-height);
    background: var(--cmis-card-bg);
    border-bottom: 2px solid var(--cmis-maroon);
    box-shadow: 0 2px 8px rgba(80, 0, 0, 0.06);
  }

  .header-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    text-decoration: none;
    color: var(--cmis-text);
  }

  .logo-acronym {
    font-size: 1.35rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: var(--cmis-maroon);
  }

  .logo-full {
    font-size: 0.7rem;
    color: var(--cmis-text-muted);
    font-weight: 500;
    letter-spacing: 0.01em;
  }

  .btn-signin {
    padding: 0.5rem 1.25rem;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--cmis-card-bg);
    background: var(--cmis-maroon);
    border: 2px solid var(--cmis-maroon);
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
  }

  .btn-signin:hover {
    background: var(--cmis-maroon-dark);
    border-color: var(--cmis-maroon-dark);
  }

  .btn-signin:focus-visible {
    outline: 2px solid var(--cmis-gold);
    outline-offset: 2px;
  }

  .btn-profile-icon {
    width: 2.5rem;
    height: 2.5rem;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--cmis-card-bg);
    border: 2px solid var(--cmis-maroon);
    border-radius: 50%;
    cursor: pointer;
    color: var(--cmis-maroon);
    transition: background 0.2s, border-color 0.2s, transform 0.1s;
  }

  .btn-profile-icon:hover {
    background: var(--cmis-maroon);
    color: var(--cmis-card-bg);
    transform: scale(1.05);
  }

  .btn-profile-icon:active {
    transform: scale(0.95);
  }

  .btn-profile-icon:focus-visible {
    outline: 2px solid var(--cmis-gold);
    outline-offset: 2px;
  }

  .btn-profile-icon svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .main {
    min-height: calc(100vh - var(--header-height) - 120px);
    background: var(--cmis-bg);
  }

  .hero {
    max-width: 720px;
    margin: 0 auto;
    padding: 4rem 1.5rem 3rem;
    text-align: center;
  }

  .hero-title {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    color: var(--cmis-maroon);
    margin: 0 0 0.75rem;
    letter-spacing: -0.02em;
    line-height: 1.15;
  }

  .hero-subtitle {
    font-size: 1.2rem;
    line-height: 1.6;
    color: var(--cmis-text);
    margin: 0 0 0.5rem;
  }

  .hero-byline {
    font-size: 0.9rem;
    color: var(--cmis-text-muted);
    margin: 0;
  }

  .features {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
  }

  .features-heading {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--cmis-text);
    text-align: center;
    margin: 0 0 2rem;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
  }

  .feature-card {
    background: var(--cmis-card-bg);
    border: 1px solid var(--cmis-border);
    border-radius: 10px;
    padding: 1.75rem;
    text-align: center;
    transition: box-shadow 0.2s, border-color 0.2s;
  }

  .feature-card:hover {
    box-shadow: 0 8px 24px rgba(80, 0, 0, 0.08);
    border-color: var(--cmis-maroon-light);
  }

  .feature-icon {
    font-size: 2.25rem;
    margin-bottom: 0.75rem;
  }

  .feature-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--cmis-maroon);
    margin: 0 0 0.5rem;
  }

  .feature-desc {
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--cmis-text-muted);
    margin: 0;
  }

  .cta {
    text-align: center;
    padding: 2rem 1.5rem 3rem;
  }

  .cta-text {
    font-size: 1.1rem;
    color: var(--cmis-text-muted);
    margin: 0 0 1rem;
  }

  .btn-cta {
    padding: 0.6rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: var(--cmis-card-bg);
    background: var(--cmis-maroon);
    border: 2px solid var(--cmis-maroon);
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }

  .btn-cta:hover {
    background: var(--cmis-maroon-dark);
    border-color: var(--cmis-maroon-dark);
  }

  .btn-cta:focus-visible {
    outline: 2px solid var(--cmis-gold);
    outline-offset: 2px;
  }

  .footer {
    padding: 1.5rem;
    text-align: center;
    font-size: 0.8rem;
    color: var(--cmis-text-muted);
    background: var(--cmis-card-bg);
    border-top: 1px solid var(--cmis-border);
  }

  .footer p {
    margin: 0;
  }
</style>
