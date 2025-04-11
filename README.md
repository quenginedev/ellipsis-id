# ellipsis-id

[![npm version](https://img.shields.io/npm/v/ellipsis-id.svg)](https://www.npmjs.com/package/ellipsis-id)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A library for generating stable browser fingerprints without requiring external network requests.

## Introduction

EllipsisID is a fingerprinting library that combines multiple browser attributes to create a reliable identifier that remains consistent across page refreshes, while being difficult for malicious users to spoof.

### Key Features

- Generate stable fingerprints based on browser characteristics
- Provide both synchronous and asynchronous API options
- Allow customization of which fingerprinting methods to use
- Include optional public IP integration (but don't require it)
- Produce deterministic hashes that remain consistent for the same device
- Lightweight with minimal dependencies

### When to Use

- **Anti-fraud protection**: Identify suspicious users without relying on cookies
- **Rate limiting**: Prevent abuse by tracking users across sessions
- **User recognition**: Remember returning users without requiring login
- **Bot detection**: Distinguish between human users and automated scripts

### When Not to Use

- When user privacy is a primary concern
- When legal regulations (like GDPR) restrict fingerprinting
- When you need 100% accuracy in user identification

## Installation

```bash
npm install ellipsis-id
# or
yarn add ellipsis-id
```

## Quick Start

### Basic Usage

```typescript
import { generateFingerprint } from "ellipsis-id";

// Async usage
async function identifyBrowser() {
  try {
    const fingerprint = await generateFingerprint();
    console.log("Browser fingerprint:", fingerprint);
    // Send to your server for verification
    await fetch("https://your-api.com/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fingerprint }),
    });
  } catch (error) {
    console.error("Fingerprinting failed:", error);
  }
}

identifyBrowser();
```

### Common Configuration Options

```typescript
import { generateFingerprint } from "ellipsis-id";

// With options
const fingerprint = await generateFingerprint({
  methods: ["basic", "canvas", "webgl"], // Only use these methods
  hashAlgorithm: "sha-256", // Use SHA-256 for hashing
  includePublicIp: false, // Don't include public IP
  timeout: 3000, // Timeout after 3 seconds
});
```

## Advanced Usage

### Detailed API Documentation

#### Main Functions

- `generateFingerprint(options?)`: Returns a promise that resolves to a fingerprint hash string
- `generateDetailedFingerprint(options?)`: Returns a promise that resolves to a detailed fingerprint result object

#### Configuration Options

```typescript
import { generateFingerprint, FingerprintOptions } from "ellipsis-id";

const options: FingerprintOptions = {
  // Only use these fingerprinting methods
  methods: ["basic", "canvas", "webgl"],

  // Use SHA-256 for hashing
  hashAlgorithm: "sha-256",

  // Don't include public IP by default
  includePublicIp: false,

  // Custom public IP provider (if needed)
  publicIpProvider: async () => {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  },

  // Timeout after 5 seconds
  timeout: 5000,

  // Prioritize stability over comprehensiveness
  stabilityMode: "high",
};

// Generate fingerprint with custom options
generateFingerprint(options)
  .then((fingerprint) => console.log("Custom fingerprint:", fingerprint))
  .catch((error) => console.error("Error:", error));
```

### Component-Level Access

```typescript
import { components, utils } from "ellipsis-id";

async function getGraphicsFingerprint() {
  // Get individual components
  const canvasData = await components.getCanvasFingerprint();
  const webglData = await components.getWebGLFingerprint();

  // Combine and hash them
  return utils.createStableHash(
    {
      canvas: canvasData.hash,
      webgl: webglData.hash,
    },
    "sha-256"
  );
}

getGraphicsFingerprint().then((fingerprint) => {
  console.log("Graphics fingerprint:", fingerprint);
});
```

### Integration with User Blocking System

```typescript
import { generateFingerprint } from "ellipsis-id";

class AbuseProtection {
  private blockedFingerprints: Set<string> = new Set();
  private blockedIps: Set<string> = new Set();

  async checkAccess(): Promise<boolean> {
    // Get current IP (in a real app, this would come from your server)
    const ipResponse = await fetch("https://api.ipify.org?format=json");
    const { ip } = await ipResponse.json();

    // Check if IP is blocked
    if (this.blockedIps.has(ip)) {
      console.log("Access denied: IP is blocked");
      return false;
    }

    // Get browser fingerprint
    const fingerprint = await generateFingerprint();

    // Check if fingerprint is blocked
    if (this.blockedFingerprints.has(fingerprint)) {
      console.log("Access denied: Browser fingerprint is blocked");
      return false;
    }

    console.log("Access granted");
    return true;
  }

  blockCurrentUser(): void {
    generateFingerprint().then((fingerprint) => {
      this.blockedFingerprints.add(fingerprint);
      console.log("User blocked successfully");
    });
  }
}

// Usage
const protection = new AbuseProtection();
protection.checkAccess().then((hasAccess) => {
  if (hasAccess) {
    // Allow the user to continue
  } else {
    // Show blocked message
  }
});
```

## Example Use Cases

### Anti-Fraud Protection

ellipsis-id can be used to identify and block suspicious users by generating a consistent fingerprint that persists even when cookies are cleared or private browsing is used.

### Rate Limiting

Implement effective rate limiting by tracking users based on their browser fingerprint rather than IP address, which can be shared or changed.

### User Recognition Without Cookies

Remember returning users and their preferences without requiring cookies or local storage, improving the user experience while respecting privacy choices.

## Performance Considerations

### Benchmarks

- Basic fingerprinting: ~5ms
- Full fingerprinting (all methods): ~100-300ms depending on the browser and device

### Optimization Tips

- Only use the fingerprinting methods you need
- Consider using the `stabilityMode` option to balance accuracy and performance
- Cache fingerprints on the client side to avoid recalculating on every page load

## Security and Privacy

### Ethical Usage Guidelines

- Always inform users that you are using fingerprinting technology
- Provide clear opt-out mechanisms when possible
- Use fingerprinting for legitimate security purposes, not for tracking users across sites

### Data Handling Recommendations

- Store fingerprints securely, preferably hashed with a salt
- Don't combine fingerprints with personally identifiable information
- Implement data retention policies to delete fingerprints after they're no longer needed

### Transparency Best Practices

- Include information about fingerprinting in your privacy policy
- Consider implementing a user-facing dashboard showing what data is collected
- Allow users to request deletion of their fingerprint data

## Browser Compatibility

### Support Table

| Browser            | Support |
| ------------------ | ------- |
| Chrome 60+         | Full    |
| Firefox 55+        | Full    |
| Safari 11+         | Full    |
| Edge 16+           | Full    |
| IE 11              | Partial |
| Chrome for Android | Full    |
| Safari iOS 11+     | Full    |

### Known Issues

- Some fingerprinting methods may be less reliable in private browsing modes
- Canvas and WebGL fingerprinting may be blocked by privacy-focused browser extensions
- Font detection may be less accurate on mobile devices

## Contributing

### Development Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Build the project with `npm run build`
4. Run tests with `npm test`

### Pull Request Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## License

This project is licensed under the MIT License - see the LICENSE file for details.
