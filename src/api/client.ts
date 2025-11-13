// Minimal HTTP client for the frontend to talk to the backend API.
// Vite proxy maps "/api" to the server (see vite.config.ts), so we call relative paths by default.

const API_BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

function buildUrl(path: string) {
	const safePath = path.startsWith('/') ? path : `/${path}`;
	return `${API_BASE}${safePath}`;
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(buildUrl(path), {
		method: 'GET',
		...init,
	});
	if (!res.ok) throw new Error(`GET ${path} failed: ${res.status} ${res.statusText}`);
	return res.json();
}

export async function apiPost<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
	const res = await fetch(buildUrl(path), {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
		body: JSON.stringify(body),
		...init,
	});
	if (!res.ok) throw new Error(`POST ${path} failed: ${res.status} ${res.statusText}`);
	return res.json();
}

export async function apiPut<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
	const res = await fetch(buildUrl(path), {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
		body: JSON.stringify(body),
		...init,
	});
	if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status} ${res.statusText}`);
	return res.json();
}

export async function apiDelete(path: string, init?: RequestInit): Promise<void> {
	const res = await fetch(buildUrl(path), {
		method: 'DELETE',
		...init,
	});
	if (!res.ok) throw new Error(`DELETE ${path} failed: ${res.status} ${res.statusText}`);
}

