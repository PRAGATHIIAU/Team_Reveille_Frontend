/**
 * Backend API client. See docs/API.md for full API documentation.
 */

import { getSession } from './auth.js';
import { profile } from './stores/profileStore.js';

const API_BASE =
  typeof import.meta.env?.VITE_API_BASE_URL === 'string' && import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
    : 'https://2gzy1e8qga.execute-api.us-east-1.amazonaws.com/dev';

const getAuthHeaders = async () => {
  const session = await getSession();
  const idToken = session?.tokens?.idToken?.toString();
  const headers = { 'Content-Type': 'application/json' };
  if (idToken) headers['Authorization'] = `Bearer ${idToken}`;
  return headers;
};

/**
 * Check if the signed-in user has a profile (first-time vs returning).
 * Used after sign-in: first-time → profile form, else → landing with profile fetched.
 * @param {{ userId: string }} user - Authenticated user (e.g. from getAuthUser())
 * @returns {Promise<boolean>} true if first-time (no profile), false if returning user
 */
export async function checkIsFirstTimeSignIn(user) {
  if (!user?.userId) return true;
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/users/me/profile-exists`, { headers });
    if (!res.ok) return true;
    const data = await res.json();
    return data.exists !== true;
  } catch {
    return true;
  }
}

/**
 * Fetch current user's profile from backend and populate profile store.
 * Called after sign-in when user is not first-time.
 * @param {{ userId: string }} [user] - Current user (unused; kept for API compatibility)
 * @returns {Promise<void>}
 */
export async function fetchUserProfile(user) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/profiles/me`, { headers });
    if (res.status === 404) return;
    if (!res.ok) return;
    const data = await res.json();
    profile.set({
      name: data.name ?? '',
      uin: data.uin ?? '',
      degree: data.degree ?? '',
      major: data.major ?? '',
      classYear: data.classYear ?? '',
      gradDate: data.gradDate ?? '',
      linkedinUrl: data.linkedInUrl ?? '',
      resumeFileName: data.resumeS3Key ? data.resumeS3Key.split('/').pop() ?? '' : '',
      resumeS3Key: data.resumeS3Key ?? '',
    });
  } catch (_) {}
}

/** Derive classYear from gradDate (e.g. "2026-05" -> "26") for backend */
function classYearFromGradDate(gradDate) {
  if (!gradDate || typeof gradDate !== 'string') return '';
  const y = gradDate.slice(0, 4);
  return y.length === 4 ? y.slice(2) : '';
}

/**
 * Create a new student profile (first-time sign-in).
 * @param {{
 *   name: string;
 *   uin: string;
 *   major: string;
 *   classYear: string;
 *   gradDate: string;
 *   linkedInUrl?: string;
 *   resumeS3Key?: string | null;
 * }} body
 * @returns {Promise<{ ok: boolean; error?: string; data?: object }>}
 */
export async function createProfile(body) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/profiles`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: body.name,
        uin: body.uin,
        degree: body.degree || undefined,
        major: body.major,
        classYear: classYearFromGradDate(body.gradDate),
        gradDate: body.gradDate,
        linkedInUrl: body.linkedInUrl || undefined,
        resumeS3Key: body.resumeS3Key || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data.message || res.statusText || 'Failed to create profile' };
    }
    profile.set({
      name: data.name ?? '',
      uin: data.uin ?? '',
      degree: data.degree ?? '',
      major: data.major ?? '',
      classYear: data.classYear ?? '',
      gradDate: data.gradDate ?? '',
      linkedinUrl: data.linkedInUrl ?? '',
      resumeFileName: data.resumeS3Key ? data.resumeS3Key.split('/').pop() ?? '' : '',
      resumeS3Key: data.resumeS3Key ?? '',
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err?.message || 'Network error' };
  }
}

/**
 * Update current user's profile (partial update).
 * @param {Partial<{ name: string; uin: string; major: string; classYear: string; gradDate: string; linkedInUrl: string; resumeS3Key: string }>} body
 * @returns {Promise<{ ok: boolean; error?: string; data?: object }>}
 */
export async function updateProfile(body) {
  try {
    const headers = await getAuthHeaders();
    const payload = {};
    if (body.name !== undefined) payload.name = body.name;
    if (body.uin !== undefined) payload.uin = body.uin;
    if (body.degree !== undefined) payload.degree = body.degree;
    if (body.major !== undefined) payload.major = body.major;
    if (body.gradDate !== undefined) {
      payload.gradDate = body.gradDate;
      payload.classYear = classYearFromGradDate(body.gradDate);
    }
    if (body.linkedInUrl !== undefined) payload.linkedInUrl = body.linkedInUrl;
    if (body.resumeS3Key !== undefined) payload.resumeS3Key = body.resumeS3Key;
    const res = await fetch(`${API_BASE}/api/profiles/me`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data.message || res.statusText || 'Failed to update profile' };
    }
    profile.set({
      name: data.name ?? '',
      uin: data.uin ?? '',
      degree: data.degree ?? '',
      major: data.major ?? '',
      classYear: data.classYear ?? '',
      gradDate: data.gradDate ?? '',
      linkedinUrl: data.linkedInUrl ?? '',
      resumeFileName: data.resumeS3Key ? data.resumeS3Key.split('/').pop() ?? '' : '',
      resumeS3Key: data.resumeS3Key ?? '',
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err?.message || 'Network error' };
  }
}
