const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

/** Für Kunden sichtbare Meldung bei Netzwerkfehlern (kein "Failed to fetch" in Production). */
export const NETWORK_ERROR_MESSAGE =
    'Die Verbindung zum Server ist fehlgeschlagen. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es in Kürze erneut.';

export function isNetworkError(error: unknown): boolean {
    if (error instanceof TypeError && error.message === 'Failed to fetch') return true;
    if (error instanceof Error && /failed to fetch|network error|load failed/i.test(error.message)) return true;
    return false;
}

export async function apiClient<T>(
    endpoint: String,
    options?: RequestInit
): Promise<{ success: Boolean; data?: T; message?: string; error?: string }>
{
    try 
    {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok)
        {
            const message = (data && typeof data.message === 'string') ? data.message : 'API request failed';
            const err = new Error(message) as Error & { status?: number };
            err.status = response.status;
            throw err;
        }

        return data;
    } 
    catch (error) 
    {
        if (isNetworkError(error)) {
            console.error('API network error:', error);
            throw new Error(NETWORK_ERROR_MESSAGE);
        }
        // Erwartete Business-Fehler (4xx) nicht als Error loggen, nur unerwartete/5xx
        const status = (error as Error & { status?: number }).status;
        if (status == null || status >= 500) {
            console.error('API Error:', error);
        }
        throw error;
    }
}