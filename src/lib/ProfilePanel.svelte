<script>
  import { signOutUser } from './auth.js';
  import { profile } from './stores/profileStore.js';
  import { authUser } from './stores/authStore.js';
  import { currentView } from './stores/viewStore.js';
  import { fetchUserProfile, updateProfile } from './api.js';
  import ResumeSection from './ResumeSection.svelte';

  let { open = $bindable(false) } = $props();
  let name = '';
  let uin = '';
  let major = '';
  let classYear = '';
  let gradDate = '';
  let linkedinUrl = '';
  let resumeFileName = '';
  let resumeS3Key = '';
  let resumeFile = null;
  let resumeError = '';
  let saved = false;
  let saveError = '';
  let saving = false;

  // When panel opens, reset state and fetch latest profile from GET /api/profiles/me
  $effect(() => {
    if (open) {
      saveError = '';
      saved = false;
      fetchUserProfile();
    }
  });

  // Sync form fields from profile store (updates when fetch or save completes)
  $effect(() => {
    if (open) {
      const p = $profile;
      name = p.name ?? '';
      uin = p.uin ?? '';
      major = p.major ?? '';
      classYear = p.classYear ?? '';
      gradDate = p.gradDate ?? '';
      linkedinUrl = p.linkedinUrl ?? '';
      resumeFileName = p.resumeFileName ?? '';
      resumeS3Key = p.resumeS3Key ?? '';
      resumeFile = null;
      resumeError = '';
    }
  });

  function handleResumeChange(event) {
    const file = event.target?.files?.[0];
    resumeError = '';
    resumeFile = null;
    if (!file) return;
    const maxSizeBytes = 5 * 1024 * 1024;
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      resumeError = 'Resume must be a PDF file (.pdf).';
      return;
    }
    if (file.size > maxSizeBytes) {
      resumeError = 'File size must be 5MB or smaller.';
      return;
    }
    resumeFile = file;
    resumeFileName = file.name;
  }

  function closePanel() {
    open = false;
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) closePanel();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    saveError = '';
    if (resumeError) return;
    saving = true;
    const result = await updateProfile({
      name,
      uin,
      major,
      classYear,
      gradDate,
      linkedInUrl: linkedinUrl || undefined,
      resumeS3Key: resumeS3Key || undefined,
    });
    saving = false;
    if (!result.ok) {
      saveError = result.error || 'Failed to update profile.';
      return;
    }
    saved = true;
    resumeFile = null;
    closePanel();
  }

  async function handleSignOut() {
    await signOutUser();
    authUser.set(null);
    currentView.set('landing');
    open = false;
  }
</script>

