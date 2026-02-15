/**
 * Resume upload/download API client (S3 presigned URL flow).
 * Uses same base URL as main API (VITE_API_BASE_URL). Auth: Bearer ID token for backend only.
 * Do NOT send Authorization to the presigned S3 PUT URL.
 */

import { getSession } from './auth.js';

const API_BASE =
  typeof import.meta.env?.VITE_API_BASE_URL === 'string' && import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
    : 'https://2gzy1e8qga.execute-api.us-east-1.amazonaws.com/dev';

const PDF_MAX_BYTES = 5 * 1024 * 1024; // 5MB

async function getAuthHeaders() {
  const session = await getSession();
  const idToken = session?.tokens?.idToken?.toString();
  const headers = { 'Content-Type': 'application/json' };
  if (idToken) headers['Authorization'] = `Bearer ${idToken}`;
  return headers;
}

function userFacingError(res, data) {
  if (res.status === 401) return 'Session expired, please sign in again.';
  if (res.status === 403) return 'You don’t have permission to perform this action.';
  return data?.message || data?.error || res.statusText || 'Request failed.';
}

/**
 * Get presigned upload URL from backend.
 * @param {string} fileName
 * @param {string} contentType - e.g. 'application/pdf'
 * @returns {Promise<{ ok: true; uploadUrl: string; resumeId: string; s3Key: string; expiresInSeconds?: number } | { ok: false; error: string; status?: number }>}
 */
export async function getUploadUrl(fileName, contentType) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/resumes/upload-url`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ fileName, contentType }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: userFacingError(res, data), status: res.status };
    }
    return {
      ok: true,
      uploadUrl: data.uploadUrl,
      resumeId: data.resumeId,
      s3Key: data.s3Key,
      expiresInSeconds: data.expiresInSeconds,
    };
  } catch (err) {
    return { ok: false, error: err?.message || 'Network error.' };
  }
}

/**
 * Upload file to S3 presigned URL. No Authorization header. Content-Type: application/pdf.
 * @param {string} uploadUrl - Presigned URL (do not store long-term)
 * @param {File} file - PDF file
 * @param {(percent: number) => void} [onProgress] - 0–100
 * @returns {Promise<{ ok: true } | { ok: false; error: string }>}
 */
export function uploadToPresignedUrl(uploadUrl, file, onProgress) {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);

    xhr.setRequestHeader('Content-Type', 'application/pdf');
    // Do NOT set Authorization for S3 presigned URL.

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && typeof onProgress === 'function') {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ ok: true });
      } else {
        resolve({ ok: false, error: 'Upload failed, please retry.' });
      }
    });

    xhr.addEventListener('error', () => {
      resolve({ ok: false, error: 'Upload failed, please retry.' });
    });

    xhr.addEventListener('abort', () => {
      resolve({ ok: false, error: 'Upload cancelled.' });
    });

    xhr.send(file);
  });
}

/**
 * Complete resume upload on backend after S3 PUT.
 * @param {string} resumeId
 * @returns {Promise<{ ok: true; data?: object } | { ok: false; error: string; status?: number }>}
 */
export async function completeUpload(resumeId) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/resumes/complete`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ resumeId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: userFacingError(res, data), status: res.status };
    }
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err?.message || 'Network error.' };
  }
}

/**
 * List current user's resumes (metadata).
 * @returns {Promise<{ ok: true; resumes: Array<object> } | { ok: false; error: string; status?: number }>}
 */
export async function listMyResumes() {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/resumes/me`, { headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: userFacingError(res, data), status: res.status };
    }
    const list = Array.isArray(data) ? data : data?.resumes ?? data?.items ?? [];
    return { ok: true, resumes: list };
  } catch (err) {
    return { ok: false, error: err?.message || 'Network error.' };
  }
}

/**
 * Get temporary download URL for a resume.
 * @param {string} resumeId
 * @returns {Promise<{ ok: true; downloadUrl: string } | { ok: false; error: string; status?: number }>}
 */
export async function getDownloadUrl(resumeId) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/api/resumes/${encodeURIComponent(resumeId)}/download-url`, {
      headers,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: userFacingError(res, data), status: res.status };
    }
    const url = data.downloadUrl || data.url;
    if (!url) {
      return { ok: false, error: 'No download URL returned.' };
    }
    return { ok: true, downloadUrl: url };
  } catch (err) {
    return { ok: false, error: err?.message || 'Network error.' };
  }
}

export const PDF_MAX_BYTES_EXPORT = PDF_MAX_BYTES;
