const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

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
        console.error('API Error:', error);
        throw error;
    }
}