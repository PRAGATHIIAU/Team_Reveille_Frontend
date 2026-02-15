/**
 * Backend API client (placeholders). Replace with real fetch calls when backend is ready.
 * See docs/API.md for full API documentation.
 */

import { getSession } from './auth.js';
import { profile } from './stores/profileStore.js';

const getAuthHeaders = async () => {
  const session = await getSession();
  const idToken = session?.tokens?.idToken?.toString();
  const headers = { 'Content-Type': 'application/json' };
  if (idToken) headers['Authorization'] = `Bearer ${idToken}`;
  return headers;
};

/**
 * Check if the signed-in user is first-time (no profile in backend).
 * Used after sign-in: first-time → profile form, else → landing with profile fetched.
 *
 * TODO: Replace with real backend call.
 * @param {{ userId: string }} user - Authenticated user (e.g. from getAuthUser())
 * @returns {Promise<boolean>} true if first-time sign-in (no profile), false if returning user
 */
export async function checkIsFirstTimeSignIn(user) {
  if (!user?.userId) return true;

  // TODO: Replace with backend API call
  // const headers = await getAuthHeaders();
  // const res = await fetch('/api/users/me/profile-exists', { headers });
  // if (!res.ok) return true;
  // const data = await res.json();
  // return data.exists !== true;

  // Placeholder: use localStorage until backend exists
  const key = `cmis_profile_${user.userId}`;
  return localStorage.getItem(key) !== 'true';
}

/**
 * Fetch current user's profile from backend and populate profile store.
 * Called after sign-in when user is not first-time (redirect to landing with data autopopulated).
 *
 * TODO: Replace with real backend call.
 * @param {{ userId: string }} [user] - Current user (for placeholder key)
 * @returns {Promise<void>}
 */
export async function fetchUserProfile(user) {
  // TODO: Replace with backend API call
  // const headers = await getAuthHeaders();
  // const res = await fetch('/api/profiles/me', { headers });
  // if (!res.ok) return;
  // const data = await res.json();
  // profile.set({
  //   name: data.name ?? '',
  //   major: data.major ?? '',
  //   classYear: data.classYear ?? '',
  //   gradDate: data.gradDate ?? '',
  //   linkedinUrl: data.linkedinUrl ?? '',
  //   resumeFileName: data.resumeFileName ?? '',
  // });

  // Placeholder: try to restore from localStorage (key used by ProfileForm on save)
  if (user?.userId) {
    try {
      const raw = localStorage.getItem(`cmis_profile_data_${user.userId}`);
      if (raw) {
        const data = JSON.parse(raw);
        profile.set({
          name: data.name ?? '',
          major: data.major ?? '',
          classYear: data.classYear ?? '',
          gradDate: data.gradDate ?? '',
          linkedinUrl: data.linkedinUrl ?? '',
          resumeFileName: data.resumeFileName ?? '',
        });
      }
    } catch (_) {}
  }
}
