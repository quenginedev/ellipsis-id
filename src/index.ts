/**
 * ellipsis-id - A comprehensive browser fingerprinting library
 */
import { FingerprintOptions, FingerprintResult } from "./types";
import { DEFAULT_OPTIONS } from "./config";
import { createStableHash } from "./utils/hash";
import { encodeFingerprint } from "./utils/encoding";

// Import fingerprinting modules
import { getBasicFingerprint } from "./fingerprinters/basic";
import { getCanvasFingerprint } from "./fingerprinters/canvas";
import { getWebGLFingerprint } from "./fingerprinters/webgl";
import { getAudioFingerprint } from "./fingerprinters/audio";
import { getFontFingerprint } from "./fingerprinters/fonts";
import { getFeatureFingerprint } from "./fingerprinters/features";

/**
 * Generate a browser fingerprint
 *
 * @param options - Configuration options for fingerprint generation
 * @returns Promise resolving to fingerprint result
 */
export async function generateFingerprint(
  options?: FingerprintOptions
): Promise<string> {
  // Merge options with defaults
  const mergedOptions: FingerprintOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // Create timeout promise
  const timeoutPromise = new Promise<FingerprintResult>((_, reject) => {
    setTimeout(() => {
      reject(
        new Error(
          `Fingerprint generation timed out after ${mergedOptions.timeout}ms`
        )
      );
    }, mergedOptions.timeout);
  });

  // Create fingerprint promise
  const fingerprintPromise = generateFingerprintInternal(mergedOptions);

  // Race the promises
  const result = await Promise.race([fingerprintPromise, timeoutPromise]);

  // Return just the hash by default
  return result.hash;
}

/**
 * Generate a detailed fingerprint result
 *
 * @param options - Configuration options for fingerprint generation
 * @returns Promise resolving to detailed fingerprint result
 */
export async function generateDetailedFingerprint(
  options?: FingerprintOptions
): Promise<FingerprintResult> {
  // Merge options with defaults
  const mergedOptions: FingerprintOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // Create timeout promise
  const timeoutPromise = new Promise<FingerprintResult>((_, reject) => {
    setTimeout(() => {
      reject(
        new Error(
          `Fingerprint generation timed out after ${mergedOptions.timeout}ms`
        )
      );
    }, mergedOptions.timeout);
  });

  // Create fingerprint promise
  const fingerprintPromise = generateFingerprintInternal(mergedOptions);

  // Race the promises
  return Promise.race([fingerprintPromise, timeoutPromise]);
}

/**
 * Internal function to generate a fingerprint
 *
 * @param options - Configuration options for fingerprint generation
 * @returns Promise resolving to fingerprint result
 */
async function generateFingerprintInternal(
  options: FingerprintOptions
): Promise<FingerprintResult> {
  // Determine which fingerprinting methods to use
  const methods = options.methods || DEFAULT_OPTIONS.methods || [];

  // Initialize components object
  const components: Record<string, any> = {};

  // Execute fingerprinting methods in parallel
  const promises: Promise<void>[] = [];

  // Basic browser information
  if (methods.includes("basic")) {
    promises.push(
      getBasicFingerprint().then((result) => {
        components.basic = result;
      })
    );
  }

  // Canvas fingerprinting
  if (methods.includes("canvas")) {
    promises.push(
      getCanvasFingerprint().then((result) => {
        components.canvas = result;
      })
    );
  }

  // WebGL fingerprinting
  if (methods.includes("webgl")) {
    promises.push(
      getWebGLFingerprint().then((result) => {
        components.webgl = result;
      })
    );
  }

  // Audio fingerprinting
  if (methods.includes("audio")) {
    promises.push(
      getAudioFingerprint().then((result) => {
        components.audio = result;
      })
    );
  }

  // Font detection
  if (methods.includes("fonts")) {
    promises.push(
      getFontFingerprint().then((result) => {
        components.fonts = result;
      })
    );
  }

  // Feature detection
  if (methods.includes("features")) {
    promises.push(
      getFeatureFingerprint().then((result) => {
        components.features = result;
      })
    );
  }

  // Public IP (if enabled)
  if (options.includePublicIp && options.publicIpProvider) {
    promises.push(
      Promise.resolve().then(async () => {
        try {
          // Check if publicIpProvider is defined before calling it
          if (options.publicIpProvider) {
            const ip = await options.publicIpProvider();
            components.publicIp = {
              raw: ip,
              hash: createStableHash({ ip }),
            };
          } else {
            components.publicIp = {
              raw: "No public IP provider configured",
              hash: createStableHash({
                message: "No public IP provider configured",
              }),
            };
          }
        } catch (error) {
          components.publicIp = {
            raw: `Error getting public IP: ${error}`,
            hash: createStableHash({
              error: `Error getting public IP: ${error}`,
            }),
          };
        }
      })
    );
  }

  // Wait for all fingerprinting methods to complete
  await Promise.all(promises);

  // Create component hashes object for the final hash
  const componentHashes: Record<string, string> = {};
  for (const [key, value] of Object.entries(components)) {
    componentHashes[key] = value.hash;
  }

  // Create the final hash
  const hash = createStableHash(componentHashes, options.hashAlgorithm);

  // Create the result object
  const result: FingerprintResult = {
    hash,
    components,
    createdAt: Date.now(),
  };

  return result;
}

/**
 * Export individual fingerprinting components
 */
export const components = {
  getBasicFingerprint,
  getCanvasFingerprint,
  getWebGLFingerprint,
  getAudioFingerprint,
  getFontFingerprint,
  getFeatureFingerprint,
};

/**
 * Export utility functions
 */
export const utils = {
  createStableHash,
  encodeFingerprint,
};

/**
 * Export types
 */
export { FingerprintOptions, FingerprintResult } from "./types";
