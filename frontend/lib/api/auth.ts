/**
 * Auth API – Login, Logout, aktueller User, Passwort ändern.
 * Passwort ändern (PATCH /auth/me/password) steht allen authentifizierten Rollen zu (admin, owner, staff).
 */

function getAuthApiBase(): string {
  if (typeof window !== "undefined") return "/api";
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(`${getAuthApiBase()}/auth/me/password`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      data && typeof data.message === "string" ? data.message : "Passwort konnte nicht geändert werden"
    );
  }
  return data;
}
