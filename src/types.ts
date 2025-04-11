/**
 * Configuration options for fingerprint generation
 */
export interface FingerprintOptions {
  /**
   * Fingerprinting methods to use
   * @default ['basic', 'canvas', 'webgl', 'audio', 'fonts', 'features']
   */
  methods?: Array<
    "basic" | "canvas" | "webgl" | "audio" | "fonts" | "features"
  >;

  /**
   * Hash algorithm to use for fingerprint generation
   * @default 'sha-256'
   */
  hashAlgorithm?: "md5" | "sha-1" | "sha-256" | "sha-512";

  /**
   * Whether to include public IP in the fingerprint
   * @default false
   */
  includePublicIp?: boolean;

  /**
   * Custom function to get public IP
   */
  publicIpProvider?: () => Promise<string>;

  /**
   * Timeout for fingerprint generation in milliseconds
   * @default 5000
   */
  timeout?: number;

  /**
   * Stability mode for fingerprint generation
   * @default 'balanced'
   */
  stabilityMode?: "high" | "balanced" | "comprehensive";
}

/**
 * Result of a fingerprinting operation
 */
export interface FingerprintResult {
  /**
   * The generated fingerprint hash
   */
  hash: string;

  /**
   * Components used to generate the fingerprint
   */
  components: {
    [key: string]: any;
  };

  /**
   * Timestamp when the fingerprint was generated
   */
  createdAt: number;
}

/**
 * Component fingerprint data
 */
export interface ComponentData {
  /**
   * Raw data collected from the component
   */
  raw: any;

  /**
   * Hash of the component data
   */
  hash: string;
}
