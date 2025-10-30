// config/utils/helper.ts

/**
 * Validiert ob ein String ein gültiges UUID v4 Format hat
 * 
 * @param token - Der zu validierende Token-String
 * @returns true wenn gültig, false wenn ungültig
 * 
 * @example
 * validateBookingToken('a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p6') // true
 * validateBookingToken('invalid-token') // false
 * validateBookingToken(undefined) // false
 */
export function validateBookingToken(token: string | undefined): boolean 
{
    if (!token) return false;
    
    // UUID v4 Format: 8-4-4-4-12 hexadezimale Zeichen
    // 4. Gruppe muss mit 4 beginnen (Version 4)
    // 5. Gruppe muss mit 8, 9, a oder b beginnen (Variant)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    return uuidRegex.test(token);
}

/**
 * Extrahiert Token aus verschiedenen Quellen und gibt nur Präfix für Logs zurück
 * 
 * @param token - Der vollständige Token
 * @returns Nur die ersten 8 Zeichen + "..." für sicheres Logging
 */
export function getTokenPrefix(token: string): string 
{
    return token.substring(0, 8) + '...';
}