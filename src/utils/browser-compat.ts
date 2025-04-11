/**
 * Browser compatibility utilities
 */

/**
 * Check if a feature is available in the current browser
 * 
 * @param featureName - Name of the feature to check
 * @returns Whether the feature is available
 */
export function isFeatureAvailable(featureName: string): boolean {
  try {
    // Check if the feature exists on the window object
    return (
      featureName in window ||
      // @ts-ignore - Dynamic property access
      typeof window[featureName] !== 'undefined'
    );
  } catch (error) {
    return false;
  }
}

/**
 * Get a safe reference to the navigator object
 * 
 * @returns Navigator object or empty object if not available
 */
export function getNavigator(): Navigator {
  try {
    return navigator || {};
  } catch (error) {
    return {} as Navigator;
  }
}

/**
 * Get a safe reference to the screen object
 * 
 * @returns Screen object or empty object if not available
 */
export function getScreen(): Screen {
  try {
    return screen || {};
  } catch (error) {
    return {} as Screen;
  }
}

/**
 * Create a canvas element safely
 * 
 * @returns Canvas element or null if not supported
 */
export function createCanvas(): HTMLCanvasElement | null {
  try {
    return document.createElement('canvas');
  } catch (error) {
    return null;
  }
}

/**
 * Get a 2D rendering context from a canvas
 * 
 * @param canvas - Canvas element
 * @returns 2D rendering context or null if not supported
 */
export function get2DContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  try {
    return canvas.getContext('2d');
  } catch (error) {
    return null;
  }
}

/**
 * Get a WebGL rendering context from a canvas
 * 
 * @param canvas - Canvas element
 * @returns WebGL rendering context or null if not supported
 */
export function getWebGLContext(canvas: HTMLCanvasElement): WebGLRenderingContext | null {
  try {
    return (
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    ) as WebGLRenderingContext | null;
  } catch (error) {
    return null;
  }
}

/**
 * Create an AudioContext safely
 * 
 * @returns AudioContext or null if not supported
 */
export function createAudioContext(): AudioContext | null {
  try {
    // @ts-ignore - Handle vendor prefixes
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    return new AudioContext();
  } catch (error) {
    return null;
  }
}

/**
 * Check if local storage is available
 * 
 * @returns Whether local storage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__browser_shield_test__';
    localStorage.setItem(test, test);
    const result = localStorage.getItem(test) === test;
    localStorage.removeItem(test);
    return result;
  } catch (error) {
    return false;
  }
}

/**
 * Check if session storage is available
 * 
 * @returns Whether session storage is available
 */
export function isSessionStorageAvailable(): boolean {
  try {
    const test = '__browser_shield_test__';
    sessionStorage.setItem(test, test);
    const result = sessionStorage.getItem(test) === test;
    sessionStorage.removeItem(test);
    return result;
  } catch (error) {
    return false;
  }
}

/**
 * Check if cookies are enabled
 * 
 * @returns Whether cookies are enabled
 */
export function areCookiesEnabled(): boolean {
  try {
    // Navigator.cookieEnabled exists in modern browsers
    if (typeof navigator.cookieEnabled !== 'undefined') {
      return navigator.cookieEnabled;
    }
    
    // For older browsers, try to set and read a cookie
    document.cookie = '__browser_shield_test__=1';
    const result = document.cookie.indexOf('__browser_shield_test__=') !== -1;
    document.cookie = '__browser_shield_test__=1; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    return result;
  } catch (error) {
    return false;
  }
}