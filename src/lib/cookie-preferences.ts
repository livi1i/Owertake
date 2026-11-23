export const COOKIE_KEY = 'overtake:cookie-preferences';
export const COOKIE_VERSION = 2;
export const COOKIE_ACCEPTED_EVENT = 'overtake:cookie-accepted';
export const COOKIE_MAX_AGE = 180 * 24 * 60 * 60 * 1000;
export type CookieChoice = { version:number; necessary:true; analytics:false; marketing:false; savedAt:number };
export function necessaryChoice(now = Date.now()):CookieChoice {
  return {version:COOKIE_VERSION, necessary:true, analytics:false, marketing:false, savedAt:now};
}
export function parseCookieChoice(raw:string|null, now = Date.now()):CookieChoice|null {
  try {
    const value = JSON.parse(raw || 'null');
    if (!value || value.version !== COOKIE_VERSION || value.necessary !== true || value.analytics !== false || value.marketing !== false || !Number.isFinite(value.savedAt) || value.savedAt > now || now - value.savedAt >= COOKIE_MAX_AGE) return null;
    return necessaryChoice(value.savedAt);
  } catch { return null; }
}
