import { getBasicFingerprint } from "./basic";
import { getNavigator, getScreen } from "../utils/browser-compat";

// Mock browser-compat module
jest.mock("../utils/browser-compat");

// Mock hash function
jest.mock("../utils/hash", () => ({
  hashData: jest.fn((data) => `hashed_${data}`),
}));

describe("Basic Fingerprinting", () => {
  let mockNavigator: any;
  let mockScreen: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock navigator
    mockNavigator = {
      userAgent: "Mozilla/5.0 Test",
      language: "en-US",
      languages: ["en-US", "en"],
      platform: "MacIntel",
      vendor: "Test Vendor",
      cpuClass: "x86",
      oscpu: "Intel Mac OS X",
      hardwareConcurrency: 8,
      deviceMemory: 8,
      doNotTrack: "1",
      cookieEnabled: true,
      appName: "Netscape",
      appCodeName: "Mozilla",
      appVersion: "5.0",
      pdfViewerEnabled: true,
      maxTouchPoints: 5,
      productSub: "20030107",
      buildID: "20181001",
    };

    // Create mock screen
    mockScreen = {
      width: 1920,
      height: 1080,
      colorDepth: 24,
      pixelDepth: 24,
      availWidth: 1920,
      availHeight: 1030,
    };

    // Mock getNavigator and getScreen functions
    (getNavigator as jest.Mock).mockReturnValue(mockNavigator);
    (getScreen as jest.Mock).mockReturnValue(mockScreen);

    // Mock Date.prototype.getTimezoneOffset
    const mockDate = new Date(2023, 0, 1);
    jest.spyOn(global, "Date").mockImplementation(() => mockDate);
    jest.spyOn(mockDate, "getTimezoneOffset").mockReturnValue(-120);

    // Mock Intl.DateTimeFormat().resolvedOptions().timeZone
    const mockResolvedOptions = { timeZone: "Europe/London" };
    const mockDateTimeFormat = jest.fn(() => ({
      resolvedOptions: () => mockResolvedOptions,
    }));
    global.Intl = { DateTimeFormat: mockDateTimeFormat } as any;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should collect all browser information successfully", async () => {
    const result = await getBasicFingerprint();

    // Verify the result structure
    expect(result).toHaveProperty("raw");
    expect(result).toHaveProperty("hash");

    // Verify all collected data
    expect(result.raw).toEqual({
      userAgent: "Mozilla/5.0 Test",
      language: "en-US",
      languages: ["en-US", "en"],
      platform: "MacIntel",
      vendor: "Test Vendor",
      cpuClass: "x86",
      oscpu: "Intel Mac OS X",
      hardwareConcurrency: 8,
      deviceMemory: 8,
      timezone: -120,
      timezoneString: "Europe/London",
      screenWidth: 1920,
      screenHeight: 1080,
      screenColorDepth: 24,
      screenPixelDepth: 24,
      screenAvailWidth: 1920,
      screenAvailHeight: 1030,
      doNotTrack: "1",
      cookieEnabled: true,
      appName: "Netscape",
      appCodeName: "Mozilla",
      appVersion: "5.0",
      pdfViewerEnabled: true,
      maxTouchPoints: 5,
      productSub: "20030107",
      buildID: "20181001",
    });

    // Verify hash generation
    expect(result.hash).toBe(`hashed_${JSON.stringify(result.raw)}`);
  });

  it("should handle missing navigator properties", async () => {
    // Mock navigator with minimal properties
    (getNavigator as jest.Mock).mockReturnValue({});

    const result = await getBasicFingerprint();

    // Verify fallback values
    expect(result.raw).toMatchObject({
      userAgent: "",
      language: "",
      languages: [""],
      platform: "",
      vendor: "",
      cpuClass: "",
      oscpu: "",
      hardwareConcurrency: 0,
      deviceMemory: 0,
      doNotTrack: "",
      cookieEnabled: undefined,
      appName: "",
      appCodeName: "",
      appVersion: "",
      pdfViewerEnabled: false,
      maxTouchPoints: 0,
      productSub: "",
      buildID: "",
    });
  });

  it("should handle missing screen properties", async () => {
    // Mock screen with minimal properties
    (getScreen as jest.Mock).mockReturnValue({});

    const result = await getBasicFingerprint();

    // Verify fallback values
    expect(result.raw).toMatchObject({
      screenWidth: 0,
      screenHeight: 0,
      screenColorDepth: 0,
      screenPixelDepth: 0,
      screenAvailWidth: 0,
      screenAvailHeight: 0,
    });
  });

  it("should handle errors in getNavigator", async () => {
    (getNavigator as jest.Mock).mockImplementation(() => {
      throw new Error("Navigator error");
    });

    const result = await getBasicFingerprint();

    // Verify fallback to empty object
    expect(result.raw.userAgent).toBe("");
    expect(result.raw.language).toBe("");
  });

  it("should handle errors in getScreen", async () => {
    (getScreen as jest.Mock).mockImplementation(() => {
      throw new Error("Screen error");
    });

    const result = await getBasicFingerprint();

    // Verify fallback to empty object
    expect(result.raw.screenWidth).toBe(0);
    expect(result.raw.screenHeight).toBe(0);
  });
});
