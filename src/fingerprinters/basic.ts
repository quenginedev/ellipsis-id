/**
 * Basic browser information fingerprinting
 */
import { ComponentData } from '../types';
import { hashData } from '../utils/hash';
import { getNavigator, getScreen } from '../utils/browser-compat';

/**
 * Get basic browser information for fingerprinting
 * 
 * @returns Basic browser information component data
 */
export async function getBasicFingerprint(): Promise<ComponentData> {
  const nav = getNavigator();
  const screen = getScreen();
  
  // Collect basic browser information
  const data = {
    userAgent: nav.userAgent || '',
    language: nav.language || '',
    languages: Array.isArray(nav.languages) ? [...nav.languages] : [nav.language || ''],
    platform: nav.platform || '',
    vendor: nav.vendor || '',
    cpuClass: (nav as any).cpuClass || '',
    oscpu: (nav as any).oscpu || '',
    hardwareConcurrency: nav.hardwareConcurrency || 0,
    deviceMemory: (nav as any).deviceMemory || 0,
    timezone: new Date().getTimezoneOffset(),
    timezoneString: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    screenWidth: screen.width || 0,
    screenHeight: screen.height || 0,
    screenColorDepth: screen.colorDepth || 0,
    screenPixelDepth: screen.pixelDepth || 0,
    screenAvailWidth: screen.availWidth || 0,
    screenAvailHeight: screen.availHeight || 0,
    doNotTrack: nav.doNotTrack || (nav as any).msDoNotTrack || (window as any).doNotTrack || '',
    cookieEnabled: nav.cookieEnabled,
    appName: nav.appName || '',
    appCodeName: nav.appCodeName || '',
    appVersion: nav.appVersion || '',
    pdfViewerEnabled: (nav as any).pdfViewerEnabled || false,
    maxTouchPoints: nav.maxTouchPoints || 0,
    productSub: nav.productSub || '',
    buildID: (nav as any).buildID || '',
  };
  
  // Hash the collected data
  const hash = hashData(JSON.stringify(data));
  
  return {
    raw: data,
    hash
  };
}