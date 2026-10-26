/**
 * Account Holder (Owner) Authentication & Security Module
 * 
 * Provides private access control for the site owner.
 * Regular users/visitors cannot access or modify the content.
 */

const OWNER_SESSION_KEY = 'promptvista_owner_session';
const MASTER_PASSCODE_KEY = 'promptvista_owner_passcode';
const PASSCODE_CUSTOMIZED_KEY = 'promptvista_passcode_customized';
export const DEFAULT_PASSCODE = 'admin123';

/**
 * Check if the owner has set a custom passcode
 */
export function isCustomPasscodeSet(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(PASSCODE_CUSTOMIZED_KEY) === 'true';
}

/**
 * Retrieve the current active master passcode
 */
export function getMasterPasscode(): string {
  if (typeof window === 'undefined') return DEFAULT_PASSCODE;
  const stored = localStorage.getItem(MASTER_PASSCODE_KEY);
  if (stored && stored.trim()) {
    return stored.trim();
  }
  return DEFAULT_PASSCODE;
}

/**
 * Set a new custom master passcode and mark it as customized
 */
export function setMasterPasscode(newPasscode: string): boolean {
  if (typeof window === 'undefined') return false;
  const clean = newPasscode.trim();
  if (!clean || clean.length < 4) return false;

  localStorage.setItem(MASTER_PASSCODE_KEY, clean);
  localStorage.setItem(PASSCODE_CUSTOMIZED_KEY, 'true');

  // Broadcast to other tabs
  window.dispatchEvent(new Event('owner_passcode_changed'));
  return true;
}

/**
 * Reset passcode back to default 'admin123'
 */
export function resetPasscodeToDefault(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MASTER_PASSCODE_KEY, DEFAULT_PASSCODE);
  localStorage.removeItem(PASSCODE_CUSTOMIZED_KEY);
  window.dispatchEvent(new Event('owner_passcode_changed'));
}

/**
 * Check if the owner session is currently active
 */
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

/**
 * Attempt owner login with passcode
 */
export function loginOwner(passcode: string): { success: boolean; error?: string } {
  if (typeof window === 'undefined') return { success: false, error: 'Window not available' };
  
  const currentPasscode = getMasterPasscode();
  const attempt = (passcode || '').trim();

  // Exact match with current active passcode
  if (attempt === currentPasscode) {
    const sessionData = {
      authenticated: true,
      timestamp: Date.now(),
      role: 'owner',
    };
    localStorage.setItem(OWNER_SESSION_KEY, JSON.stringify(sessionData));
    window.dispatchEvent(new Event('owner_auth_change'));
    return { success: true };
  }

  // If user entered default 'admin123' but changed it to a custom passcode
  if (attempt === DEFAULT_PASSCODE && isCustomPasscodeSet()) {
    return {
      success: false,
      error: 'ডিফল্ট পাসকোড "admin123" নিষ্ক্রিয় করা হয়েছে, কারণ আপনি নতুন কাস্টম পাসকোড সেট করেছেন। দয়া করে আপনার নতুন পাসকোডটি দিন। (Default admin123 is disabled)',
    };
  }

  return { success: false, error: 'ভুল মাস্টার পাসকোড! সঠিক পাসকোডটি দিন। (Incorrect passcode)' };
}

/**
 * Log out owner and lock the control panel
 */
export function logoutOwner(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(OWNER_SESSION_KEY);
  window.dispatchEvent(new Event('owner_auth_change'));
}
