<script>
  import { onMount } from 'svelte';
  import { profile } from './stores/profileStore.js';
  import { currentView } from './stores/viewStore.js';
  import { createProfile } from './api.js';
  import ResumeSection from './ResumeSection.svelte';
  import { DEGREE_OPTIONS, MAJOR_OPTIONS, validateUin } from './profileOptions.js';

  let name = '';
  let uin = '';
  let degree = '';
  let major = '';
  let gradDate = '';
  let linkedinUrl = '';
  let submitError = '';
  let uinError = '';
  let submitting = false;
  let submitted = false;

  onMount(() => {
    const p = $profile;
    if (p.name) name = p.name;
    if (p.uin) uin = p.uin;
    if (p.degree) degree = p.degree;
    if (p.major) major = p.major;
    if (p.gradDate) gradDate = p.gradDate;
    if (p.linkedinUrl) linkedinUrl = p.linkedinUrl;
  });

  function handleUinInput(e) {
    const v = e.target?.value ?? '';
    if (v === '' || /^\d*$/.test(v)) uin = v.slice(0, 9);
    uinError = '';
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    submitError = '';
    uinError = '';

    if (!validateUin(uin)) {
      uinError = 'UIN must be exactly 9 digits.';
      return;
    }
    if (!degree) {
      submitError = 'Please select a degree.';
      return;
    }
    if (!major) {
      submitError = 'Please select a major.';
      return;
    }

    submitting = true;
    const result = await createProfile({
      name,
      uin: uin.trim(),
      degree,
      major,
      gradDate,
      linkedInUrl: linkedinUrl || undefined,
      resumeS3Key: null,
    });
    submitting = false;

    if (!result.ok) {
      submitError = result.error || 'Failed to create profile.';
      return;
    }

    submitted = true;
    setTimeout(() => {
      currentView.set('landing');
    }, 1500);
  };
</script>

<section class="profile-form-container">
  <h1 class="heading">Student Profile</h1>
  <p class="subheading">
    Fill out your details so TAMU CMIS recruiters can discover you.
  </p>

  <form class="profile-form" onsubmit={handleSubmit}>
    <div class="field">
      <label for="name">Name</label>
      <input
        id="name"
        type="text"
        bind:value={name}
        required
        placeholder="Your full name"
      />
    </div>

    <div class="field">
      <label for="uin">UIN (University Identification Number)</label>
      <input
        id="uin"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        maxlength="9"
        value={uin}
        oninput={handleUinInput}
        required
        placeholder="9 digits, e.g. 123456789"
      />
      {#if uinError}
        <p class="error-message">{uinError}</p>
      {/if}
    </div>

    <div class="field">
      <label for="degree">Degree</label>
      <select id="degree" bind:value={degree} required>
        {#each DEGREE_OPTIONS as opt}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
    </div>

    <div class="field">
      <label for="major">Major</label>
      <select id="major" bind:value={major} required>
        {#each MAJOR_OPTIONS as opt}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
    </div>

    <div class="field">
      <label for="gradDate">Graduation Year</label>
      <input
        id="gradDate"
        type="month"
        bind:value={gradDate}
        required
      />
    </div>

    <div class="field">
      <label for="linkedinUrl">LinkedIn URL</label>
      <input
        id="linkedinUrl"
        type="url"
        bind:value={linkedinUrl}
        required
        placeholder="https://www.linkedin.com/in/your-handle"
      />
    </div>

    <ResumeSection open={true} />

    {#if submitError}
      <p class="error-message">{submitError}</p>
    {/if}

    <button type="submit" class="submit-button" disabled={submitting}>
      {submitting ? 'Saving…' : 'Save Profile'}
    </button>

    {#if submitted}
      <p class="success-message">Profile saved successfully.</p>
    {/if}
  </form>
</section>

<style>
  :global(body) {
    margin: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background-color: #f5f0eb;
    color: #1b1b1b;
  }

  .profile-form-container {
    max-width: 640px;
    margin: 3rem auto;
    padding: 2.5rem 2rem;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
    border-top: 6px solid #500000; /* TAMU maroon */
  }

  .heading {
    margin: 0 0 0.5rem;
    font-size: 1.9rem;
    font-weight: 700;
    color: #500000; /* TAMU maroon */
  }

  .subheading {
    margin: 0 0 1.5rem;
    font-size: 0.95rem;
    color: #4a4a4a;
  }

  .profile-form {
    display: grid;
    gap: 1.1rem;
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
    padding: 0.6rem 0.75rem;
    font-size: 0.95rem;
    border-radius: 6px;
    border: 1px solid #c9c3bc;
    background-color: #fdfbf9;
    transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
  }

  input::placeholder {
    color: #b0a79e;
  }

  input:focus, select:focus {
    outline: none;
    border-color: #500000;
    box-shadow: 0 0 0 2px rgba(80, 0, 0, 0.16);
    background-color: #ffffff;
  }

  select {
    padding: 0.6rem 0.75rem;
    font-size: 0.95rem;
    border-radius: 6px;
    border: 1px solid #c9c3bc;
    background-color: #fdfbf9;
    color: #1b1b1b;
    cursor: pointer;
  }

  .submit-button {
    margin-top: 0.5rem;
    padding: 0.7rem 1.2rem;
    border-radius: 999px;
    border: none;
    background-color: #500000; /* TAMU maroon */
    color: #ffffff;
    font-size: 0.98rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    cursor: pointer;
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    box-shadow: 0 8px 20px rgba(80, 0, 0, 0.35);
    transition: background-color 0.15s ease, box-shadow 0.15s ease, transform 0.05s ease;
  }

  .submit-button:hover {
    background-color: #380000;
    box-shadow: 0 10px 24px rgba(80, 0, 0, 0.45);
    transform: translateY(-1px);
  }

  .submit-button:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(80, 0, 0, 0.35);
  }

  .success-message {
    margin-top: 0.75rem;
    font-size: 0.9rem;
    color: #155724;
    background-color: #d4edda;
    border-radius: 6px;
    padding: 0.5rem 0.75rem;
  }

  .error-message {
    margin-top: 0.25rem;
    font-size: 0.85rem;
    color: #721c24;
    background-color: #f8d7da;
    border-radius: 4px;
    padding: 0.4rem 0.6rem;
  }

  .file-info {
    margin-top: 0.25rem;
    font-size: 0.85rem;
    color: #3a3a3a;
  }

  @media (max-width: 600px) {
    .profile-form-container {
      margin: 1.5rem 1rem;
      padding: 2rem 1.5rem;
    }

    .heading {
      font-size: 1.6rem;
    }
  }
</style>
