import { getCanvasFingerprint } from "./canvas";
import { createCanvas, get2DContext } from "../utils/browser-compat";

// Mock browser-compat module
jest.mock("../utils/browser-compat");

// Mock hash function
jest.mock("../utils/hash", () => ({
  hashData: jest.fn((data) => `hashed_${data}`),
}));

describe("Canvas Fingerprinting", () => {
  let mockCanvas: any;
  let mockContext: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock canvas
    mockCanvas = {
      width: 0,
      height: 0,
      toDataURL: jest.fn(() => "mock_data_url"),
    };

    // Create mock 2D context
    mockContext = {
      fillStyle: "",
      font: "",
      textBaseline: "",
      fillText: jest.fn(),
      fillRect: jest.fn(),
      createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn(),
      })),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      strokeStyle: "",
      lineWidth: 0,
      moveTo: jest.fn(),
      bezierCurveTo: jest.fn(),
      stroke: jest.fn(),
    };

    // Mock createCanvas and get2DContext functions
    (createCanvas as jest.Mock).mockReturnValue(mockCanvas);
    (get2DContext as jest.Mock).mockReturnValue(mockContext);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should generate canvas fingerprint successfully", async () => {
    const result = await getCanvasFingerprint();

    // Verify the result structure
    expect(result).toHaveProperty("raw");
    expect(result).toHaveProperty("hash");

    // Verify canvas was created with correct dimensions
    expect(mockCanvas.width).toBe(280);
    expect(mockCanvas.height).toBe(200);

    // Verify context operations were called
    expect(mockContext.fillRect).toHaveBeenCalled();
    expect(mockContext.fillText).toHaveBeenCalled();
    expect(mockContext.createLinearGradient).toHaveBeenCalled();
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.arc).toHaveBeenCalled();
    expect(mockContext.bezierCurveTo).toHaveBeenCalled();

    // Verify data URL was generated
    expect(mockCanvas.toDataURL).toHaveBeenCalled();
    expect(result.raw).toBe("mock_data_url");

    // Verify hash generation
    expect(result.hash).toBe("hashed_mock_data_url");
  });

  it("should handle unsupported canvas", async () => {
    // Mock canvas creation failure
    (createCanvas as jest.Mock).mockReturnValue(null);

    const result = await getCanvasFingerprint();

    expect(result.raw).toBe("Canvas not supported");
    expect(result.hash).toBe("hashed_Canvas not supported");
  });

  it("should handle context creation failure", async () => {
    // Mock context creation failure
    (get2DContext as jest.Mock).mockReturnValue(null);

    const result = await getCanvasFingerprint();

    expect(result.raw).toBe("Canvas 2D context not supported");
    expect(result.hash).toBe("hashed_Canvas 2D context not supported");
  });

  it("should handle toDataURL error", async () => {
    // Mock toDataURL failure
    mockCanvas.toDataURL.mockImplementation(() => {
      throw new Error("toDataURL error");
    });

    const result = await getCanvasFingerprint();

    expect(result.raw).toBe("Error generating canvas data URL");
    expect(result.hash).toBe("hashed_Error generating canvas data URL");
  });
});
