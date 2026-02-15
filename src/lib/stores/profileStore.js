import { writable } from 'svelte/store';

const defaultProfile = () => ({
  name: '',
  major: '',
  classYear: '',
  gradDate: '',
  linkedinUrl: '',
  resumeFileName: '',
});

/** @type {import('svelte/store').Writable<ReturnType<typeof defaultProfile>>} */
export const profile = writable(defaultProfile());

export function resetProfile() {
  profile.set(defaultProfile());
}
