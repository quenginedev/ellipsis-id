/**
 * Font detection fingerprinting implementation
 */
import { ComponentData } from "../types";
import { hashData } from "../utils/hash";
import { COMMON_FONTS, TIMEOUTS } from "../config";

/**
 * Font detection methods
 */
enum FontDetectionMethod {
  SPAN = "span",
  CANVAS = "canvas",
}

/**
 * Get available fonts on the system
 *
 * @returns Font fingerprint component data
 */
export async function getFontFingerprint(): Promise<ComponentData> {
  return new Promise((resolve) => {
    // Set timeout to ensure the function doesn't hang
    const timeoutId = setTimeout(() => {
      resolve({
        raw: "Font detection timed out",
        hash: hashData("Font detection timed out"),
      });
    }, TIMEOUTS.font);

    try {
      // Try to detect fonts using span method first, then canvas method as fallback
      detectFonts(FontDetectionMethod.SPAN)
        .then((detectedFonts) => {
          clearTimeout(timeoutId);

          // Sort fonts for consistent ordering
          const sortedFonts = detectedFonts.sort();

          // Hash the detected fonts
          const hash = hashData(sortedFonts.join(","));

          resolve({
            raw: sortedFonts,
            hash,
          });
        })
        .catch(() => {
          // Try canvas method as fallback
          detectFonts(FontDetectionMethod.CANVAS)
            .then((detectedFonts) => {
              clearTimeout(timeoutId);

              // Sort fonts for consistent ordering
              const sortedFonts = detectedFonts.sort();

              // Hash the detected fonts
              const hash = hashData(sortedFonts.join(","));

              resolve({
                raw: sortedFonts,
                hash,
              });
            })
            .catch((error) => {
              clearTimeout(timeoutId);
              resolve({
                raw: `Font detection error: ${error}`,
                hash: hashData(`Font detection error: ${error}`),
              });
            });
        });
    } catch (error) {
      clearTimeout(timeoutId);
      resolve({
        raw: `Font detection error: ${error}`,
        hash: hashData(`Font detection error: ${error}`),
      });
    }
  });
}

/**
 * Detect available fonts using specified method
 *
 * @param method - Font detection method to use
 * @returns Promise resolving to array of available fonts
 */
async function detectFonts(method: FontDetectionMethod): Promise<string[]> {
  return new Promise((resolve, reject) => {
    try {
      if (method === FontDetectionMethod.SPAN) {
        detectFontsUsingSpan().then(resolve).catch(reject);
      } else if (method === FontDetectionMethod.CANVAS) {
        detectFontsUsingCanvas().then(resolve).catch(reject);
      } else {
        reject(new Error("Invalid font detection method"));
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Detect fonts using span elements
 *
 * @returns Promise resolving to array of available fonts
 */
async function detectFontsUsingSpan(): Promise<string[]> {
  return new Promise((resolve) => {
    // Create container for font detection
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.visibility = "hidden";
    document.body.appendChild(container);

    // Create reference span with monospace font
    const referenceFont = "monospace";
    const referenceSpan = document.createElement("span");
    referenceSpan.style.fontFamily = referenceFont;
    referenceSpan.style.fontSize = "72px";
    referenceSpan.textContent = "mmmmmmmmmmlli";
    container.appendChild(referenceSpan);

    // Get width of reference span
    const referenceWidth = referenceSpan.offsetWidth;
    const referenceHeight = referenceSpan.offsetHeight;

    // Check each font
    const detectedFonts: string[] = [];

    // Create promises for each font check
    const fontPromises = COMMON_FONTS.map((font) => {
      return new Promise<void>((resolveFontCheck) => {
        // Create test span with the font to check
        const testSpan = document.createElement("span");
        testSpan.style.fontFamily = `'${font}', ${referenceFont}`;
        testSpan.style.fontSize = "72px";
        testSpan.textContent = "mmmmmmmmmmlli";
        container.appendChild(testSpan);

        // Wait for font to load
        setTimeout(() => {
          // Check if width differs from reference
          const testWidth = testSpan.offsetWidth;
          const testHeight = testSpan.offsetHeight;

          if (testWidth !== referenceWidth || testHeight !== referenceHeight) {
            detectedFonts.push(font);
          }

          // Remove test span
          container.removeChild(testSpan);
          resolveFontCheck();
        }, 20);
      });
    });

    // Wait for all font checks to complete
    Promise.all(fontPromises).then(() => {
      // Clean up
      document.body.removeChild(container);
      resolve(detectedFonts);
    });
  });
}

/**
 * Detect fonts using canvas text measurement
 *
 * @returns Promise resolving to array of available fonts
 */
async function detectFontsUsingCanvas(): Promise<string[]> {
  return new Promise((resolve) => {
    // Create canvas
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      return resolve([]);
    }

    // Set canvas size
    canvas.width = 500;
    canvas.height = 50;

    // Text to measure
    const text = "abcdefghijklmnopqrstuvwxyz";

    // Configure canvas
    context.font = "20px monospace";
    context.textBaseline = "top";
    context.fillText(text, 0, 0);

    // Get image data of reference text
    const referenceImageData = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    ).data;

    // Check each font
    const detectedFonts: string[] = [];

    // Create promises for each font check
    const fontPromises = COMMON_FONTS.map((font) => {
      return new Promise<void>((resolveFontCheck) => {
        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Set font and draw text
        context.font = `20px '${font}', monospace`;
        context.fillText(text, 0, 0);

        // Get image data
        const testImageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        ).data;

        // Compare with reference
        let different = false;
        for (let i = 0; i < testImageData.length; i += 4) {
          // Check only alpha channel for performance
          if (testImageData[i + 3] !== referenceImageData[i + 3]) {
            different = true;
            break;
          }
        }

        if (different) {
          detectedFonts.push(font);
        }

        resolveFontCheck();
      });
    });

    // Wait for all font checks to complete
    Promise.all(fontPromises).then(() => {
      resolve(detectedFonts);
    });
  });
}
