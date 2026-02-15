import { writable } from 'svelte/store';

/** @type {import('svelte/store').Writable<import('aws-amplify/auth').AuthUser | null>} */
export const authUser = writable(null);
