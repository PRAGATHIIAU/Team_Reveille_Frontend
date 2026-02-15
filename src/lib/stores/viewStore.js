import { writable } from 'svelte/store';

/** Current view: 'landing' | 'profile-form' | 'events' | 'mentorship' | 'case-competitions' */
export const currentView = writable('landing');
