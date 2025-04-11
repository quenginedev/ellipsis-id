/**
 * Utility functions for encoding data
 */

/**
 * Encode data to base64
 *
 * @param data - Data to encode
 * @returns Base64 encoded string
 */
export function encodeBase64(data: string): string {
  try {
    return btoa(data);
  } catch (error) {
    // Handle non-ASCII characters
    return btoa(
      encodeURIComponent(data).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );
  }
}

/**
 * Decode base64 data
 *
 * @param data - Base64 encoded string
 * @returns Decoded string
 */
export function decodeBase64(data: string): string {
  try {
    return atob(data);
  } catch (error) {
    // Handle non-ASCII characters
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(data), (c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
  }
}

/**
 * Encode fingerprint data to a compact format
 *
 * @param data - Fingerprint data to encode
 * @returns Encoded fingerprint string
 */
export function encodeFingerprint(data: string | Record<string, any>): string {
  try {
    const jsonString = typeof data === "string" ? data : JSON.stringify(data);
    return encodeBase64(jsonString);
  } catch (error) {
    console.error("Error encoding fingerprint:", error);
    return "";
  }
}

/**
 * Decode fingerprint data from encoded format
 *
 * @param encodedData - Encoded fingerprint string
 * @returns Decoded fingerprint data
 */
export function decodeFingerprint(
  encodedData: string
): Record<string, any> | null {
  try {
    const jsonString = decodeBase64(encodedData);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error decoding fingerprint:", error);
    return null;
  }
}
