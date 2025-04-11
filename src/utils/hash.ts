/**
 * Utility functions for hashing data
 */
import CryptoJS from 'crypto-js';

/**
 * Hash algorithms supported by the library
 */
type HashAlgorithm = 'md5' | 'sha-1' | 'sha-256' | 'sha-512';

/**
 * Hash data using the specified algorithm
 * 
 * @param data - Data to hash
 * @param algorithm - Hash algorithm to use
 * @returns Hashed string
 */
export function hashData(data: string, algorithm: HashAlgorithm = 'sha-256'): string {
  if (typeof data !== 'string') {
    data = JSON.stringify(data);
  }
  
  switch (algorithm) {
    case 'md5':
      return CryptoJS.MD5(data).toString();
    case 'sha-1':
      return CryptoJS.SHA1(data).toString();
    case 'sha-256':
      return CryptoJS.SHA256(data).toString();
    case 'sha-512':
      return CryptoJS.SHA512(data).toString();
    default:
      return CryptoJS.SHA256(data).toString();
  }
}

/**
 * Hash multiple components together
 * 
 * @param components - Array of component data to hash
 * @param algorithm - Hash algorithm to use
 * @returns Combined hash of all components
 */
export function hashComponents(components: any[], algorithm: HashAlgorithm = 'sha-256'): string {
  const dataString = components
    .filter(component => component !== null && component !== undefined)
    .map(component => {
      if (typeof component === 'string') {
        return component;
      }
      return JSON.stringify(component);
    })
    .join('|');
  
  return hashData(dataString, algorithm);
}

/**
 * Create a stable hash that is consistent across browser sessions
 * 
 * @param components - Object containing component data
 * @param algorithm - Hash algorithm to use
 * @returns Stable hash
 */
export function createStableHash(
  components: Record<string, any>,
  algorithm: HashAlgorithm = 'sha-256'
): string {
  // Sort keys to ensure consistent order
  const sortedKeys = Object.keys(components).sort();
  
  // Create array of component values in sorted order
  const sortedComponents = sortedKeys.map(key => components[key]);
  
  // Hash the components
  return hashComponents(sortedComponents, algorithm);
}