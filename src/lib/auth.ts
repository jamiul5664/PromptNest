/**
 * Account Holder (Owner) Authentication & Security Module
 * 
 * Provides private access control for the site owner.
 * Regular users/visitors cannot access or modify the content.
 */

const OWNER_SESSION_KEY = 'promptvista_owner_session';
const MASTER_PASSCODE_KEY = 'promptvista_owner_passcode';
const DEFAULT_PASSCODE = 'admin123'; // Default master passcode (can be changed by owner)

export function getMasterPasscode(): string {
  if (typeof window === 'undefined') return DEFAULT_PASSCODE;
  return localStorage.getItem(MASTER_PASSCODE_KEY) || DEFAULT_PASSCODE;
}

export function setMasterPasscode(newPasscode: string): boolean {
  if (typeof window === 'undefined' || !newPasscode.trim()) return false;
  localStorage.setItem(MASTER_PASSCODE_KEY, newPasscode.trim());
  return true;
}

export function isOwnerAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const session = localStorage.getItem(OWNER_SESSION_KEY);
  if (!session) return false;
  try {
    const data = JSON.parse(session);
    return Boolean(data.authenticated && data.timestamp);
  } catch {
    return false;
  }
}

export function loginOwner(passcode: string): { success: boolean; error?: string } {
  if (typeof window === 'undefined') return { success: false, error: 'Window not available' };
  
  const currentPasscode = getMasterPasscode();
  if (passcode.trim() === currentPasscode) {
    const sessionData = {
      authenticated: true,
      timestamp: Date.now(),
      role: 'owner',
    };
    localStorage.setItem(OWNER_SESSION_KEY, JSON.stringify(sessionData));
    
    // Dispatch event so components react instantly
    window.dispatchEvent(new Event('owner_auth_change'));
    return { success: true };
  }

  return { success: false, error: 'Incorrect master passcode. Access denied.' };
}

export function logoutOwner(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(OWNER_SESSION_KEY);
  window.dispatchEvent(new Event('owner_auth_change'));
}
