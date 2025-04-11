import { TIMEOUTS } from "../config";
import { createAudioContext } from "../utils/browser-compat";
import {
  calculateKurtosis,
  calculateMean,
  calculateSkewness,
  calculateVariance,
  getAudioFingerprint,
} from "./audio";

// Mock browser-compat module
jest.mock("../utils/browser-compat");

// Mock hash function
jest.mock("../utils/hash", () => ({
  hashData: jest.fn((data) => `hashed_${data}`),
}));

describe("Audio Fingerprinting", () => {
  let mockAudioContext: any;
  let mockOscillator: any;
  let mockAnalyser: any;
  let mockGain: any;
  let mockScriptProcessor: any;
  let mockDestination: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock audio nodes
    mockOscillator = {
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      disconnect: jest.fn(),
      frequency: { value: 0 },
      type: "",
    };

    mockAnalyser = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      fftSize: 0,
      frequencyBinCount: 128,
      getByteFrequencyData: jest.fn((array) => {
        // Fill with consistent test data that will produce predictable statistical results
        for (let i = 0; i < array.length; i++) {
          array[i] = 128; // Use middle value for consistent results
        }
      }),
    };

    mockGain = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      gain: { value: 1 },
    };

    mockScriptProcessor = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      onaudioprocess: null,
    };

    mockDestination = {};

    mockAudioContext = {
      createOscillator: jest.fn(() => mockOscillator),
      createAnalyser: jest.fn(() => mockAnalyser),
      createGain: jest.fn(() => mockGain),
      createScriptProcessor: jest.fn(() => mockScriptProcessor),
      destination: mockDestination,
      state: "running",
      close: jest.fn(),
    };

    (createAudioContext as jest.Mock).mockReturnValue(mockAudioContext);
  });

  it("should handle AudioContext not supported", async () => {
    (createAudioContext as jest.Mock).mockReturnValue(null);

    const result = await getAudioFingerprint();
    expect(result).toEqual({
      raw: "AudioContext not supported",
      hash: "hashed_AudioContext not supported",
    });
  });

  it("should handle timeout", async () => {
    jest.useFakeTimers();
    const fingerprintPromise = getAudioFingerprint();

    // Advance timers to trigger timeout
    jest.advanceTimersByTime(TIMEOUTS.audio + 100);

    const result = await fingerprintPromise;
    expect(result).toEqual({
      raw: "Audio fingerprinting timed out",
      hash: "hashed_Audio fingerprinting timed out",
    });

    jest.useRealTimers();
  });

  it("should generate audio fingerprint successfully", async () => {
    // Create a promise that resolves when audio processing is complete
    const fingerprintPromise = getAudioFingerprint();

    // Wait for the script processor to be set up
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Simulate audio processing
    const event = {
      inputBuffer: {
        getChannelData: () => new Float32Array(4096).fill(0.5),
      },
      outputBuffer: {
        getChannelData: () => new Float32Array(4096),
      },
    };

    // Trigger audio processing multiple times to accumulate enough data
    if (mockScriptProcessor.onaudioprocess) {
      // We need more than 200 data points, and each processing adds 8 points (128/16)
      // So we need at least 26 iterations to get over 200 points
      for (let i = 0; i < 26; i++) {
        mockScriptProcessor.onaudioprocess(event);
      }
    }

    const result = await fingerprintPromise;

    // Verify the result structure
    expect(result).toHaveProperty("raw");
    expect(result).toHaveProperty("hash");
    expect(result.raw).toHaveProperty("mean");
    expect(result.raw).toHaveProperty("variance");
    expect(result.raw).toHaveProperty("skewness");
    expect(result.raw).toHaveProperty("kurtosis");
    expect(result.raw).toHaveProperty("audioData");

    // Verify audio context setup
    expect(mockOscillator.type).toBe("triangle");
    expect(mockOscillator.frequency.value).toBe(10000);
    expect(mockAnalyser.fftSize).toBe(2048);
    expect(mockGain.gain.value).toBe(0);

    // Verify cleanup
    expect(mockOscillator.stop).toHaveBeenCalled();
    expect(mockOscillator.disconnect).toHaveBeenCalled();
    expect(mockAnalyser.disconnect).toHaveBeenCalled();
    expect(mockScriptProcessor.disconnect).toHaveBeenCalled();
    expect(mockGain.disconnect).toHaveBeenCalled();
    expect(mockAudioContext.close).toHaveBeenCalled();
  });

  it("should handle errors gracefully", async () => {
    mockOscillator.start.mockImplementation(() => {
      throw new Error("Test error");
    });

    const result = await getAudioFingerprint();
    expect(result).toEqual({
      raw: "Audio fingerprinting error: Error: Test error",
      hash: "hashed_Audio fingerprinting error: Error: Test error",
    });
  });
});

// Test statistical helper functions
describe("Statistical Helper Functions", () => {
  const testData = [1, 2, 3, 4, 5];

  describe("calculateMean", () => {
    it("should calculate mean correctly", () => {
      expect(calculateMean(testData)).toBe(3);
    });

    it("should return 0 for empty array", () => {
      expect(calculateMean([])).toBe(0);
    });
  });

  describe("calculateVariance", () => {
    it("should calculate variance correctly", () => {
      expect(calculateVariance(testData)).toBe(2);
    });

    it("should return 0 for empty array", () => {
      expect(calculateVariance([])).toBe(0);
    });
  });

  describe("calculateSkewness", () => {
    it("should calculate skewness correctly", () => {
      expect(calculateSkewness(testData)).toBeCloseTo(0, 5);
    });

    it("should return 0 for empty array", () => {
      expect(calculateSkewness([])).toBe(0);
    });

    it("should return 0 when variance is 0", () => {
      expect(calculateSkewness([1, 1, 1])).toBe(0);
    });
  });

  describe("calculateKurtosis", () => {
    it("should calculate kurtosis correctly", () => {
      expect(calculateKurtosis(testData)).toBeCloseTo(1.7, 1);
    });

    it("should return 0 for empty array", () => {
      expect(calculateKurtosis([])).toBe(0);
    });

    it("should return 0 when variance is 0", () => {
      expect(calculateKurtosis([1, 1, 1])).toBe(0);
    });
  });
});
