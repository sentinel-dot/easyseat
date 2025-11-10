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

        const data = await response.json();

        if (!response.ok)
        {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } 
    catch (error) 
    {
        console.error('API Error:', error);
        throw error;
    }
}