/**
 * Browser feature detection fingerprinting
 */
import { ComponentData } from '../types';
import { hashData } from '../utils/hash';
import { isFeatureAvailable } from '../utils/browser-compat';
import { BROWSER_FEATURES } from '../config';

/**
 * Get browser feature support map
 * 
 * @returns Feature detection component data
 */
export async function getFeatureFingerprint(): Promise<ComponentData> {
  try {
    // Create feature support map
    const featureMap: Record<string, boolean> = {};
    
    // Check each feature
    for (const feature of BROWSER_FEATURES) {
      featureMap[feature] = isFeatureAvailable(feature);
    }
    
    // Add additional feature checks
    featureMap['localStorage'] = typeof localStorage !== 'undefined';
    featureMap['sessionStorage'] = typeof sessionStorage !== 'undefined';
    featureMap['indexedDB'] = typeof indexedDB !== 'undefined';
    featureMap['webSockets'] = typeof WebSocket !== 'undefined';
    featureMap['webWorkers'] = typeof Worker !== 'undefined';
    featureMap['serviceWorkers'] = 'serviceWorker' in navigator;
    featureMap['geolocation'] = 'geolocation' in navigator;
    featureMap['webRTC'] = 'RTCPeerConnection' in window;
    featureMap['webGL'] = !!document.createElement('canvas').getContext('webgl');
    featureMap['webGL2'] = !!document.createElement('canvas').getContext('webgl2');
    featureMap['touchEvents'] = 'ontouchstart' in window;
    featureMap['pointerEvents'] = 'onpointerdown' in window;
    featureMap['bluetooth'] = 'bluetooth' in navigator;
    featureMap['usb'] = 'usb' in navigator;
    featureMap['battery'] = 'getBattery' in navigator;
    featureMap['credentials'] = 'credentials' in navigator;
    featureMap['permissions'] = 'permissions' in navigator;
    featureMap['paymentRequest'] = 'PaymentRequest' in window;
    featureMap['webShare'] = 'share' in navigator;
    featureMap['webVR'] = 'getVRDisplays' in navigator;
    featureMap['webXR'] = 'xr' in navigator;
    featureMap['mediaDevices'] = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    featureMap['mediaRecorder'] = typeof MediaRecorder !== 'undefined';
    featureMap['mediaSession'] = 'mediaSession' in navigator;
    featureMap['speechSynthesis'] = 'speechSynthesis' in window;
    featureMap['speechRecognition'] = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    featureMap['clipboard'] = 'clipboard' in navigator;
    featureMap['performanceAPI'] = 'performance' in window;
    featureMap['storageManager'] = 'storage' in navigator;
    featureMap['vibrate'] = 'vibrate' in navigator;
    featureMap['requestIdleCallback'] = 'requestIdleCallback' in window;
    featureMap['requestAnimationFrame'] = 'requestAnimationFrame' in window;
    featureMap['intersectionObserver'] = 'IntersectionObserver' in window;
    featureMap['resizeObserver'] = 'ResizeObserver' in window;
    featureMap['mutationObserver'] = 'MutationObserver' in window;
    featureMap['performanceObserver'] = 'PerformanceObserver' in window;
    featureMap['reportingObserver'] = 'ReportingObserver' in window;
    
    // Count the number of supported features
    const supportedFeatureCount = Object.values(featureMap).filter(Boolean).length;
    
    // Create result object
    const result = {
      featureMap,
      supportedFeatureCount,
      totalFeatureCount: Object.keys(featureMap).length
    };
    
    // Hash the result
    const hash = hashData(JSON.stringify(result));
    
    return {
      raw: result,
      hash
    };
  } catch (error) {
    return {
      raw: `Feature detection error: ${error}`,
      hash: hashData(`Feature detection error: ${error}`)
    };
  }
}