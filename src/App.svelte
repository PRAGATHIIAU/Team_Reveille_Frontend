<script>
  import LandingPage from './lib/LandingPage.svelte';
  import ProfileForm from './lib/ProfileForm.svelte';
  import { currentView } from './lib/stores/viewStore.js';
</script>

{#if $currentView === 'profile-form'}
  <ProfileForm />
{:else}
  <div class="landing-page">
    <LandingPage />
  </div>
{/if}
