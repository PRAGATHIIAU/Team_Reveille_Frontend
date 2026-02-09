/**
 * Auth service: Google SSO via Cognito (federated login for TAMU students).
 * No separate password creation — students sign in with TAMU Google only.
 */

import { Amplify } from 'aws-amplify';
import { signInWithRedirect, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import { isAuthConfigured, getAmplifyAuthConfig } from '../config/auth.config.js';

// Configure Amplify as soon as this module loads (so OAuth callback can complete).
if (isAuthConfigured()) {
  try {
    Amplify.configure({
      Auth: {
        Cognito: getAmplifyAuthConfig(),
      },
    });
  } catch (err) {
    console.error('[auth] Amplify configure failed:', err);
  }
}

/**
 * Start Google SSO (redirects to Cognito Hosted UI → Google).
 * Students use TAMU Google (e.g. aupragathii@tamu.edu); no password sign-up.
 */
export async function signInWithGoogle() {
  if (!isAuthConfigured()) {
    console.warn('[auth] Auth not configured. Add .env from .env.example and complete CONFIG_TODO.md.');
    return;
  }
  await signInWithRedirect({ provider: 'Google' });
}

/**
 * Sign out (redirects to Cognito sign-out then back to redirectSignOut).
 */
export async function signOutUser() {
  if (!isAuthConfigured()) return;
  await signOut();
}

/**
 * Get current authenticated user, if any.
 * @returns {Promise<import('aws-amplify/auth').AuthUser | null>}
 */
export async function getAuthUser() {
  if (!isAuthConfigured()) return null;
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

/**
 * Get the current session (tokens). Useful for API calls.
 * @returns {Promise<import('aws-amplify/auth').FetchAuthSessionOutput | null>}
 */
export async function getSession() {
  if (!isAuthConfigured()) return null;
  try {
    return await fetchAuthSession();
  } catch {
    return null;
  }
}

export { isAuthConfigured };