{#if open}
  <div class="backdrop" role="dialog" aria-modal="true" aria-labelledby="profile-panel-title" on:click={handleBackdropClick}>
    <div class="panel" on:click|self>
      <div class="panel-header">
        <h2 id="profile-panel-title">My Profile</h2>
        <button type="button" class="btn-close" on:click={closePanel} aria-label="Close">×</button>
      </div>
      <p class="panel-subtitle">View and edit your student profile. Recruiters use this to discover you.</p>

      <form class="profile-form" on:submit={handleSubmit}>
        <div class="field">
          <label for="profile-name">Name</label>
          <input id="profile-name" type="text" bind:value={name} required placeholder="Your full name" />
        </div>
        <div class="field">
          <label for="profile-uin">UIN</label>
          <input id="profile-uin" type="text" bind:value={uin} required placeholder="e.g., 123456789" />
        </div>
        <div class="field">
          <label for="profile-major">Major</label>
          <input id="profile-major" type="text" bind:value={major} required placeholder="e.g., Computer Science" />
        </div>
        <div class="field">
          <label for="profile-classYear">Class Year <span class="hint">(e.g., '26)</span></label>
          <input id="profile-classYear" type="text" bind:value={classYear} required maxlength="4" placeholder="'26" />
        </div>
        <div class="field">
          <label for="profile-gradDate">Grad Date</label>
          <input id="profile-gradDate" type="month" bind:value={gradDate} required />
        </div>
        <div class="field">
          <label for="profile-linkedinUrl">LinkedIn URL</label>
          <input id="profile-linkedinUrl" type="url" bind:value={linkedinUrl} required placeholder="https://www.linkedin.com/in/your-handle" />
        </div>
        <div class="field">
          <label for="profile-resume">Resume <span class="hint">(PDF only, max 5MB)</span></label>
          <input id="profile-resume" type="file" accept="application/pdf" on:change={handleResumeChange} />
          {#if resumeError}
            <p class="error-message">{resumeError}</p>
          {/if}
          {#if resumeFileName && !resumeError}
            <p class="file-info">Current: {resumeFileName}</p>
          {/if}
          {#if resumeFile}
            <p class="file-info">New file selected: {resumeFile.name}</p>
          {/if}
        </div>
        {#if saveError}
          <p class="error-message">{saveError}</p>
        {/if}
        <div class="actions">
          <button type="button" class="btn-secondary" on:click={closePanel}>Cancel</button>
          <button type="submit" class="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        </div>
        {#if saved}
          <p class="success-message">Profile updated.</p>
        {/if}
      </form>
      <ResumeSection open={open} />
      <div class="panel-footer">
        <button type="button" class="btn-signout" on:click={handleSignOut}>Sign Out</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .panel {
    background: var(--cmis-card-bg, #fff);
    border-radius: 12px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
    border-top: 6px solid var(--cmis-maroon, #500000);
    max-width: 520px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    padding: 1.5rem 1.75rem;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.25rem;
  }

  .panel-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--cmis-maroon, #500000);
  }

  .btn-close {
    width: 2rem;
    height: 2rem;
    padding: 0;
    border: none;
    background: transparent;
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    color: var(--cmis-text-muted, #5c5c5c);
    border-radius: 6px;
  }

  .btn-close:hover {
    background: #eee;
    color: #1a1a1a;
  }

  .panel-subtitle {
    margin: 0 0 1.25rem;
    font-size: 0.9rem;
    color: var(--cmis-text-muted, #5c5c5c);
  }

  .profile-form {
    display: grid;
    gap: 1rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #3a3a3a;
  }

  .hint {
    font-weight: 400;
    font-size: 0.8rem;
    color: #7a7a7a;
    margin-left: 0.25rem;
  }

  input {
    padding: 0.55rem 0.7rem;
    font-size: 0.95rem;
    border-radius: 6px;
    border: 1px solid #c9c3bc;
    background: #fdfbf9;
  }

  input:focus {
    outline: none;
    border-color: var(--cmis-maroon, #500000);
    box-shadow: 0 0 0 2px rgba(80, 0, 0, 0.15);
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .btn-primary {
    padding: 0.55rem 1.25rem;
    font-size: 0.95rem;
    font-weight: 600;
    color: #fff;
    background: var(--cmis-maroon, #500000);
    border: 2px solid var(--cmis-maroon, #500000);
    border-radius: 6px;
    cursor: pointer;
  }

  .btn-primary:hover {
    background: var(--cmis-maroon-dark, #3d0000);
    border-color: var(--cmis-maroon-dark, #3d0000);
  }

  .btn-secondary {
    padding: 0.55rem 1.25rem;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--cmis-text, #1a1a1a);
    background: #eee;
    border: 1px solid #ccc;
    border-radius: 6px;
    cursor: pointer;
  }

  .btn-secondary:hover {
    background: #e0e0e0;
  }

  .success-message {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #155724;
    background: #d4edda;
    border-radius: 6px;
    padding: 0.5rem 0.75rem;
  }

  .error-message {
    margin-top: 0.25rem;
    font-size: 0.85rem;
    color: #721c24;
    background: #f8d7da;
    border-radius: 4px;
    padding: 0.4rem 0.6rem;
  }

  .file-info {
    margin-top: 0.25rem;
    font-size: 0.85rem;
    color: #3a3a3a;
  }

  .panel-footer {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--cmis-border, #e8e4e0);
  }

  .btn-signout {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--cmis-text-muted, #5c5c5c);
    background: transparent;
    border: 1px solid #ccc;
    border-radius: 6px;
    cursor: pointer;
  }

  .btn-signout:hover {
    color: #1a1a1a;
    background: #f0f0f0;
    border-color: #999;
  }
</style>
