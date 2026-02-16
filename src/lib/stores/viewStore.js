import { writable } from 'svelte/store';

/** Current view: 'landing' | 'profile-form' | 'events' | 'mentorship' | 'case-competitions' | 'students-connect' */
export const currentView = writable('landing');
