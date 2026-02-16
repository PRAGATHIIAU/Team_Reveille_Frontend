import { writable } from 'svelte/store';

const defaultProfile = () => ({
  name: '',
  uin: '',
  degree: '',
  major: '',
  classYear: '',
  gradDate: '',
  linkedinUrl: '',
  resumeFileName: '',
  resumeS3Key: '',
});

/** @type {import('svelte/store').Writable<ReturnType<typeof defaultProfile>>} */
export const profile = writable(defaultProfile());

export function resetProfile() {
  profile.set(defaultProfile());
}
