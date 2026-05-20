const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!BASE_URL) {
  console.warn('[api] EXPO_PUBLIC_API_URL is not set. Create Frontend/.env and restart `expo start`.');
}

async function request(path, { method = 'GET', body, signal, headers } = {}) {
  const url = `${BASE_URL}${path}`;

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    throw new Error(`Network request failed: ${err.message}`);
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && payload.message) ||
      `Request to ${path} failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export const apiClient = {
  baseUrl: BASE_URL,
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
};
