import { writable } from 'svelte/store';

/** Current view: 'landing' | 'profile-form' */
export const currentView = writable('landing');
